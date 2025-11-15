// Super Admin Profile Page - System-wide admin view
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES, getProfilePath } from '../utils/constants';

const SuperAdminProfile = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('companies'); // 'companies', 'employees', 'logs'

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all companies
      try {
        const companiesResponse = await apiService.getCompanies({});
        if (companiesResponse.data && companiesResponse.data.data) {
          setCompanies(companiesResponse.data.data.companies || []);
        }
      } catch (companiesError) {
        console.warn('Could not fetch companies:', companiesError.message);
        setCompanies([]);
      }

      // Fetch all employees (across all companies)
      try {
        const employeesResponse = await apiService.getEmployees({});
        if (employeesResponse.data && employeesResponse.data.data) {
          setEmployees(employeesResponse.data.data.employees || []);
        }
      } catch (employeesError) {
        console.warn('Could not fetch employees:', employeesError.message);
        setEmployees([]);
      }

      // Fetch admin logs
      try {
        // TODO: Replace with actual API call when logs endpoint is ready
        // const logsResponse = await apiService.getAdminLogs({});
        // setLogs(logsResponse.data.data.logs || []);
        setLogs([]); // Mock for now
      } catch (logsError) {
        console.warn('Could not fetch logs:', logsError.message);
        setLogs([]);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load admin data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-6">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-6">
          <div className="rounded-lg p-6 border border-red-200" style={{ backgroundColor: '#fee2e2' }}>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Super Admin Dashboard</h1>
          <Button
            variant="primary"
            onClick={() => {
              // Redirect to Management Reporting microservice
              const reportingUrl = process.env.REACT_APP_MANAGEMENT_REPORTING_URL || 'https://management-reporting.example.com';
              window.location.href = `${reportingUrl}/admin/dashboard`;
            }}
          >
            Analytics Dashboard
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b" style={{ borderColor: 'var(--bg-secondary)' }}>
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'companies'
                ? 'border-b-2'
                : ''
            }`}
            style={{
              color: activeTab === 'companies' ? 'var(--text-accent)' : 'var(--text-secondary)',
              borderBottomColor: activeTab === 'companies' ? 'var(--text-accent)' : 'transparent'
            }}
          >
            Companies ({companies.length})
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'employees'
                ? 'border-b-2'
                : ''
            }`}
            style={{
              color: activeTab === 'employees' ? 'var(--text-accent)' : 'var(--text-secondary)',
              borderBottomColor: activeTab === 'employees' ? 'var(--text-accent)' : 'transparent'
            }}
          >
            All Employees ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'logs'
                ? 'border-b-2'
                : ''
            }`}
            style={{
              color: activeTab === 'logs' ? 'var(--text-accent)' : 'var(--text-secondary)',
              borderBottomColor: activeTab === 'logs' ? 'var(--text-accent)' : 'transparent'
            }}
          >
            System Logs ({logs.length})
          </button>
        </div>

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div className="rounded-lg p-6" style={{ 
            backgroundColor: 'var(--bg-card)', 
            boxShadow: 'var(--shadow-card)', 
            borderColor: 'var(--bg-secondary)', 
            borderWidth: '1px', 
            borderStyle: 'solid' 
          }}>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>All Companies</h2>
            
            {companies && companies.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--bg-secondary)' }}>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Company Name</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Industry</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Domain</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Status</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Employees</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Created</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr 
                        key={company.id}
                        className="hover:bg-opacity-50 cursor-pointer transition-colors"
                        style={{ 
                          borderBottom: '1px solid var(--bg-secondary)',
                          backgroundColor: 'transparent'
                        }}
                        onClick={() => navigate(`${ROUTES.COMPANY_PROFILE.replace(':companyId', company.id)}`)}
                      >
                        <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>{company.name}</td>
                        <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{company.industry || 'N/A'}</td>
                        <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{company.domain || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            company.verification_status === 'verified' 
                              ? 'bg-accent-green text-white' 
                              : company.verification_status === 'pending'
                              ? 'bg-accent-orange text-white'
                              : 'bg-red-500 text-white'
                          }`}>
                            {company.verification_status || 'pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                          {company.statistics?.employees || 0}
                        </td>
                        <td className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>
                          {company.created_at ? new Date(company.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`${ROUTES.COMPANY_PROFILE.replace(':companyId', company.id)}`);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No companies found.</p>
            )}
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="rounded-lg p-6" style={{ 
            backgroundColor: 'var(--bg-card)', 
            boxShadow: 'var(--shadow-card)', 
            borderColor: 'var(--bg-secondary)', 
            borderWidth: '1px', 
            borderStyle: 'solid' 
          }}>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>All Employees (Read-Only)</h2>
            
            {employees && employees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--bg-secondary)' }}>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Name</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Email</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Company</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Role Type</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Status</th>
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
                        onClick={() => navigate(getProfilePath(employee.id))}
                      >
                        <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>{employee.name}</td>
                        <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{employee.email}</td>
                        <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                          {employee.company_name || 'N/A'}
                        </td>
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
                        <td className="py-3 px-4">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(getProfilePath(employee.id));
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
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="rounded-lg p-6" style={{ 
            backgroundColor: 'var(--bg-card)', 
            boxShadow: 'var(--shadow-card)', 
            borderColor: 'var(--bg-secondary)', 
            borderWidth: '1px', 
            borderStyle: 'solid' 
          }}>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>System Logs</h2>
            
            {logs && logs.length > 0 ? (
              <div className="space-y-2">
                {logs.map((log, idx) => (
                  <div 
                    key={log.id || idx}
                    className="p-4 rounded border"
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--bg-tertiary)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {log.action || 'Action'}
                        </p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                          {log.description || log.message}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                        </p>
                        {log.admin_id && (
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            Admin: {log.admin_id}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No logs available. Logs will appear here when admin actions are performed.</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SuperAdminProfile;

