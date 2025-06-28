import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const CarouselSection = ({ title, products, id }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('TODOS');
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef(null);
  const autoSlideRef = useRef(null);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const itemsPerView = isMobile ? 1 : 4;
  const maxIndex = Math.max(0, organizedProducts.length - itemsPerView);

  // Auto-slide functionality
  const startAutoSlide = () => {
    if (autoSlideRef.current) return;
    autoSlideRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1;
        return nextIndex > maxIndex ? 0 : nextIndex;
      });
    }, 5000);
  };

  const stopAutoSlide = () => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = null;
    }
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [maxIndex, organizedProducts.length]);

  const navigateCarousel = (direction) => {
    stopAutoSlide();
    
    setCurrentIndex(prev => {
      if (direction === 'left') {
        return Math.max(0, prev - 1);
      } else {
        return Math.min(maxIndex, prev + 1);
      }
    });

    setTimeout(() => startAutoSlide(), 8000);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setCurrentIndex(0);
    stopAutoSlide();
    setTimeout(() => startAutoSlide(), 1000);
  };

  return (
    <section className="py-12 md:py-20 bg-[#1C1C1C] relative overflow-hidden">
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
          <div className="space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-[#F3ECE7] relative">
              {title}
              <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-[#8A0101] to-[#4B014E]" />
            </h2>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {['TODOS', 'HOMEM', 'MULHER'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  className={`px-6 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden group ${
                    selectedFilter === filter
                      ? 'bg-[#8A0101] text-[#F3ECE7] shadow-lg shadow-[#8A0101]/25'
                      : 'bg-transparent text-[#F3ECE7] border border-[#4B014E] hover:bg-[#4B014E]/20'
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

          {/* View All Button */}
          <button className="flex items-center gap-3 bg-transparent border-2 border-[#4B014E] text-[#F3ECE7] px-6 py-3 hover:bg-[#4B014E] transition-all duration-300 group self-start">
            <Eye size={18} className="group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium">Ver Todos</span>
          </button>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Navigation Arrows */}
          {!isMobile && currentIndex > 0 && (
            <button
              onClick={() => navigateCarousel('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-[#1C1C1C]/90 backdrop-blur-sm text-[#F3ECE7] p-4 hover:bg-[#8A0101] transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-6 group-hover:-translate-x-2 border border-[#4B014E]/30"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {!isMobile && currentIndex < maxIndex && (
            <button
              onClick={() => navigateCarousel('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-[#1C1C1C]/90 backdrop-blur-sm text-[#F3ECE7] p-4 hover:bg-[#8A0101] transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-6 group-hover:translate-x-2 border border-[#4B014E]/30"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => navigateCarousel('left')}
                disabled={currentIndex === 0}
                className="bg-[#1C1C1C] text-[#F3ECE7] p-3 border border-[#4B014E] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#8A0101] transition-colors duration-300"
              >
                <ChevronLeft size={20} />
              </button>
              
              <span className="text-[#F3ECE7] text-sm font-medium">
                {currentIndex + 1} / {maxIndex + 1}
              </span>
              
              <button
                onClick={() => navigateCarousel('right')}
                disabled={currentIndex === maxIndex}
                className="bg-[#1C1C1C] text-[#F3ECE7] p-3 border border-[#4B014E] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#8A0101] transition-colors duration-300"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Carousel */}
          <div 
            ref={carouselRef}
            className="overflow-hidden"
            onMouseEnter={!isMobile ? stopAutoSlide : undefined}
            onMouseLeave={!isMobile ? startAutoSlide : undefined}
          >
            <div
              className="flex transition-transform duration-700 ease-in-out gap-4 md:gap-6"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                width: `${(organizedProducts.length / itemsPerView) * 100}%`
              }}
            >
              {organizedProducts.map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="flex-shrink-0"
                  style={{ width: `${100 / organizedProducts.length}%` }}
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
        </div>

        {/* Progress Indicators */}
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
      </div>
    </section>
  );
};

// Enhanced Product Card Component
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

// Mock data for demonstration
const mockProducts = [
  {
    id: 1,
    name: "Camiseta Premium Masculina",
    price: 89.90,
    originalPrice: 129.90,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
    category: "HOMEM",
    isPromotion: true,
    isLimitedStock: false,
    isNew: false,
    stockCount: 5
  },
  {
    id: 2,
    name: "Vestido Elegante Feminino",
    price: 199.90,
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop",
    category: "MULHER",
    isPromotion: false,
    isLimitedStock: true,
    isNew: false,
    stockCount: 2
  },
  {
    id: 3,
    name: "Jaqueta de Couro Premium",
    price: 299.90,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop",
    category: "HOMEM",
    isPromotion: false,
    isLimitedStock: false,
    isNew: true
  },
  {
    id: 4,
    name: "Blusa Casual Feminina",
    price: 79.90,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=500&fit=crop",
    category: "MULHER",
    isPromotion: false,
    isLimitedStock: false,
    isNew: false
  },
  {
    id: 5,
    name: "Calça Jeans Masculina",
    price: 149.90,
    originalPrice: 199.90,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop",
    category: "HOMEM",
    isPromotion: true,
    isLimitedStock: false,
    isNew: false
  }
];

export default CarouselSection;