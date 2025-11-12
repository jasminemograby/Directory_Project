# Supabase Project Setup - Step by Step

## שלב 1: יצירת/בחירת פרויקט

### אם יש לך פרויקט "TEST":
1. לחץ על הפרויקט "TEST" ב-Supabase Dashboard
2. בדוק את ה-Project URL - האם זה `https://glnwnrlotpmhjkkkonky.supabase.co`?
3. אם כן - המשך לשלב 2
4. אם לא - צריך ליצור פרויקט חדש או להשתמש בפרויקט הקיים

### אם צריך ליצור פרויקט חדש:
1. לחץ על **"New Project"** או **"Create Project"**
2. מלא את הפרטים:
   - **Name**: Directory Project (או כל שם שתרצה)
   - **Database Password**: `FULLSTACK2025` (או סיסמה אחרת - שמור אותה!)
   - **Region**: בחר את האזור הקרוב אליך
3. לחץ **"Create new project"**
4. המתן 2-3 דקות עד שהפרויקט ייווצר

---

## שלב 2: קבלת Connection Strings

לאחר שהפרויקט מוכן:

1. **פתח את הפרויקט** ב-Dashboard

2. **קבל את Project URL:**
   - בדף הראשי של הפרויקט, תראה את ה-Project URL
   - זה נראה כך: `https://xxxxx.supabase.co`
   - העתק את החלק `xxxxx` (זה ה-project reference)

3. **קבל את Database Connection String:**
   - לך ל-**Settings** (ההילינגים בצד) → **Database**
   - גלול למטה ל-**Connection string** section
   - יש לך 3 אפשרויות:
     - **URI** - חיבור ישיר
     - **Connection Pooling** - מומלץ (Session mode)
     - **Connection Pooling** - Transaction mode

4. **העתק את Connection Pooling (Session mode):**
   - לחץ על **Connection Pooling** tab
   - בחר **Session mode**
   - לחץ על **URI** tab
   - העתק את ה-connection string
   - זה נראה כך:
     ```
     postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
     ```
   - החלף `[YOUR-PASSWORD]` בסיסמת המסד נתונים שלך

5. **או העתק את Direct Connection (URI):**
   - אם Connection Pooling לא עובד, נסה את ה-URI הישיר
   - זה נראה כך:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
     ```

6. **קבל את Service Role Key:**
   - באותו עמוד (Settings → Database)
   - או Settings → **API**
   - מצא את **service_role key** (לא ה-anon key!)
   - העתק אותו

---

## שלב 3: הרצת ה-Schema

1. **פתח את SQL Editor:**
   - לחץ על **SQL Editor** בתפריט הצד

2. **צור Query חדש:**
   - לחץ על **New query**

3. **העתק את ה-Schema:**
   - פתח את הקובץ `database/schema.sql` בפרויקט שלך
   - העתק את כל התוכן

4. **הדבק והרץ:**
   - הדבק את ה-SQL ב-SQL Editor
   - לחץ על **Run** (או F5)
   - המתן עד שהשאילתה תרוץ בהצלחה
   - אמור לראות הודעת הצלחה

---

## שלב 4: עדכון ה-.env

עדכן את `backend/.env` עם הנתונים החדשים:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database - Supabase
DATABASE_URL=postgresql://postgres.xxxxx:FULLSTACK2025@aws-0-us-east-1.pooler.supabase.com:6543/postgres
# או אם Connection Pooling לא עובד:
# DATABASE_URL=postgresql://postgres:FULLSTACK2025@db.xxxxx.supabase.co:5432/postgres

# Supabase Settings
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_PASSWORD=FULLSTACK2025

# CORS
CORS_ORIGIN=http://localhost:3000
```

**החלף:**
- `xxxxx` ב-project reference שלך
- `FULLSTACK2025` בסיסמת המסד נתונים שלך (אם שונה)
- את ה-Service Role Key ב-key שהעתקת

---

## שלב 5: בדיקת החיבור

1. **הפעל מחדש את השרת:**
   ```powershell
   cd backend
   npm start
   ```

2. **בדוק את הלוגים:**
   - אמור לראות: `Database connected successfully`
   - אם יש שגיאה, בדוק את ה-connection string

---

## פתרון בעיות

### שגיאת DNS (ENOTFOUND):
- נסה Connection Pooler URL במקום Direct Connection
- בדוק את ה-firewall/VPN

### שגיאת Authentication:
- ודא שהסיסמה נכונה
- ודא שהשתמשת ב-Database Password ולא ב-Service Role Key

### שגיאת Schema:
- ודא שהרצת את כל ה-schema
- בדוק ב-SQL Editor אם הטבלאות נוצרו (Table Editor)

---

## צעדים הבאים

לאחר שהחיבור עובד:
1. המשך לבדיקת הטופס (Company Registration)
2. בדוק שהנתונים נשמרים במסד הנתונים
3. המשך לפיתוח התכונות הבאות

