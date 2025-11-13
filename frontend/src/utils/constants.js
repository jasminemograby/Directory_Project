// Application Constants

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  VERIFY_EMAIL: '/verify-email/:token',
  HR_LANDING: '/hr/landing',
  
  // Company Registration
  COMPANY_REGISTER_STEP1: '/company/register/step1',
  COMPANY_REGISTER_VERIFICATION: '/company/register/verification',
  COMPANY_REGISTER_RESULT: '/company/register/verification-result',
  COMPANY_REGISTER_STEP3: '/company/register/step3',
  // Keep STEP4 for backward compatibility
  COMPANY_REGISTER_STEP4: '/company/register/step3',
  
  // Dashboards
  ADMIN_DASHBOARD: '/admin/dashboard',
  HR_DASHBOARD: '/hr/dashboard',
  MANAGER_DASHBOARD: '/manager/dashboard',
  EMPLOYEE_DASHBOARD: '/employee/dashboard',
  TRAINER_DASHBOARD: '/trainer/dashboard',
  
  // Profiles
  PROFILE: '/profile/:employeeId',
  PROFILE_ME: '/profile/me',
  PROFILE_EDIT: '/profile/:employeeId/edit',
  PROFILE_EDIT_ME: '/profile/me/edit',
  EMPLOYEE_PROFILE: '/profile',
  
  // Requests
  REQUESTS_LEARNING: '/requests/learning',
  REQUESTS_LEARNING_NEW: '/requests/learning/new',
  REQUESTS_TRAINER: '/requests/trainer',
  REQUESTS_TRAINER_NEW: '/requests/trainer/new',
  REQUESTS_ENRICHMENT: '/requests/enrichment',
  REQUESTS_EXTRA_ATTEMPTS: '/requests/extra-attempts',
  
  // Learning Path
  LEARNING_PATH: '/learning-path/:employeeId',
  LEARNING_PATH_ME: '/learning-path/me',
  LEARNING_PATH_REQUESTS: '/learning-path/requests',
  
  // Skills
  SKILLS_VERIFY: '/skills/verify',
  SKILLS_VERIFY_STATUS: '/skills/verify/status',
  
  // Company Management
  COMPANY_PROFILE: '/company/:companyId',
  COMPANY_SETTINGS: '/company/:companyId/settings',
  COMPANY_EMPLOYEES_NEW: '/company/:companyId/employees/new',
  
  // Admin
  ADMIN_LOGS: '/admin/logs',
  ADMIN_CRITICAL_REQUESTS: '/admin/critical-requests',
  ADMIN_CONFIG: '/admin/config',
  
  // HR
  HR_PROFILE: '/hr/profile',
  HR_PROFILE_APPROVALS: '/hr/profile-approvals',
  
  // Error pages
  ERROR_404: '/404',
  ERROR_403: '/403',
  ERROR_500: '/500',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  DEPARTMENT_MANAGER: 'department_manager',
  TEAM_MANAGER: 'team_manager',
  EMPLOYEE: 'employee',
  TRAINER: 'trainer',
};

export const EMPLOYEE_TYPES = {
  REGULAR: 'regular',
  INTERNAL_INSTRUCTOR: 'internal_instructor',
  EXTERNAL_INSTRUCTOR: 'external_instructor',
};

export const PROFILE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

export const TRAINER_STATUS = {
  INVITED: 'invited',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
};

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const LEARNING_PATH_POLICY = {
  MANUAL: 'manual',
  AUTO: 'auto',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const API_ENDPOINTS = {
  // Health
  HEALTH: '/health',
  
  // Company
  COMPANY_REGISTER: '/company/register',
  COMPANY_VERIFY: '/company/verify',
  COMPANY_LIST: '/company',
  COMPANY_GET: '/company/:id',
  COMPANY_UPDATE: '/company/:id',
  
  // Employee
  EMPLOYEE_LIST: '/employee',
  EMPLOYEE_GET: '/employee/:id',
  EMPLOYEE_UPDATE: '/employee/:id',
  EMPLOYEE_CREATE: '/employee',
  
  // Profile
  PROFILE_GET: '/profile/:id',
  PROFILE_UPDATE: '/profile/:id',
  PROFILE_APPROVE: '/profile/:id/approve',
  
  // Skills
  SKILLS_VERIFY: '/skills/verify',
  SKILLS_UPDATE: '/skills/update',
  
  // Requests
  REQUESTS_LEARNING: '/requests/learning',
  REQUESTS_EXTRA_ATTEMPTS: '/requests/extra-attempts',
  REQUESTS_APPROVE: '/requests/:id/approve',
  
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_SIGNUP: '/auth/signup',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_VERIFY: '/auth/verify',
};

