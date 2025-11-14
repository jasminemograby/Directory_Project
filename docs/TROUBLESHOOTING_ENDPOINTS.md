# 🔍 פתרון בעיות - Endpoints

## בעיה: מקבלת 404 כשנכנסת לדפדפן

### למה זה קורה?

**דפדפן עושה GET request, אבל:**
- `/api/internal/*` endpoints דורשים **POST**
- `/api/exchange` דורש **POST**
- רוב ה-API endpoints דורשים **POST/PUT/DELETE**

### מה לעשות?

**✅ בדיקות שכן עובדות בדפדפן (GET requests):**
- `/health` - Health check
- `/api/health` - Health check (אלטרנטיבי)

**❌ בדיקות שלא עובדות בדפדפן:**
- `/api/internal/*` - דורש POST + Authentication
- `/api/exchange` - דורש POST
- כל endpoint שדורש POST/PUT/DELETE

---

## איך לבדוק POST endpoints?

### אופציה 1: Postman (מומלץ)

1. **הורידי Postman:**
   - https://www.postman.com/downloads/
   - או השתמשי ב-Web version

2. **צרי Request חדש:**
   - לחצי **New** → **HTTP Request**
   - בחרי **POST** מהתפריט
   - הזיני URL: `https://your-backend.railway.app/api/internal/skills-engine/update`

3. **הוסיפי Headers:**
   - לחצי על **Headers**
   - הוסיפי:
     - `Content-Type: application/json`
     - `Authorization: Bearer YOUR_SECRET`

4. **הוסיפי Body:**
   - לחצי על **Body**
   - בחרי **raw**
   - בחרי **JSON** מהתפריט
   - הדבקי:
   ```json
   {
     "employee_id": "test-uuid",
     "normalized_skills": []
   }
   ```

5. **שלחי:**
   - לחצי **Send**
   - בדקי את התגובה

### אופציה 2: Thunder Client (VS Code Extension)

1. **התקיני Extension:**
   - פתחי VS Code
   - Extensions (Ctrl+Shift+X)
   - חפשי "Thunder Client"
   - התקיני

2. **צרי Request:**
   - לחצי על אייקון Thunder Client
   - לחצי **New Request**
   - Method: **POST**
   - URL: `https://your-backend.railway.app/api/internal/skills-engine/update`

3. **הוסיפי Headers ו-Body** (כמו ב-Postman)

### אופציה 3: PowerShell/curl

```powershell
curl -X POST https://your-backend.railway.app/api/internal/skills-engine/update `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_SECRET" `
  -d '{\"employee_id\":\"test-uuid\",\"normalized_skills\":[]}'
```

---

## שגיאות נפוצות ופתרונות

### 404 Not Found

**סיבות אפשריות:**
1. ✅ **נורמלי בדפדפן** - דפדפן עושה GET, endpoint דורש POST
2. ❌ URL שגוי - ודאי שה-URL נכון
3. ❌ Route לא רשום - בדקי ב-Railway Logs

**פתרון:**
- השתמשי ב-Postman/Thunder Client
- ודאי שה-Method הוא **POST**
- בדקי ב-Railway Logs שהשרת רץ

### 401 Unauthorized

**סיבה:** חסר או שגוי Authorization header

**פתרון:**
- ודאי שהוספת `Authorization: Bearer YOUR_SECRET`
- ודאי שה-secret נכון (העתיקי מ-Railway Variables)
- ודאי שיש רווח אחרי "Bearer"

### 403 Forbidden

**סיבה:** ה-secret שגוי

**פתרון:**
- בדקי ב-Railway → Settings → Variables את `INTERNAL_API_SECRET`
- ודאי שהעתקת את כל ה-secret (ארוך מאוד)
- נסי להעתיק מחדש

### 400 Bad Request

**סיבה:** ה-Body לא תקין

**פתרון:**
- ודאי שה-Body הוא JSON תקין
- ודאי שיש `employee_id` (או שדות נדרשים אחרים)
- בדקי את ה-syntax של ה-JSON

### 500 Internal Server Error

**סיבה:** שגיאה בשרת

**פתרון:**
- בדקי ב-Railway Logs מה השגיאה
- ודאי שה-Database מחובר
- ודאי שה-Migration הורצה

---

## בדיקות מהירות

### ✅ בדיקה 1: Health Check (עובד בדפדפן)
```
https://your-backend.railway.app/health
```
**צפוי:** `{"status": "ok", ...}`

### ✅ בדיקה 2: API Health Check (עובד בדפדפן)
```
https://your-backend.railway.app/api/health
```
**צפוי:** `{"status": "ok", ...}`

### ❌ בדיקה 3: Internal API (לא עובד בדפדפן - צריך Postman)
```
POST https://your-backend.railway.app/api/internal/skills-engine/update
Headers: Authorization: Bearer SECRET
Body: {"employee_id": "...", "normalized_skills": []}
```

---

## Checklist לבדיקה

- [ ] Health check עובד בדפדפן (`/health`)
- [ ] יש לי Postman או Thunder Client מותקן
- [ ] אני משתמשת ב-**POST** (לא GET)
- [ ] הוספתי `Authorization: Bearer SECRET` header
- [ ] ה-Body הוא JSON תקין
- [ ] ה-URL נכון (החלפתי `your-backend.railway.app`)

---

## תמיכה

אם עדיין יש בעיות:
1. בדקי את Railway Logs
2. בדקי שהמשתנים מוגדרים נכון
3. בדקי שה-Migration הורצה
4. שלחי לי את השגיאה המדויקת

