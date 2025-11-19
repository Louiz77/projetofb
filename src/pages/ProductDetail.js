import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Minus, 
  Plus, 
  Check, 
  X, 
  Loader2, 
  ZoomIn, 
  ChevronLeft, 
  ChevronRight, 
  Star,
  Truck,
  Shield,
  Zap,
  Package,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { addToCart } from '../hooks/addToCart';
import wishlistHooks from '../hooks/addWishlist';
import { auth, db, doc, getDoc, setDoc } from '../client/firebaseConfig';

const { addToWishlist } = wishlistHooks;

// Query GraphQL completa para detalhes do produto (por ID)
const GET_PRODUCT_BY_ID = gql`
  query GetProductById($productId: ID!) {
    product(id: $productId) {
      id
      title
      handle
      descriptionHtml
      tags
      # Metafields
      metafields(identifiers: [
        {namespace: "shopify", key: "target-gender"}
      ]) {
        key
        value
        namespace
        reference {
          ... on Metaobject {
            id
            field(key: "label") {
              value
            }
          }
        }
      }
      customMetafields: metafields(identifiers: [
        {namespace: "custom", key: "genero_alvo"},
        {namespace: "custom", key: "target_gender"}
      ]) {
        key
        value
        namespace
      }
      # Imagens otimizadas
      images(first: 10) {
        edges {
          node {
            url(transform: {maxWidth: 1200, maxHeight: 1500})
            altText
          }
        }
      }
      # Variantes completas
      variants(first: 50) {
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
            selectedOptions {
              name
              value
            }
            image {
              url(transform: {maxWidth: 600, maxHeight: 750})
            }
          }
        }
      }
      # Preço range
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
`;

