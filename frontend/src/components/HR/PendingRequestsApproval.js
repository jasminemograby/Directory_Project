// Pending Requests Approval Component - HR reviews and approves/rejects requests
import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import { authService } from '../../utils/auth';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const PendingRequestsApproval = () => {
  const [requests, setRequests] = useState({
    training: [],
    skillVerification: [],
    selfLearning: [],
    extraAttempts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState({});

  const fetchPendingRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const hrEmail = authService.getUserEmail() || localStorage.getItem('hrEmail');
      if (!hrEmail) {
        setError('HR email not found. Please log in again.');
        return;
      }

      const response = await apiService.getPendingRequests(hrEmail);
      
      if (response.data && response.data.success) {
        setRequests(response.data.data);
      } else {
        setError(response.data?.error || 'Failed to fetch pending requests');
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      setError(err.response?.data?.error || 'Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const handleApprove = async (type, requestId, notes = '') => {
    try {
      setProcessing({ ...processing, [`${type}-${requestId}`]: true });

      let response;
      switch (type) {
        case 'training':
          response = await apiService.updateTrainingRequest(requestId, 'approved', notes);
          break;
        case 'skill-verification':
          response = await apiService.updateSkillVerificationRequest(requestId, 'approved', notes);
          break;
        case 'self-learning':
          response = await apiService.updateSelfLearningRequest(requestId, 'approved', notes);
          break;
        case 'extra-attempt':
          response = await apiService.updateExtraAttemptRequest(requestId, 'approved', notes);
          break;
        default:
          throw new Error('Invalid request type');
      }

      if (response.data && response.data.success) {
        // Remove from pending list
        setRequests(prev => ({
          ...prev,
          [type === 'skill-verification' ? 'skillVerification' : type === 'extra-attempt' ? 'extraAttempts' : type === 'self-learning' ? 'selfLearning' : type]: 
            prev[type === 'skill-verification' ? 'skillVerification' : type === 'extra-attempt' ? 'extraAttempts' : type === 'self-learning' ? 'selfLearning' : type].filter(r => r.id !== requestId)
        }));
        alert('Request approved successfully!');
      } else {
        alert(response.data?.error || 'Failed to approve request');
      }
    } catch (err) {
      console.error('Error approving request:', err);
      alert(err.response?.data?.error || 'Failed to approve request');
    } finally {
      setProcessing({ ...processing, [`${type}-${requestId}`]: false });
    }
  };

  const handleReject = async (type, requestId, notes = '') => {
    const reason = window.prompt('Please provide a reason for rejection (optional):', notes);
    if (reason === null) return; // User cancelled

    try {
      setProcessing({ ...processing, [`${type}-${requestId}`]: true });

      let response;
      switch (type) {
        case 'training':
          response = await apiService.updateTrainingRequest(requestId, 'rejected', reason);
          break;
        case 'skill-verification':
          response = await apiService.updateSkillVerificationRequest(requestId, 'rejected', reason);
          break;
        case 'self-learning':
          response = await apiService.updateSelfLearningRequest(requestId, 'rejected', reason);
          break;
        case 'extra-attempt':
          response = await apiService.updateExtraAttemptRequest(requestId, 'rejected', reason);
          break;
        default:
          throw new Error('Invalid request type');
      }

      if (response.data && response.data.success) {
        // Remove from pending list
        setRequests(prev => ({
          ...prev,
          [type === 'skill-verification' ? 'skillVerification' : type === 'extra-attempt' ? 'extraAttempts' : type === 'self-learning' ? 'selfLearning' : type]: 
            prev[type === 'skill-verification' ? 'skillVerification' : type === 'extra-attempt' ? 'extraAttempts' : type === 'self-learning' ? 'selfLearning' : type].filter(r => r.id !== requestId)
        }));
        alert('Request rejected.');
      } else {
        alert(response.data?.error || 'Failed to reject request');
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert(err.response?.data?.error || 'Failed to reject request');
    } finally {
      setProcessing({ ...processing, [`${type}-${requestId}`]: false });
    }
  };

  const renderRequestCard = (request, type, typeLabel) => {
    const isProcessing = processing[`${type}-${request.id}`];

    return (
      <div
        key={request.id}
        className="rounded-lg p-4 border mb-3"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--bg-tertiary)'
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {typeLabel} - {request.employee_name || 'Employee'}
            </h3>
            <div className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p><strong>Employee:</strong> {request.employee_email}</p>
              {type === 'training' && (
                <>
                  <p><strong>Course:</strong> {request.course_name} ({request.course_id})</p>
                  {request.reason && <p><strong>Reason:</strong> {request.reason}</p>}
                  {request.target_date && <p><strong>Target Date:</strong> {new Date(request.target_date).toLocaleDateString()}</p>}
                </>
              )}
              {type === 'skill-verification' && (
                <>
                  <p><strong>Skills:</strong> {Array.isArray(request.skill_ids) ? request.skill_ids.join(', ') : request.skill_ids}</p>
                  {request.reason && <p><strong>Reason:</strong> {request.reason}</p>}
                </>
              )}
              {type === 'self-learning' && (
                <>
                  <p><strong>Topic:</strong> {request.topic}</p>
                  {request.description && <p><strong>Description:</strong> {request.description}</p>}
                  {request.estimated_hours && <p><strong>Estimated Hours:</strong> {request.estimated_hours}</p>}
                  {request.target_date && <p><strong>Target Date:</strong> {new Date(request.target_date).toLocaleDateString()}</p>}
                </>
              )}
              {type === 'extra-attempt' && (
                <>
                  <p><strong>Course:</strong> {request.course_name} ({request.course_id})</p>
                  <p><strong>Attempts:</strong> {request.current_attempts} / {request.max_attempts}</p>
                  {request.reason && <p><strong>Reason:</strong> {request.reason}</p>}
                </>
              )}
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Created: {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleApprove(type, request.id)}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Approve'}
            </Button>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => handleReject(type, request.id)}
              disabled={isProcessing}
              style={{ color: '#dc2626' }}
            >
              {isProcessing ? 'Processing...' : 'Reject'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg p-4 border border-red-200" style={{ backgroundColor: '#fee2e2' }}>
        <p className="text-red-800">{error}</p>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchPendingRequests}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  const totalPending = requests.training.length + requests.skillVerification.length + 
                      requests.selfLearning.length + requests.extraAttempts.length;

  return (
    <div className="rounded-lg p-6" style={{ 
      backgroundColor: 'var(--bg-card)', 
      boxShadow: 'var(--shadow-card)', 
      borderColor: 'var(--bg-secondary)', 
      borderWidth: '1px', 
      borderStyle: 'solid' 
    }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Pending Requests
        </h2>
        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ 
          backgroundColor: 'var(--bg-tertiary)', 
          color: 'var(--text-primary)' 
        }}>
          {totalPending} pending
        </span>
      </div>

      {totalPending === 0 ? (
        <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
          No pending requests. All requests have been processed.
        </p>
      ) : (
        <div className="space-y-6">
          {/* Training Requests */}
          {requests.training.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Training Requests ({requests.training.length})
              </h3>
              {requests.training.map(request => renderRequestCard(request, 'training', 'Training'))}
            </div>
          )}

          {/* Skill Verification Requests */}
          {requests.skillVerification.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Skill Verification Requests ({requests.skillVerification.length})
              </h3>
              {requests.skillVerification.map(request => renderRequestCard(request, 'skill-verification', 'Skill Verification'))}
            </div>
          )}

          {/* Self-Learning Requests */}
          {requests.selfLearning.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Self-Learning Requests ({requests.selfLearning.length})
              </h3>
              {requests.selfLearning.map(request => renderRequestCard(request, 'self-learning', 'Self-Learning'))}
            </div>
          )}

          {/* Extra Attempt Requests */}
          {requests.extraAttempts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Extra Attempt Requests ({requests.extraAttempts.length})
              </h3>
              {requests.extraAttempts.map(request => renderRequestCard(request, 'extra-attempt', 'Extra Attempt'))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PendingRequestsApproval;

