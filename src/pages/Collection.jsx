import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import './Collection.css';
import { api, getCachedProducts } from '../services/api';

const getFilters = (collectionSlug, searchQuery) => ({
  collection: collectionSlug || 'all',
  search: searchQuery,
});

const Collection = () => {
  const { collectionSlug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search')?.trim() || '';
  const [products, setProducts] = useState(() => {
    const cached = getCachedProducts(getFilters(collectionSlug, searchQuery));
    return cached ?? [];
  });
  const [loading, setLoading] = useState(() => (
    getCachedProducts(getFilters(collectionSlug, searchQuery)) === null
  ));

  useEffect(() => {
    let isMounted = true;
    const nextFilters = getFilters(collectionSlug, searchQuery);
    const cached = getCachedProducts(nextFilters);

    if (cached) {
      setProducts(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    const fetchProducts = async () => {
      try {
        const response = await api.getProducts(nextFilters);
        if (isMounted) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        if (isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [collectionSlug, searchQuery]);

  const title = searchQuery
    ? `Search: ${searchQuery}`
    : collectionSlug
      ? collectionSlug.replace(/-/g, ' ')
      : 'The Collection';

  return (
    <main className="collection">
      <section className="section-head">
        <h2>{title}</h2>
      </section>

      {loading ? (
        <section className="collection__loading" aria-label="Loading collection" role="status">
          <div className="collection__spinner" aria-hidden="true" />
          <span className="collection__loading-text">Loading collection</span>
        </section>
      ) : (
        <section className="grid" aria-label="Product collection">
          {products.length > 0 ? products.map((product) => (
            <Link
              key={product.id}
              to={`/collection/${product.collection}/${product.slug || product.id}`}
              state={{ product }}
              className="card"
            >
              <div className="ph">
                <img src={product.image} alt={product.name} />
                {!product.inStock && <span className="sold-out">Sold Out</span>}
              </div>

              <div className="meta">
                <span className="nm">{product.name}</span>
                {product.price > 0 && <span className="pr">LE {product.price}</span>}
              </div>
            </Link>
          )) : (
            <p className="collection__status">No pieces found.</p>
          )}
        </section>
      )}
    </main>
  );
};

export default Collection;
