import React, { useEffect, useRef, useState } from 'react';
import './ImageSlideshow.css';

const SWIPE_THRESHOLD = 40;

const ImageSlideshow = ({ images = [], alt = '', interval = 3500 }) => {
  const [index, setIndex] = useState(0);
  const pointerStartX = useRef(null);
  const count = images.length;

  useEffect(() => {
    if (count <= 1) return undefined;
    const timer = setTimeout(() => {
      setIndex((current) => (current + 1) % count);
    }, interval);
    return () => clearTimeout(timer);
  }, [index, count, interval]);

  if (count === 0) return null;

  const goTo = (next) => setIndex(((next % count) + count) % count);

  const handlePointerDown = (event) => {
    pointerStartX.current = event.clientX;
  };

  const handlePointerUp = (event) => {
    if (pointerStartX.current === null) return;
    const deltaX = event.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (deltaX > SWIPE_THRESHOLD) goTo(index - 1);
    else if (deltaX < -SWIPE_THRESHOLD) goTo(index + 1);
  };

  return (
    <div
      className="home-slideshow"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => { pointerStartX.current = null; }}
      role="group"
      aria-roledescription="carousel"
      aria-label={alt}
    >
      {images.map((src, i) => (
        <img
          key={src}
          className={`home-slideshow__img ${i === index ? 'home-slideshow__img--active' : ''}`}
          src={src}
          alt={`${alt}${count > 1 ? ` ${i + 1}` : ''}`}
          draggable="false"
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}
    </div>
  );
};

export default ImageSlideshow;
