import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Collection from './pages/Collection';
import About from './pages/About';
import Contact from './pages/Contact';
import Footer from './components/Footer';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import NotFound from './pages/NotFound';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import AnimatedBackground from './components/AnimatedBackground';
import LuxuryLoader from './components/LuxuryLoader';
import ScrollToTop from './components/ScrollToTop';
import { prefetchProducts } from './services/api';
import './App.css';

const LOADER_SESSION_KEY = 'tawy-loader-seen';

const hasSeenLoaderThisSession = () => (
  sessionStorage.getItem(LOADER_SESSION_KEY) === 'true'
);

function App() {
  const [showLoader, setShowLoader] = useState(() => !hasSeenLoaderThisSession());
  const handleLoaderComplete = useCallback(() => {
    sessionStorage.setItem(LOADER_SESSION_KEY, 'true');
    setShowLoader(false);
  }, []);

  useEffect(() => {
    prefetchProducts();
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          {showLoader && <LuxuryLoader onComplete={handleLoaderComplete} />}
          <AnimatedBackground />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            
            <Route path="/collection" element={<Collection />} />
            <Route path="/collection/:collectionSlug" element={<Collection />} />
            <Route path="/collection/:collectionSlug/:productSlug" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
