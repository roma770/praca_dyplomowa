import React from 'react';
import { ProductCatalog } from '../components/ProductCatalog';
import { useStoreProducts } from '../hooks/useStoreProducts';

export const MensSection = () => {
  const { products, error } = useStoreProducts();
  const mensProducts = products.filter((product) => product.category === 'mens');

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Брутальный баннер */}
      <div className="bg-slate-900 py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 uppercase tracking-wide">
            Bukiety <span className="text-amber-500">dla niego</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Szukasz prezentu z charakterem? Wybierz jadalny bukiet z wędlinami, serami i wyrazistymi dodatkami — na urodziny, rocznicę albo bez okazji.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {error && <p role="status" className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</p>}
        <ProductCatalog products={mensProducts} />
      </div>
    </div>
  );
};
