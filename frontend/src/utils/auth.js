// Authentication Utilities

import { USER_ROLES } from './constants';

export const authService = {
  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
  
  // Get auth token
  getToken: () => {
    return localStorage.getItem('authToken');
  },
  
  // Set auth token and user
  setAuth: (token, user) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
  },
  
  // Clear auth
  clearAuth: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
  
  // Get user RBAC type (system permissions level) - NOT employee.role (job title)
  // employee.role is just professional job title (QA, Developer, etc.) - NOT used for permissions
  getUserType: () => {
    const user = authService.getCurrentUser();
    return user?.type || null; // RBAC level: 'hr', 'department_manager', 'team_manager', 'trainer', 'employee'
  },
  
  // Get user role (for backward compatibility, but should use getUserType instead)
  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user?.type || null; // Return type (RBAC level), not role (job title)
  },
  
  // Get employee professional role (job title) - NOT used for permissions
  getEmployeeRole: () => {
    const user = authService.getCurrentUser();
    return user?.employeeRole || null; // Professional job title (QA, Developer, etc.)
  },
  
  // Get user email
  getUserEmail: () => {
    const user = authService.getCurrentUser();
    return user?.email || null;
  },
  
  // Check if user has specific RBAC type (system permissions level)
  // IMPORTANT: This checks employee.type (RBAC), NOT employee.role (job title)
  hasType: (type) => {
    const userType = authService.getUserType();
    return userType === type;
  },
  
  // Check if user has any of the specified RBAC types
  hasAnyType: (types) => {
    const userType = authService.getUserType();
    return types.includes(userType);
  },
  
  // Check if user has specific role (for backward compatibility - uses type)
  hasRole: (role) => {
    return authService.hasType(role);
  },
  
  // Check if user has any of the specified roles (for backward compatibility - uses type)
  hasAnyRole: (roles) => {
    return authService.hasAnyType(roles);
  },
  
  // Check if user is admin
  isAdmin: () => {
    return authService.hasType(USER_ROLES.ADMIN);
  },
  
  // Check if user is HR
  isHR: () => {
    return authService.hasType(USER_ROLES.HR);
  },
  
  // Check if user is manager (department or team)
  isManager: () => {
    const userType = authService.getUserType();
    return userType === USER_ROLES.DEPARTMENT_MANAGER || userType === USER_ROLES.TEAM_MANAGER;
  },
  
  // Check if user is employee (regular employee, not manager/trainer)
  isEmployee: () => {
    return authService.hasType(USER_ROLES.EMPLOYEE);
  },
  
  // Check if user is trainer
  isTrainer: () => {
    return authService.hasType(USER_ROLES.TRAINER);
  },
};

export default authService;

