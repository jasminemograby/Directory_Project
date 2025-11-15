-- Migration: Add manager fields to employees table (is_manager, manager_type, manager_of_id)

-- Add is_manager boolean field
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS is_manager BOOLEAN DEFAULT false;

-- Add manager_type field (null, 'dept_manager', 'team_manager')
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS manager_type VARCHAR(50) 
CHECK (manager_type IS NULL OR manager_type IN ('dept_manager', 'team_manager'));

-- Add manager_of_id field (which department/team this employee manages)
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS manager_of_id UUID;

-- Add foreign key for manager_of_id (can reference departments or teams)
-- Note: We'll use a trigger or application logic to validate this
-- since PostgreSQL doesn't support multiple foreign key targets directly

-- Add comments
COMMENT ON COLUMN employees.is_manager IS 'Whether this employee is a manager';
COMMENT ON COLUMN employees.manager_type IS 'Type of manager: dept_manager or team_manager';
COMMENT ON COLUMN employees.manager_of_id IS 'ID of the department or team this employee manages';

