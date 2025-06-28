import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const CarouselSection = ({ title, products, id }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('TODOS');
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef(null);
  const autoSlideRef = useRef(null);
  
  // Touch handling states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Responsive items per view - mais eficiente para diferentes telas
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    if (width < 640) return 1;      // Mobile
    if (width < 768) return 2;      // Small tablets
    if (width < 1024) return 3;     // Medium tablets
    return 4;                       // Desktop
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView);

  // Filter products based on selection
  const filteredProducts = products.filter(product => {
    if (selectedFilter === 'TODOS') return true;
    return product.category?.toUpperCase() === selectedFilter;
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

  // Cálculo dinâmico do maxIndex baseado no número real de produtos
  const maxIndex = Math.max(0, organizedProducts.length - itemsPerView);
  
  // Touch handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
    stopAutoSlide();
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      if (hasMultipleSlides) setTimeout(() => startAutoSlide(), 3000);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    } else if (isRightSwipe) {
      setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }

    setIsDragging(false);
    if (hasMultipleSlides) setTimeout(() => startAutoSlide(), 3000);
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

  // Early return se não há produtos
  if (!products || products.length === 0) {
    return (
      <section className="py-12 md:py-20 bg-[#1C1C1C]">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-[#F3ECE7] mb-4">{title}</h2>
          <p className="text-[#F3ECE7]/60">Nenhum produto disponível no momento.</p>
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

  const stopAutoSlide = () => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = null;
    }
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
        if (filter === 'TODOS') return true;
        return product.category?.toUpperCase() === filter;
      });
      
      // Só reinicia auto-slide se há produtos suficientes
      if (newFilteredProducts.length > itemsPerView) {
        startAutoSlide();
      }
    }, 1000);
  };

  // Função para obter as cores do tema baseado no filtro selecionado
  const getThemeColors = () => {
    switch (selectedFilter) {
      case 'TODOS':
        return {
          primary: '#F3ECE7', // Branco
          secondary: '#1C1C1C', // Preto
          border: '#F3ECE7',
          gradient: 'from-[#F3ECE7] to-[#F3ECE7]'
        };
      case 'MULHER':
        return {
          primary: '#8A0101', // Vermelho
          secondary: '#8A0101',
          border: '#8A0101',
          gradient: 'from-[#8A0101] to-[#8A0101]'
        };
      case 'HOMEM':
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
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #8A0101 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, #4B014E 0%, transparent 50%)`,
          backgroundSize: '200px 200px'
        }} />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 md:mb-12 gap-6">
          <div className="space-y-6 flex-1">
            {/* Título alinhado à esquerda */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <h2 className="text-3xl md:text-5xl font-bold text-[#F3ECE7] relative">
                {title}
                <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-[#8A0101] to-[#4B014E]" />
              </h2>
              
              {/* Botão "Ver Todos" no canto direito */}
              <button 
                className={`flex items-center gap-2 mt-3 px-4 py-2 transition-all duration-300 group self-start md:self-center border-2 ${
                  selectedFilter === 'TODOS' 
                    ? 'bg-[#F3ECE7] text-[#1C1C1C] border-[#F3ECE7]'
                    : selectedFilter === 'MULHER'
                    ? 'bg-[#8A0101] text-[#F3ECE7] border-[#8A0101] hover:bg-[#8A0101]/80'
                    : selectedFilter === 'HOMEM'
                    ? 'bg-[#4B014E] text-[#F3ECE7] border-[#4B014E] hover:bg-[#4B014E]/80'
                    : 'bg-transparent text-[#F3ECE7] border-[#4B014E] hover:bg-[#4B014E]'
                }`}
              >
                <Eye size={18} className="group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">Ver Todos</span>
              </button>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {['TODOS', 'HOMEM', 'MULHER'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  className={`px-6 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden group border-2 ${
                    selectedFilter === filter
                      ? filter === 'TODOS'
                        ? 'bg-[#F3ECE7] text-[#1C1C1C] border-[#F3ECE7] shadow-lg shadow-[#F3ECE7]/25'
                        : filter === 'MULHER'
                        ? 'bg-[#8A0101] text-[#F3ECE7] border-[#8A0101] shadow-lg shadow-[#8A0101]/25'
                        : 'bg-[#4B014E] text-[#F3ECE7] border-[#4B014E] shadow-lg shadow-[#4B014E]/25'
                      : 'bg-transparent text-[#F3ECE7] border-[#4B014E] hover:bg-[#4B014E]/20'
                  }`}
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
          {!isMobile && hasMultipleSlides && (
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
            className="overflow-hidden touch-pan-x"
            onMouseEnter={!isMobile && hasMultipleSlides ? stopAutoSlide : undefined}
            onMouseLeave={!isMobile && hasMultipleSlides ? startAutoSlide : undefined}
            onTouchStart={isMobile ? onTouchStart : undefined}
            onTouchMove={isMobile ? onTouchMove : undefined}
            onTouchEnd={isMobile ? onTouchEnd : undefined}
          >
            <div
              className={`flex transition-transform duration-700 ease-in-out gap-4 md:gap-6 ${
                isDragging ? 'transition-none' : ''
              }`}
              style={{
                transform: `translateX(-${(currentIndex * 100) / organizedProducts.length}%)`,
                width: `${organizedProducts.length * (100 / itemsPerView)}%`
              }}
            >
              {organizedProducts.map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="flex-shrink-0"
                  style={{
                    width: `${100 / itemsPerView}%`,
                    maxWidth: '300px',
                  }}
                >
                  <EnhancedProductCard 
                    product={product} 
                    isVisible={index >= currentIndex && index < currentIndex + itemsPerView}
                    isMobile={isMobile}
                  />
                </div>
              ))}

            </div>
          </div>

          {/* Gradient Overlays */}
          {!isMobile && (
            <>
              <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-[#1C1C1C] via-[#1C1C1C]/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-[#1C1C1C] via-[#1C1C1C]/80 to-transparent z-10 pointer-events-none" />
            </>
          )}

          {/* Mobile Swipe Hint */}
          {isMobile && hasMultipleSlides && (
            <div className="absolute bottom-4 right-4 text-[#F3ECE7]/60 text-xs flex items-center gap-1">
              <span>Deslize</span>
              <ChevronRight size={12} />
            </div>
          )}
        </div>

        {/* Progress Indicators - só mostra se há múltiplos slides */}
        {hasMultipleSlides && maxIndex > 0 && !isMobile && (
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

const EnhancedProductCard = ({ product, isVisible, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className={`relative bg-[#1C1C1C] border border-[#4B014E]/20 overflow-hidden transform transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-60'
      } ${isHovered && !isMobile ? 'scale-105 shadow-2xl shadow-[#8A0101]/20' : ''} group`}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {/* Priority Labels */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {product.isPromotion && (
          <span className="bg-[#8A0101] text-[#F3ECE7] px-3 py-1 text-xs font-bold shadow-lg relative overflow-hidden">
            PROMOÇÃO
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </span>
        )}
        {product.isLimitedStock && (
          <span className="bg-gradient-to-r from-[#8A0101] to-[#4B014E] text-[#F3ECE7] px-3 py-1 text-xs font-bold shadow-lg">
            ÚLTIMAS UNIDADES
          </span>
        )}
        {product.isNew && !product.isPromotion && !product.isLimitedStock && (
          <span className="bg-[#4B014E] text-[#F3ECE7] px-3 py-1 text-xs font-bold shadow-lg">
            NOVO
          </span>
        )}
      </div>

      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[3/4] bg-[#1C1C1C]">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#4B014E]/20 to-[#8A0101]/20 animate-pulse" />
        )}
        
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isHovered ? 'scale-110' : 'scale-100'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
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
        <h3 className="text-[#F3ECE7] font-semibold text-base md:text-lg mb-3 line-clamp-2 leading-tight">
          {product.name}
        </h3>
        
        {/* Pricing */}
        <div className="flex items-center gap-3 mb-4">
          {product.isPromotion ? (
            <>
              <span className="text-[#F3ECE7]/60 line-through text-sm">
                $ {product.originalPrice?.toFixed(2)}
              </span>
              <span className="text-[#8A0101] font-bold text-lg">
                $ {product.price?.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-[#F3ECE7] font-bold text-lg">
              $ {product.price?.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Alert */}
        {product.isLimitedStock && (
          <div className="text-[#8A0101] text-sm mb-3">
            <span className="font-medium">Restam apenas {product.stockCount || 3} unidades!</span>
          </div>
        )}

        {/* Hover Actions */}
        <div className={`transition-all duration-300 overflow-hidden ${
          isHovered && !isMobile ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <button className="w-full bg-gradient-to-r from-[#8A0101] to-[#4B014E] text-[#F3ECE7] py-3 font-medium hover:shadow-lg hover:shadow-[#8A0101]/30 transition-all duration-300 transform hover:scale-105">
            Adicionar ao Carrinho
          </button>
        </div>
      </div>

      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-[#4B014E]/20" />
    </div>
  );
};

export default CarouselSection;