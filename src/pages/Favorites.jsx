import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useStoreProducts } from '../hooks/useStoreProducts';
import { useFavoritesStore } from '../store/useFavoritesStore';

export const Favorites = () => {
  const { products, error } = useStoreProducts();
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const favorites = products.filter((product) => favoriteIds.includes(product.id) && product.isActive !== false);

  return (
    <div className="mx-auto min-h-[60vh] max-w-7xl px-4 py-10 md:py-14">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-500">Zapisane na później</p>
      <h1 className="mt-2 flex items-center gap-3 text-3xl font-extrabold text-gray-900"><Heart className="text-rose-500" /> Ulubione</h1>
      {error && <p role="status" className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</p>}
      {favorites.length ? <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{favorites.map((product) => <ProductCard key={product.id} product={product} />)}</div> : (
        <div className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-white px-5 py-14 text-center">
          <Heart size={38} className="mx-auto text-rose-300" />
          <h2 className="mt-4 text-xl font-bold text-gray-800">Nie masz jeszcze ulubionych produktów</h2>
          <p className="mt-2 text-sm text-gray-500">Kliknij serce przy produkcie, żeby dodać go do tej listy.</p>
          <Link to="/" className="mt-5 inline-block rounded-xl bg-rose-500 px-5 py-3 font-semibold text-white hover:bg-rose-600">Przeglądaj produkty</Link>
        </div>
      )}
    </div>
  );
};
