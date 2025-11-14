// Trainer Profile Page - Employee Profile + Trainer-specific fields
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import EnhanceProfile from '../components/Profile/EnhanceProfile';
import ProfileBasicInfoCard from '../components/Profile/ProfileBasicInfoCard';
import ProfileOverviewTab from '../components/Profile/ProfileOverviewTab';
import ProfileDashboardView from '../components/Profile/ProfileDashboardView';
import ProfileLearningPathView from '../components/Profile/ProfileLearningPathView';
import ProfileCoursesTab from '../components/Profile/ProfileCoursesTab';
import RequestsSection from '../components/Profile/RequestsSection';
import TrainerInfoSection from '../components/Profile/TrainerInfoSection';
import TeachingRequestsSection from '../components/Profile/TeachingRequestsSection';
import { apiService } from '../services/api';
import { mockDataService } from '../services/mockData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES } from '../utils/constants';
import { useApp } from '../contexts/AppContext';

const TrainerProfile = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { theme } = useApp();
  const [employee, setEmployee] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [trainerData, setTrainerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnriched, setIsEnriched] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, dashboard, learning-path, requests, courses, trainer

  // Get employee ID from localStorage if not in URL
  const currentEmployeeId = useMemo(() => {
    return employeeId || localStorage.getItem('currentEmployeeId');
  }, [employeeId]);

  const checkingEnrichment = useRef(false);
  const hasLoadedData = useRef(false);
  
  const checkEnrichmentStatus = useCallback(async () => {
    if (!currentEmployeeId || checkingEnrichment.current) return;
    checkingEnrichment.current = true;

    try {
      const processedResponse = await apiService.getProcessedData(currentEmployeeId);
      if (processedResponse.data && processedResponse.data.data) {
        const hasBio = !!processedResponse.data.data.bio;
        setIsEnriched(hasBio);
      }
    } catch (error) {
      console.warn('Could not check enrichment status:', error.message);
      setIsEnriched(false);
    } finally {
      checkingEnrichment.current = false;
    }
  }, [currentEmployeeId]);

  const fetchTrainerData = useCallback(async () => {
    if (!currentEmployeeId) {
      setError('Please set an employee ID.');
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
        
        // Check if employee is a trainer
        if (emp.type !== 'internal_instructor' && emp.type !== 'external_instructor') {
          setError('This employee is not a trainer.');
          setLoading(false);
          return;
        }

        setEmployee(emp);

        // Fetch processed data (bio, projects, skills) - NOT raw data
        try {
          const processedResponse = await apiService.getProcessedData(currentEmployeeId);
          if (processedResponse.data && processedResponse.data.data) {
            setProcessedData(processedResponse.data.data);
            const hasBio = !!processedResponse.data.data.bio;
            setIsEnriched(hasBio);
          }
        } catch (processedError) {
          console.warn('No processed data available yet:', processedError.message);
          setIsEnriched(false);
        }

        // Fetch additional profile data
        try {
          const profileResponse = await apiService.getEmployeeProfile(currentEmployeeId);
          if (profileResponse.data && profileResponse.data.data) {
            setProfileData(profileResponse.data.data);
          } else {
            setProfileData(mockDataService.getEmployeeProfile(currentEmployeeId));
          }
        } catch (profileError) {
          console.warn('Profile API error, using mock data fallback:', profileError.message);
          setProfileData(mockDataService.getEmployeeProfile(currentEmployeeId));
        }

        // Fetch courses taught from Content Studio
        let taughtCourses = [];
        try {
          const coursesResponse = await apiService.getTaughtCourses(currentEmployeeId);
          if (coursesResponse.data && coursesResponse.data.data) {
            taughtCourses = coursesResponse.data.data.courses || [];
          }
        } catch (coursesError) {
          console.warn('Could not fetch taught courses:', coursesError.message);
        }

        // Set trainer-specific data
        setTrainerData({
          trainerStatus: emp.trainer_status || 'Active',
          aiEnabled: emp.ai_enabled !== undefined ? emp.ai_enabled : true,
          publicPublishEnabled: emp.public_publish_enabled !== undefined ? emp.public_publish_enabled : false,
          taughtCourses: taughtCourses
        });
      } else {
        setError('Trainer profile not found.');
      }
    } catch (error) {
      console.error('Error fetching trainer data:', error);
      if (error.response?.status === 404) {
        setError('Trainer profile not found.');
      } else {
        setError('Failed to load trainer profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentEmployeeId]);

  const handleEnrichmentComplete = useCallback(async () => {
    // Wait for backend processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    // Refresh data
    await fetchTrainerData();
    // Check enrichment status
    await checkEnrichmentStatus();
  }, [fetchTrainerData, checkEnrichmentStatus]);

  useEffect(() => {
    if (!hasLoadedData.current) {
      fetchTrainerData();
      hasLoadedData.current = true;
    }
  }, [fetchTrainerData]);

  useEffect(() => {
    if (currentEmployeeId && hasLoadedData.current) {
      checkEnrichmentStatus();
    }
  }, [currentEmployeeId, checkEnrichmentStatus]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen pt-16">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className={`min-h-screen pt-16 ${
          theme === 'day-mode' ? 'bg-gray-50' : 'bg-slate-900'
        }`}>
          <div className="max-w-4xl mx-auto p-6">
            <div className={`rounded-lg p-6 border ${
              theme === 'day-mode' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-red-900/20 border-red-800'
            }`}>
              <p className={theme === 'day-mode' ? 'text-red-800' : 'text-red-300'}>{error}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Tab navigation items (same as EmployeeProfile + Trainer tab)
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'learning-path', label: 'Learning Path' },
    { id: 'requests', label: 'Requests' },
    { id: 'courses', label: 'Courses' },
    { id: 'trainer', label: 'Trainer' }, // Additional trainer-specific tab
  ];

  return (
    <>
      <Header />
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
                    <ProfileOverviewTab
                      employee={employee}
                      processedData={processedData}
                      profileData={profileData}
                    />
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
                      taughtCourses={trainerData?.taughtCourses || []}
                    />
                  )}

                  {activeTab === 'trainer' && (
                    <div className="space-y-6">
                      {/* Trainer Info Section */}
                      {trainerData && (
                        <TrainerInfoSection
                          trainerStatus={trainerData.trainerStatus}
                          aiEnabled={trainerData.aiEnabled}
                          publicPublishEnabled={trainerData.publicPublishEnabled}
                          onEditSettings={() => {
                            // TODO: Navigate to trainer settings
                            console.log('Edit trainer settings');
                          }}
                        />
                      )}

                      {/* Teaching Requests Section */}
                      <TeachingRequestsSection
                        onTeachSkill={async (skill) => {
                          // TODO: Implement teaching request
                          console.log('Teaching request for skill:', skill);
                          alert(`Teaching request submitted for: ${skill}`);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Show enrichment section even if enriched (for re-connection) - HIDDEN after first enrichment */}
            {false && (
              <div className="mt-6">
                <EnhanceProfile 
                  employeeId={currentEmployeeId} 
                  onEnrichmentComplete={handleEnrichmentComplete}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default TrainerProfile;

