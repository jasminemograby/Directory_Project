// Company Profile Page - HR view with overview, KPIs, hierarchy, requests, employee list
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import HierarchyTree from '../components/Profile/HierarchyTree';
import Button from '../components/common/Button';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES } from '../utils/constants';

const CompanyProfile = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [hierarchy, setHierarchy] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentCompanyId = companyId || localStorage.getItem('companyId');

  const fetchCompanyData = useCallback(async () => {
    if (!currentCompanyId) {
      setError('Please set a company ID.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch company data
      const companyResponse = await apiService.getCompany(currentCompanyId);
      if (companyResponse.data && companyResponse.data.data) {
        setCompany(companyResponse.data.data);
      } else {
        // Try fetching by HR email
        const hrEmail = localStorage.getItem('hrEmail');
        if (hrEmail) {
          const companyByEmailResponse = await apiService.getCompany(null, hrEmail);
          if (companyByEmailResponse.data && companyByEmailResponse.data.data) {
            setCompany(companyByEmailResponse.data.data);
          }
        }
      }

      // Fetch company hierarchy
      try {
        const hierarchyResponse = await apiService.getCompanyHierarchy(currentCompanyId);
        if (hierarchyResponse.data && hierarchyResponse.data.data) {
          setHierarchy(hierarchyResponse.data.data.hierarchy);
        }
      } catch (hierarchyError) {
        console.warn('Could not fetch company hierarchy:', hierarchyError.message);
      }

      // Fetch employees list
      try {
        const employeesResponse = await apiService.getEmployees({ company_id: currentCompanyId });
        if (employeesResponse.data && employeesResponse.data.data) {
          setEmployees(employeesResponse.data.data.employees || []);
        }
      } catch (employeesError) {
        console.warn('Could not fetch employees:', employeesError.message);
      }

      // Fetch pending requests
      try {
        // TODO: Replace with actual API call
        // const requestsResponse = await apiService.getCompanyRequests(currentCompanyId);
        // setRequests(requestsResponse.data.data.requests || []);
        setRequests([]); // Mock for now
      } catch (requestsError) {
        console.warn('Could not fetch requests:', requestsError.message);
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      if (error.response?.status === 404) {
        setError('Company profile not found.');
      } else {
        setError('Failed to load company profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentCompanyId]);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-6">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error || !company) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-6">
          <div className="rounded-lg p-6 border border-red-200" style={{ backgroundColor: '#fee2e2' }}>
            <p className="text-red-800 font-medium">{error || 'Company profile not found.'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Company Profile</h1>

        {/* Overview Section */}
        <div className="rounded-lg p-6 mb-6" style={{ 
          backgroundColor: 'var(--bg-card)', 
          boxShadow: 'var(--shadow-card)', 
          borderColor: 'var(--bg-secondary)', 
          borderWidth: '1px', 
          borderStyle: 'solid' 
        }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Company Overview</h2>
            <Button
              variant="primary"
              onClick={() => navigate(ROUTES.HR_DASHBOARD)}
            >
              HR Dashboard
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Company Information</h3>
              <div className="space-y-2">
                <p style={{ color: 'var(--text-primary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-accent)' }}>Name:</span> {company.name}
                </p>
                <p style={{ color: 'var(--text-primary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-accent)' }}>Industry:</span> {company.industry || 'N/A'}
                </p>
                <p style={{ color: 'var(--text-primary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-accent)' }}>Domain:</span> {company.domain || 'N/A'}
                </p>
                <p style={{ color: 'var(--text-primary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-accent)' }}>Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                    company.verification_status === 'verified' 
                      ? 'bg-accent-green text-white' 
                      : company.verification_status === 'pending'
                      ? 'bg-accent-orange text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {company.verification_status || 'pending'}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Primary KPIs</h3>
              <div className="space-y-2">
                {company.primary_kpi ? (
                  <p style={{ color: 'var(--text-primary)' }}>{company.primary_kpi}</p>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>No KPIs defined yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Departments</p>
              <p className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
                {company.statistics?.departments || 0}
              </p>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Teams</p>
              <p className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
                {company.statistics?.teams || 0}
              </p>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Employees</p>
              <p className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
                {company.statistics?.employees || employees.length || 0}
              </p>
            </div>
          </div>

          {/* Approval Mode */}
          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--bg-secondary)' }}>
            <p style={{ color: 'var(--text-primary)' }}>
              <span className="font-medium" style={{ color: 'var(--text-accent)' }}>Learning Path Approval:</span>
              <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                company.learning_path_approval_policy === 'auto' 
                  ? 'bg-accent-green text-white' 
                  : 'bg-accent-orange text-white'
              }`}>
                {company.learning_path_approval_policy === 'auto' ? 'Auto-Approval' : 'Manual Approval'}
              </span>
            </p>
            {company.decision_makers && company.decision_makers.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Decision Makers:</p>
                <div className="flex flex-wrap gap-2">
                  {company.decision_makers.map((dm, idx) => (
                    <span key={idx} className="px-2 py-1 rounded text-sm" style={{ 
                      backgroundColor: 'var(--bg-tertiary)', 
                      color: 'var(--text-primary)' 
                    }}>
                      {dm.name || dm.email}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

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

        {/* Requests Section */}
        <div className="rounded-lg p-6 mb-6" style={{ 
          backgroundColor: 'var(--bg-card)', 
          boxShadow: 'var(--shadow-card)', 
          borderColor: 'var(--bg-secondary)', 
          borderWidth: '1px', 
          borderStyle: 'solid' 
        }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Pending Requests</h2>
          
          {requests && requests.length > 0 ? (
            <div className="space-y-2">
              {requests.map((request, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded border"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--bg-tertiary)'
                  }}
                >
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {request.type || 'Request'}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {request.description || request.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No pending requests.</p>
          )}
        </div>

        {/* Employee List */}
        <div className="rounded-lg p-6" style={{ 
          backgroundColor: 'var(--bg-card)', 
          boxShadow: 'var(--shadow-card)', 
          borderColor: 'var(--bg-secondary)', 
          borderWidth: '1px', 
          borderStyle: 'solid' 
        }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Employees</h2>
            <Button
              variant="primary"
              onClick={() => navigate(`${ROUTES.COMPANY_EMPLOYEES_NEW.replace(':companyId', currentCompanyId)}`)}
            >
              Add Employee
            </Button>
          </div>

          {employees && employees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--bg-secondary)' }}>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Name</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Email</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Role Type</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Status</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Skills Summary</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr 
                      key={employee.id}
                      className="hover:bg-opacity-50 cursor-pointer transition-colors"
                      style={{ 
                        borderBottom: '1px solid var(--bg-secondary)',
                        backgroundColor: 'transparent'
                      }}
                      onClick={() => navigate(`${ROUTES.PROFILE}/${employee.id}`)}
                    >
                      <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>{employee.name}</td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{employee.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs" style={{ 
                          backgroundColor: 'var(--bg-tertiary)', 
                          color: 'var(--text-primary)' 
                        }}>
                          {employee.type === 'internal_instructor' ? 'Internal Instructor' : 
                           employee.type === 'external_instructor' ? 'External Instructor' : 
                           'Regular'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          employee.profile_status === 'approved' 
                            ? 'bg-accent-green text-white' 
                            : employee.profile_status === 'pending'
                            ? 'bg-accent-orange text-white'
                            : 'bg-gray-400 text-white'
                        }`}>
                          {employee.profile_status || 'pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                        {employee.skills_summary || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`${ROUTES.PROFILE}/${employee.id}`);
                          }}
                        >
                          View Profile
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No employees found.</p>
          )}
        </div>

        {/* Company Dashboard Button */}
        <div className="mt-6">
          <Button
            variant="primary"
            onClick={() => {
              // Redirect to Learning Analytics microservice
              const learningAnalyticsUrl = process.env.REACT_APP_LEARNING_ANALYTICS_URL || 'https://learning-analytics.example.com';
              window.location.href = `${learningAnalyticsUrl}/company/${currentCompanyId}`;
            }}
          >
            Company Dashboard (Learning Analytics)
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CompanyProfile;

