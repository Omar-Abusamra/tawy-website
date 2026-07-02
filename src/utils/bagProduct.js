export const BAG_PRODUCT_SLUG = 'bag';

export const BAG_GOLD_COLOR = 'Gold';

export const BAG_GOLD_MIN_PRODUCTS = 3;

export const BAG_ONLY_ORDER_MESSAGE = 'You must buy 1 product first.';

export const BAG_GOLD_REQUIRES_ORDER_MESSAGE = 'You must buy 3 products first.';

export const isBagProduct = (productOrItem) => (
  productOrItem?.slug === BAG_PRODUCT_SLUG
);

export const isBagGoldColor = (color) => (
  color?.toLowerCase() === BAG_GOLD_COLOR.toLowerCase()
);

export const countRegularProductQuantity = (items) => (
  items.reduce((count, item) => (
    isBagProduct(item) ? count : count + item.quantity
  ), 0)
);

export const cartHasOnlyBag = (items) => (
  items.length > 0 && items.every(isBagProduct)
);

export const cartHasRegularProduct = (items) => (
  countRegularProductQuantity(items) > 0
);

export const getBagOrderBlockReason = (items, color) => {
  const regularCount = countRegularProductQuantity(items);

  if (regularCount < 1) {
    return BAG_ONLY_ORDER_MESSAGE;
  }

  if (isBagGoldColor(color) && regularCount < BAG_GOLD_MIN_PRODUCTS) {
    return BAG_GOLD_REQUIRES_ORDER_MESSAGE;
  }

  return null;
};

export const getCartBagBlockReason = (items) => {
  const bagItem = items.find(isBagProduct);
  if (!bagItem) return null;

  return getBagOrderBlockReason(items, bagItem.color);
};
