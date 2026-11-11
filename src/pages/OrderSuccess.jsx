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
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Nie znaleźliśmy tego zamówienia</h1>
        <Link to="/" className="text-rose-500 underline">
          Wróć na stronę główną
        </Link>
      </div>
    );
  }

  const { customer, delivery, totals } = order;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <CheckCircle2 size={56} className="mx-auto text-green-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dziękujemy, {customer.name}!</h1>
        <p className="text-gray-500">
          Przyjęliśmy zamówienie <span className="font-bold text-gray-800">{order.id}</span>. Skontaktujemy się
          z Tobą telefonicznie, aby potwierdzić szczegóły.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        <section>
          <h2 className="font-bold text-gray-800 mb-2">Zamówione produkty</h2>
          <ul className="text-sm space-y-1">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4">
                <span>
                  {i.name} × {i.quantity}
                  {i.description && i.id.startsWith('custom-') && (
                    <span className="block text-xs text-gray-400">{i.description}</span>
                  )}
                </span>
                <span>{i.price * i.quantity} zł</span>
              </li>
            ))}
            {order.event && (
              <li className="flex justify-between">
                <span>{order.event.title}</span>
                <span>{order.event.price} zł</span>
              </li>
            )}
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-2">Szczegóły dostawy</h2>
          <p className="text-sm text-gray-600">
            {formatDate(delivery.date)}, {delivery.slot}
            <br />
            {delivery.address} ({delivery.zoneName})
            <br />
            Odbiorca: {delivery.recipientName}
          </p>
          {delivery.cardText && (
            <p className="text-sm text-gray-500 italic mt-2">Wiadomość na bileciku: „{delivery.cardText}”</p>
          )}
        </section>

        <div className="flex justify-between text-xl font-bold border-t border-gray-100 pt-4">
          <span>Łącznie do zapłaty</span>
          <span className="text-rose-600">{totals.total} zł</span>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link to="/" className="inline-block bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-semibold">
          Wróć do oferty
        </Link>
      </div>
    </div>
  );
};
