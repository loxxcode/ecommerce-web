import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'buyer' | 'seller' | 'admin';
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  fallbackPath = '/login' 
}) => {
  const { user, role } = useAuth();

  // Debug logging
  console.log('ProtectedRoute - User:', user, 'Role:', role, 'Required:', requiredRole, 'Fallback:', fallbackPath);

  // If no user, redirect to login
  if (!user) {
    console.log('No user found, redirecting to:', fallbackPath);
    return <Navigate to={fallbackPath} replace />;
  }

  // Check seller approval status
  if (requiredRole === 'seller' && user.sellerStatus !== 'approved') {
    console.log('Seller not approved, status:', user.sellerStatus);
    return <Navigate to="/seller-pending" replace />;
  }

  // If specific role required and user doesn't have it, redirect to appropriate dashboard
  if (requiredRole && role !== requiredRole) {
    console.log('Role mismatch - User has:', role, 'Required:', requiredRole);
    const redirectMap = {
      buyer: '/dashboard',
      seller: '/seller',
      admin: '/admin'
    };
    return <Navigate to={redirectMap[role!]} replace />;
  }

  console.log('Access granted, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
