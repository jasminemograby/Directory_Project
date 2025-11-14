# ✅ מה שבוצע אוטומטית

## ✅ Commit & Push
- **Commit Hash:** `6836d99`
- **Branch:** `main`
- **GitHub URL:** https://github.com/jasminemograby/Directory_Project
- **Status:** ✅ נדחף בהצלחה

## ✅ קבצים שנוצרו
- כל הקבצים החדשים נוצרו ונשמרו
- כל השינויים בוצעו
- אין שגיאות lint

---

# 📋 מה שאת צריכה לעשות - Step by Step

## שלב 1: הרצת Database Migration

### אופציה A: דרך Supabase SQL Editor (מומלץ)

1. **פתחי Supabase Dashboard:**
   - לכי ל: https://supabase.com/dashboard
   - בחרי את הפרויקט שלך

2. **פתחי SQL Editor:**
   - בתפריט השמאלי, לחצי על **SQL Editor**
   - לחצי על **New Query**

3. **העתיקי את תוכן המיגרציה:**
   - פתחי את הקובץ: `database/migrations/add_external_api_calls_log_table.sql`
   - העתיקי את כל התוכן

4. **הדבקי והרצי:**
   - הדבקי את הקוד ב-SQL Editor
   - לחצי על **Run** (או Ctrl+Enter)
   - ודאי שהתוצאה היא "Success"

5. **בדיקת הצלחה:**
   ```sql
   SELECT * FROM external_api_calls_log LIMIT 1;
   ```
   - אם אין שגיאה = הצלחה ✅

### אופציה B: דרך psql (אם יש לך גישה)

```bash
psql $DATABASE_URL -f database/migrations/add_external_api_calls_log_table.sql
```

---

## שלב 2: הגדרת משתני סביבה ב-Railway (Backend)

### צעד 1: פתיחת Railway Dashboard
1. לכי ל: https://railway.app
2. התחברי לחשבון שלך
3. בחרי את הפרויקט **Directory Backend**

### צעד 2: פתיחת Variables
1. בתפריט השמאלי, לחצי על **Settings**
2. לחצי על **Variables** (בתפריט Settings)

### צעד 3: הוספת משתנים

**לחצי על "New Variable" עבור כל משתנה:**

#### משתנים חובה (Required):

1. **INTERNAL_API_SECRET**
   - **Name:** `INTERNAL_API_SECRET`
   - **Value:** צרי secret חזק (ראה למטה)
   - **Generate Secret:**
     ```bash
     openssl rand -hex 32
     ```
     או השתמשי ב: https://www.random.org/strings/
     - **אורך מינימלי:** 32 תווים
   - **לחצי:** Add

2. **Microservices URLs** (הוסף את כולם):

   - **CONTENT_STUDIO_URL**
     - Value: `https://content-studio-production-76b6.up.railway.app`
   
   - **COURSE_BUILDER_URL**
     - Value: `https://coursebuilderfs-production.up.railway.app`
   
   - **SKILLS_ENGINE_URL**
     - Value: `https://skillsengine-production.up.railway.app`
   
   - **ASSESSMENT_URL**
     - Value: `https://assessment-tests-production.up.railway.app`
   
   - **LEARNER_AI_URL**
     - Value: `https://learner-ai-backend-production.up.railway.app`
   
   - **MANAGEMENT_REPORTING_URL**
     - Value: `https://lotusproject-production.up.railway.app`
   
   - **LEARNING_ANALYTICS_URL**
     - Value: `https://ms8-learning-analytics-production.up.railway.app`

#### משתנים אופציונליים (Optional - אפשר לדלג):

3. **ALLOWED_SERVICES** (אם רוצה להגביל שירותים)
   - Value: `SkillsEngine,CourseBuilder,ContentStudio,Assessment,LearnerAI,ManagementReporting,LearningAnalytics`

4. **MICROSERVICE_TIMEOUT** (אם רוצה לשנות timeout)
   - Value: `30000` (30 שניות)

5. **CIRCUIT_BREAKER_FAILURE_THRESHOLD**
   - Value: `5`

6. **CIRCUIT_BREAKER_RESET_TIMEOUT**
   - Value: `60000` (60 שניות)

### צעד 4: בדיקת משתנים קיימים
ודאי שיש לך גם:
- ✅ `NODE_ENV=production`
- ✅ `PORT=5000`
- ✅ `DATABASE_URL` (מחובר ל-Supabase)
- ✅ `CORS_ORIGIN` (URL של Vercel frontend)

### צעד 5: שמירה
- כל משתנה נשמר אוטומטית כשלוחצים Add
- **חשוב:** Railway יבצע redeploy אוטומטי אחרי הוספת משתנים

---

## שלב 3: בדיקת Deployment ב-Railway

### צעד 1: בדיקת Logs
1. ב-Railway Dashboard, לכי ל-**Deployments**
2. לחצי על ה-Deployment האחרון
3. בדקי את ה-Logs:
   - חפשי: `Directory Backend running on port 5000`
   - אם יש שגיאות - שלחי לי

### צעד 2: בדיקת Health Check
פתחי בדפדפן או curl:
```
https://your-backend.railway.app/health
```

**צפוי לראות:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "directory-backend",
  "version": "1.0.0"
}
```

### צעד 3: בדיקת Exchange Endpoint
```bash
curl -X POST https://your-backend.railway.app/api/exchange \
  -H "Content-Type: application/json" \
  -d '{
    "requester_service": "SkillsEngine",
    "payload": "{\"employee_id\":\"test-id\",\"fields\":[\"competencies\"]}"
  }'
