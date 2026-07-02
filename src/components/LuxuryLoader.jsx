import React, { useEffect, useState } from 'react';
import lotusPattern from '../assets/Lotus Pattern (1).svg';
import logoImage from '../assets/transparent-image (1).png';
import keyIcon from '../assets/key.svg';
import './LuxuryLoader.css';

const LuxuryLoader = ({ onComplete }) => {
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    const revealTimer = window.setTimeout(() => {
      setIsRevealing(true);
    }, 5000);

    const completeTimer = window.setTimeout(() => {
      onComplete?.();
    }, 6700);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`luxury-loader ${isRevealing ? 'luxury-loader--reveal' : ''}`}
      role="status"
      aria-label="Loading TAWY"
    >
      <img
        src={lotusPattern}
        alt=""
        className="luxury-loader__bg"
        aria-hidden="true"
        draggable={false}
      />
      <div className="luxury-loader__border luxury-loader__border--top" aria-hidden="true">
        <img
          src={lotusPattern}
          alt=""
          className="luxury-loader__pattern"
          draggable={false}
        />
      </div>
      <div className="luxury-loader__border luxury-loader__border--bottom" aria-hidden="true">
        <img
          src={lotusPattern}
          alt=""
          className="luxury-loader__pattern"
          draggable={false}
        />
      </div>
      <section className="luxury-loader__brand" aria-hidden={isRevealing}>
        <div className="luxury-loader__logo-wrap">
          <img
            src={logoImage}
            alt="TAWY"
            className="luxury-loader__logo"
            decoding="async"
            fetchPriority="high"
            draggable={false}
          />
        </div>
        <p>Ancient Roots, Modern Cuts.</p>
        <img
          src={keyIcon}
          alt=""
          className="luxury-loader__key"
          aria-label="Ancient Egyptian life key"
          draggable={false}
        />
      </section>
    </div>
  );
};

export default LuxuryLoader;
