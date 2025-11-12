// Company Registration Step 4 - Full Setup
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import EmployeeListInput from './EmployeeListInput';
import DepartmentTeamInput from './DepartmentTeamInput';
import LearningPathPolicyInput from './LearningPathPolicyInput';
import { apiService } from '../../services/api';
import { ROUTES, LEARNING_PATH_POLICY } from '../../utils/constants';

const CompanyRegistrationStep4 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employees: [],
    departments: [],
    learningPathPolicy: LEARNING_PATH_POLICY.MANUAL,
    decisionMakerId: '',
    primaryKPI: '',
    exerciseLimit: '',
    passingGrade: '',
    maxAttempts: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleEmployeesChange = (employees) => {
    setFormData((prev) => ({ ...prev, employees }));
    if (errors.employees) {
      setErrors((prev) => ({ ...prev, employees: null }));
    }
  };

  const handleDepartmentsChange = (departments) => {
    setFormData((prev) => ({ ...prev, departments }));
    if (errors.departments) {
      setErrors((prev) => ({ ...prev, departments: null }));
    }
  };

  const handleLearningPathPolicyChange = (policy) => {
    setFormData((prev) => ({
      ...prev,
      learningPathPolicy: policy,
      decisionMakerId: policy === LEARNING_PATH_POLICY.AUTO ? '' : prev.decisionMakerId,
    }));
    if (errors.learningPathPolicy) {
      setErrors((prev) => ({ ...prev, learningPathPolicy: null }));
    }
  };

  const handleDecisionMakerChange = (decisionMakerId) => {
    setFormData((prev) => ({ ...prev, decisionMakerId }));
    if (errors.decisionMaker) {
      setErrors((prev) => ({ ...prev, decisionMaker: null }));
    }
  };

  const validateFormData = () => {
    const newErrors = {};

    // Validate employees
    if (formData.employees.length === 0) {
      newErrors.employees = 'At least one employee is required';
    }

    // Departments are optional - no validation needed

    // Validate learning path policy
    if (!formData.learningPathPolicy) {
      newErrors.learningPathPolicy = 'Learning path approval policy is required';
    }

    // Validate decision maker if manual approval
    if (
      formData.learningPathPolicy === LEARNING_PATH_POLICY.MANUAL &&
      !formData.decisionMakerId
    ) {
      newErrors.decisionMaker = 'Decision Maker is required for manual approval';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateFormData();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({}); // Clear previous errors
    
    try {
      const registrationId = localStorage.getItem('companyRegistrationId');
      if (!registrationId) {
        setErrors({
          submit: 'Registration ID not found. Please start from Step 1.',
        });
        setLoading(false);
        // Don't redirect immediately - let user see the error
        setTimeout(() => {
          navigate(ROUTES.COMPANY_REGISTER_STEP1);
        }, 3000);
        return;
      }

      // Only send decisionMakerId if manual approval is selected
      // Convert learningPathPolicy to lowercase for backend
      const learningPathPolicy = formData.learningPathPolicy.toLowerCase();
      
      const payload = {
        step: 3, // Step 3 (was step 4 before merging)
        registrationId,
        employees: formData.employees,
        departments: formData.departments || [],
        learningPathPolicy: learningPathPolicy, // Ensure lowercase
        primaryKPI: formData.primaryKPI || '',
        exerciseLimit: formData.exerciseLimit || '',
        passingGrade: formData.passingGrade || '',
        maxAttempts: formData.maxAttempts || '',
      };

      // Only include decisionMakerId if manual approval
      if (formData.learningPathPolicy === LEARNING_PATH_POLICY.MANUAL && formData.decisionMakerId) {
        payload.decisionMakerId = formData.decisionMakerId;
      }

      const response = await apiService.registerCompany(payload);

      if (response.data.success) {
        // Clear registration ID
        localStorage.removeItem('companyRegistrationId');
        // Redirect to HR landing page with success message
        navigate(ROUTES.HR_LANDING, {
          state: { message: 'Company registration completed successfully!' },
        });
      } else {
        // Handle unexpected response format
        setErrors({
          submit: response.data.message || 'Failed to submit registration. Please try again.',
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', JSON.stringify(error.response?.data, null, 2));
      console.error('Error status:', error.response?.status);
      
      // Don't redirect on error - show error message instead
      let errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to submit registration. Please try again.';
      
      // If there are validation details, show them
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const details = error.response.data.details.map(d => d.msg || d.message || JSON.stringify(d)).join(', ');
        errorMessage = `${errorMessage}: ${details}`;
      }
      
      setErrors({
        submit: errorMessage,
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary-cyan">Step 3 of 3</span>
            <span className="text-sm text-gray-500">Full Company Setup</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary-cyan h-2 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Company Setup</h1>
          <p className="text-gray-600 mb-6">
            Please provide all company details including employees, departments, and settings.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Employees Section - CAN BE FIRST (departments optional) */}
            <div className="mb-8">
              <EmployeeListInput
                employees={formData.employees}
                departments={formData.departments}
                onChange={handleEmployeesChange}
                errors={errors}
              />
            </div>

            {/* Departments & Teams Section - OPTIONAL */}
            <div className="mb-8">
              <DepartmentTeamInput
                departments={formData.departments}
                employees={formData.employees}
                onChange={handleDepartmentsChange}
                errors={errors}
              />
            </div>

            {/* Learning Path Policy Section */}
            <div className="mb-8">
              <LearningPathPolicyInput
                value={{
                  policy: formData.learningPathPolicy,
                  decisionMakerId: formData.decisionMakerId,
                }}
                onChange={(value) => {
                  if (typeof value === 'string') {
                    handleLearningPathPolicyChange(value);
                  } else if (value && typeof value === 'object') {
                    if (value.policy) {
                      handleLearningPathPolicyChange(value.policy);
                    }
                    if (value.decisionMakerId !== undefined) {
                      handleDecisionMakerChange(value.decisionMakerId);
                    }
                  }
                }}
                employees={formData.employees}
                errors={errors}
              />
            </div>

            {/* Primary KPI Section */}
            <div className="mb-8">
              <Input
                label="Primary KPI(s)"
                name="primaryKPI"
                value={formData.primaryKPI}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, primaryKPI: e.target.value }))
                }
                placeholder="e.g., Employee skill development, Training completion rate"
                error={errors.primaryKPI}
              />
            </div>

            {/* Organizational Settings Section */}
            <div className="mb-8 border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Organizational Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Exercise Limit"
                  name="exerciseLimit"
                  type="number"
                  min="0"
                  value={formData.exerciseLimit}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, exerciseLimit: e.target.value }))
                  }
                  placeholder="e.g., 10"
                  error={errors.exerciseLimit}
                />
                
                <Input
                  label="Passing Grade (%)"
                  name="passingGrade"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingGrade}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, passingGrade: e.target.value }))
                  }
                  placeholder="e.g., 70"
                  error={errors.passingGrade}
                />
                
                <Input
                  label="Max Attempts"
                  name="maxAttempts"
                  type="number"
                  min="1"
                  value={formData.maxAttempts}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, maxAttempts: e.target.value }))
                  }
                  placeholder="e.g., 3"
                  error={errors.maxAttempts}
                />
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(ROUTES.COMPANY_REGISTER_VERIFICATION)}
                disabled={loading}
              >
                Back
              </Button>
              <Button type="submit" variant="primary" loading={loading} className="flex-1">
                Submit Registration
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegistrationStep4;

