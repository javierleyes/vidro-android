import { create } from 'zustand';

export interface Visit {
  id: number;
  date: string;
  address: string;
  phone: string;
  name: string;
}

interface VisitsState {
  visits: Visit[];
  completedVisits: Visit[];
  isLoading: boolean;
  error: string | null;
  fetchVisits: () => Promise<void>;
  addVisit: (visit: Visit) => void;
  deleteVisit: (id: number) => void;
  completeVisit: (id: number) => void;
  updateVisit: (id: number, updatedVisit: Partial<Visit>) => void;
}


export const useVisitsStore = create<VisitsState>((set, get) => ({
  visits: [],
  completedVisits: [],
  isLoading: false,
  error: null,
  
  fetchVisits: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('https://localhost:58224/visits'); // Replace with your API endpoint
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const visits: Visit[] = await response.json();
      set({ visits, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch visits',
        isLoading: false 
      });
    }
  },
  
  addVisit: (visit: Visit) =>
    set((state) => ({
      visits: [...state.visits, visit]
    })),
  
  deleteVisit: (id: number) =>
    set((state) => ({
      visits: state.visits.filter((visit) => visit.id !== id)
    })),
  
  completeVisit: (id: number) =>
    set((state) => {
      const visitToComplete = state.visits.find((visit) => visit.id === id);
      if (!visitToComplete) return state;
      
      return {
        visits: state.visits.filter((visit) => visit.id !== id),
        completedVisits: [...state.completedVisits, visitToComplete]
      };
    }),
  
  updateVisit: (id: number, updatedVisit: Partial<Visit>) =>
    set((state) => ({
      visits: state.visits.map((visit) =>
        visit.id === id ? { ...visit, ...updatedVisit } : visit
      )
    }))
}));
