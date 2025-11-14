-- Add missing request tables if they don't exist
-- These tables are required for the Requests System (Phase 4)

-- Training requests table
CREATE TABLE IF NOT EXISTS training_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    course_id VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_at TIMESTAMP,
    approved_by VARCHAR(255),
    rejected_at TIMESTAMP,
    rejected_by VARCHAR(255),
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skill verification requests table
CREATE TABLE IF NOT EXISTS skill_verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    skill_ids JSONB NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_at TIMESTAMP,
    approved_by VARCHAR(255),
    rejected_at TIMESTAMP,
    rejected_by VARCHAR(255),
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Self-learning requests table
CREATE TABLE IF NOT EXISTS self_learning_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    course_id VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    reason TEXT,
    learning_path TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_at TIMESTAMP,
    approved_by VARCHAR(255),
    rejected_at TIMESTAMP,
    rejected_by VARCHAR(255),
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update extra_attempt_requests to include company_id if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'extra_attempt_requests' 
        AND column_name = 'company_id'
    ) THEN
        ALTER TABLE extra_attempt_requests ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'extra_attempt_requests' 
        AND column_name = 'reason'
    ) THEN
        ALTER TABLE extra_attempt_requests ADD COLUMN reason TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'extra_attempt_requests' 
        AND column_name = 'approved_at'
    ) THEN
        ALTER TABLE extra_attempt_requests ADD COLUMN approved_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'extra_attempt_requests' 
        AND column_name = 'approved_by'
    ) THEN
        ALTER TABLE extra_attempt_requests ADD COLUMN approved_by VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'extra_attempt_requests' 
        AND column_name = 'rejected_at'
    ) THEN
        ALTER TABLE extra_attempt_requests ADD COLUMN rejected_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'extra_attempt_requests' 
        AND column_name = 'rejected_by'
    ) THEN
        ALTER TABLE extra_attempt_requests ADD COLUMN rejected_by VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'extra_attempt_requests' 
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE extra_attempt_requests ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_training_requests_employee_id ON training_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_requests_company_id ON training_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_training_requests_status ON training_requests(status);
CREATE INDEX IF NOT EXISTS idx_skill_verification_requests_employee_id ON skill_verification_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_skill_verification_requests_company_id ON skill_verification_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_skill_verification_requests_status ON skill_verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_self_learning_requests_employee_id ON self_learning_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_self_learning_requests_company_id ON self_learning_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_self_learning_requests_status ON self_learning_requests(status);
CREATE INDEX IF NOT EXISTS idx_extra_attempt_requests_company_id ON extra_attempt_requests(company_id);

-- Apply updated_at triggers
CREATE TRIGGER update_training_requests_updated_at BEFORE UPDATE ON training_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_verification_requests_updated_at BEFORE UPDATE ON skill_verification_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_self_learning_requests_updated_at BEFORE UPDATE ON self_learning_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

