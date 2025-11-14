# F005: Complete Test Flow - Step by Step

## ✅ Migration Complete
- [x] UNIQUE constraint added
- [x] updated_at column added

## שלב 1: נקה נתונים קיימים (אופציונלי)

אם יש נתונים ישנים, נקה אותם:

```sql
-- מחק נתונים ישנים (אם יש)
DELETE FROM oauth_tokens WHERE employee_id = 'YOUR_EMPLOYEE_ID';
DELETE FROM external_data_raw WHERE employee_id = 'YOUR_EMPLOYEE_ID';
DELETE FROM external_data_processed WHERE employee_id = 'YOUR_EMPLOYEE_ID';
DELETE FROM projects WHERE employee_id = 'YOUR_EMPLOYEE_ID' AND source = 'gemini_ai';
```

## שלב 2: בדוק שהטבלאות ריקות

```sql
-- בדוק שאין tokens
SELECT COUNT(*) as token_count FROM oauth_tokens WHERE employee_id = 'YOUR_EMPLOYEE_ID';

-- בדוק שאין raw data
SELECT COUNT(*) as raw_data_count FROM external_data_raw WHERE employee_id = 'YOUR_EMPLOYEE_ID';

-- בדוק שאין processed data
SELECT COUNT(*) as processed_count FROM external_data_processed WHERE employee_id = 'YOUR_EMPLOYEE_ID';
```

**Expected**: כל ה-counts = 0

## שלב 3: Connect LinkedIn

1. **פתח פרופיל**: `https://directory-project-bice.vercel.app/profile`
2. **ודא ש-localStorage מכיל employee ID**:
   ```javascript
   localStorage.getItem('currentEmployeeId')
   ```
3. **לחץ "Connect" ל-LinkedIn**
4. **אשר ב-LinkedIn** (תועברי ל-LinkedIn, תאשרי, תחזרי)
5. **הדף אמור להציג**: "LinkedIn connected successfully!"

### בדוק ב-Database:

```sql
-- בדוק שה-token נשמר
SELECT 
  id,
  employee_id,
  provider,
  created_at,
  expires_at
FROM oauth_tokens 
WHERE employee_id = 'YOUR_EMPLOYEE_ID' 
  AND provider = 'linkedin';
```

**Expected**: שורה אחת עם token

## שלב 4: Connect GitHub

1. **על אותו דף פרופיל**
2. **לחץ "Connect" ל-GitHub**
3. **אשר ב-GitHub** (תועברי ל-GitHub, תאשרי, תחזרי)
4. **הדף אמור להציג**: "GitHub connected successfully!"

### בדוק ב-Database:

```sql
-- בדוק שה-token נשמר
SELECT 
  id,
  employee_id,
  provider,
  created_at,
  expires_at
FROM oauth_tokens 
WHERE employee_id = 'YOUR_EMPLOYEE_ID' 
  AND provider = 'github';
```

**Expected**: שורה אחת עם token

## שלב 5: Collect All Data

### אופציה 1: אוטומטי
אם ה-frontend קורא אוטומטית ל-`collectAllExternalData` אחרי חיבור, זה קורה אוטומטית.

### אופציה 2: ידני
אם יש כפתור "Collect All Data", לחצי עליו.

### אופציה 3: דרך Console
פתחי Console (F12) והרצי:

```javascript
const employeeId = localStorage.getItem('currentEmployeeId');
fetch(`https://directoryproject-production.up.railway.app/api/external/collect/${employeeId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Collect Result:', data);
  setTimeout(() => window.location.reload(), 3000);
})
.catch(err => console.error('❌ Error:', err));
```

## שלב 6: בדוק Raw Data

```sql
-- בדוק שה-raw data נשמר
SELECT 
  id,
  employee_id,
  provider,
  processed,
  fetched_at,
  LENGTH(data::text) as data_size
FROM external_data_raw 
WHERE employee_id = 'YOUR_EMPLOYEE_ID'
ORDER BY fetched_at DESC;
```

**Expected**: 
- 2 שורות (LinkedIn + GitHub)
- `processed = false`
- `data_size > 0`

## שלב 7: בדוק Processed Data (Gemini)

**המתן 10-30 שניות** (Gemini צריך לעבד)

```sql
-- בדוק שה-processed data נשמר
SELECT 
  id,
  employee_id,
  bio,
  processed_at
FROM external_data_processed 
WHERE employee_id = 'YOUR_EMPLOYEE_ID';
```

**Expected**: שורה אחת עם `bio` (לא null)

```sql
-- בדוק שה-projects נשמרו
SELECT 
  id,
  employee_id,
  title,
  summary,
  source,
  created_at
FROM projects 
WHERE employee_id = 'YOUR_EMPLOYEE_ID' 
  AND source = 'gemini_ai'
ORDER BY created_at DESC;
```

**Expected**: מספר שורות עם projects

```sql
-- בדוק שה-raw data מסומן כ-processed
SELECT 
  provider,
  processed,
  fetched_at
FROM external_data_raw 
WHERE employee_id = 'YOUR_EMPLOYEE_ID';
```

**Expected**: כל השורות עם `processed = true`

## שלב 8: בדוק Frontend Display

1. **רענן את הפרופיל**
2. **אמור לראות**:
   - ✅ **Professional Bio** (טקסט שנוצר על ידי Gemini)
   - ✅ **Projects** (רשימת פרויקטים)
   - ✅ **Skills** (אם Skills Engine מוכן)

3. **לא אמור לראות**:
   - ❌ Raw JSON data
   - ❌ Unprocessed data
   - ❌ OAuth tokens

## שלב 9: בדוק Railway Logs

1. לך ל-Railway Dashboard
2. בחר backend service
3. לך ל-**Deployments** → Latest → **View Logs**
4. חפש:
   - `[LinkedIn Callback] Processing OAuth for employee: ...`
   - `[LinkedIn] ✅ Token stored successfully`
   - `[LinkedIn] ✅ Raw data stored`
   - `[Enrichment] Starting profile enrichment`
   - `[Gemini] Bio generation complete`
   - `[Enrichment] Bio stored in external_data_processed`
   - `[Enrichment] X projects stored`

## ✅ Success Criteria

- [ ] OAuth tokens נשמרים ב-database (2 tokens: LinkedIn + GitHub)
- [ ] Raw data נשמר ב-external_data_raw (2 records, processed=false)
- [ ] Processed data נשמר ב-external_data_processed (bio exists)
- [ ] Projects נשמרים ב-projects table (source='gemini_ai')
- [ ] Raw data מסומן כ-processed=true
- [ ] Frontend מציג bio + projects (לא raw data)
- [ ] Railway logs מראים את כל השלבים

## 🎯 אם הכל עובד

**F005 מוכן ל-production!** 🎉

המערכת עכשיו:
- ✅ עובדת per-user
- ✅ שומרת tokens per-user
- ✅ מעבדת נתונים per-user
- ✅ מציגה רק processed data
- ✅ מוכנה למשתמשים אמיתיים

