import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, findProductBySlug } from '../services/api';
import products from '../services/products';
import { useCart } from '../context/CartContextValue';
import SizeGuide from '../components/SizeGuide';
import { getBagOrderBlockReason, getCartBagBlockReason, isBagProduct } from '../utils/bagProduct';
import { getColorSwatch } from '../utils/colorSwatch';
import './ProductDetails.css';

const TruckIcon = () => (
  <svg className="product-detail__icon" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="1" y="3" width="15" height="13" rx="2" />
    <path d="M16 8h3l4 4v4a2 2 0 0 1-2 2h-1" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg className={`product-detail__chevron ${open ? 'product-detail__chevron--open' : ''}`} width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 8 10 12 14 8" />
  </svg>
);

const Collapsible = ({ title, icon, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="product-detail__accordion">
      <button
        className="product-detail__accordion-trigger"
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="product-detail__accordion-title">{icon}{title}</span>
        <ChevronIcon open={open} />
      </button>
      <div className={`product-detail__accordion-panel ${open ? 'product-detail__accordion-panel--open' : ''}`}>
        <p>{children}</p>
      </div>
    </div>
  );
};

const resolveStaticProduct = (collectionSlug, productSlug) => (
  findProductBySlug(products, productSlug, collectionSlug)
);

const applyProductSelection = (nextProduct) => ({
  product: nextProduct,
  selectedSize: nextProduct.sizes?.[0] || '',
  selectedColor: nextProduct.colors?.[0] || '',
});

const getDisplayDescriptionLines = (description = '') => (
  description
    .replace(/\bCOTTON\s*100%\b/gi, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.toLowerCase().startsWith('model size'))
);

const getColorSlides = (product, color) => {
  const media = product.colorMedia?.[color];
  const slides = [];

  if (media) {
    (media.images || []).forEach((src) => {
      if (src) slides.push({ type: 'image', src });
    });
    if (media.video) slides.push({ type: 'video', src: media.video });
  }

  if (slides.length === 0) {
    const src = product.colorImages?.[color] || product.image;
    if (src) slides.push({ type: 'image', src });
  }

  return slides;
};

const getProductImage = (product, color) => {
  const firstImage = getColorSlides(product, color).find((slide) => slide.type === 'image');
  return firstImage?.src || product.colorImages?.[color] || product.image;
};

const ArrowIcon = ({ direction }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {direction === 'prev'
      ? <polyline points="15 18 9 12 15 6" />
      : <polyline points="9 18 15 12 9 6" />}
  </svg>
);

