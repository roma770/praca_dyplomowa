import React from 'react';
import { ProductCatalog } from '../components/ProductCatalog';
import { useStoreProducts } from '../hooks/useStoreProducts';

export const Home = () => {
  const { products, error } = useStoreProducts();
  const standardProducts = products.filter((product) => product.category !== 'mens' && product.isActive !== false);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
       

      {/* Промо-баннер */}
      <div className="bg-rose-50 rounded-3xl p-8 md:p-12 mb-12 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 mb-6 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Małe gesty, <br/>
            <span className="text-rose-500">wielkie emocje</span>
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Bukiety na co dzień i od święta, kwiaty na zamówienie oraz upominki, które mówią więcej niż słowa.
          </p>
        </div>
        <div className="md:w-5/12">
          <img 
            src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80" 
            alt="Kolorowy bukiet świeżych kwiatów" 
            className="rounded-2xl shadow-lg object-cover h-64 w-full"
          />
        </div>
      </div>

      {/* Каталог */}
      <h2 className="mb-2 text-3xl font-bold text-gray-800">Wybierz coś pięknego</h2>
      <p className="mb-8 text-gray-500">Przeglądaj bukiety i prezenty albo znajdź coś w sam raz dla siebie.</p>

      {error && <p role="status" className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</p>}
      <ProductCatalog products={standardProducts} />
    </div>
  );
};
