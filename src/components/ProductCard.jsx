import React from 'react';
import { useCartStore } from '../store/useCartStore';
import { ShoppingCart } from 'lucide-react';
import { resolveProductImage } from '../lib/productImage';

export const ProductCard = ({ product }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const inCart = useCartStore((state) =>
    state.cart.find((item) => item.id === product.id)?.quantity || 0
  );
  const stockIsTracked = Number.isInteger(product.stock);
  const isOutOfStock = stockIsTracked && product.stock === 0;
  const quantityLimitReached = stockIsTracked && inCart >= product.stock;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={resolveProductImage(product.image)}
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-rose-600 shadow-sm">
          {product.price} zł
        </div>
        {isOutOfStock && (
          <div className="absolute bottom-3 left-3 rounded-full bg-gray-900/85 px-3 py-1.5 text-xs font-semibold text-white">
            Brak w magazynie
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-4 flex-grow">{product.description}</p>
        
        <button 
          type="button"
          disabled={isOutOfStock || quantityLimitReached}
          onClick={() => addToCart(product)}
          className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white font-semibold py-2.5 rounded-xl transition-colors disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-gray-100"
        >
          <ShoppingCart size={18} />
          {isOutOfStock ? 'Brak w magazynie' : quantityLimitReached ? 'Dodano cały zapas' : 'Dodaj do koszyka'}
        </button>
      </div>
    </div>
  );
};
