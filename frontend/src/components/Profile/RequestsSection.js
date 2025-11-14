// Requests Section Component - Employee can create various requests
import React, { useState } from 'react';
import { apiService } from '../../services/api';
import Button from '../common/Button';

const RequestsSection = ({ employeeId }) => {
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [showSkillVerificationForm, setShowSkillVerificationForm] = useState(false);
  const [showSelfLearningForm, setShowSelfLearningForm] = useState(false);
  const [showExtraAttemptForm, setShowExtraAttemptForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleTrainingRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.target);
    const data = {
      courseId: formData.get('courseId'),
      courseName: formData.get('courseName'),
      reason: formData.get('reason')
    };

    try {
      const response = await apiService.createTrainingRequest(employeeId, data);
      if (response.data && response.data.success) {
        setMessage({ type: 'success', text: 'Training request submitted successfully!' });
        setShowTrainingForm(false);
        e.target.reset();
      } else {
        setMessage({ type: 'error', text: response.data?.error || 'Failed to submit request' });
      }
    } catch (error) {
      console.error('Error creating training request:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to submit training request' });
    } finally {
      setLoading(false);
    }
  };

  const handleSkillVerificationRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.target);
    const skillIdsInput = formData.get('skillIds');
    const skillIds = skillIdsInput ? skillIdsInput.split(',').map(id => id.trim()) : [];

    const data = {
      skillIds: skillIds,
      reason: formData.get('reason')
    };

    try {
      const response = await apiService.createSkillVerificationRequest(employeeId, data);
      if (response.data && response.data.success) {
        setMessage({ type: 'success', text: 'Skill verification request submitted successfully!' });
        setShowSkillVerificationForm(false);
        e.target.reset();
      } else {
        setMessage({ type: 'error', text: response.data?.error || 'Failed to submit request' });
      }
    } catch (error) {
      console.error('Error creating skill verification request:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to submit skill verification request' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelfLearningRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.target);
    const data = {
      courseId: formData.get('courseId'),
      courseName: formData.get('courseName'),
      reason: formData.get('reason'),
      learningPath: formData.get('learningPath')
    };

    try {
      const response = await apiService.createSelfLearningRequest(employeeId, data);
      if (response.data && response.data.success) {
        setMessage({ type: 'success', text: 'Self-learning request submitted successfully!' });
        setShowSelfLearningForm(false);
        e.target.reset();
      } else {
        setMessage({ type: 'error', text: response.data?.error || 'Failed to submit request' });
      }
    } catch (error) {
      console.error('Error creating self-learning request:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to submit self-learning request' });
    } finally {
      setLoading(false);
    }
  };

  const handleExtraAttemptRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.target);
    const data = {
      courseId: formData.get('courseId'),
      courseName: formData.get('courseName'),
      currentAttempts: parseInt(formData.get('currentAttempts')),
      reason: formData.get('reason')
    };

    try {
      const response = await apiService.createExtraAttemptRequest(employeeId, data);
      if (response.data && response.data.success) {
        setMessage({ type: 'success', text: 'Extra attempt request submitted successfully!' });
        setShowExtraAttemptForm(false);
        e.target.reset();
      } else {
        setMessage({ type: 'error', text: response.data?.error || 'Failed to submit request' });
      }
    } catch (error) {
      console.error('Error creating extra attempt request:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to submit extra attempt request' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg p-6" style={{ 
      backgroundColor: 'var(--bg-card)', 
      boxShadow: 'var(--shadow-card)', 
      borderColor: 'var(--bg-secondary)', 
      borderWidth: '1px', 
      borderStyle: 'solid' 
    }}>
      <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Requests</h2>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Request Buttons */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Button
          variant="primary"
          onClick={() => {
            setShowTrainingForm(!showTrainingForm);
            setShowSkillVerificationForm(false);
            setShowSelfLearningForm(false);
            setShowExtraAttemptForm(false);
          }}
        >
          Request Training
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            setShowSkillVerificationForm(!showSkillVerificationForm);
            setShowTrainingForm(false);
            setShowSelfLearningForm(false);
            setShowExtraAttemptForm(false);
          }}
        >
          Verify Your Skills
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            setShowSelfLearningForm(!showSelfLearningForm);
            setShowTrainingForm(false);
            setShowSkillVerificationForm(false);
            setShowExtraAttemptForm(false);
          }}
        >
          Request Self-Learning
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            setShowExtraAttemptForm(!showExtraAttemptForm);
            setShowTrainingForm(false);
            setShowSkillVerificationForm(false);
            setShowSelfLearningForm(false);
          }}
        >
          Request Extra Attempts
        </Button>
      </div>

      {/* Training Request Form */}
      {showTrainingForm && (
        <div className="mb-4 p-4 rounded border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-tertiary)' }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Request Training</h3>
          <form onSubmit={handleTrainingRequest}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Course ID *
                </label>
                <input
                  type="text"
                  name="courseId"
                  required
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Course Name *
                </label>
                <input
                  type="text"
                  name="courseName"
                  required
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Reason (Optional)
                </label>
                <textarea
                  name="reason"
                  rows="3"
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowTrainingForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Skill Verification Request Form */}
      {showSkillVerificationForm && (
        <div className="mb-4 p-4 rounded border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-tertiary)' }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Request Skill Verification</h3>
          <form onSubmit={handleSkillVerificationRequest}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Skill IDs (comma-separated) *
                </label>
                <input
                  type="text"
                  name="skillIds"
                  required
                  placeholder="skill-1, skill-2, skill-3"
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Enter skill IDs separated by commas
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Reason (Optional)
                </label>
                <textarea
                  name="reason"
                  rows="3"
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowSkillVerificationForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Self-Learning Request Form */}
      {showSelfLearningForm && (
        <div className="mb-4 p-4 rounded border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-tertiary)' }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Request Self-Learning</h3>
          <form onSubmit={handleSelfLearningRequest}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Course ID *
                </label>
                <input
                  type="text"
                  name="courseId"
                  required
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Course Name *
                </label>
                <input
                  type="text"
                  name="courseName"
                  required
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Learning Path (Optional)
                </label>
                <input
                  type="text"
                  name="learningPath"
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Reason (Optional)
                </label>
                <textarea
                  name="reason"
                  rows="3"
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowSelfLearningForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Extra Attempt Request Form */}
      {showExtraAttemptForm && (
        <div className="mb-4 p-4 rounded border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-tertiary)' }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Request Extra Attempts</h3>
          <form onSubmit={handleExtraAttemptRequest}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Course ID *
                </label>
                <input
                  type="text"
                  name="courseId"
                  required
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Course Name *
                </label>
                <input
                  type="text"
                  name="courseName"
                  required
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Current Attempts *
                </label>
                <input
                  type="number"
                  name="currentAttempts"
                  required
                  min="0"
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Reason (Optional)
                </label>
                <textarea
                  name="reason"
                  rows="3"
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowExtraAttemptForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RequestsSection;
