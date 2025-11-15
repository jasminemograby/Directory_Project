// API Service Layer
import axios from 'axios';
import { API_BASE_URL, HTTP_STATUS } from '../utils/constants';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log API_BASE_URL in development (for debugging)
if (process.env.NODE_ENV === 'development' || !process.env.REACT_APP_API_URL) {
  console.log('[API] API_BASE_URL:', API_BASE_URL);
  console.log('[API] REACT_APP_API_URL env:', process.env.REACT_APP_API_URL || 'not set');
}

// Request interceptor - Add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log request URL in development (for debugging)
    if (process.env.NODE_ENV === 'development' || !process.env.REACT_APP_API_URL) {
      console.log('[API] Request:', config.method?.toUpperCase(), config.url, 'Full URL:', config.baseURL + config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case HTTP_STATUS.UNAUTHORIZED:
          // Clear token and redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case HTTP_STATUS.FORBIDDEN:
          // Redirect to 403 page
          window.location.href = '/403';
          break;
        case HTTP_STATUS.NOT_FOUND:
          // Don't auto-redirect to 404 - let components handle it
          // Only redirect if it's a route-level 404, not API 404
          // window.location.href = '/404';
          break;
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          // Log error and show message
          console.error('Server error:', data);
          break;
        default:
          console.error('API error:', data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API Methods
export const apiService = {
  // Health check
  healthCheck: () => api.get('/health'),
  
  // Company endpoints
        registerCompany: (data) => {
          if (data.step === 1) {
            return api.post('/company/register', data);
          } else if (data.step === 3 || data.step === 4) {
            // Support both step3 and step4 for backward compatibility
            return api.post('/company/register/step4', data);
          }
          throw new Error('Invalid registration step');
        },
  verifyCompany: (companyId, data) => api.post(`/company/${companyId}/verify`, data),
  getCompany: (companyId, hrEmail) => {
    if (hrEmail) {
      return api.get('/company', { params: { hrEmail } });
    }
    return api.get(`/company/${companyId}`);
  },
  getCompanyByHrEmail: (hrEmail) => api.get('/company', { params: { hrEmail } }),
  updateCompany: (companyId, data) => api.put(`/company/${companyId}`, data),
  getCompanyHierarchy: (companyId) => 
    api.get(`/company/${companyId}/hierarchy`),
  getCompanyRequests: (companyId) => 
    api.get(`/company/${companyId}/requests`),
  
  // Admin endpoints (Super Admin only)
  getCompanies: (params) => api.get('/admin/companies', { params }),
  getAllEmployees: (params) => api.get('/admin/employees', { params }),
  getAdminLogs: (params) => api.get('/admin/logs', { params }),
  
  // Employee endpoints
  getEmployee: (employeeId) => api.get(`/employee/${employeeId}`),
  updateEmployee: (employeeId, data) => api.put(`/employee/${employeeId}`, data),
  createEmployee: (data) => api.post('/employee', data),
  getEmployees: (params) => api.get('/employee', { params }),
  
  // Profile endpoints
  getProfile: (employeeId) => api.get(`/profile/${employeeId}`),
  updateProfile: (employeeId, data) => api.put(`/profile/${employeeId}`, data),
  
  // Profile Approval endpoints (HR only)
  getPendingProfiles: (hrEmail) => api.get('/profile-approval/pending', { params: { hrEmail } }),
  getProfileForApproval: (employeeId) => api.get(`/profile-approval/${employeeId}/review`),
  approveProfile: (employeeId, notes) => api.post(`/profile-approval/${employeeId}/approve`, { notes }),
  rejectProfile: (employeeId, reason) => api.post(`/profile-approval/${employeeId}/reject`, { reason }),
  
  // Requests endpoints
  createTrainingRequest: (employeeId, data) => api.post(`/requests/training/${employeeId}`, data),
  createSkillVerificationRequest: (employeeId, data) => api.post(`/requests/skill-verification/${employeeId}`, data),
  createSelfLearningRequest: (employeeId, data) => api.post(`/requests/self-learning/${employeeId}`, data),
  createExtraAttemptRequest: (employeeId, data) => api.post(`/requests/extra-attempt/${employeeId}`, data),
  getEmployeeRequests: (employeeId) => api.get(`/requests/employee/${employeeId}`),
  getPendingRequests: (hrEmail) => api.get('/requests/pending', { params: { hrEmail } }),
  updateTrainingRequest: (requestId, status, notes) => api.put(`/requests/training/${requestId}`, { status, notes }),
  updateSkillVerificationRequest: (requestId, status, notes) => api.put(`/requests/skill-verification/${requestId}`, { status, notes }),
  updateSelfLearningRequest: (requestId, status, notes) => api.put(`/requests/self-learning/${requestId}`, { status, notes }),
  updateExtraAttemptRequest: (requestId, status, notes) => api.put(`/requests/extra-attempt/${requestId}`, { status, notes }),
  
  // Skills endpoints
  verifySkills: (data) => api.post('/skills/verify', data),
  updateSkills: (employeeId, data) => api.put(`/skills/${employeeId}`, data),
  
  // Request endpoints (alternative naming)
  createLearningRequest: (data) => api.post('/requests/learning', data),
  getLearningRequests: (params) => api.get('/requests/learning', { params }),
  createExtraAttemptRequestAlt: (data) => api.post('/requests/extra-attempts', data),
  getExtraAttemptRequests: (params) => api.get('/requests/extra-attempts', { params }),
  approveRequest: (requestId, data) => api.post(`/requests/${requestId}/approve`, data),
  
  // Auth endpoints
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  logout: () => api.post('/auth/logout'),
  verifyEmail: (token) => api.post('/auth/verify', { token }),
  
  // External Data endpoints (LinkedIn, GitHub)
  initiateLinkedInAuth: (employeeId) => api.get(`/external/linkedin/authorize/${employeeId}`),
  initiateGitHubAuth: (employeeId) => api.get(`/external/github/authorize/${employeeId}`),
  fetchLinkedInData: (employeeId) => api.get(`/external/linkedin/data/${employeeId}`),
  fetchGitHubData: (employeeId) => api.get(`/external/github/data/${employeeId}`),
  collectAllExternalData: (employeeId) => api.post(`/external/collect/${employeeId}`),
  getProcessedData: (employeeId) => api.get(`/external/processed/${employeeId}`),
  getConnectionStatus: (employeeId) => api.get(`/external/status/${employeeId}`),
  disconnectProvider: (employeeId, provider) => api.delete(`/external/disconnect/${employeeId}/${provider}`),

  // Profile endpoints
  getEmployeeProfile: (employeeId) => api.get(`/profile/employee/${employeeId}`),
  getValueProposition: (employeeId) => api.get(`/profile/employee/${employeeId}/value-proposition`),
  getCompletedCourses: (employeeId) => api.get(`/profile/employee/${employeeId}/courses/completed`),
  getTaughtCourses: (trainerId) => api.get(`/profile/trainer/${trainerId}/courses/taught`),
  getAssignedCourses: (employeeId) => api.get(`/profile/employee/${employeeId}/courses/assigned`),
  getLearningCourses: (employeeId) => api.get(`/profile/employee/${employeeId}/courses/learning`),
  
  // Notifications endpoints
  getNotifications: (userEmail, params = {}) => 
    api.get('/notifications', { params: { user_email: userEmail, ...params } }),
  getUnreadCount: (userEmail) => 
    api.get('/notifications/unread-count', { params: { user_email: userEmail } }),
  markNotificationAsRead: (notificationId, userEmail) => 
    api.patch(`/notifications/${notificationId}/read`, { user_email: userEmail }),
  markAllNotificationsAsRead: (userEmail) => 
    api.patch('/notifications/mark-all-read', { user_email: userEmail }),
  deleteNotification: (notificationId, userEmail) => 
    api.delete(`/notifications/${notificationId}`, { data: { user_email: userEmail } }),
  
  // Employee Enrollment endpoints
  enrollEmployeesToLearningPath: (data) => api.post('/enrollment/learning-path', data),
};

export default api;

