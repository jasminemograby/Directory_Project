// HR Dashboard Page
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import { authService } from '../utils/auth';
import { ROUTES } from '../utils/constants';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import PendingProfilesApproval from '../components/HR/PendingProfilesApproval';
import PendingRequestsApproval from '../components/HR/PendingRequestsApproval';
import HierarchyTree from '../components/Profile/HierarchyTree';
import EmployeeEnrollment from '../components/HR/EmployeeEnrollment';

const HRDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [company, setCompany] = useState(null);
  const [hierarchy, setHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Get company ID from localStorage or location state
  const getCompanyId = useCallback(() => {
    // Try location state first (from registration redirect)
    if (location.state?.companyId) {
      return location.state.companyId;
    }
    // Try localStorage
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId) {
      return storedCompanyId;
    }
    // Try to get from HR email
    const hrEmail = localStorage.getItem('hrEmail');
    if (hrEmail) {
      return null; // Will fetch by email
    }
    return null;
  }, [location.state]);

  // Get HR email
  const getHrEmail = useCallback(() => {
    return localStorage.getItem('hrEmail') || 'hr@example.com';
  }, []);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        setError(null);

        const companyId = getCompanyId();
        let response;

        if (companyId) {
          // Try to fetch by company ID first
          try {
            response = await apiService.getCompany(companyId);
          } catch (idError) {
            // If 404 by ID, try by HR email as fallback
            if (idError.response?.status === 404) {
              console.warn(`Company not found by ID ${companyId}, trying HR email fallback...`);
              const hrEmail = getHrEmail();
              if (hrEmail) {
                response = await apiService.getCompanyByHrEmail(hrEmail);
                // Update stored company ID if found by email
                if (response.data.success && response.data.data.id) {
                  localStorage.setItem('companyId', response.data.data.id);
                }
              } else {
                throw idError; // Re-throw if no HR email available
              }
            } else {
              throw idError; // Re-throw if not a 404 error
            }
          }
        } else {
          // Fetch by HR email
          const hrEmail = getHrEmail();
          if (!hrEmail) {
            throw new Error('No company ID or HR email available');
          }
          response = await apiService.getCompanyByHrEmail(hrEmail);
          // Store company ID for future use
          if (response.data.success && response.data.data.id) {
            localStorage.setItem('companyId', response.data.data.id);
          }
        }

        if (response.data.success) {
          setCompany(response.data.data);
          
          // Fetch company hierarchy
          const companyId = response.data.data.id;
          try {
            const hierarchyResponse = await apiService.getCompanyHierarchy(companyId);
            if (hierarchyResponse.data && hierarchyResponse.data.data) {
              setHierarchy(hierarchyResponse.data.data.hierarchy);
            }
          } catch (hierarchyError) {
            console.warn('Could not fetch company hierarchy:', hierarchyError.message);
          }
        } else {
          setError(response.data.error || 'Failed to load company data');
        }

        // Show success message if redirected from registration
        if (location.state?.message) {
          setSuccessMessage(location.state.message);
          // Clear message after 5 seconds
          setTimeout(() => setSuccessMessage(null), 5000);
        }
      } catch (err) {
        console.error('Error fetching company data:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        
        // If 404, maybe company doesn't exist yet - show helpful message
        if (err.response?.status === 404) {
          setError('Company not found. Please complete company registration first.');
        } else {
          setError(err.response?.data?.error || 'Failed to load company data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [location.state, getCompanyId, getHrEmail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="border border-red-300 rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <Button
            variant="primary"
            onClick={() => navigate(ROUTES.HOME)}
            className="mt-4"
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="border border-accent-orange rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
          <h2 className="text-xl font-semibold text-accent-orange mb-2">No Company Found</h2>
          <p style={{ color: 'var(--text-secondary)' }}>No company data found. Please register a company first.</p>
          <Button
            variant="primary"
            onClick={() => navigate(ROUTES.COMPANY_REGISTER_STEP1)}
            className="mt-4"
          >
            Register Company
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 border border-accent-green rounded-lg p-4" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
          <p className="text-accent-green font-medium">{successMessage}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>HR Dashboard</h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Welcome to {company.name || 'your company'}</p>
      </div>

      {/* Company Overview Card */}
      <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
        <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Company Overview</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Company Information</h3>
            <div className="space-y-2">
              <p style={{ color: 'var(--text-primary)' }}><span className="font-medium" style={{ color: 'var(--text-accent)' }}>Name:</span> {company.name}</p>
              <p style={{ color: 'var(--text-primary)' }}><span className="font-medium" style={{ color: 'var(--text-accent)' }}>Industry:</span> {company.industry || 'N/A'}</p>
              <p style={{ color: 'var(--text-primary)' }}><span className="font-medium" style={{ color: 'var(--text-accent)' }}>Domain:</span> {company.domain || 'N/A'}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>HR Information</h3>
            <div className="space-y-2">
              <p style={{ color: 'var(--text-primary)' }}><span className="font-medium" style={{ color: 'var(--text-accent)' }}>Name:</span> {company.hr?.name || 'N/A'}</p>
              <p style={{ color: 'var(--text-primary)' }}><span className="font-medium" style={{ color: 'var(--text-accent)' }}>Email:</span> {company.hr?.email || 'N/A'}</p>
              <p style={{ color: 'var(--text-primary)' }}><span className="font-medium" style={{ color: 'var(--text-accent)' }}>Role:</span> {company.hr?.role || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="rounded-lg p-6 transition-all" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-hover)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Departments</p>
              <p className="text-3xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{company.statistics?.departments || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-glow)' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg p-6 transition-all" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-hover)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Teams</p>
              <p className="text-3xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{company.statistics?.teams || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-secondary)', boxShadow: 'var(--shadow-glow)' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg p-6 transition-all" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-hover)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Employees</p>
              <p className="text-3xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{company.statistics?.employees || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-accent)', boxShadow: 'var(--shadow-glow)' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Company Settings */}
      {company.settings && (company.settings.exerciseLimit || company.settings.passingGrade || company.settings.maxAttempts) && (
        <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Company Settings</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {company.settings.exerciseLimit && (
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Exercise Limit</p>
                <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{company.settings.exerciseLimit}</p>
              </div>
            )}
            {company.settings.passingGrade && (
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Passing Grade</p>
                <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{company.settings.passingGrade}%</p>
              </div>
            )}
            {company.settings.maxAttempts && (
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Max Attempts</p>
                <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{company.settings.maxAttempts}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Employee Enrollment Section */}
      {company && company.id && (
        <div className="mb-6">
          <EmployeeEnrollment companyId={company.id} />
        </div>
      )}

      {/* Hierarchy Tree */}
      {hierarchy && (
        <div className="mb-6">
          <HierarchyTree
            hierarchy={hierarchy}
            onEmployeeClick={(employeeId) => {
              navigate(`${ROUTES.PROFILE}/${employeeId}`);
            }}
          />
        </div>
      )}

      {/* Pending Profiles Approval Section */}
      <div className="mb-6">
        <PendingProfilesApproval />
      </div>

      {/* Pending Requests Approval Section */}
      <div className="mb-6">
        <PendingRequestsApproval />
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Button
            variant="primary"
            onClick={async () => {
              // Get HR employee ID from company data or localStorage
              let hrEmployeeId = null;
              
              // First, try to get from company data (most reliable)
              if (company && company.hr && company.hr.id) {
                hrEmployeeId = company.hr.id;
              } else {
                // Fallback to localStorage
                hrEmployeeId = localStorage.getItem('hrEmployeeId') || localStorage.getItem('currentEmployeeId');
              }
              
              // If still no ID, try to fetch from API using HR email
              if (!hrEmployeeId) {
                try {
                  const hrEmail = localStorage.getItem('hrEmail') || authService.getUserEmail();
                  if (hrEmail && company && company.id) {
                    // Fetch HR employee by email and company
                    const response = await apiService.getEmployees({ company_id: company.id });
                    if (response.data && response.data.data && response.data.data.employees) {
                      const hrEmployee = response.data.data.employees.find(
                        emp => emp.email && emp.email.toLowerCase() === hrEmail.toLowerCase()
                      );
                      if (hrEmployee) {
                        hrEmployeeId = hrEmployee.id;
                        localStorage.setItem('hrEmployeeId', hrEmployeeId);
                        localStorage.setItem('currentEmployeeId', hrEmployeeId);
                      }
                    }
                  }
                } catch (err) {
                  console.warn('Could not fetch HR employee ID:', err);
                }
              }
              
              if (hrEmployeeId) {
                // Navigate to profile with employee ID in URL
                // ROUTES.PROFILE is '/profile/:employeeId', so we need to replace :employeeId
                const profileUrl = ROUTES.PROFILE.replace(':employeeId', hrEmployeeId);
                console.log('[HRDashboard] Navigating to profile:', profileUrl, 'with employee ID:', hrEmployeeId);
                navigate(profileUrl);
                // Also update localStorage to ensure consistency
                localStorage.setItem('currentEmployeeId', hrEmployeeId);
                localStorage.setItem('hrEmployeeId', hrEmployeeId);
              } else {
                // Fallback: try to navigate to profile/me or show error
                console.warn('[HRDashboard] No HR employee ID found, trying profile/me');
                navigate(ROUTES.PROFILE_ME || ROUTES.EMPLOYEE_PROFILE);
              }
            }}
          >
            View My Profile
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(ROUTES.COMPANY_REGISTER_STEP1)}
          >
            Register Another Company
          </Button>
          <Button
            variant="tertiary"
            onClick={() => navigate(ROUTES.HOME)}
          >
            Back to Home
          </Button>
        </div>
      </div>

    </div>
  );
};

export default HRDashboard;

