// Requests Section Component - Employee can create various requests
import React, { useState } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';

const RequestsSection = ({ onRequestTraining, onRequestTrainer, onRequestSkillVerification, onRequestSelfLearning }) => {
  const [showModal, setShowModal] = useState(false);
  const [requestType, setRequestType] = useState(null);

  const handleRequest = (type) => {
    setRequestType(type);
    setShowModal(true);
  };

  const handleSubmit = () => {
    // Call the appropriate handler
    switch (requestType) {
      case 'training':
        onRequestTraining && onRequestTraining();
        break;
      case 'trainer':
        onRequestTrainer && onRequestTrainer();
        break;
      case 'skill-verification':
        onRequestSkillVerification && onRequestSkillVerification();
        break;
      case 'self-learning':
        onRequestSelfLearning && onRequestSelfLearning();
        break;
      default:
        break;
    }
    setShowModal(false);
    setRequestType(null);
  };

  return (
    <div className="rounded-lg p-6" style={{ 
      backgroundColor: 'var(--bg-card)', 
      boxShadow: 'var(--shadow-card)', 
      borderColor: 'var(--bg-secondary)', 
      borderWidth: '1px', 
      borderStyle: 'solid' 
    }}>
      <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Requests</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        <Button
          variant="primary"
          onClick={() => handleRequest('training')}
        >
          Request Training
        </Button>

        <Button
          variant="secondary"
          onClick={() => handleRequest('trainer')}
        >
          Request to Become Internal Instructor
        </Button>

        <Button
          variant="tertiary"
          onClick={() => handleRequest('skill-verification')}
        >
          Request Skill Verification
        </Button>

        <Button
          variant="primary"
          onClick={() => handleRequest('self-learning')}
        >
          Request Self-Learning
        </Button>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setRequestType(null);
        }}
        title={`Request ${requestType ? requestType.replace('-', ' ') : ''}`}
      >
        <div className="space-y-4">
          <p style={{ color: 'var(--text-primary)' }}>
            {requestType === 'training' && 'Request training for a specific skill or course.'}
            {requestType === 'trainer' && 'Request to become an internal instructor and teach courses.'}
            {requestType === 'skill-verification' && 'Request verification for your skills through assessment.'}
            {requestType === 'self-learning' && 'Request access to self-learning resources for specific skills.'}
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                setRequestType(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
            >
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RequestsSection;

