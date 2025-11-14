// Basic Info Card - Sidebar component
import React from 'react';
import { useApp } from '../../contexts/AppContext';
import Button from '../common/Button';

const ProfileBasicInfoCard = ({ employee, onEditClick }) => {
  const { theme } = useApp();

  if (!employee) return null;

  return (
    <div className={`rounded-lg p-6 mb-6 ${
      theme === 'day-mode' 
        ? 'bg-white border border-gray-200 shadow-sm' 
        : 'bg-slate-800 border border-gray-700 shadow-lg'
    }`}>
      {/* Profile Picture Placeholder */}
      <div className="flex justify-center mb-4">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${
          theme === 'day-mode' 
            ? 'bg-emerald-100 text-emerald-700' 
            : 'bg-emerald-900/30 text-emerald-300'
        }`}>
          {employee.name?.charAt(0)?.toUpperCase() || 'E'}
        </div>
      </div>

      {/* Name and Role */}
      <div className="text-center mb-4">
        <h2 className={`text-xl font-bold mb-1 ${
          theme === 'day-mode' ? 'text-gray-800' : 'text-gray-200'
        }`}>
          {employee.name || 'Employee Name'}
        </h2>
        <p className={`text-sm ${
          theme === 'day-mode' ? 'text-gray-600' : 'text-gray-400'
        }`}>
          {employee.role || employee.current_role || 'Employee'}
        </p>
        {employee.target_role && (
          <p className={`text-xs mt-1 ${
            theme === 'day-mode' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Target: {employee.target_role}
          </p>
        )}
      </div>


      {/* Basic Information */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className={`text-xs ${
              theme === 'day-mode' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Email
            </p>
            <p className={`text-sm truncate ${
              theme === 'day-mode' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              {employee.email || 'N/A'}
            </p>
          </div>
        </div>

        {employee.phone && (
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className={`text-xs ${
                theme === 'day-mode' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Phone
              </p>
              <p className={`text-sm ${
                theme === 'day-mode' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                {employee.phone}
              </p>
            </div>
          </div>
        )}

        {employee.preferred_language && (
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className={`text-xs ${
                theme === 'day-mode' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Language
              </p>
              <p className={`text-sm ${
                theme === 'day-mode' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                {employee.preferred_language}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          variant="secondary"
          onClick={onEditClick}
          className="w-full"
        >
          Edit Profile
        </Button>
      </div>
    </div>
  );
};

export default ProfileBasicInfoCard;

