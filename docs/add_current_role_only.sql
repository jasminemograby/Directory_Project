-- Add current_role column only (target_role and value_proposition already exist)
-- Run this in Supabase SQL Editor

ALTER TABLE employees ADD COLUMN current_role VARCHAR(255);

-- Optional: Add comment
COMMENT ON COLUMN employees.current_role IS 'Current role of the employee in the company (filled during company registration)';

