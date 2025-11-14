# F005: Database Migration Fix

## הבעיה
`ADD CONSTRAINT IF NOT EXISTS` לא נתמך ב-PostgreSQL.

## הפתרון
שימוש ב-`DO $$ ... $$` block לבדיקה לפני הוספת ה-constraint.

## SQL Script (תקן)

לך ל-Supabase → SQL Editor והרץ:

```sql
-- Add UNIQUE constraint to external_data_raw table
-- This ensures one record per employee per provider

-- Check if constraint exists before adding
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'external_data_raw_employee_provider_unique'
    ) THEN
        ALTER TABLE external_data_raw 
        ADD CONSTRAINT external_data_raw_employee_provider_unique 
        UNIQUE (employee_id, provider);
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
ALTER TABLE external_data_raw 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

## איך לבדוק שהכל עבד

```sql
-- בדוק שה-constraint קיים
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'external_data_raw'::regclass 
  AND conname = 'external_data_raw_employee_provider_unique';

-- בדוק שה-updated_at column קיים
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'external_data_raw' 
  AND column_name = 'updated_at';
```

אם שתי השאילתות מחזירות שורות = הכל עבד! ✅

