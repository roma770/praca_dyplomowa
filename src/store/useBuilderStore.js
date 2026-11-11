import { create } from 'zustand';
import builderData from '../data/builderData.json';

export const useBuilderStore = create((set) => ({
  selectedWrapper: null,
  selectedFlowers: {},

  setWrapper: (wrapper) => set({ selectedWrapper: wrapper }),

  // Не даём собрать больше maxFlowers цветов (иначе букет не поместится в упаковку)
  addFlower: (flowerId) =>
    set((state) => {
      const total = Object.values(state.selectedFlowers).reduce((sum, n) => sum + n, 0);
      if (total >= builderData.maxFlowers) return state;

      return {
        selectedFlowers: {
          ...state.selectedFlowers,
          [flowerId]: (state.selectedFlowers[flowerId] || 0) + 1,
        },
      };
    }),

  removeFlower: (flowerId) =>
    set((state) => {
      const current = state.selectedFlowers[flowerId] || 0;
      if (current <= 1) {
        const copy = { ...state.selectedFlowers };
        delete copy[flowerId];
        return { selectedFlowers: copy };
      }
      return {
        selectedFlowers: {
          ...state.selectedFlowers,
          [flowerId]: current - 1,
        },
      };
    }),

  resetBuilder: () => set({ selectedWrapper: null, selectedFlowers: {} }),
}));