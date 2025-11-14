# איך למצוא Employee ID

## שיטה 1: מהדאטה בייס (הכי קל)

### לך ל-Supabase → SQL Editor והרץ:

```sql
-- רשימת כל העובדים עם ה-IDs שלהם
SELECT 
  id,
  name,
  email,
  role,
  company_id,
  created_at
FROM employees
ORDER BY created_at DESC
LIMIT 10;
```

**תראי טבלה עם כל העובדים וה-IDs שלהם.**

**דוגמה לתוצאה:**
```
id                                   | name  | email              | role
-------------------------------------|-------|--------------------|-------
ae39378a-61bb-4b13-9cbd-d97991603598 | son   | sonia@gmail.com    | dsf
```

**העתיקי את ה-`id` (העמודה הראשונה) - זה ה-Employee ID שלך!**

---

## שיטה 2: לפי Email

אם את יודעת את ה-email של העובד:

```sql
-- מצא Employee ID לפי email
SELECT 
  id,
  name,
  email,
  role
FROM employees
WHERE email = 'sonia@gmail.com';
```

**העתיקי את ה-`id` מהתוצאה.**

---

## שיטה 3: מהקונסול בדפדפן

1. פתחי את הפרופיל: `https://directory-project-bice.vercel.app/profile`
2. פתחי Console (F12)
3. הרצי:
   ```javascript
   localStorage.getItem('currentEmployeeId')
   ```
4. זה יחזיר את ה-Employee ID שכבר שמור

---

## שיטה 4: HR Employee (אם נרשמה חברה)

אם נרשמת חברה, ה-HR Employee נוצר אוטומטית:

```sql
-- מצא HR Employee
SELECT 
  e.id,
  e.name,
  e.email,
  e.role,
  c.name as company_name
FROM employees e
JOIN companies c ON e.company_id = c.id
WHERE e.role = 'HR'
ORDER BY e.created_at DESC
LIMIT 1;
```

---

## דוגמה לשימוש

אחרי שמצאת את ה-ID, השתמשי בו כך:

```sql
-- במקום YOUR_EMPLOYEE_ID, שימי את ה-ID שמצאת
SELECT * FROM oauth_tokens 
WHERE employee_id = 'ae39378a-61bb-4b13-9cbd-d97991603598';
```

**או:**

```sql
-- מחק נתונים ישנים
DELETE FROM oauth_tokens 
WHERE employee_id = 'ae39378a-61bb-4b13-9cbd-d97991603598';
```

---

## ⚠️ חשוב

- **אל תמציאי ID** - זה לא יעבוד
- **השתמשי ב-ID אמיתי** מהדאטה בייס
- **ה-ID הוא UUID** (32 תווים עם מקפים)
- **כל עובד יש לו ID ייחודי**

---

## Quick Check

אם את לא בטוחה איזה ID להשתמש, הרצי:

```sql
-- רשימת כל העובדים
SELECT id, name, email FROM employees;
```

**בחרי את העובד שאת רוצה לבדוק, והעתיקי את ה-`id` שלו.**

