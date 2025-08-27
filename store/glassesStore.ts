import { API_URLS } from '@/constants/ApiUrls';
import { create } from 'zustand';

export interface Glass {
  id: string;
  order: number;
  name: string;
  priceTransparent: number | null;
  priceColor: number | null;
}

interface GlassesState {
  glasses: Glass[];
  isLoading: boolean;
  error: string | null;
  fetchGlasses: () => Promise<void>;
  editGlassPrice: (id: string, priceTransparent: number, priceColor: number) => Promise<void>;
}

export const useGlassesStore = create<GlassesState>((set) => ({
  glasses: [],
  isLoading: false,
  error: null,

  fetchGlasses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(API_URLS.GET_ALL_GLASSES);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      // Accept both old and new API formats
      const glassesRaw = await response.json();
      const glasses: Glass[] = Array.isArray(glassesRaw)
        ? glassesRaw.map((g) => ({
            id: g.id,
            name: g.name,
            priceTransparent: g.priceTransparent !== undefined ? g.priceTransparent : (g.priceTransparent ?? null),
            priceColor: g.priceColor !== undefined ? g.priceColor : (g.PriceColor ?? null),
            order: g.order,
          }))
        : [];
      set({ glasses, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch glasses',
        isLoading: false,
      });
    }
  },

  editGlassPrice: async (id, priceTransparent, priceColor) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URLS.GET_ALL_GLASSES}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceTransparent, priceColor }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      set((state) => ({
        glasses: state.glasses.map((glass) =>
          glass.id === id ? { ...glass, priceTransparent, priceColor } : glass
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to edit glass price',
        isLoading: false,
      });
    }
  }
}));
