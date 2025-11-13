# F004: OAuth Setup Guide - LinkedIn & GitHub

מדריך שלב אחר שלב להגדרת OAuth Apps ו-Environment Variables

---

## שלב 1: יצירת LinkedIn OAuth App

### 1.1. היכנס ל-LinkedIn Developers

1. פתח דפדפן וגש ל: **https://www.linkedin.com/developers/**
2. התחבר עם חשבון LinkedIn שלך
3. אם זו הפעם הראשונה, תצטרך ליצור **LinkedIn Developer Account** (חינם)

### 1.2. צור App חדש

1. לחץ על **"Create app"** או **"My Apps"** → **"Create app"**
2. מלא את הפרטים:
   - **App name:** `Directory Profile Enrichment` (או שם אחר)
   - **LinkedIn Page:** 
     - **אם יש לך Company Page:** בחר אותו מהרשימה
     - **אם אין לך Company Page:** ראה פתרונות למטה ⬇️
   - **Privacy Policy URL:** `https://your-frontend-url.com/privacy` (או URL אחר)
   - **App logo:** העלה לוגו (אופציונלי)
3. לחץ **"Create app"**
4. **קבל את ה-Client ID ו-Client Secret:**
   - לאחר יצירת ה-App, תועבר לדף ה-App
   - תחת **"Auth"** → **"Authentication"** תראה:
     - **Client ID** - העתק את זה
     - **Client Secret** - לחץ **"Show"** והעתק את זה

#### ⚠️ פתרונות אם אין לך LinkedIn Company Page:

**פתרון 1: צור Company Page דרך LinkedIn.com (מומלץ)**
1. היכנס ל-LinkedIn.com (לא Developers)
2. לחץ על **"Work"** בתפריט העליון → **"Create a Company Page"**
3. בחר **"Company"** (לא "Showcase page")
4. מלא את הפרטים:
   - Company name
   - Website
   - Industry
   - Company size
5. לחץ **"Create page"**
6. חזור ל-LinkedIn Developers ובחר את הדף שיצרת

**פתרון 2: השתמש ב-Default Company Page (למפתחים יחידים)**
1. ב-LinkedIn Developers, לחץ על **"Learn more"** ליד "For Individual Developers"
2. תראה רשימה של API products עם default Company pages
3. בחר את ה-default Company page שמופיע (למשל "LinkedIn Developer Platform")
4. המשך עם יצירת ה-App

**פתרון 3: בקש ממישהו אחר ליצור את הדף**
1. בקש ממישהו שיש לו מספיק connections ב-LinkedIn ליצור Company Page
2. לאחר יצירת הדף, בקש ממנו להוסיף אותך כ-Admin של הדף
3. כעת תוכל לבחור את הדף ב-LinkedIn Developers

**פתרון 4: השתמש ב-Profile Page זמני (לא מומלץ לפרודקשן)**
- ⚠️ **הערה:** LinkedIn לא מאפשר להשתמש ב-Profile Page, רק Company Page
- אם אתה במצב חירום לבדיקה, נסה פתרון 2 (Default Company Page)

**טיפ:** אם אתה מקבל שגיאה "You don't have enough connections":
- המשך עם פתרון 2 (Default Company Page) - זה עובד גם בלי connections
- או צור Company Page דרך LinkedIn.com (פתרון 1) - זה לא דורש connections

### 1.3. הגדר Redirect URLs

1. בדף ה-App, לך ל-**"Auth"** → **"Authentication"**
2. תחת **"Redirect URLs"**, לחץ **"Add redirect URL"**
3. הוסף את ה-URL הבא:
   ```
   https://directoryproject-production.up.railway.app/api/external/linkedin/callback
   ```
   (החלף ב-URL האמיתי של ה-backend שלך ב-Railway)
4. לחץ **"Update"**
5. **שמור את ה-Client ID ו-Client Secret** - נצטרך אותם בשלב 3

---

## שלב 2: יצירת GitHub OAuth App

### 2.1. היכנס ל-GitHub Settings

1. פתח דפדפן וגש ל: **https://github.com/settings/developers**
2. התחבר עם חשבון GitHub שלך
3. לחץ על **"OAuth Apps"** בתפריט השמאלי

### 2.2. צור OAuth App חדש

