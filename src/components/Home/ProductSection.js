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
  sectionType = 'collections',
  heroImage,
  heroTitle,  
  heroSubtitle,
  heroButton = 'SHOP NOW',
  maleLabel = 'MALE',
  femaleLabel = 'FEMALE',
}) => {
  // Estados do modal global de produto individual (devem estar dentro do componente)
  const [modalProduct, setModalProduct] = useState(null);
  const [modalVariant, setModalVariant] = useState(null);
  const [addingCart, setAddingCart] = useState(false);
  const [addingWishlist, setAddingWishlist] = useState(false);
  const [variantCarouselIndex, setVariantCarouselIndex] = useState(0);
  const [notification, setNotification] = useState(null); // {type: 'success'|'error', message: string}

  const [maleProductIndex, setMaleProductIndex] = useState(0);
  const [femaleProductIndex, setFemaleProductIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  // Auto-remove notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Atualizar itemsPerView baseado no tamanho da tela - otimizado para 4K
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setItemsPerView(2);          // Mobile/tablet
      } else if (width < 1440) {
        setItemsPerView(4);          // Desktop padrão
      } else if (width < 1920) {
        setItemsPerView(5);          // Telas grandes
      } else if (width < 2560) {
        setItemsPerView(6);          // Telas muito grandes
      } else {
        setItemsPerView(7);          // 4K e superiores
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Auto-selecionar primeira variante disponível quando modal abre
  useEffect(() => {
    if (modalProduct && Array.isArray(modalProduct.variants) && modalProduct.variants.length > 0) {
      const firstAvailableVariant = modalProduct.variants.find(
        variant => variant.availableForSale
      );
      
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
        <div className="container mx-auto px-4 md:px-6 xl:px-8 3xl:px-10 4xl:px-12 5xl:px-16 max-w-screen-xl 3xl:max-w-screen-2xl 4xl:max-w-2k 5xl:max-w-4k">
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
            
            {/* Notification */}
            {notification && (
              <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
                notification.type === 'success' 
                  ? 'bg-green-500 text-white' 
                  : notification.type === 'warning'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                <div className="flex items-center gap-2">
                  {notification.type === 'success' ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                  ) : notification.type === 'warning' ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                      <path d="M12 9v4"/>
                      <path d="m12 17 .01 0"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                  )}
                  <span className="font-medium">{notification.message}</span>
                </div>
              </div>
            )}
            
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
                            {modalProduct.rating.toFixed(1)} ({modalProduct.reviewCount || 0} reviews)
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
                {Array.isArray(modalProduct.variants) && modalProduct.variants.length > 1 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Choose an option:</h4>
                    
                    {/* Layout Desktop - Carrossel para muitas variantes, Grid para poucas */}
                    <div className="hidden sm:block">
                      {modalProduct.variants.length <= 6 ? (
                        /* Grid simples para até 6 variantes */
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                          {modalProduct.variants.map((variant, index) => (
                            <VariantCard 
                              key={variant.id}
                              variant={variant}
                              isSelected={modalVariant?.id === variant.id}
                              onSelect={() => variant.availableForSale && setModalVariant(variant)}
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
                            onClick={() => setVariantCarouselIndex(prev => Math.min(modalProduct.variants.length - 3, prev + 3))}
                            disabled={variantCarouselIndex >= modalProduct.variants.length - 3}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
                              variantCarouselIndex >= modalProduct.variants.length - 3
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
                                gridTemplateColumns: `repeat(${modalProduct.variants.length}, minmax(0, 1fr))`,
                                width: `${(modalProduct.variants.length / 3) * 100}%`
                              }}
                            >
                              {modalProduct.variants.map((variant, index) => (
                                <VariantCard 
                                  key={variant.id}
                                  variant={variant}
                                  isSelected={modalVariant?.id === variant.id}
                                  onSelect={() => variant.availableForSale && setModalVariant(variant)}
                                  modalProduct={modalProduct}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Indicadores */}
                          <div className="flex justify-center mt-4 gap-2">
                            {Array.from({ length: Math.ceil(modalProduct.variants.length / 3) }).map((_, i) => (
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
                      {modalProduct.variants.map((variant, index) => {
                        const isSelected = modalVariant?.id === variant.id;
                        const isAvailable = variant.availableForSale;
                        
                        return (
                          <button
                            key={variant.id}
                            onClick={() => {
                              if (isAvailable) {
                                setModalVariant(variant);
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
                                src={variant.image?.url || modalProduct.image}
                                alt={variant.title}
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
                                {variant.title}
                              </h5>
                              <p className={`text-lg font-bold ${isSelected ? 'text-[#4B014E]' : 'text-gray-600'}`}>
                                $ {parseFloat(variant.price.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                              {!isAvailable && (
                                <span className="text-sm text-red-500 font-medium">Unavailable</span>
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
                )}                  
                {/* Descrição do Produto */}
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
                        setNotification({ type: 'error', message: 'Please select a variant!' });
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

                        alert(`${modalProduct.name} added to cart!`);
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
                      {addingCart ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <ShoppingCart size={20} />
                      )}
                      {addingCart ? 'Adding to Cart...' : 'Add to Cart'}
                    </span>
                    {/* Efeito shimmer */}
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </button>

                  <button
                    className="w-full py-4 border-2 border-[#4B014E] text-[#4B014E] font-bold rounded-2xl hover:bg-[#4B014E] hover:text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105"
                    onClick={async () => {
                      if (!modalVariant && !modalProduct.price) {
                        setNotification({ type: 'error', message: 'Please select a variant!' });
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
                            alert(`${modalProduct.name} added to wishlist!`);
                          } else {
                            alert(`${modalProduct.name} is already in wishlist!`);
                          }
                        } else {
                          const guestWishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
                          const isAlreadyInWishlist = guestWishlist.some(item => item.id === wishlistItem.id);
                          if (!isAlreadyInWishlist) {
                            guestWishlist.push(wishlistItem);
                            localStorage.setItem('wishlistItems', JSON.stringify(guestWishlist));
                            alert(`${modalProduct.name} added to wishlist!`);
                          } else {
                            alert(`${modalProduct.name} is already in wishlist!`);
                          }
                        }

                        setModalProduct(null);
                      } catch (error) {
                        console.error('Erro ao adicionar aos favoritos:', error);
                        alert('Error adding to wishlist');
                      } finally {
                        setAddingWishlist(false);
                      }
                    }}
                    disabled={addingWishlist}
                  >
                    <span className="flex items-center justify-center gap-3">
                      {addingWishlist ? (
                        <div className="w-5 h-5 border-2 border-[#4B014E] border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Heart size={20} />
                      )}
                      {addingWishlist ? 'Adding to Wishlist...' : 'Add to Wishlist'}
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
      <div className="container mx-auto px-4 md:px-6 xl:px-8 3xl:px-10 4xl:px-12 5xl:px-16 max-w-screen-xl 3xl:max-w-screen-2xl 4xl:max-w-2k 5xl:max-w-4k">
        
        {/* Main Layout: Hero + Products */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Hero Banner - Lado Esquerdo */}
          <div className="lg:col-span-5 h-full">
            <div className="relative overflow-hidden w-full h-full min-h-[600px] lg:min-h-[700px] group cursor-pointer">
              <img
                src={heroImage || collections.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop"}
                alt={`${sectionType} promo`}
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
                      setModalVariant?.(product.variants?.[0]);
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
                        {/* Nome da variante padrão */}
                        {product.variants?.[0]?.title && (
                          <span className="text-xs text-[#4B014E] font-medium">
                            {product.variants[0].title}
                          </span>
                        )}
                        
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
  // Suporte a ambos: kits mockados (items) e coleções Shopify (products) - DEVE VIR PRIMEIRO
  const items = Array.isArray(collection.items) && collection.items.length > 0
    ? collection.items
    : Array.isArray(collection.products) && collection.products.length > 0
      ? collection.products
      : [];

  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Map()); // Map<itemId, {item, selectedVariant}>
  const [showVariantSelector, setShowVariantSelector] = useState(null); // ID do item para mostrar seletor
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [notification, setNotification] = useState(null); // {type: 'success'|'error', message: string}
  const [isMobile, setIsMobile] = useState(false);
  
  // Estados para seleção de variantes
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeItemForVariants, setActiveItemForVariants] = useState(null);
  
  // Estados para lógica de desconto
  const [discountInfo, setDiscountInfo] = useState({
    percentage: collection.discountPercentage || 20, // Pode vir dos metafields do Shopify
    minItemsForDiscount: collection.minItemsForDiscount || Math.max(1, items.length - 1),
    isActive: false,
    originalTotal: 0,
    discountedTotal: 0
  });

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Inicializar com todos os itens selecionados (primeira variante disponível)
  useEffect(() => {
    if (isOpen && items.length > 0) {
      const initialSelection = new Map();
      items.forEach(item => {
        // Buscar primeira variante disponível
        const availableVariant = item.variants?.find(variant => 
          variant.availableForSale !== false
        );
        
        const firstVariant = availableVariant || item.variants?.[0] || null;
        
        if (firstVariant) {
          initialSelection.set(item.id, {
            item,
            selectedVariant: firstVariant
          });
        }
      });
      setSelectedItems(initialSelection);
      // Reset outros estados quando modal abre
      setShowVariantSelector(null);
      setCurrentItemIndex(0);
    }
  }, [isOpen, items]);

  // Auto-remove notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Funções para gerenciar seleção
  const toggleItemSelection = (item) => {
    const newSelection = new Map(selectedItems);
    const wasSelected = newSelection.has(item.id);
    
    if (wasSelected) {
      newSelection.delete(item.id);
      
      // Verificar se perdeu o desconto
      const newCount = newSelection.size;
      const minForDiscount = collection.minItemsForDiscount || (items?.length - 1) || 1;
      const hadDiscount = selectedItems.size >= minForDiscount;
      const willHaveDiscount = newCount >= minForDiscount;
      
      if (hadDiscount && !willHaveDiscount) {
        setNotification({ 
          type: 'warning', 
          message: `Collection discount removed! Add more items to get ${collection.discountPercentage || 20}% off` 
        });
      }
    } else {
      // Buscar primeira variante disponível
      const availableVariant = item.variants?.find(variant => 
        variant.availableForSale !== false
      );
      
      const firstVariant = availableVariant || item.variants?.[0] || null;
      
      newSelection.set(item.id, {
        item,
        selectedVariant: firstVariant
      });
      
      // Verificar se ganhou o desconto
      const newCount = newSelection.size;
      const minForDiscount = collection.minItemsForDiscount || (items?.length - 1) || 1;
      const hadDiscount = selectedItems.size >= minForDiscount;
      const willHaveDiscount = newCount >= minForDiscount;
      
      if (!hadDiscount && willHaveDiscount) {
        setNotification({ 
          type: 'success', 
          message: `Collection discount activated! ${collection.discountPercentage || 20}% off your bundle` 
        });
      }
    }
    setSelectedItems(newSelection);
  };

  const updateVariantSelection = (itemId, variant) => {
    const newSelection = new Map(selectedItems);
    const existingSelection = newSelection.get(itemId);
    if (existingSelection) {
      newSelection.set(itemId, {
        ...existingSelection,
        selectedVariant: variant
      });
      setSelectedItems(newSelection);
    }
    setShowVariantSelector(null);
  };

  // Calcular totais e lógica de desconto
  const selectedItemsArray = Array.from(selectedItems.values());
  
  // Calcula preço total atual
  const totalPrice = selectedItemsArray.reduce((sum, selection) => {
    const price = selection.selectedVariant?.price?.amount 
      ? parseFloat(selection.selectedVariant.price.amount)
      : selection.item.price || 0;
    return sum + price;
  }, 0);

  // Calcula preço original (compareAt)
  const totalOriginalPrice = selectedItemsArray.reduce((sum, selection) => {
    const comparePrice = selection.selectedVariant?.compareAtPrice?.amount 
      ? parseFloat(selection.selectedVariant.compareAtPrice.amount)
      : selection.item.originalPrice || 0;
    
    const regularPrice = selection.selectedVariant?.price?.amount 
      ? parseFloat(selection.selectedVariant.price.amount)
      : selection.item.price || 0;
    
    return sum + (comparePrice > regularPrice ? comparePrice : regularPrice);
  }, 0);

  // Lógica de desconto de coleção
  const selectedCount = selectedItems.size;
  const minItemsForDiscount = collection.minItemsForDiscount || (items?.length - 1) || 1;
  const discountPercentage = collection.discountPercentage || 20;
  
  const isCollectionDiscountActive = selectedCount >= minItemsForDiscount;
  const collectionDiscountAmount = isCollectionDiscountActive ? (totalPrice * discountPercentage / 100) : 0;
  const finalTotalWithCollectionDiscount = totalPrice - collectionDiscountAmount;
  
  // Economia normal (compareAt vs price) + desconto de coleção
  const regularSavings = totalOriginalPrice > totalPrice ? totalOriginalPrice - totalPrice : 0;
  const totalSavings = regularSavings + collectionDiscountAmount;

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
    if (selectedItems.size === 0) {
      setNotification({ type: 'error', message: 'Please select at least one item to add to cart' });
      return;
    }

    setIsAddingToCart(true);
    try {
      if (selectedItems.size === 1) {
        const selection = Array.from(selectedItems.values())[0];
        const item = selection.item;
        const variant = selection.selectedVariant;
        // Sempre envia o variantId selecionado!
        await addToCart({
          variantId: variant.id,
          name: item.name || item.title,
          price: parseFloat(variant.price.amount),
          image: variant.image?.url || item.image,
          quantity: 1
        });
      } else {
        // Preparar kit com informações de desconto
        const customKit = {
          ...collection,
          items: selectedItemsArray.map(selection => ({
            ...selection.item,
            variantId: selection.selectedVariant.id,
            selectedVariant: selection.selectedVariant
          })),
          // Usar código de desconto fixo e simples
          hasCollectionDiscount: isCollectionDiscountActive,
          discountPercentage: discountPercentage,
          discountCode: isCollectionDiscountActive ? 'COLLECTION20' : null, // Código fixo criado no Shopify
          minItemsForDiscount: minItemsForDiscount
        };
        await addKitToCart(customKit);
      }
      setNotification({ 
        type: 'success', 
        message: `${selectedItems.size} item(s) successfully added to cart!${isCollectionDiscountActive ? ` Collection discount applied!` : ''}` 
      });
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setNotification({ type: 'error', message: 'Error adding to cart. Please try again.' });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (selectedItems.size === 0) {
      setNotification({ type: 'error', message: 'Please select at least one item to add to wishlist' });
      return;
    }

    setIsAddingToWishlist(true);
    try {
      // Para cada item selecionado, adicionar diretamente à wishlist com a variante já escolhida
      for (const [itemId, selection] of selectedItems) {
        const item = selection.item;
        const variant = selection.selectedVariant;
        
        // Criar item da wishlist com dados completos
        const wishlistItem = {
          id: `wishlist_${Date.now()}_${Math.random()}`, // ID único para wishlist
          productId: item.id,
          variantId: variant.id,
          name: item.name || item.title,
          variantTitle: variant.title,
          price: parseFloat(variant.price.amount),
          image: variant.image?.url || item.image || "https://via.placeholder.com/400x400",
          selectedOptions: variant.selectedOptions || [],
          addedAt: new Date().toISOString(),
        };

        const user = auth.currentUser;
        if (user) {
          const wishlistRef = doc(db, 'wishlists', user.uid);
          const wishlistSnap = await getDoc(wishlistRef);
          const existingItems = wishlistSnap.exists() ? wishlistSnap.data().items || [] : [];

          // Verificar se já existe (baseado no variantId)
          const isAlreadyInWishlist = existingItems.some(existingItem => existingItem.variantId === variant.id);

          if (!isAlreadyInWishlist) {
            await setDoc(wishlistRef, { items: [...existingItems, wishlistItem] }, { merge: true });
          }
        } else {
          // Para visitantes, usar localStorage
          const guestWishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
          const isAlreadyInWishlist = guestWishlist.some(existingItem => existingItem.variantId === variant.id);

          if (!isAlreadyInWishlist) {
            guestWishlist.push(wishlistItem);
            localStorage.setItem('wishlistItems', JSON.stringify(guestWishlist));
          }
        }
      }
      
      setNotification({ 
        type: 'success', 
        message: `${selectedItems.size} item(s) successfully added to wishlist!` 
      });
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      setNotification({ type: 'error', message: 'Error adding to wishlist. Please try again.' });
    } finally {
      setIsAddingToWishlist(false);
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
      
      {/* Modal - Layout responsivo */}
      <div className={`relative w-full bg-white shadow-2xl overflow-hidden rounded-2xl flex flex-col ${
        isMobile 
          ? 'max-w-sm h-[95vh]' 
          : 'max-w-6xl max-h-[95vh]'
      }`}>
        
        {/* Notification */}
        {notification && (
          <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : notification.type === 'warning'
              ? 'bg-yellow-500 text-white'
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              ) : notification.type === 'warning' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                  <path d="M12 9v4"/>
                  <path d="m12 17 .01 0"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className={`flex justify-between items-center border-b border-gray-200 ${
          isMobile ? 'p-4' : 'p-6'
        }`}>
          <div className="flex-1">
            <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
              {collection.name}
            </h2>
            <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
              Select the items you want to add
            </p>
            
            {/* Collection Discount Info - SOMENTE NO DESKTOP */}
            {!isMobile && selectedItems.size > 0 && (
              <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                {isCollectionDiscountActive ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎉</span>
                    <div>
                      <div className="text-sm font-medium text-purple-700">
                        Collection Bundle Discount Active!
                      </div>
                      <div className="text-xs text-purple-600">
                        {discountPercentage}% off when you buy {minItemsForDiscount}+ items
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    <div>
                      <div className="text-sm font-medium text-gray-600">
                        Bundle Discount Available
                      </div>
                      <div className="text-xs text-gray-500">
                        Add {minItemsForDiscount - selectedItems.size} more item{minItemsForDiscount - selectedItems.size > 1 ? 's' : ''} to get {discountPercentage}% off
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110 ml-4"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Main Content - Layout adaptativo */}
        {isMobile ? (
          /* Layout Mobile - Vertical */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Item Navigation */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Item {currentItemIndex + 1} of {items.length}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigateItem('prev')}
                    className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                  </button>
                  <button
                    onClick={() => navigateItem('next')}
                    className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Progress Dots */}
              <div className="flex justify-center gap-1">
                {items.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentItemIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentItemIndex 
                        ? 'bg-[#4B014E] w-6' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Current Item Display */}
            <div className="flex-1 overflow-y-auto">
              {currentItem && (
                <div className="p-4">
                  {/* Item Card */}
                  <div className="bg-white border-2 rounded-xl overflow-hidden mb-4 transition-all duration-300" 
                       style={{
                         borderColor: selectedItems.has(currentItem.id) ? '#4B014E' : '#e5e7eb'
                       }}>
                    {/* Item Image */}
                    <div className="aspect-square relative overflow-hidden bg-gray-50">
                      <img
                        src={selectedItems.get(currentItem.id)?.selectedVariant?.image?.url || 
                             currentItem.variants?.[0]?.image?.url || 
                             currentItem.image}
                        alt={currentItem.name}
                        className="w-full h-full object-cover transition-all duration-300"
                        loading="lazy"
                      />
                      
                      {/* Selection Checkbox */}
                      <div className="absolute top-3 left-3">
                        <button
                          onClick={() => toggleItemSelection(currentItem)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            selectedItems.has(currentItem.id)
                              ? 'bg-[#4B014E] border-[#4B014E] text-white'
                              : 'bg-white border-gray-300 hover:border-[#4B014E]'
                          }`}
                        >
                          {selectedItems.has(currentItem.id) && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20,6 9,17 4,12"></polyline>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Item Info */}
                    <div className="p-4">
                      <h4 className="font-semibold text-lg mb-2 text-gray-900">
                        {currentItem.name}
                      </h4>
                      
                      {/* Variant Selection */}
                      {currentItem.variants?.length > 1 && selectedItems.has(currentItem.id) && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Choose an option:
                          </label>
                          <select
                            value={selectedItems.get(currentItem.id)?.selectedVariant?.id || ''}
                            onChange={(e) => {
                              const variant = currentItem.variants.find(v => v.id === e.target.value);
                              if (variant) updateVariantSelection(currentItem.id, variant);
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B014E] focus:border-[#4B014E]"
                          >
                            {currentItem.variants.map(variant => (
                              <option 
                                key={variant.id} 
                                value={variant.id}
                                disabled={variant.availableForSale === false}
                              >
                                {variant.title} - ${parseFloat(variant.price.amount).toFixed(2)}
                                {variant.availableForSale === false && ' (Unavailable)'}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      {/* Price */}
                      <div className="text-right">
                        {selectedItems.has(currentItem.id) ? (
                          <>
                            <span className="text-xl font-bold text-[#4B014E]">
                              $ {selectedItems.get(currentItem.id)?.selectedVariant ? 
                                parseFloat(selectedItems.get(currentItem.id).selectedVariant.price.amount).toFixed(2) :
                                (currentItem.price || 0).toFixed(2)
                              }
                            </span>
                            {selectedItems.get(currentItem.id)?.selectedVariant?.compareAtPrice?.amount && (
                              <span className="text-sm text-gray-400 line-through ml-2">
                                $ {parseFloat(selectedItems.get(currentItem.id).selectedVariant.compareAtPrice.amount).toFixed(2)}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xl font-bold text-gray-400">
                            $ {(currentItem.price || 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Summary & Actions */}
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Selected Items:</span>
                  <span className="text-sm font-bold text-[#4B014E]">{selectedItems.size} of {items.length}</span>
                </div>
                
                {/* Collection Discount Info */}
                {selectedItems.size > 0 && (
                  <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    {isCollectionDiscountActive ? (
                      <div className="text-center">
                        <div className="text-sm font-medium text-purple-700 mb-1">
                          🎉 Collection Bundle Discount Active!
                        </div>
                        <div className="text-xs text-purple-600">
                          {discountPercentage}% off when you buy {minItemsForDiscount}+ items
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-600 mb-1">
                          Bundle Discount Available
                        </div>
                        <div className="text-xs text-gray-500">
                          Add {minItemsForDiscount - selectedItems.size} more item{minItemsForDiscount - selectedItems.size > 1 ? 's' : ''} to get {discountPercentage}% off
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedItems.size > 0 && (
                  <>
                    {totalOriginalPrice > totalPrice && (
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Original price:</span>
                        <span className="line-through text-gray-400">$ {totalOriginalPrice.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {/* Show collection discount line item */}
                    {isCollectionDiscountActive && (
                      <>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Subtotal:</span>
                          <span>$ {totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-purple-600">Collection discount ({discountPercentage}% off):</span>
                          <span className="text-purple-600">-$ {collectionDiscountAmount.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-[#4B014E]">
                        $ {isCollectionDiscountActive ? finalTotalWithCollectionDiscount.toFixed(2) : totalPrice.toFixed(2)}
                      </span>
                    </div>
                    
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>You save:</span>
                        <span>$ {totalSavings.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleAddToCart}
                  disabled={selectedItems.size === 0 || isAddingToCart}
                  className="w-full py-3 bg-gradient-to-r from-[#8A0101] to-[#4B014E] text-white font-bold rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="flex items-center justify-center gap-2">
                    {isAddingToCart ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <ShoppingCart size={18} />
                    )}
                    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                  </span>
                </button>

                <button
                  onClick={handleAddToWishlist}
                  disabled={selectedItems.size === 0 || isAddingToWishlist}
                  className="w-full py-3 border-2 border-[#4B014E] text-[#4B014E] font-bold rounded-xl hover:bg-[#4B014E] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="flex items-center justify-center gap-2">
                    {isAddingToWishlist ? (
                      <div className="w-5 h-5 border-2 border-[#4B014E] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Heart size={18} />
                    )}
                    {isAddingToWishlist ? 'Adding...' : 'Add to Wishlist'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Layout Desktop - Horizontal */
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left Side - Item Selection Grid */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item, index) => {
                  const isSelected = selectedItems.has(item.id);
                  const selection = selectedItems.get(item.id);
                  const hasVariants = item.variants?.length > 1;
                  
                  return (
                    <div
                      key={item.id || index}
                      className={`relative border-2 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
                        isSelected 
                          ? 'border-[#4B014E] ring-2 ring-[#4B014E] ring-opacity-30 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Item Image */}
                      <div className="aspect-square relative overflow-hidden bg-gray-50">
                        <img
                          src={selection?.selectedVariant?.image?.url || 
                               item.variants?.[0]?.image?.url || 
                               item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-all duration-300"
                          loading="lazy"
                        />
                        
                        {/* Selection Checkbox */}
                        <div className="absolute top-3 left-3">
                          <button
                            onClick={() => toggleItemSelection(item)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                              isSelected
                                ? 'bg-[#4B014E] border-[#4B014E] text-white'
                                : 'bg-white border-gray-300 hover:border-[#4B014E]'
                            }`}
                          >
                            {isSelected && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <polyline points="20,6 9,17 4,12"></polyline>
                              </svg>
                            )}
                          </button>
                        </div>

                        {/* Variant Selector Button */}
                        {hasVariants && isSelected && (
                          <div className="absolute top-3 right-3">
                            <button
                              onClick={() => setShowVariantSelector(showVariantSelector === item.id ? null : item.id)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 ${
                                showVariantSelector === item.id 
                                  ? 'bg-[#4B014E] text-white' 
                                  : 'bg-white/90 text-gray-700 hover:bg-[#4B014E] hover:text-white'
                              }`}
                            >
                              <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                                className={`transition-transform duration-200 ${
                                  showVariantSelector === item.id ? 'rotate-45' : ''
                                }`}
                              >
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Item Info */}
                      <div className="p-3">
                        <h4 className="font-semibold text-sm mb-1 line-clamp-2 min-h-[1.25rem]" style={{ color: '#1C1C1C' }}>
                          {item.name}
                        </h4>
                        
                        {/* Nome da variante selecionada */}
                        {selection?.selectedVariant && hasVariants && (
                          <p className="text-xs text-[#4B014E] font-medium mb-1 bg-purple-50 px-2 py-1 rounded-full inline-block">
                            {selection.selectedVariant.title}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            {selection?.selectedVariant ? (
                              <>
                                <span className="font-bold text-[#4B014E]">
                                  $ {parseFloat(selection.selectedVariant.price.amount).toFixed(2)}
                                </span>
                                {selection.selectedVariant.compareAtPrice?.amount && (
                                  <span className="text-xs text-gray-400 line-through ml-2">
                                    $ {parseFloat(selection.selectedVariant.compareAtPrice.amount).toFixed(2)}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="font-bold text-[#4B014E]">
                                $ {(item.price || 0).toFixed(2)}
                              </span>
                            )}
                          </div>
                          {hasVariants && isSelected && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                              {item.variants.length} options
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Indicador de múltiplas variantes */}
                      {hasVariants && !isSelected && (
                        <div className="absolute bottom-3 right-3">
                          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm border">
                            {item.variants.length} options
                          </div>
                        </div>
                      )}
                      
                      {/* Variant Selector Dropdown */}
                      {showVariantSelector === item.id && hasVariants && (
                        <div className="absolute inset-x-0 bottom-0 bg-white border-t border-gray-200 p-3 max-h-40 overflow-y-auto shadow-lg z-10">
                          <h5 className="text-xs font-semibold text-gray-700 mb-2">Choose an option:</h5>
                          <div className="space-y-1">
                            {item.variants.map((variant) => {
                              const isAvailable = variant.availableForSale !== false;
                              return (
                                <button
                                  key={variant.id}
                                  onClick={() => updateVariantSelection(item.id, variant)}
                                  disabled={!isAvailable}
                                  className={`w-full text-left text-xs p-2 rounded border transition-all duration-200 ${
                                    selection?.selectedVariant?.id === variant.id
                                      ? 'bg-[#4B014E] text-white border-[#4B014E]'
                                      : isAvailable
                                        ? 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-[#4B014E]'
                                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">{variant.title}</span>
                                    <span className="font-bold">
                                      $ {parseFloat(variant.price.amount).toFixed(2)}
                                    </span>
                                  </div>
                                  {!isAvailable && (
                                    <span className="text-xs text-red-400">Unavailable</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Selection Summary */}
            <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Selected Items</h3>
                <p className="text-sm text-gray-600">{selectedItems.size} of {items.length} items</p>
              </div>

              {/* Selected Items List */}
              <div className="flex-1 p-6 overflow-y-auto">
                {selectedItemsArray.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No items selected</p>
                ) : (
                  <div className="space-y-4">
                    {selectedItemsArray.map((selection) => (
                      <div key={selection.item.id} className="flex gap-3 bg-white p-3 rounded-lg border">
                        <img
                          src={selection.selectedVariant?.image?.url || 
                               selection.item.variants?.[0]?.image?.url ||
                               selection.item.image}
                          alt={selection.item.name}
                          className="w-16 h-16 object-cover rounded transition-all duration-300"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 mb-1">{selection.item.name}</h4>
                          {selection.selectedVariant && selection.selectedVariant.title && (
                            <p className="text-xs text-[#4B014E] font-medium mb-1 bg-purple-50 px-2 py-1 rounded-full inline-block">
                              {selection.selectedVariant.title}
                            </p>
                          )}
                          <p className="text-sm font-bold text-[#4B014E]">
                            $ {selection.selectedVariant 
                              ? parseFloat(selection.selectedVariant.price.amount).toFixed(2)
                              : (selection.item.price || 0).toFixed(2)
                            }
                          </p>
                          {selection.selectedVariant?.compareAtPrice?.amount && 
                           parseFloat(selection.selectedVariant.compareAtPrice.amount) > parseFloat(selection.selectedVariant.price.amount) && (
                            <p className="text-xs text-gray-400 line-through">
                              $ {parseFloat(selection.selectedVariant.compareAtPrice.amount).toFixed(2)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => toggleItemSelection(selection.item)}
                          className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors duration-200"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Summary & Actions */}
              <div className="p-6 border-t border-gray-200 bg-white">
                {selectedItems.size > 0 && (
                  <div className="mb-4 space-y-2">
                    {totalOriginalPrice > totalPrice && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Original price:</span>
                        <span className="line-through text-gray-400">$ {totalOriginalPrice.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {/* Show collection discount line item */}
                    {isCollectionDiscountActive && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal:</span>
                          <span>$ {totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-600">Collection discount ({discountPercentage}% off):</span>
                          <span className="text-purple-600">-$ {collectionDiscountAmount.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-[#4B014E]">
                        $ {isCollectionDiscountActive ? finalTotalWithCollectionDiscount.toFixed(2) : totalPrice.toFixed(2)}
                      </span>
                    </div>
                    
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>You save:</span>
                        <span>$ {totalSavings.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={selectedItems.size === 0 || isAddingToCart}
                    className="w-full py-3 bg-gradient-to-r from-[#8A0101] to-[#4B014E] text-white font-bold rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isAddingToCart ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <ShoppingCart size={18} />
                      )}
                      {isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                    </span>
                  </button>

                  <button
                    onClick={handleAddToWishlist}
                    disabled={selectedItems.size === 0 || isAddingToWishlist}
                    className="w-full py-3 border-2 border-[#4B014E] text-[#4B014E] font-bold rounded-xl hover:bg-[#4B014E] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isAddingToWishlist ? (
                        <div className="w-5 h-5 border-2 border-[#4B014E] border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Heart size={18} />
                      )}
                      {isAddingToWishlist ? 'Adding to Wishlist...' : 'Add to Wishlist'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            </div>
          </div>
        )}
        
        {/* Indicador de indisponível */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">Unavailable</span>
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

  // Lógica da promoção de 20%
  const hasPromotion = hasItems && totalPrice > 0;
  const discountPercent = 20;
  const discountedPrice = hasPromotion ? totalPrice * (1 - discountPercent / 100) : totalPrice;
  const savings = hasPromotion ? totalPrice - discountedPrice : 0;

  return (
    <>
      <div className="relative group">
        <div
          className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100"
          onMouseEnter={() => !isMobile && setIsHovered(true)}
          onMouseLeave={() => !isMobile && setIsHovered(false)}
          onClick={handleItemView}
        >
          {/* Header da imagem */}
          <div className="relative">
            {/* Badge de promoção minimalista */}
            {hasPromotion && (
              <div className="absolute top-3 right-3 z-10">
                <div className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium shadow-sm">
                  -{discountPercent}%
                </div>
              </div>
            )}

            {/* Ícone visualizar - mais discreto */}
            {hasItems && (
              <div className="absolute top-3 left-3 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemView();
                  }}
                  className="w-7 h-7 bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white/80 hover:bg-black/40 hover:text-white transition-all duration-200"
                >
                  <Eye size={14} />
                </button>
              </div>
            )}

            {/* Imagem da coleção */}
            <div className="aspect-[4/5] overflow-hidden bg-gray-100">
              <img
                src={collection.image}
                alt={collection.name}
                className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
              />
            </div>

            {/* Badge de quantidade - mais sutil */}
            {hasItems && (
              <div className="absolute bottom-3 left-3">
                <div className="bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-md text-xs font-medium shadow-sm">
                  {items.length} {items.length === 1 ? 'item' : 'itens'}
                </div>
              </div>
            )}
          </div>

          {/* Conteúdo */}
          <div className="p-4 space-y-3">
            {/* Nome da coleção */}
            <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-relaxed min-h-[2.5rem]">
              {collection.name}
            </h4>

            {/* Rating minimalista */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={12} 
                    className={`${i < Math.floor(avgRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} 
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {avgRating !== null ? avgRating.toFixed(1) : '--'}
              </span>
            </div>

            {/* Preços */}
            {hasItems && (
              <div className="space-y-1">
                {hasPromotion ? (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400 line-through">
                      $ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="font-bold text-red-600">
                      $ {discountedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-green-600">
                      Saving $ {savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ) : (
                  <div className="font-semibold text-gray-900">
                    $ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                )}
              </div>
            )}

            {/* Faixa de preço (se existir) */}
            {collection.priceRange && (
              <div className="text-sm font-medium text-gray-700">
                {collection.priceRange}
              </div>
            )}
          </div>

          {/* Overlay de hover */}
          {!isMobile && (
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
          )}
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