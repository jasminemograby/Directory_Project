// Company Registration Step 4 - Full Setup
import React, { useState, useEffect } from 'react';
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
    companySize: '',
    description: '',
    exerciseLimitEnabled: false,
    exerciseLimit: '',
    passingGrade: '',
    maxAttempts: '',
    publicPublishEnabled: false,
  });
  const [companyBasicInfo, setCompanyBasicInfo] = useState(null); // From Step 1
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Load company basic info from Step 1 (stored in localStorage or fetch from API)
  useEffect(() => {
    const registrationId = localStorage.getItem('companyRegistrationId');
    if (registrationId) {
      // Try to fetch company info from API
      apiService.verifyCompany(registrationId, { checkStatus: true })
        .then((response) => {
          if (response.data.success && response.data.data) {
            setCompanyBasicInfo({
              name: response.data.data.name,
              industry: response.data.data.industry,
              domain: response.data.data.domain,
            });
          }
        })
        .catch((error) => {
          console.warn('Could not fetch company info:', error);
          // Continue without company info - user can still proceed
        });
    }
  }, []);

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
    } else {
      // Validate that all employees have required fields (name, email, currentRole, targetRole)
      // Department/Team are OPTIONAL - company can have employees without departments/teams
      formData.employees.forEach((emp, index) => {
        if (!emp.name || !emp.email || !emp.currentRole || !emp.targetRole) {
          if (!newErrors.employees) {
            newErrors.employees = [];
          }
          if (Array.isArray(newErrors.employees)) {
            newErrors.employees.push(`Employee ${index + 1} (${emp.name || 'Unknown'}) is missing required fields (name, email, current role, or target role)`);
          }
        }
      });
    }

    // Validate departments - IF departments exist, each department MUST have a manager
    // But if no departments exist, that's fine - company can have employees without departments
    if (formData.departments && formData.departments.length > 0) {
      const departmentsWithoutManagers = [];
      formData.departments.forEach((dept) => {
        // Check if any employee is assigned as manager of this department
        const hasManager = formData.employees.some(
          (emp) => emp.isManager && emp.managerType === 'dept_manager' && emp.managerOfId === dept.id
        );
        if (!hasManager) {
          departmentsWithoutManagers.push(dept.name || dept.id);
        }
      });
      if (departmentsWithoutManagers.length > 0) {
        newErrors.departments = `The following departments are missing a manager: ${departmentsWithoutManagers.join(', ')}. Please assign a manager to each department before proceeding.`;
      }
    }

    // Validate teams - IF teams exist, each team MUST have a manager
    // But if no teams exist, that's fine - company can have employees without teams
    if (formData.departments && formData.departments.length > 0) {
      const teamsWithoutManagers = [];
      formData.departments.forEach((dept) => {
        if (dept.teams && dept.teams.length > 0) {
          dept.teams.forEach((team) => {
            // Check if any employee is assigned as manager of this team
            const hasManager = formData.employees.some(
              (emp) => emp.isManager && emp.managerType === 'team_manager' && emp.managerOfId === team.id
            );
            if (!hasManager) {
              teamsWithoutManagers.push(`${dept.name || 'Unknown'} → ${team.name || team.id}`);
            }
          });
        }
      });
      if (teamsWithoutManagers.length > 0) {
        newErrors.teams = `The following teams are missing a manager: ${teamsWithoutManagers.join(', ')}. Please assign a manager to each team before proceeding.`;
      }
    }

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
        companySize: formData.companySize || null,
        description: formData.description || '',
        exerciseLimitEnabled: formData.exerciseLimitEnabled || false,
        exerciseLimit: formData.exerciseLimitEnabled ? (formData.exerciseLimit || '4') : null,
        passingGrade: formData.passingGrade || '',
        maxAttempts: formData.maxAttempts || '',
        publicPublishEnabled: formData.publicPublishEnabled || false,
      };

      // Only include decisionMakerId if manual approval
      if (formData.learningPathPolicy === LEARNING_PATH_POLICY.MANUAL && formData.decisionMakerId) {
        payload.decisionMakerId = formData.decisionMakerId;
      }

      const response = await apiService.registerCompany(payload);

      console.log('Registration response:', response.data);

      if (response.data.success) {
        // Store company ID and HR employee ID for HR Dashboard
        const companyId = response.data.data?.companyId;
        const hrEmployeeId = response.data.data?.hrEmployeeId;
        const hrEmail = response.data.data?.hrEmail; // Get HR email from response
        
        if (!companyId) {
          console.error('No companyId in response:', response.data);
          setErrors({
            submit: 'Registration succeeded but company ID not found. Please contact support.',
          });
          setLoading(false);
          return;
        }

        console.log('Storing companyId:', companyId);
        localStorage.setItem('companyId', companyId);
        
        // Store HR employee ID so HR can access their profile
        if (hrEmployeeId) {
          console.log('Storing HR employee ID:', hrEmployeeId);
          localStorage.setItem('currentEmployeeId', hrEmployeeId);
          localStorage.setItem('hrEmployeeId', hrEmployeeId);
        }
        
        // Store HR email if provided in response (or keep existing if already set)
        if (hrEmail) {
          console.log('Storing HR email:', hrEmail);
          localStorage.setItem('hrEmail', hrEmail);
        } else {
          // If not in response, check if already in localStorage
          const existingHrEmail = localStorage.getItem('hrEmail');
          if (!existingHrEmail) {
            console.warn('HR email not found in response or localStorage');
          }
        }
        
        // Clear registration ID
        localStorage.removeItem('companyRegistrationId');
        
        console.log('Navigating to HR Dashboard:', ROUTES.HR_DASHBOARD);
        
        // Redirect to HR Dashboard
        navigate(ROUTES.HR_DASHBOARD, {
          state: { 
            message: 'Company registration completed successfully!',
            companyId: companyId,
            hrEmployeeId: hrEmployeeId
          },
          replace: true, // Replace history entry
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--primary-cyan)' }}>Step 3 of 3</span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Full Company Setup</span>
          </div>
          <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="h-2 rounded-full" style={{ width: '100%', backgroundColor: 'var(--primary-cyan)' }} />
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-lg p-6 sm:p-8" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', borderColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid' }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Complete Company Setup</h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Please provide all company details including employees, departments, and settings.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Company Information Section (Read-Only from Step 1) */}
                  {companyBasicInfo && (
                    <div className="mb-8 border-b pb-6" style={{ borderColor: 'var(--bg-secondary)' }}>
                      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Company Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Company Name</label>
                          <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-tertiary)', borderWidth: '1px', borderStyle: 'solid', color: 'var(--text-primary)' }}>
                            {companyBasicInfo.name}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Industry</label>
                          <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-tertiary)', borderWidth: '1px', borderStyle: 'solid', color: 'var(--text-primary)' }}>
                            {companyBasicInfo.industry}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Domain</label>
                          <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-tertiary)', borderWidth: '1px', borderStyle: 'solid', color: 'var(--text-primary)' }}>
                            {companyBasicInfo.domain}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

            {/* Company Settings Section */}
            <div className="mb-8 border-b pb-6" style={{ borderColor: 'var(--bg-secondary)' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Company Settings</h2>
              
              {/* Company Size */}
              <div className="mb-4">
                <Input
                  label="Company Size (Number of Employees)"
                  name="companySize"
                  type="number"
                  min="1"
                  value={formData.companySize}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, companySize: e.target.value }))
                  }
                  placeholder="e.g., 50"
                  error={errors.companySize}
                />
              </div>

              {/* Learning Path Policy Section */}
              <div className="mb-6">
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

              {/* Passing Grade and Max Attempts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  label="Max Test Attempts"
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

              {/* Exercise Limit - Conditional Checkbox */}
              <div className="mb-4">
                <label className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      name="exerciseLimitEnabled"
                      checked={formData.exerciseLimitEnabled}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          exerciseLimitEnabled: e.target.checked,
                          exerciseLimit: e.target.checked ? (prev.exerciseLimit || '4') : '',
                        }))
                      }
                      className="w-4 h-4 rounded"
                      style={{ color: 'var(--primary-cyan)', borderColor: 'var(--bg-tertiary)' }}
                    />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Limit Number of Exercises
                    </span>
                </label>
                
                {/* Conditional: Show number input only if checkbox is checked */}
                {formData.exerciseLimitEnabled && (
                  <div className="mt-2 ml-6">
                    <Input
                      label="Number of Exercises"
                      name="exerciseLimit"
                      type="number"
                      min="1"
                      value={formData.exerciseLimit}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, exerciseLimit: e.target.value }))
                      }
                      placeholder="e.g., 4"
                      error={errors.exerciseLimit}
                    />
                  </div>
                )}
              </div>

              {/* Public Publish Enable */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Public Publish Enable
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="publicPublishEnabled"
                      checked={formData.publicPublishEnabled === true}
                      onChange={() =>
                        setFormData((prev) => ({ ...prev, publicPublishEnabled: true }))
                      }
                      className="w-4 h-4"
                      style={{ color: 'var(--primary-cyan)', borderColor: 'var(--bg-tertiary)' }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Yes - Trainers can publish content publicly</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="publicPublishEnabled"
                      checked={formData.publicPublishEnabled === false}
                      onChange={() =>
                        setFormData((prev) => ({ ...prev, publicPublishEnabled: false }))
                      }
                      className="w-4 h-4"
                      style={{ color: 'var(--primary-cyan)', borderColor: 'var(--bg-tertiary)' }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>No - Internal content only</span>
                  </label>
                </div>
              </div>

              {/* Company Bio/Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Company Bio/Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none"
                  style={{ 
                    backgroundColor: 'var(--input-bg)', 
                    borderColor: 'var(--border-default)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    color: 'var(--input-text)'
                  }}
                  placeholder="Describe your company, its mission, and values..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--border-error)' }}>{errors.description}</p>
                )}
              </div>

              {/* Primary KPI Section */}
              <div className="mb-4">
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
            </div>

            {/* Employees Section */}
            <div className="mb-8">
              <EmployeeListInput
                employees={formData.employees}
                departments={formData.departments}
                onChange={handleEmployeesChange}
                errors={errors}
              />
            </div>

            {/* Departments & Teams Section */}
            <div className="mb-8">
              <DepartmentTeamInput
                departments={formData.departments}
                employees={formData.employees}
                onChange={handleDepartmentsChange}
                errors={errors}
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--border-error)', borderWidth: '1px', borderStyle: 'solid' }}>
                <p className="text-sm" style={{ color: 'var(--border-error)' }}>{errors.submit}</p>
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

