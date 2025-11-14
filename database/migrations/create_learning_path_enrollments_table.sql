-- Migration: Create learning_path_enrollments table
-- This table tracks employee enrollments to learning paths

CREATE TABLE IF NOT EXISTS learning_path_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    enrollment_type VARCHAR(50) NOT NULL CHECK (enrollment_type IN ('personalized', 'group', 'instructor')),
    skill_ids JSONB, -- For group type - array of skill IDs
    instructor_id UUID, -- For instructor type - instructor employee ID
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    learner_ai_path_id VARCHAR(255), -- ID from Learner AI microservice
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_learning_path_enrollments_employee_id ON learning_path_enrollments(employee_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_enrollments_company_id ON learning_path_enrollments(company_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_enrollments_status ON learning_path_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_learning_path_enrollments_type ON learning_path_enrollments(enrollment_type);

-- Add unique constraint to prevent duplicate enrollments (one active enrollment per employee per type)
CREATE UNIQUE INDEX IF NOT EXISTS idx_learning_path_enrollments_unique_active 
ON learning_path_enrollments(employee_id, enrollment_type) 
WHERE status IN ('pending', 'approved');

-- Comment
COMMENT ON TABLE learning_path_enrollments IS 'Tracks employee enrollments to learning paths (personalized, group, or instructor-led)';

