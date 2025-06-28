import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const heroSlides = [
    {
      id: 1,
      image: "/retrato-de-jovem-no-estilo-de-moda-dos-anos-2000-com-jeans-e-oculos-de-sol.jpg",
      title: "NEW COLLECTION",
      subtitle: "DARKNESS AWAITS",
      cta: "SEE ALL COLLECTIONS",
      theme: "red",
      gradient: "from-[#8A0101]/70 via-red-900/80 to-black/90",
      accent: "from-[#8A0101] to-red-700"
    },
    {
      id: 2,
      image: "/adolescente-gotico-de-tiro-medio-posando-no-estudio.jpg",
      title: "EXCLUSIVE ACCESSORIES",
      subtitle: "FOR REBEL SOULS",
      cta: "EXPLORE ACCESSORIES",
      theme: "purple",
      gradient: "from-[#4B014E]/70 via-purple-900/80 to-black/90",
      accent: "from-purple-500 to-[#4B014E]"
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('hero-banner');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // Touch handlers for mobile swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }
    if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section 
      id="hero-banner"
      className="relative h-[calc(100vh-115px)] min-h-[500px] overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Background slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          {/* Background Image with Parallax */}
          <div 
            className="absolute inset-0 bg-cover bg-center transform transition-transform duration-[6000ms] ease-out"
            style={{
              backgroundImage: `url('${slide.image}')`,
              transform: index === currentSlide ? 'scale(1.1)' : 'scale(1.2)'
            }}
          />
          
          {/* Enhanced Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
          
          {/* Animated Mesh Overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
          </div>
        </div>
      ))}

      {/* Content Container */}
      <div className="relative z-10 h-full flex items-center justify-center text-center text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`transition-all duration-1000 ${
                index === currentSlide 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-8'
              }`}
              style={{ display: index === currentSlide ? 'block' : 'none' }}
            >
              {/* Title */}
              <h1 className={`font-black leading-tight mb-4 sm:mb-6 transform transition-all duration-1000 delay-300 ${
                isIntersecting && index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              } text-4xl sm:text-5xl md:text-6xl lg:text-8xl`}>
                <span className={`bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent filter drop-shadow-2xl`}>
                  {slide.title}
                </span>
              </h1>

              {/* Subtitle */}
              <p className={`font-light tracking-wide mb-6 sm:mb-8 transform transition-all duration-1000 delay-500 ${
                isIntersecting && index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              } text-lg sm:text-xl md:text-2xl lg:text-3xl`}>
                {slide.subtitle}
              </p>

              {/* CTA Button */}
              <div className={`transform transition-all duration-1000 delay-700 ${
                isIntersecting && index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <button className={`group relative px-6 py-3 sm:px-8 sm:py-4 lg:px-12 lg:py-4 text-sm sm:text-base lg:text-lg font-bold transition-all duration-300 hover:scale-105 transform bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 overflow-hidden`}>
                  <span className="relative z-10">{slide.cta}</span>
                  <div className={`absolute inset-0 bg-gradient-to-r ${slide.accent} opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />
                  <div className={`absolute inset-0 bg-gradient-to-r ${slide.accent} opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300 -z-10`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Navigation Arrows */}
      <div className="hidden md:block">
        <button
          onClick={prevSlide}
          className="absolute left-4 lg:left-8 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md text-white p-3 lg:p-4 rounded-full hover:bg-white/20 hover:scale-110 transition-all duration-300 z-20 border border-white/20"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 lg:right-8 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md text-white p-3 lg:p-4 rounded-full hover:bg-white/20 hover:scale-110 transition-all duration-300 z-20 border border-white/20"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Mobile Navigation Hint */}
      <div className="md:hidden absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center space-x-2 text-white/70 text-sm bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white/50 rounded-full animate-pulse" />
            <div className="w-1 h-1 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-1 h-1 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <span>Deslize para navegar</span>
        </div>
      </div>

      {/* Enhanced Slide Indicators */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3 z-20">
        {heroSlides.map((slide, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`relative transition-all duration-300 ${
              index === currentSlide 
                ? 'w-8 sm:w-10 h-3 sm:h-4 bg-white rounded-full' 
                : 'w-3 sm:w-4 h-3 sm:h-4 bg-white/50 rounded-full hover:bg-white/70'
            }`}
          >
            {index === currentSlide && (
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.accent} rounded-full opacity-80`} />
            )}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
        <div 
          className={`h-full bg-gradient-to-r ${heroSlides[currentSlide].accent} transition-all duration-[5000ms] ease-linear`}
          style={{ 
            width: isIntersecting ? '100%' : '0%',
            animation: `progress 5000ms linear infinite`
          }}
        />
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-white/10 rounded-full animate-pulse ${
              isIntersecting ? 'animate-bounce' : ''
            }`}
            style={{
              left: `${20 + i * 20}%`,
              top: `${20 + i * 15}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + i}s`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </section>
  );
};

export default HeroBanner;