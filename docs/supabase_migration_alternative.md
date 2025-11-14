# Supabase Migration - Alternative Approach

## ❌ הבעיה

אם ה-DO block לא עובד, נסה את הגישות הבאות:

## ✅ גישה 1: הרץ כל DO block בנפרד

הרץ כל DO block בנפרד ב-Supabase SQL Editor:

### Block 1 - current_role:
```sql
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employees' 
        AND column_name = 'current_role'
    ) THEN
        ALTER TABLE employees ADD COLUMN current_role VARCHAR(255);
    END IF;
END $$;
```

### Block 2 - value_proposition:
```sql
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employees' 
        AND column_name = 'value_proposition'
    ) THEN
        ALTER TABLE employees ADD COLUMN value_proposition TEXT;
    END IF;
END $$;
```

## ✅ גישה 2: הרץ ישירות (אם העמודות לא קיימות)

אם אתה בטוח שהעמודות לא קיימות, הרץ ישירות:

```sql
ALTER TABLE employees ADD COLUMN current_role VARCHAR(255);
ALTER TABLE employees ADD COLUMN value_proposition TEXT;
```

אם תקבל שגיאה "column already exists", זה בסדר - זה אומר שהעמודה כבר קיימת.

## ✅ גישה 3: בדוק קודם אם העמודות קיימות

הרץ את זה קודם כדי לבדוק:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'employees' 
AND column_name IN ('current_role', 'value_proposition', 'target_role');
```

אם העמודות לא מופיעות בתוצאות, הרץ את ה-ALTER TABLE ישירות:

```sql
ALTER TABLE employees ADD COLUMN current_role VARCHAR(255);
ALTER TABLE employees ADD COLUMN value_proposition TEXT;
```

## 📋 הוראות מפורטות

1. פתח Supabase Dashboard
2. לך ל-SQL Editor
3. הרץ את ה-query לבדיקה (גישה 3)
4. אם העמודות לא קיימות, הרץ את ה-ALTER TABLE ישירות (גישה 2)
5. אם תקבל שגיאה "column already exists", זה בסדר - העמודה כבר קיימת

