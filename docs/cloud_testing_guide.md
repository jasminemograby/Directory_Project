# מדריך בדיקה בענן - Cloud Testing Guide

## 🌐 URLs של המערכת בענן

### Frontend (Vercel)
- **Production URL:** `https://directory-project-bice.vercel.app`
- **או:** בדוק ב-Vercel Dashboard → Settings → Domains

### Backend (Railway)
- **Production URL:** `https://directory-project-production.up.railway.app`
- **או:** בדוק ב-Railway Dashboard → Settings → Networking

### Database (Supabase)
- **Dashboard:** `https://supabase.com/dashboard`
- **Connection String:** ב-Supabase Dashboard → Settings → Database

---

## ✅ בדיקות מהירות בענן (5 דקות)

### 1. בדיקת Frontend
1. פתח: `https://directory-project-bice.vercel.app`
2. בדוק שהדף נטען (ללא שגיאות 404/500)
3. פתח Console (F12) → בדוק שאין שגיאות JavaScript

### 2. בדיקת Backend Health
1. פתח: `https://directory-project-production.up.railway.app/health`
2. צריך לראות: `{"status":"ok","timestamp":"..."}`

### 3. בדיקת Database Connection
1. התחבר ל-Supabase Dashboard
2. עבור ל-Table Editor
3. בדוק שיש טבלאות: `companies`, `employees`, `departments`, `teams`

---

## 🔍 בדיקות End-to-End בענן

### תרחיש 1: רישום חברה

**שלבים:**
1. פתח: `https://directory-project-bice.vercel.app`
2. לחץ על "Register Your Company"
3. מלא פרטי חברה → שלח
4. בדוק שהחברה נוצרה ב-Supabase

**איך לבדוק ב-Supabase:**
```sql
-- ב-Supabase Dashboard → SQL Editor
SELECT * FROM companies ORDER BY created_at DESC LIMIT 1;
```

---

### תרחיש 2: התחברות והתחברות

**שלבים:**
1. פתח: `https://directory-project-bice.vercel.app/login`
2. התחבר עם אימייל של HR
3. בדוק שהמערכת מעבירה אותך ל-`/hr/dashboard`
4. פתח Console (F12) → בדוק שאין שגיאות

**בדיקות:**
- ✅ התחברות עובדת
- ✅ ניתוב לפי תפקיד עובד
- ✅ HR Dashboard נטען

---

### תרחיש 3: יצירת בקשה

**שלבים:**
1. התחבר כ-Employee
2. עבור ל-`/profile`
3. לחץ על "Request Training"
4. מלא פרטים → שלח
5. בדוק שהבקשה נוצרה ב-Supabase

**איך לבדוק ב-Supabase:**
```sql
-- ב-Supabase Dashboard → SQL Editor
SELECT * FROM training_requests ORDER BY created_at DESC LIMIT 1;
```

---

## 🐛 דיבוג בענן

### 1. בדיקת Logs ב-Railway

**איך:**
1. עבור ל-Railway Dashboard
2. בחר את ה-Service (Backend)
3. לחץ על "Logs"
4. בדוק שגיאות או warnings

**מה לחפש:**
- ❌ `Error: ...`
- ❌ `Database connection error`
- ❌ `CORS error`
- ⚠️ `Warning: ...`

---

### 2. בדיקת Logs ב-Vercel

**איך:**
1. עבור ל-Vercel Dashboard
2. בחר את ה-Project
3. לחץ על "Deployments"
4. לחץ על Deployment האחרון
5. לחץ על "Functions" → בדוק logs

**מה לחפש:**
- ❌ Build errors
- ❌ Runtime errors
- ❌ API errors

---

### 3. בדיקת Console בדפדפן

**איך:**
1. פתח את האפליקציה
2. לחץ F12 → Console
3. בדוק שגיאות

**מה לחפש:**
- ❌ `Failed to fetch`
- ❌ `CORS error`
- ❌ `404 Not Found`
- ❌ `500 Internal Server Error`

---

### 4. בדיקת Network Tab

**איך:**
1. פתח את האפליקציה
2. לחץ F12 → Network
3. רענן את הדף
4. בדוק את כל ה-Requests

