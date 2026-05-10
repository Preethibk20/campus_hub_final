import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import apiClient from '@/api/client'

interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  role: 'USER' | 'ADMIN'
  isVerified: boolean
  collegeName?: string
  department?: string
  yearOfStudy?: number
  skills: string[]
  bio?: string
  rating: number
  totalReviews: number
  walletBalance: number
  availability?: string
  githubUrl?: string
  linkedinUrl?: string
  portfolioUrl?: string
  domains?: string[]
  createdAt: string
  updatedAt: string
}

/** Maps GET /api/users/me (UserProfileResponse) into the client User shape */
function userFromProfileApi(data: Record<string, unknown>): User {
  const skillsRaw = data.skills as { name?: string }[] | undefined
  const skills = Array.isArray(skillsRaw) ? skillsRaw.map((s) => s.name!).filter(Boolean) : []
  const roleRaw = (data.role as string)?.toLowerCase() ?? ''
  return {
    id: String(data.id),
    email: String(data.email ?? ''),
    name: String(data.name ?? ''),
    avatar: data.profilePicUrl ? String(data.profilePicUrl) : undefined,
    role: roleRaw === 'admin' ? 'ADMIN' : 'USER',
    isVerified: Boolean(data.verified),
    collegeName: data.college ? String(data.college) : undefined,
    department: data.branch ? String(data.branch) : undefined,
    yearOfStudy: data.academicYear ? Number(String(data.academicYear).charAt(0)) : undefined,

    skills,
    bio: data.bio ? String(data.bio) : undefined,
    availability: data.availability ? String(data.availability) : 'Open to Both',
    githubUrl: data.githubUrl ? String(data.githubUrl) : '',
    linkedinUrl: data.linkedinUrl ? String(data.linkedinUrl) : '',
    portfolioUrl: data.portfolioUrl ? String(data.portfolioUrl) : '',
    domains: Array.isArray(data.domains) ? data.domains.map(String) : [],
    rating: typeof data.avgRating === 'number' ? data.avgRating : (typeof data.rating === 'number' ? data.rating : 0),
    totalReviews: typeof data.reviewCount === 'number' ? data.reviewCount : 0,
    walletBalance: 0,
    createdAt: data.createdAt ? String(data.createdAt) : '',
    updatedAt: data.createdAt ? String(data.createdAt) : '',
  }
}

async function fetchAndSetUser(setUser: (u: User) => void) {
  // Use Node.js backend for user profile fetching
  const token = useAuthStore.getState().token;
  const response = await fetch('/api/users/me', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) throw new Error('Failed to fetch user');
  const data = await response.json();
  setUser(userFromProfileApi(data as Record<string, unknown>));
}

export interface RegisterAccountPayload {
  name: string
  email: string
  password: string
  collegeName?: string
}

export const useAuth = () => {
  const { user, token, setUser, setTokens, logout } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = Boolean(token && user)

  useEffect(() => {
    const initAuth = async () => {
      if (token && !user) {
        try {
          await fetchAndSetUser(setUser)
        } catch (error) {
          console.error('Failed to refresh user data:', error)
          logout()
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [token, user, setUser, logout])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',

        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setTokens(data.accessToken, data.refreshToken);
      await fetchAndSetUser(setUser);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }

  const register = async (payload: RegisterAccountPayload) => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',

        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           email: payload.email.trim(),
           password: payload.password,
           name: payload.name.trim()
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return { success: true, message: data.message }
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' }
    }
  }

  const resendOtp = async (email: string) => {
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',

        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return { success: true as const }
    } catch (error: any) {
      return { success: false as const, error: error.message || 'Could not resend code' }
    }
  }

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',

        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      // Node OTP now generates real JWT tokens on verify!
      setTokens(data.accessToken, data.refreshToken);
      await fetchAndSetUser(setUser);
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'OTP verification failed' }
    }
  }

  const updateProfile = async (profileData: Partial<User> & { avatar?: string }) => {
    try {
      const body: Record<string, unknown> = {}
      if (profileData.name != null) body.name = profileData.name
      if (profileData.bio !== undefined) body.bio = profileData.bio
      if (profileData.collegeName != null) body.college = profileData.collegeName
      if (profileData.department != null) body.branch = profileData.department

      if (profileData.yearOfStudy != null) {
          // Map numeric 1..4 back to "Xth Year" string for Node backend enum
          const years: Record<number, string> = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
          body.academicYear = years[profileData.yearOfStudy] || String(profileData.yearOfStudy);
      }

      if (profileData.avatar !== undefined) {
        body.profilePicUrl = profileData.avatar || null
      }

      // Include all other relevant fields for persistence
      if (profileData.skills !== undefined) body.skills = profileData.skills
      if (profileData.availability !== undefined) body.availability = profileData.availability
      if (profileData.githubUrl !== undefined) body.githubUrl = profileData.githubUrl
      if (profileData.linkedinUrl !== undefined) body.linkedinUrl = profileData.linkedinUrl
      if (profileData.portfolioUrl !== undefined) body.portfolioUrl = profileData.portfolioUrl

      const token = useAuthStore.getState().token;
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (!response.ok) {
        const errorMsg = data.details ? data.details.join(', ') : (data.error || data.message || 'Update failed');
        throw new Error(errorMsg);
      }

      setUser(userFromProfileApi(data as Record<string, unknown>))
      return { success: true }
    } catch (error: any) {
      console.error("[PROFILE UPDATE] Failed:", error);
      return { success: false, error: error.message || 'Profile update failed' }
    }
  }

  const addSkill = async (skill: string) => {
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch('/api/users/me/skills', {
        method: 'POST',

        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ skill })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setUser(userFromProfileApi(data as Record<string, unknown>))
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to add skill' }
    }
  }

  const logoutUser = async () => {
    const refresh = useAuthStore.getState().refreshToken
    try {
      await apiClient.post('/api/auth/logout', { refreshToken: refresh ?? '' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      logout()
    }
  }

  return {
    user,
    token,
    role: user?.role,
    isAuthenticated,
    isLoading,
    login,
    register,
    resendOtp,
    verifyOTP,
    updateProfile,
    addSkill,
    logout: logoutUser,
  }
}

export default useAuth
