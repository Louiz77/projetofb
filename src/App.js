import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
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
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [notification, setNotification] = useState("");
  const [user, setUser] = useState(null);

  const addToCart = (product, quantity = 1) => {
    setCart([...cart, { ...product, quantity }]);
    setNotification("Adicionado ao carrinho");
  };

  const removeFromCart = (item) => {
    setCart(cart.filter((cartItem) => cartItem.id !== item.id));
    setNotification("Removido do carrinho");
  };

  const addToWishlist = (product) => {
    if (wishlist.some((p) => p.id === product.id)) {
      setWishlist(wishlist.filter((p) => p.id !== product.id));
      setNotification("Removido da lista de desejos");
    } else {
      setWishlist([...wishlist, product]);
      setNotification("Adicionado à lista de desejos");
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const checkout = () => {
    setCart([]);
    showNotification("Pedido realizado com sucesso! Você receberá um email de confirmação.");
  };

  return (
  <CartProvider>
    <Router>
      <Analytics />
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <main>
        <Routes>
          <Route path="/" element={<Home setCurrentPage={setCurrentPage} />} />
          <Route
            path="/products"
            element={
              <Products
                setCurrentPage={setCurrentPage}
                searchQuery={searchQuery}
                addToCart={addToCart}
                addToWishlist={addToWishlist}
                wishlist={wishlist}
              />
            }
          />
          <Route 
            path="/product/:productId" 
            element={<ProductDetail />} 
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