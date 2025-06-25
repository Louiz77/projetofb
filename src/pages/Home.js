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
    { id: 6, name: "Darkness Hoodie", price: 229, image: "https://images.unsplash.com/photo-1556821840-3a9fbc82ea14?w=400&h=500&fit=crop", sale: false, limited: false }
  ];

  return (
    <div>
      <HeroBanner />
      
      <GenderSplitBanner />

      {/* Faixa Promocional */}
      <section className="py-4 bg-[#1C1C1C] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full bg-repeat" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }} />
              </div>
          <div className="container mx-auto px-4 text-center relative z-10">
              <p className="text-white text-lg font-semibold animate-pulse">
                  🔥 FREE SHIPPING ($450) • INTEREST-FREE INSTALLMENTS IN UP TO 3X • SILENCE IS JUST THE PRELUDE TO CHAOS 🔥
              </p>
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
      <CarousselSection title="FOOTWEAR" products={mockProducts} id="calcados" />
      
      {/* Faixa Promocional para Cadastro */}
      <PromotionalBanner />

      {/* Filtros por Categorias */}
      <CategoryFilterSection />

      <section className="py-6 bg-gradient-to-r from-red-600 to-purple-600 text-white text-center">
        <p className="text-lg font-bold tracking-wider uppercase">
          💥 DISCOUNTS UP TO 70% • NEW COLLECTION AVAILABLE • FREE SHIPPING OVER R$450 💥
        </p>
      </section>
      
      {/* Seção de Propagandas com IMG ao fundo */}
      <AccountBanner />

      {/*Filtro com Layout de Bolinhas Estilizadas (Categoria) */}
      <CategoryFilter />
      <FeaturedProducts />
      <NewsletterSection />
    </div>
  );
};

export default Home;