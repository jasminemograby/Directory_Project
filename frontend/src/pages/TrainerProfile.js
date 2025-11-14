// Trainer Profile Page - Employee Profile + Trainer-specific fields
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import EmployeeProfile from './EmployeeProfile';
import Button from '../components/common/Button';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES } from '../utils/constants';

const TrainerProfile = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [trainerData, setTrainerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get employee ID from localStorage if not in URL
  const currentEmployeeId = useMemo(() => {
    return employeeId || localStorage.getItem('currentEmployeeId');
  }, [employeeId]);

  const fetchTrainerData = useCallback(async () => {
    if (!currentEmployeeId) {
      setError('Please set an employee ID.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch trainer-specific data
      // TODO: Replace with actual API call when trainer endpoints are ready
      // For now, get from employee profile and check if type is trainer
      const employeeResponse = await apiService.getEmployee(currentEmployeeId);
      if (employeeResponse.data && employeeResponse.data.data) {
        const employee = employeeResponse.data.data;
        
        // Check if employee is a trainer
        if (employee.type !== 'internal_instructor' && employee.type !== 'external_instructor') {
          setError('This employee is not a trainer.');
          setLoading(false);
          return;
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

        setTrainerData({
          ...employee,
          trainerStatus: employee.trainer_status || 'Active', // Invited → Active → Archived
          aiEnabled: employee.ai_enabled !== undefined ? employee.ai_enabled : true,
          publicPublishEnabled: employee.public_publish_enabled !== undefined ? employee.public_publish_enabled : false,
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

  useEffect(() => {
    fetchTrainerData();
  }, [fetchTrainerData]);

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
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Trainer Profile</h1>

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
            {/* Top Section - Name, Email, Actions */}
            <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {employee.name || 'Trainer Name'}
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
                    onClick={() => navigate(ROUTES.TRAINER_DASHBOARD)}
                  >
                    Trainer Dashboard
                  </Button>
                </div>
              </div>
            </div>

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
                taughtCourses={trainerData?.taughtCourses || []}
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

            {/* Teaching Requests Section */}
            <TeachingRequestsSection
              onTeachSkill={async (skill) => {
                // TODO: Implement teaching request
                console.log('Teaching request for skill:', skill);
                alert(`Teaching request submitted for: ${skill}`);
              }}
            />

            {/* Requests Section (Employee requests) */}
            <RequestsSection
              onRequestTraining={async () => {
                console.log('Requesting training...');
                alert('Training request submitted!');
              }}
              onRequestTrainer={async () => {
                console.log('Requesting to become trainer...');
                alert('You are already a trainer!');
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

export default TrainerProfile;

