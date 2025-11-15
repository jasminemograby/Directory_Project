// Employee List Input Component
import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { EMPLOYEE_TYPES } from '../../utils/constants';
import { validators } from '../../utils/validation';

const EmployeeListInput = ({ employees = [], departments = [], onChange, errors = {} }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentRole: '',
    targetRole: '',
    type: EMPLOYEE_TYPES.REGULAR,
    departmentId: '',
    teamId: '',
    isManager: false,
    managerType: '',
    managerOfId: '',
    aiEnabled: false, // AI Enable for Trainers
    externalLinks: {
      linkedin: '',
      github: '',
      credly: '',
      youtube: '',
      orcid: '',
      crossref: '',
    },
  });
  const [formErrors, setFormErrors] = useState({});
  const [emailCheckStatus, setEmailCheckStatus] = useState(null); // 'checking', 'available', 'unavailable', null
  const [emailCheckMessage, setEmailCheckMessage] = useState('');

  const handleAdd = () => {
    setEditingIndex(null);
    setFormData({
      name: '',
      email: '',
      currentRole: '',
      targetRole: '',
      type: EMPLOYEE_TYPES.REGULAR,
      departmentId: '',
      teamId: '',
      isManager: false,
      managerType: '',
      managerOfId: '',
      aiEnabled: false,
      externalLinks: {
        linkedin: '',
        github: '',
        credly: '',
        youtube: '',
        orcid: '',
        crossref: '',
      },
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setFormData(employees[index]);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      const newEmployees = employees.filter((_, i) => i !== index);
      onChange(newEmployees);
    }
  };

  const validateEmployee = () => {
    const errors = {};
    
    if (!validators.required(formData.name)) {
      errors.name = 'Name is required';
    }
    if (!validators.required(formData.email)) {
      errors.email = 'Email is required';
    } else if (!validators.email(formData.email)) {
      errors.email = 'Invalid email format';
    } else {
      // Check if email is already used by another employee in the list (case-insensitive)
      const normalizedEmail = formData.email.trim().toLowerCase();
      const duplicateEmployee = employees.find((emp, idx) => {
        if (editingIndex !== null && idx === editingIndex) {
          return false; // Skip the current employee being edited
        }
        return emp.email && emp.email.trim().toLowerCase() === normalizedEmail;
      });
      
      if (duplicateEmployee) {
        errors.email = 'This email is already in use in this company';
        setEmailCheckStatus('unavailable');
        setEmailCheckMessage('❌ This email is already in use in this company');
      }
    }
    if (!validators.required(formData.currentRole)) {
      errors.currentRole = 'Current role is required';
    }
    if (!validators.required(formData.targetRole)) {
      errors.targetRole = 'Target role is required';
    }
    
    // Department and Team are OPTIONAL - company can have employees without departments/teams
    // But if departments/teams exist, employees should be assigned to them
    
    // Validate manager fields if isManager is checked
    if (formData.isManager) {
      if (!formData.managerType) {
        errors.managerType = 'Manager type is required';
      }
      if (!formData.managerOfId) {
        errors.managerOfId = 'Please select which department/team this employee manages';
      }
    }
    
    // Validate external links if provided
    Object.keys(formData.externalLinks).forEach((key) => {
      const url = formData.externalLinks[key];
      if (url && !validators.url(url)) {
        errors[`externalLinks.${key}`] = 'Invalid URL format';
      }
    });
    
    return errors;
  };

  const handleSave = () => {
    const errors = validateEmployee();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newEmployees = [...employees];
    if (editingIndex !== null) {
      newEmployees[editingIndex] = formData;
    } else {
      newEmployees.push(formData);
    }
    
    onChange(newEmployees);
    setIsModalOpen(false);
    setFormErrors({});
  };

  // Check email uniqueness in real-time (local check against employees array)
  const checkEmailUniqueness = (email) => {
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

    const normalizedEmail = email.trim().toLowerCase();
    const duplicateEmployee = employees.find((emp, idx) => {
      if (editingIndex !== null && idx === editingIndex) {
        return false; // Skip the current employee being edited
      }
      return emp.email && emp.email.trim().toLowerCase() === normalizedEmail;
    });

    if (duplicateEmployee) {
      setEmailCheckStatus('unavailable');
      setEmailCheckMessage('❌ This email is already in use in this company');
      setFormErrors((prev) => ({
        ...prev,
        email: 'This email is already in use in this company',
      }));
    } else {
      setEmailCheckStatus('available');
      setEmailCheckMessage('✓ Email is available');
      if (formErrors.email) {
        setFormErrors((prev) => ({ ...prev, email: null }));
      }
    }
  };

  // Debounce timer ref for email check
  const emailCheckTimerRef = React.useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('externalLinks.')) {
      const linkKey = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        externalLinks: {
          ...prev.externalLinks,
          [linkKey]: value,
        },
      }));
    } else if (type === 'checkbox') {
      // Handle checkbox (isManager)
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        // Reset manager fields if unchecked
        ...(name === 'isManager' && !checked ? {
          managerType: '',
          managerOfId: ''
        } : {})
      }));
    } else {
      // Handle regular inputs
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        // Reset managerOfId if managerType changes
        ...(name === 'managerType' ? { managerOfId: '' } : {})
      }));
    }
    
    // Live email check for email field
    if (name === 'email') {
      // Clear previous timer
      if (emailCheckTimerRef.current) {
        clearTimeout(emailCheckTimerRef.current);
      }
      
      // Clear status immediately when user types
      setEmailCheckStatus(null);
      setEmailCheckMessage('');

      // Debounce email check (wait 500ms after user stops typing)
      emailCheckTimerRef.current = setTimeout(() => {
        checkEmailUniqueness(value);
      }, 500);
    }
    
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
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

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Employees <span style={{ color: 'var(--border-error)' }}>*</span>
        </label>
        <Button variant="primary" size="sm" onClick={handleAdd}>
          + Add Employee
        </Button>
      </div>

      {employees.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center" style={{ borderColor: 'var(--bg-tertiary)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No employees added yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Click "Add Employee" to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {employees.map((employee, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 flex items-center justify-between"
              style={{ 
                borderColor: 'var(--bg-tertiary)',
                backgroundColor: 'var(--bg-card)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
            >
              <div className="flex-1">
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{employee.name}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{employee.email}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {employee.currentRole} → {employee.targetRole} ({employee.type})
                </p>
                {employee.departmentId && employee.teamId && (
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {departments.find((d) => d.id === employee.departmentId)?.name} →{' '}
                    {departments
                      .find((d) => d.id === employee.departmentId)
                      ?.teams?.find((t) => t.id === employee.teamId)?.name}
                  </p>
                )}
                {employee.isManager && (
                  <p className="text-xs mt-1 font-medium" style={{ color: 'var(--primary-cyan)' }}>
                    👤 Manager: {employee.managerType === 'dept_manager' ? 'Department' : 'Team'} Manager
                    {employee.managerOfId && (
                      <span style={{ color: 'var(--text-muted)' }}>
                        {' '}of {employee.managerType === 'dept_manager' 
                          ? departments.find((d) => d.id === employee.managerOfId)?.name
                          : departments.flatMap((d) => d.teams || []).find((t) => t.id === employee.managerOfId)?.name}
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={() => handleEdit(index)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(index)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {errors.employees && (
        <p className="mt-1 text-sm" style={{ color: 'var(--border-error)' }}>{errors.employees}</p>
      )}

      {/* Employee Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIndex !== null ? 'Edit Employee' : 'Add Employee'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {editingIndex !== null ? 'Update' : 'Add'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            error={formErrors.name}
          />
          
          {/* Email with Live Check */}
          <div>
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              error={formErrors.email}
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
            label="Current Role"
            name="currentRole"
            value={formData.currentRole}
            onChange={handleChange}
            placeholder="e.g., QA, Backend Developer, Designer"
            required
            error={formErrors.currentRole}
          />
          
          <Input
            label="Target Role"
            name="targetRole"
            value={formData.targetRole}
            onChange={handleChange}
            placeholder="Career path target role"
            required
            error={formErrors.targetRole}
          />
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Employee Type <span style={{ color: 'var(--border-error)' }}>*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg focus:outline-none"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--border-default)',
                borderWidth: '1px',
                borderStyle: 'solid',
                color: 'var(--input-text)'
              }}
              required
            >
              <option value={EMPLOYEE_TYPES.REGULAR}>Regular Employee</option>
              <option value={EMPLOYEE_TYPES.INTERNAL_INSTRUCTOR}>Internal Instructor</option>
              <option value={EMPLOYEE_TYPES.EXTERNAL_INSTRUCTOR}>External Instructor</option>
            </select>
          </div>

          {/* AI Enable Checkbox - Conditional (only for Trainers) */}
          {(formData.type === EMPLOYEE_TYPES.INTERNAL_INSTRUCTOR || formData.type === EMPLOYEE_TYPES.EXTERNAL_INSTRUCTOR) && (
            <div className="mb-4 border-t pt-4" style={{ borderColor: 'var(--bg-secondary)' }}>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="aiEnabled"
                  checked={formData.aiEnabled}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                  style={{ color: 'var(--primary-cyan)', borderColor: 'var(--bg-tertiary)' }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  AI Enable (Allow AI-powered content generation)
                </span>
              </label>
              <p className="text-xs mt-1 ml-6" style={{ color: 'var(--text-muted)' }}>
                Enable AI assistance for content creation and course generation
              </p>
            </div>
          )}

          {/* Department and Team Selection - OPTIONAL */}
          {departments.length > 0 ? (
            <div className="space-y-4 border-t pt-4" style={{ borderColor: 'var(--bg-secondary)' }}>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Department <span className="text-xs" style={{ color: 'var(--text-muted)' }}>(Optional)</span>
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, departmentId: e.target.value, teamId: '' }));
                  }}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--border-default)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    color: 'var(--input-text)'
                  }}
                >
                  <option value="">Select Department (Optional)</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {formErrors.departmentId && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--border-error)' }}>{formErrors.departmentId}</p>
                )}
              </div>

              {formData.departmentId && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Team <span className="text-xs" style={{ color: 'var(--text-muted)' }}>(Optional)</span>
                  </label>
                  <select
                    name="teamId"
                    value={formData.teamId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--border-default)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      color: 'var(--input-text)'
                    }}
                  >
                    <option value="">Select Team (Optional)</option>
                    {departments
                      .find((d) => d.id === formData.departmentId)
                      ?.teams?.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                  </select>
                  {formErrors.teamId && (
                    <p className="mt-1 text-sm" style={{ color: 'var(--border-error)' }}>{formErrors.teamId}</p>
                  )}
                  {!departments.find((d) => d.id === formData.departmentId)?.teams?.length && (
                    <p className="mt-1 text-sm" style={{ color: 'var(--accent-orange)' }}>
                      No teams in this department. You can leave this empty or add teams first.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="border-t pt-4" style={{ borderColor: 'var(--bg-secondary)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                ℹ️ Departments and teams are optional. You can add employees without assigning them to departments/teams.
              </p>
            </div>
          )}
          
          {/* Manager Assignment Section - Conditional */}
          <div className="border-t pt-4" style={{ borderColor: 'var(--bg-secondary)' }}>
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isManager"
                  checked={formData.isManager}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                  style={{ color: 'var(--primary-cyan)', borderColor: 'var(--bg-tertiary)' }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Is this person a manager?
                </span>
              </label>
            </div>
            
            {/* Conditional Manager Fields - Show only if isManager is checked */}
            {formData.isManager && (
              <div className="space-y-4 pl-6 border-l-2" style={{ borderColor: 'var(--primary-cyan)' }}>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Manager Type <span style={{ color: 'var(--border-error)' }}>*</span>
                  </label>
                  <select
                    name="managerType"
                    value={formData.managerType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--border-default)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      color: 'var(--input-text)'
                    }}
                    required
                  >
                    <option value="">Select Manager Type</option>
                    <option value="dept_manager">Department Manager</option>
                    <option value="team_manager">Team Manager</option>
                  </select>
                  {formErrors.managerType && (
                    <p className="mt-1 text-sm" style={{ color: 'var(--border-error)' }}>{formErrors.managerType}</p>
                  )}
                </div>
                
                {/* Conditional: Which Department/Team Manager */}
                {formData.managerType === 'dept_manager' && (
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Which Department? <span style={{ color: 'var(--border-error)' }}>*</span>
                    </label>
                    <select
                      name="managerOfId"
                      value={formData.managerOfId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none"
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: 'var(--border-default)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        color: 'var(--input-text)'
                      }}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.managerOfId && (
                      <p className="mt-1 text-sm" style={{ color: 'var(--border-error)' }}>{formErrors.managerOfId}</p>
                    )}
                  </div>
                )}
                
                {formData.managerType === 'team_manager' && (
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Which Team? <span style={{ color: 'var(--border-error)' }}>*</span>
                    </label>
                    <select
                      name="managerOfId"
                      value={formData.managerOfId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none"
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: 'var(--border-default)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        color: 'var(--input-text)'
                      }}
                      required
                    >
                      <option value="">Select Team</option>
                      {departments.flatMap((dept) =>
                        (dept.teams || []).map((team) => (
                          <option key={team.id} value={team.id}>
                            {dept.name} → {team.name}
                          </option>
                        ))
                      )}
                    </select>
                    {formErrors.managerOfId && (
                      <p className="mt-1 text-sm" style={{ color: 'var(--border-error)' }}>{formErrors.managerOfId}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="border-t pt-4" style={{ borderColor: 'var(--bg-secondary)' }}>
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>External Data Links (Optional)</h3>
            <div className="space-y-2">
              <Input
                label="LinkedIn"
                name="externalLinks.linkedin"
                type="url"
                value={formData.externalLinks.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
                error={formErrors['externalLinks.linkedin']}
              />
              <Input
                label="GitHub"
                name="externalLinks.github"
                type="url"
                value={formData.externalLinks.github}
                onChange={handleChange}
                placeholder="https://github.com/..."
                error={formErrors['externalLinks.github']}
              />
              <Input
                label="Credly"
                name="externalLinks.credly"
                type="url"
                value={formData.externalLinks.credly}
                onChange={handleChange}
                placeholder="https://credly.com/..."
                error={formErrors['externalLinks.credly']}
              />
              <Input
                label="YouTube"
                name="externalLinks.youtube"
                type="url"
                value={formData.externalLinks.youtube}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
                error={formErrors['externalLinks.youtube']}
              />
              <Input
                label="ORCID"
                name="externalLinks.orcid"
                type="url"
                value={formData.externalLinks.orcid}
                onChange={handleChange}
                placeholder="https://orcid.org/..."
                error={formErrors['externalLinks.orcid']}
              />
              <Input
                label="Crossref"
                name="externalLinks.crossref"
                type="url"
                value={formData.externalLinks.crossref}
                onChange={handleChange}
                placeholder="https://crossref.org/..."
                error={formErrors['externalLinks.crossref']}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeListInput;

