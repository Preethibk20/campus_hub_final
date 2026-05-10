import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireVerification?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireVerification = false,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted location for redirect after login
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  // Redirect to verification if email not verified and verification is required
  if (requireVerification && !user?.isVerified) {
    return (
      <Navigate
        to="/verify"
        state={{ from: location }}
        replace
      />
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
