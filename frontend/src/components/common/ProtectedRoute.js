// Protected Route Component
import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../utils/auth';
import { ROUTES } from '../../utils/constants';

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  
  // If specific roles are required
  if (allowedRoles.length > 0) {
    const userRole = authService.getUserRole();
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to={ROUTES.ERROR_403} replace />;
    }
  }
  
  return children;
};

export default ProtectedRoute;

