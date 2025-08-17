import React, { useState, useEffect } from 'react';

const GenderSplitBanner = () => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    const element = document.getElementById('gender-split-banner');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const styles = [
    {
      id: 'gothic',
      title: 'GOTHIC',
      subtitle: 'Darkness & Elegance',
      buttonText: 'SHOP ACCESSORIES',
      image: '/PosBanner-1-Goth.jpg',
      gradient: 'from-[#4B014E]/80 via-black/60 to-transparent',
      accent: 'from-[#4B014E] to-white/20'
    },
    {
      id: 'streetwear',
      title: 'STREETWEAR',
      subtitle: 'Urban & Rebellious',
      buttonText: 'SHOP GRAPHIC PRINTS',
      image: '/PosBanner-1-Streetwear.jpg',
      gradient: 'from-[#8A0101]/80 via-gray/60 to-transparent',
      accent: 'from-[#8A0101] via-[#1C1C1C]/120 to-transparent/60'
    }
  ];

  return (
    <section 
      id="gender-split-banner"
      className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-red-900 overflow-hidden"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-white/10 rounded-full animate-pulse ${isIntersecting ? 'animate-bounce' : ''}`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i}s`
            }}
          />
        ))}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-2 h-[60vh] min-h-[500px]">
        {styles.map((style, index) => (
          <div
            key={style.id}
            className="group relative overflow-hidden cursor-pointer"
            onMouseEnter={() => setActiveCard(style.id)}
            onMouseLeave={() => setActiveCard(null)}
          >
            {/* Background Image with Parallax Effect */}
            <div className="absolute inset-0 transform group-hover:scale-110 transition-all duration-1000 ease-out">
              <img
                src={style.image}
                alt={`Estilo ${style.title}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${style.gradient} group-hover:opacity-90 transition-opacity duration-500`} />

            {/* Animated Border */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${style.accent} p-[2px]`}>
              <div className="w-full h-full bg-black/20 backdrop-blur-sm" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white z-10 p-8">
              <div className={`transform transition-all duration-700 flex flex-col items-center text-center ${isIntersecting ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <h3 className="text-5xl lg:text-5xl font-black mb-4 tracking-[0.3em] drop-shadow-2xl">
                  <span className={`bg-gradient-to-r ${style.accent} bg-clip-text text-transparent group-hover:text-white transition-all duration-500`}>
                    {style.title}
                  </span>
                </h3>
                <p className="text-lg lg:text-xl opacity-90 drop-shadow-lg tracking-wide mb-6">
                  {style.subtitle}
                </p>
                <div className="relative overflow-hidden flex justify-center">
                  <button className="relative px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold tracking-wider hover:bg-white/20 hover:border-white/40 transition-all duration-300 group-hover:scale-105 transform">
                    <span className="relative z-10">{style.buttonText}</span>
                    <div className={`absolute inset-0 bg-gradient-to-r ${style.accent} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-x-0 translate-x-4">
              <div className={`w-3 h-3 bg-gradient-to-r ${style.accent} rounded-full animate-pulse`} />
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {styles.map((style, index) => (
          <div
            key={style.id}
            className={`relative h-[50vh] min-h-[400px] overflow-hidden cursor-pointer transform transition-all duration-700 ${
              isIntersecting ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
            style={{ transitionDelay: `${index * 200}ms` }}
            onClick={() => setActiveCard(activeCard === style.id ? null : style.id)}
          >
            {/* Background Image */}
            <div className={`absolute inset-0 transform transition-all duration-1000 ${
              activeCard === style.id ? 'scale-110' : 'scale-100'
            }`}>
              <img
                src={style.image}
                alt={`Estilo ${style.title}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Dynamic Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${style.gradient} transition-opacity duration-500 ${
              activeCard === style.id ? 'opacity-90' : 'opacity-70'
            }`} />

            {/* Glowing Border Effect */}
            <div className={`absolute inset-0 transition-all duration-500 ${
              activeCard === style.id ? `shadow-[inset_0_0_50px_rgba(168,85,247,0.4)] border-2 border-purple-400/50` : ''
            }`} />

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white z-10 p-6">
              <div className={`text-center transform transition-all duration-500 ${
                activeCard === style.id ? 'scale-105' : 'scale-100'
              }`}>
                {/* Title with Enhanced Typography */}
                <h3 className="text-4xl sm:text-5xl font-black mb-3 tracking-[0.2em] drop-shadow-2xl">
                  <span className={`bg-gradient-to-r ${style.accent} bg-clip-text text-transparent filter drop-shadow-lg`}>
                    {style.title}
                  </span>
                </h3>

                {/* Subtitle */}
                <p className="text-base sm:text-lg opacity-90 drop-shadow-lg tracking-wide mb-6 font-medium">
                  {style.subtitle}
                </p>

                {/* Interactive Button */}
                <div className="relative group/btn">
                  <button className={`relative px-6 py-3 sm:px-8 sm:py-4 bg-white/15 backdrop-blur-md border border-white/30 text-white font-semibold tracking-wider transition-all duration-300 hover:bg-white/25 hover:border-white/50 hover:scale-105 transform ${
                    activeCard === style.id ? 'animate-pulse' : ''
                  }`}>
                    <span className="relative z-10 text-sm sm:text-base">{style.buttonText}</span>
                    <div className={`absolute inset-0 bg-gradient-to-r ${style.accent} opacity-0 group-hover/btn:opacity-30 transition-opacity duration-300 rounded`} />
                  </button>
                  
                  {/* Button Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${style.accent} opacity-0 group-hover/btn:opacity-20 blur-lg transition-opacity duration-300 -z-10`} />
                </div>
              </div>

              {/* Tap Indicator for Mobile */}
              <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${
                activeCard === style.id ? 'opacity-0 scale-0' : 'opacity-60 scale-100'
              }`}>
                <div className="flex items-center space-x-2 text-white/70 text-sm">
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" />
                  <span>Toque para explorar</span>
                </div>
              </div>
            </div>

            {/* Floating Decorative Elements */}
            <div className={`absolute top-6 right-6 transition-all duration-700 ${
              activeCard === style.id ? 'opacity-100 rotate-180' : 'opacity-60 rotate-0'
            }`}>
              <div className={`w-4 h-4 bg-gradient-to-r ${style.accent} rounded-full animate-pulse`} />
            </div>

            <div className={`absolute bottom-6 left-6 transition-all duration-700 ${
              activeCard === style.id ? 'opacity-100 scale-110' : 'opacity-40 scale-100'
            }`}>
              <div className={`w-3 h-3 bg-gradient-to-r ${style.accent} rounded-full`} />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
    </section>
  );
};

export default GenderSplitBanner;