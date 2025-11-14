-- Migration: Add external_api_calls_log table
-- Tracks all external API calls for monitoring and debugging

-- External API Calls Log table
CREATE TABLE IF NOT EXISTS external_api_calls_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(100) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    payload JSONB,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'timeout', 'circuit_breaker')),
    error TEXT,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_external_api_calls_log_service_name ON external_api_calls_log(service_name);
CREATE INDEX IF NOT EXISTS idx_external_api_calls_log_status ON external_api_calls_log(status);
CREATE INDEX IF NOT EXISTS idx_external_api_calls_log_created_at ON external_api_calls_log(created_at);
CREATE INDEX IF NOT EXISTS idx_external_api_calls_log_endpoint ON external_api_calls_log(endpoint);

-- Comment on table
COMMENT ON TABLE external_api_calls_log IS 'Logs all external API calls to microservices for monitoring and debugging';

