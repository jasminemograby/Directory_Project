// Profile Edit Page - Employee can edit allowed fields
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Button from '../components/common/Button';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES } from '../utils/constants';
import { useApp } from '../contexts/AppContext';

const ProfileEdit = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { theme } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [employee, setEmployee] = useState(null);
  
  // Form state - only editable fields (phone, address, preferred_language)
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    preferred_language: 'Hebrew'
  });

  // Get current employee ID (from URL or localStorage)
  // Prioritize URL parameter, then localStorage
  const currentEmployeeId = employeeId || localStorage.getItem('currentEmployeeId') || localStorage.getItem('hrEmployeeId');

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getEmployee(currentEmployeeId);
      if (response.data && response.data.data) {
        const emp = response.data.data;
        setEmployee(emp);
        
        // Set form data with current values (only editable fields)
        setFormData({
          phone: emp.phone || '',
          address: emp.address || '',
          preferred_language: emp.preferred_language || 'Hebrew'
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

  useEffect(() => {
    if (!currentEmployeeId) {
      setError('Employee ID not found');
      setLoading(false);
      return;
    }

    fetchEmployeeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEmployeeId]);

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

      // Only send allowed fields (phone, address, preferred_language)
      const allowedFields = {
        phone: formData.phone,
        address: formData.address,
        preferred_language: formData.preferred_language
      };

      const response = await apiService.updateEmployee(currentEmployeeId, allowedFields);
      
      if (response.data && response.data.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          if (currentEmployeeId) {
            navigate(`${ROUTES.PROFILE}/${currentEmployeeId}`);
          } else {
            navigate(ROUTES.PROFILE_ME || '/profile/me');
          }
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
    if (currentEmployeeId) {
      navigate(`${ROUTES.PROFILE}/${currentEmployeeId}`);
    } else {
      navigate(ROUTES.PROFILE_ME || '/profile/me');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className={`min-h-screen pt-16 ${
          theme === 'day-mode' ? 'bg-gray-50' : 'bg-slate-900'
        }`}>
          <div className="flex justify-center items-center min-h-screen">
            <LoadingSpinner />
          </div>
        </div>
      </>
    );
  }

  if (error && !employee) {
    return (
      <>
        <Header />
        <div className={`min-h-screen pt-16 ${
          theme === 'day-mode' ? 'bg-gray-50' : 'bg-slate-900'
        }`}>
          <div className="max-w-4xl mx-auto p-6">
            <div className={`rounded-lg p-6 ${
              theme === 'day-mode' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-red-900/20 border-red-800'
            }`}>
              <p className={theme === 'day-mode' ? 'text-red-800' : 'text-red-300'}>{error}</p>
              <Button 
                variant="primary" 
                onClick={() => {
                  if (currentEmployeeId) {
                    navigate(`${ROUTES.PROFILE}/${currentEmployeeId}`);
                  } else {
                    navigate(ROUTES.PROFILE_ME || '/profile/me');
                  }
                }} 
                className="mt-4"
              >
                Back to Profile
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={`min-h-screen pt-16 ${
        theme === 'day-mode' ? 'bg-gray-50' : 'bg-slate-900'
      }`}>
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
            </div>

            {/* Read-Only Fields (Display only) */}
            {employee && (
              <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--bg-secondary)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Read-Only Information
                </h3>
                <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <p><strong>Name:</strong> {employee.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {employee.email || 'N/A'}</p>
                  <p><strong>Role:</strong> {employee.role || employee.current_role || 'N/A'}</p>
                  {employee.target_role && <p><strong>Target Role:</strong> {employee.target_role}</p>}
                  {employee.department_name && <p><strong>Department:</strong> {employee.department_name}</p>}
                  {employee.team_name && <p><strong>Team:</strong> {employee.team_name}</p>}
                  {employee.company_name && <p><strong>Company:</strong> {employee.company_name}</p>}
                  <p><strong>Employee Type:</strong> {employee.type || 'regular'}</p>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  These fields can only be changed by HR. Contact your HR department if you need to update them.
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Note: Bio is AI-generated from your LinkedIn/GitHub data and cannot be edited manually.
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
      </div>
    </>
  );
};

export default ProfileEdit;

