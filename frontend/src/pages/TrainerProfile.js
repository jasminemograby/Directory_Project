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
        {/* Trainer-Specific Header */}
        <div className="rounded-lg p-6 mb-6" style={{ 
          backgroundColor: 'var(--bg-card)', 
          boxShadow: 'var(--shadow-card)', 
          borderColor: 'var(--bg-secondary)', 
          borderWidth: '1px', 
          borderStyle: 'solid' 
        }}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Trainer Profile
            </h1>
            <Button
              variant="secondary"
              onClick={() => navigate(ROUTES.TRAINER_DASHBOARD)}
            >
              Trainer Dashboard
            </Button>
          </div>

          {/* Trainer Status and Settings */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Trainer Status</h3>
              <span className={`px-3 py-1 rounded text-sm font-medium capitalize ${
                trainerData.trainerStatus === 'Active' 
                  ? 'bg-accent-green text-white' 
                  : trainerData.trainerStatus === 'Invited'
                  ? 'bg-accent-orange text-white'
                  : 'bg-gray-500 text-white'
              }`}>
                {trainerData.trainerStatus}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>AI Enabled</h3>
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                trainerData.aiEnabled 
                  ? 'bg-accent-green text-white' 
                  : 'bg-gray-400 text-white'
              }`}>
                {trainerData.aiEnabled ? 'Yes' : 'No'}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Public Publish</h3>
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                trainerData.publicPublishEnabled 
                  ? 'bg-accent-green text-white' 
                  : 'bg-gray-400 text-white'
              }`}>
                {trainerData.publicPublishEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Employee Profile Component (reuse) */}
        <EmployeeProfile employeeId={currentEmployeeId} />

        {/* Teaching Requests Section */}
        <div className="rounded-lg p-6 mt-6" style={{ 
          backgroundColor: 'var(--bg-card)', 
          boxShadow: 'var(--shadow-card)', 
          borderColor: 'var(--bg-secondary)', 
          borderWidth: '1px', 
          borderStyle: 'solid' 
        }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Teaching Requests</h2>
            <Button
              variant="primary"
              onClick={() => {
                // TODO: Navigate to teaching request form
                console.log('Navigate to teaching request form');
              }}
            >
              Teach a Skill
            </Button>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Submit requests to teach specific skills.</p>
        </div>
      </div>
    </Layout>
  );
};

export default TrainerProfile;

