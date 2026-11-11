import { Link, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Minus, Plus, Trash2, ShoppingBag, Truck } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { checkoutSchema, todayISO } from '../lib/checkoutSchema';
import { calcTotals } from '../lib/pricing';
import delivery from '../data/delivery.json';

const inputClass =
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white';

const Field = ({ label, error, children }) => (
  <label className="block">
    <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
    {children}
    {error && <span className="block text-xs text-red-500 mt-1">{error.message}</span>}
  </label>
);

const CartItemRow = ({ item }) => {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);

  return (
    <div className="flex items-center gap-4 py-3">
      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-800 truncate">{item.name}</div>
        <div className="text-sm text-gray-500">{item.price} zł</div>
        {item.description && item.id.startsWith('custom-') && (
          <div className="text-xs text-gray-400 truncate">{item.description}</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => updateQuantity(item.id, -1)}
          aria-label="Zmniejsz liczbę sztuk"
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center font-semibold">{item.quantity}</span>
        <button
          type="button"
          onClick={() => updateQuantity(item.id, 1)}
          aria-label="Zwiększ liczbę sztuk"
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="w-20 text-right font-bold">{item.price * item.quantity} zł</div>
      <button
        type="button"
        onClick={() => removeFromCart(item.id)}
        aria-label="Usuń produkt"
        className="text-gray-400 hover:text-rose-500"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export const Checkout = () => {
  const navigate = useNavigate();
  const cart = useCartStore((s) => s.cart);
  const addedEvent = useCartStore((s) => s.addedEvent);
  const removeEvent = useCartStore((s) => s.removeEvent);
  const placeOrder = useCartStore((s) => s.placeOrder);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      recipientName: '',
      address: '',
      zone: '',
      date: '',
      slot: '',
      cardText: '',
    },
  });

  const zoneId = useWatch({ control, name: 'zone' });
  const totals = calcTotals(cart, addedEvent, zoneId);

  const onSubmit = (data) => {
    const zone = delivery.zones.find((z) => z.id === data.zone);
    const orderId = placeOrder({
      customer: { name: data.name, phone: data.phone, email: data.email },
      delivery: {
        recipientName: data.recipientName,
        address: data.address,
        zoneName: zone.name,
        date: data.date,
        slot: data.slot,
        cardText: data.cardText,
      },
      totals,
    });
    navigate(`/order/${orderId}`);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Twój koszyk jest pusty</h1>
        <p className="text-gray-500 mb-6">Wybierz bukiet lub upominek, a potem wróć, by złożyć zamówienie.</p>
        <Link to="/" className="inline-block bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-semibold">
          Zobacz ofertę
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dane do zamówienia</h1>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Левая колонка: товары + форма */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Twoje produkty</h2>
            <div className="divide-y divide-gray-100">
              {cart.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}

              {addedEvent && (
                <div className="flex items-center gap-4 py-3">
                  <img src={addedEvent.image} alt={addedEvent.title} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-rose-500 font-semibold">{addedEvent.type}</div>
                    <div className="font-semibold text-gray-800 truncate">{addedEvent.title}</div>
                  </div>
                  <div className="w-20 text-right font-bold">{addedEvent.price} zł</div>
                  <button
                    type="button"
                    onClick={removeEvent}
                    aria-label="Usuń dodatek"
                    className="text-gray-400 hover:text-rose-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </section>

          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
            <section className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Dane kontaktowe</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Imię i nazwisko" error={errors.name}>
                  <input {...register('name')} className={inputClass} placeholder="Aleksandra Nowak" />
                </Field>
                <Field label="Numer telefonu" error={errors.phone}>
                  <input {...register('phone')} className={inputClass} placeholder="+48 500 123 456" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Adres e-mail (opcjonalnie)" error={errors.email}>
                    <input {...register('email')} className={inputClass} placeholder="name@example.com" />
                  </Field>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
                <Truck size={20} className="text-rose-500" />
                Dostawa pod wskazany adres
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Imię i nazwisko odbiorcy" error={errors.recipientName}>
                  <input {...register('recipientName')} className={inputClass} placeholder="Maria Kowalska" />
                </Field>
                <Field label="Obszar dostawy" error={errors.zone}>
                  <select {...register('zone')} className={inputClass}>
                    <option value="">Wybierz obszar</option>
                    {delivery.zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} — {z.price} zł
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Adres (ulica, numer domu i mieszkania)" error={errors.address}>
                    <input {...register('address')} className={inputClass} placeholder="ul. Kwiatowa 12/5" />
                  </Field>
                </div>
                <Field label="Data dostawy" error={errors.date}>
                  <input type="date" min={todayISO()} {...register('date')} className={inputClass} />
                </Field>
                <Field label="Przedział godzinowy" error={errors.slot}>
                  <select {...register('slot')} className={inputClass}>
                    <option value="">Wybierz godzinę</option>
                    {delivery.slots.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Wiadomość na bileciku (opcjonalnie)" error={errors.cardText}>
                    <textarea
                      {...register('cardText')}
                      rows={3}
                      className={inputClass}
                      placeholder="Wszystkiego najlepszego! Niech każdy dzień przynosi Ci radość…"
                    />
                  </Field>
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* Правая колонка: итог */}
        <aside className="bg-white rounded-2xl border border-gray-100 p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Podsumowanie</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Produkty</dt>
              <dd>{totals.itemsTotal} zł</dd>
            </div>
            {addedEvent && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Dodatkowy upominek</dt>
                <dd>{totals.eventTotal} zł</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-500">Dostawa</dt>
              <dd>
                {!zoneId
                  ? 'wybierz obszar'
                  : totals.isFreeDelivery
                    ? 'bezpłatna'
                    : `${totals.deliveryPrice} zł`}
              </dd>
            </div>
          </dl>
          <div className="flex justify-between text-xl font-bold border-t border-gray-100 mt-4 pt-4">
            <span>Do zapłaty</span>
            <span className="text-rose-600">{totals.total} zł</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Dostawa gratis przy zamówieniach od {delivery.freeDeliveryFrom} zł. Płatność u kuriera przy odbiorze.
          </p>
          <button
            type="submit"
            form="checkout-form"
            className="w-full mt-5 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Złóż zamówienie
          </button>
        </aside>
      </div>
    </div>
  );
};
