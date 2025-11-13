-- Processed external data table (stores AI-processed data from Gemini)
-- This table stores cleaned and processed data after Gemini AI enrichment

CREATE TABLE IF NOT EXISTS external_data_processed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    bio TEXT,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_external_data_processed_employee ON external_data_processed(employee_id);
CREATE INDEX IF NOT EXISTS idx_external_data_processed_processed_at ON external_data_processed(processed_at);

