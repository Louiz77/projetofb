import HeroBanner from '../components/Home/HeroBanner';
import GenderSplitBanner from '../components/Home/GenderSplitBanner';
import CategoryFilterSection from '../components/Home/CategoryFilterSection';
import FeaturedProducts from '../components/Home/FeaturedProducts';
import NewsletterSection from '../components/Home/NewsletterSection';
import CarousselSection from '../components/Home/CarouselSection';
import KitsSection from '../components/Home/KitsSection';
import GridProduct from '../components/Home/GridProduct';
import PromotionalBanner from '../components/Home/PromotionalBanner';
import AccountBanner from '../components/Home/AccountBanner';
import CategoryFilter from '../components/Home/CategoryFilter';

const Home = () => {
    const mockProducts = [
    { id: 1, name: "Gothic Dress", price: 299, originalPrice: 399, image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop", sale: true, limited: false },
    { id: 2, name: "Dark Angel Top", price: 159, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop", sale: false, limited: true },
    { id: 3, name: "Shadow Jacket", price: 449, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop", sale: false, limited: false },
    { id: 4, name: "Midnight Skirt", price: 199, originalPrice: 269, image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop", sale: true, limited: false },
    { id: 5, name: "Rebel Boots", price: 349, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop", sale: false, limited: true },
    { id: 6, name: "Darkness Hoodie", price: 229, image: "https://images.unsplash.com/photo-1556821840-3a9fbc82ea14?w=400&h=500&fit=crop", sale: false, limited: false },
    { id: 7, name: "Rebel Boots", price: 349, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop", sale: false, limited: true },
    { id: 8, name: "Rebel Boots", price: 349, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop", sale: false, limited: true },
    { id: 9, name: "Gothic Dress", price: 299, originalPrice: 399, image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop", sale: true, limited: false },
    { id: 10, name: "Gothic Jacket", price: 429, originalPrice: 648, image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop", sale: true, limited: true },
    {
      id: 1,
      name: "Camiseta Premium Masculina",
      price: 89.90,
      originalPrice: 129.90,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
      category: "HOMEM",
      isPromotion: true,
      isNew: false,
      isLimitedStock: false
    },
    {
      id: 2,
      name: "Vestido Elegante Feminino",
      price: 199.90,
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop",
      category: "MULHER",
      isPromotion: false,
      isNew: true,
      isLimitedStock: false
    },
    {
      id: 3,
      name: "Jaqueta de Couro Masculina",
      price: 399.90,
      originalPrice: 499.90,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop",
      category: "HOMEM",
      isPromotion: true,
      isNew: false,
      isLimitedStock: true,
      stockCount: 2
    },
    {
      id: 4,
      name: "Blusa Casual Feminina",
      price: 79.90,
      image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop",
      category: "MULHER",
      isPromotion: false,
      isNew: false,
      isLimitedStock: false
    },
    {
      id: 5,
      name: "Calça Jeans Masculina",
      price: 149.90,
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop",
      category: "HOMEM",
      isPromotion: false,
      isNew: true,
      isLimitedStock: false
    }
  ];

  return (
    <div>
      <HeroBanner />
      
      <GenderSplitBanner />

      {/* Faixa Promocional */}
      <section className="snap-section banner-section bg-[#8A0101] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-[#8A0101]" />
        </div>
        <div className="py-4">
          <div className="container mx-auto px-4 text-center relative z-10">
            <p className="text-white text-sm sm:text-base lg:text-lg font-semibold animate-pulse">
              🔥 <span className="hidden sm:inline">FREE SHIPPING ($450) • INTEREST-FREE INSTALLMENTS IN UP TO 3X • </span>
              <span className="sm:hidden">FREE SHIPPING • INSTALLMENTS • </span>
              SILENCE IS JUST THE PRELUDE TO CHAOS 🔥
            </p>
          </div>
        </div>
      </section>

      {/* Hot Topics */}
      <CarousselSection title="HOT TOPICS" products={mockProducts} id="hot-topics"/>

      {/* Kits Section */}
      <KitsSection />

      {/* Carrosseis de Destaques */}
      <CarousselSection title="TOP" products={mockProducts} id="parte-cima" />
      <CarousselSection title="BOTTOM PART" products={mockProducts} id="parte-baixo" />

      {/* Acessórios & Bolsas */}
      <GridProduct mockProducts={mockProducts}/>

      <CarousselSection title="DRESSES" products={mockProducts} id="vestidos" />
      <CarousselSection title="FOOTWEAR" products={mockProducts} id="featured-collection" />
      
      {/* Faixa Promocional para Cadastro */}
      <PromotionalBanner />

      <section className="py-4 bg-gradient-to-r from-[#8A0101] to-[#4B014E] text-white text-center">
        <p className="text-sm font-bold tracking-wider uppercase">
          DISCOUNTS UP TO 70% • NEW COLLECTION AVAILABLE • FREE SHIPPING OVER $450
        </p>
      </section>

      {/* Filtros por Categorias */}
      <CategoryFilterSection />

      {/* Seção de Propagandas com IMG ao fundo 
      <AccountBanner />*/}

      {/*Filtro com Layout de Bolinhas Estilizadas (Categoria) 
      <CategoryFilter />
      <FeaturedProducts />*/}
      <NewsletterSection />
    </div>
  );
};

export default Home;