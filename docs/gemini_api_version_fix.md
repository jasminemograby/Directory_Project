# Gemini API Version Fix

## 🔍 הבעיה

ב-Railway logs ראינו:
```
"message": "models/gemini-1.5-flash is not found for API version v1beta, or is not supported for generateContent."
```

## 🔧 התיקון

הבעיה הייתה שה-API version `v1beta` לא תומך ב-`gemini-1.5-flash`.

**שונה מ:** `v1beta`  
**שונה ל:** `v1`

## 📋 מה לעשות עכשיו

### שלב 1: נסי שוב

הקוד כבר עודכן. נסי שוב:

```javascript
const employeeId = 'ae39378a-61bb-4b13-9cbd-d97991603598';

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
  } else {
    console.log('✅ Enrichment Success!');
    console.log('  - Bio:', data.enrichment.bio ? '✅' : '❌');
    console.log('  - Projects:', data.enrichment.projects?.length || 0);
  }
})
.catch(err => console.error('❌ Error:', err));
```

### שלב 2: בדוק Railway Logs

1. לך ל-Railway → Deployments → Latest → View Logs
2. חפשי:
   - `[Gemini] Calling API` - האם ה-API נקרא
   - `[Gemini] API Error` - אם יש שגיאה
   - `[Enrichment] Gemini processing complete` - האם הצליח

### שלב 3: בדוק Database

```sql
-- בדוק אם יש processed data
SELECT bio, processed_at FROM external_data_processed 
WHERE employee_id = 'ae39378a-61bb-4b13-9cbd-d97991603598';

-- בדוק אם יש projects
SELECT title, summary FROM projects 
WHERE employee_id = 'ae39378a-61bb-4b13-9cbd-d97991603598' AND source = 'gemini_ai';
```

## ✅ מה השתנה

**לפני:**
```javascript
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
```

**אחרי:**
```javascript
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1';
```

**המודל נשאר:** `gemini-1.5-flash`

## 🚨 אם עדיין לא עובד

אם עדיין רואה 404, נסי:

1. **שנה מודל ל-`gemini-pro`** (הישן, אבל עדיין עובד):
   - הוסיפי ב-Railway Variables: `GEMINI_MODEL=gemini-pro`
   - Railway יתעדכן אוטומטית

2. **או נסי `gemini-1.5-pro`**:
   - הוסיפי ב-Railway Variables: `GEMINI_MODEL=gemini-1.5-pro`
   - Railway יתעדכן אוטומטית

---

נסי עכשיו ובדוק Railway logs!

