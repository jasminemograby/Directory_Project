# F005: Gemini Enrichment - Complete Testing Guide

## Prerequisites Checklist

Before testing, make sure you have:

- [x] ✅ Gemini API Key added to Railway (`GEMINI_API_KEY`)
- [ ] ⏳ Database migration run (`external_data_processed` table)
- [ ] ⏳ Employee with LinkedIn connection
- [ ] ⏳ Employee with GitHub connection
- [ ] ⏳ Backend deployed on Railway

## Step 1: Run Database Migration

### Go to Supabase SQL Editor

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **"New Query"**

### Run the Migration

Copy and paste this SQL:

```sql
-- Processed external data table (stores AI-processed data from Gemini)
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
```

4. Click **"Run"** (or Ctrl+Enter)
5. You should see: **"Success. No rows returned"**

### Verify Migration

1. Go to **Table Editor** in Supabase
2. Check that `external_data_processed` table exists
3. Verify columns: `id`, `employee_id`, `bio`, `processed_at`, `created_at`, `updated_at`

## Step 2: Prepare Test Employee

### Option A: Use Existing Employee

If you already have an employee with LinkedIn/GitHub connected:
- Note the `employee_id` (UUID)
- Skip to Step 3

### Option B: Create New Employee

1. Complete company registration (if not done)
2. Note the HR employee ID from `localStorage.getItem('hrEmployeeId')`
3. Or get employee ID from database:
   ```sql
   SELECT id, name, email FROM employees LIMIT 1;
   ```

## Step 3: Connect External Data Sources

### Connect LinkedIn

1. Open frontend: `https://directory-project-bice.vercel.app/profile`
2. Set employee ID in browser console:
   ```javascript
   localStorage.setItem('currentEmployeeId', 'your-employee-uuid-here')
   ```
3. Refresh the page
4. Click **"Connect"** button for LinkedIn
5. Complete OAuth flow
6. Verify connection shows as "Connected"

### Connect GitHub

1. On the same profile page
2. Click **"Connect"** button for GitHub
3. Complete OAuth flow
4. Verify connection shows as "Connected"

## Step 4: Trigger Enrichment

### Method 1: Via Frontend (Recommended)

1. On the profile page, after both LinkedIn and GitHub are connected
2. Click **"Collect All Data"** button (if available)
3. Wait for processing to complete
4. Check for success message

### Method 2: Via API Call

Use Postman, curl, or browser console:

```bash
# Replace YOUR_EMPLOYEE_ID with actual UUID
curl -X POST https://directoryproject-production.up.railway.app/api/external/collect/YOUR_EMPLOYEE_ID \
  -H "Content-Type: application/json"
```

Or in browser console:
```javascript
fetch('https://directoryproject-production.up.railway.app/api/external/collect/YOUR_EMPLOYEE_ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(console.log)
```

## Step 5: Verify Database Results

### Check Raw Data is Processed

Run in Supabase SQL Editor:

```sql
-- Check raw data is marked as processed
SELECT 
  employee_id,
  provider,
  processed,
  fetched_at
FROM external_data_raw
WHERE employee_id = 'YOUR_EMPLOYEE_ID';
```

**Expected**: All rows should have `processed = true`

### Check Processed Data Exists

```sql
-- Check processed bio
SELECT 
  employee_id,
  bio,
  processed_at
FROM external_data_processed
WHERE employee_id = 'YOUR_EMPLOYEE_ID';
```

**Expected**: One row with `bio` text and `processed_at` timestamp

### Check Projects Created

```sql
-- Check projects
SELECT 
  id,
  title,
  summary,
  source,
  created_at
FROM projects
WHERE employee_id = 'YOUR_EMPLOYEE_ID'
  AND source = 'gemini_ai'
ORDER BY created_at DESC;
```

**Expected**: Multiple rows with project titles and summaries

## Step 6: Verify Frontend Display

### View Profile Page

1. Go to: `https://directory-project-bice.vercel.app/profile`
2. Make sure employee ID is set in `localStorage`
3. Refresh the page

### Expected Display

You should see:

1. **Profile Information Section**
   - Name, Email, Role

2. **Professional Bio Section** ✅
   - AI-generated bio text
   - "Generated on [date]" timestamp

3. **Projects Section** ✅
   - List of projects with titles and summaries
   - Each project shows "Source: gemini_ai"

4. **Skills Section** (if Skills Engine integrated)
   - Skills list (will be populated in F006)

### What Should NOT Be Displayed

- ❌ Raw LinkedIn data (JSON)
- ❌ Raw GitHub data (JSON)
- ❌ Unprocessed external data
- ❌ OAuth tokens or sensitive information

## Step 7: Check Backend Logs

### View Railway Logs

1. Go to Railway Dashboard
2. Select your backend service
3. Click **"Deployments"** → Latest deployment → **"View Logs"**

### Look For

✅ Success indicators:
```
[Enrichment] Starting profile enrichment for employee: ...
[Enrichment] Found raw data - LinkedIn: true, GitHub: true
[Enrichment] Sending data to Gemini API for processing...
[Gemini] Bio generation complete
[Enrichment] Gemini processing complete - Bio: true, Projects: 5
[Enrichment] Bio stored in external_data_processed
[Enrichment] 5 projects stored
[Enrichment] Raw data marked as processed
```

❌ Error indicators:
```
[Gemini] API key not configured
[Gemini] Error generating bio: ...
[Enrichment] Error enriching profile: ...
```

## Troubleshooting

### Issue: "No processed data available"

**Possible causes:**
1. Migration not run → Run migration in Supabase
2. Enrichment not triggered → Call `/api/external/collect/:employeeId`
3. Gemini API error → Check Railway logs

**Solution:**
- Verify migration completed
- Check Railway logs for errors
- Verify `GEMINI_API_KEY` is set correctly

### Issue: "Bio is empty"

**Possible causes:**
1. Gemini API returned null
2. Safety filters blocked content
3. Insufficient data in LinkedIn/GitHub

**Solution:**
- Check Railway logs for Gemini responses
- Verify LinkedIn/GitHub have sufficient profile data
- Check for safety rating blocks in logs

### Issue: "No projects displayed"

**Possible causes:**
1. Gemini didn't identify projects
2. Projects not stored in database
3. Frontend not fetching processed data

**Solution:**
- Check `projects` table in database
- Verify frontend calls `getProcessedData` endpoint
- Check Railway logs for project identification

### Issue: "Raw data still showing"

**Solution:**
- Frontend should ONLY call `GET /api/external/processed/:employeeId`
- Never call raw data endpoints in profile display
- Verify `EmployeeProfile.js` uses `getProcessedData` only

## Success Criteria

✅ All checks passed:
- [ ] Migration run successfully
- [ ] LinkedIn connected
- [ ] GitHub connected
- [ ] Enrichment triggered
- [ ] Raw data marked as `processed = true`
- [ ] Bio exists in `external_data_processed`
- [ ] Projects exist in `projects` table
- [ ] Frontend displays processed data only
- [ ] No raw data visible in frontend
- [ ] Backend logs show successful enrichment

## Next Steps

After successful testing:
1. ✅ F005 is complete
2. → Proceed to F006: Skills Engine Integration
3. Skills will populate the `skills` table
4. Skills will display in profile automatically

