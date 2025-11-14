# Gemini Minimal Data Fix

## 🔍 הבעיה

Gemini מחזיר `bio: null` ו-`projects: []` כי:
1. ה-prompts דורשים יותר מדי מידע
2. אם אין repositories, לא נוצר bio
3. לא כוללים מספיק שדות מ-GitHub profile

## 🔧 התיקון

### 1. שיפור Bio Generation

**לפני:**
- דרש מידע מינימלי
- אם אין repositories, לא יצר bio

**אחרי:**
- עובד גם עם מידע מועט
- כולל יותר שדות מ-GitHub (name, login, bio, company, location, public_repos)
- יוצר bio גם אם אין repositories
- Prompt משופר שמבקש מ-Gemini ליצור bio גם עם מידע מועט

### 2. שיפור Project Identification

**לפני:**
- דרש repositories או positions

**אחרי:**
- עובד גם עם מידע מועט
- יוצר לפחות 1 project גם אם אין repositories
- כולל יותר פרטים על repositories (stars, forks, dates)

### 3. הוספת Logging

הוספתי logging מפורט כדי לראות מה נשלח ל-Gemini:
- `[Gemini] Context for bio generation` - מה נשלח ל-bio
- `[Gemini] Context for project identification` - מה נשלח ל-projects

## 📋 מה לעשות עכשיו

### שלב 1: Reset ב-Database

```sql
-- Reset processed flag
UPDATE external_data_raw 
SET processed = false, updated_at = CURRENT_TIMESTAMP
WHERE employee_id = 'ae39378a-61bb-4b13-9cbd-d97991603598' AND provider = 'github';
```

### שלב 2: נסי שוב

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

חפשי:
- `[Gemini] Context for bio generation` - מה נשלח
- `[Gemini] Calling API` - האם ה-API נקרא
- `[Enrichment] Gemini processing complete` - התוצאה

### שלב 4: בדוק Database

```sql
-- בדוק אם יש processed data
SELECT bio, processed_at FROM external_data_processed 
WHERE employee_id = 'ae39378a-61bb-4b13-9cbd-d97991603598';

-- בדוק אם יש projects
SELECT title, summary FROM projects 
WHERE employee_id = 'ae39378a-61bb-4b13-9cbd-d97991603598' AND source = 'gemini_ai';
```

### שלב 5: רענני את הפרופיל

אחרי ש-Gemini יצר bio ו-projects:
1. רענני את הדף: `https://directory-project-bice.vercel.app/profile`
2. אמור להציג:
   - ✅ Professional Bio
   - ✅ Projects (אפילו אם רק 1-2)

## ✅ מה השתנה

1. **Bio Generation:**
   - כולל יותר שדות מ-GitHub
   - יוצר bio גם עם מידע מועט
   - Prompt משופר

2. **Project Identification:**
   - יוצר לפחות 1 project
   - כולל יותר פרטים על repositories
   - עובד גם בלי repositories

3. **Logging:**
   - רואים מה נשלח ל-Gemini
   - קל יותר לבדוק בעיות

---

נסי עכשיו! אמור לעבוד גם עם GitHub profile מינימלי.

