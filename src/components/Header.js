import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";

const Header = ({ currentPage, setCurrentPage, searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (page) => {
    navigate(`/${page}`);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            className="lg:hidden text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <button onClick={() => handleNavigation("")}>
            <h1 className="text-2xl font-bold text-blue-600">VANADUS</h1>
          </button>
        </div>

        <div className="relative hidden lg:block w-64">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleNavigation("cart")}
            className="relative p-2 text-gray-600 hover:text-blue-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              3
            </span>
          </button>
          <button
            onClick={() => handleNavigation("account")}
            className="hidden md:flex items-center text-sm text-gray-700 hover:text-blue-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Account
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-4 py-4 border-t">
          <div className="flex flex-col space-y-4">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
            <button
              onClick={() => {
                handleNavigation("home")
                setMobileMenuOpen(false);
              }}
              className="text-gray-700 hover:text-blue-600 py-2"
            >
              Início
            </button>
            <button
              onClick={() => {
                handleNavigation("products");
                setMobileMenuOpen(false);
              }}
              className="text-gray-700 hover:text-blue-600 py-2"
            >
              Produtos
            </button>
            <button
              onClick={() => {
                handleNavigation("cart");
                setMobileMenuOpen(false);
              }}
              className="text-gray-700 hover:text-blue-600 py-2"
            >
              Carrinho
            </button>
            <button
              onClick={() => {
                handleNavigation("account");
                setMobileMenuOpen(false);
              }}
              className="text-gray-700 hover:text-blue-600 py-2"
            >
              Conta
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;