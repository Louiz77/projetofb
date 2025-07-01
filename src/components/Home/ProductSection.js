  import { ChevronLeft, ChevronRight, Star, Heart, Eye, X, ArrowLeft, ArrowRight, ShoppingCart } from "lucide-react";
  import { useState, useEffect } from "react";

  const ProductSection = ({ 
    collections, 
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

 const transformedCollections = Array.isArray(collections)
    ? collections.map(collection => {
        const gender = collection.name?.includes('Men') || collection.name?.toLowerCase().includes('homem') ? 'male'
                    : collection.name?.includes('Women') || collection.name?.toLowerCase().includes('mulher') ? 'female'
                    : 'unisex';

        return {
          id: collection.id,
          name: collection.name,
          image: collection.image || "https://via.placeholder.com/400x500",
          description: collection.description || '',
          gender,
          items: (collection.products || []).map(product => ({
            id: product.id,
            name: product.name || "Produto sem nome",
            image: product.image || "https://via.placeholder.com/400x500",
          }))
        };
      })
    : [];

  console.log(transformedCollections)

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

  return (
    <section className="py-12" style={{ backgroundColor: '#1C1C1C' }}>
      <div className="container mx-auto px-4">
        
        {/* Main Layout: Hero + Products */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Hero Banner - Lado Esquerdo */}
          <div className="lg:col-span-5 flex mt-2">
            <div className="relative overflow-hidden w-full group cursor-pointer">
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

              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <h2 className="text-4xl font-bold mb-2" style={{ color: '#F3ECE7' }}>
                  {heroTitle || collections.name || 'ARCANE ELEGANCE'}
                </h2>
                <p className="text-lg mb-6" style={{ color: '#F3ECE7' }}>
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
                {maleCollections.map(collection => (
                  <div key={collection.id}>
                    <h4 className="text-lg font-semibold text-white mb-2">{collection.name}</h4>
                      <CollectionCard key={collection.id} collection={collection} />
                  </div>
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
                {femaleCollections.map(collection => (
                  <div key={collection.id}>
                    <h4 className="text-lg font-semibold text-white mb-2">{collection.name}</h4>
                      <CollectionCard key={collection.id} collection={collection} />
                  </div>
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
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
                <span className="text-white px-2 py-1 rounded text-xs font-medium mr-1" style={{ backgroundColor: '#A80101' }}>
                  SALE
                </span>
              )}
              {product.isNew && (
                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium mr-1">
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

const CollectionModal = ({ collection, isOpen, onClose }) => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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
      setCurrentItemIndex((prev) => 
        prev === collection.items.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentItemIndex((prev) => 
        prev === 0 ? collection.items.length - 1 : prev - 1
      );
    }
  };

  if (!isOpen) return null;

  const currentItem = collection.items[currentItemIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        style={{
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)'
        }}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100">
        {/* Header */}
        <div 
          className="relative px-6 py-4 text-white"
          style={{
            background: 'linear-gradient(135deg, #1C1C1C 0%, #2D2D2D 50%, #1C1C1C 100%)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-wide">{collection.name}</h2>
              <p className="text-sm opacity-80 mt-1">
                {collection.items.length} {collection.items.length === 1 ? 'item' : 'itens'} na coleção
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 z-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <div className="w-full h-full bg-gradient-to-br from-white to-transparent rounded-full transform rotate-45"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row h-full">
          {/* Main Item Display */}
          <div className="flex-1 relative bg-gradient-to-br from-gray-50 to-white p-6">
            {/* Navigation Arrows */}
            {collection.items.length > 1 && (
              <>
                <button
                  onClick={() => navigateItem('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ color: '#4B014E' }}
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  onClick={() => navigateItem('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ color: '#4B014E' }}
                >
                  <ArrowRight size={20} />
                </button>
              </>
            )}

            {/* Current Item */}
            <div className="h-full flex flex-col items-center justify-center">
              <div className="relative mb-6">
                <div 
                  className="absolute inset-0 rounded-2xl blur-xl opacity-30"
                  style={{ backgroundColor: '#4B014E' }}
                />
                <img
                  src={currentItem.image}
                  alt={currentItem.name}
                  className={`relative w-80 h-80 object-cover rounded-2xl shadow-2xl transition-all duration-300 ${
                    isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
                  }`}
                />
                
                {/* Item number badge */}
                <div 
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                  style={{ backgroundColor: '#4B014E' }}
                >
                  {currentItemIndex + 1}
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#1C1C1C' }}>
                  {currentItem.name}
                </h3>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium" style={{ color: '#1C1C1C' }}>
                      4.8
                    </span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm" style={{ color: '#1C1C1C' }}>
                    Item {currentItemIndex + 1} de {collection.items.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 bg-white border-l border-gray-100 flex flex-col">
            {/* Items Grid */}
            <div className="flex-1 p-6">
              <h4 className="text-lg font-bold mb-4" style={{ color: '#1C1C1C' }}>
                Todos os Itens
              </h4>
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {collection.items.map((item, index) => (
                  <button
                    key={item.id || index}
                    onClick={() => setCurrentItemIndex(index)}
                    className={`relative group aspect-square rounded-xl overflow-hidden transition-all duration-200 ${
                      index === currentItemIndex 
                        ? 'ring-2 ring-offset-2 scale-105 shadow-lg' 
                        : 'hover:scale-105 hover:shadow-md'
                    }`}
                    style={{
                      ringColor: index === currentItemIndex ? '#4B014E' : 'transparent'
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    
                    {/* Overlay */}
                    <div className={`absolute inset-0 transition-opacity duration-200 ${
                      index === currentItemIndex 
                        ? 'bg-purple-900/20' 
                        : 'bg-black/0 group-hover:bg-black/20'
                    }`} />
                    
                    {/* Item number */}
                    <div 
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: '#4B014E' }}
                    >
                      {index + 1}
                    </div>
                    
                    {/* Name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-xs font-medium truncate">
                        {item.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-100 space-y-3">
              <button
                className="w-full py-4 font-bold text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, #4B014E 0%, #6B0261 50%, #4B014E 100%)',
                  boxShadow: '0 4px 20px rgba(75, 1, 78, 0.3)'
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <ShoppingCart size={18} />
                  ADICIONAR COLEÇÃO
                </span>
                <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
              
              <button
                className="w-full py-4 font-bold rounded-xl transition-all duration-300 hover:scale-105 border-2 hover:shadow-lg"
                style={{
                  color: '#4B014E',
                  borderColor: '#4B014E',
                  backgroundColor: 'transparent'
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <Heart size={18} />
                  ADICIONAR AOS FAVORITOS
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        {collection.items.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {collection.items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentItemIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentItemIndex ? 'w-8' : 'hover:scale-125'
                }`}
                style={{
                  backgroundColor: index === currentItemIndex ? '#4B014E' : 'rgba(75, 1, 78, 0.3)'
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
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

  const hasItems = Array.isArray(collection.items) && collection.items.length > 0;

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
                className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:text-white transition-all duration-200 hover:scale-110 shadow-sm"
                onMouseEnter={(e) => e.target.style.backgroundColor = '#A80101'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.9)'}
              >
                <Heart size={14} />
              </button>
            </div>

            {/* Ícone visualizar itens */}
            {hasItems && (
              <div className="absolute top-2 left-2 z-10">
                <button
                  onClick={handleItemView}
                  className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:text-white transition-all duration-200 hover:scale-110 shadow-sm"
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#4B014E'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.9)'}
                >
                  <Eye size={14} />
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
                  {collection.items.length} itens
                </div>
              </div>
            )}

            {/* Imagem da coleção */}
            <div className="aspect-[3/4] overflow-hidden ">
              <img
                src={collection.image}
                alt={collection.name}
                className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
              />
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="p-4">
            <h4 className="font-semibold text-sm mb-2 line-clamp-1" style={{ color: '#1C1C1C' }}>
              {collection.name}
            </h4>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium" style={{ color: '#1C1C1C' }}>4.5</span>
            </div>

            {/* Faixa de preço */}
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
        collection={collection}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default ProductSection;