import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Auth from '../pages/Auth';
import { AlertCircle, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerification?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireVerification = true 
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (requireVerification && !user.isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Required</h2>
            <p className="text-slate-600 mb-6">
              You need to verify your student email to access this feature. Please check your email for the verification code.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-amber-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Verification email sent to {user.email}</span>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              I've Verified My Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
