import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flower2, Heart, Menu, Search, ShieldCheck, ShoppingBag, Sparkles, UserRound, X } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useFavoritesStore } from '../store/useFavoritesStore';

export const Header = () => {
  const cart = useCartStore((state) => state.cart);
  const addedEvent = useCartStore((state) => state.addedEvent);
  const user = useAuthStore((state) => state.user);
  const favoriteCount = useFavoritesStore((state) => state.favoriteIds.length);
  const navigate = useNavigate();
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [search, setSearch] = useState('');

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0) + (addedEvent ? 1 : 0);
  const submitSearch = (event) => {
    event.preventDefault();
    navigate(search.trim() ? `/?search=${encodeURIComponent(search.trim())}` : '/');
    setMobilePanelOpen(false);
  };
  const closeMenu = () => setMobilePanelOpen(false);
  const simpleLink = 'whitespace-nowrap text-sm font-medium text-gray-600 transition hover:text-rose-600';

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-4">
        <Link to="/" onClick={closeMenu} className="flex min-w-0 shrink items-center gap-1.5 text-rose-500 sm:gap-2">
          <Flower2 size={25} className="shrink-0 sm:h-7 sm:w-7" />
          <span className="whitespace-nowrap text-base font-bold sm:text-xl">Bloom & Joy</span>
        </Link>

        <nav className="hidden items-center gap-4 xl:flex">
          <Link to="/" className={simpleLink}>Kwiaty i prezenty</Link>
          <Link to="/builder" className="flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-rose-600 transition hover:text-rose-700">
            <Sparkles size={16} /> Stwórz własny bukiet
          </Link>
          <Link to="/for-her" className={simpleLink}>Bukiety dla niej</Link>
          <Link to="/mens" className={simpleLink}>Bukiety dla niego</Link>
          <Link to="/about" className={simpleLink}>O nas</Link>
          <Link to="/contact" className={simpleLink}>Kontakt</Link>
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <form onSubmit={submitSearch} className="hidden items-center xl:flex">
            <label className="sr-only" htmlFor="header-search">Szukaj produktów</label>
            <input id="header-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Szukaj produktów" className="w-36 min-w-0 rounded-l-xl border border-r-0 border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-400 2xl:w-40" />
            <button type="submit" aria-label="Szukaj" className="rounded-r-xl bg-rose-500 px-3 py-[9px] text-white transition hover:bg-rose-600"><Search size={17} /></button>
          </form>

          <button type="button" onClick={() => setMobilePanelOpen((open) => !open)} aria-label="Otwórz wyszukiwanie i menu" aria-expanded={mobilePanelOpen} className="mobile-search-toggle rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-rose-500 xl:hidden">
            <Search size={20} />
          </button>
          <Link to="/favorites" aria-label={`Ulubione${favoriteCount ? `: ${favoriteCount}` : ''}`} title="Ulubione" className="relative rounded-full p-2 text-gray-600 transition hover:bg-rose-50 hover:text-rose-500">
            <Heart size={20} />
            {favoriteCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{favoriteCount}</span>}
          </Link>
          {user?.role === 'admin' && <Link to="/admin" aria-label="Panel administratora" title="Panel administratora" className="hidden rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-rose-500 xl:flex"><ShieldCheck size={20} /></Link>}
          <Link to="/account" aria-label={user ? `Konto: ${user.name}` : 'Konto'} title={user?.email || 'Konto'} className="hidden items-center gap-2 rounded-full px-2.5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 xl:flex">
            <UserRound size={20} className="text-rose-500" />
            <span>{user ? user.name.split(' ')[0] : 'Konto'}</span>
          </Link>
          <Link to="/checkout" aria-label="Koszyk" className="relative rounded-full bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100">
            <ShoppingBag size={21} />
            {totalCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-bold text-white">{totalCount}</span>}
          </Link>
          <button type="button" onClick={() => setMobilePanelOpen((open) => !open)} aria-label={mobilePanelOpen ? 'Zamknij menu' : 'Otwórz menu'} aria-expanded={mobilePanelOpen} className="rounded-full p-2 text-gray-700 transition hover:bg-gray-100 xl:hidden">
            {mobilePanelOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {mobilePanelOpen && <div className="border-t border-gray-100 bg-white px-3 py-4 shadow-lg sm:px-4 xl:hidden">
        <form onSubmit={submitSearch} className="mx-auto mb-4 flex max-w-7xl gap-2">
          <label className="sr-only" htmlFor="mobile-header-search">Szukaj produktów</label>
          <input id="mobile-header-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Szukaj kwiatów i prezentów" className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400" />
          <button type="submit" aria-label="Szukaj" className="flex shrink-0 items-center justify-center rounded-xl bg-rose-500 px-4 text-white hover:bg-rose-600"><Search size={18} /></button>
        </form>
        <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-1 sm:grid-cols-3">
          <Link onClick={closeMenu} to="/" className="rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-rose-50">Kwiaty i prezenty</Link>
          <Link onClick={closeMenu} to="/builder" className="rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-rose-50">Stwórz własny bukiet</Link>
          <Link onClick={closeMenu} to="/for-her" className="rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-rose-50">Bukiety dla niej</Link>
          <Link onClick={closeMenu} to="/mens" className="rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-rose-50">Bukiety dla niego</Link>
          <Link onClick={closeMenu} to="/about" className="rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-rose-50">O nas</Link>
          <Link onClick={closeMenu} to="/contact" className="rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-rose-50">Kontakt</Link>
          <Link onClick={closeMenu} to="/account" className="rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-rose-50">{user ? `Konto: ${user.name.split(' ')[0]}` : 'Konto klienta'}</Link>
          {user?.role === 'admin' && <Link onClick={closeMenu} to="/admin" className="rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-rose-50">Panel administratora</Link>}
        </nav>
      </div>}
    </header>
  );
};
