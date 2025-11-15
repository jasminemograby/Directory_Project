// Overview Tab - Shows important profile information
import React from 'react';
import { useApp } from '../../contexts/AppContext';
import CareerBlock from './CareerBlock';
import SkillsTree from './SkillsTree';

const ProfileOverviewTab = ({ employee, processedData, profileData }) => {
  const { theme } = useApp();

  return (
    <div className="space-y-6">
      {/* Bio Section */}
      {processedData?.bio && (
        <div className={`rounded-lg p-6 ${
          theme === 'day-mode' 
            ? 'bg-white border border-gray-200 shadow-sm' 
            : 'bg-slate-800 border border-gray-700 shadow-lg'
        }`}>
          <h2 className={`text-2xl font-semibold mb-4 ${
            theme === 'day-mode' ? 'text-gray-800' : 'text-gray-200'
          }`}>
            Professional Bio
          </h2>
          <p className={`leading-relaxed ${
            theme === 'day-mode' ? 'text-gray-700' : 'text-gray-300'
          }`}>
            {processedData.bio}
          </p>
          {processedData.processedAt && (
            <p className={`text-xs mt-2 ${
              theme === 'day-mode' ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Generated on {new Date(processedData.processedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Value Proposition + Relevance Score */}
      {profileData && profileData.career && (
        <CareerBlock
          currentRole={profileData.career.currentRole || profileData.career.current_role || employee?.current_role || employee?.role}
          targetRole={profileData.career.targetRole || profileData.career.target_role || employee?.target_role}
          valueProposition={profileData.career.valueProposition || profileData.career.value_proposition}
          relevanceScore={profileData.career.relevanceScore || profileData.career.relevance_score}
        />
      )}
      {/* Fallback: Show employee data if profileData doesn't have career */}
      {(!profileData || !profileData.career) && employee && (
        <CareerBlock
          currentRole={employee.current_role || employee.role}
          targetRole={employee.target_role}
          valueProposition={null}
          relevanceScore={null}
        />
      )}

      {/* Skills Section */}
      {profileData && (
        <SkillsTree
          competencies={profileData.competencies || profileData.skills}
        />
      )}

      {/* Projects Section */}
      {processedData?.projects && processedData.projects.length > 0 && (
        <div className={`rounded-lg p-6 ${
          theme === 'day-mode' 
            ? 'bg-white border border-gray-200 shadow-sm' 
            : 'bg-slate-800 border border-gray-700 shadow-lg'
        }`}>
          <h2 className={`text-2xl font-semibold mb-4 ${
            theme === 'day-mode' ? 'text-gray-800' : 'text-gray-200'
          }`}>
            Projects
          </h2>
          <div className="space-y-4">
            {processedData.projects.map((project, idx) => (
              <div 
                key={project.id || idx} 
                className={`pb-4 ${
                  idx < processedData.projects.length - 1 
                    ? 'border-b border-gray-200' 
                    : ''
                }`}
              >
                <h3 className={`text-lg font-medium mb-2 ${
                  theme === 'day-mode' ? 'text-gray-800' : 'text-gray-200'
                }`}>
                  {project.title}
                </h3>
                <p className={`${
                  theme === 'day-mode' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {project.summary}
                </p>
                {project.source && (
                  <p className={`text-xs mt-1 ${
                    theme === 'day-mode' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Source: {project.source}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* External Data Links */}
      {(processedData?.linkedin || processedData?.github) && (
        <div className={`rounded-lg p-6 ${
          theme === 'day-mode' 
            ? 'bg-white border border-gray-200 shadow-sm' 
            : 'bg-slate-800 border border-gray-700 shadow-lg'
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            theme === 'day-mode' ? 'text-gray-800' : 'text-gray-200'
          }`}>
            External Data Sources
          </h2>
          <div className="flex gap-4">
            {processedData?.linkedin && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                theme === 'day-mode' 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-blue-900/20 border border-blue-800'
              }`}>
                <span className={`text-sm font-medium ${
                  theme === 'day-mode' ? 'text-blue-700' : 'text-blue-300'
                }`}>
                  LinkedIn
                </span>
              </div>
            )}
            {processedData?.github && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                theme === 'day-mode' 
                  ? 'bg-gray-50 border border-gray-200' 
                  : 'bg-gray-800 border border-gray-700'
              }`}>
                <span className={`text-sm font-medium ${
                  theme === 'day-mode' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  GitHub
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileOverviewTab;

