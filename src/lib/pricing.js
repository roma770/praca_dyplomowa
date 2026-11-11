import delivery from '../data/delivery.json';

// Единое место, где считаются суммы заказа
export const calcTotals = (cart, event, zoneId) => {
  const itemsTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const eventTotal = event ? event.price : 0;
  const subtotal = itemsTotal + eventTotal;

  const zone = delivery.zones.find((z) => z.id === zoneId);
  const isFree = subtotal >= delivery.freeDeliveryFrom;
  const deliveryPrice = zone && !isFree ? zone.price : 0;

  return {
    itemsTotal,
    eventTotal,
    subtotal,
    deliveryPrice,
    isFreeDelivery: isFree,
    total: subtotal + deliveryPrice,
  };
};

export const formatDate = (iso) => iso.split('-').reverse().join('.');