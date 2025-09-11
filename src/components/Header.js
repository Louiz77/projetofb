import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { auth, db, doc, onSnapshot, getDoc } from '../client/firebaseConfig';
import { Menu, X, ShoppingBag, User, Heart, ShoppingCart, ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';

const Header = ({ }) => {
  const navigate = useNavigate();
  const { openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubMenu, setMobileSubMenu] = useState(null); // 'men', 'women', ou null
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
    // Reset submenu when main menu closes
    if (!mobileMenuOpen) {
      setMobileSubMenu(null);
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Effect para controlar o comportamento do scroll
  useEffect(() => {
    let touchStartY = 0;
    let touchEndY = 0;
    let isMobile = window.innerWidth < 1024;
    
    const onScroll = () => {
      const currentY = window.scrollY || window.pageYOffset;
      const delta = currentY - lastScrollYRef.current;

      // Não esconder enquanto estiver interagindo na header (apenas para desktop)
      if (isInteractingRef.current && !isMobile) {
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

    // Handler para touch events no mobile
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      touchEndY = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      // Reset da interação apenas se não estiver na header
      const headerElement = document.querySelector('header');
      const target = document.elementFromPoint(touchEndY, touchStartY);
      
      if (!headerElement?.contains(target)) {
        isInteractingRef.current = false;
      }
    };

    // Handler para resize
    const handleResize = () => {
      isMobile = window.innerWidth < 1024;
      // Reset interaction state on resize
      isInteractingRef.current = false;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    // Eventos de touch apenas para mobile
    if (isMobile) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
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
        { name: 'FOOTWEAR', subcategories: ['Sandals', 'Creepers', 'Sneakers', 'Boots'] },
        { name: 'TOP', subcategories: ['T-Shirt', 'Tank Tops', 'Outerwear'] },
        { name: 'BOTTOM', subcategories: ['Pants', 'Shorts'] },
        { name: 'ACCESSORIES', subcategories: ['Bags', 'Hats and Caps', 'Rings', 'Necklaces', 'Bracelets', 'Belts', 'Gloves', 'Glasses/Sunglasses', 'Socks', 'Others'] }
      ]
    },
    women: {
      title: 'WOMEN',
      items: [
        { name: 'FOOTWEAR', subcategories: ['Sandals', 'Creepers', 'High Heels', 'Mary Janes', 'Sneakers', 'Boots'] },
        { name: 'TOP', subcategories: ['T-Shirt', 'Tank Tops', 'Outerwear'] },
        { name: 'BOTTOM', subcategories: ['Pants', 'Shorts', 'Skirts'] },
        { name: 'FULL-BODY', subcategories: ['Dresses', 'Jumpsuits'] },
        { name: 'ACCESSORIES', subcategories: ['Bags', 'Hats and Caps', 'Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Belts', 'Corsets', 'Kerchiefs', 'Gloves', 'Glasses/Sunglasses', 'Socks', 'Others'] }
      ]
    },
    style: {
      title: 'STYLE',
      items: [
        { name: 'GOTH', subcategories: [] },
        { name: 'STREETWEAR', subcategories: [] },
        { name: 'Y2K', subcategories: [] },
        { name: 'GRUNGE', subcategories: [] },
        { name: 'EMO', subcategories: [] },
        { name: 'PUNK', subcategories: [] }
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
        onMouseEnter={() => { 
          if (window.innerWidth >= 1024) {
            isInteractingRef.current = true; 
          }
        }}
        onMouseLeave={() => { 
          if (window.innerWidth >= 1024) {
            isInteractingRef.current = false; 
          }
        }}
        onTouchStart={() => { 
          if (window.innerWidth < 1024) {
            isInteractingRef.current = true; 
          }
        }}
        onTouchEnd={() => { 
          if (window.innerWidth < 1024) {
            // Delay para permitir cliques
            setTimeout(() => {
              isInteractingRef.current = false;
            }, 300);
          }
        }}
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
                                <div className="text-sm lg:text-base text-gray-200 mt-2">New Collection</div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                            <button 
                              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 font-bold tracking-wider transition-colors duration-300 text-base"
                              onClick={() => {
                                handleNavigation("tag/men");
                                setMegaMenuOpen(null);
                              }}
                            >
                              VER TODAS AS PEÇAS {menuCategories["men"]?.title}
                            </button>
                          </div>
                        </div>

                        {/* Itens */}
                        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                          {menuCategories["men"]?.items.map((category, index) => (
                            <div key={index} className={`space-y-3 ${category.name === 'ACCESSORIES' ? 'lg:col-span-2' : ''}`}>
                              <h3 className="font-bold text-base tracking-wider text-red-400 border-b border-gray-700 pb-2">
                                <button 
                                  className="hover:text-white transition-colors duration-200"
                                  onClick={() => {
                                    handleNavigation(`tag/${category.name.toLowerCase()}`);
                                    setMegaMenuOpen(null);
                                  }}
                                >
                                  {category.name}
                                </button>
                              </h3>
                              <ul className={`space-y-2 ${category.name === 'ACCESSORIES' ? 'grid grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-2' : ''}`}>
                                {category.subcategories.map((item, subIndex) => (
                                  <li key={subIndex}>
                                    <button 
                                    className="text-base text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 block w-full text-left"
                                    onClick={() => {
                                    handleNavigation(`tag/${category.name.toLowerCase()}/${item.toLowerCase().replace(/\s+/g, '-').replace(/[\/]/g, '-')}`);
                                    setMegaMenuOpen(null);
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
                                <div className="text-sm lg:text-base text-gray-200 mt-2">New Collection</div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                            <button 
                              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 font-bold tracking-wider transition-colors duration-300 text-base"
                              onClick={() => {
                                handleNavigation("tag/women");
                                setMegaMenuOpen(null);
                              }}
                            >
                              VER TODAS AS PEÇAS {menuCategories["women"]?.title}
                            </button>
                          </div>
                        </div>

                        {/* Itens */}
                        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                          {menuCategories["women"]?.items.map((category, index) => (
                            <div key={index} className={`space-y-3 ${category.name === 'ACCESSORIES' ? 'lg:col-span-2' : ''}`}>
                              <h3 className="font-bold text-base tracking-wider text-red-400 border-b border-gray-700 pb-2">
                                <button 
                                  className="hover:text-white transition-colors duration-200"
                                  onClick={() => {
                                    handleNavigation(`tag/${category.name.toLowerCase()}`);
                                    setMegaMenuOpen(null);
                                  }}
                                >
                                  {category.name}
                                </button>
                              </h3>
                              <ul className={`space-y-2 ${category.name === 'ACCESSORIES' ? 'grid grid-cols-2 lg:grid-cols-6 gap-x-4 gap-y-2' : ''}`}>
                                {category.subcategories.map((item, subIndex) => (
                                  <li key={subIndex}>
                                    <button 
                                    className="text-base text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 block w-full text-left"
                                    onClick={() => {
                                    handleNavigation(`tag/${category.name.toLowerCase()}/${item.toLowerCase().replace(/\s+/g, '-').replace(/[\/]/g, '-')}`);
                                    setMegaMenuOpen(null);
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
                    </div>
                  </div>
                )}
              </div>

              {/* STYLE */}
              <div
                className="relative group"
                onMouseEnter={() => setMegaMenuOpen("style")}
                onMouseLeave={() => setMegaMenuOpen(null)}
              >
                <button className="text-base font-bold tracking-wider hover:text-red-500 transition-colors duration-300 py-2">
                  STYLE
                </button>

                {megaMenuOpen === "style" && (
                  <div className="fixed left-0 w-full bg-black border-t border-gray-800 shadow-xl z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', backdropFilter: 'blur(10px)' }}>
                    <div className="container mx-auto px-4 py-8">
                      <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
                        {/* Imagem */}
                        <div className="lg:col-span-2">
                          <div className="relative h-48 lg:h-64 overflow-hidden rounded-lg">
                            <img 
                              src="/Collections-1.jpg" 
                              alt="Style Collection"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-lg lg:text-xl font-bold tracking-wider text-white">
                                  {menuCategories["style"]?.title}
                                </div>
                                <div className="text-sm lg:text-base text-gray-200 mt-2">Your Style Journey</div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                            <button 
                              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 font-bold tracking-wider transition-colors duration-300 text-base"
                              onClick={() => {
                                handleNavigation("tag/style");
                                setMegaMenuOpen(null);
                              }}
                            >
                              VER TODOS OS ESTILOS
                            </button>
                          </div>
                        </div>

                        {/* Itens */}
                        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {menuCategories["style"]?.items.map((category, index) => (
                            <div key={index} className="space-y-3">
                              <h3 className="font-bold text-lg tracking-wider text-red-400 border-b border-gray-700 pb-2">
                                <button 
                                  className="hover:text-white transition-colors duration-200"
                                  onClick={() => {
                                    handleNavigation(`tag/${category.name.toLowerCase()}`);
                                    setMegaMenuOpen(null);
                                  }}
                                >
                                  {category.name}
                                </button>
                              </h3>
                              <p className="text-sm text-gray-400">
                                {category.name === 'GOTH' && 'Dark aesthetic and alternative fashion'}
                                {category.name === 'STREETWEAR' && 'Urban culture and modern street style'}
                                {category.name === 'Y2K' && 'Futuristic 2000s revival fashion'}
                                {category.name === 'GRUNGE' && 'Raw, rebellious and distressed style'}
                                {category.name === 'EMO' && 'Emotional expression through fashion'}
                                {category.name === 'PUNK' && 'Rebellious counterculture fashion'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Links fixos */}
              <button
                onClick={() => {
                  handleNavigation("collections");
                  setMegaMenuOpen(null);
                }}
                className="text-base font-bold tracking-wider hover:text-red-500 transition-colors duration-300"
              >
                COLLECTIONS
              </button>

              <button
                onClick={() => {
                  handleNavigation("sale");
                  setMegaMenuOpen(null);
                }}
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
                onClick={() => {
                  handleNavigation("wishlist");
                  setMegaMenuOpen(null);
                }}>
                <Heart size={24} />
              </button>

              {/* Account */}
              <button 
                onClick={() => {
                  handleNavigation("account");
                  setMegaMenuOpen(null);
                }}
                className="hidden md:block p-2 hover:text-red-500 transition-colors duration-300"
              >
                <User size={24} />
              </button>

              {/* Cart */}
              <button
                onClick={() => {
                  openCart();
                  setMegaMenuOpen(null);
                }}
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

        {/* Mobile Menu - Redesigned */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-800" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
            {/* Menu Header */}


            {/* Menu Content - Scrollable */}
            <div className="flex-1 overflow-y-auto h-full" style={{ 
              height: 'calc(100vh - 120px)',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain'
            }}>
              {/* Main Menu */}
              {!mobileSubMenu && (
                <div className="p-4 space-y-2">
                  {/* HOME */}
                  <button
                    onClick={() => {
                      handleNavigation("");
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-between w-full text-left text-white hover:bg-gray-900 p-4 rounded-lg transition-colors font-bold tracking-wider text-lg"
                  >
                    HOME
                  </button>

                  {/* MEN */}
                  <button
                    onClick={() => setMobileSubMenu("men")}
                    className="flex items-center justify-between w-full text-left text-white hover:bg-gray-900 p-4 rounded-lg transition-colors font-bold tracking-wider text-lg"
                  >
                    MEN
                    <ChevronRight size={20} />
                  </button>

                  {/* WOMEN */}
                  <button
                    onClick={() => setMobileSubMenu("women")}
                    className="flex items-center justify-between w-full text-left text-white hover:bg-gray-900 p-4 rounded-lg transition-colors font-bold tracking-wider text-lg"
                  >
                    WOMEN
                    <ChevronRight size={20} />
                  </button>

                  {/* STYLE */}
                  <button
                    onClick={() => setMobileSubMenu("style")}
                    className="flex items-center justify-between w-full text-left text-white hover:bg-gray-900 p-4 rounded-lg transition-colors font-bold tracking-wider text-lg"
                  >
                    STYLE
                    <ChevronRight size={20} />
                  </button>

                  {/* COLLECTIONS */}
                  <button
                    onClick={() => {
                      handleNavigation("collections");
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-between w-full text-left text-white hover:bg-gray-900 p-4 rounded-lg transition-colors font-bold tracking-wider text-lg"
                  >
                    COLLECTIONS
                  </button>

                  {/* SALE */}
                  <button
                    onClick={() => {
                      handleNavigation("sale");
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-between w-full text-left text-red-400 hover:bg-gray-900 p-4 rounded-lg transition-colors font-bold tracking-wider text-lg"
                  >
                    SALE
                  </button>

                  {/* Account (Mobile Only) */}
                  <button
                    onClick={() => {
                      handleNavigation("account");
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-between w-full text-left text-white hover:bg-gray-900 p-4 rounded-lg transition-colors font-bold tracking-wider text-lg md:hidden"
                  >
                    <span className="flex items-center">
                      <User size={20} className="mr-3" />
                      ACCOUNT
                    </span>
                  </button>
                </div>
              )}

              {/* Sub Menu - Men */}
              {mobileSubMenu === "men" && (
                <div className="h-full">
                  <div className="p-4 pb-20">
                    {/* Back Button */}
                    <button
                      onClick={() => setMobileSubMenu(null)}
                      className="flex items-center text-white hover:text-red-500 mb-6 p-2 transition-colors sticky top-0 z-10"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
                    >
                      <ArrowLeft size={20} className="mr-2" />
                      <span className="font-bold">BACK TO MENU</span>
                    </button>

                    {/* Men's Image Header */}
                    <div className="relative h-52 mb-6 rounded-lg overflow-hidden">
                      <img 
                        src="/Header-1-Men.jpg" 
                        alt="Men's Collection"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white tracking-wider">MEN</div>
                          <div className="text-sm text-gray-200">New Collection</div>
                        </div>
                      </div>
                    </div>

                    {/* View All Button */}
                    <div className="mb-6">
                      <button 
                        onClick={() => {
                          handleNavigation("men");
                          setMobileMenuOpen(false);
                          setMobileSubMenu(null);
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 font-bold tracking-wider transition-colors rounded-lg"
                      >
                        VIEW ALL (MEN)
                      </button>
                    </div>

                    {/* Men's Categories */}
                    <div className="space-y-6 pb-8">
                      {menuCategories["men"]?.items.map((category, index) => (
                        <div key={index} className="border-b border-gray-800 pb-4 last:border-b-0">
                          <div className="text-lg font-bold text-red-400 mb-3 tracking-wider">
                            <button 
                              className="hover:text-white transition-colors duration-200"
                              onClick={() => {
                                handleNavigation(`tag/${category.name.toLowerCase()}`);
                                setMobileMenuOpen(false);
                                setMobileSubMenu(null);
                              }}
                            >
                              {category.name}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {category.subcategories.map((sub, subIndex) => (
                              <button
                                key={subIndex}
                                onClick={() => {
                                  handleNavigation(`tag/${category.name.toLowerCase()}/${sub.toLowerCase().replace(/\s+/g, '-').replace(/[\/]/g, '-')}`);
                                  setMobileMenuOpen(false);
                                  setMobileSubMenu(null);
                                }}
                                className="text-left text-gray-300 hover:text-white hover:bg-gray-900 p-3 rounded-lg transition-colors text-sm"
                              >
                                {sub}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub Menu - Women */}
              {mobileSubMenu === "women" && (
                <div className="h-full">
                  <div className="p-4 pb-20">
                    {/* Back Button */}
                    <button
                      onClick={() => setMobileSubMenu(null)}
                      className="flex items-center text-white hover:text-red-500 mb-6 p-2 transition-colors sticky top-0 z-10"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
                    >
                      <ArrowLeft size={20} className="mr-2" />
                      <span className="font-bold">BACK TO MENU</span>
                    </button>

                    {/* Women's Image Header */}
                    <div className="relative h-52 mb-6 rounded-lg overflow-hidden">
                      <img 
                        src="/Header-1-Women.jpg" 
                        alt="Women's Collection"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white tracking-wider">WOMEN</div>
                          <div className="text-sm text-gray-200">New Collection</div>
                        </div>
                      </div>
                    </div>

                    {/* View All Button */}
                    <div className="mb-6">
                      <button 
                        onClick={() => {
                          handleNavigation("women");
                          setMobileMenuOpen(false);
                          setMobileSubMenu(null);
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 font-bold tracking-wider transition-colors rounded-lg"
                      >
                        VIEW ALL (WOMEN)
                      </button>
                    </div>

                    {/* Women's Categories */}
                    <div className="space-y-6 pb-8">
                      {menuCategories["women"]?.items.map((category, index) => (
                        <div key={index} className="border-b border-gray-800 pb-4 last:border-b-0">
                          <div className="text-lg font-bold text-red-400 mb-3 tracking-wider">
                            <button 
                              className="hover:text-white transition-colors duration-200"
                              onClick={() => {
                                handleNavigation(`tag/${category.name.toLowerCase()}`);
                                setMobileMenuOpen(false);
                                setMobileSubMenu(null);
                              }}
                            >
                              {category.name}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {category.subcategories.map((sub, subIndex) => (
                              <button
                                key={subIndex}
                                onClick={() => {
                                  handleNavigation(`tag/${category.name.toLowerCase()}/${sub.toLowerCase().replace(/\s+/g, '-').replace(/[\/]/g, '-')}`);
                                  setMobileMenuOpen(false);
                                  setMobileSubMenu(null);
                                }}
                                className="text-left text-gray-300 hover:text-white hover:bg-gray-900 p-3 rounded-lg transition-colors text-sm"
                              >
                                {sub}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Sub Menu - Style */}
              {mobileSubMenu === "style" && (
                <div className="h-full">
                  <div className="p-4 pb-20">
                    {/* Back Button */}
                    <button
                      onClick={() => setMobileSubMenu(null)}
                      className="flex items-center text-white hover:text-red-500 mb-6 p-2 transition-colors sticky top-0 z-10"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
                    >
                      <ArrowLeft size={20} className="mr-2" />
                      <span className="font-bold">BACK TO MENU</span>
                    </button>

                    {/* Style Image Header */}
                    <div className="relative h-52 mb-6 rounded-lg overflow-hidden">
                      <img 
                        src="/Collections-1.jpg" 
                        alt="Style Collection"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white tracking-wider">STYLE</div>
                          <div className="text-sm text-gray-200">Your Style Journey</div>
                        </div>
                      </div>
                    </div>

                    {/* View All Button */}
                    <div className="mb-6">
                      <button 
                        onClick={() => {
                          handleNavigation("style");
                          setMobileMenuOpen(false);
                          setMobileSubMenu(null);
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 font-bold tracking-wider transition-colors rounded-lg"
                      >
                        VIEW ALL STYLES
                      </button>
                    </div>

                    {/* Style Categories */}
                    <div className="space-y-4 pb-8">
                      {menuCategories["style"]?.items.map((category, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            handleNavigation(`tag/${category.name.toLowerCase()}`);
                            setMobileMenuOpen(false);
                            setMobileSubMenu(null);
                          }}
                          className="w-full text-left bg-gray-900 hover:bg-gray-800 p-4 rounded-lg transition-colors"
                        >
                          <div className="text-lg font-bold text-red-400 mb-2 tracking-wider">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-300">
                            {category.name === 'GOTH' && 'Dark aesthetic and alternative fashion'}
                            {category.name === 'STREETWEAR' && 'Urban culture and modern street style'}
                            {category.name === 'Y2K' && 'Futuristic 2000s revival fashion'}
                            {category.name === 'GRUNGE' && 'Raw, rebellious and distressed style'}
                            {category.name === 'EMO' && 'Emotional expression through fashion'}
                            {category.name === 'PUNK' && 'Rebellious counterculture fashion'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Footer */}
            <div className="border-t border-gray-800 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
              <div className="text-center text-gray-400 text-sm">
                VANADUS • FOR THE UNTAMED
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