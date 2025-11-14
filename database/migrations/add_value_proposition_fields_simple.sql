-- Simple migration for Supabase - Add current_role and value_proposition columns
-- Run each statement separately if needed

-- First, check if columns exist and add them one by one

-- Add current_role column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employees' 
        AND column_name = 'current_role'
    ) THEN
        ALTER TABLE employees ADD COLUMN current_role VARCHAR(255);
        RAISE NOTICE 'Column current_role added successfully';
    ELSE
        RAISE NOTICE 'Column current_role already exists';
    END IF;
END $$;

-- Add value_proposition column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employees' 
        AND column_name = 'value_proposition'
    ) THEN
        ALTER TABLE employees ADD COLUMN value_proposition TEXT;
        RAISE NOTICE 'Column value_proposition added successfully';
    ELSE
        RAISE NOTICE 'Column value_proposition already exists';
    END IF;
END $$;

