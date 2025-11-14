# Fix Gemini Enrichment - הנתונים לא מעובדים

## 🔍 המצב הנוכחי

✅ GitHub token קיים  
✅ Raw data נשמר (`processed = false`)  
❌ Processed data לא קיים (Gemini לא רץ)

## 🔧 פתרון

### שלב 1: בדוק אם `collectAllData` נקרא

אחרי חיבור GitHub, `collectAllData` צריך להיקרא אוטומטית. אם לא:

**פתחי Console (F12) והרצי:**

```javascript
const employeeId = 'ae39378a-61bb-4b13-9cbd-d97991603598';

// קראי ידנית ל-collect (זה גם יעשה enrichment)
fetch(`https://directoryproject-production.up.railway.app/api/external/collect/${employeeId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Collect Result:', data);
  console.log('Enrichment:', data.enrichment);
  if (data.enrichment?.error) {
    console.error('❌ Enrichment Error:', data.enrichment.error);
  }
})
.catch(err => console.error('❌ Error:', err));
```

### שלב 2: בדוק Railway Logs

1. לך ל-Railway → Deployments → Latest → View Logs
2. חפשי:
   - `[Collect] Starting Gemini enrichment`
   - `[Enrichment]`
   - `[Gemini]`
   - שגיאות

**אם רואה שגיאה:**
- `GEMINI_API_KEY not configured` → צריך להוסיף ב-Railway
- `Error enriching profile` → שלחי לי את ה-error message

### שלב 3: ודאי ש-GEMINI_API_KEY מוגדר

1. לך ל-Railway → Variables
2. בדוק אם יש `GEMINI_API_KEY`
3. אם אין, הוסיפי אותו (המפתח שנתת קודם)

### שלב 4: נסי שוב

אחרי ש-GEMINI_API_KEY מוגדר:

1. קראי ידנית ל-collect (שלב 1)
2. המתני 10-30 שניות
3. בדקי שוב ב-Supabase:

```sql
-- בדוק אם processed השתנה
SELECT provider, processed, fetched_at 
FROM external_data_raw 
WHERE employee_id = 'ae39378a-61bb-4b13-9cbd-d97991603598' AND provider = 'github';

-- בדוק אם יש processed data
SELECT bio, processed_at FROM external_data_processed 
WHERE employee_id = 'ae39378a-61bb-4b13-9cbd-d97991603598';

-- בדוק אם יש projects
SELECT title, summary FROM projects 
WHERE employee_id = 'ae39378a-61bb-4b13-9cbd-d97991603598' AND source = 'gemini_ai';
```

## 🚨 בעיות נפוצות

### בעיה 1: GEMINI_API_KEY לא מוגדר
**סימן:** `[Gemini] API key not configured`  
**פתרון:** הוסיפי את ה-key ב-Railway Variables

### בעיה 2: Gemini API error
**סימן:** `[Enrichment] Error enriching profile`  
**פתרון:** בדקי את ה-error message ב-Railway logs

### בעיה 3: collectAllData לא נקרא
**סימן:** Raw data קיים אבל `processed = false`  
**פתרון:** קראי ידנית (שלב 1 למעלה)

## 📋 Checklist

- [ ] GEMINI_API_KEY מוגדר ב-Railway
- [ ] `collectAllData` נקרא (בדוק Console או קראי ידנית)
- [ ] אין שגיאות ב-Railway logs
- [ ] `processed = true` ב-`external_data_raw`
- [ ] יש bio ב-`external_data_processed`
- [ ] יש projects ב-`projects` table

## 🧪 בדיקה מהירה

הרצי את זה ב-Console:

```javascript
const employeeId = 'ae39378a-61bb-4b13-9cbd-d97991603598';

// 1. Collect + Enrich
fetch(`https://directoryproject-production.up.railway.app/api/external/collect/${employeeId}`, {
  method: 'POST'
})
.then(r => r.json())
.then(data => {
  console.log('Collect:', data);
  if (data.enrichment?.error) {
    console.error('❌ Enrichment failed:', data.enrichment.error);
  } else {
    console.log('✅ Enrichment:', data.enrichment);
  }
  
  // 2. בדוק processed data
  return fetch(`https://directoryproject-production.up.railway.app/api/external/processed/${employeeId}`);
})
.then(r => r.json())
.then(data => {
  console.log('Processed Data:', data);
  console.log('Bio:', data.data?.bio);
  console.log('Projects:', data.data?.projects);
});
```

אחרי זה, שלחי לי:
1. מה קיבלת ב-Console
2. מה יש ב-Railway logs (חפשי `[Collect]` או `[Enrichment]`)

