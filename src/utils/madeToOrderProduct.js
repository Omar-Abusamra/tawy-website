export const WAIST_SIZE_PRODUCT_SLUG = 'draped-silhouette-twisted-front';

export const WAIST_SIZE_PHRASE = 'draped silhouette with twisted front';

export const MADE_TO_ORDER_NOTICE_TITLE = 'Made to order notice';

export const MADE_TO_ORDER_NOTICE_BODY = (
  'Made to order in one week. Not eligible for exchange or return, '
  + 'so please check your measurement before you order.'
);

const getProductSearchText = (product) => (
  [
    product?.name,
    product?.description,
    product?.slug?.replace(/-/g, ' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
);

export const isWaistSizeProduct = (product) => {
  if (!product) return false;

  if (product.sizeInputType === 'waist') return true;
  if (product.slug === WAIST_SIZE_PRODUCT_SLUG) return true;

  return getProductSearchText(product).includes(WAIST_SIZE_PHRASE);
};

export const formatWaistSize = (value) => {
  const trimmed = String(value || '').trim();
  return trimmed ? `Waist ${trimmed} cm` : '';
};

export const isValidWaistSize = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return false;

  const waist = Number(trimmed);
  return Number.isFinite(waist) && waist > 10 && waist <= 150;
};

export const getProductOrderSize = (product, selectedSize, waistSize) => (
  isWaistSizeProduct(product) ? formatWaistSize(waistSize) : selectedSize
);

export const canPurchaseProduct = (product, selectedSize, selectedColor, waistSize) => {
  const hasColor = !product?.colors?.length || selectedColor;

  if (isWaistSizeProduct(product)) {
    return isValidWaistSize(waistSize) && hasColor;
  }

  return Boolean(selectedSize && hasColor);
};
