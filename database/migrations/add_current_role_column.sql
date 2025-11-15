-- Migration: Add current_role column to employees table
-- This migration is idempotent - safe to run multiple times

-- Add current_role column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employees' 
        AND column_name = 'current_role'
    ) THEN
        ALTER TABLE employees ADD COLUMN "current_role" VARCHAR(255);
        RAISE NOTICE 'Column current_role added successfully';
    ELSE
        RAISE NOTICE 'Column current_role already exists';
    END IF;
END $$;

