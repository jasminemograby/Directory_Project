// HR Dashboard Page
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import { ROUTES } from '../utils/constants';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';

const HRDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [company, setCompany] = useState(null);
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
          // Fetch by company ID
          response = await apiService.getCompany(companyId);
        } else {
          // Fetch by HR email
          const hrEmail = getHrEmail();
          response = await apiService.getCompanyByHrEmail(hrEmail);
          // Store company ID for future use
          if (response.data.success && response.data.data.id) {
            localStorage.setItem('companyId', response.data.data.id);
          }
        }

        if (response.data.success) {
          setCompany(response.data.data);
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-900 mb-2">No Company Found</h2>
          <p className="text-yellow-700">No company data found. Please register a company first.</p>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {company.hr?.name || 'HR'}</p>
      </div>

      {/* Company Overview Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Company Overview</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Company Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {company.name}</p>
              <p><span className="font-medium">Industry:</span> {company.industry || 'N/A'}</p>
              <p><span className="font-medium">Domain:</span> {company.domain || 'N/A'}</p>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  company.verification_status === 'verified' 
                    ? 'bg-green-100 text-green-800' 
                    : company.verification_status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {company.verification_status || 'pending'}
                </span>
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">HR Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {company.hr?.name || 'N/A'}</p>
              <p><span className="font-medium">Email:</span> {company.hr?.email || 'N/A'}</p>
              <p><span className="font-medium">Role:</span> {company.hr?.role || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{company.statistics?.departments || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Teams</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{company.statistics?.teams || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Employees</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{company.statistics?.employees || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Company Settings */}
      {company.settings && (company.settings.exerciseLimit || company.settings.passingGrade || company.settings.maxAttempts) && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Settings</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {company.settings.exerciseLimit && (
              <div>
                <p className="text-sm font-medium text-gray-600">Exercise Limit</p>
                <p className="text-lg font-semibold text-gray-900">{company.settings.exerciseLimit}</p>
              </div>
            )}
            {company.settings.passingGrade && (
              <div>
                <p className="text-sm font-medium text-gray-600">Passing Grade</p>
                <p className="text-lg font-semibold text-gray-900">{company.settings.passingGrade}%</p>
              </div>
            )}
            {company.settings.maxAttempts && (
              <div>
                <p className="text-sm font-medium text-gray-600">Max Attempts</p>
                <p className="text-lg font-semibold text-gray-900">{company.settings.maxAttempts}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Button
            variant="primary"
            onClick={() => {
              const hrEmployeeId = localStorage.getItem('hrEmployeeId') || localStorage.getItem('currentEmployeeId');
              if (hrEmployeeId) {
                navigate(`${ROUTES.EMPLOYEE_PROFILE}?employeeId=${hrEmployeeId}`);
              } else {
                navigate(ROUTES.EMPLOYEE_PROFILE);
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

