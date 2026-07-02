import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import './Collection.css';
import { api, filterProducts, getLocalProducts, sameProductList } from '../services/api';

const getFilteredSeedProducts = (collectionSlug, searchQuery) => (
  filterProducts(getLocalProducts(), {
    collection: collectionSlug || 'all',
    search: searchQuery,
  })
);

const Collection = () => {
  const { collectionSlug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search')?.trim() || '';
  const [products, setProducts] = useState(() => getFilteredSeedProducts(collectionSlug, searchQuery));

  useEffect(() => {
    let isMounted = true;
    setProducts(getFilteredSeedProducts(collectionSlug, searchQuery));

    const fetchProducts = async () => {
      try {
        const response = await api.getProducts({
          collection: collectionSlug || 'all',
          search: searchQuery,
        });
        if (isMounted) {
          setProducts((current) => (
            sameProductList(current, response.data) ? current : response.data
          ));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
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
    </main>
  );
};

export default Collection;
