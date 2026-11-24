import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Search, ShoppingBag, Flower2, Sparkles, UserCheck, UserRound, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useFavoritesStore } from '../store/useFavoritesStore';

export const Header = () => {
  const cart = useCartStore((state) => state.cart);
  const addedEvent = useCartStore((state) => state.addedEvent);
  const user = useAuthStore((state) => state.user);
  const favoriteCount = useFavoritesStore((state) => state.favoriteIds.length);
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0) + (addedEvent ? 1 : 0);
  const submitSearch = (event) => {
    event.preventDefault();
    navigate(search.trim() ? `/?search=${encodeURIComponent(search.trim())}` : '/');
    setSearchOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 py-2">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-rose-500 font-bold text-xl">
          <Flower2 size={28} />
          <span>Bloom & Joy</span>
        </Link>

        <nav className="hidden xl:flex items-center gap-4 font-medium text-gray-600 text-sm">
          <Link to="/" className="hover:text-rose-500 transition">Kwiaty i prezenty</Link>
          <Link to="/builder" className="hover:text-rose-500 transition flex items-center gap-1 text-rose-600 font-semibold">
            <Sparkles size={16} />
            Stwórz własny bukiet
          </Link>
          <Link to="/for-her" className="hover:text-rose-500 transition">Bukiety dla niej</Link>
          <Link to="/mens" className="hover:text-amber-600 transition flex items-center gap-1 font-semibold text-gray-800">
            <UserCheck size={16} />
            Bukiety dla niego
          </Link>
          <Link to="/about" className="hover:text-rose-500 transition">O nas</Link>
          <Link to="/contact" className="hover:text-rose-500 transition">Kontakt</Link>
        </nav>

        <div className="flex items-center gap-2">
          <form onSubmit={submitSearch} className={`${searchOpen ? 'flex' : 'hidden'} absolute left-4 right-4 top-[calc(100%+8px)] rounded-xl border border-gray-100 bg-white p-2 shadow-lg sm:left-auto sm:right-24 sm:w-72 xl:static xl:flex xl:w-44 xl:shadow-none xl:border-0 xl:p-0`}>
            <label className="sr-only" htmlFor="header-search">Szukaj produktów</label>
            <input id="header-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Szukaj produktów" className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-400" />
            <button type="submit" aria-label="Szukaj" className="ml-2 rounded-lg bg-rose-500 px-3 text-white hover:bg-rose-600"><Search size={17} /></button>
          </form>
          <button type="button" onClick={() => setSearchOpen((open) => !open)} aria-label="Otwórz wyszukiwarkę" className="rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-rose-500 xl:hidden">
            <Search size={20} />
          </button>
          <Link to="/favorites" aria-label={`Ulubione${favoriteCount ? `: ${favoriteCount}` : ''}`} title="Ulubione" className="relative rounded-full p-2 text-gray-600 hover:bg-rose-50 hover:text-rose-500">
            <Heart size={21} />
            {favoriteCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{favoriteCount}</span>}
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              aria-label="Panel administratora"
              title="Panel administratora"
              className="p-2 rounded-full text-rose-600 hover:bg-rose-50 transition"
            >
              <ShieldCheck size={21} />
            </Link>
          )}
          <Link
            to="/account"
            aria-label={user ? `Konto: ${user.name}` : 'Konto'}
            title={user?.email || 'Konto'}
            className="flex items-center gap-2 rounded-full px-2.5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
          >
            <UserRound size={20} className="text-rose-500" />
            <span className="hidden sm:inline">{user ? user.name.split(' ')[0] : 'Konto'}</span>
          </Link>
          <Link to="/checkout" className="relative p-2 bg-rose-50 rounded-full text-rose-600 hover:bg-rose-100 transition">
            <ShoppingBag size={22} />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      <div className="border-t border-gray-100 bg-white px-4 py-2 xl:hidden">
        <nav className="mx-auto flex max-w-7xl items-center justify-center gap-5 overflow-x-auto whitespace-nowrap text-xs font-semibold text-gray-600">
          <Link to="/" className="hover:text-rose-500">Kwiaty i prezenty</Link>
          <Link to="/builder" className="hover:text-rose-500">Stwórz bukiet</Link>
          <Link to="/for-her" className="hover:text-rose-500">Dla niej</Link>
          <Link to="/mens" className="hover:text-rose-500">Dla niego</Link>
          <Link to="/about" className="hover:text-rose-500">O nas</Link>
          <Link to="/contact" className="hover:text-rose-500">Kontakt</Link>
        </nav>
      </div>
    </header>
  );
};
