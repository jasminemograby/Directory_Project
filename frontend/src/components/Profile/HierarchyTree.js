// Hierarchy Tree Component - Foldable tree view of organization structure
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfilePath } from '../../utils/constants';

const HierarchyTree = ({ hierarchy, onEmployeeClick, showTitle = false }) => {
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!hierarchy) return;
    setExpanded((prev) => {
      if (Object.keys(prev).length > 0) {
        return prev;
      }
      const initial = {};
      const markExpanded = (node, path = '') => {
        if (!node || !node.id) return;
        const currentPath = path ? `${path}.${node.id}` : node.id;
        initial[currentPath] = true;
      };

      if (Array.isArray(hierarchy)) {
        hierarchy.forEach((node) => markExpanded(node));
      } else {
        markExpanded(hierarchy);
      }
      return initial;
    });
  }, [hierarchy]);

  const toggleExpand = (path) => {
    setExpanded(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleEmployeeClick = (employeeId, employeeName) => {
    if (onEmployeeClick) {
      onEmployeeClick(employeeId, employeeName);
    } else {
      // Default: navigate to employee profile
      navigate(getProfilePath(employeeId));
    }
  };

  const renderNode = (node, level = 0, path = '') => {
    const currentPath = path ? `${path}.${node.id}` : node.id;
    const isExpanded = expanded[currentPath];
    const hasChildren = (node.children && node.children.length > 0) || 
                        (node.employees && node.employees.length > 0) ||
                        (node.teams && node.teams.length > 0);

    return (
      <div key={currentPath} className="mb-1">
        <div 
          className="flex items-center gap-2 py-2 px-3 rounded cursor-pointer hover:bg-opacity-50 transition-colors"
          style={{ 
            backgroundColor: level === 0 ? 'var(--bg-secondary)' : 'transparent',
            marginLeft: `${level * 1.5}rem`,
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
            {node.name || node.title}
          </span>
          {node.type && (
            <span className="text-xs px-2 py-1 rounded" style={{ 
              backgroundColor: 'var(--bg-tertiary)', 
              color: 'var(--text-secondary)' 
            }}>
              {node.type}
            </span>
          )}
        </div>

        {isExpanded && (
          <div className="mt-1">
            {/* Departments - Company has departments */}
            {node.departments && node.departments.map(dept => 
              renderNode({ ...dept, type: 'Department' }, level + 1, currentPath)
            )}

            {/* Teams - Department has teams */}
            {node.teams && node.teams.map(team => 
              renderNode({ ...team, type: 'Team' }, level + 1, currentPath)
            )}

            {/* Employees - Team has employees */}
            {node.employees && node.employees.map(employee => (
              <div 
                key={employee.id}
                className="flex items-center gap-2 py-2 px-3 rounded cursor-pointer hover:bg-opacity-50 transition-colors"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  marginLeft: `${(level + 1) * 1.5}rem`
                }}
                onClick={() => handleEmployeeClick(employee.id, employee.name)}
              >
                <span className="text-sm">👤</span>
                <span style={{ color: 'var(--text-primary)' }}>{employee.name}</span>
                {employee.email && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    ({employee.email})
                  </span>
                )}
                {employee.role && (
                  <span className="text-xs px-2 py-1 rounded" style={{ 
                    backgroundColor: 'var(--bg-tertiary)', 
                    color: 'var(--text-secondary)' 
                  }}>
                    {employee.role}
                  </span>
                )}
                <button
                  className="text-xs px-2 py-1 rounded ml-auto"
                  style={{ 
                    backgroundColor: 'var(--primary-base)', 
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEmployeeClick(employee.id, employee.name);
                  }}
                >
                  View Profile
                </button>
              </div>
            ))}

            {/* Children (generic fallback) */}
            {node.children && node.children.map(child => 
              renderNode(child, level + 1, currentPath)
            )}
          </div>
        )}
      </div>
    );
  };

  if (!hierarchy || (Array.isArray(hierarchy) && hierarchy.length === 0)) {
    return (
      <div className="rounded-lg p-6" style={{ 
        backgroundColor: 'var(--bg-card)', 
        boxShadow: 'var(--shadow-card)', 
        borderColor: 'var(--bg-secondary)', 
        borderWidth: '1px', 
        borderStyle: 'solid' 
      }}>
        <p style={{ color: 'var(--text-secondary)' }}>No hierarchy data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {Array.isArray(hierarchy) 
        ? hierarchy.map(node => renderNode(node))
        : renderNode(hierarchy)
      }
    </div>
  );
};

export default HierarchyTree;

