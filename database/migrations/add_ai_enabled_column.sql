-- Migration: Add ai_enabled column to employees table
-- This migration is idempotent - safe to run multiple times

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
        ALTER TABLE employees ADD COLUMN ai_enabled BOOLEAN DEFAULT false;
        RAISE NOTICE 'Column ai_enabled added successfully';
    ELSE
        RAISE NOTICE 'Column ai_enabled already exists';
    END IF;
END $$;

-- Add comment
COMMENT ON COLUMN employees.ai_enabled IS 'Controls whether AI adjusts content for trainers (editable by instructor)';

