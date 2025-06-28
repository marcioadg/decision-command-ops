
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, profile, isLoading, isAdmin } = useAuth();

  // FIXED: Show loading state longer to prevent flash of redirect
  if (isLoading) {
    return (
      <div className="min-h-screen bg-tactical-bg tactical-grid flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-tactical-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-tactical-accent font-mono text-sm uppercase tracking-wider">
            VERIFYING ACCESS...
          </p>
        </div>
      </div>
    );
  }

  // FIXED: Only redirect if we're sure there's no user (not just missing profile)
  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // FIXED: Allow access even if profile is still loading, as long as user exists
  if (requireAdmin && profile && !isAdmin()) {
    console.log('ProtectedRoute: Admin required but user is not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // FIXED: Render children even if profile is still loading
  return <>{children}</>;
};
