import { ChevronLeft, ChevronRight, Star, Heart } from "lucide-react";
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
      items: ["Camiseta", "Jaqueta", "Calça"],
      rating: 4.8,
      isPromotion: true
    },
    { 
      id: 2, 
      name: "Shadow Warrior Kit", 
      price: 389, 
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop", 
      gender: "male",
      items: ["Tank Top", "Shorts", "Boné"],
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
      items: ["Hoodie", "Calça Cargo", "Tênis"],
      rating: 4.6,
      isPromotion: true
    },
    { 
      id: 4, 
      name: "Shadow Queen Kit", 
      price: 519, 
      originalPrice: 649,
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop", 
      gender: "female",
      items: ["Top Cropped", "Saia", "Meias"],
      rating: 4.9,
      isPromotion: true
    },
    { 
      id: 5, 
      name: "Rebel Princess Kit", 
      price: 479, 
      image: "https://images.unsplash.com/photo-1494790108755-2616c056ca96?w=400&h=500&fit=crop", 
      gender: "female",
      items: ["Vestido", "Jaqueta", "Botas"],
      rating: 4.8,
      isNew: true
    },
    { 
      id: 6, 
      name: "Dark Angel Kit", 
      price: 399, 
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop", 
      gender: "female",
      items: ["Blusa Mesh", "Shorts", "Acessórios"],
      rating: 4.7,
      isLimitedStock: true,
      stockCount: 5
    },
    { 
      id: 7, 
      name: "Shadow Warrior Kit", 
      price: 389, 
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop", 
      gender: "male",
      items: ["Tank Top", "Shorts", "Boné"],
      rating: 4.7,
      isLimitedStock: true,
      stockCount: 8
    },
    { 
      id: 8, 
      name: "Urban Rebel Kit", 
      price: 459, 
      originalPrice: 529,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop", 
      gender: "male",
      items: ["Hoodie", "Calça Cargo", "Tênis"],
      rating: 4.6,
      isPromotion: true
    },
  ];

  const maleKits = kits.filter(kit => kit.gender === 'male');
  const femaleKits = kits.filter(kit => kit.gender === 'female');

  const itemsPerView = 4;
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
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        
        {/* Main Layout: Hero + Kits */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Hero Banner - Lado Esquerdo */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden  h-[600px] group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop"
                alt="Kits promocionais"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/40" />
              
              {/* Badge 30% OFF */}
              <div className="absolute top-6 left-6">
                <div className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xs">%</span>
                  </div>
                  30%
                </div>
              </div>

              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <h2 className="text-4xl font-bold text-white mb-2">
                  ARCANE ELEGANCE
                </h2>
                <p className="text-lg text-gray-200 mb-6">
                  SHOP OCCASION
                </p>
                <button className="self-start bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
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
                <h3 className="text-2xl font-bold text-gray-800">KITS MASCULINOS</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => navigateCarousel('male', 'left')}
                    disabled={maleKitIndex === 0}
                    className={`w-8 h-8 rounded-full border transition-all duration-300 flex items-center justify-center ${
                      maleKitIndex === 0 
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                        : 'border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => navigateCarousel('male', 'right')}
                    disabled={maleKitIndex >= maxMaleIndex}
                    className={`w-8 h-8 rounded-full border transition-all duration-300 flex items-center justify-center ${
                      maleKitIndex >= maxMaleIndex 
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                        : 'border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {maleKits.slice(maleKitIndex, maleKitIndex + itemsPerView).map((kit) => (
                  <KitCard key={kit.id} kit={kit} />
                ))}
              </div>
            </div>

            {/* Kits Femininos */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800">KITS FEMININOS</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => navigateCarousel('female', 'left')}
                    disabled={femaleKitIndex === 0}
                    className={`w-8 h-8 rounded-full border transition-all duration-300 flex items-center justify-center ${
                      femaleKitIndex === 0 
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                        : 'border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => navigateCarousel('female', 'right')}
                    disabled={femaleKitIndex >= maxFemaleIndex}
                    className={`w-8 h-8 rounded-full border transition-all duration-300 flex items-center justify-center ${
                      femaleKitIndex >= maxFemaleIndex 
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                        : 'border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
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

// Componente de Card do Kit Compacto
const KitCard = ({ kit }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Heart Icon */}
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <button className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors duration-200">
            <Heart size={12} />
          </button>
        </div>

        {/* Badges */}
        {(kit.isPromotion || kit.isNew || kit.isLimitedStock) && (
          <div className="absolute top-2 left-2 z-10">
            {kit.isPromotion && (
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                SALE
              </span>
            )}
            {kit.isNew && (
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
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
        <h4 className="font-medium text-sm text-gray-800 mb-1 line-clamp-1">
          {kit.name}
        </h4>

        {/* Price */}
        <div className="flex items-center gap-2">
          {kit.originalPrice && (
            <span className="text-gray-400 line-through text-xs">
              ${kit.originalPrice}
            </span>
          )}
          <span className="font-bold text-sm text-gray-800">
            ${kit.price}
          </span>
        </div>
      </div>
    </div>
  );
};

export default KitsSection;