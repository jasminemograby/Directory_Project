-- Migration: Add company size and description fields to companies table

-- Add company size column (number of employees)
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS size INTEGER;

-- Add company description/bio column
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add comments
COMMENT ON COLUMN companies.size IS 'Number of employees in the company';
COMMENT ON COLUMN companies.description IS 'Company bio/description';

