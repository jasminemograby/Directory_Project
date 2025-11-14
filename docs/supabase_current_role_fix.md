# Fix: Adding current_role column in Supabase

## ❌ הבעיה

קיבלת שגיאת syntax גם עם `ALTER TABLE employees ADD COLUMN current_role VARCHAR(255);`

## ✅ פתרונות אפשריים

### פתרון 1: הוסף schema prefix

נסי עם `public.employees`:

```sql
ALTER TABLE public.employees ADD COLUMN current_role VARCHAR(255);
```

### פתרון 2: בדוק את שם הטבלה

אולי שם הטבלה שונה. הרצי:

```sql
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name = 'employees';
```

ואז השתמשי בשם המדויק.

### פתרון 3: השתמש ב-Supabase Table Editor

1. לכי ל-Supabase Dashboard
2. לכי ל-Table Editor
3. בחרי את הטבלה `employees`
4. לחצי על "Add Column" או "New Column"
5. שם העמודה: `current_role`
6. סוג: `varchar` או `text`
7. אורך: `255` (אם varchar)
8. לחצי Save

### פתרון 4: נסי עם TEXT במקום VARCHAR

```sql
ALTER TABLE public.employees ADD COLUMN current_role TEXT;
```

### פתרון 5: בדוק אם יש שגיאות syntax קודמות

אולי יש משהו בטבלה שגורם לבעיה. הרצי:

```sql
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'employees'
ORDER BY ordinal_position;
```

זה יראה לך את כל העמודות הקיימות.

---

**הכי מומלץ: פתרון 3 - השתמשי ב-Table Editor של Supabase**

זה הכי פשוט וויזואלי.

