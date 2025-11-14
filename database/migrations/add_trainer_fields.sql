-- Add trainer-specific fields to employees table
-- These fields are required for Trainer Profile

-- Add trainer_status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employees' 
        AND column_name = 'trainer_status'
    ) THEN
        ALTER TABLE employees ADD COLUMN trainer_status VARCHAR(20) DEFAULT 'Invited' CHECK (trainer_status IN ('Invited', 'Active', 'Archived'));
    END IF;
END $$;

-- Add ai_enabled column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employees' 
        AND column_name = 'ai_enabled'
    ) THEN
        ALTER TABLE employees ADD COLUMN ai_enabled BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Add public_publish_enabled column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employees' 
        AND column_name = 'public_publish_enabled'
    ) THEN
        ALTER TABLE employees ADD COLUMN public_publish_enabled BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add comments
COMMENT ON COLUMN employees.trainer_status IS 'Trainer lifecycle status: Invited → Active → Archived';
COMMENT ON COLUMN employees.ai_enabled IS 'Controls whether AI adjusts content for this trainer (editable by instructor)';
COMMENT ON COLUMN employees.public_publish_enabled IS 'Controls if content can be shared with other companies (editable by instructor/company)';

