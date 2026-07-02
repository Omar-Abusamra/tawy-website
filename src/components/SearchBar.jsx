import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = ({ products = [], onSearch, isOpen = false, onClose }) => {
  const [query, setQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const handleProductClick = useCallback(() => {
    setQuery('');
    onClose && onClose();
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        onClose && onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          onClose && onClose();
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredProducts.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          if (selectedIndex >= 0 && filteredProducts[selectedIndex]) {
            event.preventDefault();
            handleProductClick();
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      // Focus the input when search opens
      setTimeout(() => {
        inputRef.current && inputRef.current.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, filteredProducts, selectedIndex, handleProductClick]);

  useEffect(() => {
    if (query.trim() === '') {
      setFilteredProducts([]);
      setSelectedIndex(-1);
      return;
    }

    const filtered = products.filter(product => {
      const searchTerm = query.toLowerCase();
      return (
        product.name?.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm) ||
        product.category?.toLowerCase().includes(searchTerm) ||
        product.collection?.toLowerCase().includes(searchTerm)
      );
    }).slice(0, 8); // Limit to 8 results

    setFilteredProducts(filtered);
    setSelectedIndex(-1); // Reset selection when query changes
  }, [query, products]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
    onClose && onClose();
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const clearSearch = () => {
    setQuery('');
    setFilteredProducts([]);
  };

  return (
    <div className="search-container" ref={searchRef}>
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <button 
            type="button" 
            className="search-close-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onClose) {
                onClose();
              }
            }}
            aria-label="Close search"
          >
            ×
          </button>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={handleInputChange}
            className="search-input"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="search-clear-btn"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
          <button type="submit" className="search-submit-btn" aria-label="Submit search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>
      </form>

      {filteredProducts.length > 0 && (
        <div className="search-results">
          <div className="search-results-header">
            <span>Search Results</span>
            <span className="search-results-count">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="search-results-list">
            {filteredProducts.map((product, index) => (
              <Link
                key={product.id}
                to={`/collection/${product.collection || 'all'}/${product.slug}`}
                state={{ product }}
                className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={handleProductClick}
              >
                <div className="search-result-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="search-result-info">
                  <div className="search-result-name">{product.name}</div>
                  <div className="search-result-brand">{product.brand}</div>
                    {product.price > 0 && <div className="search-result-price">LE {product.price}</div>}
                </div>
              </Link>
            ))}
          </div>
          {filteredProducts.length > 0 && (
            <div className="search-results-footer">
              <Link to={`/collection?search=${encodeURIComponent(query)}`} className="search-view-all">
                View all results
              </Link>
            </div>
          )}
        </div>
      )}

      {query.trim() && filteredProducts.length === 0 && (
        <div className="search-empty">
          No matches found. Try searching by product, brand, or collection.
        </div>
      )}
    </div>
  );
};

export default SearchBar; 