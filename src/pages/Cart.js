import React, { useState, useEffect } from 'react';
import { auth, db, doc, getDoc, setDoc, onSnapshot } from '../client/firebaseConfig';
import { ShoppingCart, Trash2, Minus, Plus, X, Shield } from 'lucide-react';
import client from '../client/ShopifyClient';
import { gql } from '@apollo/client';
import { useCart } from '../hooks/useCart';

// Mutações GraphQL (mantendo a lógica original)
const ADD_ITEMS_TO_CART = gql`
  mutation ($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        checkoutUrl
      }
    }
  }
`;

const UPDATE_CART_LINE = gql`
  mutation ($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
      }
    }
  }
`;

const updateQuantityInShopify = async (item, newQuantity) => {
  try {
    const cartId = localStorage.getItem('shopifyCartId');
    if (!cartId || !item.lineId) return;

    const { data } = await client.mutate({
      mutation: UPDATE_CART_LINE,
      variables: {
        cartId,
        lines: [
          {
            id: item.lineId,
            quantity: newQuantity,
          },
        ],
      },
    });

    console.log("Quantidade atualizada no Shopify:", data.cartLinesUpdate);
  } catch (error) {
    console.error("Erro ao atualizar quantidade no Shopify:", error);
    alert("Falha ao atualizar quantidade. Tente novamente.");
  }
};

