import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, RotateCcw, ShoppingBag, CheckCircle2 } from 'lucide-react';
import data from '../data/builderData.json';
import { useBuilderStore } from '../store/useBuilderStore';
import { useCartStore } from '../store/useCartStore';
import { calcBouquet, bouquetToCartItem } from '../lib/bouquet';

// 3D грузится отдельным куском, чтобы не тормозить остальной сайт
const BouquetScene = lazy(() => import('../components/BouquetScene'));

export const Builder = () => {
  const { selectedWrapper, selectedFlowers, setWrapper, addFlower, removeFlower, resetBuilder } =
    useBuilderStore();
  const addToCart = useCartStore((s) => s.addToCart);
  const [justAdded, setJustAdded] = useState(false);

  const { count, total, lines } = calcBouquet(selectedWrapper, selectedFlowers);
  const isFull = count >= data.maxFlowers;
  const canAdd = Boolean(selectedWrapper) && count > 0;

  const handleAdd = () => {
    addToCart(bouquetToCartItem(selectedWrapper, selectedFlowers));
    resetBuilder();
    setJustAdded(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-1">Stwórz bukiet po swojemu</h1>
      <p className="text-gray-500 mb-8">
        Wybierz oprawę i kwiaty. Gotowy bukiet możesz obejrzeć z każdej strony i dopasować do okazji.
      </p>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* 3D-сцена (на телефоне прилипает к верху, чтобы букет был виден при выборе) */}
        <div className="h-[300px] sm:h-[420px] lg:h-[620px] sticky top-16 lg:top-24 z-10 rounded-3xl overflow-hidden bg-gradient-to-b from-rose-50 to-rose-100 border border-rose-100">
          <Suspense
            fallback={
              <div className="h-full flex items-center justify-center text-rose-400">Przygotowujemy podgląd bukietu…</div>
            }
          >
            <BouquetScene wrapper={selectedWrapper} selectedFlowers={selectedFlowers} />
          </Suspense>
          {count === 0 && (
            <div className="absolute inset-x-0 bottom-6 text-center text-sm text-rose-400 pointer-events-none">
              Dodaj kwiaty, aby zobaczyć swój bukiet
            </div>
          )}
        </div>

        {/* Панель керування */}
        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">1. Wybierz oprawę</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {data.wrappers.map((w) => {
                const active = selectedWrapper?.id === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWrapper(w)}
                    aria-pressed={active}
                    className={`text-left rounded-xl border-2 p-3 transition ${
                      active ? 'border-rose-500 bg-rose-50' : 'border-gray-100 hover:border-rose-200'
                    }`}
                  >
                    <span
                      className="block w-6 h-6 rounded-full mb-2 border border-black/10"
                      style={{ backgroundColor: w.color }}
                    />
                    <span className="block text-sm font-semibold text-gray-800">{w.name}</span>
                    <span className="block text-xs text-gray-500">+{w.price} zł</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">2. Wybierz kwiaty</h2>
              <span className="text-sm text-gray-500">
                {count} z {data.maxFlowers}
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {data.flowers.map((f) => {
                const qty = selectedFlowers[f.id] || 0;
                return (
                  <div key={f.id} className="flex items-center gap-4 py-3">
                    <span className="text-3xl w-10 text-center">{f.image}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{f.name}</div>
                      <div className="text-sm text-gray-500">{f.price} zł / szt.</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => removeFlower(f.id)}
                        disabled={qty === 0}
                        aria-label={`Usuń jedną: ${f.name}`}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-40"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center font-semibold">{qty}</span>
                      <button
                        type="button"
                        onClick={() => addFlower(f.id)}
                        disabled={isFull}
                        aria-label={`Dodaj jedną: ${f.name}`}
                        className="w-8 h-8 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {isFull && (
              <p className="text-xs text-amber-600 mt-3">
                W jednym bukiecie możesz umieścić maksymalnie {data.maxFlowers} kwiatów.
              </p>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Twój bukiet</h2>
            {lines.length === 0 && !selectedWrapper ? (
              <p className="text-sm text-gray-400">Kompozycja czeka na pierwsze kwiaty.</p>
            ) : (
              <ul className="text-sm text-gray-600 space-y-1 mb-3">
                {selectedWrapper && (
                  <li className="flex justify-between">
                    <span>{selectedWrapper.name}</span>
                    <span>{selectedWrapper.price} zł</span>
                  </li>
                )}
                {lines.map((l) => (
                  <li key={l.id} className="flex justify-between">
                    <span>
                      {l.name} × {l.count}
                    </span>
                    <span>{l.sum} zł</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-between text-xl font-bold border-t border-gray-100 pt-4">
              <span>Wartość bukietu</span>
              <span className="text-rose-600">{total} zł</span>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={handleAdd}
                disabled={!canAdd}
                className="flex-1 flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl transition disabled:bg-gray-200 disabled:text-gray-400"
              >
                <ShoppingBag size={18} />
                Dodaj bukiet do koszyka
              </button>
              <button
                type="button"
                onClick={resetBuilder}
                aria-label="Zacznij kompozycję od nowa"
                className="px-4 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                <RotateCcw size={18} />
              </button>
            </div>

            {!canAdd && (
              <p className="text-xs text-gray-400 mt-3">
                {!selectedWrapper ? 'Wybierz oprawę. ' : ''}
                {count === 0 ? 'Dodaj przynajmniej jeden kwiat.' : ''}
              </p>
            )}

            {justAdded && count === 0 && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-green-50 text-green-700 text-sm px-4 py-3">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  Bukiet jest już w koszyku
                </span>
                <Link to="/checkout" className="font-semibold underline">
                  Przejdź do zamówienia
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
