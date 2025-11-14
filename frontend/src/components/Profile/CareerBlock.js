// Career Block Component - Shows current role, target role, value proposition, relevance score
import React from 'react';

const CareerBlock = ({ currentRole, targetRole, valueProposition, relevanceScore }) => {
  return (
    <div className="rounded-lg p-6" style={{ 
      backgroundColor: 'var(--bg-card)', 
      boxShadow: 'var(--shadow-card)', 
      borderColor: 'var(--bg-secondary)', 
      borderWidth: '1px', 
      borderStyle: 'solid' 
    }}>
      <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Career</h2>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Current Role */}
        <div>
          <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Current Role</h3>
          <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {currentRole || 'Not specified'}
          </p>
        </div>

        {/* Target Role */}
        <div>
          <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Target Role</h3>
          <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {targetRole || 'Not specified'}
          </p>
        </div>
      </div>

      {/* Value Proposition */}
      {valueProposition && (
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Value Proposition</h3>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {valueProposition}
          </p>
        </div>
      )}

      {/* Relevance Score */}
      {relevanceScore !== null && relevanceScore !== undefined && (
        <div>
          <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Relevance Score</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div 
                className="h-3 rounded-full transition-all"
                style={{ 
                  width: `${relevanceScore}%`,
                  background: 'var(--gradient-primary)'
                }}
              />
            </div>
            <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {relevanceScore}%
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            How well your current skills align with your target role
          </p>
        </div>
      )}
    </div>
  );
};

export default CareerBlock;

