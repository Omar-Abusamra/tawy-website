import { getEffectivePrice } from './pricing';

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
const CURRENCY = 'EGP';

export const isMetaPixelConfigured = () => Boolean(PIXEL_ID);

const getFbq = () => (typeof window !== 'undefined' ? window.fbq : null);

const getProductValue = (product) => getEffectivePrice(product);

const getLineItemValue = (item) => (
  Number(item?.price || 0) * Number(item?.quantity || 1)
);

const getContentId = (item) => String(item?.id ?? item?.slug ?? '');

export const buildMetaContents = (items) => (
  items.map((item) => ({
    id: getContentId(item),
    quantity: Number(item.quantity || 1),
    item_price: Number(item.price ?? getProductValue(item) ?? 0),
  }))
);

const buildCommercePayload = (items, totalValue) => {
  const contents = buildMetaContents(items);
  const value = totalValue ?? contents.reduce(
    (sum, entry) => sum + (entry.item_price * entry.quantity),
    0
  );

  return {
    content_ids: contents.map((entry) => entry.id),
    contents,
    content_type: 'product',
    value: Number(value || 0),
    currency: CURRENCY,
    num_items: contents.reduce((count, entry) => count + entry.quantity, 0),
  };
};

export const initMetaPixel = () => {
  if (!PIXEL_ID || typeof window === 'undefined' || window.fbq) return;

  /* eslint-disable */
  (function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
};

export const trackMetaPageView = () => {
  getFbq()?.('track', 'PageView');
};

export const trackMetaEvent = (eventName, params = {}, options = {}) => {
  const fbq = getFbq();
  if (!fbq) return;

  if (Object.keys(options).length > 0) {
    fbq('track', eventName, params, options);
    return;
  }

  fbq('track', eventName, params);
};

export const trackMetaViewContent = (product) => {
  if (!product) return;

  const unitPrice = getProductValue(product);

  trackMetaEvent('ViewContent', {
    content_name: product.name,
    content_category: product.collection,
    ...buildCommercePayload([{ ...product, price: unitPrice, quantity: 1 }], unitPrice),
  });
};

export const trackMetaViewCategory = ({ name, slug, products = [] }) => {
  trackMetaEvent('ViewCategory', {
    content_name: name,
    content_category: slug || name,
    content_type: 'product_group',
    content_ids: products.map(getContentId).filter(Boolean),
  });
};

export const trackMetaSearch = (searchString) => {
  if (!searchString?.trim()) return;

  trackMetaEvent('Search', {
    search_string: searchString.trim(),
    content_type: 'product',
  });
};

export const trackMetaAddToCart = (item) => {
  trackMetaEvent('AddToCart', {
    content_name: item.name,
    ...buildCommercePayload([item]),
  });
};

export const trackMetaInitiateCheckout = ({ items, total }) => {
  trackMetaEvent('InitiateCheckout', buildCommercePayload(items, total));
};

export const trackMetaPurchase = ({ orderReference, items, total }) => {
  trackMetaEvent('Purchase', {
    ...buildCommercePayload(items, total),
    order_id: orderReference,
  }, {
    eventID: orderReference,
  });
};
