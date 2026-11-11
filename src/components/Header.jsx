import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Flower2, Sparkles, UserCheck } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export const Header = () => {
  const cart = useCartStore((state) => state.cart);
  const addedEvent = useCartStore((state) => state.addedEvent);
  
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0) + (addedEvent ? 1 : 0);

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-rose-500 font-bold text-xl">
          <Flower2 size={28} />
          <span>Bloom & Joy</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 font-medium text-gray-600 text-sm">
          <Link to="/" className="hover:text-rose-500 transition">Kwiaty i prezenty</Link>
          <Link to="/builder" className="hover:text-rose-500 transition flex items-center gap-1 text-rose-600 font-semibold">
            <Sparkles size={16} />
            Stwórz własny bukiet
          </Link>
          <Link to="/mens" className="hover:text-amber-600 transition flex items-center gap-1 font-semibold text-gray-800">
            <UserCheck size={16} />
            Bukiety dla niego
          </Link>
        </nav>

        <Link to="/checkout" className="relative p-2 bg-rose-50 rounded-full text-rose-600 hover:bg-rose-100 transition">
          <ShoppingBag size={22} />
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {totalCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};
