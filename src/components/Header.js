import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { auth, db, doc, onSnapshot, getDoc } from '../client/firebaseConfig';
import { Search, Menu, X, ShoppingBag, User, Heart } from 'lucide-react';

const Header = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const { openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [megaMenuOpen, setMegaMenuOpen] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

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
      title: 'HOMEM',
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
      title: 'MULHER',
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

  return (
    <>
      <header className="bg-black text-white sticky top-0 z-50 border-b border-gray-800">
        <div className="container mx-auto px-4">
          {/* Top announcement bar */}
          <div className="text-center py-2 text-xs tracking-wider text-gray-300 border-b border-gray-800">
            FRETE GRÁTIS ACIMA DE $150 • NOVA COLEÇÃO DISPONÍVEL
          </div>

          {/* Main header */}
          <div className="py-4 flex justify-between items-center">
            {/* Mobile menu button */}
            <button
              className="lg:hidden text-white hover:text-red-500 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <div className="flex items-center">
              <button onClick={() => handleNavigation("")} className="flex flex-col items-center group">
                <div className="text-2xl font-bold tracking-wider text-white group-hover:text-red-500 transition-colors duration-300">
                  VANADUS
                </div>
                <div className="text-xs tracking-widest text-gray-400 group-hover:text-red-400 transition-colors duration-300">
                  FOR THE UNTAMED
                </div>
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <div 
                className="relative group"
                onMouseEnter={() => setMegaMenuOpen('men')}
                onMouseLeave={() => setMegaMenuOpen(null)}
              >
                <button className="text-sm font-medium tracking-wider hover:text-red-500 transition-colors duration-300 py-2">
                  HOMEM
                </button>
              </div>

              <div 
                className="relative group"
                onMouseEnter={() => setMegaMenuOpen('women')}
                onMouseLeave={() => setMegaMenuOpen(null)}
              >
                <button className="text-sm font-medium tracking-wider hover:text-red-500 transition-colors duration-300 py-2">
                  MULHER
                </button>
              </div>

              <button 
                onClick={() => handleNavigation("collections")}
                className="text-sm font-medium tracking-wider hover:text-red-500 transition-colors duration-300"
              >
                COLEÇÕES
              </button>

              <button 
                onClick={() => handleNavigation("sale")}
                className="text-sm font-medium tracking-wider hover:text-purple-500 transition-colors duration-300 text-red-500"
              >
                SALE
              </button>
            </nav>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">

              {/* Wishlist */}
              <button 
                className="p-2 hover:text-red-500 transition-colors duration-300"
                onClick={() => handleNavigation("wishlist")}>
                <Heart size={20} />
              </button>

              {/* Account */}
              <button 
                onClick={() => handleNavigation("account")}
                className="hidden md:block p-2 hover:text-red-500 transition-colors duration-300"
              >
                <User size={20} />
              </button>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2 text-[#F3ECE7] hover:text-[#8A0101] transition-colors"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mega Menu */}
        {megaMenuOpen && (
          <div 
            className="absolute left-0 w-full bg-black border-t border-gray-800 shadow-xl"
            onMouseEnter={() => setMegaMenuOpen(megaMenuOpen)}
            onMouseLeave={() => setMegaMenuOpen(null)}
          >
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-6 gap-8">
                {/* Category Image */}
                <div className="col-span-2">
                  <div className="bg-gray-900 h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🖤</div>
                      <div className="text-lg font-bold tracking-wider">
                        {menuCategories[megaMenuOpen]?.title}
                      </div>
                      <div className="text-sm text-gray-400 mt-2">
                        Nova Coleção
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="col-span-4 grid grid-cols-3 gap-6">
                  {menuCategories[megaMenuOpen]?.items.map((category, index) => (
                    <div key={index} className="space-y-3">
                      <h3 className="font-bold text-sm tracking-wider text-red-400 border-b border-gray-700 pb-2">
                        {category.name}
                      </h3>
                      <ul className="space-y-2">
                        {category.subcategories.map((item, subIndex) => (
                          <li key={subIndex}>
                            <button className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 block">
                              {item}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 font-bold tracking-wider transition-colors duration-300">
                  VER TODAS AS PEÇAS {menuCategories[megaMenuOpen]?.title}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-black border-t border-gray-800">
            <div className="px-4 py-6 space-y-6">
              {/* Mobile Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-red-500"
                />
                <Search className="absolute right-3 top-3.5 text-gray-400" size={16} />
              </div>

              {/* Mobile Menu Items */}
              <div className="space-y-4">
                <button
                  onClick={() => {
                    handleNavigation("");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-white hover:text-red-500 transition-colors py-2 font-medium tracking-wider"
                >
                  HOME
                </button>
                <button
                  onClick={() => {
                    handleNavigation("men");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-white hover:text-red-500 transition-colors py-2 font-medium tracking-wider"
                >
                  HOMEM
                </button>
                <button
                  onClick={() => {
                    handleNavigation("women");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-white hover:text-red-500 transition-colors py-2 font-medium tracking-wider"
                >
                  MULHER
                </button>
                <button
                  onClick={() => {
                    handleNavigation("collections");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-white hover:text-red-500 transition-colors py-2 font-medium tracking-wider"
                >
                  COLEÇÕES
                </button>
                <button
                  onClick={() => {
                    handleNavigation("sale");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-red-400 hover:text-red-500 transition-colors py-2 font-medium tracking-wider"
                >
                  SALE
                </button>
                <button
                  onClick={() => {
                    handleNavigation("account");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-white hover:text-red-500 transition-colors py-2 font-medium tracking-wider"
                >
                  MINHA CONTA
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
    </>
  );
};

export default Header;