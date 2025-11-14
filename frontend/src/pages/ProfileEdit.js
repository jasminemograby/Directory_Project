// Profile Edit Page - Employee can edit allowed fields
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES } from '../utils/constants';

const ProfileEdit = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [employee, setEmployee] = useState(null);
  
  // Form state - only editable fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    preferred_language: 'Hebrew',
    bio: ''
  });

  // Get current employee ID (from URL or localStorage)
  const currentEmployeeId = employeeId || localStorage.getItem('currentEmployeeId');

  useEffect(() => {
    if (!currentEmployeeId) {
      setError('Employee ID not found');
      setLoading(false);
      return;
    }

    fetchEmployeeData();
  }, [currentEmployeeId]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getEmployee(currentEmployeeId);
      if (response.data && response.data.data) {
        const emp = response.data.data;
        setEmployee(emp);
        
        // Set form data with current values
        setFormData({
          name: emp.name || '',
          phone: emp.phone || '',
          address: emp.address || '',
          preferred_language: emp.preferred_language || 'Hebrew',
          bio: emp.bio || ''
        });
      } else {
        setError('Employee profile not found');
      }
    } catch (err) {
      console.error('Error fetching employee data:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user types
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentEmployeeId) {
      setError('Employee ID not found');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Only send allowed fields
      const allowedFields = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        preferred_language: formData.preferred_language,
        bio: formData.bio
      };

      const response = await apiService.updateEmployee(currentEmployeeId, allowedFields);
      
      if (response.data && response.data.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          navigate(ROUTES.PROFILE_ME || `/profile/${currentEmployeeId}`);
        }, 1500);
      } else {
        setError(response.data?.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.PROFILE_ME || `/profile/${currentEmployeeId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error && !employee) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
            <p className="text-red-600">{error}</p>
            <Button variant="primary" onClick={() => navigate(ROUTES.PROFILE_ME || '/profile/me')} className="mt-4">
              Back to Profile
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
          <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Edit Profile
          </h1>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 rounded bg-green-100 text-green-800">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 rounded bg-red-100 text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Editable Fields */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded border"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    borderColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded border"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    borderColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 rounded border"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    borderColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              {/* Preferred Language */}
              <div>
                <label htmlFor="preferred_language" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Preferred Language
                </label>
                <select
                  id="preferred_language"
                  name="preferred_language"
                  value={formData.preferred_language}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded border"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    borderColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="Hebrew">Hebrew</option>
                  <option value="English">English</option>
                  <option value="Arabic">Arabic</option>
                </select>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 rounded border"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    borderColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Write a short bio about yourself..."
                />
              </div>
            </div>

            {/* Read-Only Fields (Display only) */}
            {employee && (
              <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--bg-secondary)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Read-Only Information
                </h3>
                <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <p><strong>Email:</strong> {employee.email || 'N/A'}</p>
                  <p><strong>Role:</strong> {employee.role || employee.current_role || 'N/A'}</p>
                  {employee.target_role && <p><strong>Target Role:</strong> {employee.target_role}</p>}
                  {employee.department_id && <p><strong>Department:</strong> {employee.department_id}</p>}
                  {employee.team_id && <p><strong>Team:</strong> {employee.team_id}</p>}
                  <p><strong>Employee Type:</strong> {employee.type || 'regular'}</p>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  These fields can only be changed by HR. Contact your HR department if you need to update them.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t" style={{ borderColor: 'var(--bg-secondary)' }}>
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileEdit;

