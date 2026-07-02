import React from 'react';
import { Link } from 'react-router-dom';
import introImg from '../assets/intro.jpeg';
import tawyLogo from '../assets/transparent-image (1).png';
import ImageSlideshow from '../components/ImageSlideshow';
import './Home.css';

const collectionImages = Object.entries(
  import.meta.glob('../assets/New folder/*.{jpeg,jpg,png,webp}', {
    eager: true,
    import: 'default',
  })
)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
  .map(([, src]) => src);

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero__img hero__img--solid" aria-hidden="true"></div>
        <div className="hero__overlay">
          <div className="hero__content">
            <h1 className="hero-logo">
              <img src={tawyLogo} alt="TAWY" className="hero-logo__img" />
            </h1>
            <p className="hero-tag">Ancient Egypt, reimagined</p>
            <Link to="/collection" className="hero__button">
              Shop the Collection
            </Link>
          </div>
        </div>
      </section>

      <div className="strip">
        <div className="strip-track">
          <span>Red Sea Summer 2026</span><span>•</span>
          <span>Linen & Light</span><span>•</span>
          <span>Made in Egypt</span><span>•</span>
          <span>Red Sea Summer 2026</span><span>•</span>
          <span>Linen & Light</span><span>•</span>
          <span>Made in Egypt</span><span>•</span>
        </div>
        <div className="strip-track" aria-hidden="true">
        <span>Red Sea Summer 2026</span><span>•</span>
          <span>Linen & Light</span><span>•</span>
          <span>Made in Egypt</span><span>•</span>
          <span>Red Sea Summer 2026</span><span>•</span>
          <span>Linen & Light</span><span>•</span>
          <span>Made in Egypt</span><span>•</span>
        </div>
      </div>

      <section className="editorial">
        <div className="wrap">
          <div className="feature">
            <img className="feature__image" src={introImg} alt="TAWY intro" />
            <div className="feature__copy">
              <h2>Intro</h2>
              <p>TAWY means "the Two Lands" - the ancient name of a united Egypt.</p>
              <p>
                We take our inspiration from ancient Egyptian art, heritage, and culture.
                Every piece is designed without external branding. Just quality, comfort,
                and simplicity. We create seasonally. Each collection is tied to a location
                in Egypt and the season that inspires it. The location decides the colors,
                the fabrics, and the vibe.
              </p>
              <p>
                Our mission is to preserve Egyptian heritage by modernizing it. Ancient cuts,
                modernized. Inspired by the art, the colors, the resources, the architecture
                of our ancestors, reimagined for everyone today.
              </p>
              <p>Comfortable. Good quality. Made to last.</p>
              <Link to="/collection" className="btn-gold">Explore</Link>
            </div>
          </div>

          <div className="feature">
            <div className="feature__copy">
              <h2>Collection</h2>
              <p className="feature__lead">The Red Sea Collection</p>
              <p>Our first collection begins where Egypt meets the sea.</p>
              <p>
                Inspired by the Red Sea, based in Hurghada, this summer collection is made
                entirely of linen, the same fabric our ancestors wove thousands of years ago.
                Lightweight, breathable, and made for the sun.
              </p>
              <p>
                The colors come from the coast itself. Deep navy and soft yellow, the sea and
                the sand. Olive and black, the earth and the depths.
              </p>
              <p>
                Pieces designed for warm days and easy evenings, from the beach to the city.
              </p>
              <Link to="/collection" className="btn-gold">Shop the Collection</Link>
            </div>
            <ImageSlideshow images={collectionImages} alt="The Red Sea Collection" interval={2000} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 