import React, { useEffect, useState } from 'react';
import { api, findProductBySlug } from '../services/api';
import seedProducts from '../services/products';
import { useCart } from '../context/CartContextValue';
import {
  BAG_GOLD_REQUIRES_ORDER_MESSAGE,
  getBagOrderBlockReason,
  isBagGoldColor,
} from '../utils/bagProduct';
import { getColorSwatch } from '../utils/colorSwatch';
import './BagPromptModal.css';

const getBagImage = (product, color) => (
  product?.colorImages?.[color] || product?.image || ''
);

const getBagColorImages = (product) => {
  if (!product) return [];

  const colors = product.colors?.length
    ? product.colors
    : Object.keys(product.colorImages || {});

  return colors
    .map((color) => ({
      color,
      src: getBagImage(product, color),
    }))
    .filter((entry) => entry.src);
};

const preloadImages = (urls) => {
  urls.forEach((url) => {
    const image = new Image();
    image.src = url;
  });
};

const BagPromptModal = ({ onClose, onSkip }) => {
  const { items, addToCart } = useCart();
  const [bagProduct, setBagProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let isMounted = true;

    const seedBag = findProductBySlug(seedProducts, 'bag', 'accessories');
    if (seedBag) {
      preloadImages(getBagColorImages(seedBag).map((entry) => entry.src));
    }

    const loadBagProduct = async () => {
      try {
        const product = await api.getProductBySlug('bag', 'accessories');
        if (isMounted && product) {
          setBagProduct(product);
        }
      } catch (error) {
        console.error('Error loading bag product:', error);
      }

      if (isMounted) {
        setBagProduct((current) => (
          current || findProductBySlug(seedProducts, 'bag', 'accessories')
        ));
      }
    };

    loadBagProduct();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!bagProduct?.colors?.length || selectedColor) return;

    const firstAllowed = bagProduct.colors.find(
      (color) => !getBagOrderBlockReason(items, color)
    );

    setSelectedColor(firstAllowed || bagProduct.colors[0]);
  }, [bagProduct, items, selectedColor]);

  useEffect(() => {
    if (!bagProduct) return;
    preloadImages(getBagColorImages(bagProduct).map((entry) => entry.src));
  }, [bagProduct]);

  const blockReason = selectedColor ? getBagOrderBlockReason(items, selectedColor) : '';

  const handleAddBag = () => {
    if (!bagProduct || !selectedColor) return;

    const reason = getBagOrderBlockReason(items, selectedColor);
    if (reason) {
      setNotice(reason);
      return;
    }

    addToCart(
      {
        ...bagProduct,
        image: getBagImage(bagProduct, selectedColor),
      },
      bagProduct.sizes?.[0] || 'One Size',
      1,
      selectedColor
    );
    onClose();
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setNotice(getBagOrderBlockReason(items, color) || '');
  };

  return (
    <div className="bag-prompt-overlay" role="presentation" onClick={onSkip}>
      <div
        className="bag-prompt"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bag-prompt-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="bag-prompt__close" onClick={onSkip} aria-label="Close">
          &times;
        </button>

        <div className="bag-prompt__header">
          <span className="bag-prompt__eyebrow">Complimentary</span>
          <h2 id="bag-prompt-title">Choose your bag</h2>
          <p>Select a bag color for your order, or skip if you do not want one.</p>
        </div>

        {bagProduct?.image && (
          <div className="bag-prompt__preview">
            {getBagColorImages(bagProduct).map(({ color, src }) => (
              <img
                key={color}
                src={src}
                alt={selectedColor === color ? `TAWY bag in ${color}` : ''}
                aria-hidden={selectedColor !== color}
                className={`bag-prompt__preview-image ${selectedColor === color ? 'bag-prompt__preview-image--active' : ''}`}
                decoding="async"
              />
            ))}
          </div>
        )}

        <div className="bag-prompt__field">
          <div className="bag-prompt__field-head">
            <span>Color</span>
            {selectedColor && <span className="bag-prompt__selected">{selectedColor}</span>}
          </div>

          <div className="bag-prompt__colors" role="radiogroup" aria-label="Choose bag color">
            {(bagProduct?.colors || []).map((color) => (
              <button
                key={color}
                type="button"
                className={`bag-prompt__color ${selectedColor === color ? 'bag-prompt__color--selected' : ''}`}
                onClick={() => handleColorSelect(color)}
                role="radio"
                aria-checked={selectedColor === color}
                aria-label={color}
              >
                <span style={{ backgroundColor: getColorSwatch(color) }} />
              </button>
            ))}
          </div>
        </div>

        {isBagGoldColor(selectedColor) && blockReason === BAG_GOLD_REQUIRES_ORDER_MESSAGE && (
          <p className="bag-prompt__notice">{BAG_GOLD_REQUIRES_ORDER_MESSAGE}</p>
        )}

        {notice && notice !== BAG_GOLD_REQUIRES_ORDER_MESSAGE && (
          <p className="bag-prompt__notice" role="alert">{notice}</p>
        )}

        <div className="bag-prompt__actions">
          <button
            type="button"
            className="bag-prompt__add"
            onClick={handleAddBag}
            disabled={!bagProduct || !selectedColor || Boolean(blockReason)}
          >
            Add Bag
          </button>
          <button type="button" className="bag-prompt__skip" onClick={onSkip}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default BagPromptModal;
