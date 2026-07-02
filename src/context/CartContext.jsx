import React, { useReducer, useEffect } from 'react';
import { CartContext } from './CartContextValue';
import { cartHasOnlyBag, getCartBagBlockReason, isBagProduct } from '../utils/bagProduct';

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const payload = isBagProduct(action.payload)
        ? { ...action.payload, quantity: 1 }
        : action.payload;

      if (isBagProduct(payload)) {
        const itemsWithoutBag = state.items.filter((item) => !isBagProduct(item));
        return {
          ...state,
          items: [...itemsWithoutBag, payload],
        };
      }

      const existingItem = state.items.find(
        item => (
          item.id === payload.id &&
          item.size === payload.size &&
          (item.color || '') === (payload.color || '')
        )
      );
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === payload.id &&
            item.size === payload.size &&
            (item.color || '') === (payload.color || '')
              ? { ...item, quantity: item.quantity + payload.quantity }
              : item
          )
        };
      }

      return {
        ...state,
        items: [...state.items, payload]
      };
    }

    case 'LOAD_CART':
      return {
        ...state,
        items: Array.isArray(action.payload) ? action.payload : []
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => 
          !(
            item.id === action.payload.id &&
            item.size === action.payload.size &&
            (item.color || '') === (action.payload.color || '')
          )
        )
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id &&
          item.size === action.payload.size &&
          (item.color || '') === (action.payload.color || '')
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    default:
      return state;
  }
};

const getInitialCartState = () => {
  try {
    const savedCart = localStorage.getItem('cart');
    if (!savedCart) return { items: [] };

    const parsedCart = JSON.parse(savedCart);
    return {
      items: Array.isArray(parsedCart.items) ? parsedCart.items : []
    };
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return { items: [] };
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, undefined, getInitialCartState);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  const addToCart = (product, size, quantity = 1, color = '') => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        size,
        color,
        quantity,
        slug: product.slug,
        collection: product.collection
      }
    });
  };

  const removeFromCart = (productId, size, color = '') => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: { id: productId, size, color }
    });
  };

  const updateQuantity = (productId, size, quantity, color = '') => {
    const item = state.items.find((cartItem) => (
      cartItem.id === productId &&
      cartItem.size === size &&
      (cartItem.color || '') === (color || '')
    ));

    if (item && isBagProduct(item)) {
      return;
    }

    if (quantity <= 0) {
      removeFromCart(productId, size, color);
    } else {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id: productId, size, quantity, color }
      });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    cartHasOnlyBag: () => cartHasOnlyBag(state.items),
    cartHasRegularProduct: () => state.items.some((item) => !isBagProduct(item)),
    getCartBagBlockReason: () => getCartBagBlockReason(state.items),
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};