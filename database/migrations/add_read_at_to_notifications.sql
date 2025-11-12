-- Migration: Add read_at column to notifications table
-- Run this in Supabase SQL Editor

-- Add read_at column if it doesn't exist
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications' AND column_name = 'read_at';

