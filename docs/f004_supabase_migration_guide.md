# F004: Supabase Migration Guide - OAuth Tokens Tables

## אוטומטי: Script לעדכון Supabase

נוצר script אוטומטי שיעדכן את ה-database ב-Supabase.

### איך להריץ את ה-Script

1. **ודא שיש לך את ה-Environment Variables:**
   - `DATABASE_URL` או `SUPABASE_CONNECTION_POOLER_URL` ב-`backend/.env`

2. **הרץ את ה-Script:**
   ```bash
   cd backend
   node ../database/scripts/apply_migrations.js
   ```

3. **ה-Script יעשה:**
   - ✅ יבדוק אילו migrations כבר הוחלו
   - ✅ יבצע רק migrations חדשים
   - ✅ ישמור רשומה של כל migration שהוחל
   - ✅ יציג הודעות ברורות על התקדמות

### מה ה-Script עושה?

1. **יוצר טבלת `schema_migrations`** (אם לא קיימת)
   - שומרת רשומה של כל migration שהוחל

2. **קורא את כל ה-migration files** מ-`database/migrations/`

3. **בודק אילו כבר הוחלו:**
   - אם migration כבר הוחל → מדלג
   - אם לא → מריץ אותו

4. **מריץ את ה-migration:**
   - בתוך transaction (אם יש שגיאה, הכל מתבטל)
   - שומר רשומה ב-`schema_migrations`

### Migrations שיוחלו:

- ✅ `add_oauth_tokens_table.sql` - יוצר טבלאות `oauth_tokens` ו-`external_data_raw`

---

## ידני: דרך Supabase Dashboard (אם Script לא עובד)

אם ה-script לא עובד, אפשר להריץ ידנית:

### שלב 1: היכנס ל-Supabase Dashboard

1. פתח: https://supabase.com/dashboard
2. בחר את הפרויקט שלך
3. לחץ על **"SQL Editor"** בתפריט השמאלי

### שלב 2: הרץ את ה-Migration

1. לחץ על **"New query"**
2. העתק את התוכן מ-`database/migrations/add_oauth_tokens_table.sql`
3. הדבק ב-SQL Editor
4. לחץ **"Run"** (או Ctrl+Enter)

### שלב 3: ודא שה-Tables נוצרו

1. לך ל-**"Table Editor"** בתפריט השמאלי
2. בדוק שיש:
   - ✅ `oauth_tokens`
   - ✅ `external_data_raw`

---

## איך לבדוק שה-Migration הצליח?

### דרך 1: Supabase Dashboard

1. לך ל-**"Table Editor"**
2. חפש `oauth_tokens` ו-`external_data_raw`
3. אם הן קיימות → ✅ הצליח!

### דרך 2: SQL Query

הרץ ב-SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('oauth_tokens', 'external_data_raw');
```

אם אתה רואה 2 שורות → ✅ הצליח!

---

## פתרון בעיות

### בעיה: "relation already exists"

**פתרון:** זה אומר שה-tables כבר קיימות. זה בסדר! ה-migration כבר הוחל בעבר.

### בעיה: "permission denied"

**פתרון:** ודא שאתה משתמש ב-Connection Pooler URL (לא Direct Connection) ויש לך הרשאות.

### בעיה: Script לא מוצא DATABASE_URL

**פתרון:** 
1. ודא שיש `backend/.env` עם `DATABASE_URL`
2. או הרץ ידנית דרך Supabase Dashboard

---

**תאריך עדכון:** 2025-01-11

