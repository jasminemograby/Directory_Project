-- Add UNIQUE constraint to external_data_raw table
-- This ensures one record per employee per provider

ALTER TABLE external_data_raw 
ADD CONSTRAINT external_data_raw_employee_provider_unique 
UNIQUE (employee_id, provider);

-- Add updated_at column if it doesn't exist
ALTER TABLE external_data_raw 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

