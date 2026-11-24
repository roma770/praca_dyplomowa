import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from './ProductCard';

const categoryLabels = {
  bouquets: 'Bukiety kwiatowe',
  balloons: 'Balony',
  souvenirs: 'Upominki',
  mens: 'Bukiety dla niego',
};

export const ProductCatalog = ({ products }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('featured');

  useEffect(() => setQuery(searchParams.get('search') || ''), [searchParams]);

  const categories = useMemo(() => {
    const present = [...new Set(products.map((product) => product.category))];
    return present.map((value) => ({ value, label: categoryLabels[value] || value }));
  }, [products]);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pl-PL');
    const filtered = products.filter((product) => {
      const matchesQuery = !normalizedQuery || `${product.name} ${product.description} ${categoryLabels[product.category] || ''}`
        .toLocaleLowerCase('pl-PL').includes(normalizedQuery);
      const matchesCategory = category === 'all' || product.category === category;
      const matchesPrice = maxPrice === '' || product.price <= Number(maxPrice);
      const available = product.isActive !== false;
      return matchesQuery && matchesCategory && matchesPrice && available;
    });

    return filtered.sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      if (sort === 'name') return a.name.localeCompare(b.name, 'pl');
      return 0;
    });
  }, [category, maxPrice, products, query, sort]);

  const updateQuery = (event) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (query.trim()) next.set('search', query.trim());
    else next.delete('search');
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setMaxPrice('');
    setSort('featured');
    setSearchParams({}, { replace: true });
  };

  return (
    <section aria-label="Katalog produktów">
      <div className="mb-7 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
        <form onSubmit={updateQuery} className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(220px,1fr)_190px_150px_190px_auto]">
          <label className="relative block min-w-0">
            <span className="sr-only">Szukaj produktów</span>
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Szukaj kwiatów i prezentów" className="w-full min-w-0 rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
          </label>
          <label>
            <span className="sr-only">Kategoria</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-rose-400">
              <option value="all">Wszystkie kategorie</option>
              {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="relative">
            <span className="sr-only">Maksymalna cena</span>
            <input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} type="number" min="0" placeholder="Cena do (zł)" className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-rose-400" />
          </label>
          <label className="relative">
            <span className="sr-only">Sortowanie</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-rose-400">
              <option value="featured">Polecane</option>
              <option value="price-low">Cena: od najniższej</option>
              <option value="price-high">Cena: od najwyższej</option>
              <option value="name">Nazwa: A–Z</option>
            </select>
          </label>
          <div className="flex gap-2">
            <button type="submit" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600">
              <SlidersHorizontal size={16} /> Szukaj
            </button>
            <button type="button" onClick={clearFilters} aria-label="Wyczyść filtry" title="Wyczyść filtry" className="rounded-xl border border-gray-200 px-3 text-gray-500 hover:bg-gray-50">
              <X size={17} />
            </button>
          </div>
        </form>
      </div>

      <p className="mb-4 text-sm text-gray-500">Znaleziono produktów: {visibleProducts.length}</p>
      {visibleProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-14 text-center">
          <h3 className="text-lg font-bold text-gray-800">Nie znaleźliśmy produktów</h3>
          <p className="mt-2 text-sm text-gray-500">Zmień wyszukiwaną frazę lub wyczyść filtry.</p>
          <button type="button" onClick={clearFilters} className="mt-5 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100">Wyczyść filtry</button>
        </div>
      )}
    </section>
  );
};
