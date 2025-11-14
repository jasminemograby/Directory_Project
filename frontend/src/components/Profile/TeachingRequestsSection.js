// Teaching Requests Section Component - Trainers can submit teaching requests
import React, { useState } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';

const TeachingRequestsSection = ({ onTeachSkill }) => {
  const [showModal, setShowModal] = useState(false);
  const [skillToTeach, setSkillToTeach] = useState('');

  const handleSubmit = () => {
    if (skillToTeach.trim()) {
      onTeachSkill && onTeachSkill(skillToTeach.trim());
      setShowModal(false);
      setSkillToTeach('');
    }
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
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Teaching Requests</h2>
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
        >
          Teach a Skill
        </Button>
      </div>

      <p style={{ color: 'var(--text-secondary)' }}>
        Submit requests to proactively teach specific skills. Your request will be reviewed and matched with employees who need these skills.
      </p>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSkillToTeach('');
        }}
        title="Teach a Skill"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Skill to Teach
            </label>
            <input
              type="text"
              value={skillToTeach}
              onChange={(e) => setSkillToTeach(e.target.value)}
              placeholder="Enter skill name (e.g., React, Python, Data Analysis)"
              className="w-full px-4 py-2 border rounded-lg"
              style={{ 
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                setSkillToTeach('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!skillToTeach.trim()}
            >
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeachingRequestsSection;

