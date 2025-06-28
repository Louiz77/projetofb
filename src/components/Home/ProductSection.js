import { ChevronLeft, ChevronRight, Star, Heart, Eye, X } from "lucide-react";
import { useState } from "react";

const ProductSection = ({ 
  products, 
  sectionType = 'kits',
  heroImage,
  heroTitle,
  heroSubtitle,
  heroButton = 'SHOP NOW',
  maleLabel = 'MASCULINOS',
  femaleLabel = 'FEMININOS'
}) => {
  const [maleProductIndex, setMaleProductIndex] = useState(0);
  const [femaleProductIndex, setFemaleProductIndex] = useState(0);

  const maleProducts = products.filter(product => product.gender === 'male');
  const femaleProducts = products.filter(product => product.gender === 'female');

  const itemsPerView = window.innerWidth < 768 ? 2 : 4;
  const maxMaleIndex = Math.max(0, maleProducts.length - itemsPerView);
  const maxFemaleIndex = Math.max(0, femaleProducts.length - itemsPerView);

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

  return (
    <section className="py-12" style={{ backgroundColor: '#1C1C1C' }}>
      <div className="container mx-auto px-4">
        
        {/* Main Layout: Hero + Products */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Hero Banner - Lado Esquerdo */}
          <div className="lg:col-span-5 flex mt-2">
            <div className="relative overflow-hidden w-full group cursor-pointer">
              <img
                src={heroImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop"}
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

              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <h2 className="text-4xl font-bold mb-2" style={{ color: '#F3ECE7' }}>
                  {heroTitle || 'ARCANE ELEGANCE'}
                </h2>
                <p className="text-lg mb-6" style={{ color: '#F3ECE7' }}>
                  {heroSubtitle || 'SHOP OCCASION'}
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
          <div className="lg:col-span-7 flex flex-col">
            
            {/* Produtos Masculinos */}
            <div className="mb-8 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold" style={{ color: '#F3ECE7' }}>
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
                {maleProducts.slice(maleProductIndex, maleProductIndex + itemsPerView).map((product) => (
                  <ProductCard key={product.id} product={product} sectionType={sectionType} />
                ))}
              </div>
            </div>

            {/* Produtos Femininos */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold" style={{ color: '#F3ECE7' }}>
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
                {femaleProducts.slice(femaleProductIndex, femaleProductIndex + itemsPerView).map((product) => (
                  <ProductCard key={product.id} product={product} sectionType={sectionType} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Componente de Card do Produto
const ProductCard = ({ product, sectionType }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useState(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleItemView = () => {
    setShowItems(!showItems);
  };

  // Só mostra o botão de visualizar itens se for um kit e tiver items
  const hasItems = sectionType === 'kits' && product.items && product.items.length > 0;

  return (
    <div className="relative">
      <div
        className="bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        style={{ backgroundColor: '#F3ECE7' }}
      >
        {/* Heart Icon */}
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <button 
              className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center hover:text-white transition-colors duration-200"
              style={{ '&:hover': { backgroundColor: '#A80101' } }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#A80101'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.8)'}
            >
              <Heart size={12} />
            </button>
          </div>

          {/* View Items Button - Só aparece para kits */}
          {hasItems && (
            <div className="absolute top-2 left-2 z-10">
              <button 
                onClick={handleItemView}
                className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center hover:text-white transition-colors duration-200"
                style={{ '&:hover': { backgroundColor: '#4B014E' } }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#4B014E'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.8)'}
              >
                <Eye size={12} />
              </button>
            </div>
          )}

          {/* Badges */}
          {(product.isPromotion || product.isNew || product.isLimitedStock) && (
            <div className="absolute bottom-2 left-2 z-10">
              {product.isPromotion && (
                <span className="text-white px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#A80101' }}>
                  SALE
                </span>
              )}
              {product.isNew && (
                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                  NEW
                </span>
              )}
              {product.isLimitedStock && (
                <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                  {product.stockCount} LEFT
                </span>
              )}
            </div>
          )}

          {/* Image */}
          <div className="aspect-[3/4] overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isHovered ? 'scale-105' : 'scale-100'
              }`}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <h4 className="font-medium text-sm mb-1 line-clamp-1" style={{ color: '#1C1C1C' }}>
            {product.name}
          </h4>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs" style={{ color: '#1C1C1C' }}>{product.rating}</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            {product.originalPrice && (
              <span className="text-gray-500 line-through text-xs">
                ${product.originalPrice}
              </span>
            )}
            <span className="font-bold text-sm" style={{ color: '#1C1C1C' }}>
              ${product.price}
            </span>
          </div>
        </div>
      </div>

      {/* Items Overlay - Só para kits */}
      {hasItems && showItems && (
        <div 
          className="absolute inset-0 z-20 flex flex-col overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, rgba(28, 28, 28, 0.98) 0%, rgba(40, 40, 40, 0.98) 100%)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-white/10">
            <h5 className="text-sm font-bold tracking-wide" style={{ color: '#F3ECE7' }}>
              ITENS DO KIT
            </h5>
            <button
              onClick={() => setShowItems(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-200"
              style={{ backgroundColor: product.gender === 'male' ? '#A80101' : '#4B014E' }}
            >
              <X size={14} />
            </button>
          </div>
          
          {/* Items Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-3">
              {product.items.map((item, index) => (
                <div 
                  key={index} 
                  className="group relative overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(243, 236, 231, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    border: '1px solid rgba(243, 236, 231, 0.1)'
                  }}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
                  </div>
                  
                  <div className="relative flex items-center gap-3 p-3">
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover transition-transform duration-300 group-hover:scale-110"
                        style={{ 
                          border: `2px solid ${product.gender === 'male' ? '#A80101' : '#4B014E'}`,
                          filter: 'brightness(1.1) contrast(1.1)'
                        }}
                      />
                      <div 
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: product.gender === 'male' ? '#A80101' : '#4B014E' }}
                      >
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <span 
                        className="text-sm font-medium tracking-wide" 
                        style={{ color: '#F3ECE7' }}
                      >
                        {item.name}
                      </span>
                    </div>
                    
                    <div 
                      className="w-2 h-2 rounded-full opacity-50"
                      style={{ backgroundColor: product.gender === 'male' ? '#A80101' : '#4B014E' }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Footer Button */}
          <div className="p-4 border-t border-white/10">
            <button
              className="w-full py-3 font-medium text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${product.gender === 'male' ? '#A80101' : '#4B014E'} 0%, ${product.gender === 'male' ? '#8B0000' : '#3A0133'} 100%)`,
                color: '#F3ECE7',
                boxShadow: `0 4px 15px rgba(${product.gender === 'male' ? '168, 1, 1' : '75, 1, 78'}, 0.3)`
              }}
            >
              <span className="relative z-10 tracking-wide">ADICIONAR AO CARRINHO</span>
              <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSection;