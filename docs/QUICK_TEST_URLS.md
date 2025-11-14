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

### Skills Engine Update:
```
POST https://directoryproject-production.up.railway.app/api/internal/skills-engine/update
```

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer YOUR_INTERNAL_API_SECRET`

**Body:**
```json
{
  "employee_id": "valid-uuid-here",
  "normalized_skills": []
}
```

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

- [ ] Health check עובד: `/health`
- [ ] API health check עובד: `/api/health`
- [ ] Exchange endpoint עובד (Postman)
- [ ] Internal API דורש authentication (401 ללא secret)
- [ ] Internal API עובד עם secret תקין (200 OK)

---

**כל ה-URLs מוכנים לשימוש!** 🎉

