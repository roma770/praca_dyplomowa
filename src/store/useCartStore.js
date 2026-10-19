import { create } from 'zustand';

export const useCartStore = create((set) => ({
  cart: [],
  isEventModalOpen: false,
  addedEvent: null,

  addToCart: (item) => set((state) => {
    const existing = state.cart.find((i) => i.id === item.id);
    let updatedCart;
    
    if (existing) {
      updatedCart = state.cart.map((i) => 
        i.id === item.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
      );
    } else {
      updatedCart = [...state.cart, { ...item, quantity: item.quantity || 1 }];
    }

    return { 
      cart: updatedCart,
      isEventModalOpen: true 
    };
  }),

  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== id)
  })),

  addEventToCart: (event) => set((state) => ({
    addedEvent: event,
    isEventModalOpen: false
  })),

  closeEventModal: () => set({ isEventModalOpen: false }),
  clearCart: () => set({ cart: [], addedEvent: null })
}));