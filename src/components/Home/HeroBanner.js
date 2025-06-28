import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isLoaded, setIsLoaded] = useState({});
  const [isPreloading, setIsPreloading] = useState(false);
  const intervalRef = useRef(null);
  const observerRef = useRef(null);
  const imageCache = useRef(new Map());

  // Memoize hero slides to prevent recreation
  const heroSlides = useMemo(() => [
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
      image: "/medium-shot-man-talking-phone.jpg",
      title: "EXCLUSIVE ACCESSORIES",
      subtitle: "FOR REBEL SOULS",
      cta: "EXPLORE ACCESSORIES",
      theme: "purple",
      gradient: "from-[#4B014E]/70 via-purple-900/80 to-black/90",
      accent: "from-purple-500 to-[#4B014E]"
    }
  ], []);

  // Enhanced preload with priority loading
  useEffect(() => {
    const preloadImage = (src, index, priority = false) => {
      return new Promise((resolve) => {
        if (imageCache.current.has(src)) {
          setIsLoaded(prev => ({ ...prev, [index]: true }));
          resolve();
          return;
        }

        const img = new Image();
        img.onload = () => {
          imageCache.current.set(src, img);
          setIsLoaded(prev => ({ ...prev, [index]: true }));
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load image: ${src}`);
          resolve();
        };
        
        // Set priority for faster loading
        if (priority) {
          img.loading = 'eager';
          img.fetchPriority = 'high';
        }
        
        img.src = src;
      });
    };

    // Load current slide first with high priority
    preloadImage(heroSlides[currentSlide].image, currentSlide, true).then(() => {
      // Then load other slides with normal priority
      heroSlides.forEach((slide, index) => {
        if (index !== currentSlide) {
          preloadImage(slide.image, index, false);
        }
      });
    });
  }, [heroSlides, currentSlide]);

  // Optimized auto-slide with cleanup
  useEffect(() => {
    const startInterval = () => {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 5000);
    };

    if (isIntersecting) {
      startInterval();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [heroSlides.length, isIntersecting]);

  // Optimized intersection observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    const element = document.getElementById('hero-banner');
    if (element) observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);
  
  // Optimized slide change with preloading
  const changeSlide = useCallback((newIndex) => {
    setIsPreloading(true);
    
    // Preload next slide if not already loaded
    const nextSlide = heroSlides[newIndex];
    if (!isLoaded[newIndex] && nextSlide) {
      const img = new Image();
      img.onload = () => {
        setIsLoaded(prev => ({ ...prev, [newIndex]: true }));
        setCurrentSlide(newIndex);
        setIsPreloading(false);
      };
      img.onerror = () => {
        setCurrentSlide(newIndex);
        setIsPreloading(false);
      };
      img.loading = 'eager';
      img.fetchPriority = 'high';
      img.src = nextSlide.image;
    } else {
      setCurrentSlide(newIndex);
      setIsPreloading(false);
    }
  }, [heroSlides, isLoaded]);

  // Memoized touch handlers
  const handleTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      const newIndex = (currentSlide + 1) % heroSlides.length;
      changeSlide(newIndex);
    }
    if (isRightSwipe) {
      const newIndex = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
      changeSlide(newIndex);
    }
  }, [touchStart, touchEnd, currentSlide, heroSlides.length, changeSlide]);

  const nextSlide = useCallback(() => {
    const newIndex = (currentSlide + 1) % heroSlides.length;
    changeSlide(newIndex);
  }, [currentSlide, heroSlides.length, changeSlide]);

  const prevSlide = useCallback(() => {
    const newIndex = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
    changeSlide(newIndex);
  }, [currentSlide, heroSlides.length, changeSlide]);

  const setSlide = useCallback((index) => {
    changeSlide(index);
  }, [changeSlide]);

  // Memoized slide content
  const slideContent = useMemo(() => (
    heroSlides.map((slide, index) => (
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
    ))
  ), [heroSlides, currentSlide, isIntersecting]);

  // Memoized slide indicators
  const slideIndicators = useMemo(() => (
    heroSlides.map((slide, index) => (
      <button
        key={index}
        onClick={() => setSlide(index)}
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
    ))
  ), [heroSlides, currentSlide, setSlide]);

  return (
    <section 
      id="hero-banner"
      className="relative h-[calc(100vh-113px)] min-h-[500px] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background slides - Render all slides but optimize visibility */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          style={{
            visibility: Math.abs(index - currentSlide) <= 1 ? 'visible' : 'hidden',
            zIndex: index === currentSlide ? 2 : 1
          }}
        >
          {/* Background Image with optimized loading */}
          <div 
            className={`absolute inset-0 bg-cover bg-center transform transition-transform duration-[6000ms] ease-out ${
              !isLoaded[index] ? 'bg-gray-900' : ''
            } ${isPreloading && index === currentSlide ? 'blur-[1px]' : ''}`}
            style={{
              backgroundImage: isLoaded[index] ? `url('${slide.image}')` : 'none',
              transform: index === currentSlide ? 'scale(1.1)' : 'scale(1.2)',
              willChange: index === currentSlide ? 'transform' : 'auto'
            }}
          />
          
          {/* Loading indicator for current slide */}
          {isPreloading && index === currentSlide && !isLoaded[index] && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Enhanced Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
          
          {/* Simplified Mesh Overlay for better performance */}
          {index === currentSlide && (
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
            </div>
          )}
        </div>
      ))}

      {/* Content Container */}
      <div className="relative z-10 h-full flex items-center justify-center text-center text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full">
          {slideContent}
        </div>
      </div>

      {/* Desktop Navigation Arrows */}
      <div className="hidden md:block">
        <button
          onClick={prevSlide}
          disabled={isPreloading}
          className={`absolute left-4 lg:left-8 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md text-white p-3 lg:p-4 rounded-full hover:bg-white/20 hover:scale-110 transition-all duration-300 z-20 border border-white/20 ${
            isPreloading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          disabled={isPreloading}
          className={`absolute right-4 lg:right-8 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md text-white p-3 lg:p-4 rounded-full hover:bg-white/20 hover:scale-110 transition-all duration-300 z-20 border border-white/20 ${
            isPreloading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Mobile Navigation Hint - Only show when needed */}
      <div className="md:hidden absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center space-x-2 text-white/70 text-sm bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white/50 rounded-full animate-pulse" />
            <div className="w-1 h-1 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-1 h-1 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <span>Swipe to navigate</span>
        </div>
      </div>

      {/* Enhanced Slide Indicators */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3 z-20">
        {slideIndicators}
      </div>

      {/* Optimized Progress Bar */}
      {isIntersecting && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div 
            className={`h-full bg-gradient-to-r ${heroSlides[currentSlide].accent} transition-all duration-[5000ms] ease-linear`}
            style={{ 
              width: '100%',
              animation: 'progress 5000ms linear infinite'
            }}
          />
        </div>
      )}

      {/* Reduced Floating Elements for performance */}
      {isIntersecting && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse animate-bounce"
              style={{
                left: `${25 + i * 30}%`,
                top: `${25 + i * 20}%`,
                animationDelay: `${i * 1.5}s`,
                animationDuration: `${4 + i}s`
              }}
            />
          ))}
        </div>
      )}

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