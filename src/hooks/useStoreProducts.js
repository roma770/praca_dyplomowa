import { useEffect, useState } from 'react';
import productsData from '../data/products.json';
import { fetchProducts, isOrderApiEnabled } from '../lib/orderApi';

export const useStoreProducts = () => {
  const [products, setProducts] = useState(productsData);
  const [loading, setLoading] = useState(isOrderApiEnabled);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOrderApiEnabled) return undefined;

    let isCurrent = true;
    fetchProducts()
      .then((currentProducts) => {
        if (isCurrent) setProducts(currentProducts);
      })
      .catch(() => {
        if (isCurrent) setError('Nie udało się pobrać aktualnego katalogu. Pokazano zapisane produkty.');
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return { products, loading, error };
};
