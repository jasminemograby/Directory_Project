# Gemini Enrichment - Retry Instructions

## 🔧 מה תוקן

1. ✅ Gemini API endpoint עודכן מ-`gemini-pro` ל-`gemini-1.5-flash`
2. ✅ הוספתי logging מפורט יותר
3. ✅ Raw data לא מסומן כ-processed אם enrichment נכשל

## 📋 איך לנסות שוב

### שלב 1: Reset ב-Database

לפני שתנסי שוב, צריך לאפס את `processed = false`:

```sql
-- Reset processed flag
UPDATE external_data_raw 
SET processed = false, updated_at = CURRENT_TIMESTAMP
WHERE employee_id = 'ae39378a-61bb-4b13-9cbd-d97991603598' AND provider = 'github';
```

### שלב 2: קראי שוב ל-Collect

**דרך Console (F12):**

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

### שלב 3: בדוק Railway Logs

1. לך ל-Railway → Deployments → Latest → View Logs
2. חפשי:
   - `[Gemini] Calling API` - האם ה-API נקרא
   - `[Gemini] API Error` - אם יש שגיאה
   - `[Enrichment] Gemini processing complete` - האם הצליח

### שלב 4: בדוק שוב ב-Database

```sql
-- בדוק אם יש processed data
SELECT bio, processed_at FROM external_data_processed 
WHERE employee_id = 'ae39378a-61bb-4b13-9cbd-d97991603598';

-- בדוק אם יש projects
SELECT title, summary FROM projects 
WHERE employee_id = 'ae39378a-61bb-4b13-9cbd-d97991603598' AND source = 'gemini_ai';
```

## 🚨 אם עדיין לא עובד

**בדוק ב-Railway logs:**
- אם רואה `404` → ה-endpoint עדיין לא נכון (אבל תיקנתי את זה)
- אם רואה `400` → בעיה ב-API key או ב-request format
- אם רואה `403` → API key לא תקין או לא מורשה
- אם רואה שגיאה אחרת → שלחי לי את ה-error message

## ✅ מה השתנה בקוד

**לפני:**
```javascript
`${GEMINI_API_BASE}/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`
```

**אחרי:**
```javascript
`${GEMINI_API_BASE}/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`
```

**גם:**
- הוספתי logging מפורט יותר
- Raw data לא מסומן כ-processed אם enrichment נכשל
- זה יאפשר retry אוטומטי

---

נסי עכשיו:
1. Reset ב-Database (שלב 1)
2. קראי ל-collect (שלב 2)
3. בדוק Railway logs (שלב 3)
4. בדוק Database (שלב 4)

שלחי לי את התוצאות!

