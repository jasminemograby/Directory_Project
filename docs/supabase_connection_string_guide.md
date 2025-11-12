# איך למצוא את Supabase Connection String

## שלב 1: היכנס ל-Supabase Dashboard

1. לך ל-[Supabase Dashboard](https://supabase.com/dashboard)
2. בחר את הפרויקט שלך (glnwnrlotpmhjkkkonky)

## שלב 2: מצא את Connection String

### דרך 1: Connection Pooling (מומלץ)

1. לך ל-**Settings** → **Database**
2. גלול למטה ל-**Connection Pooling**
3. בחר **Session Mode** (לא Transaction Mode)
4. העתק את ה-URL

**פורמט:**
```
postgresql://postgres.glnwnrlotpmhjkkkonky:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
```

**החלף `[YOUR-PASSWORD]`** ב-password שלך (FULLSTACK2025)

### דרך 2: Direct Connection

1. לך ל-**Settings** → **Database**
2. מצא **Connection String**
3. בחר **URI** או **Node.js**
4. העתק את ה-URL

**פורמט:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.glnwnrlotpmhjkkkonky.supabase.co:5432/postgres
```

## שלב 3: השתמש ב-Connection String

**ב-Railway:**
1. לך ל-Variables
2. הוסף:
   - **Name:** `DATABASE_URL`
   - **Value:** ה-Connection String (עם ה-password)
3. שמור

## הערות חשובות

- ✅ **Session Mode** מומלץ יותר מ-Transaction Mode
- ✅ ודא שה-password נכון (ללא רווחים)
- ✅ השתמש ב-Connection Pooling ל-production
- ✅ אל תשתף את ה-Connection String בפומבי

## אימות החיבור

אחרי שהגדרת ב-Railway, בדוק את ה-Logs:
- אמור לראות: `Database connected successfully`
- אם יש שגיאה, בדוק שה-password נכון

