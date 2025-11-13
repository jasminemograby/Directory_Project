// Layout Component with Navigation
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { authService } from '../../utils/auth';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Get user email from multiple sources (priority order):
  // 1. Auth service (if logged in)
  // 2. localStorage (from company registration)
  // 3. Fallback for testing
  const getUserEmail = () => {
    // Try auth service first
    const authEmail = authService.getUserEmail();
    if (authEmail) return authEmail;
    
    // Try localStorage (from company registration)
    const storedHrEmail = localStorage.getItem('hrEmail');
    if (storedHrEmail) return storedHrEmail;
    
    // Fallback for testing
    return 'hr@example.com';
  };
  
  const userEmail = getUserEmail();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo / Brand */}
            <div className="flex items-center">
              <Link to={ROUTES.HOME} className="flex items-center space-x-2">
                <span className="text-xl font-bold text-green-600">Directory</span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to={ROUTES.HOME}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === ROUTES.HOME
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>
              <Link
                to={ROUTES.COMPANY_REGISTER_STEP1}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/company/register')
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                }`}
              >
                Register Company
              </Link>
            </div>

                  {/* Right Side - User */}
                  <div className="flex items-center space-x-4">
                    {/* User Menu (placeholder) */}
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {userEmail.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden md:block text-sm text-gray-700">{userEmail}</span>
                    </div>
                  </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;

