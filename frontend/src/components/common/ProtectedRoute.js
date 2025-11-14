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
  
  // If specific RBAC types are required
  // IMPORTANT: This checks employee.type (RBAC level), NOT employee.role (job title)
  if (allowedRoles.length > 0) {
    const userType = authService.getUserType(); // RBAC level, not job title
    
    // Map RBAC type strings to USER_ROLES constants
    const typeMap = {
      'hr': USER_ROLES.HR,
      'employee': USER_ROLES.EMPLOYEE,
      'trainer': USER_ROLES.TRAINER,
      'team_manager': USER_ROLES.TEAM_MANAGER, // Note: backend returns 'team_manager', not 'team_leader'
      'department_manager': USER_ROLES.DEPARTMENT_MANAGER,
      'admin': USER_ROLES.ADMIN
    };
    
    const mappedType = typeMap[userType] || userType;
    
    // Check if user has any of the allowed RBAC types
    const hasAccess = allowedRoles.some(allowedRole => {
      // Direct match
      if (mappedType === allowedRole) return true;
      
      // Check role aliases (for backward compatibility)
      if (allowedRole === USER_ROLES.MANAGER && 
          (mappedType === USER_ROLES.TEAM_MANAGER || mappedType === USER_ROLES.DEPARTMENT_MANAGER)) {
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

