# ⚠️ URGENT: Migration Required - ai_enabled Column

**תאריך:** 2025-01-XX  
**Priority:** 🔴 **CRITICAL**  
**Status:** ⚠️ **ACTION REQUIRED**

---

## 🐛 Problem

**Error when submitting Company Registration Step 4:**
```
column "ai_enabled" of relation "employees" does not exist
```

**Root Cause:**
- The `ai_enabled` column is missing from the `employees` table
- This column is required for trainer registration (Internal/External Instructors)

---

## ✅ Solution

### Step 1: Run Migration in Subabase SQL Editor

**File:** `database/migrations/add_ai_enabled_column.sql`

**Copy and paste this SQL:**

```sql
-- Migration: Add ai_enabled column to employees table
-- This migration is idempotent - safe to run multiple times

-- Add ai_enabled column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employees' 
        AND column_name = 'ai_enabled'
    ) THEN
        ALTER TABLE employees ADD COLUMN ai_enabled BOOLEAN DEFAULT false;
        RAISE NOTICE 'Column ai_enabled added successfully';
    ELSE
        RAISE NOTICE 'Column ai_enabled already exists';
    END IF;
END $$;

-- Add comment
COMMENT ON COLUMN employees.ai_enabled IS 'Controls whether AI adjusts content for trainers (editable by instructor)';
```

### Step 2: Verify Migration

**Run this query to verify:**

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'employees'
AND column_name = 'ai_enabled';
```

**Expected Result:**
```
column_name  | data_type | is_nullable | column_default
-------------|-----------|-------------|----------------
ai_enabled   | boolean   | YES         | false
```

---

## ✅ After Migration

1. ✅ Migration run successfully
2. ✅ Column exists in database
3. ✅ Company Registration Step 4 should work
4. ✅ Trainer registration with AI Enable should work

---

## 📋 Quick Steps

1. **Open Subabase SQL Editor**
2. **Copy migration SQL** from `database/migrations/add_ai_enabled_column.sql`
3. **Paste and Run** in SQL Editor
4. **Verify** with verification query
5. **Test** Company Registration Step 4

---

## 🔍 Additional Notes

- Migration is **idempotent** (safe to run multiple times)
- Default value is `false`
- Column is nullable (can be NULL)
- Used for trainers (Internal/External Instructors) only

---

**תאריך:** 2025-01-XX  
**Priority:** 🔴 **CRITICAL**  
**Status:** ⚠️ **RUN MIGRATION NOW**

