-- Working migration for Supabase: Add current_role column
-- This uses a simpler approach that works in Supabase SQL Editor

-- First, try to drop the column if it exists (safe if it doesn't exist)
-- Then add it fresh
DO $$
BEGIN
    -- Try to add the column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'employees' 
          AND column_name = 'current_role'
    ) THEN
        EXECUTE 'ALTER TABLE employees ADD COLUMN current_role VARCHAR(255)';
    END IF;
END $$;

