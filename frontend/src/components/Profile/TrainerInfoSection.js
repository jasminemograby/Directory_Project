// Trainer Info Section Component - Shows trainer-specific fields
import React from 'react';
import Button from '../common/Button';

const TrainerInfoSection = ({ 
  trainerStatus, 
  aiEnabled, 
  publicPublishEnabled,
  onEditSettings 
}) => {
  return (
    <div className="rounded-lg p-6" style={{ 
      backgroundColor: 'var(--bg-card)', 
      boxShadow: 'var(--shadow-card)', 
      borderColor: 'var(--bg-secondary)', 
      borderWidth: '1px', 
      borderStyle: 'solid' 
    }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Trainer Information</h2>
        {onEditSettings && (
          <Button
            variant="secondary"
            onClick={onEditSettings}
          >
            Edit Settings
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Trainer Status</h3>
          <span className={`px-3 py-1 rounded text-sm font-medium capitalize inline-block ${
            trainerStatus === 'Active' 
              ? 'bg-accent-green text-white' 
              : trainerStatus === 'Invited'
              ? 'bg-accent-orange text-white'
              : 'bg-gray-500 text-white'
          }`}>
            {trainerStatus || 'Invited'}
          </span>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Lifecycle: Invited → Active → Archived
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>AI Enabled</h3>
          <span className={`px-3 py-1 rounded text-sm font-medium inline-block ${
            aiEnabled 
              ? 'bg-accent-green text-white' 
              : 'bg-gray-400 text-white'
          }`}>
            {aiEnabled ? 'Yes' : 'No'}
          </span>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Controls whether AI adjusts content
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Public Publish</h3>
          <span className={`px-3 py-1 rounded text-sm font-medium inline-block ${
            publicPublishEnabled 
              ? 'bg-accent-green text-white' 
              : 'bg-gray-400 text-white'
          }`}>
            {publicPublishEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Share content with other companies
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrainerInfoSection;