// Query GraphQL para buscar produto por handle
const GET_PRODUCT_BY_HANDLE = gql`
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      tags
      # Metafields
      metafields(identifiers: [
        {namespace: "shopify", key: "target-gender"}
      ]) {
        key
        value
        namespace
        reference {
          ... on Metaobject {
            id
            field(key: "label") {
              value
            }
          }
        }
      }
      customMetafields: metafields(identifiers: [
        {namespace: "custom", key: "genero_alvo"},
        {namespace: "custom", key: "target_gender"}
      ]) {
        key
        value
        namespace
      }
      # Imagens otimizadas
      images(first: 10) {
        edges {
          node {
            url(transform: {maxWidth: 1200, maxHeight: 1500})
            altText
          }
        }
      }
      # Variantes completas
      variants(first: 50) {
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
            selectedOptions {
              name
              value
            }
            image {
              url(transform: {maxWidth: 600, maxHeight: 750})
            }
          }
        }
      }
      # Preço range
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
`;

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { openCart } = useCart();
  const decodedId = decodeURIComponent(productId);

  // Estados principais
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [notification, setNotification] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Determinar se é ID (GID) ou handle
  const isGid = decodedId.includes('gid://') || decodedId.startsWith('gid_');

  // Query GraphQL - usar query apropriada baseado no tipo de identificador
  const { loading, error, data } = useQuery(
    isGid ? GET_PRODUCT_BY_ID : GET_PRODUCT_BY_HANDLE,
    {
      variables: isGid ? { productId: decodedId } : { handle: decodedId },
      skip: !decodedId,
      onError: (err) => {
        console.error('❌ GraphQL Query Error:', err);
      },
      onCompleted: (data) => {
        console.log('✅ Product loaded:', data?.product?.title || data?.productByHandle?.title);
      }
    }
  );

  // Normalizar dados do produto (pode vir de product ou productByHandle)
  const productData = useMemo(() => {
    return data?.product || data?.productByHandle || null;
  }, [data]);

  // Auto-remove notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Verificar se produto está na wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      const user = auth.currentUser;
      try {
        if (user) {
          const wishlistRef = doc(db, 'wishlists', user.uid);
          const wishlistSnap = await getDoc(wishlistRef);
          if (wishlistSnap.exists()) {
            const items = wishlistSnap.data().items || [];
            const isInList = items.some(item => item.productId === data?.product?.id || item.id === data?.product?.id);
            setIsInWishlist(isInList);
          }
        } else {
          const wishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
          const isInList = wishlist.some(item => item.productId === data?.product?.id || item.id === data?.product?.id);
          setIsInWishlist(isInList);
        }
      } catch (error) {
        console.error('Error checking wishlist:', error);
      }
    };

    if (productData) {
      checkWishlist();
    }
  }, [productData]);

  // Transformar produto
  const transformProduct = useMemo(() => {
    if (!productData) return null;

    const product = productData;
    const variants = product.variants?.edges?.map(edge => ({
      id: edge.node.id,
      title: edge.node.title,
      price: parseFloat(edge.node.price?.amount || 0),
      compareAtPrice: parseFloat(edge.node.compareAtPrice?.amount || 0),
      availableForSale: edge.node.availableForSale,
      quantityAvailable: edge.node.quantityAvailable || 0,
      image: edge.node.image?.url,
      selectedOptions: edge.node.selectedOptions || []
    })) || [];

    const images = product.images?.edges?.map(edge => edge.node.url) || [];
    
    // Processar metafields
    const metafields = {};
    if (product.metafields && Array.isArray(product.metafields)) {
      product.metafields.forEach(field => {
        if (field && field.key) {
          if (field.reference && field.reference.field && field.reference.field.value) {
            metafields[field.key] = field.reference.field.value;
          } else if (field.value) {
            try {
              const parsed = JSON.parse(field.value);
              if (Array.isArray(parsed) && parsed.length > 0 && 
                  parsed.every(id => typeof id === 'string' && (id.includes('METAOBJECT') || id.includes('Metaobject')))) {
                if (field.key === 'target-gender') {
                  const genderIdMap = {
                    '157432053980': 'WOMEN',
                    '157433233628': 'MEN',
                    '155234664668': 'UNISEX'
                  };
                  let foundGender = null;
                  for (const idStr of parsed) {
                    const idMatch = Object.keys(genderIdMap).find(key => idStr.includes(key));
                    if (idMatch) {
                      foundGender = genderIdMap[idMatch];
                      break;
                    }
                  }
                  if (foundGender) {
                    metafields[field.key] = foundGender;
                  }
                }
              } else {
                metafields[field.key] = field.value;
              }
            } catch (e) {
              metafields[field.key] = field.value;
            }
          }
        }
      });
    }

    // Calcular preços e descontos
    const firstVariant = variants[0];
    const currentPrice = firstVariant?.price || parseFloat(product.priceRange?.minVariantPrice?.amount || 0);
    const originalPrice = firstVariant?.compareAtPrice || 0;
    const hasDiscount = originalPrice > 0 && originalPrice > currentPrice;
    const discountPercentage = hasDiscount 
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

    // Badges
    const hasLowStock = firstVariant?.quantityAvailable > 0 && firstVariant?.quantityAvailable <= 3;
    const isNew = product.tags?.some(tag => tag.toLowerCase().includes('new') || tag.toLowerCase().includes('novo'));
    const isPromotion = product.tags?.some(tag => tag.toLowerCase().includes('promo') || tag.toLowerCase().includes('sale'));

    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.descriptionHtml,
      images,
      variants,
      tags: product.tags || [],
      metafields,
      price: currentPrice,
      originalPrice: hasDiscount ? originalPrice : undefined,
      discount: discountPercentage > 0 ? discountPercentage : undefined,
      hasLowStock,
      isNew,
      isPromotion,
      currencyCode: product.priceRange?.minVariantPrice?.currencyCode || 'USD'
    };
  }, [data]);

  // Extrair opções de cor e tamanho
  const productOptions = useMemo(() => {
    if (!transformProduct) return { colors: [], sizes: [] };

    const colors = new Set();
    const sizes = new Set();

    transformProduct.variants.forEach(variant => {
      variant.selectedOptions?.forEach(option => {
        if (option.name && option.value) {
          const nameLower = option.name.toLowerCase();
          if (nameLower.includes('color') || nameLower.includes('colour')) {
            colors.add(option.value);
          } else if (nameLower.includes('size')) {
            sizes.add(option.value);
          }
        }
      });
    });

    return {
      colors: Array.from(colors).sort(),
      sizes: Array.from(sizes).sort()
    };
  }, [transformProduct]);

  // Encontrar variante baseada nas opções selecionadas
  const findVariantByOptions = useMemo(() => {
    if (!transformProduct || !selectedColor && !selectedSize) {
      return transformProduct?.variants[0] || null;
    }

    return transformProduct.variants.find(variant => {
      const options = variant.selectedOptions || [];
      const hasColor = !selectedColor || options.some(opt => 
        (opt.name?.toLowerCase().includes('color') || opt.name?.toLowerCase().includes('colour')) &&
        opt.value === selectedColor
      );
      const hasSize = !selectedSize || options.some(opt => 
        opt.name?.toLowerCase().includes('size') &&
        opt.value === selectedSize
      );
      return hasColor && hasSize && variant.availableForSale;
    }) || transformProduct.variants.find(v => v.availableForSale) || transformProduct.variants[0];
  }, [transformProduct, selectedColor, selectedSize]);

  // Atualizar variante selecionada quando opções mudam
  useEffect(() => {
    if (findVariantByOptions) {
      setSelectedVariant(findVariantByOptions);
      // Atualizar imagem se a variante tiver imagem específica
      if (findVariantByOptions.image) {
        const imageIndex = transformProduct?.images.findIndex(img => img === findVariantByOptions.image);
        if (imageIndex !== -1) {
          setSelectedImageIndex(imageIndex);
        }
      }
    }
  }, [findVariantByOptions, transformProduct]);

  // Função helper para obter código de cor
  const getColorCode = (colorName) => {
    const colorMap = {
      'Black': '#000000',
      'White': '#FFFFFF',
      'Red': '#FF0000',
      'Blue': '#0000FF',
      'Green': '#008000',
      'Yellow': '#FFFF00',
      'Pink': '#FFC0CB',
      'Purple': '#800080',
      'Orange': '#FFA500',
      'Brown': '#A52A2A',
      'Gray': '#808080',
      'Grey': '#808080',
      'Navy': '#000080',
      'Beige': '#F5F5DC',
      'Cream': '#FFFDD0'
    };
    return colorMap[colorName] || '#CCCCCC';
  };

  // Handler para adicionar ao carrinho
  const handleAddToCart = async () => {
    if (!transformProduct || !selectedVariant) {
      setNotification({
        type: 'error',
        message: 'Please select all required options'
      });
      return;
    }

    if (!selectedVariant.availableForSale) {
      setNotification({
        type: 'error',
        message: 'This variant is not available'
      });
      return;
    }

    if (productOptions.colors.length > 0 && !selectedColor) {
      setShowVariantModal(true);
      setNotification({
        type: 'info',
        message: 'Please select color and size'
      });
      return;
    }

    if (productOptions.sizes.length > 0 && !selectedSize) {
      setShowVariantModal(true);
      setNotification({
        type: 'info',
        message: 'Please select size'
      });
      return;
    }

    try {
      setAddingToCart(true);

      const productToAdd = {
        id: transformProduct.id,
        name: transformProduct.title,
        price: selectedVariant.price,
        image: selectedVariant.image || transformProduct.images[0],
        variantId: selectedVariant.id,
        quantity: quantity
      };

      await addToCart(productToAdd);

      setNotification({
        type: 'success',
        message: `${transformProduct.title} added to cart!`
      });

      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items: [] } }));
      window.dispatchEvent(new CustomEvent('guestCartUpdated', { detail: { items: [] } }));

      // Opcional: abrir carrinho após adicionar
      setTimeout(() => {
        openCart();
      }, 500);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setNotification({
        type: 'error',
        message: 'Failed to add to cart. Please try again.'
      });
    } finally {
      setAddingToCart(false);
    }
  };

  // Handler para wishlist
  const handleWishlist = async () => {
    if (!transformProduct || !selectedVariant) return;

    try {
      setAddingToWishlist(true);

      const productToAdd = {
        id: transformProduct.id,
        name: transformProduct.title,
        price: selectedVariant.price || transformProduct.price,
        image: selectedVariant.image || transformProduct.images[0],
        handle: transformProduct.handle,
        variantId: selectedVariant.id
      };

      if (isInWishlist) {
        // Remover da wishlist - usar lógica do hook
        const user = auth.currentUser;
        if (user) {
          const wishlistRef = doc(db, 'wishlists', user.uid);
          const wishlistSnap = await getDoc(wishlistRef);
          if (wishlistSnap.exists()) {
            const items = wishlistSnap.data().items || [];
            const filteredItems = items.filter(item => 
              item.productId !== transformProduct.id && item.id !== transformProduct.id
            );
            await setDoc(wishlistRef, { items: filteredItems }, { merge: true });
          }
        } else {
          const wishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
          const filteredItems = wishlist.filter(item => 
            item.productId !== transformProduct.id && item.id !== transformProduct.id
          );
          localStorage.setItem('wishlistItems', JSON.stringify(filteredItems));
          window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { items: filteredItems } }));
        }
        setIsInWishlist(false);
        setNotification({
          type: 'success',
          message: `${transformProduct.title} removed from wishlist`
        });
      } else {
        await addToWishlist(productToAdd);
        setIsInWishlist(true);
        setNotification({
          type: 'success',
          message: `${transformProduct.title} added to wishlist`
        });
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update wishlist. Please try again.'
      });
    } finally {
      setAddingToWishlist(false);
    }
  };

  // Abrir lightbox
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setShowImageLightbox(true);
    document.body.style.overflow = 'hidden';
  };

  // Fechar lightbox
  const closeLightbox = () => {
    setShowImageLightbox(false);
    document.body.style.overflow = '';
  };

  // Navegar imagens no lightbox
  const navigateLightbox = (direction) => {
    if (direction === 'next') {
      setLightboxIndex((prev) => 
        prev === transformProduct.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setLightboxIndex((prev) => 
        prev === 0 ? transformProduct.images.length - 1 : prev - 1
      );
    }
  };

  // Keyboard navigation para lightbox
  useEffect(() => {
    if (!showImageLightbox) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox('prev');
      if (e.key === 'ArrowRight') navigateLightbox('next');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showImageLightbox]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-[#8A0101] mx-auto mb-4" />
          <p className="text-[#F3ECE7] text-lg font-bold tracking-wider">LOADING PRODUCT...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !transformProduct) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-[#8A0101] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#F3ECE7] mb-2">PRODUCT NOT FOUND</h2>
          <p className="text-gray-400 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#8A0101] hover:bg-[#8A0101]/80 text-white rounded-lg font-bold tracking-wider transition-colors"
          >
            GO BACK
          </button>
        </div>
      </div>
    );
  }

  const product = transformProduct;
  const currentPrice = selectedVariant?.price || product.price;
  const originalPrice = selectedVariant?.compareAtPrice || product.originalPrice;
  const hasDiscount = originalPrice && originalPrice > currentPrice;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-black text-[#F3ECE7]">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-24 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl border border-[#4B014E]/50 backdrop-blur-sm animate-slide-in-right ${
          notification.type === 'success' ? 'bg-green-900/80 text-green-100' :
          notification.type === 'error' ? 'bg-red-900/80 text-red-100' :
          'bg-blue-900/80 text-blue-100'
        }`}>
          <p className="font-bold tracking-wider">{notification.message}</p>
        </div>
      )}

      {/* Header com breadcrumb */}
      <div className="bg-gradient-to-b from-black to-[#1C1C1C] border-b border-[#4B014E]/30 sticky top-0 z-40 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6 xl:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-[#F3ECE7] hover:text-[#8A0101] transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-bold tracking-wider">BACK</span>
            </button>

            {/* Breadcrumb */}
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
              <Link to="/" className="hover:text-[#F3ECE7] transition-colors">HOME</Link>
              <span>/</span>
              <span className="text-[#F3ECE7]">{product.title.toUpperCase()}</span>
            </div>

            {/* Wishlist button */}
            <button
              onClick={handleWishlist}
              disabled={addingToWishlist}
              className={`p-2 rounded-full bg-black/50 backdrop-blur-sm border border-[#4B014E]/50 hover:bg-[#8A0101] transition-all duration-300 ${
                isInWishlist ? 'bg-[#8A0101]' : ''
              }`}
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {addingToWishlist ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#F3ECE7]" />
              ) : (
                <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-[#F3ECE7] text-[#F3ECE7]' : 'text-[#F3ECE7]'}`} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 xl:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div 
              className="relative aspect-square bg-[#1C1C1C] rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => openLightbox(selectedImageIndex)}
            >
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#8A0101]" />
                </div>
              )}
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.title}
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
              />
              
              {/* Zoom overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ZoomIn className="w-12 h-12 text-white drop-shadow-lg" />
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {hasDiscount && (
                  <span className="px-3 py-1 bg-[#8A0101] text-white text-sm font-bold tracking-wider rounded">
                    -{discountPercentage}%
                  </span>
                )}
                {product.isNew && (
                  <span className="px-3 py-1 bg-[#4B014E] text-white text-sm font-bold tracking-wider rounded">
                    NEW
                  </span>
                )}
                {product.hasLowStock && (
                  <span className="px-3 py-1 bg-yellow-600 text-white text-sm font-bold tracking-wider rounded">
                    LOW STOCK
                  </span>
                )}
              </div>

              {/* Navigation arrows (desktop) */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1);
                    }}
                    className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all z-10"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1);
                    }}
                    className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all z-10"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2 custom-scrollbar">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setImageLoaded(false);
                    }}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-[#8A0101] ring-2 ring-[#8A0101]/50'
                        : 'border-[#4B014E]/30 hover:border-[#4B014E]/50'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-wider uppercase text-[#F3ECE7]">
                {product.title}
              </h1>
              
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-3">
                  {hasDiscount && originalPrice && (
                    <span className="text-xl text-gray-400 line-through">
                      ${originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="text-3xl lg:text-4xl font-bold text-[#8A0101]">
                    ${currentPrice.toFixed(2)}
                  </span>
                </div>
                {hasDiscount && (
                  <span className="px-3 py-1 bg-[#8A0101] text-white text-sm font-bold rounded">
                    SAVE {discountPercentage}%
                  </span>
                )}
              </div>

              {/* Stock status */}
              {selectedVariant && (
                <div className="flex items-center gap-2">
                  {selectedVariant.availableForSale ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <Check size={18} />
                      <span className="text-sm font-medium">
                        {selectedVariant.quantityAvailable > 10 
                          ? 'In Stock' 
                          : selectedVariant.quantityAvailable > 0
                          ? `Only ${selectedVariant.quantityAvailable} left`
                          : 'Limited Stock'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400">
                      <X size={18} />
                      <span className="text-sm font-medium">Out of Stock</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Variant Selection */}
            {productOptions.colors.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold tracking-wider uppercase">COLOR</h3>
                <div className="flex flex-wrap gap-3">
                  {productOptions.colors.map((color) => {
                    const colorCode = getColorCode(color);
                    const isAvailable = transformProduct.variants.some(v => 
                      v.selectedOptions?.some(opt => 
                        (opt.name?.toLowerCase().includes('color') || opt.name?.toLowerCase().includes('colour')) &&
                        opt.value === color && v.availableForSale
                      )
                    );

                    return (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          if (productOptions.sizes.length === 0) {
                            setShowVariantModal(false);
                          }
                        }}
                        disabled={!isAvailable}
                        className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                          selectedColor === color
                            ? 'border-[#8A0101] ring-2 ring-[#8A0101]/50 scale-110'
                            : 'border-[#4B014E]/50 hover:border-[#4B014E] hover:scale-105'
                        } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        style={{ backgroundColor: colorCode }}
                        title={color}
                      >
                        {selectedColor === color && (
                          <Check className="absolute inset-0 m-auto text-white drop-shadow-lg" size={20} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {productOptions.sizes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold tracking-wider uppercase">SIZE</h3>
                <div className="flex flex-wrap gap-3">
                  {productOptions.sizes.map((size) => {
                    const isAvailable = transformProduct.variants.some(v => 
                      v.selectedOptions?.some(opt => 
                        opt.name?.toLowerCase().includes('size') &&
                        opt.value === size && v.availableForSale
                      ) &&
                      (!selectedColor || v.selectedOptions?.some(opt => 
                        (opt.name?.toLowerCase().includes('color') || opt.name?.toLowerCase().includes('colour')) &&
                        opt.value === selectedColor
                      ))
                    );

                    return (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setShowVariantModal(false);
                        }}
                        disabled={!isAvailable}
                        className={`px-6 py-3 rounded-lg border-2 font-bold tracking-wider transition-all ${
                          selectedSize === size
                            ? 'border-[#8A0101] bg-[#8A0101] text-white'
                            : 'border-[#4B014E]/50 text-[#F3ECE7] hover:border-[#4B014E] hover:bg-[#4B014E]/20'
                        } ${!isAvailable ? 'opacity-50 cursor-not-allowed line-through' : 'cursor-pointer'}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4 pt-4 border-t border-[#4B014E]/30">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold tracking-wider uppercase">QUANTITY</span>
                <div className="flex items-center gap-3 bg-black/50 rounded-lg border border-[#4B014E]/30 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 rounded hover:bg-[#4B014E]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={selectedVariant && quantity >= selectedVariant.quantityAvailable}
                    className="p-2 rounded hover:bg-[#4B014E]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || !selectedVariant?.availableForSale || (productOptions.colors.length > 0 && !selectedColor) || (productOptions.sizes.length > 0 && !selectedSize)}
                className="w-full bg-gradient-to-r from-[#8A0101] to-[#4B014E] hover:from-[#8A0101]/90 hover:to-[#4B014E]/90 text-white px-8 py-4 rounded-lg font-bold tracking-wider text-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {addingToCart ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>ADDING...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    <span>ADD TO CART</span>
                  </>
                )}
              </button>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#4B014E]/30">
              <div className="flex items-center gap-3 p-4 bg-black/30 rounded-lg border border-[#4B014E]/30">
                <Truck className="text-[#8A0101]" size={24} />
                <div>
                  <p className="text-sm text-gray-400">FREE SHIPPING</p>
                  <p className="text-sm font-bold">Over $150</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-black/30 rounded-lg border border-[#4B014E]/30">
                <Shield className="text-[#8A0101]" size={24} />
                <div>
                  <p className="text-sm text-gray-400">GUARANTEE</p>
                  <p className="text-sm font-bold">30 Days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-black/30 rounded-lg border border-[#4B014E]/30">
                <Zap className="text-[#8A0101]" size={24} />
                <div>
                  <p className="text-sm text-gray-400">FAST DELIVERY</p>
                  <p className="text-sm font-bold">24-48h</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-6 border-t border-[#4B014E]/30">
                <h3 className="text-xl font-bold tracking-wider uppercase mb-4">DESCRIPTION</h3>
                <div 
                  className="prose prose-invert max-w-none text-gray-300 prose-headings:text-[#F3ECE7] prose-a:text-[#8A0101] prose-strong:text-[#F3ECE7]"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="pt-6 border-t border-[#4B014E]/30">
                <h3 className="text-lg font-bold tracking-wider uppercase mb-3">TAGS</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                      className="px-3 py-1 bg-black/30 border border-[#4B014E]/30 rounded-lg text-sm hover:bg-[#4B014E]/30 hover:border-[#4B014E] transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Variant Selection Modal */}
      {showVariantModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowVariantModal(false)}
        >
          <div 
            className="bg-black/90 border border-[#4B014E]/50 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#4B014E]/30 pb-4">
                <h2 className="text-2xl font-bold tracking-wider uppercase text-[#F3ECE7]">
                  SELECT OPTIONS
                </h2>
                <button
                  onClick={() => setShowVariantModal(false)}
                  className="p-2 hover:bg-[#4B014E]/30 rounded-lg transition-colors"
                >
                  <X className="text-[#F3ECE7]" size={24} />
                </button>
              </div>

              {/* Product Info */}
              {transformProduct && (
                <div className="flex gap-4">
                  <img
                    src={transformProduct.images[selectedImageIndex] || transformProduct.images[0]}
                    alt={transformProduct.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#F3ECE7] mb-2">{transformProduct.title}</h3>
                    <div className="flex items-baseline gap-2">
                      {selectedVariant && (
                        <>
                          {selectedVariant.compareAtPrice > selectedVariant.price && (
                            <span className="text-gray-400 line-through">
                              ${selectedVariant.compareAtPrice.toFixed(2)}
                            </span>
                          )}
                          <span className="text-xl font-bold text-[#8A0101]">
                            ${selectedVariant.price.toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {productOptions.colors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold tracking-wider uppercase text-[#F3ECE7]">COLOR</h3>
                  <div className="flex flex-wrap gap-3">
                    {productOptions.colors.map((color) => {
                      const colorCode = getColorCode(color);
                      const isAvailable = transformProduct.variants.some(v => 
                        v.selectedOptions?.some(opt => 
                          (opt.name?.toLowerCase().includes('color') || opt.name?.toLowerCase().includes('colour')) &&
                          opt.value === color && v.availableForSale
                        ) &&
                        (!selectedSize || v.selectedOptions?.some(opt => 
                          opt.name?.toLowerCase().includes('size') &&
                          opt.value === selectedSize
                        ))
                      );

                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          disabled={!isAvailable}
                          className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                            selectedColor === color
                              ? 'border-[#8A0101] ring-2 ring-[#8A0101]/50 scale-110'
                              : 'border-[#4B014E]/50 hover:border-[#4B014E] hover:scale-105'
                          } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          style={{ backgroundColor: colorCode }}
                          title={color}
                        >
                          {selectedColor === color && (
                            <Check className="absolute inset-0 m-auto text-white drop-shadow-lg" size={20} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {productOptions.sizes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold tracking-wider uppercase text-[#F3ECE7]">SIZE</h3>
                  <div className="flex flex-wrap gap-3">
                    {productOptions.sizes.map((size) => {
                      const isAvailable = transformProduct.variants.some(v => 
                        v.selectedOptions?.some(opt => 
                          opt.name?.toLowerCase().includes('size') &&
                          opt.value === size && v.availableForSale
                        ) &&
                        (!selectedColor || v.selectedOptions?.some(opt => 
                          (opt.name?.toLowerCase().includes('color') || opt.name?.toLowerCase().includes('colour')) &&
                          opt.value === selectedColor
                        ))
                      );

                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          disabled={!isAvailable}
                          className={`px-6 py-3 rounded-lg border-2 font-bold tracking-wider transition-all ${
                            selectedSize === size
                              ? 'border-[#8A0101] bg-[#8A0101] text-white'
                              : 'border-[#4B014E]/50 text-[#F3ECE7] hover:border-[#4B014E] hover:bg-[#4B014E]/20'
                          } ${!isAvailable ? 'opacity-50 cursor-not-allowed line-through' : 'cursor-pointer'}`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-[#4B014E]/30">
                <button
                  onClick={() => setShowVariantModal(false)}
                  className="flex-1 px-6 py-3 bg-black/50 border border-[#4B014E]/50 rounded-lg text-[#F3ECE7] font-bold tracking-wider hover:bg-[#4B014E]/30 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={async () => {
                    if (selectedVariant && selectedVariant.availableForSale) {
                      await handleAddToCart();
                      setShowVariantModal(false);
                    }
                  }}
                  disabled={!selectedVariant || !selectedVariant.availableForSale || addingToCart}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8A0101] to-[#4B014E] text-white rounded-lg font-bold tracking-wider hover:from-[#8A0101]/90 hover:to-[#4B014E]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>ADDING...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      <span>ADD TO CART</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {showImageLightbox && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all z-10"
          >
            <X size={24} />
          </button>

          <div className="relative max-w-7xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={product.images[lightboxIndex]}
              alt={product.title}
              className="max-w-full max-h-[90vh] object-contain"
            />

            {/* Navigation */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateLightbox('prev');
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateLightbox('next');
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all"
                >
                  <ChevronRight size={28} />
                </button>

                {/* Dots indicator (mobile) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 lg:hidden">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        lightboxIndex === index ? 'bg-[#8A0101] w-6' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Counter */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 rounded-full text-white text-sm font-medium">
                  {lightboxIndex + 1} / {product.images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
