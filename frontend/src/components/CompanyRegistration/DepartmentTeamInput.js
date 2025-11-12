// Department and Team Input Component
import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';

const DepartmentTeamInput = ({ departments = [], employees = [], onChange, errors = {} }) => {
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [deptFormData, setDeptFormData] = useState({ name: '', managerId: '' });
  const [teamFormData, setTeamFormData] = useState({ name: '', managerId: '' });
  const [editingDeptId, setEditingDeptId] = useState(null);
  const [editingTeamId, setEditingTeamId] = useState(null);

  const handleAddDepartment = () => {
    setEditingDeptId(null);
    setDeptFormData({ name: '', managerId: '' });
    setIsDeptModalOpen(true);
  };

  const handleEditDepartment = (deptId) => {
    const dept = departments.find((d) => d.id === deptId);
    if (dept) {
      setEditingDeptId(deptId);
      setDeptFormData({ name: dept.name, managerId: dept.managerId || '' });
      setIsDeptModalOpen(true);
    }
  };

  const handleSaveDepartment = () => {
    if (!deptFormData.name.trim()) return;
    if (!deptFormData.managerId) {
      alert('Please select a department manager');
      return;
    }

    const newDepartments = [...departments];
    if (editingDeptId) {
      const index = newDepartments.findIndex((d) => d.id === editingDeptId);
      if (index !== -1) {
        newDepartments[index] = { 
          ...newDepartments[index], 
          name: deptFormData.name,
          managerId: deptFormData.managerId,
        };
      }
    } else {
      newDepartments.push({
        id: `dept-${Date.now()}`,
        name: deptFormData.name,
        managerId: deptFormData.managerId,
        teams: [],
      });
    }
    
    onChange(newDepartments);
    setIsDeptModalOpen(false);
    setDeptFormData({ name: '', managerId: '' });
  };

  const handleDeleteDepartment = (deptId) => {
    if (window.confirm('Delete this department and all its teams?')) {
      const newDepartments = departments.filter((d) => d.id !== deptId);
      onChange(newDepartments);
    }
  };

  const handleAddTeam = (deptId) => {
    setSelectedDeptId(deptId);
    setEditingTeamId(null);
    setTeamFormData({ name: '', managerId: '' });
    setIsTeamModalOpen(true);
  };

  const handleEditTeam = (deptId, teamId) => {
    const dept = departments.find((d) => d.id === deptId);
    if (dept) {
      const team = dept.teams.find((t) => t.id === teamId);
      if (team) {
        setSelectedDeptId(deptId);
        setEditingTeamId(teamId);
        setTeamFormData({ name: team.name, managerId: team.managerId || '' });
        setIsTeamModalOpen(true);
      }
    }
  };

  const handleSaveTeam = () => {
    if (!teamFormData.name.trim() || !selectedDeptId) return;
    if (!teamFormData.managerId) {
      alert('Please select a team manager');
      return;
    }

    const newDepartments = [...departments];
    const deptIndex = newDepartments.findIndex((d) => d.id === selectedDeptId);
    if (deptIndex !== -1) {
      if (editingTeamId) {
        const teamIndex = newDepartments[deptIndex].teams.findIndex((t) => t.id === editingTeamId);
        if (teamIndex !== -1) {
          newDepartments[deptIndex].teams[teamIndex] = {
            ...newDepartments[deptIndex].teams[teamIndex],
            name: teamFormData.name,
            managerId: teamFormData.managerId,
          };
        }
      } else {
        newDepartments[deptIndex].teams.push({
          id: `team-${Date.now()}`,
          name: teamFormData.name,
          managerId: teamFormData.managerId,
        });
      }
      onChange(newDepartments);
    }
    
    setIsTeamModalOpen(false);
    setTeamFormData({ name: '', managerId: '' });
  };

  const handleDeleteTeam = (deptId, teamId) => {
    if (window.confirm('Delete this team?')) {
      const newDepartments = [...departments];
      const deptIndex = newDepartments.findIndex((d) => d.id === deptId);
      if (deptIndex !== -1) {
        newDepartments[deptIndex].teams = newDepartments[deptIndex].teams.filter(
          (t) => t.id !== teamId
        );
        onChange(newDepartments);
      }
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Departments & Teams <span className="text-gray-400 text-xs">(Optional)</span>
        </label>
        <Button variant="primary" size="sm" onClick={handleAddDepartment}>
          + Add Department
        </Button>
      </div>

      {departments.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">No departments added yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Departments and teams are optional. Click "Add Department" if your company has them.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {departments.map((dept) => (
            <div key={dept.id} className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                  {dept.managerId && employees.find((e) => e.email === dept.managerId) && (
                    <p className="text-xs text-gray-500 mt-1">
                      Manager: {employees.find((e) => e.email === dept.managerId).name}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAddTeam(dept.id)}
                  >
                    + Add Team
                  </Button>
                  <Button
                    variant="tertiary"
                    size="sm"
                    onClick={() => handleEditDepartment(dept.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteDepartment(dept.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              
              {dept.teams && dept.teams.length > 0 ? (
                <div className="ml-4 space-y-2">
                  {dept.teams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <span className="text-sm text-gray-700">{team.name}</span>
                        {team.managerId && employees.find((e) => e.email === team.managerId) && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Manager: {employees.find((e) => e.email === team.managerId).name}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={() => handleEditTeam(dept.id, team.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteTeam(dept.id, team.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="ml-4 text-sm text-gray-500">No teams in this department</p>
              )}
            </div>
          ))}
        </div>
      )}

      {errors.departments && (
        <p className="mt-1 text-sm text-red-600">{errors.departments}</p>
      )}

      {/* Department Modal */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title={editingDeptId ? 'Edit Department' : 'Add Department'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveDepartment}>
              {editingDeptId ? 'Update' : 'Add'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Department Name"
            name="name"
            value={deptFormData.name}
            onChange={(e) => setDeptFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Manager <span className="text-red-500">*</span>
            </label>
            {employees.length === 0 ? (
              <div className="border border-amber-300 rounded-lg p-4 bg-amber-50">
                <p className="text-sm text-amber-800">
                  No employees added yet. Please add employees first, then assign a manager.
                </p>
              </div>
            ) : (
              <select
                name="managerId"
                value={deptFormData.managerId}
                onChange={(e) => setDeptFormData((prev) => ({ ...prev, managerId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-cyan"
                required
              >
                <option value="">Select Manager</option>
                {employees.map((emp) => (
                  <option key={emp.email} value={emp.email}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </Modal>

      {/* Team Modal */}
      <Modal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title={editingTeamId ? 'Edit Team' : 'Add Team'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsTeamModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveTeam}>
              {editingTeamId ? 'Update' : 'Add'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Team Name"
            name="name"
            value={teamFormData.name}
            onChange={(e) => setTeamFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Manager <span className="text-red-500">*</span>
            </label>
            {employees.length === 0 ? (
              <div className="border border-amber-300 rounded-lg p-4 bg-amber-50">
                <p className="text-sm text-amber-800">
                  No employees added yet. Please add employees first, then assign a manager.
                </p>
              </div>
            ) : (
              <select
                name="managerId"
                value={teamFormData.managerId}
                onChange={(e) => setTeamFormData((prev) => ({ ...prev, managerId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-cyan"
                required
              >
                <option value="">Select Manager</option>
                {employees.map((emp) => (
                  <option key={emp.email} value={emp.email}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DepartmentTeamInput;

