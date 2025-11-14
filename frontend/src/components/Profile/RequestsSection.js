// Requests Section Component - Employee can create various requests
import React, { useState } from 'react';
import { apiService } from '../../services/api';
import Button from '../common/Button';

const RequestsSection = ({ employeeId }) => {
  const [activeForm, setActiveForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [trainingForm, setTrainingForm] = useState({ courseId: '', courseName: '', reason: '', targetDate: '' });
  const [skillForm, setSkillForm] = useState({ skillIds: [], reason: '' });
  const [selfLearningForm, setSelfLearningForm] = useState({ topic: '', description: '', estimatedHours: '', targetDate: '' });
  const [extraAttemptForm, setExtraAttemptForm] = useState({ courseId: '', courseName: '', currentAttempts: '', maxAttempts: '', reason: '' });

  const handleSubmit = async (type, formData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      let response;
      switch (type) {
        case 'training':
          response = await apiService.createTrainingRequest(employeeId, formData);
          break;
        case 'skill-verification':
          response = await apiService.createSkillVerificationRequest(employeeId, formData);
          break;
        case 'self-learning':
          response = await apiService.createSelfLearningRequest(employeeId, formData);
          break;
        case 'extra-attempt':
          response = await apiService.createExtraAttemptRequest(employeeId, formData);
          break;
        default:
          throw new Error('Invalid request type');
      }

      if (response.data && response.data.success) {
        setSuccess(`${type.replace('-', ' ')} request submitted successfully!`);
        // Reset form
        setActiveForm(null);
        // Clear form data
        if (type === 'training') setTrainingForm({ courseId: '', courseName: '', reason: '', targetDate: '' });
        else if (type === 'skill-verification') setSkillForm({ skillIds: [], reason: '' });
        else if (type === 'self-learning') setSelfLearningForm({ topic: '', description: '', estimatedHours: '', targetDate: '' });
        else if (type === 'extra-attempt') setExtraAttemptForm({ courseId: '', courseName: '', currentAttempts: '', maxAttempts: '', reason: '' });
        
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(response.data?.error || 'Failed to submit request');
      }
    } catch (err) {
      console.error('Error submitting request:', err);
      setError(err.response?.data?.error || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (!activeForm) return null;

    switch (activeForm) {
      case 'training':
        return (
          <div className="mt-4 p-4 rounded border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-tertiary)' }}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Request Training</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Course ID *</label>
                <input
                  type="text"
                  value={trainingForm.courseId}
                  onChange={(e) => setTrainingForm({ ...trainingForm, courseId: e.target.value })}
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Course Name *</label>
                <input
                  type="text"
                  value={trainingForm.courseName}
                  onChange={(e) => setTrainingForm({ ...trainingForm, courseName: e.target.value })}
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Reason</label>
                <textarea
                  value={trainingForm.reason}
                  onChange={(e) => setTrainingForm({ ...trainingForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Target Date</label>
                <input
                  type="date"
                  value={trainingForm.targetDate}
                  onChange={(e) => setTrainingForm({ ...trainingForm, targetDate: e.target.value })}
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => handleSubmit('training', trainingForm)}
                  disabled={loading || !trainingForm.courseId || !trainingForm.courseName}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button variant="secondary" onClick={() => setActiveForm(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        );

      case 'skill-verification':
        return (
          <div className="mt-4 p-4 rounded border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-tertiary)' }}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Request Skill Verification</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Skill IDs (comma-separated) *</label>
                <input
                  type="text"
                  value={skillForm.skillIds.join(', ')}
                  onChange={(e) => setSkillForm({ ...skillForm, skillIds: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  placeholder="skill-1, skill-2, skill-3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Reason</label>
                <textarea
                  value={skillForm.reason}
                  onChange={(e) => setSkillForm({ ...skillForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => handleSubmit('skill-verification', skillForm)}
                  disabled={loading || skillForm.skillIds.length === 0}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button variant="secondary" onClick={() => setActiveForm(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        );

      case 'self-learning':
        return (
          <div className="mt-4 p-4 rounded border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-tertiary)' }}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Request Self-Learning</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Topic *</label>
                <input
                  type="text"
                  value={selfLearningForm.topic}
                  onChange={(e) => setSelfLearningForm({ ...selfLearningForm, topic: e.target.value })}
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <textarea
                  value={selfLearningForm.description}
                  onChange={(e) => setSelfLearningForm({ ...selfLearningForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Estimated Hours</label>
                  <input
                    type="number"
                    value={selfLearningForm.estimatedHours}
                    onChange={(e) => setSelfLearningForm({ ...selfLearningForm, estimatedHours: e.target.value })}
                    className="w-full px-3 py-2 rounded border"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Target Date</label>
                  <input
                    type="date"
                    value={selfLearningForm.targetDate}
                    onChange={(e) => setSelfLearningForm({ ...selfLearningForm, targetDate: e.target.value })}
                    className="w-full px-3 py-2 rounded border"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => handleSubmit('self-learning', selfLearningForm)}
                  disabled={loading || !selfLearningForm.topic}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button variant="secondary" onClick={() => setActiveForm(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        );

      case 'extra-attempt':
        return (
          <div className="mt-4 p-4 rounded border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-tertiary)' }}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Request Extra Attempt</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Course ID *</label>
                <input
                  type="text"
                  value={extraAttemptForm.courseId}
                  onChange={(e) => setExtraAttemptForm({ ...extraAttemptForm, courseId: e.target.value })}
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Course Name *</label>
                <input
                  type="text"
                  value={extraAttemptForm.courseName}
                  onChange={(e) => setExtraAttemptForm({ ...extraAttemptForm, courseName: e.target.value })}
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Current Attempts</label>
                  <input
                    type="number"
                    value={extraAttemptForm.currentAttempts}
                    onChange={(e) => setExtraAttemptForm({ ...extraAttemptForm, currentAttempts: e.target.value })}
                    className="w-full px-3 py-2 rounded border"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Max Attempts</label>
                  <input
                    type="number"
                    value={extraAttemptForm.maxAttempts}
                    onChange={(e) => setExtraAttemptForm({ ...extraAttemptForm, maxAttempts: e.target.value })}
                    className="w-full px-3 py-2 rounded border"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Reason</label>
                <textarea
                  value={extraAttemptForm.reason}
                  onChange={(e) => setExtraAttemptForm({ ...extraAttemptForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => handleSubmit('extra-attempt', extraAttemptForm)}
                  disabled={loading || !extraAttemptForm.courseId || !extraAttemptForm.courseName}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button variant="secondary" onClick={() => setActiveForm(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
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

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-3 rounded border" style={{ backgroundColor: '#d1fae5', borderColor: '#10b981', color: '#065f46' }}>
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded border" style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {/* Request Buttons */}
      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <Button
          variant={activeForm === 'training' ? 'primary' : 'secondary'}
          onClick={() => setActiveForm(activeForm === 'training' ? null : 'training')}
        >
          Request Training
        </Button>
        <Button
          variant={activeForm === 'skill-verification' ? 'primary' : 'secondary'}
          onClick={() => setActiveForm(activeForm === 'skill-verification' ? null : 'skill-verification')}
        >
          Request Skill Verification
        </Button>
        <Button
          variant={activeForm === 'self-learning' ? 'primary' : 'secondary'}
          onClick={() => setActiveForm(activeForm === 'self-learning' ? null : 'self-learning')}
        >
          Request Self-Learning
        </Button>
        <Button
          variant={activeForm === 'extra-attempt' ? 'primary' : 'secondary'}
          onClick={() => setActiveForm(activeForm === 'extra-attempt' ? null : 'extra-attempt')}
        >
          Request Extra Attempt
        </Button>
      </div>

      {/* Request Forms */}
      {renderForm()}
    </div>
  );
};

export default RequestsSection;
