import data from '../data/builderData.json';

// Картинка для строки «Авторський букет» в корзине (у кастомного букета нет фото)
const BOUQUET_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#ffe4e6"/><text x="32" y="45" font-size="36" text-anchor="middle">💐</text></svg>'
)}`;

// Считает состав и цену букета по выбору пользователя
export const calcBouquet = (wrapper, selectedFlowers) => {
  const lines = data.flowers
    .filter((f) => selectedFlowers[f.id])
    .map((f) => ({
      ...f,
      count: selectedFlowers[f.id],
      sum: f.price * selectedFlowers[f.id],
    }));

  const count = lines.reduce((sum, l) => sum + l.count, 0);
  const flowersTotal = lines.reduce((sum, l) => sum + l.sum, 0);
  const total = flowersTotal + (wrapper ? wrapper.price : 0);
  const composition = [wrapper?.name, ...lines.map((l) => `${l.name} × ${l.count}`)]
    .filter(Boolean)
    .join(', ');

  return { lines, count, flowersTotal, total, composition };
};

// Превращает собранный букет в обычный товар для корзины
export const bouquetToCartItem = (wrapper, selectedFlowers) => {
  const { total, composition } = calcBouquet(wrapper, selectedFlowers);
  return {
    id: `custom-${Date.now()}`,
    name: 'Авторський букет',
    description: composition,
    price: total,
    image: BOUQUET_IMAGE,
  };
};