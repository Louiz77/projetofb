import { ChevronLeft, ChevronRight, Star, Heart, Eye } from "lucide-react";
import { useState } from "react";

const KitsSection = ({ }) => {
  const [maleKitIndex, setMaleKitIndex] = useState(0);
  const [femaleKitIndex, setFemaleKitIndex] = useState(0);

  const kits = [
    { 
      id: 1, 
      name: "Dark Prince Kit", 
      price: 449, 
      originalPrice: 529,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop", 
      gender: "male",
      items: [
        { name: "Camiseta", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop" },
        { name: "Jaqueta", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop" },
        { name: "Calça", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop" }
      ],
      rating: 4.8,
      isPromotion: true
    },
    { 
      id: 2, 
      name: "Shadow Warrior Kit", 
      price: 389, 
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop", 
      gender: "male",
      items: [
        { name: "Tank Top", image: "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=300&h=300&fit=crop" },
        { name: "Shorts", image: "https://images.unsplash.com/photo-1506629905607-e9e501629f83?w=300&h=300&fit=crop" },
        { name: "Boné", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&h=300&fit=crop" }
      ],
      rating: 4.7,
      isLimitedStock: true,
      stockCount: 8
    },
    { 
      id: 3, 
      name: "Urban Rebel Kit", 
      price: 459, 
      originalPrice: 529,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop", 
      gender: "male",
      items: [
        { name: "Hoodie", image: "https://images.unsplash.com/photo-1556821840-3a9c6c1b0520?w=300&h=300&fit=crop" },
        { name: "Calça Cargo", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=300&fit=crop" },
        { name: "Tênis", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop" }
      ],
      rating: 4.6,
      isPromotion: true
    },
    { 
      id: 4, 
      name: "Mystical Kit", 
      price: 399, 
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop", 
      gender: "male",
      items: [
        { name: "Regata", image: "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=300&h=300&fit=crop" },
        { name: "Bermuda", image: "https://images.unsplash.com/photo-1506629905607-e9e501629f83?w=300&h=300&fit=crop" }
      ],
      rating: 4.5
    },
    { 
      id: 5, 
      name: "Shadow Queen Kit", 
      price: 519, 
      originalPrice: 649,
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop", 
      gender: "female",
      items: [
        { name: "Top Cropped", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop" },
        { name: "Saia", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop" },
        { name: "Meias", image: "https://images.unsplash.com/photo-1586281002406-c954bb5c23dd?w=300&h=300&fit=crop" }
      ],
      rating: 4.9,
      isPromotion: true
    },
    { 
      id: 6, 
      name: "Rebel Princess Kit", 
      price: 479, 
      image: "https://images.unsplash.com/photo-1494790108755-2616c056ca96?w=400&h=500&fit=crop", 
      gender: "female",
      items: [
        { name: "Vestido", image: "https://images.unsplash.com/photo-1566479179817-c0b2bbadccca?w=300&h=300&fit=crop" },
        { name: "Jaqueta", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop" },
        { name: "Botas", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop" }
      ],
      rating: 4.8,
      isNew: true
    },
    { 
      id: 7, 
      name: "Dark Angel Kit", 
      price: 399, 
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop", 
      gender: "female",
      items: [
        { name: "Blusa Mesh", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop" },
        { name: "Shorts", image: "https://images.unsplash.com/photo-1506629905607-e9e501629f83?w=300&h=300&fit=crop" },
        { name: "Acessórios", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop" }
      ],
      rating: 4.7,
      isLimitedStock: true,
      stockCount: 5
    }
  ];

  const maleKits = kits.filter(kit => kit.gender === 'male');
  const femaleKits = kits.filter(kit => kit.gender === 'female');

  const itemsPerView = window.innerWidth < 768 ? 2 : 4;
  const maxMaleIndex = Math.max(0, maleKits.length - itemsPerView);
  const maxFemaleIndex = Math.max(0, femaleKits.length - itemsPerView);

  const navigateCarousel = (type, direction) => {
    if (type === 'male') {
      setMaleKitIndex(prev => {
        if (direction === 'left') {
          return Math.max(0, prev - 1);
        } else {
          return Math.min(maxMaleIndex, prev + 1);
        }
      });
    } else {
      setFemaleKitIndex(prev => {
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
        
        {/* Main Layout: Hero + Kits */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Hero Banner - Lado Esquerdo */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden h-[700px] group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop"
                alt="Kits promocionais"
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
                  ARCANE ELEGANCE
                </h2>
                <p className="text-lg mb-6" style={{ color: '#F3ECE7' }}>
                  SHOP OCCASION
                </p>
                <button 
                  className="self-start px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#F3ECE7', color: '#1C1C1C' }}
                >
                  SHOP NOW
                </button>
              </div>
            </div>
          </div>

          {/* Kits Grid - Lado Direito */}
          <div className="lg:col-span-7">
            
            {/* Kits Masculinos */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold" style={{ color: '#F3ECE7' }}>KITS MASCULINOS</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => navigateCarousel('male', 'left')}
                    disabled={maleKitIndex === 0}
                    className={`w-8 h-8 rounded-full border transition-all duration-300 flex items-center justify-center ${
                      maleKitIndex === 0 
                        ? 'border-gray-600 text-gray-600 cursor-not-allowed' 
                        : 'text-white hover:scale-110'
                    }`}
                    style={{ 
                      borderColor: maleKitIndex === 0 ? '#666' : '#A80101',
                      backgroundColor: maleKitIndex === 0 ? 'transparent' : '#A80101'
                    }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => navigateCarousel('male', 'right')}
                    disabled={maleKitIndex >= maxMaleIndex}
                    className={`w-8 h-8 rounded-full border transition-all duration-300 flex items-center justify-center ${
                      maleKitIndex >= maxMaleIndex 
                        ? 'border-gray-600 text-gray-600 cursor-not-allowed' 
                        : 'text-white hover:scale-110'
                    }`}
                    style={{ 
                      borderColor: maleKitIndex >= maxMaleIndex ? '#666' : '#A80101',
                      backgroundColor: maleKitIndex >= maxMaleIndex ? 'transparent' : '#A80101'
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {maleKits.slice(maleKitIndex, maleKitIndex + itemsPerView).map((kit) => (
                  <KitCard key={kit.id} kit={kit} />
                ))}
              </div>
            </div>

            {/* Kits Femininos */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold" style={{ color: '#F3ECE7' }}>KITS FEMININOS</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => navigateCarousel('female', 'left')}
                    disabled={femaleKitIndex === 0}
                    className={`w-8 h-8 rounded-full border transition-all duration-300 flex items-center justify-center ${
                      femaleKitIndex === 0 
                        ? 'border-gray-600 text-gray-600 cursor-not-allowed' 
                        : 'text-white hover:scale-110'
                    }`}
                    style={{ 
                      borderColor: femaleKitIndex === 0 ? '#666' : '#4B014E',
                      backgroundColor: femaleKitIndex === 0 ? 'transparent' : '#4B014E'
                    }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => navigateCarousel('female', 'right')}
                    disabled={femaleKitIndex >= maxFemaleIndex}
                    className={`w-8 h-8 rounded-full border transition-all duration-300 flex items-center justify-center ${
                      femaleKitIndex >= maxFemaleIndex 
                        ? 'border-gray-600 text-gray-600 cursor-not-allowed' 
                        : 'text-white hover:scale-110'
                    }`}
                    style={{ 
                      borderColor: femaleKitIndex >= maxFemaleIndex ? '#666' : '#4B014E',
                      backgroundColor: femaleKitIndex >= maxFemaleIndex ? 'transparent' : '#4B014E'
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {femaleKits.slice(femaleKitIndex, femaleKitIndex + itemsPerView).map((kit) => (
                  <KitCard key={kit.id} kit={kit} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Componente de Card do Kit
const KitCard = ({ kit }) => {
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

          {/* View Items Button */}
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

          {/* Badges */}
          {(kit.isPromotion || kit.isNew || kit.isLimitedStock) && (
            <div className="absolute bottom-2 left-2 z-10">
              {kit.isPromotion && (
                <span className="text-white px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#A80101' }}>
                  SALE
                </span>
              )}
              {kit.isNew && (
                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                  NEW
                </span>
              )}
              {kit.isLimitedStock && (
                <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                  {kit.stockCount} LEFT
                </span>
              )}
            </div>
          )}

          {/* Image */}
          <div className="aspect-[3/4] overflow-hidden">
            <img
              src={kit.image}
              alt={kit.name}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isHovered ? 'scale-105' : 'scale-100'
              }`}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <h4 className="font-medium text-sm mb-1 line-clamp-1" style={{ color: '#1C1C1C' }}>
            {kit.name}
          </h4>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs" style={{ color: '#1C1C1C' }}>{kit.rating}</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            {kit.originalPrice && (
              <span className="text-gray-500 line-through text-xs">
                ${kit.originalPrice}
              </span>
            )}
            <span className="font-bold text-sm" style={{ color: '#1C1C1C' }}>
              ${kit.price}
            </span>
          </div>
        </div>
      </div>

      {/* Items Overlay */}
      {showItems && (
        <div 
          className="absolute inset-0 z-20 p-3 rounded-lg flex flex-col"
          style={{ backgroundColor: 'rgba(28, 28, 28, 0.95)' }}
        >
          <div className="flex justify-between items-center mb-3">
            <h5 className="text-sm font-bold" style={{ color: '#F3ECE7' }}>Itens do Kit</h5>
            <button
              onClick={() => setShowItems(false)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: '#A80101' }}
            >
              ×
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 gap-2">
              {kit.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: 'rgba(243, 236, 231, 0.1)' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                  <span className="text-xs" style={{ color: '#F3ECE7' }}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <button
            className="mt-3 w-full py-2 rounded font-medium text-sm transition-all duration-200 hover:scale-105"
            style={{ backgroundColor: kit.gender === 'male' ? '#A80101' : '#4B014E', color: '#F3ECE7' }}
          >
            Adicionar ao Carrinho
          </button>
        </div>
      )}
    </div>
  );
};

export default KitsSection;