import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

const CarouselSection = ({ title, products, id }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Dados mockados para demonstração
    const heroSlides = [
        {
        id: 1,
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        title: "NOVA COLEÇÃO",
        subtitle: "DARKNESS AWAITS",
        cta: "VER TODAS AS COLEÇÕES",
        theme: "red"
        },
        {
        id: 2,
        image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
        title: "COMPRE 1 E LEVE 2",
        subtitle: "PROMOÇÃO ESPECIAL",
        cta: "APROVEITE A PROMOÇÃO",
        theme: "purple"
        }
    ];

    // Auto-slide para o carrossel principal
    useEffect(() => {
        const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 7000);
        return () => clearInterval(interval);
    }, [heroSlides.length]);

  const scrollCarousel = (carouselId, direction) => {
    const carousel = document.getElementById(carouselId);
    if (carousel) {
      const scrollAmount = 320;
      const newScrollLeft = carousel.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      carousel.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };
  return(
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-red-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => scrollCarousel(id, 'left')}
              className="bg-white border-2 border-gray-300 text-gray-700 p-2 rounded-full hover:border-purple-600 hover:text-purple-600 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollCarousel(id, 'right')}
              className="bg-white border-2 border-gray-300 text-gray-700 p-2 rounded-full hover:border-purple-600 hover:text-purple-600 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div
          id={id}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
    );
};
export default CarouselSection;