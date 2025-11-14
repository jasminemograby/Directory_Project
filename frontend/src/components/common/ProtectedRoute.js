// Protected Route Component
import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../utils/auth';
import { ROUTES, USER_ROLES } from '../../utils/constants';

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  
  // If specific roles are required
  if (allowedRoles.length > 0) {
    const userRole = authService.getUserRole();
    
    // Map role strings to USER_ROLES constants
    const roleMap = {
      'hr': USER_ROLES.HR,
      'employee': USER_ROLES.EMPLOYEE,
      'trainer': USER_ROLES.TRAINER,
      'team_leader': USER_ROLES.TEAM_MANAGER,
      'department_manager': USER_ROLES.DEPARTMENT_MANAGER,
      'admin': USER_ROLES.ADMIN
    };
    
    const mappedRole = roleMap[userRole] || userRole;
    
    // Check if user has any of the allowed roles
    const hasAccess = allowedRoles.some(allowedRole => {
      // Direct match
      if (mappedRole === allowedRole) return true;
      
      // Check role aliases
      if (allowedRole === USER_ROLES.MANAGER && 
          (mappedRole === USER_ROLES.TEAM_MANAGER || mappedRole === USER_ROLES.DEPARTMENT_MANAGER)) {
        return true;
      }
      
      return false;
    });
    
    if (!hasAccess) {
      return <Navigate to={ROUTES.ERROR_403} replace />;
    }
  }
  
  return children;
};

export default ProtectedRoute;

