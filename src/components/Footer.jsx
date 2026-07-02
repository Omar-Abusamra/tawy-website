import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="wrap">
      <div className="foot">
        <div className="news">
          <h3>Join the Tawy world</h3>
          <p>First looks, collection drops, and stories from the Two Lands.</p>
          {/* Newsletter signup form hidden for now
          <form className="news-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Email address" aria-label="Email address" />
            <button type="submit">Join</button>
          </form>
          */}
        </div>

        <nav className="foot-links">
          <Link to="/collection">Shop</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>

      <div className="copyright">
        © 2026 TAWY | Egypt
      </div>
    </div>
  </footer>
);

export default Footer;
