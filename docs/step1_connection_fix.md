# פתרון בעיית "Connection terminated unexpectedly" ב-Step 1

## מה עשיתי

1. **הוספתי logging מפורט** - עכשיו תראה ב-Backend Terminal בדיוק מה קורה
2. **שיפרתי error handling** - עכשיו תראה את השגיאה המדויקת
3. **הוספתי טיפול לשגיאות חיבור** - עכשיו יש הודעה ברורה יותר

## איך לבדוק מה הבעיה

### 1. בדוק את ה-Logs ב-Backend Terminal
כשאתה שולח את הטופס, תראה:
```
═══════════════════════════════════════════════════════
📝 Step1 Registration Request
═══════════════════════════════════════════════════════
Company Name: ...
Industry: ...
HR Email: ...
Domain: ...
═══════════════════════════════════════════════════════

Creating company record...
```

אם יש שגיאה, תראה:
```
❌ Step1 Registration Error: ...
Error code: ...
PostgreSQL error code: ...
```

### 2. בדוק את החיבור למסד הנתונים
הרץ את הפקודה:
```powershell
cd backend
node -e "require('dotenv').config(); const {Pool} = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: false}}); pool.query('SELECT NOW()').then(r => {console.log('✅ Connection OK:', r.rows[0]); pool.end();}).catch(e => {console.error('❌ Connection Error:', e.message); pool.end();});"
```

## פתרונות

### אם השרת לא רץ:
```powershell
cd backend
npm start
```

### אם יש בעיית חיבור:
1. בדוק את ה-`DATABASE_URL` ב-`backend/.env`
2. ודא שהסיסמה נכונה
3. נסה להשתמש ב-Session Pooler URL

### אם עדיין לא עובד:
1. **שלח לי את ה-Logs מה-Backend Terminal** - תראה בדיוק מה השגיאה
2. **בדוק את ה-Console בדפדפן (F12)** - תראה מה השגיאה ב-frontend

## נסה שוב

1. רענן את הדף `http://localhost:3000/company/register/step1`
2. מלא את הטופס
3. שלח
4. בדוק את ה-Logs ב-Backend Terminal
5. שלח לי את השגיאה המדויקת

