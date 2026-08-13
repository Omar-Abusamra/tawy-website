import { getEffectivePrice } from './pricing';

const PIXEL_IDS = (import.meta.env.VITE_META_PIXEL_ID || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

const CURRENCY = 'EGP';
const FBEVENTS_SRC = 'https://connect.facebook.net/en_US/fbevents.js';

export const isMetaPixelConfigured = () => PIXEL_IDS.length > 0;

const getFbq = () => (typeof window !== 'undefined' ? window.fbq : null);

const getProductValue = (product) => getEffectivePrice(product);

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

const ensureMetaPixelScript = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (!window.fbq) {
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
    })(window, document, 'script', FBEVENTS_SRC);
    /* eslint-enable */
  }

  const hasScript = Boolean(
    document.querySelector(`script[src*="fbevents.js"]`)
  );

  if (!hasScript) {
    const script = document.createElement('script');
    script.async = true;
    script.src = FBEVENTS_SRC;
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }
};

export const initMetaPixel = () => {
  if (!PIXEL_IDS.length || typeof window === 'undefined') return;

  ensureMetaPixelScript();

  const initialized = window.__metaPixelInitializedIds ??= new Set();
  let hasNewPixel = false;

  PIXEL_IDS.forEach((pixelId) => {
    if (initialized.has(pixelId)) return;
    window.fbq('init', pixelId);
    initialized.add(pixelId);
    hasNewPixel = true;
  });

  if (hasNewPixel) {
    window.fbq('track', 'PageView');
  }
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
