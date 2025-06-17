import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import client from '../client/ShopifyClient';
import { ArrowLeft, ShoppingCart, Star, Minus, Plus, Zap, Shield, Truck, Check } from 'lucide-react';
import { auth, db, doc, setDoc, getDoc } from '../client/firebaseConfig';

// Mutação para adicionar ao carrinho
const ADD_TO_CART = gql`
  mutation ($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
      }
    }
  }
`;

// Query para buscar detalhes do produto
const GET_PRODUCT_DETAILS = gql`
  query ($productId: ID!) {
    product(id: $productId) {
      id
      title
      descriptionHtml
      priceRange {
        minVariantPrice {
          amount
        }
      }
      images(first: 5) {
        edges {
          node {
            url
          }
        }
      }
      variants(first: 5) {
        edges {
          node {
            id
            title
            price {
              amount
            }
          }
        }
      }
    }
  }
`;

const ProductDetail = () => {
  const { productId } = useParams();
  const decodedId = decodeURIComponent(productId);
  const navigate = useNavigate();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSize, setSelectedSize] = []
  const [quantity, setQuantity] = useState(1);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  // eslint-disable-next-line
  const [addToCartMutation] = useMutation(ADD_TO_CART, {
    onCompleted: async (data) => {
      const cartId = data.cartCreate?.cart?.id || localStorage.getItem('shopifyCartId');

      if (cartId) {
        localStorage.setItem('shopifyCartId', cartId);

        // Adicionar item ao carrinho do Firebase
        const user = auth.currentUser;
        const selectedVariantId = product.variants.edges[selectedVariant].node.id;
        const variantPrice = product.variants.edges[selectedVariant].node.price.amount;

        const item = {
          id: selectedVariantId,
          name: product.title,
          price: parseFloat(variantPrice),
          quantity: quantity,
        };

        if (user) {
          const cartRef = doc(db, 'carts', user.uid);
          const cartSnap = await getDoc(cartRef);
          const existingItems = cartSnap.exists() ? cartSnap.data().items : [];
          await setDoc(cartRef, { items: [...existingItems, item] }, { merge: true });
        } else {
          const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
          guestCart.push(item);
          localStorage.setItem('guestCart', JSON.stringify(guestCart));
        }

        alert("Item adicionado ao carrinho!");
      } else {
        alert("Falha ao adicionar ao carrinho. Tente novamente.");
      }
    },
    onError: (error) => {
      console.error("Erro na mutação:", error);
      alert("Falha ao adicionar ao carrinho. Verifique os dados do produto.");
    },
  });

  const { loading, error, data } = useQuery(GET_PRODUCT_DETAILS, {
    variables: { productId: decodedId },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animate-reverse"></div>
          <p className="mt-6 text-lg font-medium text-gray-600 animate-pulse">Carregando detalhes do produto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-red-200 shadow-2xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">Erro ao carregar produto</h2>
          <p className="text-gray-600 mb-4">Tente novamente mais tarde ou retorne aos produtos.</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <span className="font-medium">Voltar aos produtos</span>
          </button>
        </div>
      </div>
    );
  }

  const product = data.product;

  const handleAddToCart = async () => {
    const selectedVariantId = product.variants.edges[selectedVariant].node.id;
    const variantPrice = product.variants.edges[selectedVariant].node.price.amount;
    const quantity = 1;
    const existingCartId = localStorage.getItem('shopifyCartId');

    try {
      // eslint-disable-next-line
      const { data } = await client.mutate({
        mutation: ADD_TO_CART,
        variables: {
          cartId: existingCartId,
          lines: [
            {
              merchandiseId: selectedVariantId,
              quantity: quantity,
            },
          ],
        },
      });

      // Adicionar item ao Firebase
      const item = {
        id: selectedVariantId,
        name: product.title,
        price: parseFloat(variantPrice),
        quantity: quantity,
        image: product.images.edges[selectedImageIndex]?.node.url
      };

      const user = auth.currentUser;
      if (user) {
        const cartRef = doc(db, 'carts', user.uid);
        const cartSnap = await getDoc(cartRef);
        const existingItems = cartSnap.exists() ? cartSnap.data().items : [];
        await setDoc(cartRef, { items: [...existingItems, item] }, { merge: true });
      } else {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        guestCart.push(item);
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
      }

      alert("Item adicionado ao carrinho!");
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      alert("Falha ao adicionar ao carrinho. Verifique os dados do produto.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header com glassmorphism */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => window.history.back()}
            className="group flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Voltar aos produtos</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Galeria de Imagens */}
          <div className="space-y-6">
            {/* Imagem Principal */}
            <div className="relative group">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl">
                <img
                  src={product.images.edges[selectedImageIndex]?.node.url}
                  alt={product.title}
                  className={`w-full h-96 lg:h-[500px] object-cover transition-all duration-700 ${
                    isImageZoomed ? 'scale-110' : 'scale-100'
                  }`}
                  onMouseEnter={() => setIsImageZoomed(true)}
                  onMouseLeave={() => setIsImageZoomed(false)}
                />
              </div>
            </div>

            {/* Miniaturas das Imagens */}
            {product.images.edges.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {product.images.edges.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 relative mt-2 ml-2 overflow-hidden rounded-xl transition-all duration-300 ${
                      selectedImageIndex === index
                        ? 'ring-4 ring-indigo-500 ring-offset-2 shadow-xl scale-105'
                        : 'hover:ring-2 hover:ring-indigo-300 hover:ring-offset-1 hover:scale-105'
                    }`}
                  >
                    <img
                      src={image.node.url}
                      alt={`Img ${index + 1}`}
                      className="w-20 h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            {/* Informações Adicionais */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-md">
                <Zap size={20} className="text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Entrega Rápida</p>
                  <p className="text-sm text-gray-900">24-48h</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-md">
                <Shield size={20} className="text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Garantia</p>
                  <p className="text-sm text-gray-900">30 dias</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-md">
                <Truck size={20} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Frete Grátis</p>
                  <p className="text-sm text-gray-900">Acima de $ 299,90</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detalhes do Produto */}
          <div>
            <div className="space-y-8">
              {/* Cabeçalho do Produto */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="text-sm text-gray-600">({product.reviews} avaliações)</span>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {product.title}
                </h1>
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-indigo-600">
                    $ {product.variants.edges[selectedVariant]?.node.price.amount || product.priceRange.minVariantPrice.amount}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">Em estoque</span>
                </div>
              </div>

              {/* Seleção de Variantes */}
              {product.variants.edges.length > 1 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Configuração</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {product.variants.edges.map((variant, index) => (
                      <button
                        key={variant.node.id}
                        onClick={() => setSelectedVariant(index)}
                        className={`w-full px-4 py-3 rounded-xl font-medium text-left transition-all duration-200 ${
                          selectedVariant === index
                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {variant.node.title} - $ {variant.node.price.amount}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Botão de Adicionar ao Carrinho */}
              <button
                onClick={handleAddToCart}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-indigo-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  <ShoppingCart className="w-6 h-6 transition-transform group-hover:scale-110" />
                  <span>Adicionar ao Carrinho</span>
                </div>
              </button>
              <button
                onClick={() => navigate("/cart")}
                className="w-full mt-4 bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Ver Carrinho
              </button>

              {/* Controle de Quantidade */}
              <div className="flex items-center space-x-3 mt-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Minus size={20} />
                </button>
                <span className="text-xl font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Descrição do Produto */}
              <div
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              ></div>

              {/* Lista de Características */}
              {product.features && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Características:</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <Check size={16} className="text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Lista de Tamanhos/Opções */}
              {product.sizes && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tamanhos:</h3>
                  <div className="flex space-x-2">
                    {product.sizes.map((size, index) => (
                      <button
                        key={index}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          selectedSize === size
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-gray-300 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;