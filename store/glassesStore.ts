import { API_URLS } from '@/constants/ApiUrls';
import { create } from 'zustand';

export interface Glass {
  id: string;
  name: string;
  priceTransparent: number | null;
  priceColor: number | null;
}

interface GlassesState {
  glasses: Glass[];
  isLoading: boolean;
  error: string | null;
  fetchGlasses: () => Promise<void>;
  editGlassPrice: (id: string, price: number) => Promise<void>;
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

  editGlassPrice: async (id, price) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URLS.GET_ALL_GLASSES}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceTransparent: price }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      // Optionally update local state after successful patch
      set((state) => ({
        glasses: state.glasses.map((glass) =>
          glass.id === id ? { ...glass, priceTransparent: price } : glass
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
