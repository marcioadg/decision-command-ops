
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, profile, isLoading, isAdmin, needsOnboarding } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
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

  // Redirect to login if no user
  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check if user needs onboarding (but not if they're already on the onboarding page)
  if (profile && needsOnboarding() && location.pathname !== '/onboarding') {
    console.log('ProtectedRoute: User needs onboarding, redirecting to /onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // Check admin requirements
  if (requireAdmin && profile && !isAdmin()) {
    console.log('ProtectedRoute: Admin required but user is not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Render children if all checks pass
  return <>{children}</>;
};
