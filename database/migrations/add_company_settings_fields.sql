-- Migration: Add company settings fields (passing grade, max attempts, exercise limit, public publish)

-- Check if company_settings table exists, if not create it
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, setting_key)
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_settings_company_id ON company_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_company_settings_key ON company_settings(setting_key);

-- Add comments
COMMENT ON TABLE company_settings IS 'Stores company-specific settings like passing grade, max attempts, exercise limit, public publish enabled';
COMMENT ON COLUMN company_settings.setting_key IS 'Setting key (e.g., passing_grade, max_attempts, exercise_limit, public_publish_enabled)';
COMMENT ON COLUMN company_settings.setting_value IS 'Setting value as text (will be parsed as needed)';

