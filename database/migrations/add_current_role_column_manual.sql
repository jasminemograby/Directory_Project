-- Manual migration: Add current_role column to employees table
-- Step 1: Check if column exists first
-- Run this query first to check:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'current_role';

-- Step 2: If the query above returns no rows, run this:
ALTER TABLE employees ADD COLUMN current_role VARCHAR(255);

-- If you get an error that the column already exists, that's fine - it means it's already there.

