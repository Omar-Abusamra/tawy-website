import productsData from './products';
import { isSupabaseConfigured, supabaseRequest } from './supabaseRest';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const uniqueBySlug = (items, key) => (
  Array.from(new Map(items.map((item) => [item[key], item])).values())
);

const titleFromSlug = (slug) => (
  slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
);

const mapProductRow = (row) => ({
  id: row.id,
  name: row.name,
  brand: row.brand || 'TAWY',
  price: Number(row.price || 0),
  image: row.image_url,
  collection: row.collection,
  category: row.category,
  sizes: row.sizes || [],
  colors: row.colors || [],
  colorImages: row.color_images || {},
  colorMedia: row.color_media || {},
  inStock: row.in_stock,
  description: row.description || '',
  sizeFit: row.size_fit || '',
  shipping: row.shipping || '',
  bestSeller: row.best_seller,
  slug: row.slug,
  sort_order: row.sort_order,
});

const applyProductFilters = (items, filters = {}) => {
  let products = [...items];

  if (filters.collection && filters.collection !== 'all') {
    products = products.filter(product => product.collection === filters.collection);
  }

  if (filters.category && filters.category !== 'all') {
    products = products.filter(product => product.category === filters.category);
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    products = products.filter(product => (
      product.name?.toLowerCase().includes(searchTerm) ||
      product.brand?.toLowerCase().includes(searchTerm) ||
      product.category?.toLowerCase().includes(searchTerm) ||
      product.collection?.toLowerCase().includes(searchTerm)
    ));
  }

  if (filters.sort) {
    switch (filters.sort) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
  } else {
    products.sort((a, b) => {
      const orderA = a.sort_order ?? a.id ?? 0;
      const orderB = b.sort_order ?? b.id ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return (a.name || '').localeCompare(b.name || '');
    });
  }

  return products;
};

export const filterProducts = applyProductFilters;

const normalizeSeedProduct = (product) => ({
  ...product,
  sort_order: product.sort_order ?? (product.id * 10),
});

const getSeedProducts = () => productsData.map(normalizeSeedProduct);

let allProductsCache = null;
let allProductsPromise = null;

const loadAllProducts = async () => {
  if (allProductsCache) {
    return allProductsCache;
  }

  if (allProductsPromise) {
    return allProductsPromise;
  }

  allProductsPromise = (async () => {
    try {
      if (isSupabaseConfigured) {
        const rows = await supabaseRequest('products', {
          query: {
            select: '*',
            status: 'eq.active',
            order: 'sort_order.asc,name.asc',
          },
        });
        allProductsCache = rows.map(mapProductRow);
      } else {
        allProductsCache = getSeedProducts();
      }

      return allProductsCache;
    } catch (error) {
      allProductsPromise = null;
      throw error;
    } finally {
      allProductsPromise = null;
    }
  })();

  return allProductsPromise;
};

const getFallbackProducts = (filters = {}) => applyProductFilters(getSeedProducts(), filters);

const getSupabaseProducts = async (filters = {}) => {
  const products = await loadAllProducts();
  return applyProductFilters(products, filters);
};

export const findProductBySlug = (items, productSlug, collectionSlug) => (
  items.find((item) => (
    (item.slug === productSlug || String(item.id) === String(productSlug)) &&
    (!collectionSlug || collectionSlug === 'all' || item.collection === collectionSlug)
  )) || null
);

export const sameProductList = (left, right) => (
  left.length === right.length &&
  left.every((item, index) => (
    item.id === right[index]?.id &&
    item.slug === right[index]?.slug
  ))
);

export const getLocalProducts = () => getSeedProducts();

export const api = {
  async getProducts(filters = {}) {
    let products;

    try {
      products = isSupabaseConfigured
        ? await getSupabaseProducts(filters)
        : await getFallbackProducts(filters);
    } catch (error) {
      console.warn('Using local product fallback:', error);
      products = await getFallbackProducts(filters);
    }
    
    return {
      data: products,
      meta: {
        pagination: {
          page: 1,
          pageSize: products.length,
          pageCount: 1,
          total: products.length
        }
      }
    };
  },

  async getCollections() {
    await wait(120);
    
    return {
      data: uniqueBySlug(productsData, 'collection').map((product, index) => ({
        id: index + 1,
        name: titleFromSlug(product.collection),
        slug: product.collection,
      }))
    };
  },

  async getCategories() {
    await wait(120);
    
    return {
      data: uniqueBySlug(productsData, 'category').map((product, index) => ({
        id: index + 1,
        name: titleFromSlug(product.category),
        slug: product.category,
      }))
    };
  },

  async getProduct(slug, collectionSlug) {
    const all = await loadAllProducts();
    return findProductBySlug(all, slug, collectionSlug);
  },

  async getProductBySlug(productSlug, collectionSlug) {
    return this.getProduct(productSlug, collectionSlug);
  },

  async getCollection(slug) {
    await wait(120);

    const collection = productsData.find(product => product.collection === slug);
    return collection ? {
      id: collection.collection,
      name: titleFromSlug(collection.collection),
      slug: collection.collection,
    } : null;
  }
};

export default api; 