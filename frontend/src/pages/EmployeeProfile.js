// Employee Profile Page - Main profile page with mandatory profile enrichment
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/common/Layout';
import EnhanceProfile from '../components/Profile/EnhanceProfile';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EmployeeProfile = () => {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnriched, setIsEnriched] = useState(false);

  // Get employee ID from localStorage if not in URL (for mock login)
  const currentEmployeeId = employeeId || localStorage.getItem('currentEmployeeId');

  const fetchEmployeeData = useCallback(async () => {
    if (!currentEmployeeId) {
      setError('Please set an employee ID. For testing, you can set it in localStorage: localStorage.setItem("currentEmployeeId", "your-employee-uuid")');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch basic employee data
      const employeeResponse = await apiService.getEmployee(currentEmployeeId);
      if (employeeResponse.data && employeeResponse.data.data) {
        setEmployee(employeeResponse.data.data);
      } else {
        setError('Employee profile not found. Please check your employee ID.');
      }

      // Fetch processed data (bio, projects, skills) - NOT raw data
      try {
        const processedResponse = await apiService.getProcessedData(currentEmployeeId);
        if (processedResponse.data && processedResponse.data.data) {
          setProcessedData(processedResponse.data.data);
        }
      } catch (processedError) {
        console.warn('No processed data available yet:', processedError.message);
        // This is OK - processed data might not exist yet
        setProcessedData(null);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
      // Don't redirect to 404 - show error message instead
      if (error.response?.status === 404) {
        setError('Employee profile not found. Please check your employee ID.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentEmployeeId]);

  const checkEnrichmentStatus = useCallback(async () => {
    try {
      // Check if both LinkedIn and GitHub are connected
      const [linkedInResult, githubResult] = await Promise.allSettled([
        apiService.fetchLinkedInData(currentEmployeeId),
        apiService.fetchGitHubData(currentEmployeeId)
      ]);

      const linkedInConnected = linkedInResult.status === 'fulfilled' && 
                                 linkedInResult.value.data && 
                                 !linkedInResult.value.data.error;
      
      const githubConnected = githubResult.status === 'fulfilled' && 
                              githubResult.value.data && 
                              !githubResult.value.data.error;

      setIsEnriched(linkedInConnected && githubConnected);
    } catch (error) {
      console.error('Error checking enrichment status:', error);
      setIsEnriched(false);
    }
  }, [currentEmployeeId]);

  useEffect(() => {
    // For testing: if no employee ID, show message
    // In production, this should redirect to login
    if (!currentEmployeeId) {
      setError('Please set an employee ID. For testing, you can set it in localStorage: localStorage.setItem("currentEmployeeId", "your-employee-uuid")');
      setLoading(false);
      return;
    }

    // Only fetch if we have an employee ID
    fetchEmployeeData();
    checkEnrichmentStatus();
  }, [currentEmployeeId, fetchEmployeeData, checkEnrichmentStatus]);


  const handleEnrichmentComplete = async () => {
    setIsEnriched(true);
    // Refresh employee data and processed data to show updated profile
    await fetchEmployeeData();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-3">⚠️ Profile Setup Required</h2>
            <p className="text-yellow-700 mb-4">{error}</p>
            {!currentEmployeeId && (
              <div className="mt-4 p-4 bg-white rounded border border-yellow-300">
                <p className="text-sm text-gray-700 mb-2">To test the profile page, open your browser console and run:</p>
                <code className="block p-2 bg-gray-100 rounded text-sm text-gray-800">
                  localStorage.setItem('currentEmployeeId', 'your-employee-uuid-here')
                </code>
                <p className="text-xs text-gray-600 mt-2">Replace 'your-employee-uuid-here' with an actual employee ID from your database.</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>

        {/* Mandatory Profile Enrichment Section */}
        {!isEnriched && (
          <div className="mb-6">
            <EnhanceProfile 
              employeeId={currentEmployeeId} 
              onEnrichmentComplete={handleEnrichmentComplete}
            />
            
            {/* Blocking Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-yellow-800 font-medium">
                ⚠️ Please connect your LinkedIn and GitHub accounts to enrich your profile before continuing.
              </p>
              <p className="text-yellow-700 text-sm mt-2">
                This step is required to generate your skill profile and enable access to assessments and learning paths.
              </p>
            </div>
          </div>
        )}

        {/* Profile Content - Only show processed data (NOT raw data) */}
        {isEnriched && employee && (
          <div className="space-y-6">
            {/* Basic Employee Information */}
            <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Profile Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Name</label>
                  <p className="text-gray-900" style={{ color: 'var(--text-primary)' }}>{employee.name || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
                  <p className="text-gray-900" style={{ color: 'var(--text-primary)' }}>{employee.email || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Role</label>
                  <p className="text-gray-900" style={{ color: 'var(--text-primary)' }}>{employee.role || 'N/A'}</p>
                </div>

                {employee.profile_status && (
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Profile Status</label>
                    <p className="capitalize" style={{ color: 'var(--text-primary)' }}>{employee.profile_status}</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI-Generated Bio (Processed Data) */}
            {processedData?.bio && (
              <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Professional Bio</h2>
                <p className="text-gray-700 leading-relaxed" style={{ color: 'var(--text-primary)' }}>{processedData.bio}</p>
                {processedData.processedAt && (
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    Generated on {new Date(processedData.processedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Projects (Processed Data) */}
            {processedData?.projects && processedData.projects.length > 0 && (
              <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Projects</h2>
                <div className="space-y-4">
                  {processedData.projects.map((project) => (
                    <div key={project.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                      <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{project.title}</h3>
                      <p className="text-gray-600" style={{ color: 'var(--text-secondary)' }}>{project.summary}</p>
                      {project.source && (
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                          Source: {project.source}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills (Processed Data) */}
            {processedData?.skills && processedData.skills.length > 0 && (
              <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {processedData.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: skill.type === 'verified' ? 'var(--accent-green)' : 'var(--bg-secondary)',
                        color: skill.type === 'verified' ? 'white' : 'var(--text-primary)'
                      }}
                    >
                      {skill.name}
                      {skill.type === 'verified' && ' ✓'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Message if no processed data yet */}
            {!processedData?.bio && !processedData?.projects?.length && !processedData?.skills?.length && (
              <div className="rounded-lg p-6 border border-yellow-200" style={{ backgroundColor: '#fef3c7' }}>
                <p className="text-yellow-800">
                  Profile enrichment in progress. Your bio, projects, and skills will appear here once processing is complete.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Show enrichment section even if enriched (for re-connection) */}
        {isEnriched && (
          <div className="mt-6">
            <EnhanceProfile 
              employeeId={currentEmployeeId} 
              onEnrichmentComplete={handleEnrichmentComplete}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EmployeeProfile;

