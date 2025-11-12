# איך למחוק נתוני חברה קיימים

אם אתה מקבל שגיאת "Duplicate entry", זה אומר שהעובדים/מחלקות כבר קיימים במסד הנתונים מהנסיון הקודם.

## דרך 1: שימוש בסקריפט (מומלץ)

הרץ את הסקריפט הבא כדי למחוק את כל הנתונים של החברה האחרונה:

```powershell
cd backend
node scripts\clear-company-data.js
```

או למחוק נתונים של חברה ספציפית:

```powershell
cd backend
node scripts\clear-company-data.js [company_id]
```

הסקריפט ימחק:
- כל הצוותים (teams)
- כל המחלקות (departments)
- כל העובדים (employees)

**שימו לב:** הסקריפט לא מוחק את החברה עצמה (companies table), רק את הנתונים הקשורים אליה.

## דרך 2: מחיקה ידנית ב-Supabase SQL Editor

1. לך ל-Supabase Dashboard
2. SQL Editor
3. הרץ את ה-SQL הבא (החלף `[company_id]` ב-ID של החברה שלך):

```sql
-- מחק צוותים
DELETE FROM teams 
WHERE department_id IN (
  SELECT id FROM departments WHERE company_id = '[company_id]'
);

-- מחק מחלקות
DELETE FROM departments 
WHERE company_id = '[company_id]';

-- מחק עובדים
DELETE FROM employees 
WHERE company_id = '[company_id]';
```

## דרך 3: מחיקה של עובדים ספציפיים

אם אתה רוצה למחוק רק עובדים ספציפיים:

```sql
DELETE FROM employees 
WHERE email IN ('bp@gmail.com', 'kl@gmail.com');
```

## איך למצוא את ה-company_id?

הרץ את ה-SQL הבא ב-Supabase:

```sql
SELECT id, name, domain, created_at 
FROM companies 
ORDER BY created_at DESC;
```

או השתמש בסקריפט:

```powershell
cd backend
node scripts\check-company-data.js
```

הוא יציג את ה-ID של החברה האחרונה.

