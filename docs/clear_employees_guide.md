# מדריך לניקוי Employees ישנים

אם אתה מקבל שגיאת "Employee with this email already exists" למרות שזה מייל חדש, זה אומר שיש employees ישנים ב-database מהניסיונות הקודמים.

## פתרון מהיר - ניקוי Employees לפי Email

יש לך שני אפשרויות:

### אפשרות 1: ניקוי ידני ב-Supabase

1. לך ל-Supabase Dashboard → SQL Editor
2. הרץ את ה-query הבא (החלף את ה-emails):

```sql
-- בדוק איזה employees יש
SELECT id, name, email, company_id, created_at 
FROM employees 
WHERE LOWER(TRIM(email)) IN ('email1@example.com', 'email2@example.com')
ORDER BY created_at DESC;

-- אם אתה רוצה למחוק אותם (הזהר!)
DELETE FROM employees 
WHERE LOWER(TRIM(email)) IN ('email1@example.com', 'email2@example.com');
```

### אפשרות 2: שימוש ב-Script

יש script חדש `backend/scripts/clear-employees-by-email.js`:

```bash
cd backend
node scripts/clear-employees-by-email.js email1@example.com email2@example.com
```

השיטה הזו:
- בודקת אם employees קיימים
- מוחקת את כל הנתונים הקשורים (external links, OAuth tokens, etc.)
- מוחקת את ה-employees

## מה תוקן

1. **Case-insensitive email comparison** - עכשיו המערכת בודקת emails ב-case-insensitive
2. **Email normalization** - כל ה-emails נשמרים ב-lowercase
3. **Better duplicate handling** - אם employee קיים באותה חברה, המערכת משתמשת ב-existing ID

## אם עדיין יש בעיה

1. בדוק את ה-logs ב-Railway - חפש `[Step4] Error creating employee`
2. בדוק ב-Supabase אם יש employees עם אותו email
3. נסה לנקות את ה-employees הישנים
