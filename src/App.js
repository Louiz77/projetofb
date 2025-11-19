import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import ProductsPage from "./pages/ProductsPage";
import CartModal from "./pages/Cart";
import { CartProvider } from './hooks/useCart';
import Account from "./pages/Account";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import WishlistPage from "./pages/Wishlist";
import { Analytics } from "@vercel/analytics/react"

const App = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);

  return (
  <CartProvider>
    <Router>
      <Analytics />
      <Header // quando estiver descendo a header deve ficar blur
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <main>
        <Routes>
          <Route path="/" element={<Home setCurrentPage={setCurrentPage} />} />

          <Route 
            path="/product/:productId" 
            element={<ProductDetail />} 
          />
          
          {/* Rotas para categorias e subcategorias com gênero */}
          <Route 
            path="/tag/:gender/:category" 
            element={<ProductsPage />} 
          />
          <Route 
            path="/tag/:gender/:category/:subcategory" 
            element={<ProductsPage />} 
          />
          {/* Rotas de compatibilidade (sem gênero) - para URLs antigas */}
          <Route 
            path="/tag/:tag" 
            element={<ProductsPage />} 
          />
          <Route 
            path="/tag/:tag/:subcategory" 
            element={<ProductsPage />} 
          />
          
          <Route
            path="/faq"
            element={<FAQ/>}
          />
          <Route
            path="/account"
            element={<Account setUser={setUser} user={user} />}
          />
          <Route
            path="/contact"
            element={<Contact />}
          />
          <Route
            path="/wishlist"
            element={<WishlistPage />}
          />
        </Routes>
        <CartModal />
      </main>
      <Footer />
    </Router>
  </CartProvider>
  );
};

export default App;