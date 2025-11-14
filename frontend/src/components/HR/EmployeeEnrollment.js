// Employee Enrollment Component - HR enrolls employees to learning paths
import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import { authService } from '../../utils/auth';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const EmployeeEnrollment = ({ companyId }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [enrollmentType, setEnrollmentType] = useState(null); // 'personalized', 'group', 'instructor'
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch company employees
  const fetchEmployees = useCallback(async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getEmployees({ company_id: companyId });
      if (response.data && response.data.data) {
        setEmployees(response.data.data.employees || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleEmployeeToggle = (employeeId) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedEmployees.length === 0) {
      setError('Please select at least one employee');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      let payload = {
        employeeIds: selectedEmployees,
        type: enrollmentType
      };

      // Add type-specific data
      if (enrollmentType === 'group' && selectedSkills.length > 0) {
        payload.skillIds = selectedSkills;
      } else if (enrollmentType === 'instructor' && selectedInstructor) {
        payload.instructorId = selectedInstructor;
      }

      const response = await apiService.enrollEmployeesToLearningPath(payload);
      
      if (response.data && response.data.success) {
        setSuccess(`Successfully enrolled ${selectedEmployees.length} employee(s) to learning path!`);
        // Reset form
        setEnrollmentType(null);
        setSelectedEmployees([]);
        setSelectedSkills([]);
        setSelectedInstructor(null);
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(response.data?.error || 'Failed to enroll employees');
      }
    } catch (err) {
      console.error('Error enrolling employees:', err);
      setError(err.response?.data?.error || 'Failed to enroll employees. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="rounded-lg p-6" style={{ 
      backgroundColor: 'var(--bg-card)', 
      boxShadow: 'var(--shadow-card)', 
      borderColor: 'var(--bg-secondary)', 
      borderWidth: '1px', 
      borderStyle: 'solid' 
    }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Enroll Employees to Learning Paths
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded border" style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded border" style={{ backgroundColor: '#d1fae5', borderColor: '#10b981', color: '#065f46' }}>
          {success}
        </div>
      )}

      {/* Enrollment Type Selection */}
      {!enrollmentType && (
        <div className="space-y-3 mb-6">
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Select the type of learning path you want to create:
          </p>
          
          <Button
            variant="secondary"
            onClick={() => setEnrollmentType('personalized')}
            className="w-full text-left"
          >
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                1. Fully Personalized (Career Path Driven)
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Create personalized learning paths based on each employee's career goals and current role
              </p>
            </div>
          </Button>

          <Button
            variant="secondary"
            onClick={() => setEnrollmentType('group')}
            className="w-full text-left"
          >
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                2. Group/Department (Skill-Driven)
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Enroll multiple employees to learn specific skills together
              </p>
            </div>
          </Button>

          <Button
            variant="secondary"
            onClick={() => setEnrollmentType('instructor')}
            className="w-full text-left"
          >
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                3. Specific Instructor
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Enroll employees to learn from a specific instructor
              </p>
            </div>
          </Button>
        </div>
      )}

      {/* Enrollment Form */}
      {enrollmentType && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {enrollmentType === 'personalized' && 'Fully Personalized Learning Path'}
              {enrollmentType === 'group' && 'Group/Department Learning Path'}
              {enrollmentType === 'instructor' && 'Specific Instructor Learning Path'}
            </h3>
            <Button
              variant="tertiary"
              onClick={() => {
                setEnrollmentType(null);
                setSelectedEmployees([]);
                setSelectedSkills([]);
                setSelectedInstructor(null);
              }}
            >
              Change Type
            </Button>
          </div>

          {/* Employee Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Select Employees *
              </label>
              <button
                onClick={handleSelectAll}
                className="text-sm"
                style={{ color: 'var(--text-accent)' }}
              >
                {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto border rounded p-2" style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              borderColor: 'var(--bg-tertiary)' 
            }}>
              {employees.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  No employees found
                </p>
              ) : (
                employees.map(employee => (
                  <label
                    key={employee.id}
                    className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-opacity-50"
                    style={{ backgroundColor: selectedEmployees.includes(employee.id) ? 'var(--bg-tertiary)' : 'transparent' }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={() => handleEmployeeToggle(employee.id)}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {employee.name} ({employee.email})
                      {employee.current_role && (
                        <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                          - {employee.current_role}
                        </span>
                      )}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Group Type: Skill Selection */}
          {enrollmentType === 'group' && (
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                Select Skills (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter skill IDs (comma-separated) or leave empty for all skills"
                value={selectedSkills.join(', ')}
                onChange={(e) => {
                  const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                  setSelectedSkills(skills);
                }}
                className="w-full px-3 py-2 rounded border"
                style={{ 
                  backgroundColor: 'var(--bg-card)', 
                  borderColor: 'var(--bg-tertiary)', 
                  color: 'var(--text-primary)' 
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                If no skills specified, learning path will be based on employee skill gaps
              </p>
            </div>
          )}

          {/* Instructor Type: Instructor Selection */}
          {enrollmentType === 'instructor' && (
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                Instructor ID *
              </label>
              <input
                type="text"
                placeholder="Enter instructor ID"
                value={selectedInstructor || ''}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                className="w-full px-3 py-2 rounded border"
                style={{ 
                  backgroundColor: 'var(--bg-card)', 
                  borderColor: 'var(--bg-tertiary)', 
                  color: 'var(--text-primary)' 
                }}
                required
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--bg-secondary)' }}>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting || selectedEmployees.length === 0}
              className="flex-1"
            >
              {submitting ? 'Enrolling...' : `Enroll ${selectedEmployees.length} Employee(s)`}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setEnrollmentType(null);
                setSelectedEmployees([]);
                setSelectedSkills([]);
                setSelectedInstructor(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeEnrollment;

