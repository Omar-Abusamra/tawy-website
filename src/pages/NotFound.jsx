import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => (
  <main className="not-found">
    <section className="not-found__content">
      <span className="not-found__eyebrow">404</span>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or may have moved.</p>
      <Link to="/" className="not-found__link">Back to Home</Link>
      <Link to="/collection" className="not-found__link not-found__link--outline">Shop Collection</Link>
    </section>
  </main>
);

export default NotFound;
