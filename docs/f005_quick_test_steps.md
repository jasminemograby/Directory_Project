# F005: Quick Testing Steps

## ✅ Step 1: Migration Complete
- [x] Database migration run
- [x] `external_data_processed` table created

## Step 2: Get Employee ID for Testing

### Option A: Use HR Employee (Easiest)
1. Open browser console (F12)
2. Run this command:
   ```javascript
   localStorage.getItem('hrEmployeeId') || localStorage.getItem('currentEmployeeId')
   ```
3. Copy the UUID that appears

### Option B: Get from Database
1. Go to Supabase → **Table Editor** → `employees`
2. Find any employee
3. Copy the `id` (UUID) column

### Option C: Use Company Registration
If you just registered a company:
- The HR employee was created automatically
- Check `localStorage.getItem('hrEmployeeId')` in browser console

## Step 3: Connect External Data Sources

### Open Profile Page
1. Go to: `https://directory-project-bice.vercel.app/profile`
2. Open browser console (F12)
3. Set employee ID:
   ```javascript
   localStorage.setItem('currentEmployeeId', 'YOUR_EMPLOYEE_ID_HERE')
   ```
   (Replace `YOUR_EMPLOYEE_ID_HERE` with the actual UUID)
4. Refresh the page

### Connect LinkedIn
1. On the profile page, find the **"Enhance My Profile"** section
2. Click **"Connect"** button next to LinkedIn
3. Complete OAuth flow (authorize the app)
4. You'll be redirected back
5. Verify it shows **"Connected"** ✅

### Connect GitHub
1. On the same profile page
2. Click **"Connect"** button next to GitHub
3. Complete OAuth flow (authorize the app)
4. You'll be redirected back
5. Verify it shows **"Connected"** ✅

## Step 4: Trigger Enrichment

### Method 1: Via Frontend Button
- If there's a **"Collect All Data"** or **"Enrich Profile"** button, click it
- Wait for processing (may take 10-30 seconds)

### Method 2: Via Browser Console
1. Open browser console (F12)
2. Run this (replace `YOUR_EMPLOYEE_ID`):
   ```javascript
   fetch('https://directoryproject-production.up.railway.app/api/external/collect/YOUR_EMPLOYEE_ID', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' }
   })
   .then(r => r.json())
   .then(data => {
     console.log('✅ Enrichment Result:', data);
     // Refresh page to see results
     setTimeout(() => window.location.reload(), 2000);
   })
   .catch(err => console.error('❌ Error:', err));
   ```

## Step 5: Verify Results

### Check Frontend Display
1. Refresh the profile page
2. You should see:
   - ✅ **Professional Bio** section (AI-generated text)
   - ✅ **Projects** section (list of projects with titles and summaries)
   - ✅ **Skills** section (if Skills Engine integrated)

### Check Database (Optional)
Go to Supabase SQL Editor and run:

```sql
-- Check processed data
SELECT 
  e.name,
  e.email,
  edp.bio,
  edp.processed_at,
  COUNT(p.id) as project_count
FROM employees e
LEFT JOIN external_data_processed edp ON e.id = edp.employee_id
LEFT JOIN projects p ON e.id = p.employee_id AND p.source = 'gemini_ai'
WHERE e.id = 'YOUR_EMPLOYEE_ID'
GROUP BY e.id, e.name, e.email, edp.bio, edp.processed_at;
```

**Expected Results:**
- `bio` should have text (not null)
- `processed_at` should have a timestamp
- `project_count` should be > 0

### Check Railway Logs
1. Go to Railway Dashboard
2. Select backend service
3. Click **"Deployments"** → Latest → **"View Logs"**
4. Look for:
   - ✅ `[Enrichment] Starting profile enrichment`
   - ✅ `[Gemini] Bio generation complete`
   - ✅ `[Enrichment] Bio stored in external_data_processed`
   - ✅ `[Enrichment] X projects stored`

## Troubleshooting

### "No processed data" in frontend
- Wait 30 seconds and refresh
- Check Railway logs for errors
- Verify `GEMINI_API_KEY` is set in Railway

### "Bio is empty"
- Check Railway logs for Gemini errors
- Verify LinkedIn/GitHub have profile data
- Check for safety filter blocks in logs

### "No projects displayed"
- Check `projects` table in database
- Verify frontend calls `getProcessedData` endpoint
- Check Railway logs for project identification

## Success! ✅

If you see:
- Bio displayed in profile
- Projects displayed in profile
- No raw data visible
- Database has processed data

**Then F005 is complete!** 🎉

