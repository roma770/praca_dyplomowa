import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      addedEvent: null,
      orders: [],
      isEventModalOpen: false,
      eventDeclined: false, // пользователь уже отказался от предложений

      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find((i) => i.id === item.id);
          const quantity = item.quantity || 1;

          const cart = existing
            ? state.cart.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
              )
            : [...state.cart, { ...item, quantity }];

          return {
            cart,
            // Показываем окно, только пока человек не выбрал мероприятие и не отказался
            isEventModalOpen: !state.addedEvent && !state.eventDeclined,
          };
        }),

      // delta: +1 / -1. Если количество стало 0, товар удаляется
      updateQuantity: (id, delta) =>
        set((state) => ({
          cart: state.cart
            .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
            .filter((i) => i.quantity > 0),
        })),

      removeFromCart: (id) =>
        set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),

      addEventToCart: (event) => set({ addedEvent: event, isEventModalOpen: false }),

      removeEvent: () => set({ addedEvent: null }),

      closeEventModal: () => set({ isEventModalOpen: false, eventDeclined: true }),

      // Сохраняет заказ в историю, очищает корзину и возвращает номер заказа
      placeOrder: (details) => {
        const { cart, addedEvent } = get();
        const id = `BJ-${Date.now().toString().slice(-6)}`;
        const order = {
          id,
          createdAt: new Date().toISOString(),
          items: cart,
          event: addedEvent,
          ...details,
        };
        set((state) => ({
          orders: [order, ...state.orders],
          cart: [],
          addedEvent: null,
          eventDeclined: false,
        }));
        return id;
      },

      clearCart: () => set({ cart: [], addedEvent: null, eventDeclined: false }),
    }),
    {
      name: 'bloom-joy-cart',
      // В localStorage сохраняем только данные, но не состояние окна
      partialize: (state) => ({
        cart: state.cart,
        addedEvent: state.addedEvent,
        eventDeclined: state.eventDeclined,
        orders: state.orders,
      }),
    }
  )
);