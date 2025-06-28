import React, { useState, useEffect, useCallback, useMemo } from 'react';

const GenderSplitBanner = () => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState({});

  // Memoizar os estilos para evitar recriações desnecessárias
  const styles = useMemo(() => [
    {
      id: 'gothic',
      title: 'GOTHIC',
      subtitle: 'Darkness & Elegance',
      buttonText: 'SHOP ACCESSORIES',
      image: '/front-view-goth-friends-posing-studio.jpg',
      gradient: 'from-[#4B014E]/80 via-black/60 to-transparent',
      accent: 'from-[#4B014E] to-transparent/40'
    },
    {
      id: 'streetwear',
      title: 'STREETWEAR',
      subtitle: 'Urban & Rebellious',
      buttonText: 'SHOP GRAPHIC PRINTS',
      image: '/medium-shot-man-talking-phone.jpg',
      gradient: 'from-[#8A0101]/80 via-gray/60 to-transparent',
      accent: 'from-[#8A0101] to-transparent/80'
    }
  ], []);

  // Otimizar Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { 
        threshold: 0.2,
        rootMargin: '50px' // Trigger um pouco antes para suavizar a animação
      }
    );

    const element = document.getElementById('gender-split-banner');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // Preload de imagens otimizado
  useEffect(() => {
    styles.forEach(style => {
      const img = new Image();
      img.onload = () => {
        setImagesLoaded(prev => ({ ...prev, [style.id]: true }));
      };
      img.src = style.image;
    });
  }, [styles]);

  // Callbacks otimizados
  const handleMouseEnter = useCallback((styleId) => {
    setActiveCard(styleId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setActiveCard(null);
  }, []);

  const handleMobileClick = useCallback((styleId) => {
    setActiveCard(prev => prev === styleId ? null : styleId);
  }, []);

  // Componente de partículas otimizado
  const BackgroundParticles = useMemo(() => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-2 h-2 bg-white/10 rounded-full ${isIntersecting ? 'animate-pulse' : ''}`}
          style={{
            left: `${20 + i * 15}%`,
            top: `${10 + i * 10}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${3 + i}s`,
            willChange: isIntersecting ? 'transform' : 'auto'
          }}
        />
      ))}
    </div>
  ), [isIntersecting]);

  // Componente de card otimizado
  const StyleCard = ({ style, index, isMobile = false }) => {
    const isActive = activeCard === style.id;
    const isLoaded = imagesLoaded[style.id];

    const cardProps = isMobile ? {
      onClick: () => handleMobileClick(style.id)
    } : {
      onMouseEnter: () => handleMouseEnter(style.id),
      onMouseLeave: handleMouseLeave
    };

    return (
      <div
        key={style.id}
        className={`group relative overflow-hidden cursor-pointer ${
          isMobile ? `transform transition-all duration-700 ${
            isIntersecting ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }` : ''
        }`}
        style={isMobile ? { 
          transitionDelay: `${index * 200}ms`,
          willChange: isIntersecting ? 'transform, opacity' : 'auto'
        } : {}}
        {...cardProps}
      >
        {/* Background Image com lazy loading e otimização */}
        <div className={`absolute inset-0 transform transition-transform duration-1000 ease-out ${
          isMobile ? (isActive ? 'scale-110' : 'scale-100') : 'group-hover:scale-110'
        }`}
        style={{ willChange: 'transform' }}>
          {isLoaded ? (
            <img
              src={style.image}
              alt={`Estilo ${style.title}`}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 animate-pulse" />
          )}
        </div>

        {/* Gradient Overlay otimizado */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t ${style.gradient} transition-opacity duration-500 ${
            isMobile ? (isActive ? 'opacity-90' : 'opacity-70') : 'group-hover:opacity-90'
          }`}
        />

        {/* Border animado (apenas desktop) */}
        {!isMobile && (
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${style.accent} p-[2px]`}>
            <div className="w-full h-full bg-black/20 backdrop-blur-sm" />
          </div>
        )}

        {/* Glowing Border (apenas mobile) */}
        {isMobile && (
          <div className={`absolute inset-0 transition-all duration-500 ${
            isActive ? `shadow-[inset_0_0_50px_rgba(168,85,247,0.4)] border-2 border-purple-400/50` : ''
          }`} />
        )}

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white z-10 p-6 md:p-8">
          <div className={`transform transition-all duration-700 flex flex-col items-center text-center ${
            isMobile ? (isActive ? 'scale-105' : 'scale-100') : 
            (isIntersecting ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0')
          }`}>
            {/* Title */}
            <h3 className={`font-black mb-3 md:mb-4 tracking-[0.2em] md:tracking-[0.3em] drop-shadow-2xl ${
              isMobile ? 'text-4xl sm:text-5xl' : 'text-5xl lg:text-5xl'
            }`}>
              <span className={`bg-gradient-to-r ${style.accent} bg-clip-text text-transparent ${
                !isMobile ? 'group-hover:text-white transition-all duration-500' : 'filter drop-shadow-lg'
              }`}>
                {style.title}
              </span>
            </h3>

            {/* Subtitle */}
            <p className={`opacity-90 drop-shadow-lg tracking-wide mb-6 ${
              isMobile ? 'text-base sm:text-lg font-medium' : 'text-lg lg:text-xl'
            }`}>
              {style.subtitle}
            </p>

            {/* Button */}
            <div className="relative overflow-hidden flex justify-center group/btn">
              <button className={`relative bg-white/15 backdrop-blur-md border border-white/30 text-white font-semibold tracking-wider transition-all duration-300 hover:bg-white/25 hover:border-white/50 hover:scale-105 transform ${
                isMobile ? `px-6 py-3 sm:px-8 sm:py-4 ${isActive ? 'animate-pulse' : ''}` : 
                'px-8 py-4 group-hover:scale-105'
              }`}>
                <span className={`relative z-10 ${isMobile ? 'text-sm sm:text-base' : ''}`}>
                  {style.buttonText}
                </span>
                <div className={`absolute inset-0 bg-gradient-to-r ${style.accent} opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300 ${isMobile ? 'rounded' : ''}`} />
              </button>
              
              {/* Button Glow (apenas mobile) */}
              {isMobile && (
                <div className={`absolute inset-0 bg-gradient-to-r ${style.accent} opacity-0 group-hover/btn:opacity-20 blur-lg transition-opacity duration-300 -z-10`} />
              )}
            </div>
          </div>

          {/* Tap Indicator (apenas mobile) */}
          {isMobile && (
            <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${
              isActive ? 'opacity-0 scale-0' : 'opacity-60 scale-100'
            }`}>
              <div className="flex items-center space-x-2 text-white/70 text-sm">
                <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" />
                <span>Toque para explorar</span>
              </div>
            </div>
          )}
        </div>

        {/* Floating Elements otimizados */}
        <div className={`absolute transition-all duration-500 ${
          isMobile ? 
            `top-6 right-6 duration-700 ${isActive ? 'opacity-100 rotate-180' : 'opacity-60 rotate-0'}` :
            'top-4 right-4 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 translate-x-4'
        }`}>
          <div className={`bg-gradient-to-r ${style.accent} rounded-full animate-pulse ${
            isMobile ? 'w-4 h-4' : 'w-3 h-3'
          }`} />
        </div>

        {/* Second floating element (apenas mobile) */}
        {isMobile && (
          <div className={`absolute bottom-6 left-6 transition-all duration-700 ${
            isActive ? 'opacity-100 scale-110' : 'opacity-40 scale-100'
          }`}>
            <div className={`w-3 h-3 bg-gradient-to-r ${style.accent} rounded-full`} />
          </div>
        )}
      </div>
    );
  };

  return (
    <section 
      id="gender-split-banner"
      className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-red-900 overflow-hidden"
    >
      {BackgroundParticles}

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-2 h-[60vh] min-h-[500px]">
        {styles.map((style, index) => (
          <StyleCard key={style.id} style={style} index={index} />
        ))}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {styles.map((style, index) => (
          <div key={style.id} className="h-[50vh] min-h-[400px]">
            <StyleCard style={style} index={index} isMobile={true} />
          </div>
        ))}
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
    </section>
  );
};

export default GenderSplitBanner;