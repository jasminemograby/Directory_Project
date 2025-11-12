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
  
  // Get user role
  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user?.role || null;
  },
  
  // Get user email
  getUserEmail: () => {
    const user = authService.getCurrentUser();
    return user?.email || null;
  },
  
  // Check if user has specific role
  hasRole: (role) => {
    const userRole = authService.getUserRole();
    return userRole === role;
  },
  
  // Check if user has any of the specified roles
  hasAnyRole: (roles) => {
    const userRole = authService.getUserRole();
    return roles.includes(userRole);
  },
  
  // Check if user is admin
  isAdmin: () => {
    return authService.hasRole(USER_ROLES.ADMIN);
  },
  
  // Check if user is HR
  isHR: () => {
    return authService.hasRole(USER_ROLES.HR);
  },
  
  // Check if user is manager
  isManager: () => {
    const userRole = authService.getUserRole();
    return userRole === USER_ROLES.DEPARTMENT_MANAGER || userRole === USER_ROLES.TEAM_MANAGER;
  },
  
  // Check if user is employee
  isEmployee: () => {
    return authService.hasRole(USER_ROLES.EMPLOYEE);
  },
  
  // Check if user is trainer
  isTrainer: () => {
    return authService.hasRole(USER_ROLES.TRAINER);
  },
};

export default authService;

