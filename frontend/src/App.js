// Main App Component
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';
import { ROUTES, USER_ROLES } from './utils/constants';

// Pages
import Error404 from './pages/Error404';
import Error403 from './pages/Error403';
import Error500 from './pages/Error500';
import HRLanding from './pages/HRLanding';

// Company Registration Components
import CompanyRegistrationStep1 from './components/CompanyRegistration/CompanyRegistrationStep1';
import CompanyRegistrationVerification from './components/CompanyRegistration/CompanyRegistrationVerification';
import CompanyRegistrationStep4 from './components/CompanyRegistration/CompanyRegistrationStep4';

// Home page - merged with HR Landing
const Home = () => <HRLanding />;

const Login = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Page</h1>
      <p className="text-gray-600">Login functionality coming soon</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.HR_LANDING} element={<HRLanding />} />
          
          {/* Company Registration Routes */}
          <Route path={ROUTES.COMPANY_REGISTER_STEP1} element={<CompanyRegistrationStep1 />} />
          <Route path={ROUTES.COMPANY_REGISTER_VERIFICATION} element={<CompanyRegistrationVerification />} />
          <Route path={ROUTES.COMPANY_REGISTER_STEP3} element={<CompanyRegistrationStep4 />} />
          {/* Keep step4 route for backward compatibility, redirect to step3 */}
          <Route path={ROUTES.COMPANY_REGISTER_STEP4} element={<Navigate to={ROUTES.COMPANY_REGISTER_STEP3} replace />} />
          {/* Keep result route for backward compatibility, redirect to step3 */}
          <Route path={ROUTES.COMPANY_REGISTER_RESULT} element={<Navigate to={ROUTES.COMPANY_REGISTER_STEP3} replace />} />
          
          {/* Error Pages */}
          <Route path={ROUTES.ERROR_404} element={<Error404 />} />
          <Route path={ROUTES.ERROR_403} element={<Error403 />} />
          <Route path={ROUTES.ERROR_500} element={<Error500 />} />
          
          {/* Protected Routes - Placeholders */}
          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <p className="text-gray-600">Coming soon</p>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          
          {/* Catch all - 404 */}
          <Route path="*" element={<Navigate to={ROUTES.ERROR_404} replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
