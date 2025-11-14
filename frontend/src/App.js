// Main App Component
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import { AppProvider } from './contexts/AppContext';
import { ROUTES, USER_ROLES } from './utils/constants';

// Pages
import Error404 from './pages/Error404';
import Error403 from './pages/Error403';
import Error500 from './pages/Error500';
import Login from './pages/Login';
import HRLanding from './pages/HRLanding';
import HRDashboard from './pages/HRDashboard';
import EmployeeProfile from './pages/EmployeeProfile';
import TrainerProfile from './pages/TrainerProfile';
import TeamLeaderProfile from './pages/TeamLeaderProfile';
import DepartmentManagerProfile from './pages/DepartmentManagerProfile';
import CompanyProfile from './pages/CompanyProfile';
import SuperAdminProfile from './pages/SuperAdminProfile';
import ProfileEdit from './pages/ProfileEdit';

// Company Registration Components
import CompanyRegistrationStep1 from './components/CompanyRegistration/CompanyRegistrationStep1';
import CompanyRegistrationVerification from './components/CompanyRegistration/CompanyRegistrationVerification';
import CompanyRegistrationStep4 from './components/CompanyRegistration/CompanyRegistrationStep4';

// Home page - merged with HR Landing
const Home = () => (
  <Layout>
    <HRLanding />
  </Layout>
);


function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <Router>
          <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.HR_LANDING} element={
            <Layout>
              <HRLanding />
            </Layout>
          } />
          
          {/* HR Dashboard */}
          <Route path={ROUTES.HR_DASHBOARD} element={
            <Layout>
              <HRDashboard />
            </Layout>
          } />
          
          {/* Employee Profile */}
          <Route path={ROUTES.EMPLOYEE_PROFILE} element={<EmployeeProfile />} />
          <Route path={ROUTES.PROFILE} element={<EmployeeProfile />} />
          <Route path={ROUTES.PROFILE_ME} element={<EmployeeProfile />} />
          
          {/* Profile Edit */}
          <Route path={ROUTES.PROFILE_EDIT_ME} element={<ProfileEdit />} />
          <Route path={ROUTES.PROFILE_EDIT} element={<ProfileEdit />} />
          
          {/* Trainer Profile */}
          <Route path="/trainer/profile/:employeeId?" element={<TrainerProfile />} />
          <Route path="/trainer/profile" element={<TrainerProfile />} />
          
          {/* Team Leader Profile */}
          <Route path="/team-leader/profile/:employeeId?" element={<TeamLeaderProfile />} />
          <Route path="/team-leader/profile" element={<TeamLeaderProfile />} />
          
          {/* Department Manager Profile */}
          <Route path="/department-manager/profile/:employeeId?" element={<DepartmentManagerProfile />} />
          <Route path="/department-manager/profile" element={<DepartmentManagerProfile />} />
          
          {/* Company Profile */}
          <Route path={ROUTES.COMPANY_PROFILE} element={<CompanyProfile />} />
          
          {/* Super Admin Profile */}
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<SuperAdminProfile />} />
          
          {/* Company Registration Routes */}
          <Route path={ROUTES.COMPANY_REGISTER_STEP1} element={
            <Layout>
              <CompanyRegistrationStep1 />
            </Layout>
          } />
          <Route path={ROUTES.COMPANY_REGISTER_VERIFICATION} element={
            <Layout>
              <CompanyRegistrationVerification />
            </Layout>
          } />
          <Route path={ROUTES.COMPANY_REGISTER_STEP3} element={
            <Layout>
              <CompanyRegistrationStep4 />
            </Layout>
          } />
          {/* Keep step4 route for backward compatibility, redirect to step3 */}
          <Route path={ROUTES.COMPANY_REGISTER_STEP4} element={<Navigate to={ROUTES.COMPANY_REGISTER_STEP3} replace />} />
          {/* Keep result route for backward compatibility, redirect to step3 */}
          <Route path={ROUTES.COMPANY_REGISTER_RESULT} element={<Navigate to={ROUTES.COMPANY_REGISTER_STEP3} replace />} />
          
          {/* Error Pages */}
          <Route path={ROUTES.ERROR_404} element={<Error404 />} />
          <Route path={ROUTES.ERROR_403} element={<Error403 />} />
          <Route path={ROUTES.ERROR_500} element={<Error500 />} />
          
          {/* Super Admin Dashboard */}
          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={
              <Layout>
                <SuperAdminProfile />
              </Layout>
            }
          />
          
          {/* Catch all - 404 */}
          <Route path="*" element={<Navigate to={ROUTES.ERROR_404} replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
    </AppProvider>
  );
}

export default App;
