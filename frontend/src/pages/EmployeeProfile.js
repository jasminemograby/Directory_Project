// Employee Profile Page - Main profile page with mandatory profile enrichment
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import EnhanceProfile from '../components/Profile/EnhanceProfile';
import CareerBlock from '../components/Profile/CareerBlock';
import SkillsTree from '../components/Profile/SkillsTree';
import CoursesSection from '../components/Profile/CoursesSection';
import RequestsSection from '../components/Profile/RequestsSection';
import Button from '../components/common/Button';
import { apiService } from '../services/api';
import { mockDataService } from '../services/mockData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES } from '../utils/constants';

const EmployeeProfile = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [profileData, setProfileData] = useState(null); // Additional profile data (career, skills, courses)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnriched, setIsEnriched] = useState(false);

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
        // GitHub is required, LinkedIn is optional
        setIsEnriched(status.github === true);
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
    hasLoadedData.current = false;
    
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
  }, [currentEmployeeId]); // Only depend on currentEmployeeId to prevent infinite loop


  // Use ref to prevent multiple calls
  const enrichmentCompleteCalled = useRef(false);
  
  const handleEnrichmentComplete = useCallback(async () => {
    if (enrichmentCompleteCalled.current) return;
    enrichmentCompleteCalled.current = true;
    
    setIsEnriched(true);
    // Refresh employee data and processed data to show updated profile
    await fetchEmployeeData();
    
    // Reset after a delay to allow re-triggering if needed
    setTimeout(() => {
      enrichmentCompleteCalled.current = false;
    }, 5000);
  }, [fetchEmployeeData]);

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
                ⚠️ Please connect your GitHub account to enrich your profile before continuing.
              </p>
              <p className="text-yellow-700 text-sm mt-2">
                GitHub connection is required to generate your skill profile and enable access to assessments and learning paths.
                LinkedIn connection is optional but recommended for a more complete profile.
              </p>
            </div>
          </div>
        )}

        {/* Profile Content - Only show processed data (NOT raw data) */}
        {isEnriched && employee && (
          <div className="space-y-6">
            {/* Top Section - Name, Email, Actions */}
            <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {employee.name || 'Employee Name'}
                  </h1>
                  <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                    {employee.email || 'email@example.com'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(ROUTES.PROFILE_EDIT_ME)}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => navigate(ROUTES.EMPLOYEE_DASHBOARD)}
                  >
                    Dashboard
                  </Button>
                </div>
              </div>

                  {/* External Data Icons */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t" style={{ borderColor: 'var(--bg-secondary)' }}>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>External Data:</span>
                    <div className="flex gap-2">
                      {/* LinkedIn */}
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center cursor-default"
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                        title="LinkedIn"
                      >
                        <span className="text-xs">in</span>
                      </div>
                      {/* GitHub */}
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center cursor-default"
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                        title="GitHub"
                      >
                        <span className="text-xs">GH</span>
                      </div>
                      {/* Credly */}
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center cursor-default"
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                        title="Credly"
                      >
                        <span className="text-xs">C</span>
                      </div>
                      {/* ORCID */}
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center cursor-default"
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                        title="ORCID"
                      >
                        <span className="text-xs">OR</span>
                      </div>
                      {/* Crossref */}
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center cursor-default"
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                        title="Crossref"
                      >
                        <span className="text-xs">CR</span>
                      </div>
                      {/* YouTube */}
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center cursor-default"
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                        title="YouTube"
                      >
                        <span className="text-xs">YT</span>
                      </div>
                    </div>
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

            {/* Career Block */}
            {profileData && profileData.career && (
              <CareerBlock
                currentRole={profileData.career.currentRole || profileData.career.current_role}
                targetRole={profileData.career.targetRole || profileData.career.target_role}
                valueProposition={profileData.career.valueProposition || profileData.career.value_proposition}
                relevanceScore={profileData.career.relevanceScore || profileData.career.relevance_score}
              />
            )}

            {/* Skills Tree */}
            {profileData && (
              <SkillsTree
                competencies={profileData.competencies || profileData.skills}
                onVerifySkills={async () => {
                  // TODO: Implement skill verification request to Skills Engine
                  console.log('Requesting skill verification...');
                  // POST to Skills Engine
                  try {
                    // await apiService.requestSkillVerification(currentEmployeeId);
                    alert('Skill verification request submitted!');
                  } catch (error) {
                    console.error('Error requesting skill verification:', error);
                    alert('Failed to submit skill verification request.');
                  }
                }}
              />
            )}

            {/* Courses Section */}
            {profileData && profileData.courses && (
              <CoursesSection
                assignedCourses={profileData.courses.assigned || []}
                learningCourses={profileData.courses.learning || []}
                completedCourses={profileData.courses.completed || []}
                taughtCourses={profileData.courses.taught || []}
              />
            )}

            {/* Requests Section */}
            {currentEmployeeId && (
              <RequestsSection employeeId={currentEmployeeId} />
            )}

            {/* Show taught courses if employee is a trainer */}
            {employee && (employee.type === 'internal_instructor' || employee.type === 'external_instructor') && profileData && profileData.courses && profileData.courses.taught && profileData.courses.taught.length > 0 && (
              <div className="rounded-lg p-6" style={{ 
                backgroundColor: 'var(--bg-card)', 
                boxShadow: 'var(--shadow-card)', 
                borderColor: 'var(--bg-secondary)', 
                borderWidth: '1px', 
                borderStyle: 'solid' 
              }}>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Courses Taught</h2>
                <div className="space-y-2">
                  {profileData.courses.taught.map((course, idx) => (
                    <div 
                      key={course.course_id || idx}
                      className="p-4 rounded border"
                      style={{ 
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: course.status === 'archived' ? 'var(--text-muted)' : 'var(--accent-orange)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {course.course_name || course.name}
                        </p>
                        <span className="px-2 py-1 text-xs rounded capitalize" style={{ 
                          backgroundColor: course.status === 'archived' ? 'var(--text-muted)' : 'var(--accent-orange)', 
                          color: 'white' 
                        }}>
                          {course.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requests Section */}
            <RequestsSection
              onRequestTraining={async () => {
                // TODO: Implement training request
                console.log('Requesting training...');
                alert('Training request submitted!');
              }}
              onRequestTrainer={async () => {
                // TODO: Implement trainer request
                console.log('Requesting to become trainer...');
                alert('Trainer request submitted!');
              }}
              onRequestSkillVerification={async () => {
                // TODO: Implement skill verification request
                console.log('Requesting skill verification...');
                alert('Skill verification request submitted!');
              }}
              onRequestSelfLearning={async () => {
                // TODO: Implement self-learning request
                console.log('Requesting self-learning...');
                alert('Self-learning request submitted!');
              }}
            />

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

