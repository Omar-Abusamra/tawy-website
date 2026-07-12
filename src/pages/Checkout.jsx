import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContextValue';
import { submitCashOnDeliveryOrder } from '../services/orders';
import BagPromptModal from '../components/BagPromptModal';
import {
  cartHasRegularProduct,
  getCartBagBlockReason,
  isBagProduct,
} from '../utils/bagProduct';
import './Checkout.css';

const initialCustomer = {
  name: '',
  phone: '',
  email: '',
  city: '',
  address: '',
  notes: '',
};

const sanitizePhoneNumber = (value) => {
  const startsWithPlus = value.trim().startsWith('+');
  const digits = value.replace(/\D/g, '');

  return `${startsWithPlus ? '+' : ''}${digits}`.slice(0, startsWithPlus ? 13 : 11);
};

const isValidEgyptianMobileNumber = (phone) => {
  const trimmedPhone = phone.trim();

  return /^01[0125]\d{8}$/.test(trimmedPhone) || /^\+201[0125]\d{8}$/.test(trimmedPhone);
};

const Checkout = () => {
  const { items, getCartTotal, clearCart } = useCart();
  const [customer, setCustomer] = useState(initialCustomer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('');
  const [orderReference, setOrderReference] = useState('');
  const [bagPromptSkipped, setBagPromptSkipped] = useState(false);

  const total = getCartTotal();
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const cartBagBlockReason = getCartBagBlockReason(items);
  const hasBagInCart = items.some(isBagProduct);
  const shouldShowBagPrompt = (
    !hasBagInCart &&
    cartHasRegularProduct(items) &&
    !bagPromptSkipped &&
    !orderReference
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCustomer((current) => ({
      ...current,
      [name]: name === 'phone' ? sanitizePhoneNumber(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('');

    if (cartBagBlockReason) {
      setStatus(cartBagBlockReason);
      return;
    }

    if (!customer.phone.trim()) {
      setStatus('Phone number is required to place your order.');
      return;
    }

    if (!isValidEgyptianMobileNumber(customer.phone)) {
      setStatus('Please enter a valid phone number, for example 01285519940 or +201285519940.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitCashOnDeliveryOrder({ customer, items, total });
      const orderNotification = {
        reference: result.orderReference,
        createdAt: Date.now(),
      };

      sessionStorage.setItem('latestOrderNotification', JSON.stringify(orderNotification));
      window.dispatchEvent(new CustomEvent('tawy:order-placed', { detail: orderNotification }));
      setOrderReference(result.orderReference);
      clearCart();
    } catch (error) {
      console.error('Error placing order:', error);
      setStatus('Order could not be sent. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderReference) {
    return (
      <main className="checkout checkout--state">
        <section className="checkout__confirmation">
          <span className="checkout__eyebrow">Order Placed</span>
          <h1>Thank you</h1>
          <p>Your cash on delivery order has been sent to TAWY. A confirmation email will arrive shortly.</p>
          <strong>{orderReference}</strong>
          <Link to="/collection" className="checkout__link-button">Continue Shopping</Link>
        </section>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="checkout checkout--state">
        <section className="checkout__confirmation">
          <span className="checkout__eyebrow">Checkout</span>
          <h1>Your cart is empty</h1>
          <p>Add your pieces before placing a cash on delivery order.</p>
          <Link to="/collection" className="checkout__link-button">Shop Collection</Link>
        </section>
      </main>
    );
  }

  if (cartBagBlockReason) {
    return (
      <main className="checkout checkout--state">
        <section className="checkout__confirmation">
          <span className="checkout__eyebrow">Checkout</span>
          <h1>Bag unavailable</h1>
          <p>{cartBagBlockReason}</p>
          <Link to="/collection" className="checkout__link-button">Shop Collection</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout">
      {shouldShowBagPrompt && (
        <BagPromptModal
          onClose={() => setBagPromptSkipped(true)}
          onSkip={() => setBagPromptSkipped(true)}
        />
      )}

      <section className="checkout__header">
        <span className="checkout__eyebrow">Cash on Delivery</span>
        <h1>Checkout</h1>
        <p>Leave your delivery details and we will prepare your order for confirmation.</p>
      </section>

      <section className="checkout__layout">
        <form className="checkout__form" onSubmit={handleSubmit}>
          <div className="checkout__method">
            <span>Payment Method</span>
            <strong>Cash on Delivery</strong>
            <p>No online payment is required now. Payment is collected when your order arrives.</p>
          </div>

          <div className="checkout__grid">
            <label>
              Full Name
              <input name="name" value={customer.name} onChange={handleChange} required />
            </label>
            <label>
              Phone Number
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                pattern="(01[0125][0-9]{8}|\+201[0125][0-9]{8})"
                maxLength="13"
                value={customer.phone}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Email
              <input name="email" type="email" value={customer.email} onChange={handleChange} required />
            </label>
            <label>
              City
              <input name="city" value={customer.city} onChange={handleChange} required />
            </label>
          </div>

          <label>
            Delivery Address
            <textarea name="address" value={customer.address} onChange={handleChange} required />
          </label>

          <label>
            Notes
            <textarea name="notes" value={customer.notes} onChange={handleChange} placeholder="Optional delivery note" />
          </label>

          <button className="checkout__submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Placing Order...' : 'Place COD Order'}
          </button>

          {status && <p className="checkout__status">{status}</p>}
        </form>

        <aside className="checkout__summary">
          <span className="checkout__summary-kicker">Order Summary</span>
          <h2>{itemCount} {itemCount === 1 ? 'piece' : 'pieces'}</h2>
          <div className="checkout__items">
            {items.map((item) => (
              <div className="checkout__item" key={`${item.id}-${item.size}-${item.color || 'no-color'}`}>
                <img src={item.image} alt={item.name} />
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.quantity} x {item.size}{item.color ? ` / ${item.color}` : ''}</span>
                </div>
                {item.price > 0 && <em>LE {(item.price * item.quantity).toLocaleString()}</em>}
              </div>
            ))}
          </div>
          <div className="checkout__total">
            <span>Total</span>
            <strong>LE {total.toLocaleString()}</strong>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default Checkout;
