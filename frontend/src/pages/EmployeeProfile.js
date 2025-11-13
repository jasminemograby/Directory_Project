// Employee Profile Page - Main profile page with mandatory profile enrichment
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import EnhanceProfile from '../components/Profile/EnhanceProfile';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EmployeeProfile = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
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
      const response = await apiService.getEmployee(currentEmployeeId);
      if (response.data && response.data.data) {
        setEmployee(response.data.data);
      } else {
        setError('Employee profile not found. Please check your employee ID.');
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


  const handleEnrichmentComplete = () => {
    setIsEnriched(true);
    // Refresh employee data to show updated profile
    fetchEmployeeData();
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
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

        {/* Profile Content - Only show if enriched */}
        {isEnriched && employee && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-gray-900">{employee.name || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{employee.email || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1 text-gray-900">{employee.role || 'N/A'}</p>
              </div>

              {employee.bio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <p className="mt-1 text-gray-900">{employee.bio}</p>
                </div>
              )}

              {employee.profile_status && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profile Status</label>
                  <p className="mt-1 text-gray-900 capitalize">{employee.profile_status}</p>
                </div>
              )}
            </div>
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

