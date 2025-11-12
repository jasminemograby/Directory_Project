# פתרון בעיית "Connection terminated unexpectedly"

## מה הבעיה?
השגיאה "Connection terminated unexpectedly" בדרך כלל אומרת שיש בעיה עם החיבור למסד הנתונים.

## איך לבדוק מה הבעיה

### 1. בדוק את ה-Logs ב-Backend Terminal
פתח את הטרמינל של ה-Backend ותראה:
- `Step1 Registration Request:` - מה התקבל
- `Creating company record...` - אם זה מגיע לכאן
- `Database query error:` - אם יש שגיאת מסד נתונים

### 2. בדוק את החיבור למסד הנתונים
הרץ את הפקודה:
```powershell
cd backend
node -e "require('dotenv').config(); const {Pool} = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: false}}); pool.query('SELECT NOW()').then(r => {console.log('✅ Connection OK:', r.rows[0]); pool.end();}).catch(e => {console.error('❌ Connection Error:', e.message); pool.end();});"
```

### 3. בדוק את ה-.env file
ודא שיש לך:
- `DATABASE_URL` מוגדר נכון
- `SUPABASE_URL` מוגדר (אם משתמש ב-Supabase)
- `SUPABASE_DB_PASSWORD` מוגדר (אם צריך)

## פתרונות נפוצים

### פתרון 1: השרת לא רץ
אם השרת לא רץ:
```powershell
cd backend
npm start
```

### פתרון 2: בעיית חיבור למסד הנתונים
אם יש בעיית חיבור:
1. בדוק את ה-DATABASE_URL ב-`.env`
2. ודא שהסיסמה נכונה
3. נסה להשתמש ב-Session Pooler URL במקום Direct Connection

### פתרון 3: Connection Pool מת
אם ה-connection pool מת:
1. הפעל מחדש את השרת
2. בדוק את ה-timeout settings

## אם עדיין לא עובד

1. **שלח לי את ה-Logs מה-Backend Terminal** - תראה בדיוק מה השגיאה
2. **בדוק את ה-Console בדפדפן (F12)** - תראה מה השגיאה ב-frontend
3. **נסה לבדוק את החיבור למסד הנתונים** - השתמש בפקודה למעלה

