import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const ProtectedRoute = ({ allowedRoles, redirectPath = '/access-denied', children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
      return <div>Loading...</div>; 
    }
  
    if (!user) {
      return <Navigate to="/login" replace />;
    }
  
    const userRole = user.internalDashboardRole;
    
    if (allowedRoles === 'Super Admin' && userRole !== 'Super Admin') {
      return <Navigate to={redirectPath} replace />;
    }
  
    if (allowedRoles === 'Admin' && !['Admin', 'Super Admin'].includes(userRole)) {
      return <Navigate to={redirectPath} replace />;
    }
  
    return children ? children : <Outlet />;
  };