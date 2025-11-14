-- Step 1: Check if current_role column exists
-- Run this query first:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'employees' 
  AND column_name = 'current_role';

-- Step 2: If the query above returns NO ROWS, then run this:
-- (Copy and paste this line only if current_role doesn't exist)
ALTER TABLE employees ADD COLUMN current_role VARCHAR(255);

