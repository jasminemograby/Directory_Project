# Gemini API Fix - 404 Error

## 🔍 הבעיה

ב-Railway logs ראינו:
```
[Gemini] Error generating bio: Request failed with status code 404
[Gemini] Error identifying projects: Request failed with status code 404
```

## 🔧 התיקון

הבעיה הייתה שה-endpoint השתמש ב-`gemini-pro` שהוא deprecated.

**שונה ל:** `gemini-1.5-flash` (המודל החדש)

## 📋 מה לעשות עכשיו

### שלב 1: ודאי ש-GEMINI_API_KEY מוגדר ב-Railway

1. לך ל-Railway → Variables
2. ודאי ש-`GEMINI_API_KEY` קיים
3. אם צריך, הוסיפי: `AIzaSyDqDjF-Rfs85H3SBDE3_-JbTX2JxJmMcOQ`

### שלב 2: נסי שוב

**אופציה 1: דרך Console**

```javascript
const employeeId = 'ae39378a-61bb-4b13-9cbd-d97991603598';

// Reset processed flag (לאפשר enrichment מחדש)
fetch(`https://directoryproject-production.up.railway.app/api/external/collect/${employeeId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Collect Result:', data);
  console.log('Enrichment:', data.enrichment);
})
.catch(err => console.error('❌ Error:', err));
```

**אופציה 2: Reset ב-Database**

לפני שתנסי שוב, צריך לאפס את `processed = false`:

```sql
-- Reset processed flag
UPDATE external_data_raw 
SET processed = false, updated_at = CURRENT_TIMESTAMP
WHERE employee_id = 'ae39378a-61bb-4b13-9cbd-d97991603598' AND provider = 'github';
```

אז קראי שוב ל-collect.

### שלב 3: בדוק שוב

```sql
-- בדוק אם יש processed data
SELECT bio, processed_at FROM external_data_processed 
WHERE employee_id = 'ae39378a-61bb-4b13-9cbd-d97991603598';

-- בדוק אם יש projects
SELECT title, summary FROM projects 
WHERE employee_id = 'ae39378a-61bb-4b13-9cbd-d97991603598' AND source = 'gemini_ai';
```

## 🚨 אם עדיין לא עובד

בדוק ב-Railway logs:
1. חפשי `[Gemini] API Error`
2. שלחי לי את ה-error message

אם רואה שגיאה אחרת (לא 404), זה אומר שה-endpoint עובד אבל יש בעיה אחרת.

## ✅ מה השתנה

**לפני:**
```javascript
`${GEMINI_API_BASE}/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`
```

**אחרי:**
```javascript
`${GEMINI_API_BASE}/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`
```

**או אפשר להשתמש ב-`gemini-1.5-pro`** (יותר חזק אבל איטי יותר)

## 🔄 איך לשנות מודל

אם את רוצה להשתמש ב-`gemini-1.5-pro` במקום `gemini-1.5-flash`:

1. לך ל-Railway → Variables
2. הוסיפי: `GEMINI_MODEL=gemini-1.5-pro`
3. Railway יתעדכן אוטומטית

