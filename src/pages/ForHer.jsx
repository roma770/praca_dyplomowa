import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Sparkles } from 'lucide-react';
import { ProductCatalog } from '../components/ProductCatalog';
import { useStoreProducts } from '../hooks/useStoreProducts';

export const ForHer = () => {
  const { products, error } = useStoreProducts();
  const bouquets = products.filter((product) => product.category === 'bouquets' && product.isActive !== false);

  return (
    <div className="min-h-screen bg-rose-50/40">
      <section className="relative overflow-hidden bg-[#f4e5e3]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
          <div className="relative z-10">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-rose-600"><Heart size={16} fill="currentColor" /> Z myślą o niej</p>
            <h1 className="mt-4 max-w-xl text-4xl font-extrabold leading-tight text-gray-900 md:text-6xl">Bukiety <span className="font-serif italic font-medium text-rose-600">dla niej</span></h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-gray-600">Róże, piwonie i sezonowe kompozycje, które pomogą powiedzieć „dziękuję”, „kocham” albo po prostu „pomyślałem o Tobie”.</p>
            <Link to="/builder" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-800"><Sparkles size={17} /> Stwórz własny bukiet</Link>
          </div>
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=85" alt="Romantyczny bukiet różowych kwiatów" className="h-72 w-full rounded-[2rem] object-cover shadow-lg md:h-[420px]" />
            <span className="absolute -bottom-4 -left-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-md md:left-5">Mały gest. Wielka radość.</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        {error && <p role="status" className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</p>}
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-500">Kwiaty, które mówią</p><h2 className="mt-2 text-3xl font-bold text-gray-900">Znajdź jej bukiet</h2><p className="mt-2 text-gray-500">Wyszukuj kompozycje, filtruj według ceny i sortuj produkty.</p></div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600 hover:underline">Wszystkie prezenty <ArrowRight size={16} /></Link>
        </div>
        <ProductCatalog products={bouquets} />
      </section>
    </div>
  );
};
