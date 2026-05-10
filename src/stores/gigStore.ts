import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

interface Gig {
  id: string;
  title: string;
  description: string;
  category: 'TECH' | 'DESIGN' | 'MARKETING' | 'CONTENT' | 'OTHER';
  type: 'PAID' | 'COLLAB';
  budget?: number;
  skillsRequired: string[];
  postedBy: string;
  status: 'OPEN' | 'CLOSED' | 'IN_PROGRESS';
  createdAt: string;
  posterName?: string;
  posterCollege?: string;
  posterBranch?: string;
  posterAcademicYear?: string;
  posterProfilePic?: string;
  applicationCount: number;
  hasApplied: boolean;
  acceptedUsers?: string[];
}

interface GigFilters {
  category?: string;
  type?: string;
  skills?: string[];
}

interface GigState {
  gigs: Gig[];
  selectedGig: Gig | null;
  filters: GigFilters;
  loading: boolean;
  error: string | null;
  
  setFilters: (filters: GigFilters) => void;
  fetchGigs: (filters?: GigFilters) => Promise<void>;
  fetchGigById: (id: string) => Promise<void>;
  createGig: (data: Partial<Gig>) => Promise<void>;
  deleteGig: (id: string) => Promise<void>;
  expressInterest: (id: string) => Promise<void>;
  fetchApplications: (id: string) => Promise<any[]>;
  acceptApplicant: (gigId: string, userId: string) => Promise<void>;
  rejectApplicant: (gigId: string, userId: string) => Promise<void>;
}

const API_URL = '/api/gigs';

export const useGigStore = create<GigState>((set, get) => ({
  gigs: [],
  selectedGig: null,
  filters: { category: '', type: '', skills: [] },
  loading: false,
  error: null,

  setFilters: (filters) => set({ filters }),

  fetchGigs: async (filters) => {
    set({ loading: true, error: null });
    try {
      const activeFilters = filters || get().filters;
      const params = new URLSearchParams();
      if (activeFilters.category) params.append('category', activeFilters.category);
      if (activeFilters.type) params.append('type', activeFilters.type);
      if (activeFilters.skills && activeFilters.skills.length > 0) {
        params.append('skills', activeFilters.skills.join(','));
      }
      
      const response = await axios.get(`${API_URL}?${params.toString()}`);
      set({ gigs: response.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  fetchGigById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      set({ selectedGig: response.data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createGig: async (data) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      await axios.post(API_URL, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Re-fetch from server so the new gig shows up with poster details populated
      const refreshed = await axios.get(API_URL);
      set({ gigs: refreshed.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err; // Re-throw so the form can catch it and show an error toast
    }
  },

  deleteGig: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set((state) => ({ 
        gigs: state.gigs.filter(g => g.id !== id), 
        loading: false 
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  expressInterest: async (id) => {
    try {
      const token = useAuthStore.getState().token;
      await axios.post(`${API_URL}/${id}/interest`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state
      set(state => ({
        selectedGig: state.selectedGig && state.selectedGig.id === id 
          ? { ...state.selectedGig, hasApplied: true, applicationCount: state.selectedGig.applicationCount + 1 }
          : state.selectedGig
      }));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to express interest');
    }
  },

  fetchApplications: async (id) => {
    try {
      const token = useAuthStore.getState().token;
      const response = await axios.get(`${API_URL}/${id}/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to fetch applications');
    }
  },

  acceptApplicant: async (gigId, userId) => {
    try {
      const token = useAuthStore.getState().token;
      const response = await axios.patch(`${API_URL}/${gigId}/applicants/${userId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ selectedGig: response.data });
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to accept applicant');
    }
  },

  rejectApplicant: async (gigId, userId) => {
    try {
      const token = useAuthStore.getState().token;
      const response = await axios.patch(`${API_URL}/${gigId}/applicants/${userId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ selectedGig: response.data });
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to reject applicant');
    }
  },
}));
