# Gemini Model API Version Fix

## 🔍 הבעיה

Railway logs מראים:
```
"message": "models/gemini-pro is not found for API version v1, or is not supported for generateContent."
```

**הסיבה:**
- `gemini-pro` (הישן) עובד רק עם `v1` API
- `gemini-1.5-flash` ו-`gemini-1.5-pro` עובדים רק עם `v1beta` API
- הקוד שינה ל-`v1` אבל המשתנה `GEMINI_MODEL` ב-Railway מוגדר ל-`gemini-pro`

## 🔧 התיקון

### 1. שינוי API Base

**לפני:**
```javascript
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
```

**אחרי:**
```javascript
// Use v1beta for gemini-1.5 models
const GEMINI_API_BASE = process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
```

### 2. הוספת משתנה סביבה

עכשיו אפשר להגדיר ב-Railway:
- `GEMINI_API_BASE` - אם צריך לשנות (default: `v1beta`)
- `GEMINI_MODEL` - המודל (default: `gemini-1.5-flash`)

## 📋 מה לעשות עכשיו

### שלב 1: עדכן Railway Variables

1. לך ל-Railway → Project → Variables
2. **הסר** את `GEMINI_MODEL=gemini-pro` (אם קיים)
3. **הוסף/עדכן:**
   - `GEMINI_MODEL=gemini-1.5-flash` (או `gemini-1.5-pro` אם רוצה יותר חזק)
   - `GEMINI_API_BASE=https://generativelanguage.googleapis.com/v1beta` (אופציונלי, זה כבר default)

### שלב 2: חכה לעדכון

Railway יתעדכן אוטומטית תוך 1-2 דקות.

### שלב 3: Reset ב-Database

```sql
-- Reset processed flag
UPDATE external_data_raw 
SET processed = false, updated_at = CURRENT_TIMESTAMP
WHERE employee_id = 'ae39378a-61bb-4b13-9cbd-d97991603598' AND provider = 'github';
```

### שלב 4: נסי שוב

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

### שלב 5: בדוק Railway Logs

חפשי:
- `[Gemini] Calling API: ...v1beta/models/gemini-1.5-flash` - צריך להיות `v1beta`
- `[Enrichment] Gemini processing complete - Bio: true` - צריך להיות `true`
- אין שגיאות 404

## ✅ מה השתנה

1. **API Base:** חזר ל-`v1beta` (תומך ב-`gemini-1.5-*`)
2. **Default Model:** `gemini-1.5-flash` (מהיר ויעיל)
3. **גמישות:** אפשר לשנות דרך environment variables

## 🎯 אפשרויות מודלים

- **`gemini-1.5-flash`** (מומלץ) - מהיר, יעיל, טוב לרוב השימושים
- **`gemini-1.5-pro`** - יותר חזק, אבל איטי יותר
- **`gemini-pro`** - הישן, עובד רק עם `v1` API (לא מומלץ)

---

עדכן את Railway Variables ונסי שוב!

