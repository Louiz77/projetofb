import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { auth, db, doc, onSnapshot, getDoc } from '../client/firebaseConfig';
import { Menu, X, ShoppingBag, User, Heart, ShoppingCart } from 'lucide-react';

const Header = ({ }) => {
  const navigate = useNavigate();
  const { openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenOpen, setMobileMenOpen] = useState(false);
  const [mobileWomenOpen, setMobileWomenOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [megaMenuOpen, setMegaMenuOpen] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Estados para controle do scroll
  const lastScrollYRef = useRef(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const menuOpenRef = useRef(false);
  const isInteractingRef = useRef(false);
  const HIDE_SCROLL_MIN_Y = 200; // só permite esconder após 200px
  const DELTA_THRESHOLD = 18; // ignora movimentos pequenos

  const handleNavigation = (page) => {
    navigate(`/${page}`);
  };

  // Função para calcular quantidade total do carrinho
  const calculateCartCount = (items) => {
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  // Função para carregar carrinho do guest
  const loadGuestCart = () => {
    try {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const total = calculateCartCount(guestCart);
      setCartCount(total);
      return guestCart;
    } catch (error) {
      console.error("Erro ao carregar carrinho guest:", error);
      setCartCount(0);
      return [];
    }
  };

  // Função para carregar carrinho do usuário logado
  const loadUserCart = async (user) => {
    try {
      const cartRef = doc(db, 'carts', user.uid);
      const cartSnap = await getDoc(cartRef);
      if (cartSnap.exists()) {
        const items = cartSnap.data().items || [];
        const total = calculateCartCount(items);
        setCartCount(total);
        return items;
      } else {
        setCartCount(0);
        return [];
      }
    } catch (error) {
      console.error("Erro ao carregar carrinho do usuário:", error);
      setCartCount(0);
      return [];
    }
  };

  // Mantém referência se algum menu está aberto
  useEffect(() => {
    menuOpenRef.current = mobileMenuOpen || Boolean(megaMenuOpen);
  }, [mobileMenuOpen, megaMenuOpen]);

  // Evita scroll do body quando menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Effect para controlar o comportamento do scroll
  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY || window.pageYOffset;
      const delta = currentY - lastScrollYRef.current;

      // Não esconder enquanto estiver interagindo na header
      if (isInteractingRef.current) {
        setHeaderVisible(true);
        lastScrollYRef.current = currentY;
        return;
      }

      // Não esconder header enquanto um menu (mobile ou mega) estiver aberto
      if (menuOpenRef.current) {
        setHeaderVisible(true);
        lastScrollYRef.current = currentY;
        return;
      }

      // Sempre mostrar próximo ao topo
      if (currentY < HIDE_SCROLL_MIN_Y) {
        setHeaderVisible(true);
      } else {
        // Só reage a mudanças significativas para evitar "tremedeira"
        if (delta > DELTA_THRESHOLD) {
          // Scroll para baixo
          setHeaderVisible(false);
        } else if (delta < -DELTA_THRESHOLD) {
          // Scroll para cima
          setHeaderVisible(true);
        }
      }

      lastScrollYRef.current = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Effect para monitorar mudanças de autenticação
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      
      if (firebaseUser) {
        // Usuário logado - carrega carrinho do Firestore e monitora mudanças
        await loadUserCart(firebaseUser);
        
        const cartRef = doc(db, 'carts', firebaseUser.uid);
        const unsubscribeCart = onSnapshot(cartRef, (docSnap) => {
          if (docSnap.exists()) {
            const items = docSnap.data().items || [];
            const total = calculateCartCount(items);
            setCartCount(total);
          } else {
            setCartCount(0);
          }
        });
        
        // Cleanup será feito no return do useEffect principal
        return () => unsubscribeCart();
      } else {
        // Usuário não logado - carrega carrinho do localStorage
        loadGuestCart();
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Effect para monitorar mudanças no localStorage para guest users
  useEffect(() => {
    // Se não há usuário logado, monitora mudanças no localStorage
    if (!currentUser) {
      const handleStorageChange = (e) => {
        if (e.key === 'guestCart') {
          loadGuestCart();
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [currentUser]);

  // Effect para monitorar evento customizado de atualização do carrinho guest
  useEffect(() => {
    const handleGuestCartUpdate = (e) => {
      // Verifica se não há usuário logado antes de atualizar
      if (!currentUser) {
        if (e.detail && e.detail.items) {
          // Se o evento contém os itens, usa eles diretamente
          const total = calculateCartCount(e.detail.items);
          setCartCount(total);
        } else {
          // Caso contrário, recarrega do localStorage
          loadGuestCart();
        }
      }
    };

    // Escuta tanto o evento customizado quanto o genérico
    window.addEventListener('guestCartUpdated', handleGuestCartUpdate);
    window.addEventListener('cartUpdated', handleGuestCartUpdate);
    
    return () => {
      window.removeEventListener('guestCartUpdated', handleGuestCartUpdate);
      window.removeEventListener('cartUpdated', handleGuestCartUpdate);
    };
  }, [currentUser]);

  // Effect para carregar contagem inicial
  useEffect(() => {
    // Carrega a contagem inicial baseada no estado atual de autenticação
    const user = auth.currentUser;
    if (user) {
      loadUserCart(user);
    } else {
      loadGuestCart();
    }
  }, []);

  const menuCategories = {
    men: {
      title: 'MEN',
      items: [
        { name: 'CAMISETAS', subcategories: ['Oversized', 'Vintage', 'Band Tees', 'Gothic'] },
        { name: 'CALÇAS', subcategories: ['Cargo', 'Skinny', 'Destroyed', 'Leather'] },
        { name: 'JAQUETAS', subcategories: ['Leather', 'Bomber', 'Denim', 'Gothic'] },
        { name: 'ACESSÓRIOS', subcategories: ['Chains', 'Rings', 'Caps', 'Belts'] },
        { name: 'SHORTS', subcategories: ['Cargo', 'Denim', 'Athletic'] },
        { name: 'CALÇADOS', subcategories: ['Boots', 'Sneakers', 'Combat'] }
      ]
    },
    women: {
      title: 'WOMEN',
      items: [
        { name: 'TOPS', subcategories: ['Crop Tops', 'Tank Tops', 'Gothic', 'Mesh'] },
        { name: 'VESTIDOS', subcategories: ['Gothic', 'Mini', 'Maxi', 'Bodycon'] },
        { name: 'SAIAS', subcategories: ['Mini', 'Plissada', 'Leather', 'Tutu'] },
        { name: 'CALÇAS', subcategories: ['High Waist', 'Skinny', 'Cargo', 'Leather'] },
        { name: 'JAQUETAS', subcategories: ['Leather', 'Crop', 'Oversized', 'Blazer'] },
        { name: 'ACESSÓRIOS', subcategories: ['Jewelry', 'Bags', 'Belts', 'Hair'] }
      ]
    }
  };

  // Calcula classes CSS dinâmicas baseadas no scroll
  const getHeaderClasses = () => {
    const baseClasses = "bg-black text-white fixed top-0 left-0 right-0 z-50 border-b border-gray-800 transition-transform duration-300 ease-in-out";
    const transformClass = headerVisible ? "translate-y-0" : "-translate-y-full";
    return `${baseClasses} ${transformClass}`;
  };

  return (
    <>
      <header
        className={getHeaderClasses()}
        style={{ fontFamily: 'Helvetica Neue, sans-serif' }}
        onMouseEnter={() => { isInteractingRef.current = true; }}
        onMouseLeave={() => { isInteractingRef.current = false; }}
        onTouchStart={() => { isInteractingRef.current = true; }}
        onTouchEnd={() => { isInteractingRef.current = false; }}
        onTouchCancel={() => { isInteractingRef.current = false; }}
      >
        <div className="container mx-auto px-4 md:px-6 xl:px-8 3xl:px-10 4xl:px-12 5xl:px-16 max-w-screen-xl 3xl:max-w-screen-2xl 4xl:max-w-2k 5xl:max-w-4k">
          {/* Top announcement bar */}
          <div className="text-center py-1 text-sm tracking-wider text-gray-300 border-b border-gray-800">
            FREE SHIPPING OVER $150 • NEW COLLECTION AVAILABLE
          </div>

          {/* Main header */}
          <div className="py-4 flex justify-between items-center">
            {/* Mobile menu button */}
            <button
              className="lg:hidden text-white hover:text-red-500 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Logo */}
            <div className="flex items-center">
              <button onClick={() => handleNavigation("")} className="flex flex-col items-center group">
                <div className="text-2xl font-bold tracking-wider text-white group-hover:text-red-500 transition-colors duration-300">
                  VANADUS
                </div>
                <div className="text-sm tracking-widest text-gray-400 group-hover:text-red-400 transition-colors duration-300">
                  FOR THE UNTAMED
                </div>
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {/* HOMEM */}
              <div
                className="relative group"
                onMouseEnter={() => setMegaMenuOpen("men")}
                onMouseLeave={() => setMegaMenuOpen(null)}
              >
                <button className="text-base font-bold tracking-wider hover:text-red-500 transition-colors duration-300 py-2">
                  MEN
                </button>

                {megaMenuOpen === "men" && (
                  <div className="fixed left-0 w-full bg-black border-t border-gray-800 shadow-xl z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', backdropFilter: 'blur(10px)' }}>
                    <div className="container mx-auto px-4 py-8">
                      <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
                        {/* Imagem */}
                        <div className="lg:col-span-2">
                          <div className="relative h-48 lg:h-64 overflow-hidden rounded-lg">
                            <img 
                              src="/Header-1-Men.jpg" 
                              alt="Men's Collection"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-lg lg:text-xl font-bold tracking-wider text-white">
                                  {menuCategories["men"]?.title}
                                </div>
                                <div className="text-sm lg:text-base text-gray-200 mt-2">Nova Coleção</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Itens */}
                        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {menuCategories["men"]?.items.map((category, index) => (
                            <div key={index} className="space-y-3">
                              <h3 className="font-bold text-base tracking-wider text-red-400 border-b border-gray-700 pb-2">
                                {category.name}
                              </h3>
                              <ul className="space-y-2">
                                {category.subcategories.map((item, subIndex) => (
                                  <li key={subIndex}>
                                    <button 
                                    className="text-base text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 block"
                                    onClick={() => {
                                    handleNavigation(`men/${item.toLowerCase()}`);
                                    }}
                                    >
                                      {item}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                        <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 font-bold tracking-wider transition-colors duration-300 text-base">
                          VER TODAS AS PEÇAS {menuCategories["men"]?.title}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* MULHER */}
              <div
                className="relative group"
                onMouseEnter={() => setMegaMenuOpen("women")}
                onMouseLeave={() => setMegaMenuOpen(null)}
              >
                <button className="text-base font-bold tracking-wider hover:text-red-500 transition-colors duration-300 py-2">
                  WOMEN
                </button>

                {megaMenuOpen === "women" && (
                  <div className="fixed left-0 w-full bg-black border-t border-gray-800 shadow-xl z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', backdropFilter: 'blur(10px)' }}>
                    <div className="container mx-auto px-4 py-8">
                      <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
                        {/* Imagem */}
                        <div className="lg:col-span-2">
                          <div className="relative h-48 lg:h-64 overflow-hidden rounded-lg">
                            <img 
                              src="/Header-1-Women.jpg" 
                              alt="Women's Collection"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-lg lg:text-xl font-bold tracking-wider text-white">
                                  {menuCategories["women"]?.title}
                                </div>
                                <div className="text-sm lg:text-base text-gray-200 mt-2">Nova Coleção</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Itens */}
                        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {menuCategories["women"]?.items.map((category, index) => (
                            <div key={index} className="space-y-3">
                              <h3 className="font-bold text-base tracking-wider text-red-400 border-b border-gray-700 pb-2">
                                {category.name}
                              </h3>
                              <ul className="space-y-2">
                                {category.subcategories.map((item, subIndex) => (
                                  <li key={subIndex}>
                                    <button 
                                    className="text-base text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 block"
                                    onClick={() => {
                                    handleNavigation(`women/${item.toLowerCase()}`);
                                    }}
                                    >
                                      {item}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                        <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 font-bold tracking-wider transition-colors duration-300 text-base">
                          VER TODAS AS PEÇAS {menuCategories["women"]?.title}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Links fixos */}
              <button
                onClick={() => handleNavigation("collections")}
                className="text-base font-bold tracking-wider hover:text-red-500 transition-colors duration-300"
              >
                COLLECTIONS
              </button>

              <button
                onClick={() => handleNavigation("sale")}
                className="text-base font-bold tracking-wider hover:text-purple-500 transition-colors duration-300 text-red-500"
              >
                SALE
              </button>
            </nav>

            {/* Right side icons */}
            <div className="flex items-center space-x-3">

              {/* Wishlist */}
              <button 
                className="p-2 hover:text-red-500 transition-colors duration-300"
                onClick={() => handleNavigation("wishlist")}>
                <Heart size={24} />
              </button>

              {/* Account */}
              <button 
                onClick={() => handleNavigation("account")}
                className="hidden md:block p-2 hover:text-red-500 transition-colors duration-300"
              >
                <User size={24} />
              </button>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2 text-[#F3ECE7] hover:text-[#8A0101] transition-colors"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full min-w-6 h-6 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-black border-t border-gray-800" style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', backdropFilter: 'blur(10px)' }}>
            <div className="px-4 py-6 space-y-6">
              {/* Mobile Menu Items */}
              <div className="space-y-4">

                {/* HOME */}
                <button
                  onClick={() => {
                    handleNavigation("");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-white hover:text-red-500 transition-colors py-2 font-bold tracking-wider text-base"
                >
                  HOME
                </button>

                {/* HOMEM - Accordion */}
                <div>
                  <button
                    onClick={() => setMobileMenOpen(!mobileMenOpen)}
                    className="flex justify-between items-center w-full text-left text-white hover:text-red-500 transition-colors py-2 font-bold tracking-wider text-base"
                  >
                    MEN
                    <span className="text-lg">{mobileMenOpen ? "−" : "+"}</span>
                  </button>
                  {mobileMenOpen && (
                    <div className="ml-4 mt-2 space-y-4">
                      {menuCategories["men"]?.items.map((category, index) => (
                        <div key={index}>
                          <div className="text-base font-bold text-red-400">
                            {category.name}
                          </div>
                          <ul className="mt-1 space-y-1">
                            {category.subcategories.map((sub, subIndex) => (
                              <li key={subIndex}>
                                <button
                                  onClick={() => {
                                    handleNavigation(`men/${sub.toLowerCase()}`);
                                    setMobileMenuOpen(false);
                                  }}
                                  className="text-base text-gray-300 hover:text-white block"
                                >
                                  {sub}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* MULHER - Accordion */}
                <div>
                  <button
                    onClick={() => setMobileWomenOpen(!mobileWomenOpen)}
                    className="flex justify-between items-center w-full text-left text-white hover:text-red-500 transition-colors py-2 font-bold tracking-wider text-base"
                  >
                    WOMEN
                    <span className="text-lg">{mobileWomenOpen ? "−" : "+"}</span>
                  </button>
                  {mobileWomenOpen && (
                    <div className="ml-4 mt-2 space-y-4">
                      {menuCategories["women"]?.items.map((category, index) => (
                        <div key={index}>
                          <div className="text-base font-bold text-red-400">
                            {category.name}
                          </div>
                          <ul className="mt-1 space-y-1">
                            {category.subcategories.map((sub, subIndex) => (
                              <li key={subIndex}>
                                <button
                                  onClick={() => {
                                    handleNavigation(`women/${sub.toLowerCase()}`);
                                    setMobileMenuOpen(false);
                                  }}
                                  className="text-base text-gray-300 hover:text-white block"
                                >
                                  {sub}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* COLEÇÕES */}
                <button
                  onClick={() => {
                    handleNavigation("collections");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-white hover:text-red-500 transition-colors py-2 font-bold tracking-wider text-base"
                >
                  COLLECTIONS
                </button>

                {/* SALE */}
                <button
                  onClick={() => {
                    handleNavigation("sale");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-red-400 hover:text-red-500 transition-colors py-2 font-bold tracking-wider text-base"
                >
                  SALE
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Overlay for mega menu */}
      {megaMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMegaMenuOpen(null)}
        />
      )}

      {/* Spacer para compensar o header fixed */}
      <div className="h-[100px]" />
    </>
  );
};

export default Header;