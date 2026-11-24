import { AlertTriangle, ArrowDownRight, ArrowUpRight, Package, ShoppingBag, Trophy, Wallet } from 'lucide-react';

const cardClass = 'rounded-2xl border border-gray-100 bg-white p-5 shadow-sm';
const money = (amount) => `${Math.round(amount || 0).toLocaleString('pl-PL')} zł`;

export const AdminDashboard = ({ orders, products }) => {
  const activeOrders = orders.filter((order) => order.status !== 'cancelled');
  const deliveredOrders = orders.filter((order) => order.status === 'completed');
  const recentOrders = activeOrders.filter((order) => Date.now() - new Date(order.createdAt).getTime() <= 30 * 86400000);
  const recentSales = recentOrders.reduce((sum, order) => sum + (order.totals?.total || 0), 0);
  const averageOrder = activeOrders.length ? activeOrders.reduce((sum, order) => sum + (order.totals?.total || 0), 0) / activeOrders.length : 0;
  const lowStock = products.filter((product) => product.isActive && Number.isInteger(product.stock) && product.stock <= 5)
    .sort((a, b) => a.stock - b.stock);

  const popularity = new Map();
  for (const order of activeOrders) {
    for (const item of order.items || []) {
      const current = popularity.get(item.id) || { id: item.id, name: item.name, quantity: 0, revenue: 0 };
      current.quantity += item.quantity;
      current.revenue += item.quantity * item.price;
      popularity.set(item.id, current);
    }
  }
  const popularProducts = [...popularity.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  const maxPopularity = Math.max(1, ...popularProducts.map((product) => product.quantity));

  const metrics = [
    { label: 'Zamówienia w ostatnich 30 dniach', value: recentOrders.length, icon: ShoppingBag, tone: 'rose' },
    { label: 'Wartość zamówień (30 dni)', value: money(recentSales), icon: Wallet, tone: 'emerald' },
    { label: 'Średnia wartość zamówienia', value: money(averageOrder), icon: ArrowUpRight, tone: 'violet' },
    { label: 'Niski stan magazynowy', value: lowStock.length, icon: AlertTriangle, tone: 'amber' },
  ];
  const tones = {
    rose: 'bg-rose-50 text-rose-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-700',
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, tone }) => <article key={label} className={cardClass}>
          <div className="flex items-start justify-between gap-3"><p className="text-sm leading-5 text-gray-500">{label}</p><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}><Icon size={19} /></span></div>
          <p className="mt-4 text-2xl font-extrabold text-gray-900">{value}</p>
        </article>)}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className={cardClass}>
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Trophy size={20} /></span><div><h2 className="font-bold text-gray-900">Najpopularniejsze produkty</h2><p className="text-xs text-gray-500">Według liczby sztuk w zamówieniach</p></div></div>
          {popularProducts.length ? <ol className="mt-5 space-y-4">{popularProducts.map((product, index) => <li key={product.id}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm"><span className="flex min-w-0 items-center gap-2"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">{index + 1}</span><span className="truncate font-medium text-gray-700">{product.name}</span></span><span className="shrink-0 font-semibold text-gray-900">{product.quantity} szt.</span></div>
            <div className="ml-8 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-rose-400" style={{ width: `${product.quantity / maxPopularity * 100}%` }} /></div>
          </li>)}</ol> : <p className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">Po złożeniu zamówień zobaczysz tutaj najchętniej wybierane produkty.</p>}
        </article>

        <article className={cardClass}>
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Package size={20} /></span><div><h2 className="font-bold text-gray-900">Kończące się produkty</h2><p className="text-xs text-gray-500">Aktywne pozycje z zapasem do 5 sztuk</p></div></div>
          {lowStock.length ? <ul className="mt-5 divide-y divide-gray-100">{lowStock.slice(0, 7).map((product) => <li key={product.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><span className="min-w-0 truncate text-sm font-medium text-gray-700">{product.name}</span><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${product.stock === 0 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{product.stock === 0 ? 'Brak' : `${product.stock} szt.`}</span></li>)}</ul> : <p className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">Wszystkie aktywne produkty mają zapas powyżej 5 sztuk.</p>}
        </article>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <article className={cardClass}><div className="flex items-center gap-2"><ArrowUpRight size={18} className="text-emerald-500" /><h2 className="font-bold text-gray-900">Dostarczone zamówienia</h2></div><p className="mt-3 text-2xl font-extrabold text-gray-900">{money(deliveredOrders.reduce((sum, order) => sum + (order.totals?.total || 0), 0))}</p><p className="mt-1 text-sm text-gray-500">{deliveredOrders.length} {deliveredOrders.length === 1 ? 'zamówienie' : 'zamówień'} zrealizowanych</p></article>
        <article className={cardClass}><div className="flex items-center gap-2"><ArrowDownRight size={18} className="text-rose-500" /><h2 className="font-bold text-gray-900">W realizacji</h2></div><p className="mt-3 text-2xl font-extrabold text-gray-900">{orders.filter((order) => ['new', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status)).length}</p><p className="mt-1 text-sm text-gray-500">Nowe, przygotowywane lub wysłane zamówienia</p></article>
      </section>
    </div>
  );
};
