// Company Profile Page - HR/Company Creator view with company overview, hierarchy, employees, requests
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES } from '../utils/constants';
import { authService } from '../utils/auth';
import PendingProfilesApproval from '../components/HR/PendingProfilesApproval';
import PendingRequestsApproval from '../components/HR/PendingRequestsApproval';

const CompanyProfile = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [hierarchy, setHierarchy] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({});

  const fetchCompanyData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const id = companyId || localStorage.getItem('companyId');
      if (!id) {
        // Try to get from HR email
        const hrEmail = authService.getUserEmail() || localStorage.getItem('hrEmail');
        if (hrEmail) {
          const response = await apiService.getCompanyByHrEmail(hrEmail);
          if (response.data && response.data.success) {
            setCompany(response.data.data);
            if (response.data.data.id) {
              localStorage.setItem('companyId', response.data.data.id);
            }
          }
        } else {
          setError('Company ID or HR email is required');
          setLoading(false);
          return;
        }
      } else {
        const response = await apiService.getCompany(id);
        if (response.data && response.data.success) {
          setCompany(response.data.data);
        } else {
          setError(response.data?.error || 'Company not found');
        }
      }

      // Fetch employees
      if (company?.id || id) {
        try {
          const employeesResponse = await apiService.getEmployees({ companyId: company?.id || id });
          if (employeesResponse.data && employeesResponse.data.success) {
            setEmployees(employeesResponse.data.data || []);
          }
        } catch (empError) {
          console.warn('Error fetching employees:', empError);
        }
      }
    } catch (err) {
      console.error('Error fetching company data:', err);
      if (err.response?.status === 404) {
        setError('Company not found. Please complete company registration first.');
      } else {
        setError(err.response?.data?.error || 'Failed to load company data');
      }
    } finally {
      setLoading(false);
    }
  }, [companyId, company?.id]);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  const buildHierarchy = () => {
    if (!company || !employees.length) return null;

    const deptMap = new Map();
    const teamMap = new Map();

    // Group employees by department and team
    employees.forEach(emp => {
      if (emp.department_id) {
        if (!deptMap.has(emp.department_id)) {
          deptMap.set(emp.department_id, {
            id: emp.department_id,
            name: emp.department_name || 'Unknown Department',
            teams: new Map(),
            employees: []
          });
        }
        const dept = deptMap.get(emp.department_id);

        if (emp.team_id) {
          if (!dept.teams.has(emp.team_id)) {
            dept.teams.set(emp.team_id, {
              id: emp.team_id,
              name: emp.team_name || 'Unknown Team',
              employees: []
            });
          }
          dept.teams.get(emp.team_id).employees.push(emp);
        } else {
          dept.employees.push(emp);
        }
      } else {
        // Employees without department
        if (!deptMap.has('no-dept')) {
          deptMap.set('no-dept', {
            id: 'no-dept',
            name: 'Unassigned',
            teams: new Map(),
            employees: []
          });
        }
        deptMap.get('no-dept').employees.push(emp);
      }
    });

    return {
      id: company.id,
      name: company.name,
      type: 'Company',
      departments: Array.from(deptMap.values()).map(dept => ({
        ...dept,
        teams: Array.from(dept.teams.values())
      }))
    };
  };

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
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

  const companyHierarchy = buildHierarchy();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {company?.name || 'Company Profile'}
              </h1>
              <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                Company Management Dashboard
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => navigate(ROUTES.HR_DASHBOARD)}
              >
                HR Dashboard
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(ROUTES.HOME)}
              >
                Home
              </Button>
            </div>
          </div>
        </div>

        {/* Company Overview */}
        <div className="mb-6 rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Company Overview</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Company Information</h3>
              <div className="space-y-2 text-sm">
                <p style={{ color: 'var(--text-primary)' }}><strong>Name:</strong> {company?.name}</p>
                <p style={{ color: 'var(--text-primary)' }}><strong>Industry:</strong> {company?.industry || 'N/A'}</p>
                <p style={{ color: 'var(--text-primary)' }}><strong>Domain:</strong> {company?.domain || 'N/A'}</p>
                <p style={{ color: 'var(--text-primary)' }}><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    company?.verification_status === 'verified' 
                      ? 'bg-accent-green text-white' 
                      : company?.verification_status === 'pending'
                      ? 'bg-accent-orange text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {company?.verification_status || 'pending'}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>KPIs</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Departments</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {company?.statistics?.departments || companyHierarchy?.departments?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Teams</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {company?.statistics?.teams || companyHierarchy?.departments?.reduce((sum, dept) => sum + (dept.teams?.length || 0), 0) || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Employees</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {company?.statistics?.employees || employees.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Hierarchy Tree */}
        {companyHierarchy && (
          <div className="mb-6 rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Company Hierarchy</h2>
            <div className="space-y-2">
              <div
                className="p-3 rounded cursor-pointer hover:bg-opacity-50 transition-colors"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
                onClick={() => toggleNode(companyHierarchy.id)}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {expandedNodes[companyHierarchy.id] ? '▼' : '▶'}
                  </span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {companyHierarchy.name}
                  </span>
                </div>
              </div>

              {expandedNodes[companyHierarchy.id] && companyHierarchy.departments && (
                <div className="ml-6 space-y-2">
                  {companyHierarchy.departments.map((dept) => (
                    <div key={dept.id}>
                      <div
                        className="p-3 rounded cursor-pointer hover:bg-opacity-50 transition-colors"
                        style={{ backgroundColor: 'var(--bg-tertiary)' }}
                        onClick={() => toggleNode(dept.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span style={{ color: 'var(--text-secondary)' }}>
                              {expandedNodes[dept.id] ? '▼' : '▶'}
                            </span>
                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {dept.name}
                            </span>
                          </div>
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {dept.teams?.length || 0} teams, {dept.employees?.length || 0} employees
                          </span>
                        </div>
                      </div>

                      {expandedNodes[dept.id] && (
                        <div className="ml-6 space-y-2">
                          {/* Teams */}
                          {dept.teams && dept.teams.map((team) => (
                            <div key={team.id}>
                              <div
                                className="p-3 rounded cursor-pointer hover:bg-opacity-50 transition-colors"
                                style={{ backgroundColor: 'var(--bg-secondary)' }}
                                onClick={() => toggleNode(team.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                      {expandedNodes[team.id] ? '▼' : '▶'}
                                    </span>
                                    <span style={{ color: 'var(--text-primary)' }}>
                                      {team.name}
                                    </span>
                                  </div>
                                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {team.employees?.length || 0} employees
                                  </span>
                                </div>
                              </div>

                              {expandedNodes[team.id] && team.employees && (
                                <div className="ml-6 space-y-1">
                                  {team.employees.map((emp) => (
                                    <div
                                      key={emp.id}
                                      className="p-2 rounded cursor-pointer hover:bg-opacity-50 transition-colors"
                                      style={{ backgroundColor: 'var(--bg-tertiary)' }}
                                      onClick={() => handleViewEmployee(emp.id)}
                                    >
                                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                        {emp.name} ({emp.email})
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Employees without team */}
                          {dept.employees && dept.employees.length > 0 && (
                            <div className="space-y-1">
                              {dept.employees.map((emp) => (
                                <div
                                  key={emp.id}
                                  className="p-2 rounded cursor-pointer hover:bg-opacity-50 transition-colors"
                                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                                  onClick={() => handleViewEmployee(emp.id)}
                                >
                                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                    {emp.name} ({emp.email})
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pending Profiles Approval */}
        <div className="mb-6">
          <PendingProfilesApproval />
        </div>

        {/* Pending Requests Approval */}
        <div className="mb-6">
          <PendingRequestsApproval />
        </div>

        {/* Employee List */}
        <div className="mb-6 rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>All Employees</h2>
          {employees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--bg-secondary)' }}>
                    <th className="text-left py-2 px-4" style={{ color: 'var(--text-secondary)' }}>Name</th>
                    <th className="text-left py-2 px-4" style={{ color: 'var(--text-secondary)' }}>Email</th>
                    <th className="text-left py-2 px-4" style={{ color: 'var(--text-secondary)' }}>Role</th>
                    <th className="text-left py-2 px-4" style={{ color: 'var(--text-secondary)' }}>Type</th>
                    <th className="text-left py-2 px-4" style={{ color: 'var(--text-secondary)' }}>Status</th>
                    <th className="text-left py-2 px-4" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                      <td className="py-2 px-4" style={{ color: 'var(--text-primary)' }}>{emp.name}</td>
                      <td className="py-2 px-4" style={{ color: 'var(--text-primary)' }}>{emp.email}</td>
                      <td className="py-2 px-4" style={{ color: 'var(--text-primary)' }}>{emp.role || 'N/A'}</td>
                      <td className="py-2 px-4" style={{ color: 'var(--text-primary)' }}>{emp.type || 'regular'}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          emp.profile_status === 'approved' 
                            ? 'bg-accent-green text-white' 
                            : emp.profile_status === 'pending'
                            ? 'bg-accent-orange text-white'
                            : 'bg-red-500 text-white'
                        }`}>
                          {emp.profile_status || 'pending'}
                        </span>
                      </td>
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
            <p style={{ color: 'var(--text-secondary)' }}>No employees found</p>
          )}
        </div>

        {/* Company Dashboard Link */}
        <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Company Dashboard</h2>
          <Button
            variant="primary"
            onClick={() => {
              // TODO: Navigate to Learning Analytics dashboard
              alert('Learning Analytics dashboard coming soon!');
            }}
          >
            Go to Learning Analytics
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CompanyProfile;
