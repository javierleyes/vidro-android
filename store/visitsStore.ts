import { API_URLS } from '@/constants/ApiUrls';
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
  addVisit: (visit: Omit<Visit, 'id'>) => Promise<void>;
  deleteVisit: (id: number) => Promise<void>;
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
      const response = await fetch(API_URLS.GET_ALL_VISITS); 
      
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
  
  addVisit: async (visit: Omit<Visit, 'id'>) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(API_URLS.CREATE_VISIT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visit),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newVisit: Visit = await response.json();
      
      set((state) => ({
        visits: [...state.visits, newVisit],
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add visit',
        isLoading: false 
      });
    }
  },
  
  deleteVisit: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(API_URLS.DELETE_VISIT(id), {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      set((state) => ({
        visits: state.visits.filter((visit) => visit.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete visit',
        isLoading: false 
      });
    }
  },
  
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
