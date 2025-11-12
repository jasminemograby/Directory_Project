# איך למחוק עובדים מהמסד נתונים

## שיטה 1: באמצעות סקריפט Node.js (מומלץ)

### שלבים:
1. פתח טרמינל/PowerShell בפרויקט
2. הרץ את הפקודה:
   ```powershell
   node backend/scripts/clear-employees.js
   ```

### מה הסקריפט עושה:
- מוחק את כל העובדים מהטבלה `employees`
- מציג רשימה של העובדים שנמחקו
- משתמש ב-transaction כדי להבטיח שהכל מתבצע בצורה בטוחה

---

## שיטה 2: באמצעות Supabase SQL Editor

### שלבים:
1. לך ל-Supabase Dashboard: https://supabase.com/dashboard
2. בחר את הפרויקט שלך
3. לחץ על **SQL Editor** בתפריט השמאלי
4. הדבק את ה-SQL הבא:
   ```sql
   -- Delete all employees
   DELETE FROM employees;
   
   -- Optional: Delete departments and teams too
   -- DELETE FROM teams;
   -- DELETE FROM departments;
   ```
5. לחץ **Run** (או F5)

### ⚠️ אזהרה:
- זה ימחק את **כל** העובדים מהמסד נתונים
- אם יש לך עובדים חשובים, שמור אותם לפני המחיקה

---

## שיטה 3: למחוק רק עובדים ספציפיים

### באמצעות Supabase SQL Editor:

```sql
-- למחוק עובד ספציפי לפי email
DELETE FROM employees WHERE email = 'hello@gmail.com';

-- למחוק עובדים לפי חברה
DELETE FROM employees WHERE company_id = 'YOUR_COMPANY_ID_HERE';

-- למחוק כמה עובדים לפי emails
DELETE FROM employees WHERE email IN ('hello@gmail.com', 's@gmail.com');
```

---

## שיטה 4: למחוק רק עובדים מחברה ספציפית

אם אתה רוצה למחוק רק עובדים מחברה מסוימת:

```sql
-- קודם, מצא את ה-company_id
SELECT id, name FROM companies;

-- אחר כך, מחק את העובדים של החברה הזו
DELETE FROM employees WHERE company_id = 'YOUR_COMPANY_ID_HERE';
```

---

## איך לבדוק מה נמחק

לאחר המחיקה, תוכל לבדוק:

```sql
-- בדוק כמה עובדים נשארו
SELECT COUNT(*) FROM employees;

-- ראה את כל העובדים שנשארו
SELECT id, name, email, company_id FROM employees;
```

---

## אם יש שגיאה

אם מקבל שגיאה של foreign key constraint:
- זה אומר שיש טבלאות אחרות שמתייחסות לעובדים
- הסקריפט מטפל בזה אוטומטית (CASCADE)
- אם עדיין יש בעיה, מחק קודם את הטבלאות הקשורות:
  ```sql
  DELETE FROM external_data_links;
  DELETE FROM employees;
  ```

