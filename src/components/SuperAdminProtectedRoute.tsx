
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface SuperAdminProtectedRouteProps {
  children: React.ReactNode;
}

export const SuperAdminProtectedRoute: React.FC<SuperAdminProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, isSuperAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-tactical-bg tactical-grid flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-red-500 font-mono text-sm uppercase tracking-wider">
            VERIFYING SUPER-ADMIN ACCESS...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !isSuperAdmin()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
