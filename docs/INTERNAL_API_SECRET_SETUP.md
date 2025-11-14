# 🔐 INTERNAL_API_SECRET - הוראות הגדרה

## ⚠️ אזהרת אבטחה

**ה-secret הזה הוא רגיש מאוד!**
- ❌ אל תשתפי אותו בפומבי
- ❌ אל תעלי אותו ל-GitHub
- ❌ אל תשלחי אותו ב-Email רגיל
- ✅ שתפי רק עם צוותי המיקרוסרבסים שצריכים גישה

---

## שלב 1: הכנסת ה-Secret ל-Railway

### צעד 1: פתיחת Railway
1. לכי ל: https://railway.app
2. בחרי את הפרויקט **Directory Backend**
3. Settings → Variables

### צעד 2: הוספת המשתנה
1. לחצי על **New Variable**
2. מלאי:
   - **Name:** `INTERNAL_API_SECRET`
   - **Value:** העתיקי את ה-secret שקיבלת (המספר הארוך)
3. לחצי **Add**

### צעד 3: בדיקה
- ודאי שהמשתנה מופיע ברשימה
- ודאי שהערך נכון (לחצי על 👁️ כדי לראות)

---

## שלב 2: שימוש ב-Secret

### במיקרוסרבסים אחרים:

כשמיקרוסרבס אחר צריך לשלוח בקשה ל-Directory, הוא צריך להוסיף:

**Header:**
```
Authorization: Bearer <INTERNAL_API_SECRET>
```

**דוגמה (curl):**
```bash
curl -X POST https://directory-backend.railway.app/api/internal/skills-engine/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 48554094218407485206276474392650..." \
  -d '{"employee_id": "...", "normalized_skills": []}'
```

---

## שלב 3: שיתוף עם צוותים

### עם מי לשתף:
- ✅ צוות Skills Engine
- ✅ צוות Course Builder  
- ✅ צוות Content Studio
- ✅ כל מיקרוסרבס שצריך לשלוח עדכונים

### איך לשתף בצורה מאובטחת:

1. **Slack/Discord (ערוץ פרטי):**
   - שלחי בערוץ פרטי או DM
   - הסבירי שזה secret רגיש

2. **Password Manager:**
   - שמרי ב-1Password/LastPass
   - שתפי רק עם הצוותים הרלוונטיים

3. **Encrypted Message:**
   - השתמשי ב-encrypted email או messaging

**❌ אל תשלחי:**
- ב-Email רגיל
- ב-GitHub Issues/Comments
- ב-Chat פומבי

---

## אם ה-Secret נחשף

אם חשדת שהסוד נחשף:

1. **צרי secret חדש:**
   - PowerShell:
     ```powershell
     [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
     ```
   - או באתר: https://www.random.org/strings/

2. **עדכני ב-Railway:**
   - Settings → Variables
   - מצאי `INTERNAL_API_SECRET`
   - Edit → החלפי בערך חדש → Save

3. **עדכני את כל המיקרוסרבסים:**
   - שלחי את ה-secret החדש לכל הצוותים
   - ודאי שכולם מעדכנים את הקוד שלהם

---

## בדיקת תקינות

### בדיקה 1: דרך Postman
1. פתחי Postman
2. Method: **POST**
3. URL: `https://your-backend.railway.app/api/internal/skills-engine/update`
4. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer <YOUR_SECRET>`
5. Body:
   ```json
   {
     "employee_id": "test-uuid",
     "normalized_skills": []
   }
   ```
6. Send

**אם מקבלת 200 OK = Secret תקין ✅**  
**אם מקבלת 403 Forbidden = Secret שגוי ❌**

---

## שאלות נפוצות

**Q: מה אם שכחתי את ה-secret?**  
A: לכי ל-Railway → Settings → Variables → לחצי על 👁️ ליד `INTERNAL_API_SECRET`

**Q: כמה זמן ה-secret תקף?**  
A: אין תאריך תפוגה, אבל מומלץ להחליף כל 6-12 חודשים

**Q: האם כל המיקרוסרבסים משתמשים באותו secret?**  
A: כן, כרגע יש secret אחד משותף. בעתיד אפשר יהיה ליצור secret נפרד לכל מיקרוסרבס.

---

**זכרי:** ה-secret הזה הוא המפתח לגישה ל-Internal API. שמרי עליו בטוח! 🔐

