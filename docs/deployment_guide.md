# מדריך פריסה מלא - Directory Project

## סקירה כללית

הפרויקט מופרס על 3 פלטפורמות:
- **Frontend:** Vercel
- **Backend:** Railway
- **Database:** Supabase (כבר מוגדר)

## שלב 1: הכנה לפריסה

### 1.1 וידוא שהקוד נקי
- ✅ כל הלוגים המיותרים הוסרו
- ✅ אין קבצי .env בקוד
- ✅ כל ההגדרות משתמשות ב-environment variables

### 1.2 Push ל-GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "Initial deployment-ready version - F001 Company Registration complete"

# Push to GitHub (replace with your repository URL)
git remote add origin <your-github-repo-url>
git push -u origin main
```

## שלב 2: הגדרת Environment Variables

### 2.1 Supabase (Database) - כבר מוגדר

**אין צורך בהגדרות נוספות** - ה-Database כבר רץ ב-Supabase.

**מה שצריך:**
- Connection String (Session Pooler או Direct Connection)
- Database Password

### 2.2 Railway (Backend)

#### שלבים:
1. לך ל-[Railway Dashboard](https://railway.app)
2. צור פרויקט חדש → "New Project"
3. בחר "Deploy from GitHub repo"
4. בחר את ה-repository שלך
5. בחר את התיקייה `backend/` כשורש הפרויקט

#### Environment Variables ל-Railway:

לך ל-Settings → Variables והוסף:

```
NODE_ENV=production
PORT=5000

# Database (Supabase)
DATABASE_URL=postgresql://postgres.glnwnrlotpmhjkkkonky:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
# או
SUPABASE_URL=https://glnwnrlotpmhjkkkonky.supabase.co
SUPABASE_DB_PASSWORD=[YOUR-PASSWORD]

# CORS (Frontend URL מ-Vercel)
CORS_ORIGIN=https://your-frontend.vercel.app
```

**איך למצוא את הערכים:**
- `DATABASE_URL`: Supabase Dashboard → Settings → Database → Connection Pooling → Session Mode
- `CORS_ORIGIN`: יהיה ה-URL של ה-Frontend מ-Vercel (תקבל אחרי הפריסה)

#### Build Settings:
- **Root Directory:** `backend`
- **Build Command:** (אין צורך - Railway מזהה אוטומטית)
- **Start Command:** `npm start`

### 2.3 Vercel (Frontend)

#### שלבים:
1. לך ל-[Vercel Dashboard](https://vercel.com)
2. לחץ "Add New Project"
3. Import את ה-GitHub repository שלך
4. הגדר:
   - **Framework Preset:** React
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

#### Environment Variables ל-Vercel:

לך ל-Settings → Environment Variables והוסף:

```
REACT_APP_API_URL=https://your-backend.railway.app/api
```

**איך למצוא את הערך:**
- `REACT_APP_API_URL`: יהיה ה-URL של ה-Backend מ-Railway (תקבל אחרי הפריסה)

## שלב 3: פריסה

### 3.1 Backend (Railway)

1. **Push ל-GitHub** (אם עדיין לא)
2. **Railway יזהה את השינויים** ויתחיל build אוטומטית
3. **המתן לסיום ה-Build** (2-3 דקות)
4. **קבל את ה-URL** של ה-Backend (משהו כמו: `https://your-app.railway.app`)
5. **בדוק Health Check:**
   ```
   https://your-backend.railway.app/api/health
   ```
   אמור להחזיר: `{"status":"ok",...}`

### 3.2 Frontend (Vercel)

1. **עדכן את CORS_ORIGIN ב-Railway:**
   - לך ל-Railway → Settings → Variables
   - עדכן `CORS_ORIGIN` ל-URL של Vercel (תקבל אחרי הפריסה)

2. **עדכן את REACT_APP_API_URL ב-Vercel:**
   - לך ל-Vercel → Settings → Environment Variables
   - עדכן `REACT_APP_API_URL` ל-URL של Railway

3. **Redeploy ב-Vercel:**
   - לך ל-Deployments
   - לחץ על ה-Deployment האחרון → "Redeploy"

### 3.3 Database (Supabase)

**כבר מוגדר** - אין צורך בפעולות נוספות.

## שלב 4: בדיקות אחרי פריסה

### 4.1 בדיקת Backend

```bash
# Health Check
curl https://your-backend.railway.app/api/health

# אמור להחזיר:
# {"status":"ok","timestamp":"...","service":"directory-backend","version":"1.0.0"}
```

### 4.2 בדיקת Frontend

1. פתח את ה-URL של Vercel בדפדפן
2. בדוק שהדף נטען
3. נסה לגשת ל-`/company/register/step1`
4. בדוק שהטופס עובד

### 4.3 בדיקת חיבור Frontend-Backend

1. פתח את ה-Console בדפדפן (F12)
2. נסה לשלוח טופס רישום
3. בדוק שאין שגיאות CORS
4. בדוק שהבקשות מגיעות ל-Backend

## שלב 5: הגדרת GitHub Secrets (לעתיד)

אם אתה רוצה להשתמש ב-GitHub Actions לפריסה אוטומטית:

### Secrets ל-GitHub:

לך ל-GitHub Repository → Settings → Secrets and variables → Actions

הוסף:
- `VERCEL_TOKEN` - מ-Vercel Dashboard → Settings → Tokens
- `VERCEL_ORG` - שם ה-Organization ב-Vercel
- `VERCEL_PROJECT_ID` - Project ID מ-Vercel
- `RAILWAY_TOKEN` - מ-Railway Dashboard → Account → Tokens
- `REACT_APP_API_URL` - URL של ה-Backend
- `BACKEND_URL` - URL של ה-Backend
- `FRONTEND_URL` - URL של ה-Frontend

## פתרון בעיות

### בעיה: CORS Error
**פתרון:** ודא ש-`CORS_ORIGIN` ב-Railway מכיל את ה-URL המדויק של Vercel (ללא slash בסוף)

### בעיה: Database Connection Error
**פתרון:** 
1. ודא ש-`DATABASE_URL` נכון ב-Railway
2. ודא שה-SSL מופעל (Railway עושה זאת אוטומטית)
3. בדוק שה-Password נכון

### בעיה: Frontend לא מתחבר ל-Backend
**פתרון:**
1. ודא ש-`REACT_APP_API_URL` נכון ב-Vercel
2. ודא שה-Backend רץ (בדוק Health Check)
3. בדוק שאין שגיאות CORS

### בעיה: Build Fails
**פתרון:**
1. בדוק את ה-Logs ב-Railway/Vercel
2. ודא שכל ה-dependencies מותקנים
3. בדוק שאין שגיאות syntax

## סיכום

לאחר הפריסה:
- ✅ Frontend רץ ב-Vercel
- ✅ Backend רץ ב-Railway
- ✅ Database רץ ב-Supabase
- ✅ הכל מחובר ועובד

**URLs שתקבל:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.railway.app`
- Database: `https://glnwnrlotpmhjkkkonky.supabase.co`

