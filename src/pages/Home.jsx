import React from 'react';
import { ProductCard } from '../components/ProductCard';
import productsData from '../data/products.json';

export const Home = () => {
  // Исключаем мужские букеты для главной страницы
  const standardProducts = productsData.filter(p => p.category !== 'mens');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
       

      {/* Промо-баннер */}
      <div className="bg-rose-50 rounded-3xl p-8 md:p-12 mb-12 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 mb-6 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Даруйте емоції, <br/>
            <span className="text-rose-500">а не просто квіти</span>
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Свіжі букети, гелієві кульки та подарунки з цілодобовою доставкою по місту.
          </p>
        </div>
        <div className="md:w-5/12">
          <img 
            src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80" 
            alt="Букет квітів" 
            className="rounded-2xl shadow-lg object-cover h-64 w-full"
          />
        </div>
      </div>

      {/* Каталог */}
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Популярні товари</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {standardProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};