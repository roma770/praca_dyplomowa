import React from 'react';
import { ProductCard } from '../components/ProductCard';
import productsData from '../data/products.json';

export const MensSection = () => {
  // Фильтруем только мужские букеты
  const mensProducts = productsData.filter(p => p.category === 'mens');

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Брутальный баннер */}
      <div className="bg-slate-900 py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 uppercase tracking-wide">
            Bukiety <span className="text-amber-500">dla niego</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Szukasz prezentu z charakterem? Wybierz zestaw z dobrymi przekąskami i dodatkami, który sprawdzi się na urodziny, rocznicę lub bez okazji.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {mensProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