const ProductDetails = () => {
  const { collectionSlug, productSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const prefetchedProduct = location.state?.product;
  const staticProduct = useMemo(
    () => resolveStaticProduct(collectionSlug, productSlug),
    [collectionSlug, productSlug]
  );
  const immediateProduct = prefetchedProduct || staticProduct;
  const initialSelection = immediateProduct ? applyProductSelection(immediateProduct) : null;

  const [product, setProduct] = useState(initialSelection?.product || null);
  const [loading, setLoading] = useState(!immediateProduct);
  const [error, setError] = useState(false);
  const [selectedSize, setSelectedSize] = useState(initialSelection?.selectedSize || '');
  const [selectedColor, setSelectedColor] = useState(initialSelection?.selectedColor || '');
  const [slideIndex, setSlideIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [bagNoticeMessage, setBagNoticeMessage] = useState('');
  const { addToCart, items } = useCart();

  useLayoutEffect(() => {
    const nextProduct = prefetchedProduct || staticProduct;

    setQuantity(1);
    setShowAddedMessage(false);
    setBagNoticeMessage('');

    if (nextProduct) {
      const selection = applyProductSelection(nextProduct);
      setProduct(selection.product);
      setSelectedSize(selection.selectedSize);
      setSelectedColor(selection.selectedColor);
      setError(false);
      setLoading(false);
      return;
    }

    setProduct(null);
    setSelectedSize('');
    setSelectedColor('');
    setError(false);
    setLoading(true);
  }, [collectionSlug, productSlug, prefetchedProduct, staticProduct]);

  useEffect(() => {
    let isMounted = true;

    const refreshProduct = async () => {
      try {
        const foundProduct = await api.getProductBySlug(productSlug, collectionSlug);
        if (!isMounted) return;

        if (foundProduct) {
          setProduct((current) => (
            current?.id === foundProduct.id && current?.slug === foundProduct.slug
              ? current
              : foundProduct
          ));
          setSelectedSize((current) => (
            foundProduct.sizes?.includes(current) ? current : (foundProduct.sizes?.[0] || '')
          ));
          setSelectedColor((current) => (
            foundProduct.colors?.includes(current) ? current : (foundProduct.colors?.[0] || '')
          ));
          setError(false);
        } else if (!immediateProduct) {
          setError(true);
        }
      } catch (fetchError) {
        console.error('Error fetching product:', fetchError);
        if (isMounted && !immediateProduct) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    refreshProduct();

    return () => {
      isMounted = false;
    };
  }, [collectionSlug, productSlug, immediateProduct]);

  useEffect(() => {
    setSlideIndex(0);
  }, [selectedColor, product?.id]);

  useEffect(() => {
    if (!product) return;
    getColorSlides(product, selectedColor).forEach((slide) => {
      if (slide.type === 'image' && slide.src) {
        const preloadImage = new Image();
        preloadImage.src = slide.src;
      }
    });
  }, [product, selectedColor]);

  const handleAddToCart = () => {
    if (!product || !selectedSize || (product.colors?.length && !selectedColor)) return;

    const orderQuantity = isBagProduct(product) ? 1 : quantity;

    if (isBagProduct(product)) {
      const blockReason = getBagOrderBlockReason(items, selectedColor);
      if (blockReason) {
        setBagNoticeMessage(blockReason);
        return;
      }
    }

    addToCart({ ...product, image: getProductImage(product, selectedColor) }, selectedSize, orderQuantity, selectedColor);
    setShowAddedMessage(true);
    setBagNoticeMessage('');
    setTimeout(() => setShowAddedMessage(false), 3000);
  };

  const handleBuyNow = () => {
    if (!product || !selectedSize || (product.colors?.length && !selectedColor)) return;

    const orderQuantity = isBagProduct(product) ? 1 : quantity;

    if (isBagProduct(product)) {
      const blockReason = getBagOrderBlockReason(items, selectedColor);
      if (blockReason) {
        setBagNoticeMessage(blockReason);
        return;
      }
    }

    addToCart({ ...product, image: getProductImage(product, selectedColor) }, selectedSize, orderQuantity, selectedColor);
    navigate('/cart');
  };

  if (loading) {
    return (
      <main className="product-detail product-detail--state">
        <p>Preparing the piece...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="product-detail product-detail--state">
        <p>Product not found.</p>
        <Link to="/collection">Back to the collection</Link>
      </main>
    );
  }

  const descriptionLines = getDisplayDescriptionLines(product.description);
  const productColors = product.colors || [];
  const slides = getColorSlides(product, selectedColor);
  const safeIndex = slides.length ? Math.min(slideIndex, slides.length - 1) : 0;
  const currentSlide = slides[safeIndex];
  const hasMultipleSlides = slides.length > 1;
  const goToSlide = (index) => {
    if (!slides.length) return;
    setSlideIndex((slides.length + index) % slides.length);
  };
  const canPurchase = selectedSize && (!productColors.length || selectedColor);
  const isBag = isBagProduct(product);
  const cartBagBlockReason = isBag ? getCartBagBlockReason(items) : null;
  const displayBagNotice = bagNoticeMessage || cartBagBlockReason;

  return (
    <main className="product-detail">
      <Link to="/collection" className="product-detail__back">Back to collection</Link>

      <section className="product-detail__layout">
        <div className="product-detail__media">
          <div className="product-detail__gallery">
            {currentSlide?.type === 'video' ? (
              <video
                key={currentSlide.src}
                className="product-detail__slide"
                src={currentSlide.src}
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                key={currentSlide?.src}
                className="product-detail__slide"
                src={currentSlide?.src}
                alt={`${product.name}${selectedColor ? ` in ${selectedColor}` : ''}`}
                fetchPriority="high"
                decoding="async"
              />
            )}

            {hasMultipleSlides && (
              <>
                <button
                  type="button"
                  className="product-detail__nav product-detail__nav--prev"
                  onClick={() => goToSlide(safeIndex - 1)}
                  aria-label="Previous media"
                >
                  <ArrowIcon direction="prev" />
                </button>
                <button
                  type="button"
                  className="product-detail__nav product-detail__nav--next"
                  onClick={() => goToSlide(safeIndex + 1)}
                  aria-label="Next media"
                >
                  <ArrowIcon direction="next" />
                </button>
              </>
            )}
          </div>
        </div>

        <section className="product-detail__info" aria-labelledby="product-title">
          <p className="product-detail__eyebrow">{product.brand || 'TAWY'}</p>
          <h1 id="product-title">{product.name}</h1>
          {product.price > 0 && <p className="product-detail__price">LE {product.price.toLocaleString()}</p>}
          <p className="product-detail__note">Tax included. Shipping calculated at checkout.</p>

          <div className="product-detail__description">
            {descriptionLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          {productColors.length > 0 && (
            <div className="product-detail__field">
              <div className="product-detail__field-head">
                <label>Color</label>
                <span className="product-detail__selected-value">{selectedColor}</span>
              </div>
              <div className="product-detail__colors" role="radiogroup" aria-label="Choose color">
                {productColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`product-detail__color ${selectedColor === color ? 'product-detail__color--selected' : ''}`}
                    onClick={() => setSelectedColor(color)}
                    role="radio"
                    aria-checked={selectedColor === color}
                    aria-label={color}
                  >
                    <span style={{ backgroundColor: getColorSwatch(color) }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="product-detail__field">
            <div className="product-detail__field-head">
              <label htmlFor="size">Size</label>
              <button type="button" onClick={() => setShowSizeGuide(true)}>
                Size guide
              </button>
            </div>
            <select id="size" value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)}>
              <option value="">Select a size</option>
              {product.sizes.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>

          {!isBag && (
            <div className="product-detail__field">
              <label htmlFor="quantity">Quantity</label>
              <div className="product-detail__quantity" id="quantity">
                <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>-</button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((current) => current + 1)}>+</button>
              </div>
            </div>
          )}

          {displayBagNotice && (
            <p className="product-detail__bag-notice" role="alert">
              {displayBagNotice}
            </p>
          )}

          <div className="product-detail__actions">
            <button
              className="product-detail__button product-detail__button--outline"
              type="button"
              disabled={!canPurchase}
              onClick={handleAddToCart}
            >
              {showAddedMessage ? 'Added to Cart' : 'Add to Cart'}
            </button>
            <button
              className="product-detail__button product-detail__button--solid"
              type="button"
              disabled={!canPurchase}
              onClick={handleBuyNow}
            >
              Buy It Now
            </button>
          </div>

          <div className="product-detail__accordions">
            <Collapsible icon={<TruckIcon />} title="Shipping and Returns">{product.shipping}</Collapsible>
          </div>
        </section>
      </section>

      <SizeGuide
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        productType="dresses"
      />
    </main>
  );
};

export default ProductDetails;
