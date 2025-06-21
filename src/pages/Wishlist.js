import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, doc, getDoc, setDoc, onSnapshot } from '../client/firebaseConfig';
import client from '../client/ShopifyClient';
import { gql } from '@apollo/client';
import { Heart, Share2, Grid, List } from 'lucide-react';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('list');
  const navigate = useNavigate();

  // Carregar wishlist do Firestore ou localStorage
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const wishlistRef = doc(db, 'wishlists', firebaseUser.uid);
          const wishlistSnap = await getDoc(wishlistRef);
          if (wishlistSnap.exists()) {
            const items = wishlistSnap.data().items || [];
            setWishlistItems(items);
          } else {
            setWishlistItems([]);
          }
        } catch (error) {
          console.error("Erro ao carregar wishlist:", error);
          setWishlistItems([]);
        }
      } else {
        setUser(null);
        const guestWishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
        setWishlistItems(guestWishlist);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sincronizar wishlist em tempo real
  useEffect(() => {
    if (user) {
      const wishlistRef = doc(db, 'wishlists', user.uid);
      const unsubscribe = onSnapshot(wishlistRef, (docSnap) => {
        if (docSnap.exists()) {
          setWishlistItems(docSnap.data().items || []);
        } else {
          setWishlistItems([]);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

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
        console.error("Erro ao criar carrinho do Shopify:", error);
        alert("Falha ao iniciar o carrinho. Tente recarregar a página.");
        throw error;
      }
    }

    return cartId;
  };
  
  // Função para remover da wishlist - CORRIGIDA
  const removeFromWishlist = async (itemId) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const wishlistRef = doc(db, 'wishlists', user.uid);
        const wishlistSnap = await getDoc(wishlistRef);
        const existingItems = wishlistSnap.exists() ? wishlistSnap.data().items || [] : [];

        const updatedItems = existingItems.filter(item => item.id !== itemId);
        await setDoc(wishlistRef, { items: updatedItems }, { merge: true });
        
        // Atualizar estado local imediatamente
        setWishlistItems(updatedItems);
        alert("Removido da lista de desejos");
      } else {
        const guestWishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
        const updatedItems = guestWishlist.filter(item => item.id !== itemId);
        localStorage.setItem('wishlistItems', JSON.stringify(updatedItems));
        
        // Atualizar estado local imediatamente
        setWishlistItems(updatedItems);
        alert("Removido da lista de desejos");
      }
    } catch (error) {
      console.error("Erro ao remover da wishlist:", error);
      alert("Falha ao remover da lista de desejos. Tente novamente.");
    }
  };

  // Função para adicionar ao carrinho
  const addToCart = async (item) => {
    try {
      const cartId = localStorage.getItem('shopifyCartId') || (await getOrCreateCartId());

      // Validar que o merchandiseId é um variantId válido
      if (!item.variantId || !item.variantId.startsWith("gid://shopify/ProductVariant/")) {
        alert("ID da variante inválido. Não foi possível adicionar ao carrinho.");
        return;
      }

      const { data } = await client.mutate({
        mutation: gql`
          mutation ($cartId: ID!, $lines: [CartLineInput!]!) {
            cartLinesAdd(cartId: $cartId, lines: $lines) {
              cart {
                checkoutUrl
              }
            }
          }
        `,
        variables: {
          cartId,
          lines: [
            {
              merchandiseId: item.variantId, // ✅ Usa o variantId
              quantity: item.quantity || 1,
            },
          ],
        },
      });

      // Atualizar carrinho local com estrutura padronizada
      const cartItem = {
        id: item.variantId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity || 1,
      };

      // Lógica para atualizar carrinho no Firebase ou localStorage
      const user = auth.currentUser;
      if (user) {
        const cartRef = doc(db, 'carts', user.uid);
        const cartSnap = await getDoc(cartRef);
        const existingItems = cartSnap.exists() ? cartSnap.data().items || [] : [];

        const isAlreadyInCart = existingItems.some(cartItem => cartItem.id === cartItem.id);
        const updatedItems = isAlreadyInCart
          ? existingItems.map(cartItem => 
              cartItem.id === cartItem.id 
                ? { ...cartItem, quantity: cartItem.quantity + 1 } 
                : cartItem
            )
          : [...existingItems, cartItem];

        await setDoc(cartRef, { items: updatedItems }, { merge: true });
      } else {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const isAlreadyInCart = guestCart.some(cartItem => cartItem.id === cartItem.id);
        const updatedItems = isAlreadyInCart
          ? guestCart.map(cartItem => 
              cartItem.id === cartItem.id 
                ? { ...cartItem, quantity: cartItem.quantity + 1 } 
                : cartItem
            )
          : [...guestCart, cartItem];

        localStorage.setItem('guestCart', JSON.stringify(updatedItems));
      }

      alert(`${item.name} adicionado ao carrinho`);
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      alert("Falha ao adicionar ao carrinho. Verifique os dados do produto.");
    }
  };

  // Função para compartilhar wishlist
  const shareWishlist = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Minha Wishlist',
        text: 'Confira minha lista de desejos!',
        url: window.location.href,
      });
    } else {
      // Fallback para copiar para área de transferência
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert("Link da wishlist copiado!");
      }).catch(() => {
        alert("Não foi possível copiar o link.");
      });
    }
  };

  // Filtrar e ordenar itens
  const filteredItems = wishlistItems.filter(item =>
    filterCategory === 'all' || item.category?.toLowerCase() === filterCategory
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="border-b border-red-900/30 bg-black/50 backdrop-blur-sm p-4">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col items-center justify-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-8A0101 border-purple-600 mb-4"></div>
              <p className="text-center text-gray-400">Carregando sua wishlist...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="border-b border-red-900/30 bg-black/50 backdrop-blur-sm p-4">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col items-center justify-center">
              <Heart size={80} className="mx-auto mb-6 text-red-800/50" />
              <h2 className="text-2xl font-bold text-red-100 mb-4">Sua alma ainda está vazia...</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Faça login para acessar sua lista de desejos e controlar seus favoritos!
              </p>
              <button
                onClick={() => navigate('/account')}
                className="bg-red-800 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Fazer Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="border-b border-red-900/30 bg-black/50 backdrop-blur-sm p-4">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 
                style={{ fontFamily: 'serif' }}
                className="text-3xl font-bold text-red-100 mb-2"
              >
                MINHA WISHLIST
              </h1>
              <p className="text-gray-400">{wishlistItems.length} itens dos seus sonhos sombrios</p>
            </div>
            <button
              onClick={shareWishlist}
              className="flex items-center gap-2 px-4 py-2 bg-red-800/20 border border-red-700/50 text-red-200 hover:bg-red-700/30 transition-all rounded"
            >
              <Share2 size={16} />
              Compartilhar
            </button>
          </div>
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <Heart size={80} className="mx-auto mb-6 text-red-800/50" />
          <h2 className="text-2xl font-bold text-red-100 mb-4" style={{ fontFamily: 'serif' }}>
            Sua alma ainda está vazia...
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Sua wishlist permite que você mantenha controle de todos os seus favoritos e atividade de compras, seja no computador, celular ou tablet.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-red-800 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Explorar Produtos
          </button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Controles de filtro e ordenação */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-gray-200 rounded-md px-3 py-2"
              >
                <option value="all">Todos os produtos</option>
                <option value="camisetas">Camisetas</option>
                <option value="calcas">Calças</option>
                <option value="corsets">Corsets</option>
                <option value="acessorios">Acessórios</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-gray-200 rounded-md px-3 py-2"
              >
                <option value="default">Ordenar por</option>
                <option value="price-low">Menor Preço</option>
                <option value="price-high">Maior Preço</option>
                <option value="name">Nome A-Z</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-800 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-800 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Conteúdo da wishlist */}
          <div className="mt-8">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedItems.map((item) => (
                  <div key={item.id} className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-32 h-32 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-white">{item.name}</h3>
                        <p className="text-gray-400">R$ {item.price.toFixed(2)}</p>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            className="p-2 bg-gray-700 text-red-400 hover:bg-gray-600 rounded-full transition-colors"
                          >
                            <Heart size={18} fill="currentColor" />
                          </button>
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-red-800 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            Adicionar ao Carrinho
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {sortedItems.map((item) => (
                  <div key={item.id} className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-white">{item.name}</h3>
                        <p className="text-gray-400">R$ {item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-red-800 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Adicionar ao Carrinho
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          className="p-2 bg-gray-700 text-red-400 hover:bg-gray-600 rounded-full transition-colors"
                        >
                          <Heart size={18} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;