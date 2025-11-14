# 🚀 Quick Test URLs - Directory Production

## Backend URL
**Base URL:** `https://directoryproject-production.up.railway.app`

---

## ✅ Health Checks (עובד בדפדפן)

### Health Check 1:
```
https://directoryproject-production.up.railway.app/health
```

### Health Check 2:
```
https://directoryproject-production.up.railway.app/api/health
```

**צפוי:** `{"status": "ok", "timestamp": "...", "service": "directory-backend"}`

---

## 🔄 Exchange Endpoint (דורש POST - Postman/curl)

**⚠️ חשוב:** לא ניתן לבדוק את זה בדפדפן!
- דפדפן עושה **GET** request
- ה-endpoint דורש **POST** request
- אם תנסי בדפדפן, תקבלי: `{"success":false,"error":"Not Found","message":"Route GET /api/exchange not found"}`

**זה נורמלי!** השתמשי ב-Postman/Thunder Client.

### URL:
```
https://directoryproject-production.up.railway.app/api/exchange
```

### Postman/Thunder Client:
- **Method:** POST
- **URL:** `https://directoryproject-production.up.railway.app/api/exchange`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "requester_service": "SkillsEngine",
  "payload": "{\"employee_id\":\"test-id\",\"fields\":[\"competencies\"]}"
}
```

### PowerShell:
```powershell
curl -X POST https://directoryproject-production.up.railway.app/api/exchange -H "Content-Type: application/json" -d "{\"requester_service\":\"SkillsEngine\",\"payload\":\"{\\\"employee_id\\\":\\\"test-id\\\",\\\"fields\\\":[\\\"competencies\\\"]}\"}"
```

---

## 🔐 Internal API Endpoints (דורש POST + Authentication)

**⚠️ חשוב:** לא ניתן לבדוק את זה בדפדפן!
- דפדפן עושה **GET** request
- ה-endpoints דורשים **POST** request
- ה-endpoints דורשים **Authorization header**
- אם תנסי בדפדפן, תקבלי: `{"success":false,"error":"Missing or invalid Authorization header"}`

**זה נורמלי!** השתמשי ב-Postman/Thunder Client.

### Skills Engine Update:
```
POST https://directoryproject-production.up.railway.app/api/internal/skills-engine/update
```

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer YOUR_INTERNAL_API_SECRET` (החלפי ב-secret האמיתי מ-Railway)

**Body (raw JSON):**
```json
{
  "employee_id": "valid-uuid-here",
  "normalized_skills": []
}
```

**תגובות אפשריות:**
- ✅ `200 OK` + `{"success": true, "message": "Skills updated successfully"}` = הכל עובד!
- ❌ `401 Unauthorized` = חסר Authorization header
- ❌ `403 Forbidden` = ה-secret שגוי
- ❌ `404 Not Found` = בדפדפן (נורמלי - צריך POST)

### Content Studio Update:
```
POST https://directoryproject-production.up.railway.app/api/internal/content-studio/update
```

### Course Builder Feedback:
```
POST https://directoryproject-production.up.railway.app/api/internal/course-builder/feedback
```

---

## 📝 Frontend URL (Vercel)

**להגדיר ב-Vercel Environment Variables:**
```
REACT_APP_API_URL=https://directoryproject-production.up.railway.app/api
```

---

## 🧪 Quick Test Checklist

### בדפדפן (GET requests):
- [x] ✅ Health check עובד: `/health` - **עובד!**
- [x] ✅ API health check עובד: `/api/health` - **עובד!**

### ב-Postman/Thunder Client (POST requests):
- [ ] Exchange endpoint עובד (Postman - POST request)
- [ ] Internal API מחזיר 401 ללא Authorization header (נורמלי)
- [ ] Internal API מחזיר 403 עם secret שגוי (נורמלי)
- [ ] Internal API עובד עם secret תקין (200 OK)

**⚠️ זכרי:** דפדפן לא יכול לבדוק POST endpoints. זה נורמלי לקבל שגיאות בדפדפן!

---

**כל ה-URLs מוכנים לשימוש!** 🎉

