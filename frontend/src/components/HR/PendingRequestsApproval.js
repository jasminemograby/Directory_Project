// Pending Requests Approval Component - HR reviews and approves/rejects employee requests
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

  const handleApprove = async (requestType, requestId) => {
    if (!window.confirm(`Are you sure you want to approve this ${requestType} request?`)) {
      return;
    }

    const key = `${requestType}-${requestId}`;
    setProcessing(prev => ({ ...prev, [key]: true }));

    try {
      const response = await apiService.approveRequest(requestType, requestId, null);
      
      if (response.data && response.data.success) {
        // Remove from list
        setRequests(prev => ({
          ...prev,
          [requestType]: prev[requestType].filter(r => r.id !== requestId)
        }));
        alert('Request approved successfully!');
      } else {
        alert(response.data?.error || 'Failed to approve request');
      }
    } catch (err) {
      console.error('Error approving request:', err);
      alert(err.response?.data?.error || 'Failed to approve request');
    } finally {
      setProcessing(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleReject = async (requestType, requestId) => {
    const reason = window.prompt('Please provide a reason for rejection (optional):');
    
    const key = `${requestType}-${requestId}`;
    setProcessing(prev => ({ ...prev, [key]: true }));

    try {
      const response = await apiService.rejectRequest(requestType, requestId, reason || null);
      
      if (response.data && response.data.success) {
        // Remove from list
        setRequests(prev => ({
          ...prev,
          [requestType]: prev[requestType].filter(r => r.id !== requestId)
        }));
        alert('Request rejected.');
      } else {
        alert(response.data?.error || 'Failed to reject request');
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert(err.response?.data?.error || 'Failed to reject request');
    } finally {
      setProcessing(prev => ({ ...prev, [key]: false }));
    }
  };

  const renderRequestCard = (request, requestType) => {
    const key = `${requestType}-${request.id}`;
    const isProcessing = processing[key];

    return (
      <div
        key={request.id}
        className="rounded-lg p-4 border transition-all"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--bg-tertiary)'
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {request.employee_name || 'Employee'}
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {request.employee_email}
            </p>
          </div>
          <span className="px-2 py-1 text-xs rounded capitalize" style={{ 
            backgroundColor: 'var(--accent-orange)', 
            color: 'white' 
          }}>
            {requestType.replace('-', ' ')}
          </span>
        </div>

        <div className="mt-3 space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {request.course_name && (
            <p><strong>Course:</strong> {request.course_name}</p>
          )}
          {request.course_id && (
            <p><strong>Course ID:</strong> {request.course_id}</p>
          )}
          {request.current_attempts !== undefined && (
            <p><strong>Current Attempts:</strong> {request.current_attempts}</p>
          )}
          {request.skill_ids && (
            <p><strong>Skills:</strong> {Array.isArray(request.skill_ids) ? request.skill_ids.join(', ') : request.skill_ids}</p>
          )}
          {request.reason && (
            <p><strong>Reason:</strong> {request.reason}</p>
          )}
          {request.learning_path && (
            <p><strong>Learning Path:</strong> {request.learning_path}</p>
          )}
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Created: {new Date(request.created_at).toLocaleString()}
          </p>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleApprove(requestType, request.id)}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Approve'}
          </Button>
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => handleReject(requestType, request.id)}
            disabled={isProcessing}
            style={{ color: '#dc2626' }}
          >
            {isProcessing ? 'Processing...' : 'Reject'}
          </Button>
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

  const totalRequests = requests.training.length + 
                       requests.skillVerification.length + 
                       requests.selfLearning.length + 
                       requests.extraAttempts.length;

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
          {totalRequests} pending
        </span>
      </div>

      {totalRequests === 0 ? (
        <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
          No pending requests. All employee requests have been processed.
        </p>
      ) : (
        <div className="space-y-6">
          {/* Training Requests */}
          {requests.training.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                Training Requests ({requests.training.length})
              </h3>
              <div className="space-y-3">
                {requests.training.map(request => renderRequestCard(request, 'training'))}
              </div>
            </div>
          )}

          {/* Skill Verification Requests */}
          {requests.skillVerification.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                Skill Verification Requests ({requests.skillVerification.length})
              </h3>
              <div className="space-y-3">
                {requests.skillVerification.map(request => renderRequestCard(request, 'skill-verification'))}
              </div>
            </div>
          )}

          {/* Self-Learning Requests */}
          {requests.selfLearning.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                Self-Learning Requests ({requests.selfLearning.length})
              </h3>
              <div className="space-y-3">
                {requests.selfLearning.map(request => renderRequestCard(request, 'self-learning'))}
              </div>
            </div>
          )}

          {/* Extra Attempt Requests */}
          {requests.extraAttempts.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                Extra Attempt Requests ({requests.extraAttempts.length})
              </h3>
              <div className="space-y-3">
                {requests.extraAttempts.map(request => renderRequestCard(request, 'extra-attempts'))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PendingRequestsApproval;

