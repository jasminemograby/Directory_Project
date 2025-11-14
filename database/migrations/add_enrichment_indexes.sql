-- Add indexes for enrichment-related queries to improve performance
-- These indexes optimize lookups for projects, skills, and profile status queries

-- Index for projects table (employee_id lookups)
CREATE INDEX IF NOT EXISTS idx_projects_employee_id ON projects(employee_id);
CREATE INDEX IF NOT EXISTS idx_projects_source ON projects(source);

-- Index for skills table (employee_id lookups)
CREATE INDEX IF NOT EXISTS idx_skills_employee_id ON skills(employee_id);
CREATE INDEX IF NOT EXISTS idx_skills_type ON skills(skill_type);

-- Index for employees table (profile_status queries for HR approval)
CREATE INDEX IF NOT EXISTS idx_employees_profile_status ON employees(profile_status);
CREATE INDEX IF NOT EXISTS idx_employees_company_status ON employees(company_id, profile_status);

-- Composite index for common query pattern: get employees by company and status
CREATE INDEX IF NOT EXISTS idx_employees_company_status_created ON employees(company_id, profile_status, created_at);

