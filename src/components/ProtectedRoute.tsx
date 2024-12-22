import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../api/store/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}