# בדיקת הגדרת LinkedIn OAuth - רשימת בדיקה

## ✅ מה שכבר עשית

1. ✅ יצרת Company Page: `educoredirectory`
2. ✅ יצרת OAuth App: `Directory Project - Employee Profiles`
3. ✅ קיבלת Client ID (שמור אותו במקום בטוח)
4. ✅ קיבלת Client Secret (שמור אותו במקום בטוח - אל תשתף!)
5. ✅ הוספת משתנים ל-Railway

---

## 🔍 מה צריך לבדוק עכשיו

### 1. בדיקת Redirect URLs ב-LinkedIn Developer Portal

1. לך ל: https://www.linkedin.com/developers/apps
2. בחר את ה-App: **"Directory Project - Employee Profiles"**
3. לך לטאב **"Auth"**
4. תחת **"OAuth 2.0 settings"**, ודא שיש Redirect URL:

```
https://directoryproject-production.up.railway.app/api/external/linkedin/callback
```

**אם אין:**
1. לחץ **"Add redirect URL"**
2. הכנס: `https://directoryproject-production.up.railway.app/api/external/linkedin/callback`
3. לחץ **"Update"**

---

### 2. בדיקת Scopes (הרשאות)

תחת **"Products"**, ודא שיש:

✅ **Sign In with LinkedIn using OpenID Connect**
- זה יאפשר: `openid`, `profile`, `email`

✅ **Share on LinkedIn** (אופציונלי - לנסיון תעסוקתי)
- זה יאפשר: `w_member_social`
- **הערה:** זה דורש אישור מ-LinkedIn (יכול לקחת כמה ימים)

**אם אין "Share on LinkedIn":**
1. לחץ **"Request access"** ליד **"Share on LinkedIn"**
2. מלא את הטופס (אופציונלי - הקוד יעבוד גם בלי זה)

---

### 3. בדיקת Environment Variables ב-Railway

1. לך ל: https://railway.app
2. בחר את הפרויקט
3. בחר את ה-Service (Backend)
4. לך ל-**"Variables"**
5. ודא שיש:

**LINKEDIN_CLIENT_ID:**
```
[הדבק את ה-Client ID שלך]
```

**LINKEDIN_CLIENT_SECRET:**
```
[הדבק את ה-Client Secret שלך]
⚠️ אל תשתף את ה-Secret בפומבי!
```

**LINKEDIN_REDIRECT_URI (אופציונלי):**
```
https://directoryproject-production.up.railway.app/api/external/linkedin/callback
```

**אם חסר משתנה:**
1. לחץ **"New Variable"**
2. הכנס את השם והערך
3. לחץ **"Add"**

---

### 4. Privacy Policy URL (אופציונלי אבל מומלץ)

LinkedIn לא דורש Privacy Policy URL, אבל זה מומלץ.

**אם תרצה להוסיף:**
1. לך ל-LinkedIn Developer Portal → App → **"Settings"**
2. תחת **"Privacy Policy URL"**, הכנס:
   - `https://your-domain.com/privacy`
   - או כל URL תקין (אפשר גם לדלג)

---

### 5. בדיקה שהכל עובד

1. **ודא ש-Railway ביצע deploy** אחרי הוספת המשתנים
2. לך לפרופיל עובד באפליקציה
3. לחץ **"Connect LinkedIn"**
4. אמור להיפתח חלון LinkedIn
5. אשר את ההרשאות
6. אמור לחזור לאפליקציה עם "LinkedIn connected successfully!"

---

## 🐛 טיפול בשגיאות

### שגיאה: "Invalid redirect_uri"

**פתרון:**
1. ודא שה-Redirect URL ב-LinkedIn זהה בדיוק ל-URL ב-Railway
2. ודא שאין רווחים או תווים מיותרים
3. ודא שזה `https://` (לא `http://`)

### שגיאה: "Invalid client_id or client_secret"

**פתרון:**
1. בדוק ב-Railway Variables שהערכים נכונים
2. ודא שאין רווחים לפני/אחרי הערכים
3. ודא ש-Railway ביצע deploy

### שגיאה: "Bummer, something went wrong"

**פתרון:**
1. ודא שאתה משתמש ב-OpenID Connect scopes
2. ודא שה-Company Page פורסם (לא בטיוטה)
3. נסה להתחבר מחדש

---

## ✅ סיכום

אחרי שתסיים את כל הבדיקות:
- ✅ Redirect URL מוגדר
- ✅ Scopes נכונים
- ✅ Environment Variables ב-Railway
- ✅ Railway ביצע deploy

**הכל אמור לעבוד!** 🎉

נסה להתחבר ל-LinkedIn מהאפליקציה ותראה אם זה עובד.

