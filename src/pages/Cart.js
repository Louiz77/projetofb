import React, { useState, useEffect } from 'react';
import { auth, db, doc, getDoc, setDoc } from '../client/firebaseConfig';
import { ShoppingCart, Trash2 } from 'lucide-react';
import client from '../client/ShopifyClient';
import { gql } from '@apollo/client';

// Mutação para adicionar múltiplos itens ao carrinho do Shopify
const ADD_ITEMS_TO_CART = gql`
  mutation ($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        checkoutUrl
      }
    }
  }
`;

const getOrCreateCartId = async () => {
  let cartId = localStorage.getItem('shopifyCartId');

  if (!cartId) {
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
      cartId = data.cartCreate.cart.id;
      localStorage.setItem('shopifyCartId', cartId);
    } catch (error) {
      console.error("Erro ao criar carrinho no Shopify:", error);
      alert("Falha ao iniciar o carrinho. Tente recarregar a página.");
      throw error;
    }
  }

  return cartId;
};

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifica se o usuário está autenticado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const docRef = doc(db, 'carts', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          setCart(docSnap.exists() ? docSnap.data().items : []);
        } catch (error) {
          console.error("Erro ao carregar carrinho:", error);
          alert("Falha ao carregar carrinho. Tente novamente.");
        }
      } else {
        setUser(null);
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        setCart(guestCart);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const syncRemoveWithShopify = async (item) => {
    try {
      const cartId = localStorage.getItem('shopifyCartId');
      if (!cartId) return;

      // Buscar linhas do carrinho do Shopify (apenas ProductVariant)
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

      // Encontrar a linha correspondente ao item (via merchandise.id)
      const lineToRemove = data.cart.lines.edges.find(
        ({ node }) => node.merchandise?.id === item.id
      );

      if (lineToRemove) {
        // Remover linha do carrinho do Shopify
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

  // Função para remover item do carrinho
  const removeItem = async (item) => {
    const updatedCart = cart.filter((cartItem) => cartItem.id !== item.id);
    setCart(updatedCart);

    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(db, 'carts', user.uid), { items: updatedCart }, { merge: true });
    } else {
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
    }

    // Sincronizar remoção com o Shopify
    await syncRemoveWithShopify(item);
  };

  // Função para finalizar compra
  const handleCheckout = async () => {
    const user = auth.currentUser;
    const cartItems = user ? cart : JSON.parse(localStorage.getItem('guestCart') || '[]');

    if (cartItems.length === 0) {
      alert("Seu carrinho está vazio. Adicione produtos antes de finalizar.");
      return;
    }

    try {
      const cartId = await getOrCreateCartId();

      // Adicionar itens ao Shopify
      const lines = cartItems.map(item => ({
        merchandiseId: item.id,
        quantity: item.quantity,
      }));

      const { data } = await client.mutate({
        mutation: ADD_ITEMS_TO_CART,
        variables: {
          cartId: cartId,
          lines: lines,
        },
      });

      // Redirecionar para checkout do Shopify
      window.location.href = data.cartLinesAdd.cart.checkoutUrl;
    } catch (error) {
      console.error("Erro ao finalizar compra:", error);
      alert("Falha ao sincronizar o carrinho com o Shopify. Tente novamente.");
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p>Carregando seu carrinho...</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Carrinho de Compras</h1>
        {cart.length === 0 && !user ? (
          <div className="text-center py-12">
            <ShoppingCart size={80} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-6">Seu carrinho está vazio</p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continuar Comprando
            </button>
          </div>
        ) : cart.length === 0 && user ? (
          <div className="text-center py-12">
            <ShoppingCart size={80} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-6">Seu carrinho está vazio</p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continuar Comprando
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Itens do Carrinho */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center space-x-4">
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-gray-500">R$ {item.price.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo do Pedido */}
            <div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-bold text-lg mb-4">Resumo do Pedido</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>$ {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frete</span>
                    <span>Grátis</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>$ {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-6"
                >
                  Finalizar Compra
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;