1. לחץ על **"New OAuth App"** (או **"Register a new application"**)
2. מלא את הפרטים:
   - **Application name:** `Directory Profile Enrichment` (או שם אחר)
   - **Homepage URL:** `https://your-frontend-url.com` (או URL אחר)
   - **Authorization callback URL:** 
     ```
     https://directoryproject-production.up.railway.app/api/external/github/callback
     ```
     (החלף ב-URL האמיתי של ה-backend שלך ב-Railway)
3. לחץ **"Register application"**

### 2.4. קבל את ה-Client ID ו-Client Secret

1. לאחר יצירת ה-App, תראה את דף ה-App
2. תמצא:
   - **Client ID** - העתק את זה
   - **Client Secret** - לחץ **"Generate a new client secret"** והעתק את זה
   - ⚠️ **חשוב:** Client Secret מוצג רק פעם אחת! העתק אותו מיד
3. **שמור את ה-Client ID ו-Client Secret** - נצטרך אותם בשלב 3

---

## שלב 3: הגדרת Environment Variables ב-Railway

### 3.1. היכנס ל-Railway Dashboard

1. פתח דפדפן וגש ל: **https://railway.app/**
2. התחבר עם חשבון Railway שלך
3. בחר את הפרויקט **"directoryproject-production"** (או שם הפרויקט שלך)

### 3.2. פתח את Environment Variables

1. בפרויקט, לחץ על ה-**Service** של ה-backend (למשל "directory-backend")
2. לחץ על הטאב **"Variables"** (או **"Environment"**)
3. תראה רשימה של כל ה-Environment Variables הקיימים

### 3.3. הוסף את ה-Variables הבאים

לחץ על **"+ New Variable"** והוסף כל אחד מהבאים:

#### LinkedIn Variables:

1. **LINKEDIN_CLIENT_ID**
   - **Name:** `LINKEDIN_CLIENT_ID`
   - **Value:** העתק את ה-Client ID מ-LinkedIn (שלב 1.2)
   - לחץ **"Add"**

2. **LINKEDIN_CLIENT_SECRET**
   - **Name:** `LINKEDIN_CLIENT_SECRET`
   - **Value:** העתק את ה-Client Secret מ-LinkedIn (שלב 1.2)
   - לחץ **"Add"**

3. **LINKEDIN_REDIRECT_URI**
   - **Name:** `LINKEDIN_REDIRECT_URI`
   - **Value:** `https://directoryproject-production.up.railway.app/api/external/linkedin/callback`
   - (החלף ב-URL האמיתי של ה-backend שלך)
   - לחץ **"Add"**

#### GitHub Variables:

4. **GITHUB_CLIENT_ID**
   - **Name:** `GITHUB_CLIENT_ID`
   - **Value:** העתק את ה-Client ID מ-GitHub (שלב 2.4)
   - לחץ **"Add"**

5. **GITHUB_CLIENT_SECRET**
   - **Name:** `GITHUB_CLIENT_SECRET`
   - **Value:** העתק את ה-Client Secret מ-GitHub (שלב 2.4)
   - לחץ **"Add"**

6. **GITHUB_REDIRECT_URI**
   - **Name:** `GITHUB_REDIRECT_URI`
   - **Value:** `https://directoryproject-production.up.railway.app/api/external/github/callback`
   - (החלף ב-URL האמיתי של ה-backend שלך)
   - לחץ **"Add"**

#### General Variables:

7. **BACKEND_URL**
   - **Name:** `BACKEND_URL`
   - **Value:** `https://directoryproject-production.up.railway.app`
   - (החלף ב-URL האמיתי של ה-backend שלך)
   - ⚠️ **חשוב:** גם אם ה-URL מחזיר 404 ב-root (`/`), זה נורמלי! ה-backend עובד דרך `/api/...` ו-`/health`
   - לחץ **"Add"**

8. **FRONTEND_URL**
   - **Name:** `FRONTEND_URL`
   - **Value:** `https://directory-project-bice.vercel.app`
   - (החלף ב-URL האמיתי של ה-frontend שלך ב-Vercel)
   - לחץ **"Add"**

### 3.4. ודא שה-Variables נשמרו

1. בדוק שהרשימה כוללת את כל ה-8 Variables
2. **חשוב:** Railway יאתחל את ה-service אוטומטית אחרי הוספת Variables
3. המתן כמה שניות עד שה-service יתחיל מחדש

