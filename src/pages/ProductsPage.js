import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { Heart, ShoppingCart, Filter, X, ChevronDown, ChevronUp, Eye, ArrowRight } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import '../styles/ProductsPage.css';

// Query GraphQL para buscar produtos por tag
const GET_PRODUCTS_BY_TAG = gql`
  query GetProductsByTag($tag: String!, $first: Int = 50) {
    products(first: $first, query: $tag) {
      edges {
        node {
          id
          title
          tags
          handle
          # Metacampos para gênero alvo - metaobjeto Shopify
          metafields(identifiers: [
            {namespace: "shopify", key: "target-gender"}
          ]) {
            key
            value
            namespace
            reference {
              ... on Metaobject {
                id
                type
                field(key: "label") {
                  value
                }
              }
            }
          }
          # Fallback para metafields customizados
          customMetafields: metafields(identifiers: [
            {namespace: "custom", key: "genero_alvo"},
            {namespace: "custom", key: "target_gender"},
            {namespace: "custom", key: "gender"}
          ]) {
            key
            value
            namespace
          }
          images(first: 3) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
                quantityAvailable
                image {
                  url
                }
              }
            }
          }
        }
      }
    }
  }
`;

const ProductsPage = () => {
  const { tag, subcategory } = useParams();
  const navigate = useNavigate();
  const { openCart } = useCart();
  
  // Estados
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // grid ou list

  // Query
  const { loading, error, data } = useQuery(GET_PRODUCTS_BY_TAG, {
    variables: {
      tag: `tag:${tag}${subcategory ? ` AND tag:${subcategory}` : ''}`,
      first: 50
    }
  });

  // Filtros mockados (serão substituídos pelos reais posteriormente)
  const mockFilters = {
    size: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    color: ['Black', 'White', 'Red', 'Blue', 'Gray', 'Pink'],
    style: ['Goth', 'Streetwear', 'Y2K', 'Grunge', 'Emo', 'Punk'],
    price: ['Under $50', '$50-$100', '$100-$200', '$200+']
  };

  // Função para transformar dados do produto
  const transformProduct = (product) => {
    const variants = product.variants?.edges?.map(edge => ({
      id: edge.node.id,
      title: edge.node.title,
      price: parseFloat(edge.node.price?.amount || 0),
      compareAtPrice: parseFloat(edge.node.compareAtPrice?.amount || 0),
      availableForSale: edge.node.availableForSale,
      quantityAvailable: edge.node.quantityAvailable || 0,
      image: edge.node.image?.url
    })) || [];

    // Processar metacampos
    const metafields = {};
    
    if (product.metafields && Array.isArray(product.metafields)) {
      product.metafields.forEach(field => {
        if (field && field.reference && field.reference.field && field.reference.field.value) {
          metafields[field.key] = field.reference.field.value;
        } else if (field && field.value) {
          metafields[field.key] = field.value;
        }
      });
    }
    
    if (product.customMetafields && Array.isArray(product.customMetafields)) {
      product.customMetafields.forEach(field => {
        if (field && field.value) {
          metafields[field.key] = field.value;
        }
      });
    }

    const variant = variants[0];
    const currentPrice = variant?.price || 0;
    const originalPrice = variant?.compareAtPrice || 0;

    // Usar apenas dados reais do Shopify para promoções
    const hasDiscount = originalPrice > 0 && originalPrice > currentPrice;
    const discountPercentage = hasDiscount 
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

    // Gerar badges automáticos baseados no estoque
    const stockLevel = variant?.quantityAvailable || 0;
    let stockBadge = null;
    
    if (stockLevel > 0 && stockLevel <= 3) {
      stockBadge = 'Last few units!';
    } else if (stockLevel > 3 && stockLevel <= 10) {
      stockBadge = 'Limited stock!';
    } else if (stockLevel > 10 && stockLevel <= 20) {
      stockBadge = 'Almost sold out!';
    }

    return {
      id: product.id,
      handle: product.handle,
      name: product.title,
      images: product.images?.edges?.map(edge => edge.node.url) || [],
      price: currentPrice,
      originalPrice: hasDiscount ? originalPrice : undefined,
      discount: discountPercentage > 0 ? discountPercentage : undefined,
      tags: product.tags || [],
      metafields: metafields,
      variants: variants,
      availableForSale: variant?.availableForSale ?? true,
      stockLevel: stockLevel,
      stockBadge: stockBadge
    };
  };

  const products = data?.products?.edges?.map(edge => transformProduct(edge.node)) || [];

  // Filtrar produtos baseado nos filtros selecionados
  const filteredProducts = products.filter(product => {
    // Filtro por preço
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    
    // Outros filtros (implementação básica)
    if (selectedFilters.length > 0) {
      const hasMatchingFilter = selectedFilters.some(filter => 
        product.tags.some(tag => 
          tag.toLowerCase().includes(filter.toLowerCase())
        )
      );
      if (!hasMatchingFilter) return false;
    }
    
    return true;
  });

  // Função para adicionar ao carrinho
  const addToCart = async (product) => {
    try {
      console.log('Adicionando ao carrinho:', product);
      // Implementar lógica de adicionar ao carrinho
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    }
  };

  // Função para trocar imagem no hover/mobile
  const handleImageChange = (productId, direction) => {
    const product = filteredProducts.find(p => p.id === productId);
    if (!product || product.images.length <= 1) return;

    const currentIndex = currentImageIndex[productId] || 0;
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % product.images.length;
    } else {
      newIndex = currentIndex === 0 ? product.images.length - 1 : currentIndex - 1;
    }
    
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: newIndex
    }));
  };

  // Função para navegar para produto
  const navigateToProduct = (handle) => {
    navigate(`/product/${handle}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Error loading products</h2>
          <p className="text-gray-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header da página */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mt-4 justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-wider uppercase">
                {tag?.replace(/-/g, ' ')} 
                {subcategory && ` - ${subcategory.replace(/-/g, ' ')}`}
              </h1>
              <p className="text-gray-400 mt-2">
                {filteredProducts.length} products found
              </p>
            </div>
            
            {/* Botão de filtros (mobile) */}
            <button
              className="lg:hidden bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de filtros */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            {/* Overlay para mobile */}
            {showFilters && (
              <div 
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setShowFilters(false)}
              />
            )}
            
            <div className={`bg-gray-900 rounded-lg p-6 ${showFilters ? 'lg:static fixed top-0 right-0 h-full w-80 z-50 overflow-y-auto custom-scrollbar' : 'sticky top-24'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Filters</h3>
                <button
                  className="lg:hidden text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowFilters(false)}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-red-400">Price Range</h4>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-red-600 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              {Object.entries(mockFilters).map(([category, options]) => (
                <div key={category} className="mb-6 border-b border-gray-700 pb-4 last:border-b-0">
                  <h4 className="font-semibold mb-3 capitalize text-red-400">{category}</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                    {options.map(option => (
                      <label key={option} className="flex items-center space-x-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(option)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFilters([...selectedFilters, option]);
                            } else {
                              setSelectedFilters(selectedFilters.filter(f => f !== option));
                            }
                          }}
                          className="rounded border-gray-600 text-red-600 focus:ring-red-500 focus:ring-2"
                        />
                        <span className="text-sm group-hover:text-white transition-colors">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Selected Filters */}
              {selectedFilters.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-red-400">Selected Filters</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedFilters.map(filter => (
                      <span
                        key={filter}
                        className="bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1"
                      >
                        <span>{filter}</span>
                        <button
                          onClick={() => setSelectedFilters(selectedFilters.filter(f => f !== filter))}
                          className="hover:bg-red-700 rounded-full p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              {selectedFilters.length > 0 && (
                <button
                  onClick={() => setSelectedFilters([])}
                  className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Grid de produtos */}
          <div className="flex-1">
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-card group relative bg-gray-900 rounded-lg overflow-hidden hover:shadow-xl hover:shadow-red-500/20 transition-all duration-300"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  {/* Badge de estoque */}
                  {product.stockBadge && (
                    <div className="badge badge-stock">
                      {product.stockBadge}
                    </div>
                  )}

                  {/* Badge de desconto */}
                  {product.discount && (
                    <div className="badge badge-discount">
                      -{product.discount}%
                    </div>
                  )}

                  {/* Container da imagem */}
                  <div className="product-image-container">
                    <img
                      src={product.images[currentImageIndex[product.id] || 0] || product.images[0] || "https://via.placeholder.com/400x500"}
                      alt={product.name}
                      className="product-image w-full h-full object-cover transition-transform duration-300"
                    />

                    {/* Overlay para desktop */}
                    <div className="product-overlay absolute inset-0 bg-black bg-opacity-0 transition-all duration-300 hidden lg:flex items-center justify-center space-x-3">
                      <button
                        onClick={() => navigateToProduct(product.handle)}
                        className="product-button bg-white text-black px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:bg-gray-100 transition-colors"
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => addToCart(product)}
                        className="product-button bg-red-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:bg-red-700 transition-colors"
                      >
                        <ShoppingCart size={16} />
                        <span>Add</span>
                      </button>
                    </div>

                    {/* Controles de imagem para mobile - Versão moderna */}
                    {product.images.length > 1 && (
                      <div className="lg:hidden">
                        {/* Dots indicator */}
                        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {product.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(prev => ({
                                ...prev,
                                [product.id]: index
                              }))}
                              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                index === (currentImageIndex[product.id] || 0)
                                  ? 'bg-white scale-125'
                                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                              }`}
                            />
                          ))}
                        </div>
                        
                        {/* Swipe areas */}
                        <div className="absolute inset-0 flex">
                          <button
                            onClick={() => handleImageChange(product.id, 'prev')}
                            className="flex-1 w-1/2 h-full bg-transparent hover:bg-black hover:bg-opacity-10 transition-colors flex items-center justify-start pl-4"
                          >
                            <div className="w-8 h-8 rounded-full bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              ←
                            </div>
                          </button>
                          <button
                            onClick={() => handleImageChange(product.id, 'next')}
                            className="flex-1 w-1/2 h-full bg-transparent hover:bg-black hover:bg-opacity-10 transition-colors flex items-center justify-end pr-4"
                          >
                            <div className="w-8 h-8 rounded-full bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              →
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Informações do produto */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    
                    {/* Preços */}
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-xl font-bold text-white">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Indicador de estoque baixo */}
                    {product.stockLevel > 0 && product.stockLevel <= 5 && (
                      <div className="text-xs text-orange-400 mb-3 font-medium">
                        Only {product.stockLevel} left in stock!
                      </div>
                    )}

                    {/* Botões para mobile */}
                    <div className="lg:hidden flex space-x-2">
                      <button
                        onClick={() => navigateToProduct(product.handle)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => addToCart(product)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <ShoppingCart size={16} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-2xl font-bold mb-4">No products found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your filters or search criteria</p>
                <button
                  onClick={() => setSelectedFilters([])}
                  className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;