import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Eye } from 'lucide-react';

const GridProduct = () => {
  const [activeProduct, setActiveProduct] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const products = [
    {
      id: 1,
      name: "Sedona Organza Check Embroidered Full Sleeve Midi Skirt Dress",
      price: "$45",
      originalPrice: "$65",
      discount: "30%",
      image: "/api/placeholder/300/400",
      isNew: true,
      isFavorite: false
    },
    {
      id: 2,
      name: "Sedona Organza Check Embroidered Mini Dress",
      price: "$35",
      image: "/api/placeholder/300/400",
      isNew: false,
      isFavorite: true
    },
    {
      id: 3,
      name: "Sedona Organza Check Embroidered Button Up Shirt",
      price: "$42",
      image: "/api/placeholder/300/400",
      isNew: true,
      isFavorite: false
    },
    {
      id: 4,
      name: "Sedona Organza Check Embroidered Midi Skirt",
      price: "$38",
      image: "/api/placeholder/300/400",
      isNew: false,
      isFavorite: false
    },
    {
      id: 5,
      name: "Sedona Black Lace Dress",
      price: "$55",
      image: "/api/placeholder/300/400",
      isNew: true,
      isFavorite: true
    },
    {
      id: 6,
      name: "Sedona Black Embroidered Midi Dress",
      price: "$48",
      image: "/api/placeholder/300/400",
      isNew: false,
      isFavorite: false
    }
  ];

  const heroProduct = {
    title: "Collection",
    subtitle: "SHOP",
    backgroundImage: "/api/placeholder/600/800"
  };

  const handleProductHover = (productId) => {
    setActiveProduct(productId);
  };

  const handleProductLeave = () => {
    setActiveProduct(null);
  };

  return (
    <section className={`py-16 bg-gradient-to-br from-gray-50 to-white transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Hero Section */}
          <div className="lg:col-span-2 relative group overflow-hidden rounded-2xl shadow-2xl">
            <div 
              className="h-96 lg:h-full bg-cover bg-center relative transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800"><rect fill="%23222" width="600" height="800"/><path fill="%23333" d="M0 0h600v800H0z"/></svg>')`
              }}
            >
              {/* Floating Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-pink-400 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute top-3/4 right-1/4 w-6 h-6 bg-purple-400 rounded-full opacity-40 animate-bounce"></div>
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-blue-400 rounded-full opacity-50 animate-ping"></div>
              </div>
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center z-10">
                <div className="transform transition-all duration-500 group-hover:scale-110">
                  <h2 className="text-6xl lg:text-7xl font-light text-white mb-4 font-serif tracking-wider">
                    {heroProduct.title}
                  </h2>
                  <div className="relative inline-block">
                    <p className="text-xl lg:text-2xl text-white/90 font-medium tracking-[0.3em] uppercase">
                      {heroProduct.subtitle}
                    </p>
                    <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-8 right-8 w-16 h-16 border border-white/30 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border border-white/50 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {products.map((product, index) => (
              <div 
                key={product.id}
                className={`group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                  backgroundImage: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
                }}
                onMouseEnter={() => handleProductHover(product.id)}
                onMouseLeave={handleProductLeave}
              >
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <div 
                    className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 transition-transform duration-700 group-hover:scale-110"
                    style={{
                      backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect fill="%23f3f4f6" width="300" height="400"/><path fill="%23e5e7eb" d="M0 0h300v400H0z"/></svg>')`
                    }}
                  ></div>
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.discount && (
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                        <span className="text-xs">💰</span>
                        {product.discount}
                      </div>
                    )}
                    {product.isNew && (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                        NEW
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
                    activeProduct === product.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                  }`}>
                    <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      product.isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
                    } shadow-lg hover:scale-110`}>
                      <Heart size={16} fill={product.isFavorite ? 'white' : 'none'} />
                    </button>
                    <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-lg hover:scale-110">
                      <Eye size={16} />
                    </button>
                    <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:bg-purple-500 hover:text-white transition-all duration-300 shadow-lg hover:scale-110">
                      <ShoppingBag size={16} />
                    </button>
                  </div>

                  {/* Quick Add Overlay */}
                  <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-all duration-300 ${
                    activeProduct === product.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <button className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl">
                      Quick Add
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 text-sm leading-relaxed group-hover:text-purple-600 transition-colors duration-300">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-purple-600">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className={`absolute inset-0 border-2 border-purple-500 rounded-xl transition-all duration-300 ${
                  activeProduct === product.id ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <button className="group relative px-8 py-4 bg-[#1C1C1C] text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
            <span className="relative z-10">View Full Collection</span>
            <div className="absolute inset-0 bg-[#8A0101] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default GridProduct;