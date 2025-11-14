# Gemini API Final Fix - Use gemini-pro with v1

## 🔍 הבעיה

Railway logs מראים שגם `v1beta` לא תומך ב-`gemini-1.5-flash`:
```
"models/gemini-1.5-flash is not found for API version v1beta, or is not supported for generateContent."
```

**הסיבה:**
- `gemini-1.5-flash` ו-`gemini-1.5-pro` דורשים גישה מיוחדת או API key עם הרשאות ספציפיות
- `gemini-pro` (הישן) עובד בוודאות עם `v1` API והוא זמין לכל המשתמשים

## 🔧 התיקון

### שינוי ל-`gemini-pro` עם `v1` API

**לפני:**
```javascript
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-1.5-flash';
```

**אחרי:**
```javascript
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1';
const GEMINI_MODEL = 'gemini-pro';
```

## 📋 מה לעשות עכשיו

### שלב 1: עדכן Railway Variables

1. לך ל-Railway → Project → Variables
2. **הסר** את `GEMINI_MODEL=gemini-1.5-flash` (אם קיים)
3. **הסר** את `GEMINI_API_BASE` (אם קיים) - נשתמש ב-default
4. **הוסף/עדכן:**
   - `GEMINI_MODEL=gemini-pro` (או השאר ריק - זה כבר default)

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
- `[Gemini] Calling API: ...v1/models/gemini-pro` - צריך להיות `v1` ו-`gemini-pro`
- `[Enrichment] Gemini processing complete - Bio: true` - צריך להיות `true`
- אין שגיאות 404

## ✅ מה השתנה

1. **API Base:** `v1` (תומך ב-`gemini-pro`)
2. **Model:** `gemini-pro` (עובד בוודאות, זמין לכל המשתמשים)
3. **Stability:** `gemini-pro` הוא המודל הכי יציב וזמין

## 🎯 למה `gemini-pro`?

- ✅ עובד עם `v1` API (לא צריך `v1beta`)
- ✅ זמין לכל המשתמשים (לא דורש הרשאות מיוחדות)
- ✅ יציב ובדוק
- ✅ מספיק טוב ל-bio generation ו-project identification

## 💡 העתיד

אם בעתיד תרצי לעבור ל-`gemini-1.5-flash` או `gemini-1.5-pro`:
1. ודאי שיש לך API key עם הרשאות מתאימות
2. בדוק איזה API version תומך במודל (אולי `v1beta` או גרסה חדשה יותר)
3. עדכן את `GEMINI_MODEL` ו-`GEMINI_API_BASE` ב-Railway

---

עדכן את Railway Variables ונסי שוב! אמור לעבוד עכשיו עם `gemini-pro`.

