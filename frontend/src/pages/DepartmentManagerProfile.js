// Department Manager Profile Page - Employee Profile + Full Hierarchy (dept → teams → employees)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import EnhanceProfile from '../components/Profile/EnhanceProfile';
import CareerBlock from '../components/Profile/CareerBlock';
import SkillsTree from '../components/Profile/SkillsTree';
import CoursesSection from '../components/Profile/CoursesSection';
import RequestsSection from '../components/Profile/RequestsSection';
import HierarchyTree from '../components/Profile/HierarchyTree';
import Button from '../components/common/Button';
import { apiService } from '../services/api';
import { mockDataService } from '../services/mockData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES, getProfilePath } from '../utils/constants';

const DepartmentManagerProfile = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [hierarchy, setHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnriched, setIsEnriched] = useState(false);

  const currentEmployeeId = useMemo(() => {
    return employeeId || localStorage.getItem('currentEmployeeId');
  }, [employeeId]);

  const fetchDepartmentManagerData = useCallback(async () => {
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
        setEmployee(emp);

        // Fetch processed data
        try {
          const processedResponse = await apiService.getProcessedData(currentEmployeeId);
          if (processedResponse.data && processedResponse.data.data) {
            setProcessedData(processedResponse.data.data);
            setIsEnriched(true);
          }
        } catch (processedError) {
          console.warn('No processed data available yet:', processedError.message);
        }

        // Fetch profile data
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

        // Fetch department hierarchy (departments → teams → employees)
        try {
          const hierarchyResponse = await apiService.getDepartmentHierarchy(currentEmployeeId);
          if (hierarchyResponse.data && hierarchyResponse.data.data && hierarchyResponse.data.data.hierarchy) {
            setHierarchy(hierarchyResponse.data.data.hierarchy);
          } else {
            // Fallback to mock if API returns null
            const mockHierarchy = {
              name: emp.department_name || 'My Department',
              type: 'Department',
              teams: []
            };
            setHierarchy(mockHierarchy);
          }
        } catch (hierarchyError) {
          console.warn('Could not fetch hierarchy, using fallback:', hierarchyError.message);
          // Fallback to mock
          const mockHierarchy = {
            name: emp.department_name || 'My Department',
            type: 'Department',
            teams: []
          };
          setHierarchy(mockHierarchy);
        }
      } else {
        setError('Department Manager profile not found.');
      }
    } catch (error) {
      console.error('Error fetching department manager data:', error);
      if (error.response?.status === 404) {
        setError('Department Manager profile not found.');
      } else {
        setError('Failed to load department manager profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentEmployeeId]);

  useEffect(() => {
    fetchDepartmentManagerData();
  }, [fetchDepartmentManagerData]);

  const handleEnrichmentComplete = useCallback(() => {
    setIsEnriched(true);
    fetchDepartmentManagerData();
  }, [fetchDepartmentManagerData]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="rounded-lg p-6 border border-red-200" style={{ backgroundColor: '#fee2e2' }}>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Department Manager Profile</h1>

        {/* Mandatory Profile Enrichment Section */}
        {!isEnriched && (
          <div className="mb-6">
            <EnhanceProfile 
              employeeId={currentEmployeeId} 
              onEnrichmentComplete={handleEnrichmentComplete}
            />
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-yellow-800 font-medium">
                ⚠️ Please connect your GitHub account to enrich your profile before continuing.
              </p>
            </div>
          </div>
        )}

        {/* Profile Content */}
        {isEnriched && employee && (
          <div className="space-y-6">
            {/* Top Section */}
            <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {employee.name || 'Department Manager Name'}
                  </h2>
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
                    onClick={() => navigate(ROUTES.MANAGER_DASHBOARD)}
                  >
                    Manager Dashboard
                  </Button>
                </div>
              </div>
            </div>

            {/* Full Hierarchy Section (Department → Teams → Employees) */}
            {hierarchy && (
              <HierarchyTree
                hierarchy={hierarchy}
                onEmployeeClick={(employeeId, employeeName) => {
                  navigate(getProfilePath(employeeId));
                }}
              />
            )}

            {/* Bio Section */}
            {processedData?.bio && (
              <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Professional Bio</h2>
                <p className="leading-relaxed" style={{ color: 'var(--text-primary)' }}>{processedData.bio}</p>
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
                  console.log('Requesting skill verification...');
                  alert('Skill verification request submitted!');
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

            {/* Projects Section */}
            {processedData?.projects && processedData.projects.length > 0 && (
              <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Projects</h2>
                <div className="space-y-4">
                  {processedData.projects.map((project) => (
                    <div key={project.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                      <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{project.title}</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>{project.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requests Section */}
            <RequestsSection
              onRequestTraining={async () => {
                console.log('Requesting training...');
                alert('Training request submitted!');
              }}
              onRequestTrainer={async () => {
                console.log('Requesting to become trainer...');
                alert('Trainer request submitted!');
              }}
              onRequestSkillVerification={async () => {
                console.log('Requesting skill verification...');
                alert('Skill verification request submitted!');
              }}
              onRequestSelfLearning={async () => {
                console.log('Requesting self-learning...');
                alert('Self-learning request submitted!');
              }}
            />
          </div>
        )}

        {/* Show enrichment section even if enriched */}
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

export default DepartmentManagerProfile;

