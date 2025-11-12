# איך לבדוק אם המנהל הוקצה למחלקה

## דרך 1: בדיקה ב-Supabase SQL Editor

1. לך ל-Supabase Dashboard
2. SQL Editor
3. הרץ את ה-SQL הבא:

```sql
-- בדוק את המחלקה "op" והמנהל שלה
SELECT 
  d.id as department_id,
  d.name as department_name,
  d.manager_id,
  e.name as manager_name,
  e.email as manager_email
FROM departments d
LEFT JOIN employees e ON d.manager_id = e.id
WHERE d.name = 'op'
ORDER BY d.created_at DESC
LIMIT 1;
```

אם `manager_id` הוא `null`, המנהל לא הוקצה.

## דרך 2: בדיקה דרך Backend Logs

בטרמינל של ה-Backend Server, חפש הודעות כמו:
- `Created new department "op" with ID: ...`
- `Department map entry: dept-1762902699352 -> { dbId: ..., managerEmail: bp@gmail.com }`
- `✅ Employee processed: bp (bp@gmail.com) - ID: ...`
- `Checking if bp@gmail.com is a department manager...`
- `Comparing: "bp@gmail.com" === "bp@gmail.com"? true`
- `→ Assigning bp as manager to department ...`
- `✅ Manager assigned successfully`

אם אתה רואה את כל ההודעות האלה, המנהל הוקצה בהצלחה.

אם אתה לא רואה את ההודעות `→ Assigning` ו-`✅ Manager assigned successfully`, יש בעיה בלוגיקה.

## דרך 3: תיקון ידני (אם המנהל לא הוקצה)

אם המנהל לא הוקצה, אתה יכול לתקן ידנית:

```sql
-- עדכן מנהל למחלקה "op"
UPDATE departments 
SET manager_id = (
  SELECT id 
  FROM employees 
  WHERE email = 'bp@gmail.com' 
  AND company_id = (SELECT id FROM companies WHERE id = '991d41af-c7b1-4c0e-a021-e142bf4c1fc4')
)
WHERE name = 'op' 
AND company_id = '991d41af-c7b1-4c0e-a021-e142bf4c1fc4';
```

