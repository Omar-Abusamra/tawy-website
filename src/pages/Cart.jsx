import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContextValue';
import { getCartBagBlockReason, isBagProduct } from '../utils/bagProduct';
import './Cart.css';

const getCartItemKey = (item) => `${item.id}-${item.size}-${item.color || 'no-color'}`;

const Cart = () => {
  const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [removingItems, setRemovingItems] = useState([]);
  const cartItemCount = items.reduce((count, item) => count + item.quantity, 0);
  const cartBagBlockReason = getCartBagBlockReason(items);

  const handleRemoveItem = (item) => {
    const itemKey = getCartItemKey(item);

    setRemovingItems((current) => (
      current.includes(itemKey) ? current : [...current, itemKey]
    ));

    setTimeout(() => {
      removeFromCart(item.id, item.size, item.color || '');
      setRemovingItems((current) => current.filter((key) => key !== itemKey));
    }, 240);
  };

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-content">
          <span>Your Selection</span>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/collection" className="cart-empty-button">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <div>
          <span className="cart-eyebrow">Your Selection</span>
          <h1>Shopping Cart</h1>
          <p>{cartItemCount} {cartItemCount === 1 ? 'piece' : 'pieces'} reserved for checkout</p>
        </div>
        <button onClick={clearCart} className="clear-cart-button">
          Clear Cart
        </button>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {items.map((item) => {
            const itemKey = getCartItemKey(item);
            const isRemoving = removingItems.includes(itemKey);
            const isBag = isBagProduct(item);

            return (
            <div key={itemKey} className={`cart-item ${isRemoving ? 'cart-item--removing' : ''}`}>
              <div className="cart-item-image">
                <img src={item.image} alt={item.name} />
              </div>
              
              <div className="cart-item-details">
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-brand">{item.brand}</p>
                  <div className="cart-item-options">
                    <span>Size: {item.size}</span>
                    {item.color && <span>Color: {item.color}</span>}
                  </div>
                  {item.price > 0 && <p className="cart-item-price">LE {item.price.toLocaleString()}</p>}
                </div>

                <div className="cart-item-actions">
                  {!isBag && (
                    <div className="quantity-controls">
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1, item.color || '')}
                        className="quantity-btn"
                        disabled={item.quantity <= 1 || isRemoving}
                      >
                        -
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1, item.color || '')}
                        className="quantity-btn"
                        disabled={isRemoving}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="cart-item-total">
                <p className={item.price > 0 ? '' : 'cart-item-total__placeholder'}>
                  {item.price > 0 ? `LE ${(item.price * item.quantity).toLocaleString()}` : 'LE 0'}
                </p>
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="remove-item-btn"
                  disabled={isRemoving}
                >
                  Remove
                </button>
              </div>
            </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <span className="cart-summary__eyebrow">Checkout</span>
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal ({cartItemCount} {cartItemCount === 1 ? 'item' : 'items'})</span>
            <span>LE {getCartTotal().toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>LE {getCartTotal().toLocaleString()}</span>
          </div>
          
          {cartBagBlockReason && (
            <p className="cart-summary__warning" role="alert">
              {cartBagBlockReason}
            </p>
          )}

          {cartBagBlockReason ? (
            <span className="checkout-button checkout-button--disabled" aria-disabled="true">
              Proceed to Checkout
            </span>
          ) : (
            <Link to="/checkout" className="checkout-button">
              Proceed to Checkout
            </Link>
          )}
          <p className="cart-summary__note">Your cart is saved on this device, so it will stay here after refreshing.</p>
          
          <Link to="/collection" className="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart; 