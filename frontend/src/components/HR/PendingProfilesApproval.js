// Pending Profiles Approval Component - HR reviews and approves employee profiles
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { authService } from '../../utils/auth';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { getProfilePath } from '../../utils/constants';

const PendingProfilesApproval = () => {
  const navigate = useNavigate();
  const [pendingProfiles, setPendingProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const fetchPendingProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const hrEmail = authService.getUserEmail() || localStorage.getItem('hrEmail');
      if (!hrEmail) {
        setError('HR email not found. Please log in again.');
        return;
      }

      const response = await apiService.getPendingProfiles(hrEmail);
      
      if (response.data && response.data.success) {
        setPendingProfiles(response.data.data.pendingProfiles || []);
      } else {
        setError(response.data?.error || 'Failed to fetch pending profiles');
      }
    } catch (err) {
      console.error('Error fetching pending profiles:', err);
      setError(err.response?.data?.error || 'Failed to load pending profiles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingProfiles();
  }, [fetchPendingProfiles]);

  const handleViewProfile = async (employeeId) => {
    try {
      const response = await apiService.getProfileForApproval(employeeId);
      if (response.data && response.data.success) {
        setSelectedProfile(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching profile details:', err);
      alert('Failed to load profile details');
    }
  };

  const handleApprove = async (employeeId) => {
    if (!window.confirm('Are you sure you want to approve this profile?')) {
      return;
    }

    try {
      setApproving(true);
      const response = await apiService.approveProfile(employeeId, null);
      
      if (response.data && response.data.success) {
        // Remove from pending list
        setPendingProfiles(prev => prev.filter(p => p.id !== employeeId));
        setSelectedProfile(null);
        alert('Profile approved successfully!');
      } else {
        alert(response.data?.error || 'Failed to approve profile');
      }
    } catch (err) {
      console.error('Error approving profile:', err);
      alert(err.response?.data?.error || 'Failed to approve profile');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (employeeId) => {
    const reason = window.prompt('Please provide a reason for rejection (optional):');
    
    try {
      setRejecting(true);
      const response = await apiService.rejectProfile(employeeId, reason || null);
      
      if (response.data && response.data.success) {
        // Remove from pending list
        setPendingProfiles(prev => prev.filter(p => p.id !== employeeId));
        setSelectedProfile(null);
        alert('Profile rejected.');
      } else {
        alert(response.data?.error || 'Failed to reject profile');
      }
    } catch (err) {
      console.error('Error rejecting profile:', err);
      alert(err.response?.data?.error || 'Failed to reject profile');
    } finally {
      setRejecting(false);
    }
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
          onClick={fetchPendingProfiles}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Profiles List */}
      <div className="rounded-lg p-6" style={{ 
        backgroundColor: 'var(--bg-card)', 
        boxShadow: 'var(--shadow-card)', 
        borderColor: 'var(--bg-secondary)', 
        borderWidth: '1px', 
        borderStyle: 'solid' 
      }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Pending Profile Approvals
          </h2>
          <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ 
            backgroundColor: 'var(--bg-tertiary)', 
            color: 'var(--text-primary)' 
          }}>
            {pendingProfiles.length} pending
          </span>
        </div>

        {pendingProfiles.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
            No pending profiles. All employee profiles have been approved.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingProfiles.map((profile) => (
              <div
                key={profile.id}
                className="rounded-lg p-4 border transition-all hover:shadow-md"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--bg-tertiary)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {profile.name}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span>Email: {profile.email}</span>
                      {profile.role && <span>Job Title: {profile.role}</span>}
                      {profile.departmentName && <span>Department: {profile.departmentName}</span>}
                      {profile.teamName && <span>Team: {profile.teamName}</span>}
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                      Created: {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleViewProfile(profile.id)}
                    >
                      Review
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(profile.id)}
                      disabled={approving}
                    >
                      {approving ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button
                      variant="tertiary"
                      size="sm"
                      onClick={() => handleReject(profile.id)}
                      disabled={rejecting}
                      style={{ color: '#dc2626' }}
                    >
                      {rejecting ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Review Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Profile Review: {selectedProfile.employee.name}
              </h3>
              <button
                onClick={() => setSelectedProfile(null)}
                className="text-gray-500 hover:text-gray-700"
                style={{ color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Info */}
              <div>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Basic Information</h4>
                <div className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <p><strong>Email:</strong> {selectedProfile.employee.email}</p>
                  <p><strong>Job Title:</strong> {selectedProfile.employee.role || 'N/A'}</p>
                  <p><strong>Employee Type:</strong> {selectedProfile.employee.type || 'N/A'}</p>
                  <p><strong>Current Role:</strong> {selectedProfile.employee.currentRole || 'N/A'}</p>
                  <p><strong>Target Role:</strong> {selectedProfile.employee.targetRole || 'N/A'}</p>
                  <p><strong>Department:</strong> {selectedProfile.employee.departmentName || 'N/A'}</p>
                  <p><strong>Team:</strong> {selectedProfile.employee.teamName || 'N/A'}</p>
                </div>
              </div>

              {/* External Links */}
              {selectedProfile.externalLinks && selectedProfile.externalLinks.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>External Data Links</h4>
                  <div className="space-y-1">
                    {selectedProfile.externalLinks.map((link, idx) => (
                      <p key={idx} className="text-sm">
                        <strong style={{ color: 'var(--text-accent)' }}>{link.type}:</strong>{' '}
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {link.url}
                        </a>
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Processed Data (Bio) */}
              {selectedProfile.processedData && selectedProfile.processedData.bio && (
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>AI-Generated Bio</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {selectedProfile.processedData.bio}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--bg-secondary)' }}>
                <Button
                  variant="primary"
                  onClick={() => handleApprove(selectedProfile.employee.id)}
                  disabled={approving}
                  className="flex-1"
                >
                  {approving ? 'Approving...' : 'Approve Profile'}
                </Button>
                <Button
                  variant="tertiary"
                  onClick={() => handleReject(selectedProfile.employee.id)}
                  disabled={rejecting}
                  style={{ color: '#dc2626' }}
                  className="flex-1"
                >
                  {rejecting ? 'Rejecting...' : 'Reject Profile'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate(getProfilePath(selectedProfile.employee.id))}
                >
                  View Full Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingProfilesApproval;