```

**צפוי לראות:**
```json
{
  "success": true,
  "serviceName": "SkillsEngine",
  "payload": "{...}",
  "source": "fallback_not_configured" // או "external_api" אם השירות זמין
}
```

---

## שלב 4: הגדרת משתני סביבה ב-Vercel (Frontend)

### צעד 1: פתיחת Vercel Dashboard
1. לכי ל: https://vercel.com
2. התחברי לחשבון שלך
3. בחרי את הפרויקט **Directory Frontend**

### צעד 2: פתיחת Environment Variables
1. בתפריט העליון, לחצי על **Settings**
2. בתפריט השמאלי, לחצי על **Environment Variables**

### צעד 3: הוספת משתנה
1. לחצי על **Add New**
2. מלאי:
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://your-backend.railway.app/api`
     (החלפי `your-backend.railway.app` ב-URL האמיתי של Railway)
   - **Environment:** בחרי **Production** (ו-**Preview** אם רוצה)
3. לחצי **Save**

### צעד 4: Redeploy
1. לכי ל-**Deployments**
2. לחצי על ה-Deployment האחרון
3. לחצי על **...** (שלוש נקודות)
4. בחרי **Redeploy**
5. ודאי שהדפלוי מצליח

---

## שלב 5: בדיקת Integration

### בדיקה 1: Frontend → Backend
1. פתחי את האפליקציה ב-Vercel
2. בדקי ב-Console (F12) שאין שגיאות CORS
3. נסי להתחבר/לעשות פעולה

### בדיקה 2: Exchange Endpoint (Production)
```bash
curl -X POST https://your-backend.railway.app/api/exchange \
  -H "Content-Type: application/json" \
  -d '{
    "requester_service": "SkillsEngine",
    "payload": "{\"employee_id\":\"test\",\"fields\":[\"competencies\"]}"
  }'
```

### בדיקה 3: Internal API (Production)
```bash
curl -X POST https://your-backend.railway.app/api/internal/skills-engine/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_INTERNAL_API_SECRET" \
  -d '{
    "employee_id": "valid-uuid-here",
    "normalized_skills": []
  }'
```

**צפוי:** `{"success": true, "message": "Skills updated successfully"}`

---

## שלב 6: שיתוף INTERNAL_API_SECRET

### עם מי לשתף:
- צוות Skills Engine
- צוות Course Builder
- צוות Content Studio
- כל מיקרוסרבס שצריך לשלוח עדכונים ל-Directory

### איך לשתף:
1. העתיקי את ה-`INTERNAL_API_SECRET` מ-Railway Variables
2. שלחי בצורה מאובטחת (לא ב-email רגיל, השתמשי ב-Slack/Discord/Password Manager)
3. הסבירי שזה עבור:
   - `POST /api/internal/skills-engine/update`
   - `POST /api/internal/content-studio/update`
   - `POST /api/internal/course-builder/feedback`

---

## ✅ Checklist סופי

לפני שתסיימי, ודאי:

- [ ] Migration הורצה בהצלחה ב-Supabase
- [ ] כל משתני הסביבה הוגדרו ב-Railway
- [ ] `INTERNAL_API_SECRET` נוצר והוגדר
- [ ] כל ה-URLs של המיקרוסרבסים הוגדרו
- [ ] Health check עובד: `/health` מחזיר 200
- [ ] Exchange endpoint עובד (אפילו עם fallback)
- [ ] Frontend `REACT_APP_API_URL` הוגדר ב-Vercel
- [ ] Frontend redeployed ב-Vercel
- [ ] בדקת שהאפליקציה עובדת ב-production
- [ ] `INTERNAL_API_SECRET` שותף עם צוותי המיקרוסרבסים

---

## 🆘 בעיות נפוצות

### בעיה: Migration נכשל
**פתרון:**
- ודאי שהטבלה לא קיימת כבר: `SELECT * FROM external_api_calls_log LIMIT 1;`
- אם קיימת - זה בסדר, המיגרציה idempotent

### בעיה: Railway לא מתחבר ל-Database
**פתרון:**
- בדקי ש-`DATABASE_URL` נכון
- בדקי ב-Logs של Railway אם יש שגיאות connection

### בעיה: Exchange endpoint מחזיר 403
**פתרון:**
- בדקי ש-`ALLOWED_SERVICES` כולל את השירות שביקשת
- או מחקי את `ALLOWED_SERVICES` כדי לאפשר הכל

### בעיה: Internal API מחזיר 401/403
**פתרון:**
- ודאי ש-`INTERNAL_API_SECRET` זהה ב-Railway וב-Header של הבקשה
- בדקי שהשתמשת ב-`Bearer ` לפני ה-token

---

## 📞 תמיכה

אם נתקלת בבעיה:
1. בדקי את ה-Logs ב-Railway
2. בדקי את ה-Logs ב-Vercel
3. בדקי את ה-Logs ב-Supabase
4. שלחי לי את השגיאה המדויקת

---

## 📚 מסמכים נוספים

- **Deployment Guide:** `docs/microservice_integration_deployment.md`
- **Summary:** `docs/microservice_integration_summary.md`
- **Postman Collection:** `docs/postman_collection.json`

---

**Commit Hash:** `6836d99`  
**GitHub:** https://github.com/jasminemograby/Directory_Project  
**Status:** ✅ מוכן ל-deployment

