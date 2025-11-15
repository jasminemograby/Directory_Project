import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const DecisionMakerApprovals = ({ employeeId }) => {
  const [requests, setRequests] = useState({
    training: [],
    skillVerification: [],
    selfLearning: [],
    extraAttempts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState({});

  const fetchRequests = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getDecisionMakerPendingRequests(employeeId);
      if (response.data && response.data.success) {
        setRequests(response.data.data || {
          training: [],
          skillVerification: [],
          selfLearning: [],
          extraAttempts: []
        });
      } else {
        setError(response.data?.error || 'Failed to load requests');
      }
    } catch (err) {
      console.error('Error fetching decision maker requests:', err);
      setError(err.response?.data?.error || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleUpdate = async (type, requestId, status) => {
    if (!requestId) return;
    setProcessing((prev) => ({ ...prev, [`${type}-${requestId}`]: true }));
    try {
      switch (type) {
        case 'training':
          await apiService.updateTrainingRequest(requestId, status);
          break;
        case 'skillVerification':
          await apiService.updateSkillVerificationRequest(requestId, status);
          break;
        case 'selfLearning':
          await apiService.updateSelfLearningRequest(requestId, status);
          break;
        case 'extraAttempts':
          await apiService.updateExtraAttemptRequest(requestId, status);
          break;
        default:
          break;
      }
      await fetchRequests();
    } catch (err) {
      console.error('Error updating request:', err);
      setError(err.response?.data?.error || 'Failed to update request');
    } finally {
      setProcessing((prev) => {
        const next = { ...prev };
        delete next[`${type}-${requestId}`];
        return next;
      });
    }
  };

  const renderRequestList = (title, items, type) => (
    <div className="rounded-lg border border-gray-200 p-4 mb-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <span className="text-sm text-gray-500">{items.length} pending</span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No pending requests.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="border border-gray-100 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{item.employee_name}</p>
                  <p className="text-xs text-gray-500">{item.employee_email}</p>
                </div>
                <span className="text-xs uppercase text-orange-500 font-semibold">Pending</span>
              </div>
              {item.course_name && (
                <p className="text-sm text-gray-700 mt-2">
                  <span className="font-semibold">Course:</span> {item.course_name}
                </p>
              )}
              {item.topic && (
                <p className="text-sm text-gray-700 mt-2">
                  <span className="font-semibold">Topic:</span> {item.topic}
                </p>
              )}
              {item.reason && (
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-semibold">Reason:</span> {item.reason}
                </p>
              )}
              <div className="flex gap-2 mt-3">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={processing[`${type}-${item.id}`]}
                  onClick={() => handleUpdate(type, item.id, 'approved')}
                >
                  Approve
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={processing[`${type}-${item.id}`]}
                  onClick={() => handleUpdate(type, item.id, 'rejected')}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        As the decision maker, you can review and approve pending learning-related requests from your team.
      </p>
      {renderRequestList('Training Requests', requests.training, 'training')}
      {renderRequestList('Skill Verification Requests', requests.skillVerification, 'skillVerification')}
      {renderRequestList('Self-Learning Requests', requests.selfLearning, 'selfLearning')}
      {renderRequestList('Extra Attempt Requests', requests.extraAttempts, 'extraAttempts')}
    </div>
  );
};

export default DecisionMakerApprovals;


