export const formatPrice = (amount) => {
  const value = Number(amount || 0);
  return Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const getPriceDisplay = (item) => {
  const original = Number(item?.price || 0);
  const sale = item?.salePrice != null ? Number(item.salePrice) : null;
  const onSale = sale != null && sale > 0 && sale < original;

  return {
    original,
    current: onSale ? sale : original,
    onSale,
    isFree: original === 0,
  };
};

export const getEffectivePrice = (product) => getPriceDisplay(product).current;

export const getCartItemPriceDisplay = (item) => {
  const current = Number(item?.price || 0);
  const original = item?.originalPrice != null ? Number(item.originalPrice) : current;
  const onSale = item?.originalPrice != null && original > current;

  return {
    original,
    current,
    onSale,
    isFree: current === 0,
  };
};
