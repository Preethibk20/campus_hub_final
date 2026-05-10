import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Shield, Lock } from 'lucide-react'
import Button from '@/components/ui/Button'

interface AdminRouteProps {
  children: React.ReactNode
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if user has admin role
  if (user?.role !== 'ADMIN') {
    return <ForbiddenPage />
  }

  return <>{children}</>
}

const ForbiddenPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-12 h-12 text-danger" />
        </div>
        <h1 className="text-4xl font-bold text-text-primary mb-2">403</h1>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Access Denied</h2>
        <p className="text-text-secondary mb-6 max-w-md">
          You don't have permission to access the admin panel. This area is restricted to administrators only.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="secondary" onClick={() => window.history.back()}>
            Go Back
          </Button>
          <Button onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AdminRoute
