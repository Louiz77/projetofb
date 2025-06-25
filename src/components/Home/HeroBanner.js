import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = [
    {
      id: 1,
      image: "/retrato-de-jovem-no-estilo-de-moda-dos-anos-2000-com-jeans-e-oculos-de-sol.jpg",
      title: "NEW COLLECTION",
      subtitle: "DARKNESS AWAITS",
      cta: "SEE ALL COLLECTIONS",
      theme: "purple"
    },
    {
      id: 2,
      image: "/adolescente-gotico-de-tiro-medio-posando-no-estudio.jpg",
      title: "EXCLUSIVE ACCESSORIES",
      subtitle: "FOR REBEL SOULS",
      cta: "EXPLORE ACCESSORIES",
      theme: "black"
    }
  ];

  return (
    <section className="relative h-[calc(100vh-80px)] overflow-hidden">
        <div className="min-h-screen bg-white">
        {/* Hero Carousel */}
        <section className="relative h-screen overflow-hidden">
            {heroSlides.map((slide, index) => (
            <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `linear-gradient(${
                    slide.theme === 'red' ? 'rgba(220, 38, 38, 0.7), rgba(0, 0, 0, 0.8)' : 'rgba(147, 51, 234, 0.7), rgba(0, 0, 0, 0.8)'
                    }), url('${slide.image}')`
                }}
                />
                <div className="relative z-10 h-full flex items-center justify-center text-center text-white px-4">
                <div className="max-w-4xl">
                    <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
                    {slide.title}
                    </h1>
                    <p className="text-2xl md:text-3xl mb-8 font-light tracking-wide">
                    {slide.subtitle}
                    </p>
                    <button
                    className={`px-12 py-4 text-lg font-bold rounded-full transition-all duration-300 hover:scale-105 ${
                        slide.theme === 'red'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                    >
                    {slide.cta}
                    </button>
                </div>
                </div>
            </div>
            ))}
            
            {/* Indicadores do carousel */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
            {heroSlides.map((_, index) => (
                <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
                />
            ))}
            </div>

            {/* Botões de navegação */}
            <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors z-20"
            >
            <ChevronLeft size={24} />
            </button>
            <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors z-20"
            >
            <ChevronRight size={24} />
            </button>
        </section>
        </div>
        {/* Indicadores do carousel */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
            {heroSlides.map((_, index) => (
            <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
            />
            ))}
        </div>
    </section>
  );
};

export default HeroBanner;