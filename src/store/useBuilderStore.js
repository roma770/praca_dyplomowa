import { create } from 'zustand';

export const useBuilderStore = create((set) => ({
  selectedWrapper: null,
  selectedFlowers: {},

  setWrapper: (wrapper) => set({ selectedWrapper: wrapper }),

  addFlower: (flowerId) => set((state) => ({
    selectedFlowers: {
      ...state.selectedFlowers,
      [flowerId]: (state.selectedFlowers[flowerId] || 0) + 1
    }
  })),

  removeFlower: (flowerId) => set((state) => {
    const current = state.selectedFlowers[flowerId] || 0;
    if (current <= 1) {
      const copy = { ...state.selectedFlowers };
      delete copy[flowerId];
      return { selectedFlowers: copy };
    }
    return {
      selectedFlowers: {
        ...state.selectedFlowers,
        [flowerId]: current - 1
      }
    };
  }),

  resetBuilder: () => set({ selectedWrapper: null, selectedFlowers: {} })
}));