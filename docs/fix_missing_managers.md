# איך לתקן מנהלים חסרים

## הבעיה
לפעמים המנהלים לא מוקצים למחלקות/צוותים כי המחלקה/צוות כבר קיימים מהנסיון הקודם.

## פתרון 1: עדכן ידנית ב-Supabase SQL Editor

1. לך ל-Supabase Dashboard
2. SQL Editor
3. הרץ את ה-SQL הבא:

```sql
-- עדכן מנהל למחלקה "nine"
UPDATE departments 
SET manager_id = (SELECT id FROM employees WHERE email = 'six@gmail.com' AND company_id = '21ebb8c2-3afa-4121-9773-8fa2283918c9')
WHERE name = 'nine' AND company_id = '21ebb8c2-3afa-4121-9773-8fa2283918c9';

-- עדכן מנהל לצוות "ten"
UPDATE teams 
SET manager_id = (SELECT id FROM employees WHERE email = 'eight@gmail.com' AND company_id = '21ebb8c2-3afa-4121-9773-8fa2283918c9')
WHERE name = 'ten' AND company_id = (SELECT id FROM companies WHERE id = '21ebb8c2-3afa-4121-9773-8fa2283918c9');
```

## פתרון 2: מחק את המחלקות/צוותים הקיימים

אם אתה רוצה להתחיל מחדש:

```sql
-- מחק צוותים
DELETE FROM teams WHERE department_id IN (
  SELECT id FROM departments WHERE company_id = '21ebb8c2-3afa-4121-9773-8fa2283918c9'
);

-- מחק מחלקות
DELETE FROM departments WHERE company_id = '21ebb8c2-3afa-4121-9773-8fa2283918c9';
```

אחר כך נסה שוב את הרישום.

## פתרון 3: נסה שוב עם שמות חדשים

פשוט השתמש בשמות חדשים למחלקות/צוותים שלא קיימים במסד הנתונים.

