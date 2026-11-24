import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Inbox, LogOut, RefreshCw, Search, ShieldCheck, Truck } from 'lucide-react';
import { AdminProducts } from '../components/AdminProducts';
import { AdminDashboard } from '../components/AdminDashboard';
import {
  fetchAdminMessages,
  fetchAdminOrders,
  fetchAdminProducts,
  markAdminMessageRead,
  isOrderApiEnabled,
  updateOrderStatus,
} from '../lib/orderApi';
import { useAuthStore } from '../store/useAuthStore';

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
        {order.delivery.cardDesignName && order.delivery.cardDesign !== 'none' && <p className="mt-2 text-xs text-gray-400">Bilecik: {order.delivery.cardDesignName}</p>}
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
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const clearSession = useAuthStore((state) => state.clearSession);
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingOrderId, setSavingOrderId] = useState('');
  const [savingMessageId, setSavingMessageId] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');

  const periodOrders = useMemo(() => {
    if (periodFilter === 'all') return orders;
    const now = new Date();
    const start = new Date(now);
    if (periodFilter === 'today') {
      start.setHours(0, 0, 0, 0);
    } else {
      start.setDate(start.getDate() - Number(periodFilter));
    }
    return orders.filter((order) => new Date(order.createdAt) >= start);
  }, [orders, periodFilter]);

  const visibleOrders = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('pl-PL');
    return periodOrders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesSearch = !normalizedQuery || [
        order.id,
        order.customer.name,
        order.customer.phone,
        order.customer.email,
      ].some((value) => value?.toLocaleLowerCase('pl-PL').includes(normalizedQuery));
      return matchesStatus && matchesSearch;
    });
  }, [periodOrders, searchQuery, statusFilter]);

  const orderSummary = useMemo(() => ({
    total: periodOrders.length,
    new: periodOrders.filter((order) => order.status === 'new').length,
    inProgress: periodOrders.filter((order) =>
      ['confirmed', 'preparing', 'out_for_delivery'].includes(order.status)
    ).length,
    completedTotal: periodOrders
      .filter((order) => order.status === 'completed')
      .reduce((sum, order) => sum + order.totals.total, 0),
  }), [periodOrders]);

  const loadOrders = useCallback(async (activeToken) => {
    if (!activeToken) return;
    setLoading(true);
    setError('');
    try {
      const [nextOrders, nextProducts, nextMessages] = await Promise.all([
        fetchAdminOrders(activeToken),
        fetchAdminProducts(activeToken),
        fetchAdminMessages(activeToken),
      ]);
      setOrders(nextOrders);
      setProducts(nextProducts);
      setMessages(nextMessages);
    } catch (loadError) {
      if (loadError.message.includes('Sign in')) {
        clearSession();
      }
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    if (token) loadOrders(token);
  }, [token, loadOrders]);

  const handleLogout = async () => {
    await logout();
    navigate('/account', { replace: true });
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

  const handleMarkMessageRead = async (messageId) => {
    setSavingMessageId(messageId);
    setError('');
    try {
      await markAdminMessageRead(token, messageId);
      setMessages((current) => current.map((message) => message.id === messageId ? { ...message, isRead: true } : message));
    } catch (messageError) {
      setError(messageError.message);
    } finally {
      setSavingMessageId('');
    }
  };

  if (!isOrderApiEnabled) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-900">
          Panel wymaga połączenia z serwerem kont i zamówień. Skonfiguruj adres API dla opublikowanej strony.
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return <Navigate to="/account" replace state={{ from: location }} />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <ShieldCheck size={44} className="mx-auto text-rose-400" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Brak dostępu do panelu</h1>
        <p className="mt-2 text-gray-500">To konto nie ma uprawnień administratora.</p>
        <Link to="/" className="mt-5 inline-block text-rose-600 underline">Wróć do sklepu</Link>
      </div>
    );
  }

  return (
    <div className="min-h-[65vh] bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-rose-500">
              <ShieldCheck size={17} />
              Strefa administracyjna
            </p>
            <h1 className="text-3xl font-bold text-gray-900">Panel administratora</h1>
            <p className="mt-2 text-gray-500">Zalogowano jako {user.email}. Zarządzaj katalogiem i zamówieniami.</p>
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

        <div className="mb-6 flex gap-2 overflow-x-auto border-b border-gray-200">
          <button type="button" onClick={() => setActiveTab('overview')} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${activeTab === 'overview' ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            Podsumowanie
          </button>
          <button type="button" onClick={() => setActiveTab('orders')} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${activeTab === 'orders' ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            Zamówienia
          </button>
          <button type="button" onClick={() => setActiveTab('products')} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${activeTab === 'products' ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            Produkty
          </button>
          <button type="button" onClick={() => setActiveTab('messages')} className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${activeTab === 'messages' ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            Kontakt{messages.filter((message) => !message.isRead).length > 0 && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700">{messages.filter((message) => !message.isRead).length}</span>}
          </button>
        </div>

        {activeTab === 'products' ? (
          <AdminProducts token={token} />
        ) : activeTab === 'overview' ? (
          <>
            {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {loading && orders.length === 0 && products.length === 0 ? <div className="rounded-2xl bg-white p-8 text-center text-gray-500">Ładowanie podsumowania…</div> : <AdminDashboard orders={orders} products={products} />}
          </>
        ) : activeTab === 'messages' ? (
          <section className="space-y-4">
            {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {messages.length === 0 ? <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center"><Inbox size={36} className="mx-auto text-gray-300" /><h2 className="mt-3 font-bold text-gray-800">Brak wiadomości</h2><p className="mt-1 text-sm text-gray-500">Wiadomości z formularza kontaktowego pojawią się tutaj.</p></div> : messages.map((message) => (
              <article key={message.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${message.isRead ? 'border-gray-100' : 'border-rose-200'}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-gray-900">{message.subject}</h2>{!message.isRead && <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">Nowa</span>}</div><p className="mt-1 text-sm text-gray-500">{message.name} · <a href={`mailto:${message.email}`} className="text-rose-600 hover:underline">{message.email}</a></p></div><time className="text-xs text-gray-400">{formatCreatedAt(message.createdAt)}</time></div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">{message.message}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`} className="inline-flex rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Odpowiedz e-mailem</a>
                  {!message.isRead && <button type="button" onClick={() => handleMarkMessageRead(message.id)} disabled={savingMessageId === message.id} className="inline-flex rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50">{savingMessageId === message.id ? 'Zapisywanie…' : 'Oznacz jako przeczytaną'}</button>}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <>
            {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Zamówienia w okresie', value: orderSummary.total },
                { label: 'Nowe', value: orderSummary.new },
                { label: 'W realizacji', value: orderSummary.inProgress },
                { label: 'Dostarczone (suma)', value: `${orderSummary.completedTotal} zł` },
              ].map((card) => (
                <article key={card.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
                </article>
              ))}
            </section>

            <section className="mb-5 grid gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-[minmax(220px,1fr)_190px_190px]">
              <label className="relative block">
                <span className="sr-only">Szukaj po numerze zamówienia, kliencie lub telefonie</span>
                <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Szukaj zamówienia lub klienta"
                  className={`${inputClass} pl-10`}
                />
              </label>
              <label>
                <span className="sr-only">Okres zamówień</span>
                <select value={periodFilter} onChange={(event) => setPeriodFilter(event.target.value)} className={inputClass}>
                  <option value="all">Cały okres</option>
                  <option value="today">Dzisiaj</option>
                  <option value="7">Ostatnie 7 dni</option>
                  <option value="30">Ostatnie 30 dni</option>
                </select>
              </label>
              <label>
                <span className="sr-only">Filtr statusu</span>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass}>
                  <option value="all">Wszystkie statusy</option>
                  {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                </select>
              </label>
            </section>

            {loading && orders.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center text-gray-500">Ładowanie zamówień…</div>
            ) : orders.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
                <h2 className="text-lg font-bold text-gray-800">Nie ma jeszcze zamówień</h2>
                <p className="mt-2 text-sm text-gray-500">Nowe zamówienia pojawią się tutaj po złożeniu przez klienta.</p>
              </div>
            ) : visibleOrders.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
                <h2 className="text-lg font-bold text-gray-800">Nie znaleziono zamówień</h2>
                <p className="mt-2 text-sm text-gray-500">Zmień wyszukiwaną frazę, okres lub status.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Wyświetlone zamówienia: {visibleOrders.length} z {periodOrders.length}</p>
                {visibleOrders.map((order) => (
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
