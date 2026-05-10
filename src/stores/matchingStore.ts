import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = 'http://localhost:8080/api/matching';

export type PostStatus = 'OPEN' | 'CLOSED';
export type PostMode = 'ONLINE' | 'OFFLINE' | 'HYBRID';
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface HackathonPost {
    postId: string;
    title: string;
    description: string;
    techStack: string[];
    teamSize: number;
    currentSize: number;
    rolesNeeded: string[];
    mode: PostMode;
    deadline: string;
    postedBy: string;
    status: PostStatus;
    createdAt: string;
}

export interface SuggestedPartnerDTO {
    post: HackathonPost;
    score: number;
    matchedSkills: string[];
}

export interface MatchRequest {
    requestId: string;
    postId: string;
    fromUserId: string;
    toUserId: string;
    message?: string;
    status: RequestStatus;
    createdAt: string;
    respondedAt?: string;
}

interface MatchingFilters {
    status?: string;
    mode?: string;
    role?: string;
}

interface MatchingState {
    posts: HackathonPost[];
    myPosts: HackathonPost[];
    suggestions: SuggestedPartnerDTO[];
    incomingRequests: MatchRequest[];
    outgoingRequests: MatchRequest[];
    loading: boolean;
    error: string | null;

    // Actions
    fetchPosts: (filters?: MatchingFilters) => Promise<void>;
    fetchMyPosts: () => Promise<void>;
    fetchSuggestions: () => Promise<void>;
    fetchIncomingRequests: () => Promise<void>;
    fetchOutgoingRequests: () => Promise<void>;
    createPost: (data: Partial<HackathonPost>) => Promise<HackathonPost>;
    sendRequest: (postId: string, message?: string) => Promise<MatchRequest>;
    respondToRequest: (requestId: string, status: 'ACCEPTED' | 'REJECTED') => Promise<MatchRequest>;
}

export const useMatchingStore = create<MatchingState>((set, get) => ({
    posts: [],
    myPosts: [],
    suggestions: [],
    incomingRequests: [],
    outgoingRequests: [],
    loading: false,
    error: null,

    fetchPosts: async (filters = {}) => {
        set({ loading: true, error: null });
        try {
            const queryParams = new URLSearchParams();
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.mode) queryParams.append('mode', filters.mode);
            if (filters.role) queryParams.append('role', filters.role);

            const res = await fetch(`${API_URL}/posts?${queryParams.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch hackathon posts');
            
            const data = await res.json();
            set({ posts: data });
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },

    fetchMyPosts: async () => {
        const token = useAuthStore.getState().token;
        if (!token) return;

        set({ loading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/posts/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch your posts');
            
            const data = await res.json();
            set({ myPosts: data });
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },

    fetchSuggestions: async () => {
        const token = useAuthStore.getState().token;
        if (!token) return;

        set({ loading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/suggestions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch suggestions');
            
            const data = await res.json();
            set({ suggestions: data });
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },

    fetchIncomingRequests: async () => {
        const token = useAuthStore.getState().token;
        if (!token) return;

        set({ loading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/requests/incoming`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch incoming requests');
            
            const data = await res.json();
            set({ incomingRequests: data });
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },

    fetchOutgoingRequests: async () => {
        const token = useAuthStore.getState().token;
        if (!token) return;

        set({ loading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/requests/outgoing`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch outgoing requests');
            
            const data = await res.json();
            set({ outgoingRequests: data });
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },

    createPost: async (postData) => {
        const token = useAuthStore.getState().token;
        if (!token) throw new Error("Must be logged in to create a post");

        set({ loading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || 'Failed to create post');
            }

            // Immediately fetch fresh state 
            await get().fetchMyPosts();
            await get().fetchPosts();
            
            return data;
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    sendRequest: async (postId, message) => {
        const token = useAuthStore.getState().token;
        if (!token) throw new Error("Must be logged in to send a request");

        set({ loading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/requests`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ postId, message })
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || 'Failed to send request');
            }

            // Immediately reflect in our outgoing requests array
            get().fetchOutgoingRequests();

            return data;
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    respondToRequest: async (requestId, status) => {
        const token = useAuthStore.getState().token;
        if (!token) throw new Error("Must be logged in to respond");

        set({ loading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/requests/${requestId}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || 'Failed to respond to request');
            }

            // Remove it from the local PENDING incoming Requests seamlessly 
            set(state => ({
                incomingRequests: state.incomingRequests.filter(req => req.requestId !== requestId)
            }));

            // Sync posts to update currentSize
            get().fetchMyPosts();

            return data;
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        } finally {
            set({ loading: false });
        }
    }
}));
