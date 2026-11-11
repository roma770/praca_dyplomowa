import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { formatDate } from '../lib/pricing';

export const OrderSuccess = () => {
  const { id } = useParams();
  const order = useCartStore((s) => s.orders.find((o) => o.id === id));

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Замовлення не знайдено</h1>
        <Link to="/" className="text-rose-500 underline">
          На головну
        </Link>
      </div>
    );
  }

  const { customer, delivery, totals } = order;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <CheckCircle2 size={56} className="mx-auto text-green-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Дякуємо, {customer.name}!</h1>
        <p className="text-gray-500">
          Замовлення <span className="font-bold text-gray-800">{order.id}</span> прийнято. Ми зателефонуємо
          вам для підтвердження.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        <section>
          <h2 className="font-bold text-gray-800 mb-2">Склад замовлення</h2>
          <ul className="text-sm space-y-1">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4">
                <span>
                  {i.name} × {i.quantity}
                  {i.description && i.id.startsWith('custom-') && (
                    <span className="block text-xs text-gray-400">{i.description}</span>
                  )}
                </span>
                <span>{i.price * i.quantity} грн</span>
              </li>
            ))}
            {order.event && (
              <li className="flex justify-between">
                <span>{order.event.title}</span>
                <span>{order.event.price} грн</span>
              </li>
            )}
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-2">Доставка</h2>
          <p className="text-sm text-gray-600">
            {formatDate(delivery.date)}, {delivery.slot}
            <br />
            {delivery.address} ({delivery.zoneName})
            <br />
            Отримувач: {delivery.recipientName}
          </p>
          {delivery.cardText && (
            <p className="text-sm text-gray-500 italic mt-2">Листівка: «{delivery.cardText}»</p>
          )}
        </section>

        <div className="flex justify-between text-xl font-bold border-t border-gray-100 pt-4">
          <span>Разом до сплати</span>
          <span className="text-rose-600">{totals.total} грн</span>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link to="/" className="inline-block bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-semibold">
          Продовжити покупки
        </Link>
      </div>
    </div>
  );
};