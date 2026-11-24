import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFavoritesStore = create(
  persist(
    (set) => ({
      favoriteIds: [],
      toggleFavorite: (id) => set((state) => ({
        favoriteIds: state.favoriteIds.includes(id)
          ? state.favoriteIds.filter((favoriteId) => favoriteId !== id)
          : [...state.favoriteIds, id],
      })),
      removeFavorite: (id) => set((state) => ({
        favoriteIds: state.favoriteIds.filter((favoriteId) => favoriteId !== id),
      })),
    }),
    { name: 'bloom-joy-favorites' }
  )
);
