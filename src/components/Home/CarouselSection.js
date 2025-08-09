import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { gql } from '@apollo/client';
import { auth, db, doc, getDoc, setDoc } from '../../client/firebaseConfig';
import client from '../../client/ShopifyClient';
import { useNavigate } from 'react-router-dom';

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

const CarouselSection = ({ title, products, id }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef(null);
  const autoSlideRef = useRef(null);
  const [notification, setNotification] = useState(null); // {type: 'success'|'error', message: string}

  // Touch handling states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null); // Novo: para detectar swipe vertical
  const [isDragging, setIsDragging] = useState(false);
  const [ignoreSwipe, setIgnoreSwipe] = useState(false); // Novo: flag para ignorar swipe após detectar vertical

  // Responsive items per view - otimizado para todas as resoluções incluindo 4K
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    if (width < 640) return 1;      // Mobile
    if (width < 768) return 2;      // Small tablets
    if (width < 1024) return 3;     // Medium tablets
    if (width < 1440) return 4;     // Desktop padrão
    if (width < 1920) return 5;     // Telas grandes (1440p)
    if (width < 2560) return 6;     // Telas muito grandes (1080p ultrawide, 1440p ultrawide)
    return 7;                       // 4K e superiores
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView);

  // Filter products based on selection
  const filteredProducts = products.filter(product => {
    if (selectedFilter === 'ALL') return true;
    
    // Log para debug dos metacampos
    
    // Check by Shopify metafield 'genero_alvo' (priority)
    if (product.metafields && product.metafields.genero_alvo) {
      const genderValue = product.metafields.genero_alvo.value?.toUpperCase();
      
      // UNISEX aparece em ambos os filtros MEN e WOMEN
      if (genderValue === 'UNISEX') {
        return selectedFilter === 'MEN' || selectedFilter === 'WOMEN';
      }
      
      if (selectedFilter === 'MEN') {
        return genderValue === 'MEN' || genderValue === 'MALE' || 
               genderValue === 'HOMEM' || genderValue === 'MASCULINO';
      }
      if (selectedFilter === 'WOMEN') {
        return genderValue === 'WOMEN' || genderValue === 'FEMALE' || 
               genderValue === 'MULHER' || genderValue === 'FEMININO';
      }
      
      // Se chegou até aqui, o produto tem gênero mas não corresponde ao filtro atual
      return false;
    }
    
    // Fallback: Check by metafield with namespace (alternative format)
    if (product.metafields && typeof product.metafields === 'object') {
      // Procurar pelo metafield genero_alvo diretamente
      const genderMetafield = product.metafields.genero_alvo || 
                              product.metafields.gender || 
                              product.metafields.target_gender;
      
      if (genderMetafield && genderMetafield.value) {
        const genderValue = genderMetafield.value.toUpperCase();
        
        // UNISEX aparece em ambos os filtros MEN e WOMEN
        if (genderValue === 'UNISEX') {
          return selectedFilter === 'MEN' || selectedFilter === 'WOMEN';
        }
        
        if (selectedFilter === 'MEN') {
          return genderValue === 'MEN' || genderValue === 'MALE' || 
                 genderValue === 'HOMEM' || genderValue === 'MASCULINO';
        }
        if (selectedFilter === 'WOMEN') {
          return genderValue === 'WOMEN' || genderValue === 'FEMALE' || 
                 genderValue === 'MULHER' || genderValue === 'FEMININO';
        }
        
        // Se chegou até aqui, o produto tem gênero mas não corresponde ao filtro atual
        return false;
      }
    }
    
    // Fallback: Check by productType (Shopify field) only if metafield not found
    if (product.productType) {
      const typeUpper = product.productType.toUpperCase();
      if (selectedFilter === 'MEN') {
        return typeUpper.includes('MEN') || typeUpper.includes('MALE') || 
               typeUpper.includes('HOMEM') || typeUpper.includes('MASCULINO');
      }
      if (selectedFilter === 'WOMEN') {
        return typeUpper.includes('WOMEN') || typeUpper.includes('FEMALE') || 
               typeUpper.includes('MULHER') || typeUpper.includes('FEMININO');
      }
    }
    
    return false;
  });

  // Organize products by priority
  const organizedProducts = [...filteredProducts].sort((a, b) => {
    if (a.isPromotion && !b.isPromotion) return -1;
    if (!a.isPromotion && b.isPromotion) return 1;
    if (a.isLimitedStock && !b.isLimitedStock) return -1;
    if (!a.isLimitedStock && b.isLimitedStock) return 1;
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;
    return 0;
  });

  const hasMultipleSlides = organizedProducts.length > itemsPerView;

  // Ajustar itemsPerView se há poucos produtos para evitar quebra visual
  const adjustedItemsPerView = Math.min(itemsPerView, organizedProducts.length);
  const shouldCenterItems = organizedProducts.length < itemsPerView;

  // Cálculo dinâmico do maxIndex baseado no número real de produtos e ajustado
  const maxIndex = Math.max(0, organizedProducts.length - adjustedItemsPerView);
  
  // Auto-remove notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  // Touch handlers
  const minSwipeDistance = 50;
  const minVerticalDistance = 40; // Para ignorar pequenos movimentos verticais

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
    setIsDragging(true);
    setIgnoreSwipe(false); // Resetar flag no início do gesto
    stopAutoSlide();
  };

  const onTouchMove = (e) => {
    if (touchStart === null || touchStartY === null || ignoreSwipe) return;
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    const deltaX = currentX - touchStart;
    const deltaY = currentY - touchStartY;

    // Se o movimento for mais vertical que horizontal, ignorar swipe do carousel até o próximo touchstart
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minVerticalDistance) {
      setIsDragging(false);
      setIgnoreSwipe(true);
      return;
    }
    setTouchEnd(currentX);
  };

  const onTouchEnd = () => {
    if (ignoreSwipe) {
      setIsDragging(false);
      return;
    }
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      if (hasMultipleSlides) setTimeout(() => startAutoSlide(), 3000);
      return;
    }
    const distance = touchStart - touchEnd;
    // Só considera swipe se o movimento horizontal for maior que o vertical
    if (touchStartY !== null && Math.abs(distance) > minSwipeDistance) {
      if (Math.abs(distance) > minSwipeDistance) {
        const isLeftSwipe = distance > 0;
        if (isLeftSwipe) {
          setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        } else {
          setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
        }
      }
    }
    setIsDragging(false);
    if (hasMultipleSlides) setTimeout(() => startAutoSlide(), 3000);
  };

  const stopAutoSlide = () => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = null;
    }
  };
  
  // Auto-slide com cleanup e verificação dinâmica
  useEffect(() => {
    // Reset currentIndex se estiver fora do range válido
    if (currentIndex > maxIndex) {
      setCurrentIndex(Math.max(0, maxIndex));
    }
    
    // Só inicia auto-slide se há múltiplos slides
    if (hasMultipleSlides) {
      startAutoSlide();
    }
    
    return () => stopAutoSlide();
  }, [maxIndex, organizedProducts.length, hasMultipleSlides, currentIndex]);

  // Detect screen size changes
  useEffect(() => {
    const updateItemsPerView = () => {
      const newItemsPerView = getItemsPerView();
      setItemsPerView(newItemsPerView);
      setIsMobile(window.innerWidth < 768);
    };
    
    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Auto-dismiss notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Early return se não há produtos
  if (!products || products.length === 0) {
    return (
      <section className="py-12 md:py-20 bg-[#1C1C1C]">
        <div className="container mx-auto px-4 md:px-6 xl:px-8 3xl:px-10 4xl:px-12 5xl:px-16 max-w-screen-xl 3xl:max-w-screen-2xl 4xl:max-w-2k 5xl:max-w-4k text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-[#F3ECE7] mb-4">{title}</h2>
          <p className="text-[#F3ECE7]/60">No products available at the moment.</p>
        </div>
      </section>
    );
  }

  // Auto-slide functionality com verificação dinâmica e loop infinito
  const startAutoSlide = () => {
    if (autoSlideRef.current || !hasMultipleSlides) return;
    autoSlideRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        // Se chegou no final, volta pro início (loop infinito)
        if (prev >= maxIndex) {
          return 0;
        }
        return prev + 1;
      });
    }, 5000);
  };

  const navigateCarousel = (direction) => {
    stopAutoSlide();

    setCurrentIndex(prev => {
      let newIndex;
      if (direction === 'left') {
        newIndex = prev === 0 ? maxIndex : prev - 1;
      } else {
        newIndex = prev >= maxIndex ? 0 : prev + 1;
      }
      return newIndex;
    });

    if (hasMultipleSlides) {
      setTimeout(() => startAutoSlide(), 8000);
    }
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setCurrentIndex(0); // Sempre reseta para o início
    stopAutoSlide();
    
    // Aguarda a atualização dos produtos filtrados antes de reiniciar auto-slide
    setTimeout(() => {
      const newFilteredProducts = products.filter(product => {
        if (filter === 'ALL') return true;
        
        // Check by Shopify metafield 'genero_alvo' (priority)
        if (product.metafields && product.metafields.genero_alvo) {
          const genderValue = product.metafields.genero_alvo.value?.toUpperCase();
          
          // UNISEX aparece em ambos os filtros MEN e WOMEN
          if (genderValue === 'UNISEX') {
            return filter === 'MEN' || filter === 'WOMEN';
          }
          
          if (filter === 'MEN') {
            return genderValue === 'MEN' || genderValue === 'MALE' || 
                   genderValue === 'HOMEM' || genderValue === 'MASCULINO';
          }
          if (filter === 'WOMEN') {
            return genderValue === 'WOMEN' || genderValue === 'FEMALE' || 
                   genderValue === 'MULHER' || genderValue === 'FEMININO';
          }
          
          // Se chegou até aqui, o produto tem gênero mas não corresponde ao filtro atual
          return false;
        }
        
        // Fallback: Check by metafield with namespace (alternative format)
        if (product.metafields && typeof product.metafields === 'object') {
          // Procurar pelo metafield genero_alvo diretamente
          const genderMetafield = product.metafields.genero_alvo || 
                                  product.metafields.gender || 
                                  product.metafields.target_gender;
          
          if (genderMetafield && genderMetafield.value) {
            const genderValue = genderMetafield.value.toUpperCase();
            
            // UNISEX aparece em ambos os filtros MEN e WOMEN
            if (genderValue === 'UNISEX') {
              return filter === 'MEN' || filter === 'WOMEN';
            }
            
            if (filter === 'MEN') {
              return genderValue === 'MEN' || genderValue === 'MALE' || 
                     genderValue === 'HOMEM' || genderValue === 'MASCULINO';
            }
            if (filter === 'WOMEN') {
              return genderValue === 'WOMEN' || genderValue === 'FEMALE' || 
                     genderValue === 'MULHER' || genderValue === 'FEMININO';
            }
            
            // Se chegou até aqui, o produto tem gênero mas não corresponde ao filtro atual
            return false;
          }
        }
        
        // Fallback: Check by productType (Shopify field) only if metafield not found
        if (product.productType) {
          const typeUpper = product.productType.toUpperCase();
          if (filter === 'MEN') {
            return typeUpper.includes('MEN') || typeUpper.includes('MALE') || 
                   typeUpper.includes('HOMEM') || typeUpper.includes('MASCULINO');
          }
          if (filter === 'WOMEN') {
            return typeUpper.includes('WOMEN') || typeUpper.includes('FEMALE') || 
                   typeUpper.includes('MULHER') || typeUpper.includes('FEMININO');
          }
        }
        
        return false;
      });
      
      // Só reinicia auto-slide se há produtos suficientes
      if (newFilteredProducts.length > adjustedItemsPerView) {
        startAutoSlide();
      }
    }, 1000);
  };

  // Função para obter as cores do tema baseado no filtro selecionado
  const getThemeColors = () => {
    switch (selectedFilter) {
      case 'ALL':
        return {
          primary: '#F3ECE7', // Branco
          secondary: '#1C1C1C', // Preto
          border: '#F3ECE7',
          gradient: 'from-[#F3ECE7] to-[#F3ECE7]'
        };
      case 'WOMEN':
        return {
          primary: '#8A0101', // Vermelho
          secondary: '#8A0101',
          border: '#8A0101',
          gradient: 'from-[#8A0101] to-[#8A0101]'
        };
      case 'MEN':
        return {
          primary: '#4B014E', // Roxo
          secondary: '#4B014E',
          border: '#4B014E',
          gradient: 'from-[#4B014E] to-[#4B014E]'
        };
      default:
        return {
          primary: '#F3ECE7',
          secondary: '#1C1C1C',
          border: '#F3ECE7',
          gradient: 'from-[#F3ECE7] to-[#F3ECE7]'
        };
    }
  };

  const themeColors = getThemeColors();

  return (
    <section className="py-12 md:py-10 bg-[#1C1C1C] relative overflow-hidden">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"></polyline>
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
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #8A0101 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, #4B014E 0%, transparent 50%)`,
          backgroundSize: '200px 200px'
        }} />
      </div>

      <div className="container mx-auto px-4 md:px-6 xl:px-8 3xl:px-10 4xl:px-12 5xl:px-16 max-w-screen-xl 3xl:max-w-screen-2xl 4xl:max-w-2k 5xl:max-w-4k relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 md:mb-12 gap-6">
          <div className="space-y-6 flex-1">
            {/* Título alinhado à esquerda */}
            <div className={`flex flex-col ${isMobile ? 'gap-2' : 'md:flex-row md:justify-between md:items-center gap-4'}`}>
              <h2 className="text-3xl md:text-5xl font-bold text-[#F3ECE7] relative">
                {title}
                <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-[#8A0101] to-[#4B014E]" />
              </h2>
              {/* Botão "Ver Todos" no canto direito */}
              <button 
                className={`flex items-center gap-2 mt-3 px-4 py-2 transition-all duration-300 group self-start md:self-center border-2 ${
                  selectedFilter === 'ALL' 
                    ? 'bg-[#F3ECE7] text-[#1C1C1C] border-[#F3ECE7]'
                    : selectedFilter === 'WOMEN'
                    ? 'bg-[#8A0101] text-[#F3ECE7] border-[#8A0101] hover:bg-[#8A0101]/80'
                    : selectedFilter === 'MEN'
                    ? 'bg-[#4B014E] text-[#F3ECE7] border-[#4B014E] hover:bg-[#4B014E]/80'
                    : 'bg-transparent text-[#F3ECE7] border-[#4B014E] hover:bg-[#4B014E]'
                } ${isMobile ? 'w-full justify-center text-base mb-2' : ''}`}
              >
                <Eye size={18} className="group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">View All</span>
              </button>
            </div>
            {/* Filters */}
            <div className={`flex ${isMobile ? 'flex-row w-full gap-2 justify-between' : 'flex-wrap gap-3'}`}>
              {['ALL', 'MEN', 'WOMEN'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  className={`px-4 py-2 md:px-6 md:py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden group border-2 ${
                    selectedFilter === filter
                      ? filter === 'ALL'
                        ? 'bg-[#F3ECE7] text-[#1C1C1C] border-[#F3ECE7] shadow-lg shadow-[#F3ECE7]/25'
                        : filter === 'WOMEN'
                        ? 'bg-[#8A0101] text-[#F3ECE7] border-[#8A0101] shadow-lg shadow-[#8A0101]/25'
                        : 'bg-[#4B014E] text-[#F3ECE7] border-[#4B014E] shadow-lg shadow-[#4B014E]/25'
                      : 'bg-transparent text-[#F3ECE7] border-[#4B014E] hover:bg-[#4B014E]/20'
                  } ${isMobile ? 'w-full text-base' : ''}`}
                >
                  <span className="relative z-10">{filter}</span>
                  {selectedFilter !== filter && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#8A0101] to-[#4B014E] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Desktop Navigation Arrows */}
          {!isMobile && hasMultipleSlides && !shouldCenterItems && (
            <>
              <button
                onClick={() => navigateCarousel('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-[#1C1C1C]/90 backdrop-blur-sm text-[#F3ECE7] p-4 hover:bg-[#8A0101] transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-6 group-hover:-translate-x-2 border border-[#4B014E]/30"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={() => navigateCarousel('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-[#1C1C1C]/90 backdrop-blur-sm text-[#F3ECE7] p-4 hover:bg-[#8A0101] transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-6 group-hover:translate-x-2 border border-[#4B014E]/30"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Mobile Navigation */}
          {isMobile && hasMultipleSlides && (
            <div className="flex justify-center items-center mb-6 px-2">
              <div className="flex items-center gap-4">
                <span className="text-[#F3ECE7] text-sm font-medium">
                  {currentIndex + 1} de {maxIndex + 1}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, maxIndex + 1) }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentIndex === index ? 'bg-[#8A0101] scale-125' : 'bg-[#4B014E]/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Carousel */}
          <div 
            ref={carouselRef}
            className={`overflow-hidden${isMobile ? ' px-4' : ''}`}
            style={{ touchAction: isMobile ? 'pan-y' : 'auto' }}
            onMouseEnter={!isMobile && hasMultipleSlides ? stopAutoSlide : undefined}
            onMouseLeave={!isMobile && hasMultipleSlides ? startAutoSlide : undefined}
            onTouchStart={isMobile ? onTouchStart : undefined}
            onTouchMove={isMobile ? onTouchMove : undefined}
            onTouchEnd={isMobile ? onTouchEnd : undefined}
          >
            <div
              className={`flex transition-transform duration-700 ease-in-out gap-4 md:gap-6 ${isDragging ? 'transition-none' : ''} ${
                shouldCenterItems && !isMobile ? 'justify-center' : ''
              }`}
              style={
                isMobile && adjustedItemsPerView === 1
                  ? (() => {
                      // Largura do card: 85vw
                      const cardWidth = 85;
                      const gap = 4; // gap em vw
                      const totalCards = organizedProducts.length;
                      
                      // Para centralizar corretamente cada card
                      const containerWidth = 100;
                      const sideMargin = (containerWidth - cardWidth) / 2;
                      
                      // Calcular o translate para centralizar o card atual
                      // Para o primeiro card (index 0), começar com margem lateral
                      let translateX;
                      
                      if (currentIndex === 0) {
                        // Primeiro card: apenas a margem lateral
                        translateX = sideMargin;
                      } else {
                        // Cards subsequentes: posição baseada no índice
                        translateX = currentIndex * (cardWidth + gap) + sideMargin;
                      }
                      
                      // Limitar para não ultrapassar os limites (último card)
                      const maxTranslate = (totalCards - 1) * (cardWidth + gap) + sideMargin;
                      if (translateX > maxTranslate) translateX = maxTranslate;
                      
                      return {
                        width: `${totalCards * (cardWidth + gap) - gap}vw`,
                        transform: `translateX(-${translateX}vw)`
                      };
                    })()
                  : shouldCenterItems
                  ? {
                      // Para poucos itens no desktop, centraliza sem transform
                      width: 'auto'
                    }
                  : {
                      transform: `translateX(-${(currentIndex * 100) / Math.max(organizedProducts.length, adjustedItemsPerView)}%)`,
                      width: `${Math.max(organizedProducts.length, adjustedItemsPerView) * (100 / adjustedItemsPerView)}%`
                    }
              }
            >
              {organizedProducts.map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className={isMobile && adjustedItemsPerView === 1 ? 'flex-shrink-0' : 'flex-shrink-0'}
                  style={{
                    width: isMobile && adjustedItemsPerView === 1 
                      ? '85vw' 
                      : shouldCenterItems 
                      ? `${Math.min(300, (100 / Math.max(organizedProducts.length, 1)))}px`
                      : `${100 / adjustedItemsPerView}%`,
                    maxWidth: isMobile ? '360px' : shouldCenterItems ? '300px' : '300px',
                    minWidth: shouldCenterItems ? '250px' : 'auto'
                  }}
                >
                  <EnhancedProductCard 
                    product={product} 
                    isVisible={index >= currentIndex && index < currentIndex + adjustedItemsPerView}
                    isMobile={isMobile}
                    setNotification={setNotification}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Gradient Overlays - Reduced width to prevent first card blur */}
          {!isMobile && (
            <>
              <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-[#1C1C1C] to-transparent z-10 pointer-events-none" />
              <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-[#1C1C1C] to-transparent z-10 pointer-events-none" />
            </>
          )}

          {/* Mobile Swipe Hint */}
          {isMobile && hasMultipleSlides && (
            <div className="absolute bottom-0 right-4 text-[#F3ECE7]/60 text-xs flex items-center gap-1">
              <span>Swipe</span>
              <ChevronRight size={12} />
            </div>
          )}
        </div>

        {/* Progress Indicators - só mostra se há múltiplos slides e não está centralizado */}
        {hasMultipleSlides && maxIndex > 0 && !isMobile && !shouldCenterItems && (
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  stopAutoSlide();
                  setTimeout(() => startAutoSlide(), 3000);
                }}
                className={`h-1 transition-all duration-300 ${
                  currentIndex === index
                    ? 'bg-[#8A0101] w-12'
                    : 'bg-[#4B014E]/40 w-4 hover:bg-[#4B014E]/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const EnhancedProductCard = ({ product, isVisible, isMobile, onAddToCart, setNotification }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [showVariants, setShowVariants] = useState(isMobile); // No mobile sempre mostra
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Estados para seleção de variantes (similar ao ProductSection)
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Helper functions para extrair informações das variantes (similar ao ProductSection)
  const getProductColors = (product) => {
    if (!product.variants) return [];
    
    const colors = new Set();
    product.variants.forEach(variant => {
      const colorMatch = variant.title?.split(' / ')[0] || variant.title;
      if (colorMatch && colorMatch !== 'Default Title') {
        colors.add(colorMatch.trim());
      }
    });
    
    return Array.from(colors);
  };

  const getProductSizes = (product) => {
    if (!product.variants) return [];
    
    const sizes = new Set();
    product.variants.forEach(variant => {
      const parts = variant.title?.split(' / ');
      if (parts && parts.length > 1) {
        sizes.add(parts[1].trim());
      }
    });
    
    return Array.from(sizes);
  };

  const isVariantAvailable = (product, color, size) => {
    if (!product.variants) return false;
    
    const variant = product.variants.find(v => {
      const parts = v.title?.split(' / ') || [];
      const variantColor = parts[0]?.trim();
      const variantSize = parts[1]?.trim();
      
      return variantColor === color && variantSize === size && v.availableForSale;
    });
    
    return !!variant;
  };

  const findVariant = (product, color, size) => {
    if (!product.variants) return null;
    
    return product.variants.find(v => {
      const parts = v.title?.split(' / ') || [];
      const variantColor = parts[0]?.trim();
      const variantSize = parts[1]?.trim();
      
      return variantColor === color && variantSize === size;
    });
  };

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

  // Inicializar seleção de variantes quando produto carregar
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const colors = getProductColors(product);
      const sizes = getProductSizes(product);
      
      // Encontrar primeira variante disponível
      const availableVariant = product.variants.find(v => v.availableForSale);
      
      if (availableVariant) {
        const parts = availableVariant.title?.split(' / ') || [];
        const defaultColor = parts[0]?.trim() || colors[0];
        const defaultSize = parts[1]?.trim() || sizes[0];
        
        setSelectedColor(defaultColor);
        setSelectedSize(defaultSize);
        setSelectedVariant(availableVariant);
      }
    }
  }, [product]);

  // Funções para selecionar cor e tamanho
  const selectColor = (color) => {
    setSelectedColor(color);
    
    // Encontrar tamanho válido para essa cor
    const sizes = getProductSizes(product);
    let validSize = selectedSize;
    
    if (!sizes.includes(selectedSize) || !isVariantAvailable(product, color, selectedSize)) {
      validSize = sizes.find(size => isVariantAvailable(product, color, size)) || sizes[0];
    }
    
    setSelectedSize(validSize);
    
    if (validSize) {
      const variant = findVariant(product, color, validSize);
      setSelectedVariant(variant);
      
      // Atualizar índice da variante para a imagem
      if (variant) {
        const index = product.variants.findIndex(v => v.id === variant.id);
        setSelectedVariantIndex(index >= 0 ? index : 0);
      }
    }
  };

  const selectSize = (size) => {
    setSelectedSize(size);
    
    if (selectedColor) {
      const variant = findVariant(product, selectedColor, size);
      setSelectedVariant(variant);
      
      // Atualizar índice da variante para a imagem
      if (variant) {
        const index = product.variants.findIndex(v => v.id === variant.id);
        setSelectedVariantIndex(index >= 0 ? index : 0);
      }
    }
  };

  // Parse variant titles para trabalhar com Shopify - cores, tamanhos, etc.
  const parseVariantTitle = (title) => {
    if (!title || title === 'Default Title') return '';
    
    // Para Shopify, o formato comum é "Color / Size" ou apenas "Color" ou apenas "Size"
    const parts = title.split(' / ');
    
    if (parts.length > 1) {
      // Se tem múltiplas partes, prioriza a segunda (normalmente tamanho)
      // mas se a segunda for muito longa, usa a primeira (cor)
      const second = parts[1].trim();
      const first = parts[0].trim();
      
      // Se a segunda parte é um tamanho comum, usa ela
      if (['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'].includes(second.toUpperCase()) || 
          /^\d+$/.test(second)) {
        return second;
      }
      
      // Senão, usa a primeira parte (cor) mas abreviada
      return first.length > 4 ? first.substring(0, 3).toUpperCase() : first.toUpperCase();
    }
    
    // Para título simples, verifica se é tamanho ou cor
    const upper = title.toUpperCase();
    if (['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'].includes(upper) || /^\d+$/.test(title)) {
      return title;
    }
    
    // Para cores ou outros atributos, abrevia se necessário
    return title.length > 4 ? title.substring(0, 3).toUpperCase() : title.toUpperCase();
  };

  const handleAddToCart = async () => {
      if (!selectedVariant) {
        setNotification({ type: 'error', message: 'Please select color and size first.' });
        return;
      }

      if (!selectedVariant.availableForSale) {
        setNotification({ type: 'error', message: 'Selected variant is not available.' });
        return;
      }

      setIsAddingToCart(true);
      try {
        const cartId = await getOrCreateCartId();
        
        // Adicionar ao carrinho do Shopify
        const { data } = await client.mutate({
          mutation: ADD_TO_CART,
          variables: {
            cartId,
            lines: [{
              merchandiseId: selectedVariant.id,
              quantity: 1
            }]
          }
        });

        // Estrutura do item para Firebase/localStorage
        const cartItem = {
          id: selectedVariant.id,
          name: product.name || product.title,
          price: parseFloat(selectedVariant.price.amount),
          image: selectedVariant.image?.url || product.image,
          quantity: 1,
          variantTitle: selectedVariant.title
        };

        // Atualizar carrinho local
        const user = auth.currentUser;
        if (user) {
          const cartRef = doc(db, 'carts', user.uid);
          const cartSnap = await getDoc(cartRef);
          const existingItems = cartSnap.exists() ? cartSnap.data().items : [];

          // Verificar se o item já existe no carrinho
          const existingItemIndex = existingItems.findIndex(item => item.id === cartItem.id);
          if (existingItemIndex >= 0) {
            existingItems[existingItemIndex].quantity += 1;
          } else {
            existingItems.push(cartItem);
          }
          
          await setDoc(cartRef, { items: existingItems }, { merge: true });
        } else {
          const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
          const existingItemIndex = guestCart.findIndex(item => item.id === cartItem.id);
          if (existingItemIndex >= 0) {
            guestCart[existingItemIndex].quantity += 1;
          } else {
            guestCart.push(cartItem);
          }
          localStorage.setItem('guestCart', JSON.stringify(guestCart));
        }
        
        setNotification({ 
          type: 'success', 
          message: `${product.name || product.title} (${selectedVariant.title}) added to cart!` 
        });
      } catch (error) {
        console.error("Error adding to cart:", error);
        setNotification({ type: 'error', message: 'Failed to add to cart. Please try again.' });
      } finally {
        setIsAddingToCart(false);
      }
  };

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
        console.error("Error creating Shopify cart:", error);
        setNotification({ type: 'error', message: 'Failed to initialize cart. Please try reloading the page.' });
        throw error;
      }
    }

    return cartId;
  };

  // Helper functions para manter compatibilidade
  const hasTag = (tag) => product.tags?.includes?.(tag) || product[`is${tag.charAt(0).toUpperCase() + tag.slice(1)}`];
  const isPromotion = hasTag('promoção') || hasTag('promotion') || product.isPromotion || product.sale;
  const isLimitedStock = hasTag('estoque-limitado') || hasTag('limited-stock') || product.isLimitedStock || product.limited;
  const isNew = hasTag('novo') || hasTag('new') || product.isNew;
  const hasOriginalPrice = product.originalPrice && product.originalPrice > 0 && product.originalPrice !== product.price;
  
  // Função para otimizar URL da imagem
  const getOptimizedImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    
    // Se já tem parâmetros de tamanho, usar como está
    if (imageUrl.includes('w=') && imageUrl.includes('h=')) {
      return imageUrl;
    }
    
    // Para Unsplash, adicionar parâmetros de otimização
    if (imageUrl.includes('unsplash.com')) {
      const separator = imageUrl.includes('?') ? '&' : '?';
      return `${imageUrl}${separator}w=400&h=500&fit=crop&auto=format&q=80`;
    }
    
    // Para Shopify CDN, adicionar parâmetros de redimensionamento
    if (imageUrl.includes('shopify.com') || imageUrl.includes('myshopify.com')) {
      // Remove parâmetros existentes de tamanho
      const cleanUrl = imageUrl.split('?')[0];
      return `${cleanUrl}?width=400&height=500&crop=center`;
    }
    
    return imageUrl;
  };

  return (
    <div
      className={`relative bg-[#1C1C1C] border border-[#4B014E]/20 overflow-hidden transform transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-60'
      } ${isHovered && !isMobile ? 'scale-105 shadow-2xl shadow-[#8A0101]/20' : ''} group rounded-lg`}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onClick={() => isMobile && setShowVariants(!showVariants)}
    >
      {/* Priority Labels */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {isPromotion && (
          <span className="bg-[#8A0101] text-[#F3ECE7] px-3 py-1 text-xs font-bold shadow-lg relative overflow-hidden rounded-md">
            PROMOÇÃO
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </span>
        )}
        {isLimitedStock && (
          <span className="bg-gradient-to-r from-[#8A0101] to-[#4B014E] text-[#F3ECE7] px-3 py-1 text-xs font-bold shadow-lg rounded-md">
            ÚLTIMAS UNIDADES
          </span>
        )}
        {isNew && !isPromotion && !isLimitedStock && (
          <span className="bg-[#4B014E] text-[#F3ECE7] px-3 py-1 text-xs font-bold shadow-lg rounded-md">
            NEW
          </span>
        )}
      </div>

      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[4/5] bg-[#1C1C1C] rounded-t-lg">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#4B014E]/20 to-[#8A0101]/20 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#4B014E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <img
          key={`product-${product.id}-variant-${selectedVariant?.id || 'default'}`}
          src={getOptimizedImageUrl(
            selectedVariant?.image?.url ||
            product.variants?.[selectedVariantIndex]?.image?.url ||
            product.image || product.imageUrl || product.src || product.featured_image
          )}
          alt={product.name || product.title}
          className={`w-full h-full object-cover object-center transition-all duration-700 image-fade-transition variant-image-change ${
            isHovered ? 'scale-110' : 'scale-100'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
          loading="lazy"
        />
        
        {/* Overlay Effects */}
        <div className={`absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/80 via-transparent to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />
        
        {/* Hover Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-t from-[#8A0101]/20 to-[#4B014E]/20 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />
      </div>

      {/* Product Information */}
      <div className="p-4 relative bg-gradient-to-b from-transparent to-[#1C1C1C]/50">
        <h3 className="text-[#F3ECE7] font-semibold text-base md:text-lg mb-3 line-clamp-2 leading-tight min-h-[3rem]">
          {product.name || product.title}
        </h3>
        
        {/* Pricing - use selected variant price if available */}
        <div className="flex items-center gap-3 mb-4 min-h-[2rem]">
          {(() => {
            const currentPrice = selectedVariant ? parseFloat(selectedVariant.price.amount) : parseFloat(product.price || 0);
            const comparePrice = selectedVariant?.compareAtPrice ? parseFloat(selectedVariant.compareAtPrice.amount) : (product.originalPrice || null);
            const hasDiscount = comparePrice && comparePrice > currentPrice;
            
            return (
              <>
                {hasDiscount ? (
                  <>
                    <span className="text-[#F3ECE7]/60 line-through text-sm">
                      $ {comparePrice.toFixed(2)}
                    </span>
                    <span className="text-[#8A0101] font-bold text-lg">
                      $ {currentPrice.toFixed(2)}
                    </span>
                    <span className="bg-[#8A0101]/20 text-[#8A0101] px-2 py-1 text-xs font-bold rounded-full">
                      -{Math.round(((comparePrice - currentPrice) / comparePrice) * 100)}%
                    </span>
                  </>
                ) : (
                  <span className="text-[#F3ECE7] font-bold text-lg">
                    $ {currentPrice.toFixed(2)}
                  </span>
                )}
              </>
            );
          })()}
        </div>

        {/* Stock Alert */}
        {isLimitedStock && (
          <div className="text-[#8A0101] text-sm mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-[#8A0101] rounded-full animate-pulse"></div>
            <span className="font-medium">
              Restam apenas {product.stockCount || product.inventory_quantity || (product.limited ? 3 : 5)} unidades!
            </span>
          </div>
        )}

        {/* Product Description Preview (if available) */}
        {product.description && (
          <p className="text-[#F3ECE7]/70 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Rating (if available) */}
        {product.rating && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-600'}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-[#F3ECE7]/60 text-sm">({product.reviewCount || 0})</span>
          </div>
        )}

        {/* Color and Size Selection - Desktop (hover) */}
        {!isMobile && product.variants && product.variants.length > 1 && (
          <div className={`absolute bottom-20 left-4 right-4 transition-all duration-500 ease-out z-30 ${
            isHovered ? 'translate-y-0 opacity-75' : 'translate-y-8 opacity-0 pointer-events-none'
          }`}>
            <div className="bg-[#1C1C1C]/95 backdrop-blur-sm border border-[#4B014E]/30 rounded-lg p-3 shadow-xl">
              
              {/* Color Selection */}
              {getProductColors(product).length > 0 && (
                <div className="mb-3">
                  <div className="flex gap-2 justify-center flex-wrap">
                    {getProductColors(product).map((color) => (
                      <button
                        key={color}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectColor(color);
                        }}
                        className={`w-6 h-6 rounded-full border-2 transition-all duration-200 relative ${
                          selectedColor === color 
                            ? 'border-[#F3ECE7] scale-110 shadow-lg' 
                            : 'border-[#4B014E]/40 hover:border-[#F3ECE7]/60 hover:scale-105'
                        }`}
                        style={{ backgroundColor: getColorCode(color) }}
                        title={color}
                        disabled={!getProductSizes(product).some(size => isVariantAvailable(product, color, size))}
                      >
                        {selectedColor === color && (
                          <div className="absolute inset-0 rounded-full bg-white/20 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Size Selection */}
              {getProductSizes(product).length > 0 && (
                <div>
                  <div className="flex gap-1 justify-center flex-wrap">
                    {getProductSizes(product).map((size) => {
                      const isAvailable = selectedColor ? isVariantAvailable(product, selectedColor, size) : false;
                      const isSelected = selectedSize === size;
                      
                      return (
                        <button
                          key={size}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAvailable) selectSize(size);
                          }}
                          disabled={!isAvailable}
                          className={`min-w-[32px] h-8 px-2 rounded-full text-xs font-medium transition-all duration-200 flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#8A0101] text-white shadow-lg scale-110' 
                              : isAvailable
                              ? 'bg-[#2A2A2A] text-[#F3ECE7]/80 hover:bg-[#4B014E]/50 hover:scale-105'
                              : 'bg-[#1A1A1A] text-[#F3ECE7]/30 cursor-not-allowed opacity-50'
                          }`}
                          title={isAvailable ? size : `${size} (Unavailable)`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              
            </div>
          </div>
        )}

        {/* Color and Size Selection - Mobile */}
        {isMobile && product.variants && product.variants.length > 1 && (
          <div className={`absolute bottom-4 left-4 right-4 transition-all duration-300 ${
            showVariants ? 'translate-y-0 opacity-75' : 'translate-y-full opacity-0'
          }`}>
            <div className="bg-[#1C1C1C]/95 backdrop-blur-sm border border-[#4B014E]/30 rounded-lg p-3">
              
              {/* Color Selection */}
              {getProductColors(product).length > 0 && (
                <div className="mb-3">
                  <p className="text-[#F3ECE7] text-xs font-medium mb-2 text-center">Color</p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {getProductColors(product).map((color) => (
                      <button
                        key={color}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectColor(color);
                        }}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 relative ${
                          selectedColor === color 
                            ? 'border-[#F3ECE7] scale-110 shadow-lg' 
                            : 'border-[#4B014E]/40 hover:border-[#F3ECE7]/60 hover:scale-105'
                        }`}
                        style={{ backgroundColor: getColorCode(color) }}
                        title={color}
                        disabled={!getProductSizes(product).some(size => isVariantAvailable(product, color, size))}
                      >
                        {selectedColor === color && (
                          <div className="absolute inset-0 rounded-full bg-white/20 flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Size Selection */}
              {getProductSizes(product).length > 0 && (
                <div>
                  <p className="text-[#F3ECE7] text-xs font-medium mb-2 text-center">Size</p>
                  <div className="grid grid-cols-4 gap-2">
                    {getProductSizes(product).map((size) => {
                      const isAvailable = selectedColor ? isVariantAvailable(product, selectedColor, size) : false;
                      const isSelected = selectedSize === size;
                      
                      return (
                        <button
                          key={size}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAvailable) selectSize(size);
                          }}
                          disabled={!isAvailable}
                          className={`h-10 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#8A0101] to-[#4B014E] text-white shadow-lg' 
                              : isAvailable
                              ? 'bg-[#2A2A2A] text-[#F3ECE7]/80 border border-[#4B014E]/30 hover:bg-[#4B014E]/30'
                              : 'bg-[#1A1A1A] text-[#F3ECE7]/30 cursor-not-allowed opacity-50 border border-[#333]/30'
                          }`}
                          title={isAvailable ? size : `${size} (Unavailable)`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              
            </div>
          </div>
        )}

        {/* Hover Actions */}
        <div className={`transition-all duration-300 overflow-hidden z-20 relative ${
          isHovered && !isMobile ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <button 
            className="w-full bg-gradient-to-r from-[#8A0101] to-[#4B014E] text-[#F3ECE7] py-3 font-medium hover:shadow-lg hover:shadow-[#8A0101]/30 transition-all duration-300 transform hover:scale-105 rounded-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            onClick={handleAddToCart}
            disabled={!selectedVariant || !selectedVariant.availableForSale || isAddingToCart}
          >
            {isAddingToCart ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : !selectedVariant ? (
              'Select Options'
            ) : !selectedVariant.availableForSale ? (
              'Sold Out'
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>

        {/* Mobile Action Button */}
        {isMobile && (
          <div className="mt-3">
            <button 
              className="w-full bg-gradient-to-r from-[#8A0101] to-[#4B014E] text-[#F3ECE7] py-3 font-medium hover:shadow-lg hover:shadow-[#8A0101]/30 transition-all duration-300 rounded-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={handleAddToCart}
              disabled={!selectedVariant || !selectedVariant.availableForSale || isAddingToCart}
            >
              {isAddingToCart ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : !selectedVariant ? (
                'Select Options'
              ) : !selectedVariant.availableForSale ? (
                'Sold Out'
              ) : (
                'Add to Cart'
              )}
            </button>
          </div>
        )}
      </div>

        {/* Mobile tap indicator para variantes */}
        {isMobile && product.variants && product.variants.length > 1 && (
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-[#1C1C1C]/90 backdrop-blur-sm border border-[#4B014E]/30 rounded-lg px-3 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#8A0101] rounded-full animate-pulse"></div>
                <span className="text-[#F3ECE7] text-xs font-medium">
                  {selectedColor && selectedSize ? `${selectedColor}/${selectedSize}` : 'Tap to select'}
                </span>
              </div>
            </div>
          </div>
        )}

      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-[#4B014E]/20" />
    </div>
  );
};

export default CarouselSection;