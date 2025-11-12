// Learning Path Policy Input Component
import React from 'react';
import { LEARNING_PATH_POLICY } from '../../utils/constants';

const LearningPathPolicyInput = ({ value, onChange, employees = [], errors = {} }) => {
  // Handle both object and string value formats
  const policy = typeof value === 'object' ? value.policy : value;
  const decisionMakerId = typeof value === 'object' ? value.decisionMakerId : '';
  const isManual = policy === LEARNING_PATH_POLICY.MANUAL;

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Learning Path Approval Policy <span className="text-red-500">*</span>
      </label>
      
      <div className="space-y-3">
        <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="learningPathPolicy"
            value={LEARNING_PATH_POLICY.AUTO}
            checked={policy === LEARNING_PATH_POLICY.AUTO}
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 text-primary-cyan border-gray-300 focus:ring-primary-cyan"
          />
          <div className="ml-3">
            <span className="font-medium text-gray-900">Auto-Approval</span>
            <p className="text-sm text-gray-500">
              Learning paths are automatically approved without manual review
            </p>
          </div>
        </label>
        
        <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="learningPathPolicy"
            value={LEARNING_PATH_POLICY.MANUAL}
            checked={policy === LEARNING_PATH_POLICY.MANUAL}
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 text-primary-cyan border-gray-300 focus:ring-primary-cyan"
          />
          <div className="ml-3">
            <span className="font-medium text-gray-900">Manual Approval</span>
            <p className="text-sm text-gray-500">
              Learning paths require approval from a designated Decision Maker
            </p>
          </div>
        </label>
      </div>

      {isManual && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Decision Maker <span className="text-red-500">*</span>
          </label>
          <select
            name="decisionMaker"
            value={decisionMakerId || ''}
            onChange={(e) => {
              const newValue = typeof value === 'object' 
                ? { ...value, decisionMakerId: e.target.value }
                : { policy: policy, decisionMakerId: e.target.value };
              onChange(newValue);
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-cyan focus:border-transparent ${
              errors.decisionMaker ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select Decision Maker</option>
            {employees.map((emp, index) => (
              <option key={emp.email || index} value={emp.email || ''}>
                {emp.name} ({emp.email})
              </option>
            ))}
          </select>
          {errors.decisionMaker && (
            <p className="mt-1 text-sm text-red-600">{errors.decisionMaker}</p>
          )}
        </div>
      )}

      {errors.learningPathPolicy && (
        <p className="mt-1 text-sm text-red-600">{errors.learningPathPolicy}</p>
      )}
    </div>
  );
};

export default LearningPathPolicyInput;

