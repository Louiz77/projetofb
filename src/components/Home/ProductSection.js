import { ChevronLeft, ChevronRight, Star, Heart, Eye, ArrowLeft, ArrowRight, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { addToCart, addKitToCart } from '../../hooks/addToCart';
import wishlistHooks, { addKitToWishlist } from '../../hooks/addWishlist';
import { auth, db, doc, getDoc, setDoc } from '../../client/firebaseConfig';
import client from '../../client/ShopifyClient';
import { gql } from '@apollo/client';
const { addToWishlist } = wishlistHooks;

const ProductSection = ({ 
  collections, 
  products, // Novo: para acessórios/bolsas
  sectionType = 'kits',
  heroImage,
  heroTitle,
  heroSubtitle,
  heroButton = 'SHOP NOW',
  maleLabel = 'MASCULINOS',
  femaleLabel = 'FEMININOS'
}) => {
  // Estados do modal global de produto individual (devem estar dentro do componente)
  const [modalProduct, setModalProduct] = useState(null);
  const [modalVariant, setModalVariant] = useState(null);
  const [addingCart, setAddingCart] = useState(false);
  const [addingWishlist, setAddingWishlist] = useState(false);
  const [variantCarouselIndex, setVariantCarouselIndex] = useState(0);

  const [maleProductIndex, setMaleProductIndex] = useState(0);
  const [femaleProductIndex, setFemaleProductIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  // Atualizar itemsPerView baseado no tamanho da tela
  useEffect(() => {
    const updateItemsPerView = () => {
      setItemsPerView(window.innerWidth < 768 ? 2 : 4);
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Auto-selecionar primeira variante disponível quando modal abre
  useEffect(() => {
    if (modalProduct && modalProduct.variants?.edges?.length > 0) {
      const firstAvailableVariant = modalProduct.variants.edges.find(
        variant => variant.node.availableForSale
      )?.node;
      
      if (firstAvailableVariant && !modalVariant) {
        setModalVariant(firstAvailableVariant);
      }
      
      // Reset variant carousel index quando modal muda
      setVariantCarouselIndex(0);
    }
  }, [modalProduct, modalVariant]);

 const transformedCollections = Array.isArray(collections)
    ? collections.map(collection => {
        const gender = collection.name?.includes('Men') || collection.name?.toLowerCase().includes('homem') ? 'male'
                    : collection.name?.includes('Women') || collection.name?.toLowerCase().includes('mulher') ? 'female'
                    : 'unisex';

        // Se já vierem os campos price/rating, mantém, senão tenta buscar de collection.products
        let items = (collection.items || []).map(item => ({ ...item }));
        if (items.length && (!('price' in items[0]) || !('rating' in items[0]))) {
          // Tenta buscar de collection.products se existir
          if (Array.isArray(collection.products)) {
            items = items.map(item => {
              const prod = collection.products.find(p => p.id === item.id);
              return {
                ...item,
                price: prod?.price ?? 0,
                rating: prod?.rating ?? 4.5
              };
            });
          }
        }
        // Se não houver items, mas houver products, usa products direto
        if ((!items || !items.length) && Array.isArray(collection.products)) {
          items = collection.products;
        }

        return {
          id: collection.id,
          name: collection.name,
          image: collection.image || "https://via.placeholder.com/400x500",
          description: collection.description || '',
          gender,
          items
        };
      })
    : [];

  const maleCollections = transformedCollections.filter(c => c.gender === 'male');
  const femaleCollections = transformedCollections.filter(c => c.gender === 'female');

  const maxMaleIndex = Math.max(0, maleCollections.length - itemsPerView);
  const maxFemaleIndex = Math.max(0, femaleCollections.length - itemsPerView);

  const navigateCarousel = (type, direction) => {
    if (type === 'male') {
      setMaleProductIndex(prev => {
        if (direction === 'left') {
          return Math.max(0, prev - 1);
        } else {
          return Math.min(maxMaleIndex, prev + 1);
        }
      });
    } else {
      setFemaleProductIndex(prev => {
        if (direction === 'left') {
          return Math.max(0, prev - 1);
        } else {
          return Math.min(maxFemaleIndex, prev + 1);
        }
      });
    }
  };

  // Lógica para acessórios/bolsas (produtos individuais)
  if (sectionType === 'acessorios' && products) {
    return (
      <section className="py-8 sm:py-12" style={{ backgroundColor: '#1C1C1C' }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Hero Banner */}
            <div className="lg:col-span-5 lg:order-1 order-2 flex">
              <div className="relative overflow-hidden w-full group cursor-pointer flex-1">
                <img
                  src={heroImage}
                  alt="Acessórios & Bolsas"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  style={{ 
                    height: '100%',
                    minHeight: '400px'
                  }}
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(168, 1, 1, 0.3), rgba(75, 1, 78, 0.4))' }} />
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-8">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2" style={{ color: '#F3ECE7' }}>{heroTitle}</h2>
                  <p className="text-sm sm:text-base lg:text-lg mb-4 lg:mb-6" style={{ color: '#F3ECE7' }}>{heroSubtitle}</p>
                  <button className="self-start px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105" style={{ backgroundColor: '#F3ECE7', color: '#1C1C1C' }}>{heroButton}</button>
                </div>
              </div>
            </div>
            
            {/* Carrossel de Produtos Individuais */}
            <div className="lg:col-span-7 lg:order-2 order-1 flex flex-col gap-6 lg:gap-8">
              {/* Accessories */}
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ color: '#F3ECE7' }}>Acessories</h3>
                <ProductCarousel products={products.accessories} setModalProduct={setModalProduct} setModalVariant={setModalVariant} />
              </div>
              {/* Bags */}
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ color: '#F3ECE7' }}>Bags</h3>
                <ProductCarousel products={products.bags} setModalProduct={setModalProduct} setModalVariant={setModalVariant} />
              </div>
            </div>
          </div>
        </div>
        {/* Modal global de produto individual */}
        {modalProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-fade-in">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300" onClick={() => setModalProduct(null)} />
            <div className="relative w-full max-w-xs sm:max-w-lg lg:max-w-5xl xl:max-w-6xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-slide-up max-h-[95vh] lg:max-h-[90vh]">
              
              {/* Seção da Imagem - Lado Esquerdo */}
              <div className="lg:w-1/2 relative bg-gradient-to-br from-gray-50 to-gray-100 flex">
                <div className="w-full relative overflow-hidden flex">
                  <img 
                    src={modalVariant?.image?.url || modalProduct.image} 
                    alt={modalProduct.name} 
                    className="w-full h-full object-cover object-center transition-all duration-500 ease-out transform hover:scale-105 image-fade-transition" 
                    style={{
                      objectPosition: 'center center',
                      imageRendering: 'auto',
                      minHeight: '100%'
                    }}
                    loading="eager"
                  />
                  
                  {/* Badge de desconto (se houver) */}
                  {modalProduct.discount && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      -{modalProduct.discount}% OFF
                    </div>
                  )}
                  
                  {/* Indicador de nova variante */}
                  {modalVariant && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-[#4B014E] to-[#6B0261] text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      {modalVariant.title}
                    </div>
                  )}
                  
                  {/* Overlay gradient bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Seção de Conteúdo - Lado Direito */}
              <div className="lg:w-1/2 flex flex-col max-h-[60vh] lg:max-h-none">
                {/* Área de scroll para conteúdo */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h3 className="text-2xl lg:text-3xl font-bold mb-2 text-gray-900 leading-tight">
                        {modalProduct.name}
                      </h3>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl font-bold bg-gradient-to-r from-[#8A0101] to-[#4B014E] bg-clip-text text-transparent">
                          $ {modalVariant ? parseFloat(modalVariant.price.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : modalProduct.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '--'}
                        </div>
                        {/* Mostrar preço original da variante ou do produto */}
                        {((modalVariant?.compareAtPrice?.amount && parseFloat(modalVariant.compareAtPrice.amount) > parseFloat(modalVariant.price.amount)) || modalProduct.originalPrice) && (
                          <div className="text-lg text-gray-400 line-through">
                            $ {modalVariant?.compareAtPrice?.amount 
                              ? parseFloat(modalVariant.compareAtPrice.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                              : modalProduct.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                            }
                          </div>
                        )}
                      </div>
                      
                      {/* Rating e Reviews */}
                      {modalProduct.rating && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={16} 
                                className={`${i < Math.floor(modalProduct.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {modalProduct.rating.toFixed(1)} ({modalProduct.reviewCount || 0} avaliações)
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Botão Fechar */}
                    <button 
                      onClick={() => setModalProduct(null)}
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>

                {/* Seleção de Variantes */}
                {modalProduct.variants?.edges?.length > 1 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Escolha uma opção:</h4>
                    
                    {/* Layout Desktop - Carrossel para muitas variantes, Grid para poucas */}
                    <div className="hidden sm:block">
                      {modalProduct.variants.edges.length <= 6 ? (
                        /* Grid simples para até 6 variantes */
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                          {modalProduct.variants.edges.map((variant, index) => (
                            <VariantCard 
                              key={variant.node.id}
                              variant={variant.node}
                              isSelected={modalVariant?.id === variant.node.id}
                              onSelect={() => variant.node.availableForSale && setModalVariant(variant.node)}
                              modalProduct={modalProduct}
                            />
                          ))}
                        </div>
                      ) : (
                        /* Carrossel para mais de 6 variantes */
                        <div className="relative">
                          {/* Setas de navegação */}
                          <button
                            onClick={() => setVariantCarouselIndex(prev => Math.max(0, prev - 3))}
                            disabled={variantCarouselIndex === 0}
                            className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
                              variantCarouselIndex === 0 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-white text-gray-800 hover:bg-[#4B014E] hover:text-white hover:scale-110'
                            }`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="15,18 9,12 15,6"></polyline>
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => setVariantCarouselIndex(prev => Math.min(modalProduct.variants.edges.length - 3, prev + 3))}
                            disabled={variantCarouselIndex >= modalProduct.variants.edges.length - 3}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
                              variantCarouselIndex >= modalProduct.variants.edges.length - 3
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-white text-gray-800 hover:bg-[#4B014E] hover:text-white hover:scale-110'
                            }`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="9,18 15,12 9,6"></polyline>
                            </svg>
                          </button>

                          {/* Container do carrossel */}
                          <div className="overflow-hidden rounded-xl">
                            <div 
                              className="grid grid-cols-3 gap-3 transition-transform duration-300 ease-out"
                              style={{
                                transform: `translateX(-${variantCarouselIndex * (100 / 3)}%)`,
                                gridTemplateColumns: `repeat(${modalProduct.variants.edges.length}, minmax(0, 1fr))`,
                                width: `${(modalProduct.variants.edges.length / 3) * 100}%`
                              }}
                            >
                              {modalProduct.variants.edges.map((variant, index) => (
                                <VariantCard 
                                  key={variant.node.id}
                                  variant={variant.node}
                                  isSelected={modalVariant?.id === variant.node.id}
                                  onSelect={() => variant.node.availableForSale && setModalVariant(variant.node)}
                                  modalProduct={modalProduct}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Indicadores */}
                          <div className="flex justify-center mt-4 gap-2">
                            {Array.from({ length: Math.ceil(modalProduct.variants.edges.length / 3) }).map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setVariantCarouselIndex(i * 3)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                  Math.floor(variantCarouselIndex / 3) === i 
                                    ? 'bg-[#4B014E] w-6' 
                                    : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Layout Mobile - Lista Otimizada */}
                    <div className="sm:hidden space-y-3 max-h-60 overflow-y-auto">
                      {modalProduct.variants.edges.map((variant, index) => {
                        const isSelected = modalVariant?.id === variant.node.id;
                        const isAvailable = variant.node.availableForSale;
                        
                        return (
                          <button
                            key={variant.node.id}
                            onClick={() => {
                              if (isAvailable) {
                                setModalVariant(variant.node);
                              }
                            }}
                            disabled={!isAvailable}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                              isSelected 
                                ? 'border-[#4B014E] bg-[#4B014E] bg-opacity-5 shadow-lg' 
                                : isAvailable 
                                  ? 'border-gray-200 hover:border-[#4B014E] hover:bg-gray-50' 
                                  : 'border-gray-200 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            {/* Imagem Mobile - Tamanho Fixo Responsivo */}
                            <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
                              <img
                                src={variant.node.image?.url || modalProduct.image}
                                alt={variant.node.title}
                                className={`w-full h-full object-cover object-center transition-transform duration-300 ${
                                  !isAvailable ? 'grayscale' : ''
                                }`}
                                style={{
                                  objectPosition: 'center center'
                                }}
                                loading="lazy"
                              />
                              
                              {/* Indicador de seleção mobile */}
                              {isSelected && (
                                <div className="absolute top-1 right-1 w-5 h-5 bg-[#4B014E] rounded-full flex items-center justify-center">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                    <polyline points="20,6 9,17 4,12"></polyline>
                                  </svg>
                                </div>
                              )}
                              
                              {/* Indicador de indisponível mobile */}
                              {!isAvailable && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Info da Variante Mobile */}
                            <div className="flex-1 text-left min-w-0">
                              <h5 className={`font-semibold text-base mb-1 line-clamp-1 ${isSelected ? 'text-[#4B014E]' : 'text-gray-900'}`}>
                                {variant.node.title}
                              </h5>
                              <p className={`text-lg font-bold ${isSelected ? 'text-[#4B014E]' : 'text-gray-600'}`}>
                                $ {parseFloat(variant.node.price.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                              {!isAvailable && (
                                <span className="text-sm text-red-500 font-medium">Indisponível</span>
                              )}
                            </div>

                            {/* Seta indicadora mobile */}
                            <div className={`transition-transform duration-300 ${isSelected ? 'rotate-90' : ''}`}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isSelected ? 'text-[#4B014E]' : 'text-gray-400'}>
                                <polyline points="9,18 15,12 9,6"></polyline>
                              </svg>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}                  {/* Descrição do Produto */}
                  {modalProduct.description && (
                    <div className="mb-6">
                      <p className="text-gray-600 leading-relaxed">{modalProduct.description}</p>
                    </div>
                  )}
                </div>

                {/* Ações - Fixas na parte inferior */}
                <div className="p-4 sm:p-6 lg:p-8 pt-0 lg:pt-0 border-t lg:border-t-0 bg-white">
                  <div className="space-y-3">
                  <button
                    className="w-full py-4 bg-gradient-to-r from-[#8A0101] to-[#4B014E] text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl relative overflow-hidden group"
                    onClick={async () => {
                      if (!modalVariant && !modalProduct.price) {
                        alert('Selecione uma variante!');
                        return;
                      }
                      setAddingCart(true);
                      try {
                        const cartItem = {
                          id: modalVariant?.id || modalProduct.id,
                          variantId: modalVariant?.id,
                          name: modalProduct.name,
                          price: modalVariant ? parseFloat(modalVariant.price.amount) : modalProduct.price,
                          image: modalVariant?.image?.url || modalProduct.image,
                          quantity: 1
                        };

                        // Adicionar ao carrinho do Shopify
                        let cartId = localStorage.getItem('shopifyCartId');
                        if (!cartId) {
                          const { data: cartData } = await client.mutate({
                            mutation: gql`
                              mutation { 
                                cartCreate(input: {}) { 
                                  cart { id checkoutUrl } 
                                } 
                              }
                            `,
                          });
                          cartId = cartData.cartCreate.cart.id;
                          localStorage.setItem('shopifyCartId', cartId);
                        }

                        if (modalVariant?.id) {
                          await client.mutate({
                            mutation: gql`
                              mutation ($cartId: ID!, $lines: [CartLineInput!]!) {
                                cartLinesAdd(cartId: $cartId, lines: $lines) {
                                  cart { id checkoutUrl }
                                }
                              }
                            `,
                            variables: {
                              cartId,
                              lines: [{ 
                                merchandiseId: modalVariant.id, 
                                quantity: 1 
                              }],
                            },
                          });
                        }

                        // Adicionar ao carrinho local/Firebase
                        const user = auth.currentUser;
                        if (user) {
                          const cartRef = doc(db, 'carts', user.uid);
                          const cartSnap = await getDoc(cartRef);
                          const existingItems = cartSnap.exists() ? cartSnap.data().items || [] : [];
                          const existingItemIndex = existingItems.findIndex((i) => i.id === cartItem.id);
                          if (existingItemIndex !== -1) {
                            existingItems[existingItemIndex].quantity += 1;
                          } else {
                            existingItems.push(cartItem);
                          }
                          await setDoc(cartRef, { items: existingItems }, { merge: true });
                        } else {
                          const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                          const existingItemIndex = guestCart.findIndex((i) => i.id === cartItem.id);
                          if (existingItemIndex !== -1) {
                            guestCart[existingItemIndex].quantity += 1;
                          } else {
                            guestCart.push(cartItem);
                          }
                          localStorage.setItem('guestCart', JSON.stringify(guestCart));
                        }

                        alert(`${modalProduct.name} adicionado ao carrinho!`);
                        setModalProduct(null);
                      } catch (error) {
                        console.error('Erro ao adicionar ao carrinho:', error);
                        alert('Erro ao adicionar ao carrinho');
                      } finally {
                        setAddingCart(false);
                      }
                    }}
                    disabled={addingCart}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <ShoppingCart size={20} />
                      {addingCart ? 'Adicionando...' : 'Adicionar ao Carrinho'}
                    </span>
                    {/* Efeito shimmer */}
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </button>

                  <button
                    className="w-full py-4 border-2 border-[#4B014E] text-[#4B014E] font-bold rounded-2xl hover:bg-[#4B014E] hover:text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105"
                    onClick={async () => {
                      if (!modalVariant && !modalProduct.price) {
                        alert('Selecione uma variante!');
                        return;
                      }
                      setAddingWishlist(true);
                      try {
                        const wishlistItem = {
                          id: modalVariant?.id || modalProduct.id,
                          variantId: modalVariant?.id,
                          name: modalProduct.name,
                          price: modalVariant ? parseFloat(modalVariant.price.amount) : modalProduct.price,
                          image: modalVariant?.image?.url || modalProduct.image,
                          quantity: 1
                        };

                        const user = auth.currentUser;
                        if (user) {
                          const wishlistRef = doc(db, 'wishlists', user.uid);
                          const wishlistSnap = await getDoc(wishlistRef);
                          const existingItems = wishlistSnap.exists() ? wishlistSnap.data().items || [] : [];
                          const isAlreadyInWishlist = existingItems.some(item => item.id === wishlistItem.id);
                          if (!isAlreadyInWishlist) {
                            await setDoc(wishlistRef, { items: [...existingItems, wishlistItem] }, { merge: true });
                            alert(`${modalProduct.name} adicionado aos favoritos!`);
                          } else {
                            alert(`${modalProduct.name} já está nos favoritos!`);
                          }
                        } else {
                          const guestWishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
                          const isAlreadyInWishlist = guestWishlist.some(item => item.id === wishlistItem.id);
                          if (!isAlreadyInWishlist) {
                            guestWishlist.push(wishlistItem);
                            localStorage.setItem('wishlistItems', JSON.stringify(guestWishlist));
                            alert(`${modalProduct.name} adicionado aos favoritos!`);
                          } else {
                            alert(`${modalProduct.name} já está nos favoritos!`);
                          }
                        }

                        setModalProduct(null);
                      } catch (error) {
                        console.error('Erro ao adicionar aos favoritos:', error);
                        alert('Erro ao adicionar aos favoritos');
                      } finally {
                        setAddingWishlist(false);
                      }
                    }}
                    disabled={addingWishlist}
                  >
                    <span className="flex items-center justify-center gap-3">
                      <Heart size={20} />
                      {addingWishlist ? 'Adicionando...' : 'Adicionar aos Favoritos'}
                    </span>
                  </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="py-12" style={{ backgroundColor: '#1C1C1C' }}>
      <div className="container mx-auto px-4">
        
        {/* Main Layout: Hero + Products */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Hero Banner - Lado Esquerdo */}
          <div className="lg:col-span-5 h-full">
            <div className="relative overflow-hidden w-full h-full min-h-[600px] lg:min-h-[700px] group cursor-pointer">
              <img
                src={heroImage || collections.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop"}
                alt={`${sectionType} promocionais`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(168, 1, 1, 0.3), rgba(75, 1, 78, 0.4))' }} />
              
              {/* Badge 30% OFF */}
              <div className="absolute top-6 left-6">
                <div className="text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2" style={{ backgroundColor: '#A80101' }}>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xs">%</span>
                  </div>
                  30%
                </div>
              </div>

              <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                <h2 className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: '#F3ECE7' }}>
                  {heroTitle || collections.name || 'ARCANE ELEGANCE'}
                </h2>
                <p className="text-base lg:text-lg mb-6" style={{ color: '#F3ECE7' }}>
                  {heroSubtitle || collections.description || 'SHOP OCCASION'}
                </p>
                <button 
                  className="self-start px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#F3ECE7', color: '#1C1C1C' }}
                >
                  {heroButton}
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid - Lado Direito */}
          <div className="lg:col-span-7">
            <div className="space-y-8 h-full min-h-[600px] lg:min-h-[700px]">
              
              {/* Produtos Masculinos */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl lg:text-2xl font-bold" style={{ color: '#F3ECE7' }}>
                    {sectionType.toUpperCase()} {maleLabel}
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => navigateCarousel('male', 'left')}
                      disabled={maleProductIndex === 0}
                      className={`w-8 h-8 rounded-full border transition-all duration-300 flex items-center justify-center ${
                        maleProductIndex === 0 
                          ? 'border-gray-600 text-gray-600 cursor-not-allowed' 
                          : 'text-white hover:scale-110'
                      }`}
                      style={{ 
                        borderColor: maleProductIndex === 0 ? '#666' : '#A80101',
                        backgroundColor: maleProductIndex === 0 ? 'transparent' : '#A80101'
                      }}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => navigateCarousel('male', 'right')}
                      disabled={maleProductIndex >= maxMaleIndex}
                      className={`w-8 h-8 rounded-full border transition-all duration-300 flex items-center justify-center ${
                        maleProductIndex >= maxMaleIndex 
                          ? 'border-gray-600 text-gray-600 cursor-not-allowed' 
                          : 'text-white hover:scale-110'
                      }`}
                      style={{ 
                        borderColor: maleProductIndex >= maxMaleIndex ? '#666' : '#A80101',
                        backgroundColor: maleProductIndex >= maxMaleIndex ? 'transparent' : '#A80101'
                      }}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {maleCollections.slice(maleProductIndex, maleProductIndex + itemsPerView).map(collection => (
                    <div key={collection.id}>
                      <h4 className="text-sm lg:text-lg font-semibold text-white mb-2 line-clamp-1 min-h-[1.2rem] lg:min-h-[1.5rem]" title={collection.name}>{collection.name}</h4>
                      <CollectionCard collection={collection} setModalProduct={setModalProduct} setModalVariant={setModalVariant} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Produtos Femininos */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl lg:text-2xl font-bold" style={{ color: '#F3ECE7' }}>
                    {sectionType.toUpperCase()} {femaleLabel}
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => navigateCarousel('female', 'left')}
                      disabled={femaleProductIndex === 0}
                      className={`w-8 h-8 rounded-full border transition-all duration-300 flex items-center justify-center ${
                        femaleProductIndex === 0 
                          ? 'border-gray-600 text-gray-600 cursor-not-allowed' 
                          : 'text-white hover:scale-110'
                      }`}
                      style={{ 
                        borderColor: femaleProductIndex === 0 ? '#666' : '#4B014E',
                        backgroundColor: femaleProductIndex === 0 ? 'transparent' : '#4B014E'
                      }}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => navigateCarousel('female', 'right')}
                      disabled={femaleProductIndex >= maxFemaleIndex}
                      className={`w-8 h-8 rounded-full border transition-all duration-300 flex items-center justify-center ${
                        femaleProductIndex >= maxFemaleIndex 
                          ? 'border-gray-600 text-gray-600 cursor-not-allowed' 
                          : 'text-white hover:scale-110'
                      }`}
                      style={{ 
                        borderColor: femaleProductIndex >= maxFemaleIndex ? '#666' : '#4B014E',
                        backgroundColor: femaleProductIndex >= maxFemaleIndex ? 'transparent' : '#4B014E'
                      }}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {femaleCollections.slice(femaleProductIndex, femaleProductIndex + itemsPerView).map(collection => (
                    <div key={collection.id}>
                      <h4 className="text-sm lg:text-lg font-semibold text-white mb-2 line-clamp-1 min-h-[1.2rem] lg:min-h-[1.5rem]" title={collection.name}>{collection.name}</h4>
                      <CollectionCard collection={collection} setModalProduct={setModalProduct} setModalVariant={setModalVariant} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div> {/* Fim do .grid lg:grid-cols-12 ... */}
      </div> {/* Fim do .container mx-auto px-4 */}
    </section>
  );
};

const ProductCarousel = ({ products = [], setModalProduct, setModalVariant }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  // Detectar tamanho da tela e ajustar itemsPerView
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerView(1); // Mobile: 1 item
      } else if (width < 1024) {
        setItemsPerView(2); // Tablet: 2 itens
      } else {
        setItemsPerView(3); // Desktop: 3 itens
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calcular maxIndex corretamente - número de páginas possíveis
  const totalPages = Math.ceil(products.length / itemsPerView);
  const maxIndex = Math.max(0, totalPages - 1);

  const goTo = (dir) => {
    setCurrentIndex((prev) => {
      if (dir === 'left') {
        return Math.max(0, prev - 1);
      } else {
        return Math.min(maxIndex, prev + 1);
      }
    });
  };

  // Auto-play
  useEffect(() => {
    if (products.length <= itemsPerView) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= maxIndex) {
          return 0;
        }
        return prev + 1;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [products.length, itemsPerView, maxIndex]);

  // Reset index quando produtos mudam
  useEffect(() => {
    setCurrentIndex(0);
  }, [products]);

  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nenhum produto disponível</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Setas de navegação */}
      {products.length > itemsPerView && (
        <>
          <button 
            onClick={() => goTo('left')} 
            disabled={currentIndex === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 
                     bg-white/90 backdrop-blur-sm text-gray-800 
                     w-10 h-10 rounded-full shadow-lg
                     hover:bg-[#8A0101] hover:text-white hover:scale-110
                     transition-all duration-300 ease-out
                     opacity-0 group-hover:opacity-100
                     flex items-center justify-center
                     border border-gray-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Produto anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => goTo('right')}
            disabled={currentIndex >= maxIndex}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 
                     bg-white/90 backdrop-blur-sm text-gray-800 
                     w-10 h-10 rounded-full shadow-lg
                     hover:bg-[#8A0101] hover:text-white hover:scale-110
                     transition-all duration-300 ease-out
                     opacity-0 group-hover:opacity-100
                     flex items-center justify-center
                     border border-gray-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Próximo produto"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Container do carrossel */}
      <div className="overflow-hidden rounded-xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {/* Criar páginas de produtos */}
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div 
              key={pageIndex}
              className="flex gap-4 flex-shrink-0"
              style={{ width: '100%' }}
            >
              {products
                .slice(pageIndex * itemsPerView, (pageIndex + 1) * itemsPerView)
                .map((product, idx) => (
                <div
                  key={product.id || `${pageIndex}-${idx}`}
                  className="flex-1"
                  style={{ 
                    minWidth: `${100 / itemsPerView}%`
                  }}
                >
                  <div
                    className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer 
                             hover:shadow-xl hover:scale-[1.02] 
                             transition-all duration-300 ease-out
                             border border-gray-100
                             h-full flex flex-col"
                    onClick={() => {
                      setModalProduct?.(product);
                      setModalVariant?.(product.variants?.edges?.[0]?.node);
                    }}
                  >
                    {/* ...existing code... */}
                    <div className="relative overflow-hidden bg-gray-50">
                      <img 
                        src={product.image || '/api/placeholder/300/300'} 
                        alt={product.name || 'Produto'} 
                        className="w-full h-48 sm:h-52 lg:h-56 object-cover
                                 hover:scale-110 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                      {product.tags?.includes('novo') && (
                        <div className="absolute top-2 left-2 bg-[#8A0101] text-white text-xs px-2 py-1 rounded-full font-medium">
                          Novo
                        </div>
                      )}
                      {product.discount && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          -{product.discount}%
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-2 
                                     line-clamp-2 leading-tight">
                          {product.name || 'Nome do produto'}
                        </h4>
                        
                        {product.category && (
                          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                            {product.category}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            {product.originalPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                $ {product.originalPrice.toLocaleString('pt-BR', { 
                                  minimumFractionDigits: 2 
                                })}
                              </span>
                            )}
                            <span className="text-lg font-bold text-[#8A0101]">
                              $ {(product.price || 0).toLocaleString('pt-BR', { 
                                minimumFractionDigits: 2 
                              })}
                            </span>
                          </div>
                        </div>

                        {product.rating && (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span 
                                key={i} 
                                className={`text-xs ${
                                  i < Math.floor(product.rating) 
                                    ? 'text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="text-xs text-gray-500 ml-1">
                              ({product.reviewCount || 0})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Indicadores de posição */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentIndex 
                  ? 'bg-[#8A0101] w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ir para página ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CollectionModal = ({ collection, isOpen, onClose }) => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Suporte a ambos: kits mockados (items) e coleções Shopify (products)
  const items = Array.isArray(collection.items) && collection.items.length > 0
    ? collection.items
    : Array.isArray(collection.products) && collection.products.length > 0
      ? collection.products
      : [];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navigateItem = (direction) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    if (direction === 'next') {
      setCurrentItemIndex((prev) => prev === items.length - 1 ? 0 : prev + 1);
    } else {
      setCurrentItemIndex((prev) => prev === 0 ? items.length - 1 : prev - 1);
    }
  };

  if (!isOpen) return null;

  const currentItem = items[currentItemIndex];

  // Funções para adicionar ao carrinho e wishlist
  const handleAddToCart = async () => {
    if (items.length > 1) {
      await addKitToCart({ ...collection, items });
    } else if (currentItem && currentItem.variants && currentItem.variants.edges && currentItem.variants.edges.length > 0) {
      // Produto individual com variantes
      const variant = currentItem.variants.edges[0].node;
      await addToCart({
        variantId: variant.id,
        name: currentItem.name,
        price: parseFloat(variant.price.amount),
        image: currentItem.image,
        quantity: 1
      });
    } else if (currentItem) {
      // Produto individual sem variantes
      await addToCart({
        variantId: currentItem.variantId || currentItem.id,
        name: currentItem.name,
        price: parseFloat(currentItem.price),
        image: currentItem.image,
        quantity: 1
      });
    }
  };
  const handleAddToWishlist = async () => {
    if (items.length > 1) {
      await addKitToWishlist({ ...collection, items });
    } else if (currentItem && currentItem.variants && currentItem.variants.edges && currentItem.variants.edges.length > 0) {
      const variant = currentItem.variants.edges[0].node;
      await addToWishlist({
        variantId: variant.id,
        name: currentItem.name,
        price: parseFloat(variant.price.amount),
        image: currentItem.image,
        quantity: 1
      });
    } else if (currentItem) {
      await addToWishlist({
        variantId: currentItem.variantId || currentItem.id,
        name: currentItem.name,
        price: parseFloat(currentItem.price),
        image: currentItem.image,
        quantity: 1
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)' }}
      />
      {/* Modal */}
      <div className="relative w-full max-w-2xl xl:max-w-4xl max-h-[95vh] bg-white shadow-2xl overflow-hidden rounded-lg flex flex-col md:flex-row">
        {/* Main Item Display */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 min-w-0">
          {/* Navigation Arrows */}
          {items.length > 1 && (
            <>
              <button
                onClick={() => navigateItem('prev')}
                className="absolute left-2 md:left-6 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{ color: '#4B014E' }}
              >
                <ArrowLeft size={18} />
              </button>
              <button
                onClick={() => navigateItem('next')}
                className="absolute right-2 md:right-6 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{ color: '#4B014E' }}
              >
                <ArrowRight size={18} />
              </button>
            </>
          )}
          {/* Current Item */}
          <div className="flex flex-col items-center w-full">
            <div className="relative mb-4 w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80">
              <img
                src={currentItem.image}
                alt={currentItem.name}
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg" style={{ backgroundColor: '#4B014E' }}>{currentItemIndex + 1}</div>
            </div>
            <div className="text-center px-2 md:px-4">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 line-clamp-2" style={{ color: '#1C1C1C' }}>{currentItem.name}</h3>
              <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-xs md:text-sm font-medium" style={{ color: '#1C1C1C' }}>{typeof currentItem.rating === 'number' ? currentItem.rating.toFixed(1) : (parseFloat(currentItem.rating) || '--')}</span>
                </div>
                <span className="text-gray-400 hidden sm:inline">•</span>
                <span className="text-xs md:text-sm font-medium" style={{ color: '#1C1C1C' }}>
                  {currentItem.price !== undefined ? `$ ${Number(currentItem.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '--'}
                </span>
              </div>
              <span className="text-xs text-gray-500">Item {currentItemIndex + 1} de {items.length}</span>
            </div>
          </div>
        </div>
        {/* Sidebar: Lista de Itens */}
        <div className="w-full md:w-80 xl:w-96 bg-white border-t md:border-t-0 md:border-l border-gray-100 flex flex-col max-h-80 md:max-h-none">
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4" style={{ color: '#1C1C1C' }}>Todos os Itens</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {items.map((item, index) => (
                <button
                  key={item.id || index}
                  onClick={() => setCurrentItemIndex(index)}
                  className={`relative group aspect-square rounded-lg sm:rounded-xl overflow-hidden transition-all duration-200 ${index === currentItemIndex ? 'ring-2 ring-[#4B014E] scale-105 shadow-lg' : 'hover:scale-105 hover:shadow-md'}`}
                >
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  {/* Overlay */}
                  <div className={`absolute inset-0 transition-opacity duration-200 ${index === currentItemIndex ? 'bg-purple-900/20' : 'bg-black/0 group-hover:bg-black/20'}`} />
                  {/* Item number */}
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#4B014E' }}>{index + 1}</div>
                  {/* Name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                    <p className="text-white text-xs font-medium truncate">{item.name}</p>
                  </div>
                  {/* Price & Rating */}
                  <div className="absolute bottom-1 left-1 bg-white/80 rounded px-1 py-0.5 flex items-center gap-1">
                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-[10px] font-bold text-[#4B014E]">{typeof item.rating === 'number' ? item.rating.toFixed(1) : (parseFloat(item.rating) || '--')}</span>
                    <span className="text-[10px] text-[#1C1C1C]">$ {item.price !== undefined ? Number(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '--'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {/* Action Buttons */}
          <div className="p-3 sm:p-4 border-t border-gray-100 space-y-2 sm:space-y-3">
            <button
              className="w-full py-3 sm:py-4 text-sm sm:text-base font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden group rounded-lg sm:rounded-xl"
              style={{ background: 'linear-gradient(135deg, #4B014E 0%, #6B0261 50%, #4B014E 100%)', boxShadow: '0 4px 20px rgba(75, 1, 78, 0.3)' }}
              onClick={handleAddToCart}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px]" />
                ADICIONAR COLEÇÃO
              </span>
              <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
            <button
              className="w-full py-3 sm:py-4 text-sm sm:text-base font-bold rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 border-2 hover:shadow-lg"
              style={{ color: '#4B014E', borderColor: '#4B014E', backgroundColor: 'transparent' }}
              onClick={handleAddToWishlist}
            >
              <span className="flex items-center justify-center gap-2">
                <Heart size={16} className="sm:w-[18px] sm:h-[18px]" />
                ADICIONAR AOS FAVORITOS
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const VariantCard = ({ variant, isSelected, onSelect, modalProduct }) => {
  const isAvailable = variant.availableForSale;
  
  return (
    <button
      onClick={onSelect}
      disabled={!isAvailable}
      className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
        isSelected 
          ? 'border-[#4B014E] ring-2 ring-[#4B014E] ring-opacity-30 shadow-lg scale-105' 
          : isAvailable 
            ? 'border-gray-200 hover:border-[#4B014E] hover:shadow-md hover:scale-102' 
            : 'border-gray-200 opacity-50 cursor-not-allowed'
      }`}
    >
      {/* Imagem da Variante - Redimensionamento Aprimorado */}
      <div className="aspect-square relative overflow-hidden bg-gray-50">
        <img
          src={variant.image?.url || modalProduct.image}
          alt={variant.title}
          className={`w-full h-full object-cover object-center transition-all duration-300 ${
            isAvailable ? 'group-hover:scale-110' : 'grayscale'
          }`}
          style={{
            objectPosition: 'center center',
            imageRendering: 'crisp-edges'
          }}
          loading="lazy"
        />
        
        {/* Overlay para variante selecionada */}
        {isSelected && (
          <div className="absolute inset-0 bg-[#4B014E] bg-opacity-10 flex items-center justify-center">
            <div className="w-8 h-8 bg-[#4B014E] rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            </div>
          </div>
        )}
        
        {/* Indicador de indisponível */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">Indisponível</span>
          </div>
        )}
        
        {/* Badge de desconto da variante */}
        {variant.compareAtPrice?.amount && parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount) && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
            -{Math.round(((parseFloat(variant.compareAtPrice.amount) - parseFloat(variant.price.amount)) / parseFloat(variant.compareAtPrice.amount)) * 100)}%
          </div>
        )}
      </div>

      {/* Info da Variante */}
      <div className="p-3">
        <h5 className={`font-semibold text-sm mb-1 line-clamp-2 ${isSelected ? 'text-[#4B014E]' : 'text-gray-900'}`}>
          {variant.title}
        </h5>
        <div className="flex flex-col">
          {variant.compareAtPrice?.amount && parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount) && (
            <span className="text-xs text-gray-400 line-through">
              $ {parseFloat(variant.compareAtPrice.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          )}
          <p className={`text-sm font-bold ${isSelected ? 'text-[#4B014E]' : 'text-gray-600'}`}>
            $ {parseFloat(variant.price.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Animação de seleção */}
      <div className={`absolute inset-0 border-2 border-[#4B014E] rounded-2xl transition-opacity duration-300 ${
        isSelected ? 'opacity-100' : 'opacity-0'
      }`} />
    </button>
  );
};

const CollectionCard = ({ collection, sectionType }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleItemView = () => setShowModal(true);

  // Suporte a ambos: kits mockados (items) e coleções Shopify (products)
  const items = Array.isArray(collection.items) && collection.items.length > 0
    ? collection.items
    : Array.isArray(collection.products) && collection.products.length > 0
      ? collection.products
      : [];

  const hasItems = items.length > 0;

  // Calcular média dos ratings dos produtos da coleção
  const ratings = items
    .map(item => typeof item.rating === 'number' ? item.rating : parseFloat(item.rating))
    .filter(r => !isNaN(r));
  const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : null;

  // Calcular valor total da coleção
  const totalPrice = items
    .map(item => typeof item.price === 'number' ? item.price : parseFloat(item.price))
    .filter(p => !isNaN(p))
    .reduce((a, b) => a + b, 0);

  return (
    <>
      <div className="relative">
        <div
          className="bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
          onMouseEnter={() => !isMobile && setIsHovered(true)}
          onMouseLeave={() => !isMobile && setIsHovered(false)}
          style={{ backgroundColor: '#F3ECE7' }}
        >
          {/* Ícones no topo */}
          <div className="relative">
            {/* Ícone coração */}
            <div className="absolute top-2 right-2 z-10">
              <button
                className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:text-white transition-all duration-200 hover:scale-110 shadow-sm"
                onMouseEnter={(e) => e.target.style.backgroundColor = '#A80101'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.9)'}
              >
                <Heart size={12} />
              </button>
            </div>

            {/* Ícone visualizar itens */}
            {hasItems && (
              <div className="absolute top-2 left-2 z-10">
                <button
                  onClick={handleItemView}
                  className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:text-white transition-all duration-200 hover:scale-110 shadow-sm"
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#4B014E'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.9)'}
                >
                  <Eye size={12} />
                </button>
              </div>
            )}

            {/* Badge de quantidade de itens */}
            {hasItems && (
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
                <div 
                  className="px-2 py-1 rounded-full text-white text-xs font-bold shadow-sm"
                  style={{ backgroundColor: '#4B014E' }}
                >
                  {items.length} itens
                </div>
              </div>
            )}

            {/* Imagem da coleção */}
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={collection.image}
                alt={collection.name}
                className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
              />
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="p-3">
            <h4 className="font-semibold text-sm mb-2 line-clamp-1 min-h-[1.25rem]" style={{ color: '#1C1C1C' }}>
              {collection.name}
            </h4>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-1">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium" style={{ color: '#1C1C1C' }}>
                {avgRating !== null ? avgRating.toFixed(1) : '--'}
              </span>
            </div>

            {/* Valor total da coleção */}
            {hasItems && (
              <div className="text-xs text-gray-600 mb-1">
                Total: $ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}

            {/* Faixa de preço (mantido caso queira usar) */}
            {collection.priceRange && (
              <div className="text-sm font-bold" style={{ color: '#1C1C1C' }}>
                {collection.priceRange}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <CollectionModal 
        collection={{ ...collection, items }}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default ProductSection;