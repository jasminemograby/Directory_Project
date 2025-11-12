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
    }
    if (!validators.required(formData.currentRole)) {
      errors.currentRole = 'Current role is required';
    }
    if (!validators.required(formData.targetRole)) {
      errors.targetRole = 'Target role is required';
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('externalLinks.')) {
      const linkKey = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        externalLinks: {
          ...prev.externalLinks,
          [linkKey]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Employees <span className="text-red-500">*</span>
        </label>
        <Button variant="primary" size="sm" onClick={handleAdd}>
          + Add Employee
        </Button>
      </div>

      {employees.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">No employees added yet</p>
          <p className="text-sm text-gray-400 mt-1">Click "Add Employee" to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {employees.map((employee, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{employee.name}</p>
                <p className="text-sm text-gray-600">{employee.email}</p>
                <p className="text-xs text-gray-500">
                  {employee.currentRole} → {employee.targetRole} ({employee.type})
                </p>
                {employee.departmentId && employee.teamId && (
                  <p className="text-xs text-gray-400 mt-1">
                    {departments.find((d) => d.id === employee.departmentId)?.name} →{' '}
                    {departments
                      .find((d) => d.id === employee.departmentId)
                      ?.teams?.find((t) => t.id === employee.teamId)?.name}
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
        <p className="mt-1 text-sm text-red-600">{errors.employees}</p>
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
          
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            error={formErrors.email}
          />
          
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-cyan"
              required
            >
              <option value={EMPLOYEE_TYPES.REGULAR}>Regular Employee</option>
              <option value={EMPLOYEE_TYPES.INTERNAL_INSTRUCTOR}>Internal Instructor</option>
              <option value={EMPLOYEE_TYPES.EXTERNAL_INSTRUCTOR}>External Instructor</option>
            </select>
          </div>

          {/* Department and Team Selection - Optional */}
          {departments.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, departmentId: e.target.value, teamId: '' }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-cyan"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {formData.departmentId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <select
                    name="teamId"
                    value={formData.teamId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-cyan"
                  >
                    <option value="">Select Team</option>
                    {departments
                      .find((d) => d.id === formData.departmentId)
                      ?.teams?.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                  </select>
                  {!departments.find((d) => d.id === formData.departmentId)?.teams?.length && (
                    <p className="mt-1 text-sm text-amber-600">
                      No teams in this department. Please add teams first.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">External Data Links (Optional)</h3>
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

