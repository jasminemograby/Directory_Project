# Cleanup Script Instructions

## ⚠️ Important: Run Migration First!

Before running the cleanup script, you **MUST** run the migration to fix the foreign key constraint:

```sql
-- Run this in Supabase SQL Editor or via psql:
ALTER TABLE companies DROP CONSTRAINT IF EXISTS fk_decision_maker;
ALTER TABLE companies ADD CONSTRAINT fk_decision_maker 
    FOREIGN KEY (decision_maker_id) REFERENCES employees(id) ON DELETE SET NULL;
```

## Running the Cleanup Script

### Option 1: Via Node.js (Local)
```bash
cd backend
node scripts/cleanup-corrupted-registration-data.js
```

### Option 2: Via Railway CLI
```bash
railway run node backend/scripts/cleanup-corrupted-registration-data.js
```

### Option 3: Via Supabase SQL (Manual)
If the script still fails, you can run these SQL commands directly:

```sql
-- Step 1: Find the corrupted employee
SELECT id, name, email, company_id 
FROM employees 
WHERE LOWER(TRIM(email)) = 'yasmin_hitfield@hotmail.com';

-- Step 2: Remove decision_maker references
UPDATE companies 
SET decision_maker_id = NULL 
WHERE decision_maker_id IN (
  SELECT id FROM employees 
  WHERE LOWER(TRIM(email)) = 'yasmin_hitfield@hotmail.com'
);

-- Step 3: Remove manager references from departments
UPDATE departments 
SET manager_id = NULL 
WHERE manager_id IN (
  SELECT id FROM employees 
  WHERE LOWER(TRIM(email)) = 'yasmin_hitfield@hotmail.com'
);

-- Step 4: Remove manager references from teams
UPDATE teams 
SET manager_id = NULL 
WHERE manager_id IN (
  SELECT id FROM employees 
  WHERE LOWER(TRIM(email)) = 'yasmin_hitfield@hotmail.com'
);

-- Step 5: Delete the employee
DELETE FROM employees 
WHERE LOWER(TRIM(email)) = 'yasmin_hitfield@hotmail.com'
AND company_id = '274f0a5a-8930-4060-a3da-e6553baeab85';
```

## Troubleshooting

### Error: "Connection terminated unexpectedly"
- Check your `DATABASE_URL` in `.env`
- Try using direct connection instead of pooler
- Wait a few seconds and retry

### Error: "Foreign key constraint violation"
- **You MUST run the migration first!** (see above)
- The migration changes `ON DELETE` behavior to `SET NULL`

### Error: "Cannot find path"
- Make sure you're in the `backend` directory
- Or use full path: `node backend/scripts/cleanup-corrupted-registration-data.js`

