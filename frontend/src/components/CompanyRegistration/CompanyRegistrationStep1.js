// Company Registration Step 1 - Basic Info
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import { apiService } from '../../services/api';
import { validateForm, validators } from '../../utils/validation';
import { ROUTES } from '../../utils/constants';

const CompanyRegistrationStep1 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    hrName: '',
    hrEmail: '',
    hrRole: '',
    domain: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [emailCheckStatus, setEmailCheckStatus] = useState(null); // 'checking', 'available', 'unavailable', null
  const [emailCheckMessage, setEmailCheckMessage] = useState('');

  const validationRules = {
    companyName: [
      { validator: validators.required, message: 'Company name is required' },
      { validator: (v) => validators.minLength(v, 2), message: 'Company name must be at least 2 characters' },
    ],
    industry: [
      { validator: validators.required, message: 'Industry is required' },
    ],
    hrName: [
      { validator: validators.required, message: 'HR name is required' },
      { validator: (v) => validators.minLength(v, 2), message: 'HR name must be at least 2 characters' },
    ],
    hrEmail: [
      { validator: validators.required, message: 'HR email is required' },
      { validator: validators.email, message: 'Invalid email format' },
    ],
    hrRole: [
      { validator: validators.required, message: 'HR role is required' },
    ],
    domain: [
      { validator: validators.required, message: 'Company domain is required' },
      { validator: validators.domain, message: 'Invalid domain format' },
    ],
  };

  // Debounced email check function
  const checkEmailAvailability = React.useCallback(
    async (email) => {
      if (!email || !email.trim()) {
        setEmailCheckStatus(null);
        setEmailCheckMessage('');
        return;
      }

      // Basic email format validation
      if (!validators.email(email)) {
        setEmailCheckStatus(null);
        setEmailCheckMessage('');
        return;
      }

      setEmailCheckStatus('checking');
      setEmailCheckMessage('Checking email availability...');

      try {
        const response = await apiService.checkHrEmailAvailability(email);
        if (response.data.success) {
          if (response.data.available) {
            setEmailCheckStatus('available');
            setEmailCheckMessage('✓ Email is available');
            // Clear email error if it exists
            if (errors.hrEmail) {
              setErrors((prev) => ({ ...prev, hrEmail: null }));
            }
          } else {
            setEmailCheckStatus('unavailable');
            setEmailCheckMessage(`❌ ${response.data.message}${response.data.companyName ? ` (${response.data.companyName})` : ''}`);
            // Set error
            setErrors((prev) => ({
              ...prev,
              hrEmail: [response.data.message],
            }));
          }
        }
      } catch (error) {
        console.error('Error checking email availability:', error);
        setEmailCheckStatus(null);
        setEmailCheckMessage('');
        // Don't set error on check failure - let form validation handle it
      }
    },
    [errors.hrEmail]
  );

  // Debounce timer ref
  const emailCheckTimerRef = React.useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    // Live email check for HR email field
    if (name === 'hrEmail') {
      // Clear previous timer
      if (emailCheckTimerRef.current) {
        clearTimeout(emailCheckTimerRef.current);
      }
      
      // Clear status immediately when user types
      setEmailCheckStatus(null);
      setEmailCheckMessage('');

      // Debounce email check (wait 500ms after user stops typing)
      emailCheckTimerRef.current = setTimeout(() => {
        checkEmailAvailability(value);
      }, 500);
    }
  };

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (emailCheckTimerRef.current) {
        clearTimeout(emailCheckTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm(formData, validationRules);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.registerCompany({
        step: 1,
        ...formData,
      });
      
      if (response.data.success) {
        // Store registration ID for next step
        localStorage.setItem('companyRegistrationId', response.data.data.id);
        // Store HR email for NotificationCenter
        localStorage.setItem('hrEmail', formData.hrEmail);
        navigate(ROUTES.COMPANY_REGISTER_VERIFICATION);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle validation errors
      if (error.response?.data?.details) {
        const validationErrors = {};
        error.response.data.details.forEach((err) => {
          // Map backend field names to frontend field names
          const fieldName = err.path || err.param || err.field;
          if (fieldName) {
            // Store as array to match component expectations
            if (!validationErrors[fieldName]) {
              validationErrors[fieldName] = [];
            }
            validationErrors[fieldName].push(err.msg || err.message);
          }
        });
        setErrors(validationErrors);
      } else {
        setErrors({
          submit: error.response?.data?.error || error.response?.data?.message || 'Failed to submit registration. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary-cyan">Step 1 of 3</span>
            <span className="text-sm text-gray-500">Basic Information</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary-cyan h-2 rounded-full" style={{ width: '33%' }} />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Company Registration</h1>
          <p className="text-gray-600 mb-6">Please provide basic company information to get started.</p>

          <form onSubmit={handleSubmit}>
            {/* Company Name */}
            <Input
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
              required
              error={errors.companyName?.[0]}
            />

            {/* Industry */}
            <div className="mb-4">
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                Industry <span className="text-red-500">*</span>
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-cyan focus:border-transparent ${
                  errors.industry ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select industry</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
              </select>
              {errors.industry?.[0] && (
                <p className="mt-1 text-sm text-red-600">{errors.industry[0]}</p>
              )}
            </div>

            {/* Company Domain - Moved here to be with company info */}
            <Input
              label="Company Domain"
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              placeholder="example.com"
              required
              error={errors.domain?.[0]}
            />
            <p className="text-sm text-gray-500 mt-1 mb-6">
              We'll verify this domain to confirm your company's legitimacy.
            </p>

            {/* HR Information Section */}
            <div className="border-t pt-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">HR/Registrar Information</h2>
              
              <Input
                label="HR Name"
                name="hrName"
                value={formData.hrName}
                onChange={handleChange}
                placeholder="Enter HR/Registrar name"
                required
                error={errors.hrName?.[0]}
              />

              {/* HR Email with Live Check */}
              <div className="mb-4">
                <Input
                  label="HR Email"
                  name="hrEmail"
                  type="email"
                  value={formData.hrEmail}
                  onChange={handleChange}
                  placeholder="hr@company.com"
                  required
                  error={errors.hrEmail?.[0]}
                  className={
                    emailCheckStatus === 'available'
                      ? 'border-green-500'
                      : emailCheckStatus === 'unavailable'
                      ? 'border-red-500'
                      : ''
                  }
                />
                {/* Live email check status */}
                {emailCheckStatus && (
                  <p
                    className={`mt-1 text-sm ${
                      emailCheckStatus === 'available'
                        ? 'text-green-600'
                        : emailCheckStatus === 'unavailable'
                        ? 'text-red-600'
                        : emailCheckStatus === 'checking'
                        ? 'text-gray-500'
                        : ''
                    }`}
                  >
                    {emailCheckMessage}
                  </p>
                )}
              </div>

              <Input
                label="HR Role/Title"
                name="hrRole"
                value={formData.hrRole}
                onChange={handleChange}
                placeholder="e.g., HR Manager, Primary HR"
                required
                error={errors.hrRole?.[0]}
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(ROUTES.HR_LANDING)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegistrationStep1;

