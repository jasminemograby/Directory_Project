// Skills Tree Component - Hierarchical skills display with verification status
import React, { useState } from 'react';
import Button from '../common/Button';

const SkillsTree = ({ competencies, onVerifySkills }) => {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (path) => {
    setExpanded(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const renderCompetency = (competency, level = 0, path = '') => {
    const currentPath = path ? `${path}.${competency.name}` : competency.name;
    const isExpanded = expanded[currentPath];
    const hasChildren = (competency.nested_competencies && competency.nested_competencies.length > 0) ||
                        (competency.skills && competency.skills.length > 0);

    return (
      <div key={currentPath} className="mb-2" style={{ marginLeft: `${level * 1.5}rem` }}>
        <div 
          className="flex items-center gap-2 py-2 px-3 rounded cursor-pointer hover:bg-opacity-50 transition-colors"
          style={{ 
            backgroundColor: level === 0 ? 'var(--bg-secondary)' : 'transparent',
            cursor: hasChildren ? 'pointer' : 'default'
          }}
          onClick={() => hasChildren && toggleExpand(currentPath)}
        >
          {hasChildren && (
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {competency.name}
          </span>
        </div>

        {isExpanded && (
          <div className="mt-1">
            {/* Nested Competencies */}
            {competency.nested_competencies && competency.nested_competencies.map(nested => 
              renderCompetency(nested, level + 1, currentPath)
            )}

            {/* Skills */}
            {competency.skills && competency.skills.length > 0 && (
              <div className="ml-4 mt-2 space-y-2">
                {competency.skills.map((skill, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ color: 'var(--text-primary)' }}>{skill.name}</span>
                      {skill.verified ? (
                        <span className="px-2 py-1 text-xs rounded" style={{ 
                          backgroundColor: 'var(--accent-green)', 
                          color: 'white' 
                        }}>
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded" style={{ 
                          backgroundColor: 'var(--bg-tertiary)', 
                          color: 'var(--text-secondary)' 
                        }}>
                          Not Verified
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-lg p-6" style={{ 
      backgroundColor: 'var(--bg-card)', 
      boxShadow: 'var(--shadow-card)', 
      borderColor: 'var(--bg-secondary)', 
      borderWidth: '1px', 
      borderStyle: 'solid' 
    }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Skills</h2>
        <Button
          variant="primary"
          onClick={onVerifySkills}
        >
          Verify Your Skills
        </Button>
      </div>

      {competencies && competencies.length > 0 ? (
        <div className="space-y-2">
          {competencies.map((competency, idx) => (
            <div key={idx}>
              {renderCompetency(competency)}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--text-secondary)' }}>No skills data available yet.</p>
      )}
    </div>
  );
};

export default SkillsTree;

