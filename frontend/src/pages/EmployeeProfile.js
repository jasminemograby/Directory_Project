// Employee Profile Page - Main profile page with Navigation Tabs
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EnhanceProfile from '../components/Profile/EnhanceProfile';
import ProfileBasicInfoCard from '../components/Profile/ProfileBasicInfoCard';
import ProfileOverviewTab from '../components/Profile/ProfileOverviewTab';
import ProfileDashboardView from '../components/Profile/ProfileDashboardView';
import ProfileLearningPathView from '../components/Profile/ProfileLearningPathView';
import ProfileCoursesTab from '../components/Profile/ProfileCoursesTab';
import RequestsSection from '../components/Profile/RequestsSection';
import HierarchyTree from '../components/Profile/HierarchyTree';
import { apiService } from '../services/api';
import { mockDataService } from '../services/mockData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES } from '../utils/constants';
import { useApp } from '../contexts/AppContext';

const EmployeeProfile = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { theme } = useApp();
  const [employee, setEmployee] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [profileData, setProfileData] = useState(null); // Additional profile data (career, skills, courses)
  const [hierarchy, setHierarchy] = useState(null); // Hierarchy for managers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnriched, setIsEnriched] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, dashboard, learning-path, requests, courses

  // Get employee ID from localStorage if not in URL (for mock login)
  // Use useMemo to prevent unnecessary recalculations
  const currentEmployeeId = useMemo(() => {
    return employeeId || localStorage.getItem('currentEmployeeId');
  }, [employeeId]);

  const fetchEmployeeData = useCallback(async () => {
    if (!currentEmployeeId) {
      setError('Please set an employee ID. For testing, you can set it in localStorage: localStorage.setItem("currentEmployeeId", "your-employee-uuid")');
      setLoading(false);
      return;
    }

    // Check cache first
    const cacheKey = `profile_${currentEmployeeId}`;
    const cached = profileCache.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30000) { // 30 second cache
      console.log('[EmployeeProfile] Using cached profile data for:', currentEmployeeId);
      setEmployee(cached.employee);
      setProcessedData(cached.processedData);
      setProfileData(cached.profileData);
      setHierarchy(cached.hierarchy);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch basic employee data
      const employeeResponse = await apiService.getEmployee(currentEmployeeId);
      if (employeeResponse.data && employeeResponse.data.data) {
        const emp = employeeResponse.data.data;
        setEmployee(emp);
        
        // If employee is a manager, fetch hierarchy
        if (emp.is_manager) {
          try {
            if (emp.manager_type === 'dept_manager') {
              const hierarchyResponse = await apiService.getDepartmentHierarchy(currentEmployeeId);
              if (hierarchyResponse.data && hierarchyResponse.data.data && hierarchyResponse.data.data.hierarchy) {
                setHierarchy(hierarchyResponse.data.data.hierarchy);
              }
            } else if (emp.manager_type === 'team_manager') {
              const hierarchyResponse = await apiService.getTeamHierarchy(currentEmployeeId);
              if (hierarchyResponse.data && hierarchyResponse.data.data && hierarchyResponse.data.data.hierarchy) {
                setHierarchy(hierarchyResponse.data.data.hierarchy);
              }
            }
          } catch (hierarchyError) {
            console.warn('Could not fetch hierarchy for manager:', hierarchyError.message);
            // Don't fail the entire profile load if hierarchy fails
          }
        }
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
      }

      // Fetch additional profile data (career, skills, courses)
      try {
        const profileResponse = await apiService.getEmployeeProfile(currentEmployeeId);
        if (profileResponse.data && profileResponse.data.data) {
          setProfileData(profileResponse.data.data);
        } else {
          // Fallback to mock data if API fails
          console.warn('Profile API not available, using mock data');
          setProfileData(mockDataService.getEmployeeProfile(currentEmployeeId));
        }
      } catch (profileError) {
        console.warn('Profile API error, using mock data fallback:', profileError.message);
        // Fallback to mock data if API fails
        setProfileData(mockDataService.getEmployeeProfile(currentEmployeeId));
      }

      // Cache the fetched data
      const cacheKey = `profile_${currentEmployeeId}`;
      profileCache.current.set(cacheKey, {
        employee,
        processedData: processedData || null,
        profileData: profileData || null,
        hierarchy: hierarchy || null,
        timestamp: Date.now()
      });
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

  const checkingEnrichment = useRef(false);
  const hasLoadedData = useRef(false);
  
  const checkEnrichmentStatus = useCallback(async () => {
    if (!currentEmployeeId || checkingEnrichment.current) return;
    
    checkingEnrichment.current = true;
    
    try {
      // Check connection status (GitHub is required, LinkedIn is optional)
      const statusResult = await apiService.getConnectionStatus(currentEmployeeId);
      
      if (statusResult.data && statusResult.data.data) {
        const status = statusResult.data.data;
        // Both LinkedIn and GitHub are required
        setIsEnriched(status.linkedin === true && status.github === true);
      } else {
        setIsEnriched(false);
      }
    } catch (error) {
      console.error('Error checking enrichment status:', error);
      setIsEnriched(false);
    } finally {
      checkingEnrichment.current = false;
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

    // Only fetch once when component mounts or employeeId changes
    let isMounted = true;
    
    // Reset hasLoaded when employeeId changes
    if (hasLoadedData.current && employeeId !== currentEmployeeId) {
      hasLoadedData.current = false;
    }
    
    // Prevent multiple loads for the same employeeId
    if (hasLoadedData.current) {
      console.log('[EmployeeProfile] Data already loaded for employee:', currentEmployeeId);
      return;
    }
    
    const loadData = async () => {
      if (isMounted && !hasLoadedData.current) {
        hasLoadedData.current = true;
        await fetchEmployeeData();
        // Delay enrichment check to avoid race conditions
        setTimeout(async () => {
          if (isMounted) {
            await checkEnrichmentStatus();
          }
        }, 500);
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEmployeeId, employeeId]); // Only depend on currentEmployeeId and employeeId to prevent infinite loop


  // Use ref to prevent multiple calls
  const enrichmentCompleteCalled = useRef(false);
  
  const handleEnrichmentComplete = useCallback(async () => {
    if (enrichmentCompleteCalled.current) return;
    enrichmentCompleteCalled.current = true;
    
    console.log('[EmployeeProfile] Enrichment complete - refreshing profile data...');
    
    // Wait a moment for backend to complete processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Refresh employee data to get updated profile status
    await fetchEmployeeData();
    
    // Check enrichment status again
    await checkEnrichmentStatus();
    
    // Mark as enriched - this will hide EnhanceProfile and show full profile
    setIsEnriched(true);
    
    console.log('[EmployeeProfile] ✅ Profile enriched - showing complete profile');
    
    // Reset after a delay to allow re-triggering if needed
    setTimeout(() => {
      enrichmentCompleteCalled.current = false;
    }, 5000);
  }, [fetchEmployeeData, checkEnrichmentStatus]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen pt-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen pt-16 ${
          theme === 'day-mode' ? 'bg-gray-50' : 'bg-slate-900'
        }`}>
          <div className="max-w-4xl mx-auto p-6">
            <h1 className={`text-3xl font-bold mb-6 ${
              theme === 'day-mode' ? 'text-gray-800' : 'text-gray-200'
            }`}>
              My Profile
            </h1>
            <div className={`rounded-lg p-6 border ${
              theme === 'day-mode' 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-yellow-900/20 border-yellow-800'
            }`}>
              <h2 className={`text-xl font-semibold mb-3 ${
                theme === 'day-mode' ? 'text-yellow-800' : 'text-yellow-300'
              }`}>
                ⚠️ Profile Setup Required
              </h2>
              <p className={theme === 'day-mode' ? 'text-yellow-700' : 'text-yellow-400'}>
                {error}
              </p>
              {!currentEmployeeId && (
                <div className={`mt-4 p-4 rounded border ${
                  theme === 'day-mode' 
                    ? 'bg-white border-yellow-300' 
                    : 'bg-slate-800 border-yellow-700'
                }`}>
                  <p className={`text-sm mb-2 ${
                    theme === 'day-mode' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    To test the profile page, open your browser console and run:
                  </p>
                  <code className={`block p-2 rounded text-sm ${
                    theme === 'day-mode' 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-slate-700 text-gray-300'
                  }`}>
                    localStorage.setItem('currentEmployeeId', 'your-employee-uuid-here')
                  </code>
                  <p className={`text-xs mt-2 ${
                    theme === 'day-mode' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    Replace 'your-employee-uuid-here' with an actual employee ID from your database.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
    );
  }

  // Tab navigation items
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'learning-path', label: 'Learning Path' },
    { id: 'requests', label: 'Requests' },
    { id: 'courses', label: 'Courses' },
  ];

  return (
    <>
    <div className={`min-h-screen pt-16 ${
        theme === 'day-mode' ? 'bg-gray-50' : 'bg-slate-900'
      }`}>

        {/* Mandatory Profile Enrichment Section - BLOCKS ALL ACCESS UNTIL COMPLETE */}
        {!isEnriched && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className={`rounded-lg p-6 mb-6 border ${
              theme === 'day-mode' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-red-900/20 border-red-800'
            }`}>
              <h2 className={`text-xl font-bold mb-2 ${
                theme === 'day-mode' ? 'text-red-800' : 'text-red-300'
              }`}>
                ⚠️ Profile Enrichment Required
              </h2>
              <p className={theme === 'day-mode' ? 'text-red-700' : 'text-red-300'}>
                You must enrich your profile before you can access the system.
              </p>
              <p className={`text-sm mt-2 ${
                theme === 'day-mode' ? 'text-red-600' : 'text-red-400'
              }`}>
                After connecting your accounts, your profile will be automatically enriched with AI-generated bio, 
                projects, and skills. This is a one-time mandatory step.
              </p>
            </div>

            <EnhanceProfile 
              employeeId={currentEmployeeId} 
              onEnrichmentComplete={handleEnrichmentComplete}
            />
            
            {/* Instructions */}
            <div className={`rounded-lg p-4 mt-4 border ${
              theme === 'day-mode' 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-blue-900/20 border-blue-800'
            }`}>
              <p className={theme === 'day-mode' ? 'text-blue-800' : 'text-blue-300'}>
                📋 <strong>Instructions:</strong>
              </p>
              <ol className={`list-decimal list-inside mt-2 space-y-1 text-sm ${
                theme === 'day-mode' ? 'text-blue-700' : 'text-blue-400'
              }`}>
                <li>Connect your GitHub account (required)</li>
                <li>Connect your LinkedIn account (optional but recommended)</li>
                <li>Click "Fetch Data" - enrichment happens automatically</li>
                <li>Your profile will be approved automatically after enrichment</li>
                <li>You'll be redirected to your complete profile</li>
              </ol>
            </div>
          </div>
        )}

        {/* Profile Content with Tabs */}
        {isEnriched && employee && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Sidebar - Basic Info Card */}
              <div className="lg:col-span-1">
                <ProfileBasicInfoCard 
                  employee={employee}
                  onEditClick={() => navigate(ROUTES.PROFILE_EDIT_ME)}
                />
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-3">
                {/* Navigation Tabs */}
                <div className={`rounded-t-lg border-b ${
                  theme === 'day-mode' 
                    ? 'bg-white border-gray-200' 
                    : 'bg-slate-800 border-gray-700'
                }`}>
                  <div className="flex space-x-1 overflow-x-auto">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 text-sm font-medium transition-all duration-300 border-b-2 ${
                          activeTab === tab.id
                            ? theme === 'day-mode'
                              ? 'border-emerald-600 text-emerald-600'
                              : 'border-emerald-400 text-emerald-400'
                            : theme === 'day-mode'
                              ? 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                              : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className={`rounded-b-lg p-6 ${
                  theme === 'day-mode' 
                    ? 'bg-white border border-gray-200 border-t-0' 
                    : 'bg-slate-800 border border-gray-700 border-t-0'
                }`}>
                  {activeTab === 'overview' && (
                    <>
                      {/* Hierarchy Section for Managers */}
                      {employee?.is_manager && (
                        <div className="mb-6">
                          <div className="rounded-lg p-6" style={{ 
                            backgroundColor: 'var(--bg-card)', 
                            boxShadow: 'var(--shadow-card)', 
                            borderColor: 'var(--bg-secondary)', 
                            borderWidth: '1px', 
                            borderStyle: 'solid' 
                          }}>
                            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                              {employee.manager_type === 'dept_manager' ? 'Department Hierarchy' : 'Team Hierarchy'}
                            </h3>
                            {hierarchy ? (
                              <HierarchyTree
                                hierarchy={hierarchy}
                                onEmployeeClick={(empId) => {
                                  navigate(`${ROUTES.PROFILE}/${empId}`);
                                }}
                              />
                            ) : (
                              <p style={{ color: 'var(--text-secondary)' }}>Loading hierarchy...</p>
                            )}
                          </div>
                        </div>
                      )}
                      <ProfileOverviewTab
                        employee={employee}
                        processedData={processedData}
                        profileData={profileData}
                      />
                    </>
                  )}

                  {activeTab === 'dashboard' && (
                    <ProfileDashboardView employeeId={currentEmployeeId} />
                  )}

                  {activeTab === 'learning-path' && (
                    <ProfileLearningPathView employeeId={currentEmployeeId} />
                  )}

                  {activeTab === 'requests' && (
                    <RequestsSection employeeId={currentEmployeeId} />
                  )}

                  {activeTab === 'courses' && profileData && profileData.courses && (
                    <ProfileCoursesTab
                      assignedCourses={profileData.courses.assigned || []}
                      learningCourses={profileData.courses.learning || []}
                      completedCourses={profileData.courses.completed || []}
                      taughtCourses={profileData.courses.taught || []}
                    />
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
};

export default EmployeeProfile;

