-- Migration: Fix email uniqueness to be per-company instead of global
-- This allows the same email to exist in different companies
-- But prevents duplicate emails within the same company

-- Step 1: Drop the existing UNIQUE constraint on email
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_email_key;
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_email_unique;

-- Step 2: Create a unique constraint on (company_id, email) combination
-- This ensures email is unique per company, but can exist in multiple companies
CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_company_email_unique 
ON employees(company_id, LOWER(TRIM(email)));

-- Step 3: Add a comment explaining the constraint
COMMENT ON INDEX idx_employees_company_email_unique IS 
    'Ensures email is unique per company. Same email can exist in different companies.';

