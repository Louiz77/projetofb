import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import ProductCard from "./ProductCard";

const CarouselSection = ({ title, products, id }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('TODOS');
  const carouselRef = useRef(null);
  const autoSlideRef = useRef(null);

  // Filtrar produtos baseado na seleção
  const filteredProducts = products.filter(product => {
    if (selectedFilter === 'TODOS') return true;
    return product.category?.toUpperCase() === selectedFilter;
  });

  // Organizar produtos por prioridade
  const organizedProducts = [...filteredProducts].sort((a, b) => {
    // 1. Itens promocionais primeiro
    if (a.isPromotion && !b.isPromotion) return -1;
    if (!a.isPromotion && b.isPromotion) return 1;
    
    // 2. Produtos com estoque limitado
    if (a.isLimitedStock && !b.isLimitedStock) return -1;
    if (!a.isLimitedStock && b.isLimitedStock) return 1;
    
    // 3. Novidades
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;
    
    return 0;
  });

  const itemsPerView = 6;
  const maxIndex = Math.max(0, organizedProducts.length - itemsPerView);

  // Auto-slide functionality
  const startAutoSlide = () => {
    autoSlideRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex > maxIndex) {
          // Animar "puxar para direita e voltar"
          return 0;
        }
        return nextIndex;
      });
    }, 7000);
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
  }, [maxIndex]);

  const navigateCarousel = (direction) => {
    stopAutoSlide();
    
    setCurrentIndex(prev => {
      let newIndex;
      if (direction === 'left') {
        newIndex = Math.max(0, prev - 1);
      } else {
        newIndex = Math.min(maxIndex, prev + 1);
      }
      return newIndex;
    });

    // Reiniciar auto-slide após navegação manual
    setTimeout(() => startAutoSlide(), 10000);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setCurrentIndex(0);
    stopAutoSlide();
    setTimeout(() => startAutoSlide(), 1000);
  };

  return (
    <section className="py-16 bg-gray-900 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-red-500 bg-clip-text text-transparent mb-4">
              {title}
            </h2>
            
            {/* Filtros */}
            <div className="flex gap-3">
              {['TODOS', 'HOMEM', 'MULHER'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedFilter === filter
                      ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-lg'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Botão Ver Todos */}
          <button className="flex items-center gap-2 bg-transparent border-2 border-purple-500 text-purple-400 px-6 py-3 rounded-full hover:bg-purple-500 hover:text-white transition-all duration-300 group">
            <Eye size={18} />
            <span className="font-medium">Ver Todos</span>
          </button>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Setas de Navegação */}
          {currentIndex > 0 && (
            <button
              onClick={() => navigateCarousel('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 text-white p-3 rounded-full hover:bg-black/90 transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-2"
              style={{ marginLeft: '-20px' }}
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {currentIndex < maxIndex && (
            <button
              onClick={() => navigateCarousel('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 text-white p-3 rounded-full hover:bg-black/90 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:-translate-x-2"
              style={{ marginRight: '-20px' }}
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Carousel */}
          <div 
            ref={carouselRef}
            className="overflow-hidden"
            onMouseEnter={stopAutoSlide}
            onMouseLeave={startAutoSlide}
          >
            <div
              className="flex transition-transform duration-500 ease-out gap-4"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                width: `${(organizedProducts.length / itemsPerView) * 100}%`
              }}
            >
              {organizedProducts.map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="flex-shrink-0 relative group/card"
                  style={{ width: `${100 / organizedProducts.length}%` }}
                >
                  <EnhancedProductCard 
                    product={product} 
                    isVisible={index >= currentIndex && index < currentIndex + itemsPerView}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Gradient Fade Effects */}
          <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-gray-900 to-transparent z-5 pointer-events-none" />
          <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-gray-900 to-transparent z-5 pointer-events-none" />
        </div>

        {/* Indicators */}
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? 'bg-purple-500 w-8'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Componente ProductCard Aprimorado
const EnhancedProductCard = ({ product, isVisible }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative bg-gray-800 overflow-hidden transform transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-60'
      } ${isHovered ? 'scale-105 shadow-2xl' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Etiquetas */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {product.isPromotion && (
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
            PROMOÇÃO
          </span>
        )}
        {product.isLimitedStock && (
          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            ÚLTIMAS UNIDADES
          </span>
        )}
        {product.isNew && !product.isPromotion && !product.isLimitedStock && (
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            NOVO
          </span>
        )}
      </div>

      {/* Imagem */}
      <div className="relative overflow-hidden aspect-[4/5]">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        {/* Overlay no Hover */}
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />
      </div>

      {/* Informações do Produto */}
      <div className="p-1 relative">
        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        {/* Preços */}
        <div className="flex items-center gap-3 mb-3">
          {product.isPromotion ? (
            <>
              <span className="text-gray-400 line-through text-sm">
                $ {product.originalPrice?.toFixed(2)}
              </span>
              <span className="text-red-400 font-bold text-x">
                $ {product.price?.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-white font-bold text-l">
              $ {product.price?.toFixed(2)}
            </span>
          )}
        </div>

        {/* Informações Extras no Hover */}
        <div className={`transition-all duration-300 overflow-hidden ${
          isHovered ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          {product.isLimitedStock && (
            <div className="text-orange-400 text-sm mb-2">
              <span className="font-medium">Restam apenas {product.stockCount || 3} unidades!</span>
            </div>
          )}

          {/* Informações Extras no Hover 
          <button className="w-full bg-gradient-to-r from-purple-600 to-red-600 text-white py-2 rounded-lg font-medium hover:shadow-lg transition-shadow duration-300">
            Adicionar ao Carrinho
          </button>*/}
        </div>
      </div>
    </div>
  );
};

export default CarouselSection;