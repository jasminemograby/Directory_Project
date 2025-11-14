// Super Admin Profile Page - Full view of all companies, employees, logs
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES } from '../utils/constants';

const SuperAdminProfile = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('companies'); // companies, employees, logs

  const fetchCompanies = useCallback(async () => {
    try {
      // TODO: Implement getCompanies API endpoint
      // For now, using mock data
      setCompanies([
        { id: '1', name: 'Company 1', industry: 'Tech', verification_status: 'verified', employees_count: 25 },
        { id: '2', name: 'Company 2', industry: 'Finance', verification_status: 'pending', employees_count: 15 }
      ]);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to load companies');
    }
  }, []);

  const fetchEmployees = useCallback(async (companyId) => {
    try {
      if (companyId) {
        const response = await apiService.getEmployees({ companyId });
        if (response.data && response.data.success) {
          setEmployees(response.data.data || []);
        }
      } else {
        // TODO: Get all employees across all companies (admin endpoint)
        setEmployees([]);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      // TODO: Implement getAuditLogs API endpoint
      setLogs([
        { id: '1', action_type: 'company_registered', actor_id: 'user1', target_type: 'company', target_id: '1', created_at: new Date().toISOString() },
        { id: '2', action_type: 'profile_approved', actor_id: 'hr1', target_type: 'employee', target_id: 'emp1', created_at: new Date().toISOString() }
      ]);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCompanies(),
        fetchLogs()
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchCompanies, fetchLogs]);

  const handleViewCompany = (companyId) => {
    navigate(`${ROUTES.COMPANY_PROFILE.replace(':companyId', companyId)}`);
  };

  const handleViewEmployee = (employeeId) => {
    navigate(`${ROUTES.PROFILE}/${employeeId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Super Admin Dashboard</h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>System-wide administration and monitoring</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b" style={{ borderColor: 'var(--bg-secondary)' }}>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('companies')}
              className={`pb-2 px-4 font-medium ${
                activeTab === 'companies' 
                  ? 'border-b-2' 
                  : ''
              }`}
              style={{ 
                color: activeTab === 'companies' ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderColor: activeTab === 'companies' ? 'var(--accent-orange)' : 'transparent'
              }}
            >
              Companies ({companies.length})
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`pb-2 px-4 font-medium ${
                activeTab === 'employees' 
                  ? 'border-b-2' 
                  : ''
              }`}
              style={{ 
                color: activeTab === 'employees' ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderColor: activeTab === 'employees' ? 'var(--accent-orange)' : 'transparent'
              }}
            >
              All Employees ({employees.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`pb-2 px-4 font-medium ${
                activeTab === 'logs' 
                  ? 'border-b-2' 
                  : ''
              }`}
              style={{ 
                color: activeTab === 'logs' ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderColor: activeTab === 'logs' ? 'var(--accent-orange)' : 'transparent'
              }}
            >
              Audit Logs ({logs.length})
            </button>
          </div>
        </div>

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>All Companies</h2>
            {companies.length > 0 ? (
              <div className="space-y-3">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    className="p-4 rounded border cursor-pointer hover:bg-opacity-50 transition-colors"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-tertiary)' }}
                    onClick={() => handleViewCompany(company.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {company.name}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {company.industry} • {company.employees_count || 0} employees
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          company.verification_status === 'verified' 
                            ? 'bg-accent-green text-white' 
                            : company.verification_status === 'pending'
                            ? 'bg-accent-orange text-white'
                            : 'bg-red-500 text-white'
                        }`}>
                          {company.verification_status || 'pending'}
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCompany(company.id);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No companies found</p>
            )}
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>All Employees</h2>
            {employees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--bg-secondary)' }}>
                      <th className="text-left py-2 px-4" style={{ color: 'var(--text-secondary)' }}>Name</th>
                      <th className="text-left py-2 px-4" style={{ color: 'var(--text-secondary)' }}>Email</th>
                      <th className="text-left py-2 px-4" style={{ color: 'var(--text-secondary)' }}>Company</th>
                      <th className="text-left py-2 px-4" style={{ color: 'var(--text-secondary)' }}>Role</th>
                      <th className="text-left py-2 px-4" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.id} style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                        <td className="py-2 px-4" style={{ color: 'var(--text-primary)' }}>{emp.name}</td>
                        <td className="py-2 px-4" style={{ color: 'var(--text-primary)' }}>{emp.email}</td>
                        <td className="py-2 px-4" style={{ color: 'var(--text-primary)' }}>{emp.company_name || 'N/A'}</td>
                        <td className="py-2 px-4" style={{ color: 'var(--text-primary)' }}>{emp.role || 'N/A'}</td>
                        <td className="py-2 px-4">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleViewEmployee(emp.id)}
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
              <div>
                <p style={{ color: 'var(--text-secondary)' }}>Select a company to view employees, or implement admin endpoint to view all employees</p>
                <div className="mt-4">
                  {companies.map((company) => (
                    <Button
                      key={company.id}
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedCompany(company.id);
                        fetchEmployees(company.id);
                      }}
                      className="mr-2 mb-2"
                    >
                      View {company.name} Employees
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Audit Logs</h2>
            {logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--bg-secondary)' }}>
                      <th className="text-left py-2 px-4" style={{ color: 'var(--text-secondary)' }}>Action</th>
                      <th className="text-left py-2 px-4" style={{ color: 'var(--text-secondary)' }}>Actor</th>
                      <th className="text-left py-2 px-4" style={{ color: 'var(--text-secondary)' }}>Target</th>
                      <th className="text-left py-2 px-4" style={{ color: 'var(--text-secondary)' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                        <td className="py-2 px-4" style={{ color: 'var(--text-primary)' }}>{log.action_type}</td>
                        <td className="py-2 px-4" style={{ color: 'var(--text-primary)' }}>{log.actor_id}</td>
                        <td className="py-2 px-4" style={{ color: 'var(--text-primary)' }}>
                          {log.target_type}: {log.target_id}
                        </td>
                        <td className="py-2 px-4" style={{ color: 'var(--text-primary)' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No logs available</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SuperAdminProfile;
