import { useState, useEffect, useRef } from "react";
import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductsPage from "./ProductsPage";
import ProductDetail from "./ProductDetail";

const Home = ({ setCurrentPage }) => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const bgRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  const handleNavigation = (page) => {
    navigate(`/${page}`);
  };

  // parallax
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      setScrollY(scrolled);
      
      if (bgRef.current) {
        const parallaxSpeed = scrolled * 0.5;
        bgRef.current.style.transform = `translateY(${parallaxSpeed}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        
        if (bgRef.current) {
          bgRef.current.style.opacity = entry.isIntersecting ? '1' : '0';
        }
      },
      { 
        threshold: 0,
        rootMargin: '50px 0px -50px 0px'
      }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  return (
    <div>
      <div className="relative">
        {/* Hero Section */}
        <section 
          ref={heroRef}
          className="relative overflow-hidden min-h-screen flex items-center justify-center"
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >

          <div
            ref={bgRef}
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-500 ease-out"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
              willChange: 'transform',
              transform: `translateY(${scrollY * 0.5}px)`,
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
          <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
            <div 
              className="transform transition-all duration-1000 ease-out"
              style={{
                transform: `translateY(${scrollY * 0.2}px)`,
                opacity: Math.max(0, 1 - scrollY / 500)
              }}
            >
              <h1 className="text-5xl md:text-8xl font-bold mb-6 leading-tight">
                <span className="block bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Discover our 
                </span>
                <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mt-2">
                  new collection
                </span>
              </h1>

              <p className="text-xl md:text-2xl mb-8 text-gray-200 font-light max-w-2xl mx-auto">
                Explore the latest fashion trends with our exclusive collection
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="group relative px-8 py-4 bg-white text-gray-900 font-semibold rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="absolute inset-0 bg-white group-hover:bg-transparent transition-colors duration-300" />
                  <span className="relative z-10 group-hover:text-white transition-colors duration-300">Explore</span>
                </button>
                
                <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full transition-all duration-300 hover:bg-white hover:text-gray-900 hover:scale-105">
                  Lookbook
                </button>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
            </div>
            {/*<p className="text-sm mt-2 font-light ">Scroll down</p>*/}
          </div>
          
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl animate-pulse delay-1000" />
        </section>
      </div>

      {/* Promotional Banner */}
      <section className="bg-yellow-400 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-semibold">
            🎉 10% de desconto na primeira compra! Use o cupom: BEMVINDO10
          </p>
        </div>
      </section>

      {/* BUY NOW BANNER - MODERNIZADO */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-gray-50 relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Header melhorado */}
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
              Collection Drop
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the latest fashion trends with our exclusive collection
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Grid de 3 cards modernos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            
            {/* Card 1 */}
            <div className="group relative">
              <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 group-hover:border-gray-200">
                {/* Container da imagem */}
                <div className="relative h-80 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  <img
                    src="https://videos.openai.com/vg-assets/assets%2Ftask_01jxv7mnk0ezw8nv26m1efxr2p%2F1750039490_img_1.webp?st=2025-06-16T00%3A47%3A01Z&se=2025-06-22T01%3A47%3A01Z&sks=b&skt=2025-06-16T00%3A47%3A01Z&ske=2025-06-22T01%3A47%3A01Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=8ebb0df1-a278-4e2e-9c20-f2d373479b3a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=CiJhdiKIT7qOj496K%2BkJrXUQSJ0ODxRFJZQBrof2wqo%3D&az=oaivgprodscus"
                    alt="Roupa 1"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Overlay gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Área do botão */}
                <div className="p-6">
                  <button className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold py-4 px-6 rounded-2xl hover:from-gray-800 hover:to-gray-700 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <span className="flex items-center justify-center gap-2">
                      <span>Buy Now</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative">
              <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 group-hover:border-gray-200">
                {/* Container da imagem */}
                <div className="relative h-80 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  <img
                    src="https://videos.openai.com/vg-assets/assets%2Ftask_01jxv7mnk0ezw8nv26m1efxr2p%2F1750039490_img_3.webp?st=2025-06-16T01%3A16%3A29Z&se=2025-06-22T02%3A16%3A29Z&sks=b&skt=2025-06-16T01%3A16%3A29Z&ske=2025-06-22T02%3A16%3A29Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=8ebb0df1-a278-4e2e-9c20-f2d373479b3a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=WG5cWg%2Fc%2B4DXhFGxdTDf96BaUVtm3UQsQP7C%2F1qmL3w%3D&az=oaivgprodscus"
                    alt="Roupa 2"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Overlay gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Área do botão */}
                <div className="p-6">
                  <button className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold py-4 px-6 rounded-2xl hover:from-gray-800 hover:to-gray-700 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <span className="flex items-center justify-center gap-2">
                      <span>Buy Now</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative">
              <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 group-hover:border-gray-200">
                {/* Container da imagem */}
                <div className="relative h-80 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  <img
                    src="https://videos.openai.com/vg-assets/assets%2Ftask_01jxv7mnk0ezw8nv26m1efxr2p%2F1750039490_img_2.webp?st=2025-06-16T00%3A47%3A01Z&se=2025-06-22T01%3A47%3A01Z&sks=b&skt=2025-06-16T00%3A47%3A01Z&ske=2025-06-22T01%3A47%3A01Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=8ebb0df1-a278-4e2e-9c20-f2d373479b3a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=9hxEJG1b9D0yinyvuaertkifaKtCIPDLKZH5JSSlw6A%3D&az=oaivgprodscus"
                    alt="Roupa 3"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Overlay gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Área do botão */}
                <div className="p-6">
                  <button className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold py-4 px-6 rounded-2xl hover:from-gray-800 hover:to-gray-700 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <span className="flex items-center justify-center gap-2">
                      <span>Buy Now</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* CTA adicional opcional */}
          <div className="text-center mt-16">
            <p className="text-gray-600 mb-6">Didn't find what you were looking for?</p>
            <button className="bg-white text-gray-900 border-2 border-gray-900 font-semibold py-3 px-8 rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl">
              See Full Collection
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Categorias</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div
              onClick={() => handleNavigation("products")}
              className="bg-white rounded-xl shadow-lg p-6 text-center cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="text-4xl mb-4">🛍️</div>
              <h3 className="font-semibold text-lg">Todas</h3>
            </div>
            <div
              onClick={() => handleNavigation("products")}
              className="bg-white rounded-xl shadow-lg p-6 text-center cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="text-4xl mb-4">👕</div>
              <h3 className="font-semibold text-lg">Moda</h3>
            </div>
            <div
              onClick={() => handleNavigation("products")}
              className="bg-white rounded-xl shadow-lg p-6 text-center cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="text-4xl mb-4">📱</div>
              <h3 className="font-semibold text-lg">Tecnologia</h3>
            </div>
            <div
              onClick={() => handleNavigation("products")}
              className="bg-white rounded-xl shadow-lg p-6 text-center cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="font-semibold text-lg">Casa</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Produtos em Destaque</h2>
          <div className="">
            {/*<ProductCard
              product={{
                id: 1,
                name: "Camisa",
                price: 199.99,
                originalPrice: 499.99,
                category: "tecnologia",
                image:
                  "https://images.unsplash.com/photo-1618453292459-53424b66bb6a?q=80&w=1664&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                rating: 4.8,
                reviews: 245,
              }}
              onViewDetails={() => handleNavigation(`product/1`)}
              onAddToCart={() => console.log("Adicionado ao carrinho")}
              onAddToWishlist={() => console.log("Adicionado à wishlist")}
            />*/}
            <ProductsPage/>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;