**מה לחפש:**
- ❌ Requests עם status 404/500
- ❌ Requests שנכשלו (failed)
- ⚠️ Requests איטיים (>2 שניות)

---

## 🔐 בדיקת Environment Variables

### Backend (Railway)

**איך לבדוק:**
1. עבור ל-Railway Dashboard
2. בחר את ה-Service (Backend)
3. לחץ על "Variables"
4. בדוק שיש:
   - `DATABASE_URL`
   - `JWT_SECRET` (או כל secret אחר)
   - `GEMINI_API_KEY` (אם משתמשים)
   - `CORS_ORIGIN` (או `FRONTEND_URL`)

---

### Frontend (Vercel)

**איך לבדוק:**
1. עבור ל-Vercel Dashboard
2. בחר את ה-Project
3. לחץ על "Settings" → "Environment Variables"
4. בדוק שיש:
   - `REACT_APP_API_URL` (או `VITE_API_URL`)
   - כל משתני סביבה אחרים

---

## 📊 בדיקת Database (Supabase)

### 1. בדיקת חיבור

**איך:**
1. עבור ל-Supabase Dashboard
2. לחץ על "Database" → "Connection Pooling"
3. בדוק שהחיבור פעיל

---

### 2. בדיקת טבלאות

**איך:**
1. עבור ל-Supabase Dashboard
2. לחץ על "Table Editor"
3. בדוק שיש טבלאות:
   - `companies`
   - `employees`
   - `departments`
   - `teams`
   - `training_requests`
   - `skill_verification_requests`
   - `self_learning_requests`
   - `extra_attempt_requests`

---

### 3. בדיקת נתונים

**איך:**
```sql
-- ב-Supabase Dashboard → SQL Editor

-- בדוק חברות
SELECT id, name, industry, verification_status FROM companies;

-- בדוק עובדים
SELECT id, name, email, type, company_id FROM employees;

-- בדוק בקשות
SELECT id, employee_id, status, created_at FROM training_requests;
```

---

## 🚀 Deployment Checklist

לפני בדיקה בענן, ודא:

- [ ] כל השינויים ב-`git push` (GitHub)
- [ ] Vercel deploy הצליח (בודק ב-Vercel Dashboard)
- [ ] Railway deploy הצליח (בודק ב-Railway Dashboard)
- [ ] Environment Variables מוגדרים נכון
- [ ] Database migrations רצו (אם יש)

---

## ⚡ Quick Test Script

**העתק והדבק ב-Console בדפדפן:**

```javascript
// בדיקת Frontend
console.log('Frontend URL:', window.location.href);

// בדיקת API
fetch('https://directory-project-production.up.railway.app/health')
  .then(res => res.json())
  .then(data => console.log('Backend Health:', data))
  .catch(err => console.error('Backend Error:', err));

// בדיקת LocalStorage
console.log('Current User:', localStorage.getItem('currentUser'));
console.log('Employee ID:', localStorage.getItem('currentEmployeeId'));
```

---

## 📝 סיכום

**למה לבדוק בענן?**
- ✅ זה הגרסה האמיתית שהמשתמשים רואים
- ✅ כל השינויים כבר מועלים
- ✅ בדיקת סביבת Production האמיתית
- ✅ בדיקת CORS, Environment Variables, וכל ההגדרות

**מתי להשתמש בבדיקה מקומית?**
- רק כשאתה מפתח תכונה חדשה
- כשאתה צריך לדבג בעיות ספציפיות
- כשאתה רוצה לבדוק שינויים לפני commit

---

## 🆘 בעיות נפוצות

### "Failed to fetch"
- בדוק שה-Backend URL נכון
- בדוק CORS settings
- בדוק שה-Backend פעיל (Railway)

### "404 Not Found"
- בדוק שה-Route קיים
- בדוק שה-Deployment הצליח
- בדוק את ה-URL

### "500 Internal Server Error"
- בדוק את ה-Logs ב-Railway
- בדוק את ה-Database connection
- בדוק את ה-Environment Variables

### "Database connection error"
- בדוק את ה-DATABASE_URL ב-Railway
- בדוק שהמסד הנתונים פעיל (Supabase)
- בדוק את ה-Connection Pooling

