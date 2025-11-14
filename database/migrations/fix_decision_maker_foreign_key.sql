-- Migration: Fix decision_maker foreign key to allow cleanup
-- Changes ON DELETE behavior from RESTRICT to SET NULL
-- This allows cleanup of corrupted employees without breaking company records

-- Drop existing constraint if it exists
ALTER TABLE companies DROP CONSTRAINT IF EXISTS fk_decision_maker;

-- Recreate with ON DELETE SET NULL
ALTER TABLE companies ADD CONSTRAINT fk_decision_maker 
    FOREIGN KEY (decision_maker_id) REFERENCES employees(id) ON DELETE SET NULL;

-- Comment
COMMENT ON CONSTRAINT fk_decision_maker ON companies IS 
    'Foreign key to employees table. ON DELETE SET NULL allows cleanup of corrupted employees.';

