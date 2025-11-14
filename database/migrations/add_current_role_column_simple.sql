-- Simple migration: Add current_role column to employees table
-- Run this in Supabase SQL Editor

-- Check and add current_role column
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS current_role VARCHAR(255);