const CartModal = () => {
  const { isCartOpen, closeCart } = useCart();
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listener personalizado para mudanças no localStorage (para usuários convidados)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'guestCart') {
        const updatedCart = JSON.parse(event.newValue || '[]');
        setCart(updatedCart);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listener customizado para mudanças no localStorage da mesma aba
  useEffect(() => {
    const checkGuestCartChanges = () => {
      if (!user) {
        const currentGuestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        setCart(currentGuestCart);
      }
    };

    // Verificar mudanças a cada 500ms quando não há usuário logado
    let interval;
    if (!user) {
      interval = setInterval(checkGuestCartChanges, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  // Lógica de autenticação e carregamento do carrinho com listeners em tempo real
  useEffect(() => {
    let unsubscribeAuth;
    let unsubscribeFirestore;

    const setupAuthListener = async () => {
      unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Configurar listener do Firestore para tempo real
          const docRef = doc(db, 'carts', firebaseUser.uid);
          
          unsubscribeFirestore = onSnapshot(
            docRef,
            (docSnap) => {
              const cartData = docSnap.exists() ? docSnap.data().items : [];
              setCart(cartData);
              setLoading(false);
            },
            (error) => {
              console.error("Erro ao escutar mudanças no carrinho:", error);
              setLoading(false);
            }
          );
        } else {
          // Limpar listener do Firestore se existir
          if (unsubscribeFirestore) {
            unsubscribeFirestore();
            unsubscribeFirestore = null;
          }
          
          setUser(null);
          const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
          setCart(guestCart);
          setLoading(false);
        }
      });
    };

    setupAuthListener();

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  const syncRemoveWithShopify = async (item) => {
    try {
      const cartId = localStorage.getItem('shopifyCartId');
      if (!cartId) return;

      const { data } = await client.query({
        query: gql`
          query ($cartId: ID!) {
            cart(id: $cartId) {
              id
              lines(first: 10) {
                edges {
                  node {
                    id
                    quantity
                    merchandise {
                      ... on ProductVariant {
                        id
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: { cartId },
      });

      const lineToRemove = data.cart.lines.edges.find(
        ({ node }) => node.merchandise?.id === item.id
      );

      if (lineToRemove) {
        const { data } = await client.mutate({
          mutation: gql`
            mutation ($cartId: ID!, $lineIds: [ID!]!) {
              cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
                cart {
                  id
                }
              }
            }
          `,
          variables: {
            cartId,
            lineIds: [lineToRemove.node.id],
          },
        });

        console.log("Item removido do Shopify:", data.cartLinesRemove.cart);
      } else {
        console.warn("Linha não encontrada no Shopify para o item:", item.id);
      }
    } catch (error) {
      console.error("Erro ao sincronizar remoção com Shopify:", error);
      alert("Falha ao atualizar o carrinho do Shopify. Tente novamente.");
    }
  };

  const removeItem = async (item) => {
    const updatedCart = cart.filter((cartItem) => cartItem.id !== item.id);

    const currentUser = auth.currentUser;
    if (currentUser) {
      // Para usuários logados, o onSnapshot vai atualizar automaticamente
      await setDoc(doc(db, 'carts', currentUser.uid), { items: updatedCart }, { merge: true });
    } else {
      // Para usuários convidados, atualizar localStorage e estado local
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
      setCart(updatedCart);
      
      // Disparar evento customizado para outras abas/componentes
      window.dispatchEvent(new CustomEvent('guestCartUpdated', { 
        detail: { cart: updatedCart } 
      }));
    }

    await syncRemoveWithShopify(item);
  };

  const createNewCartAndCheckout = async () => {
    try {
      const { data } = await client.mutate({
        mutation: gql`
          mutation {
            cartCreate(input: {}) {
              cart {
                id
                checkoutUrl
              }
            }
          }
        `,
      });

      const cartId = data.cartCreate.cart.id;
      localStorage.setItem('shopifyCartId', cartId);

      const lines = cart.map(item => ({
        merchandiseId: item.id,
        quantity: item.quantity,
      }));

      const response = await client.mutate({
        mutation: ADD_ITEMS_TO_CART,
        variables: {
          cartId,
          lines,
        },
      });

      window.location.href = response.data.cartLinesAdd.cart.checkoutUrl;
    } catch (error) {
      console.error("Erro ao criar novo carrinho para checkout:", error);
      alert("Erro ao finalizar compra.");
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Seu carrinho está vazio.");
      return;
    }
    await createNewCartAndCheckout();
  };

  const updateQuantity = async (item, newQuantity) => {
    const updatedCart = cart.map(cartItem =>
      cartItem.id === item.id ? { ...cartItem, quantity: newQuantity } : cartItem
    );

    const currentUser = auth.currentUser;
    if (currentUser) {
      // Para usuários logados, o onSnapshot vai atualizar automaticamente
      await setDoc(doc(db, 'carts', currentUser.uid), { items: updatedCart }, { merge: true });
    } else {
      // Para usuários convidados, atualizar localStorage e estado local
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
      setCart(updatedCart);
      
      // Disparar evento customizado para outras abas/componentes
      window.dispatchEvent(new CustomEvent('guestCartUpdated', { 
        detail: { cart: updatedCart } 
      }));
    }

    await updateQuantityInShopify(item, newQuantity);
  };

  // Listener para evento customizado de atualização do carrinho de convidado
  useEffect(() => {
    const handleGuestCartUpdate = (event) => {
      if (!user) {
        setCart(event.detail.cart);
      }
    };

    window.addEventListener('guestCartUpdated', handleGuestCartUpdate);
    return () => window.removeEventListener('guestCartUpdated', handleGuestCartUpdate);
  }, [user]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop com blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeCart}
      />
      
      {/* Cart Panel */}
      <div className="relative ml-auto h-screen w-full max-w-md bg-[#1C1C1C] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#8A0101]/20 flex-shrink-0">
          <h2 className="text-xl font-bold text-[#F3ECE7] tracking-wide">
            CART {cart.length > 0 && `(${cart.reduce((sum, item) => sum + item.quantity, 0)})`}
          </h2>
          <button
            onClick={closeCart}
            className="p-2 text-[#F3ECE7] hover:text-[#8A0101] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8A0101]"></div>
            <div className="text-[#F3ECE7] ml-3">Loading...</div>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 px-6">
            <ShoppingCart size={48} className="text-[#4B014E] mb-4" />
            <p className="text-[#F3ECE7]/70 text-center mb-6">Your cart is empty</p>
            <button
              onClick={closeCart}
              className="px-6 py-2 bg-[#8A0101] text-[#F3ECE7] hover:bg-[#8A0101]/80 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-[#F3ECE7]/5 p-4 border border-[#4B014E]/20 transition-all duration-200">
                  <div className="flex gap-4">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 object-cover bg-[#4B014E]/10"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[#F3ECE7] font-medium text-sm truncate">
                        {item.name}
                      </h3>
                      <p className="text-[#F3ECE7]/70 text-sm">M</p>
                      <p className="text-[#F3ECE7] font-bold text-sm">
                        $ {item.price.toFixed(2)}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item, Math.max(1, item.quantity - 1))}
                          className="w-6 h-6 bg-[#4B014E]/20 text-[#F3ECE7] flex items-center justify-center hover:bg-[#4B014E]/40 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-[#F3ECE7] text-sm min-w-[20px] text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item, item.quantity + 1)}
                          className="w-6 h-6 bg-[#4B014E]/20 text-[#F3ECE7] flex items-center justify-center hover:bg-[#4B014E]/40 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item)}
                      className="text-[#8A0101] hover:text-[#8A0101]/70 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-[#8A0101]/20 flex-shrink-0">
              {/* Totals */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-[#F3ECE7] text-sm">
                  <span>SUBTOTAL</span>
                  <span className="font-medium">$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="text-xs text-[#F3ECE7]/70">
                  Shipping & taxes calculated at checkout
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-[#F3ECE7] text-[#1C1C1C] py-3 font-bold hover:bg-[#F3ECE7]/90 transition-colors"
              >
                CHECK OUT
              </button>

              {/* Payment Icons */}
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-[#F3ECE7]/50">
                <Shield size={12} />
                <span>Secure payments</span>
                <span>•</span>
                <span>Fast delivery</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal;