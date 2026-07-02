import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import tawyLogo from '../assets/transparent-image (1).png';
import { useCart } from '../context/CartContextValue';
import SearchBar from './SearchBar';
import { api, sameProductList } from '../services/api';
import seedProducts from '../services/products';

const SearchIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
const CartIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
);

const getLatestOrderNotification = () => {
  try {
    const savedNotification = sessionStorage.getItem('latestOrderNotification');
    return savedNotification ? JSON.parse(savedNotification) : null;
  } catch (error) {
    console.error('Error loading order notification:', error);
    sessionStorage.removeItem('latestOrderNotification');
    return null;
  }
};

const Navbar = () => {
  const [show, setShow] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [products, setProducts] = useState(seedProducts);
  const [latestOrder, setLatestOrder] = useState(getLatestOrderNotification);
  const lastScrollY = useRef(0);
  const { pathname } = useLocation();
  const { getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();
  const hasHamburgerNotification = latestOrder || cartItemCount > 0;

  const desktopLinks = [
    { label: 'HOME', to: '/', isActive: pathname === '/' },
    { label: 'SHOP', to: '/collection', isActive: pathname.startsWith('/collection') },
    { label: 'ABOUT', to: '/about', isActive: pathname === '/about' },
    
    { label: 'CONTACT', to: '/contact', isActive: pathname === '/contact' },
  ];

  useEffect(() => {
    const handleResize = () => {
      // No longer need isMobile state
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const response = await api.getProducts();
        if (isMounted) {
          setProducts((current) => (
            sameProductList(current, response.data) ? current : response.data
          ));
        }
      } catch (error) {
        console.error('Error loading search products:', error);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > lastScrollY.current && window.scrollY > 100) {
        setShow(false);
      } else {
        setShow(true);
      }
      lastScrollY.current = window.scrollY;
    };

    window.addEventListener('scroll', controlNavbar);
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [menuOpen]);

  useEffect(() => {
    const handleOrderPlaced = (event) => {
      setLatestOrder(event.detail || getLatestOrderNotification());
    };

    const handleStorageChange = (event) => {
      if (event.key === 'latestOrderNotification') {
        setLatestOrder(getLatestOrderNotification());
      }
    };

    window.addEventListener('tawy:order-placed', handleOrderPlaced);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('tawy:order-placed', handleOrderPlaced);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <header className={`navbar-container ${!show ? 'navbar--hidden' : ''}`}>
      <nav className="navbar">
        <div className="navbar__left">
          <button 
            className="navbar__icon search-toggle"
            onClick={() => {
              setShowSearch(!showSearch);
            }}
            aria-label="Search"
          >
            <SearchIcon />
          </button>
        </div>

        <div className="navbar__logo-main">
          <Link to="/" className="navbar__logo-link" aria-label="TAWY home">
            <img src={tawyLogo} alt="TAWY" className="navbar__logo-img" />
          </Link>
        </div>

        <div className="navright">
          <ul className="navbar__menu navbar__menu--desktop">
            {desktopLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className={`navbar__link ${link.isActive ? 'navbar__link--active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="navbar__right">
            <Link to="/cart" className="navbar__icon cart-icon">
              <CartIcon />
              {getCartItemCount() > 0 && (
                <span className="cart-badge">{getCartItemCount()}</span>
              )}
            </Link>
            <button 
              className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--active' : ''} ${hasHamburgerNotification ? 'navbar__hamburger--notified' : ''}`} 
              onClick={() => setMenuOpen(!menuOpen)} 
              aria-label={hasHamburgerNotification ? 'Open menu, notifications available' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
              {hasHamburgerNotification && (
                <i className="navbar__hamburger-badge" aria-hidden="true">
                  {cartItemCount > 0 ? cartItemCount : ''}
                </i>
              )}
            </button>
          </div>
        </div>
      </nav>
      
      {/* Dropdown overlay for outside click */}
      {menuOpen && (
        <div
          className="navbar__dropdown-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}
      
      {/* Dropdown menu with pure CSS transitions */}
      <div className={`navbar__dropdown-menu ${menuOpen ? 'navbar__dropdown-menu--open' : ''}`}>
        <ul
          className="navbar__dropdown-list"
          onClick={e => e.stopPropagation()}
        >
          {cartItemCount > 0 && (
            <li className="navbar__order-notification">
              <span>Cart</span>
              <strong>{cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} ready</strong>
            </li>
          )}
          <li onClick={() => setMenuOpen(false)}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              HOME
            </Link>
          </li>
          <li onClick={() => setMenuOpen(false)}>
            <Link to="/collection" style={{ textDecoration: 'none', color: 'inherit' }}>
              SHOP
            </Link>
          </li>
          <li onClick={() => setMenuOpen(false)}>
            <Link to="/about" style={{ textDecoration: 'none', color: 'inherit' }}>
              ABOUT
            </Link>
          </li>
          <li onClick={() => setMenuOpen(false)}>
            <Link to="/contact" style={{ textDecoration: 'none', color: 'inherit' }}>
              CONTACT US
            </Link>
          </li>
          <li onClick={() => setMenuOpen(false)}>
            <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit' }}>
              CART{cartItemCount > 0 ? ` (${cartItemCount})` : ''}
            </Link>
          </li>
        </ul>
      </div>

      {/* Search Bar */}
      <div 
        className={`navbar__search-overlay ${showSearch ? 'active' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowSearch(false);
          }
        }}
      >
        <div className="navbar__search-container">
          <SearchBar 
            products={products}
            isOpen={showSearch}
            onClose={() => {
              setShowSearch(false);
            }}
            onSearch={() => {
              setShowSearch(false);
            }}
          />
        </div>
      </div>

    </header>
  );
};

export default Navbar; 