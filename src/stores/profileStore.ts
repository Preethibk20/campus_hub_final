import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { apiClient } from '@/api/client';


export interface UserProfile {
  id: string;
  email: string;
  name: string;
  bio?: string;
  college?: string;
  academicYear?: '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'Postgrad';
  branch?: string;
  skills: string[];
  domains: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  availability: 'Open to Gigs' | 'Open to Hackathons' | 'Open to Both' | 'Not Available';
  role: 'student' | 'admin' | 'recruiter';
  profileCompletion: number;

  profilePicUrl?: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

interface ProfileState {
  profile: UserProfile | null;
  publicProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateSuccess: boolean;
  
  fetchMyProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  fetchPublicProfile: (userId: string) => Promise<void>;
  resetStatus: () => void;
}

const API_URL = '/api/users';


export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  publicProfile: null,
  loading: false,
  error: null,
  updateSuccess: false,

  fetchMyProfile: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`${API_URL}/me`);
      set({ profile: response.data, loading: false });

    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch profile', loading: false });
    }
  },

  updateProfile: async (data) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ loading: true, error: null, updateSuccess: false });
    try {
      const response = await apiClient.put(`${API_URL}/me`, data);

      
      // Refresh local profile with response from server (which includes updated profileCompletion)
      set({ profile: response.data, updateSuccess: true, loading: false });
      
      // Sync with AuthStore user data to ensure UI consistency across all pages
      useAuthStore.getState().updateUser({
        name: response.data.name,
        bio: response.data.bio,
        skills: response.data.skills,
        collegeName: response.data.college,
        department: response.data.branch,
        yearOfStudy: response.data.yearOfStudy || response.data.academicYear
      });

      // Auto-reset success message after 3 seconds
      setTimeout(() => {
        set({ updateSuccess: false });
      }, 3000);
      
    } catch (err: any) {
      const errorMsg = err.response?.data?.details 
        ? err.response.data.details.join(', ') 
        : (err.response?.data?.message || 'Failed to update profile');
      set({ error: errorMsg, loading: false });
    }
  },

  fetchPublicProfile: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`${API_URL}/${userId}`);
      set({ publicProfile: response.data, loading: false });

    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch public profile', loading: false });
    }
  },

  resetStatus: () => set({ error: null, updateSuccess: false, loading: false })
}));
