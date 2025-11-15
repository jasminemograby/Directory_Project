// Layout Component with Navigation
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { authService } from '../../utils/auth';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Get user email only if actually logged in
  const getUserEmail = () => {
    // Check if user is actually authenticated
    const token = authService.getToken();
    if (!token) return null;
    
    // Try auth service first
    const authEmail = authService.getUserEmail();
    if (authEmail) return authEmail;
    
    // Try localStorage (from company registration) only if authenticated
    const storedHrEmail = localStorage.getItem('hrEmail');
    if (storedHrEmail) return storedHrEmail;
    
    return null;
  };
  
  const userEmail = getUserEmail();
  const isAuthenticated = !!userEmail;

  // Don't show Layout navigation on landing page or company registration pages - they have their own header
  const isLandingPage = location.pathname === ROUTES.HOME || location.pathname === ROUTES.HR_LANDING;
  const isCompanyRegistration = location.pathname.startsWith('/company/register');
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-body)' }}>
      {/* Navigation Bar - only show if not landing page or company registration (Header is now global) */}
      {!isLandingPage && !isCompanyRegistration && (
      <nav className="shadow-sm border-b" style={{
        marginTop: '64px', // Space for global header 
        backgroundColor: 'var(--bg-card)', 
        borderColor: 'var(--border-default)' 
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo / Brand */}
            <div className="flex items-center">
              <Link to={ROUTES.HOME} className="flex items-center space-x-2">
                <span className="text-xl font-bold" style={{ color: 'var(--primary-base)' }}>Directory</span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to={ROUTES.HOME}
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  color: location.pathname === ROUTES.HOME 
                    ? 'var(--primary-base)' 
                    : 'var(--text-primary)',
                  backgroundColor: location.pathname === ROUTES.HOME 
                    ? 'var(--bg-section)' 
                    : 'transparent'
                }}
              >
                Home
              </Link>
              <Link
                to={ROUTES.COMPANY_REGISTER_STEP1}
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  color: location.pathname.startsWith('/company/register')
                    ? 'var(--primary-base)'
                    : 'var(--text-primary)',
                  backgroundColor: location.pathname.startsWith('/company/register')
                    ? 'var(--bg-section)'
                    : 'transparent'
                }}
              >
                Register Company
              </Link>
            </div>

                  {/* Right Side - User (only if authenticated AND has valid token) */}
                  {isAuthenticated && authService.getToken() && userEmail && (
                    <div className="flex items-center space-x-4">
                      {/* User Menu */}
                      <div className="flex items-center space-x-2">
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--gradient-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 500
                        }}>
                          {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <span className="hidden md:block text-sm" style={{ color: 'var(--text-primary)' }}>{userEmail}</span>
                      </div>
                    </div>
                  )}
          </div>
        </div>
      </nav>
      )}

      {/* Main Content */}
      <main className={isLandingPage ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {children}
      </main>
    </div>
  );
};

export default Layout;