---

## שלב 4: בדיקת ההגדרות

### 4.1. בדוק את ה-Backend URL

1. פתח דפדפן וגש ל:
   ```
   https://directoryproject-production.up.railway.app/health
   ```
2. אתה אמור לראות:
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "service": "directory-backend",
     "version": "1.0.0"
   }
   ```

### 4.2. בדוק את ה-Frontend

1. פתח דפדפן וגש ל:
   ```
   https://directory-project-bice.vercel.app/profile
   ```
2. אתה אמור לראות את דף ה-Profile עם "Enhance My Profile" section

### 4.3. בדוק את ה-OAuth Flow

1. בדף ה-Profile, לחץ על **"Connect"** ליד LinkedIn
2. אתה אמור להיות מועבר ל-LinkedIn OAuth page
3. אם אתה רואה שגיאה, בדוק:
   - שה-Redirect URL ב-LinkedIn תואם ל-`LINKEDIN_REDIRECT_URI` ב-Railway
   - שה-Client ID ו-Client Secret נכונים

---

## טיפים ופתרון בעיות

### בעיה: "You don't have enough connections to create a Page"

**פתרון:**
1. **אל תיצור Page דרך LinkedIn Developers** - זה דורש connections
2. **צור Company Page דרך LinkedIn.com:**
   - היכנס ל-LinkedIn.com (לא Developers)
   - לחץ על **"Work"** → **"Create a Company Page"**
   - זה לא דורש connections!
3. **או השתמש ב-Default Company Page:**
   - ב-LinkedIn Developers, לחץ על **"Learn more"** ליד "For Individual Developers"
   - בחר את ה-default Company page שמופיע
   - המשך עם יצירת ה-App

### בעיה: "Invalid redirect_uri"

**פתרון:**
- ודא שה-Redirect URL ב-LinkedIn/GitHub תואם בדיוק ל-`LINKEDIN_REDIRECT_URI` / `GITHUB_REDIRECT_URI` ב-Railway
- ה-URL חייב להיות זהה לחלוטין (כולל `https://`, ללא `/` בסוף)

### בעיה: "Client ID not found"

**פתרון:**
- ודא שה-Client ID נכון ב-Railway
- ודא שה-App ב-LinkedIn/GitHub פעיל (לא archived)

### בעיה: "Unauthorized"

**פתרון:**
- ודא שה-Client Secret נכון ב-Railway
- ב-GitHub, אם יצרת Client Secret חדש, ודא שהעתקת את ה-Secret החדש

### בעיה: OAuth callback לא עובד

**פתרון:**
- ודא שה-`FRONTEND_URL` נכון ב-Railway
- בדוק את ה-logs ב-Railway לראות אם יש שגיאות

---

## סיכום - Checklist

- [ ] LinkedIn OAuth App נוצר
- [ ] LinkedIn Client ID ו-Client Secret הועתקו
- [ ] LinkedIn Redirect URL הוגדר
- [ ] GitHub OAuth App נוצר
- [ ] GitHub Client ID ו-Client Secret הועתקו
- [ ] GitHub Redirect URL הוגדר
- [ ] כל ה-8 Environment Variables נוספו ב-Railway
- [ ] Backend URL נבדק (`/health`)
- [ ] Frontend נבדק (`/profile`)
- [ ] OAuth flow נבדק (Connect button)

---

## הערות חשובות

1. **Client Secrets הם רגישים** - אל תשתף אותם או תעלה אותם ל-GitHub
2. **Redirect URLs חייבים להיות זהים** - גם ב-OAuth App וגם ב-Railway
3. **Railway מאתחל את ה-service** אחרי הוספת Variables - המתן כמה שניות
4. **ב-GitHub**, Client Secret מוצג רק פעם אחת - העתק אותו מיד
5. **ב-LinkedIn**, אפשר לראות את ה-Client Secret שוב ב-"Auth" → "Authentication"

---

## קישורים שימושיים

- **LinkedIn Developers:** https://www.linkedin.com/developers/
- **GitHub OAuth Apps:** https://github.com/settings/developers
- **Railway Dashboard:** https://railway.app/
- **Vercel Dashboard:** https://vercel.com/dashboard

---

**תאריך עדכון:** 2025-01-11

