import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchMyOrders } from '../lib/orderApi';

const statusLabels = {
  new: 'Nowe',
  confirmed: 'Potwierdzone',
  preparing: 'W przygotowaniu',
  out_for_delivery: 'W drodze',
  completed: 'Dostarczone',
  cancelled: 'Anulowane',
};

const formatDate = (value) =>
  new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

const formatDeliveryDate = (value) => value?.split('-').reverse().join('.') || '—';

export const AccountOrderHistory = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setOrders(await fetchMyOrders(token));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <section className="mt-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-9">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Moje zamówienia</h2>
          <p className="mt-1 text-sm text-gray-500">Sprawdzaj status i szczegóły swoich zakupów.</p>
        </div>
        <button type="button" onClick={loadOrders} disabled={loading} aria-label="Odśwież historię zamówień" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50">
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading && orders.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">Ładowanie zamówień…</p>
      ) : orders.length === 0 ? (
        !error && (
          <p className="mt-5 rounded-xl bg-slate-50 px-4 py-5 text-center text-sm text-gray-500">
            Zamówienia złożone po zalogowaniu pojawią się tutaj.
          </p>
        )
      ) : (
        <div className="mt-5 space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-gray-100 p-4 md:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">{order.id}</h3>
                  <p className="mt-1 text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                <span className="w-fit rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
                  {statusLabels[order.status] || order.status}
                </span>
              </div>

              <ul className="mt-4 space-y-1.5 text-sm text-gray-600">
                {order.items.map((item, index) => (
                  <li key={`${item.id}-${index}`} className="flex justify-between gap-3">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="shrink-0">{item.price * item.quantity} zł</span>
                  </li>
                ))}
                {order.event && (
                  <li className="flex justify-between gap-3">
                    <span>{order.event.title}</span>
                    <span className="shrink-0">{order.event.price} zł</span>
                  </li>
                )}
              </ul>

              <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-500">
                  Dostawa: {formatDeliveryDate(order.delivery.date)}, {order.delivery.slot}
                </span>
                <strong className="text-gray-900">Razem: {order.totals.total} zł</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
