import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { Heart, ShoppingCart } from 'lucide-react';
import { resolveProductImage } from '../lib/productImage';
import { useFavoritesStore } from '../store/useFavoritesStore';

export const ProductCard = ({ product }) => {
  const location = useLocation();
  const addToCart = useCartStore((state) => state.addToCart);
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = favoriteIds.includes(product.id);
  const inCart = useCartStore((state) =>
    state.cart.find((item) => item.id === product.id)?.quantity || 0
  );
  const stockIsTracked = Number.isInteger(product.stock);
  const isOutOfStock = stockIsTracked && product.stock === 0;
  const quantityLimitReached = stockIsTracked && inCart >= product.stock;
  const productHref = `/product/${encodeURIComponent(product.id)}`;
  const productState = { from: `${location.pathname}${location.search}` };

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
      <div className="relative h-64 overflow-hidden">
        <Link to={productHref} state={productState} aria-label={`Zobacz produkt: ${product.name}`} className="block h-full">
          <img
            src={resolveProductImage(product.image)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-label={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
          aria-pressed={isFavorite}
          className={`absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-105 ${isFavorite ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500'}`}
        >
          <Heart size={19} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
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
        <Link to={productHref} state={productState} className="mb-2 text-lg font-bold text-gray-800 hover:text-rose-600">{product.name}</Link>
        <p className="text-gray-500 text-sm mb-4 flex-grow">{product.description}</p>
        <Link to={`/product/${encodeURIComponent(product.id)}`} className="mb-4 text-xs font-semibold text-rose-600 hover:underline">Szczegóły i opinie</Link>
        
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
    </article>
  );
};
