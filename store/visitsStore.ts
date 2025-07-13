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
  addVisit: (visit: Visit) => void;
  deleteVisit: (id: number) => void;
  completeVisit: (id: number) => void;
  updateVisit: (id: number, updatedVisit: Partial<Visit>) => void;
}

// Initial sample data
const initialVisits: Visit[] = [
  {
    id: 1,
    date: '2025-07-15',
    address: '123 Main St, Springfield',
    phone: '(555) 123-4567',
    name: 'John Smith'
  },
  {
    id: 2,
    date: '2025-07-18',
    address: '456 Oak Ave, Riverside',
    phone: '(555) 987-6543',
    name: 'Sarah Johnson'
  },
  {
    id: 3,
    date: '2025-07-22',
    address: '789 Pine Rd, Lakewood',
    phone: '(555) 456-7890',
    name: 'Michael Davis'
  },
  {
    id: 4,
    date: '2025-07-25',
    address: '321 Elm St, Greenfield',
    phone: '(555) 234-5678',
    name: 'Emily Wilson'
  },
  {
    id: 5,
    date: '2025-07-30',
    address: '654 Maple Dr, Hillcrest',
    phone: '(555) 345-6789',
    name: 'David Brown'
  }
];

export const useVisitsStore = create<VisitsState>((set, get) => ({
  visits: initialVisits,
  completedVisits: [],
  
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
