// Mock Dashboard View - Learning Analytics
import React from 'react';
import { useApp } from '../../contexts/AppContext';

const ProfileDashboardView = ({ employeeId }) => {
  const { theme } = useApp();

  return (
    <div className="space-y-6">
      <div className={`rounded-lg p-6 ${
        theme === 'day-mode' ? 'bg-white border border-gray-200' : 'bg-slate-800 border border-gray-700'
      }`}>
        <h2 className={`text-2xl font-semibold mb-4 ${
          theme === 'day-mode' ? 'text-gray-800' : 'text-gray-200'
        }`}>
          Learning Analytics Dashboard
        </h2>
        <p className={`text-sm ${
          theme === 'day-mode' ? 'text-gray-600' : 'text-gray-400'
        }`}>
          This will redirect to Learning Analytics microservice when available.
        </p>
        
        {/* Mock Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className={`p-4 rounded-lg ${
            theme === 'day-mode' ? 'bg-emerald-50 border border-emerald-200' : 'bg-emerald-900/20 border border-emerald-800'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              theme === 'day-mode' ? 'text-emerald-800' : 'text-emerald-300'
            }`}>Courses Completed</h3>
            <p className={`text-2xl font-bold ${
              theme === 'day-mode' ? 'text-emerald-600' : 'text-emerald-400'
            }`}>12</p>
          </div>
          
          <div className={`p-4 rounded-lg ${
            theme === 'day-mode' ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-800'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              theme === 'day-mode' ? 'text-blue-800' : 'text-blue-300'
            }`}>Learning Hours</h3>
            <p className={`text-2xl font-bold ${
              theme === 'day-mode' ? 'text-blue-600' : 'text-blue-400'
            }`}>48h</p>
          </div>
          
          <div className={`p-4 rounded-lg ${
            theme === 'day-mode' ? 'bg-purple-50 border border-purple-200' : 'bg-purple-900/20 border border-purple-800'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              theme === 'day-mode' ? 'text-purple-800' : 'text-purple-300'
            }`}>Skills Improved</h3>
            <p className={`text-2xl font-bold ${
              theme === 'day-mode' ? 'text-purple-600' : 'text-purple-400'
            }`}>8</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboardView;

