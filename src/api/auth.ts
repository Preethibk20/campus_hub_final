import apiClient from './client'

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export const register = (email: string, password: string, name: string) =>
  apiClient.post('/api/auth/register', { email, password, name })

export const verifyOtp = (email: string, otp: string) =>
  apiClient.post<LoginResponse>('/api/auth/verify-otp', { email, otp })

export const login = (email: string, password: string) =>
  apiClient.post<LoginResponse>('/api/auth/login', { email, password })
