# Debug GitHub → Gemini Flow

## 🔍 איך לבדוק אם הכל עובד

### שלב 1: בדוק ב-Database

הרץ את ה-script:
```bash
cd backend
node scripts/check-github-gemini-flow.js YOUR_EMPLOYEE_ID
```

**או ב-Supabase SQL Editor:**

```sql
-- 1. בדוק token
SELECT provider, created_at FROM oauth_tokens 
WHERE employee_id = 'YOUR_EMPLOYEE_ID' AND provider = 'github';

-- 2. בדוק raw data
SELECT provider, processed, fetched_at, 
       LENGTH(data::text) as data_size
FROM external_data_raw 
WHERE employee_id = 'YOUR_EMPLOYEE_ID' AND provider = 'github';

-- 3. בדוק processed data
SELECT bio, processed_at FROM external_data_processed 
WHERE employee_id = 'YOUR_EMPLOYEE_ID';

-- 4. בדוק projects
SELECT title, summary FROM projects 
WHERE employee_id = 'YOUR_EMPLOYEE_ID' AND source = 'gemini_ai';
```

### שלב 2: בדוק ב-Railway Logs

1. לך ל-Railway → Deployments → Latest → View Logs
2. חפש:
   - `[Collect]` - data collection
   - `[Enrichment]` - Gemini processing
   - `[GitHub]` - GitHub data fetching
   - `[Gemini]` - Gemini API calls

**מה לחפש:**
- ✅ `[Collect] Fetching GitHub data` - נתונים נשלפו
- ✅ `[Enrichment] Starting profile enrichment` - Gemini התחיל
- ✅ `[Enrichment] Gemini processing complete` - Gemini סיים
- ❌ `[Enrichment] Error` - שגיאה ב-Gemini

### שלב 3: בדוק ב-Frontend Console

1. פתחי את הפרופיל
2. פתחי Console (F12)
3. חפשי:
   - `[EnhanceProfile]` - frontend logs
   - `Collect response` - תגובה מ-backend
   - `Enrichment successful` - enrichment הצליח

## 🔧 בעיות נפוצות

### בעיה 1: Raw data לא נשמר
**סימנים:**
- `external_data_raw` ריק
- `[Collect] No GitHub token found`

**פתרון:**
1. ודאי ש-GitHub מחובר (בדוק `oauth_tokens`)
2. קראי ידנית: `POST /api/external/collect/YOUR_EMPLOYEE_ID`

### בעיה 2: Raw data נשמר אבל לא מעובד
**סימנים:**
- `external_data_raw` עם `processed = false`
- `external_data_processed` ריק

**פתרון:**
1. בדוק Railway logs ל-Gemini errors
2. ודאי ש-`GEMINI_API_KEY` מוגדר ב-Railway
3. קראי ידנית: `POST /api/external/collect/YOUR_EMPLOYEE_ID`

### בעיה 3: Gemini עובד אבל Frontend לא מציג
**סימנים:**
- `external_data_processed` לא ריק
- `projects` לא ריק
- Frontend לא מציג כלום

**פתרון:**
1. רענני את הדף
2. בדוק ש-`getProcessedData` נקרא
3. בדוק Console ל-errors

## 🧪 בדיקה ידנית

### דרך API:

```bash
# 1. Collect data (שולף + מעבד)
curl -X POST https://directoryproject-production.up.railway.app/api/external/collect/YOUR_EMPLOYEE_ID

# 2. בדוק processed data
curl https://directoryproject-production.up.railway.app/api/external/processed/YOUR_EMPLOYEE_ID
```

### דרך Frontend Console:

```javascript
// 1. Collect data
const employeeId = localStorage.getItem('currentEmployeeId');
const response = await fetch(`https://directoryproject-production.up.railway.app/api/external/collect/${employeeId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
const data = await response.json();
console.log('Collect result:', data);

// 2. בדוק processed data
const processedResponse = await fetch(`https://directoryproject-production.up.railway.app/api/external/processed/${employeeId}`);
const processedData = await processedResponse.json();
console.log('Processed data:', processedData);
```

## 📋 Checklist

- [ ] GitHub token קיים ב-`oauth_tokens`
- [ ] Raw data נשמר ב-`external_data_raw` עם `processed = false`
- [ ] `collectAllData` נקרא (בדוק Railway logs)
- [ ] Gemini enrichment רץ (בדוק Railway logs)
- [ ] Processed data נשמר ב-`external_data_processed`
- [ ] Projects נשמרים ב-`projects` table
- [ ] Frontend מציג את הנתונים

## 🚀 אם הכל עובד

אמור לראות:
- ✅ Professional Bio בפרופיל
- ✅ Projects בפרופיל
- ✅ כל זה מ-Gemini AI

אם לא, שלחי לי את ה-logs ואני אבדוק!

