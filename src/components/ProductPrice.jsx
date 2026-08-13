import { formatPrice, getCartItemPriceDisplay, getPriceDisplay } from '../utils/pricing';
import './ProductPrice.css';

const ProductPrice = ({
  product,
  item,
  className = '',
  size = 'default',
  showCurrency = true,
}) => {
  const display = item ? getCartItemPriceDisplay(item) : getPriceDisplay(product);

  if (display.isFree) {
    return null;
  }

  const prefix = showCurrency ? 'LE ' : '';

  if (display.onSale) {
    return (
      <span className={`product-price product-price--sale product-price--${size} ${className}`.trim()}>
        <span className="product-price__original" aria-label={`Original price ${prefix}${formatPrice(display.original)}`}>
          {prefix}{formatPrice(display.original)}
        </span>
        <span className="product-price__current" aria-label={`Sale price ${prefix}${formatPrice(display.current)}`}>
          {prefix}{formatPrice(display.current)}
        </span>
      </span>
    );
  }

  return (
    <span className={`product-price product-price--${size} ${className}`.trim()}>
      {prefix}{formatPrice(display.current)}
    </span>
  );
};

export default ProductPrice;
