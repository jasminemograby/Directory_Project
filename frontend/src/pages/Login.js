// Login Page - Email-based authentication
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { apiService } from '../services/api';
import { authService } from '../utils/auth';
import { ROUTES, USER_ROLES } from '../utils/constants';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiService.login({ email });
      
      if (response.data && response.data.success) {
        const { token, user } = response.data.data;
        
        // Store auth data
        authService.setAuth(token, user);
        
        // Store employee ID for profile access
        localStorage.setItem('currentEmployeeId', user.id);
        if (user.companyId) {
          localStorage.setItem('companyId', user.companyId);
        }
        if (user.email) {
          localStorage.setItem('hrEmail', user.email);
        }

        // Redirect based on RBAC type (NOT role - role is just job title)
        // user.type is the RBAC level (system permissions)
        // user.employeeRole is just professional job title (QA, Developer, etc.) - NOT used for navigation
        const userType = user.type; // RBAC level: 'hr', 'department_manager', 'team_manager', 'trainer', 'employee'
        
        switch (userType) {
          case 'hr':
            navigate(ROUTES.HR_DASHBOARD);
            break;
          case 'trainer':
            navigate('/trainer/profile');
            break;
          case 'team_manager':
            navigate('/team-leader/profile');
            break;
          case 'department_manager':
            navigate('/department-manager/profile');
            break;
          case 'admin':
            navigate(ROUTES.ADMIN_DASHBOARD);
            break;
          case 'employee':
          default:
            navigate(ROUTES.PROFILE);
            break;
        }
      } else {
        setError(response.data?.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.response?.data?.error || 
        'Login failed. Please check your email and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="rounded-lg p-8" style={{ 
            backgroundColor: 'var(--bg-card)', 
            boxShadow: 'var(--shadow-card)', 
            borderColor: 'var(--bg-secondary)', 
            borderWidth: '1px', 
            borderStyle: 'solid' 
          }}>
            <h1 className="text-3xl font-bold mb-2 text-center" style={{ color: 'var(--text-primary)' }}>
              Login
            </h1>
            <p className="text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
              Enter your email to access your account
            </p>

            {error && (
              <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', borderWidth: '1px', borderStyle: 'solid' }}>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <Input
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@company.com"
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading || !email}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Don't have an account? Contact your HR to register your company.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;

