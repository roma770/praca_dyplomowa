import { useCallback, useEffect, useState } from 'react';
import { KeyRound, LogOut, RefreshCw, ShieldCheck, Truck } from 'lucide-react';
import {
  adminLogin,
  adminLogout,
  fetchAdminOrders,
  isOrderApiEnabled,
  updateOrderStatus,
} from '../lib/orderApi';

const statuses = [
  { value: 'new', label: 'Nowe' },
  { value: 'confirmed', label: 'Potwierdzone' },
  { value: 'preparing', label: 'W przygotowaniu' },
  { value: 'out_for_delivery', label: 'W drodze' },
  { value: 'completed', label: 'Dostarczone' },
  { value: 'cancelled', label: 'Anulowane' },
];

const formatCreatedAt = (value) =>
  new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value)
  );

const formatDeliveryDate = (value) =>
  value?.split('-').reverse().join('.') || '—';

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100';

const OrderCard = ({ order, onStatusChange, saving }) => (
  <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-bold text-gray-800">{order.id}</h2>
          <span className="text-xs text-gray-400">{formatCreatedAt(order.createdAt)}</span>
        </div>
        <p className="mt-2 font-semibold text-gray-800">{order.customer.name}</p>
        <p className="text-sm text-gray-500">
          <a className="hover:text-rose-600" href={`tel:${order.customer.phone}`}>
            {order.customer.phone}
          </a>
          {order.customer.email && (
            <>
              <span className="px-2">·</span>
              <a className="hover:text-rose-600" href={`mailto:${order.customer.email}`}>
                {order.customer.email}
              </a>
            </>
          )}
        </p>
      </div>

      <div className="flex items-center gap-3 sm:w-64">
        <label className="sr-only" htmlFor={`status-${order.id}`}>
          Status zamówienia {order.id}
        </label>
        <select
          id={`status-${order.id}`}
          value={order.status}
          disabled={saving}
          onChange={(event) => onStatusChange(order.id, event.target.value)}
          className={`${inputClass} py-2.5 disabled:opacity-60`}
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        {saving && <RefreshCw size={17} className="shrink-0 animate-spin text-rose-500" />}
      </div>
    </div>

    <div className="mt-5 grid gap-5 border-t border-gray-100 pt-5 md:grid-cols-2">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Truck size={16} className="text-rose-500" />
          Dostawa
        </h3>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          {formatDeliveryDate(order.delivery.date)}, {order.delivery.slot}
          <br />
          {order.delivery.address} ({order.delivery.zoneName})
          <br />
          Odbiorca: {order.delivery.recipientName}
        </p>
        {order.delivery.cardText && (
          <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm italic text-gray-600">
            „{order.delivery.cardText}”
          </p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700">Produkty</h3>
        <ul className="mt-2 space-y-2 text-sm text-gray-600">
          {order.items.map((item, index) => (
            <li key={`${item.id}-${index}`} className="flex justify-between gap-4">
              <span>
                {item.name} × {item.quantity}
                {item.description && (
                  <span className="block text-xs text-gray-400">{item.description}</span>
                )}
              </span>
              <span className="shrink-0">{item.price * item.quantity} zł</span>
            </li>
          ))}
          {order.event && (
            <li className="flex justify-between gap-4">
              <span>{order.event.title}</span>
              <span className="shrink-0">{order.event.price} zł</span>
            </li>
          )}
        </ul>
        <div className="mt-4 flex justify-between border-t border-gray-100 pt-3 font-bold text-gray-800">
          <span>Razem</span>
          <span className="text-rose-600">{order.totals.total} zł</span>
        </div>
      </div>
    </div>
  </article>
);

export const Admin = () => {
  const [token, setToken] = useState(() => sessionStorage.getItem('bloom-joy-admin-token'));
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingOrderId, setSavingOrderId] = useState('');
  const [error, setError] = useState('');

  const loadOrders = useCallback(async (activeToken) => {
    if (!activeToken) return;
    setLoading(true);
    setError('');
    try {
      setOrders(await fetchAdminOrders(activeToken));
    } catch (loadError) {
      if (loadError.message.includes('Sign in')) {
        sessionStorage.removeItem('bloom-joy-admin-token');
        setToken('');
      }
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) loadOrders(token);
  }, [token, loadOrders]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await adminLogin(password);
      sessionStorage.setItem('bloom-joy-admin-token', result.token);
      setToken(result.token);
      setPassword('');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (token) await adminLogout(token).catch(() => {});
    sessionStorage.removeItem('bloom-joy-admin-token');
    setToken('');
    setOrders([]);
    setError('');
  };

  const handleStatusChange = async (orderId, status) => {
    setSavingOrderId(orderId);
    setError('');
    try {
      const updatedOrder = await updateOrderStatus(token, orderId, status);
      setOrders((current) => current.map((order) => (order.id === orderId ? updatedOrder : order)));
    } catch (statusError) {
      setError(statusError.message);
    } finally {
      setSavingOrderId('');
    }
  };

  return (
    <div className="min-h-[65vh] bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-rose-500">
              <ShieldCheck size={17} />
              Strefa administracyjna
            </p>
            <h1 className="text-3xl font-bold text-gray-900">Zamówienia</h1>
            <p className="mt-2 text-gray-500">Przeglądaj zamówienia i aktualizuj ich status.</p>
          </div>

          {token && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => loadOrders(token)}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Odśwież
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                <LogOut size={16} />
                Wyloguj
              </button>
            </div>
          )}
        </div>

        {!isOrderApiEnabled ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-900">
            Panel wymaga połączenia z serwerem zamówień. W wersji opublikowanej ustaw zmienną
            <code className="mx-1 rounded bg-amber-100 px-1.5 py-0.5">VITE_API_URL</code>
            dla procesu budowania GitHub Actions i uruchom osobno serwer API.
          </div>
        ) : !token ? (
          <form onSubmit={handleLogin} className="max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <label htmlFor="admin-password" className="mb-2 block text-sm font-semibold text-gray-700">
              Hasło administratora
            </label>
            <div className="relative">
              <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`${inputClass} pl-10`}
                required
              />
            </div>
            {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password}
              className="mt-4 w-full rounded-xl bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Logowanie…' : 'Zaloguj się'}
            </button>
          </form>
        ) : (
          <>
            {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {loading && orders.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center text-gray-500">Ładowanie zamówień…</div>
            ) : orders.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
                <h2 className="text-lg font-bold text-gray-800">Nie ma jeszcze zamówień</h2>
                <p className="mt-2 text-sm text-gray-500">Nowe zamówienia pojawią się tutaj po złożeniu przez klienta.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Liczba zamówień: {orders.length}</p>
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                    saving={savingOrderId === order.id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
