// Mock Learning Path View - Learner AI
import React from 'react';
import { useApp } from '../../contexts/AppContext';

const ProfileLearningPathView = ({ employeeId }) => {
  const { theme } = useApp();

  return (
    <div className="space-y-6">
      <div className={`rounded-lg p-6 ${
        theme === 'day-mode' ? 'bg-white border border-gray-200' : 'bg-slate-800 border border-gray-700'
      }`}>
        <h2 className={`text-2xl font-semibold mb-4 ${
          theme === 'day-mode' ? 'text-gray-800' : 'text-gray-200'
        }`}>
          Learning Path
        </h2>
        <p className={`text-sm mb-6 ${
          theme === 'day-mode' ? 'text-gray-600' : 'text-gray-400'
        }`}>
          This will redirect to Learner AI microservice when available.
        </p>
        
        {/* Mock Learning Path Visualization */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((step, index) => (
            <div key={step} className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                theme === 'day-mode' 
                  ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' 
                  : 'bg-emerald-900/30 text-emerald-300 border-2 border-emerald-700'
              }`}>
                {step}
              </div>
              <div className={`flex-1 p-4 rounded-lg ${
                theme === 'day-mode' ? 'bg-gray-50 border border-gray-200' : 'bg-slate-700/50 border border-gray-600'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  theme === 'day-mode' ? 'text-gray-800' : 'text-gray-200'
                }`}>
                  Learning Step {step}
                </h3>
                <p className={`text-sm ${
                  theme === 'day-mode' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Complete course modules and assessments to progress to the next step.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileLearningPathView;

