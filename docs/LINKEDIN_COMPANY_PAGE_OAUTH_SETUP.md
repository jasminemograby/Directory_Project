# LinkedIn Company Page OAuth Setup Guide - שלב אחרי שלב

## סקירה כללית

מדריך זה מסביר איך להגדיר LinkedIn OAuth עם Company Page כדי לאפשר "Sign in with LinkedIn using OpenID Connect" באפליקציה.

## דרישות מוקדמות

1. חשבון LinkedIn עם גישה ל-Company Page
2. גישה ל-LinkedIn Developer Portal
3. Company Page מאומת ב-LinkedIn

---

## שלב 1: יצירת LinkedIn OAuth App

### 1.1 כניסה ל-LinkedIn Developer Portal

1. לך ל: https://www.linkedin.com/developers/apps
2. התחבר עם חשבון LinkedIn שיש לו גישה ל-Company Page
3. לחץ על **"Create app"**

### 1.2 מילוי פרטי האפליקציה

**App Name:**
```
Directory Project - Employee Profiles
```

**LinkedIn Page:**
- בחר את ה-Company Page שלך מהרשימה
- **חשוב:** אם אין לך Company Page, צריך ליצור אחד קודם ב-LinkedIn

**App Logo:**
- העלה לוגו (אופציונלי, אבל מומלץ)
- גודל: 100x100px, פורמט: PNG/JPG

**App Usage:**
- בחר: **"Sign in with LinkedIn using OpenID Connect"**

**Developer Contact Email:**
- הכנס את האימייל שלך

**Privacy Policy URL:**
- הכנס קישור למדיניות פרטיות (אם יש)
- או: `https://your-domain.com/privacy`

**Terms of Service URL:**
- הכנס קישור לתנאי שירות (אם יש)
- או: `https://your-domain.com/terms`

**App Type:**
- בחר: **"Web application"**

### 1.3 שמירה ואישור

1. לחץ **"Create app"**
2. תצטרך לאשר את התנאים
3. לחץ **"Agree and create"**

---

## שלב 2: הגדרת OAuth 2.0 Settings

### 2.1 כניסה ל-Auth Settings

1. באפליקציה שיצרת, לך לטאב **"Auth"**
2. תחת **"OAuth 2.0 settings"**

### 2.2 הוספת Redirect URLs

**Production URL:**
```
https://directoryproject-production.up.railway.app/api/external/linkedin/callback
```

**Development URL (אם יש):**
```
http://localhost:5000/api/external/linkedin/callback
```

**איך להוסיף:**
1. לחץ **"Add redirect URL"**
2. הכנס את ה-URL
3. לחץ **"Update"**
4. חזור על הפעולה לכל URL

### 2.3 בחירת Scopes (הרשאות)

תחת **"Products"**, ודא שיש לך:

✅ **Sign In with LinkedIn using OpenID Connect**
- זה יאפשר את ה-scopes הבאים:
  - `openid` - OpenID Connect
  - `profile` - מידע פרופיל (שם, תמונה)
  - `email` - כתובת אימייל

**חשוב:** LinkedIn deprecated את ה-scopes הישנים:
- ❌ `r_liteprofile` (deprecated)
- ❌ `r_basicprofile` (deprecated)
- ❌ `r_emailaddress` (deprecated)

**אנחנו משתמשים רק ב-OpenID Connect scopes!**

### 2.4 שמירה

1. לחץ **"Update"** בתחתית הדף
2. תצטרך לאשר שוב

---

## שלב 3: קבלת Client ID ו-Client Secret

### 3.1 מציאת ה-Credentials

1. בטאב **"Auth"**
2. תחת **"Application credentials"**

תראה:
- **Client ID** - זה ה-Client ID שלך
- **Client Secret** - לחץ **"Show"** כדי לראות אותו

### 3.2 העתקת ה-Credentials

**Client ID:**
```
העתק את ה-Client ID (נראה כמו: 86abc123def456)
```

**Client Secret:**
```
העתק את ה-Client Secret (נראה כמו: ABC123def456GHI789)
```

**⚠️ חשוב:** שמור את ה-Client Secret במקום בטוח! אל תשתף אותו בפומבי!

---

## שלב 4: הגדרת Environment Variables ב-Railway

### 4.1 כניסה ל-Railway

1. לך ל: https://railway.app
2. בחר את הפרויקט שלך
3. בחר את ה-Service (Backend)

### 4.2 הוספת Variables

1. לך ל-**"Variables"** בתפריט
2. לחץ **"New Variable"**

**הוסף את המשתנים הבאים:**

**1. LINKEDIN_CLIENT_ID**
```
Name: LINKEDIN_CLIENT_ID
Value: [הדבק את ה-Client ID מהשלב הקודם]
```

**2. LINKEDIN_CLIENT_SECRET**
```
Name: LINKEDIN_CLIENT_SECRET
Value: [הדבק את ה-Client Secret מהשלב הקודם]
```

**3. LINKEDIN_REDIRECT_URI (אופציונלי)**
```
Name: LINKEDIN_REDIRECT_URI
Value: https://directoryproject-production.up.railway.app/api/external/linkedin/callback
```

**הערה:** אם לא תגדיר את `LINKEDIN_REDIRECT_URI`, הקוד יבנה אותו אוטומטית מ-`BACKEND_URL`.

### 4.3 שמירה

1. לחץ **"Add"** לכל משתנה
2. Railway יבצע deploy אוטומטי

---

## שלב 5: בדיקה שהכל עובד

### 5.1 בדיקת ה-Redirect URL

1. לך ל-LinkedIn Developer Portal
2. בטאב **"Auth"**
3. ודא שה-Redirect URL מופיע ברשימה:
   ```
   https://directoryproject-production.up.railway.app/api/external/linkedin/callback
   ```

### 5.2 בדיקת ה-Scopes

1. ודא שיש לך **"Sign In with LinkedIn using OpenID Connect"** מופעל
2. זה יאפשר את ה-scopes: `openid`, `profile`, `email`

### 5.3 בדיקה באפליקציה

1. לך לפרופיל עובד
2. לחץ **"Connect LinkedIn"**
3. אמור להיפתח חלון LinkedIn
4. אשר את ההרשאות
5. אמור לחזור לאפליקציה עם "LinkedIn connected successfully!"

---

## שלב 6: טיפול בשגיאות נפוצות

### שגיאה: "Invalid redirect_uri"

**סיבה:** ה-Redirect URL לא תואם למה שהוגדר ב-LinkedIn Developer Portal.

**פתרון:**
1. לך ל-LinkedIn Developer Portal → Auth
2. ודא שה-Redirect URL זהה בדיוק (כולל https/http)
3. ודא שאין רווחים או תווים מיותרים

### שגיאה: "Invalid client_id or client_secret"

**סיבה:** ה-Credentials לא נכונים או לא הוגדרו ב-Railway.

**פתרון:**
1. בדוק ב-Railway Variables שיש `LINKEDIN_CLIENT_ID` ו-`LINKEDIN_CLIENT_SECRET`
2. ודא שהערכים נכונים (ללא רווחים)
3. ודא ש-Railway ביצע deploy אחרי הוספת המשתנים

### שגיאה: "Bummer, something went wrong"

**סיבה:** LinkedIn deprecated את ה-scopes הישנים.

**פתרון:**
1. ודא שאתה משתמש ב-OpenID Connect scopes:
   - `openid`
   - `profile`
   - `email`
2. אל תשתמש ב-scopes הישנים: `r_liteprofile`, `r_basicprofile`, `r_emailaddress`

### שגיאה: "Company Page not verified"

**סיבה:** ה-Company Page לא מאומת ב-LinkedIn.

**פתרון:**
1. לך ל-LinkedIn Company Page
2. ודא שהדף מאומת (יש סימן ✓)
3. אם לא, צריך לאמת את הדף קודם

---

## שלב 7: בדיקת המידע שנשלף

### 7.1 מה LinkedIn מחזיר

לאחר התחברות מוצלחת, LinkedIn מחזיר:

**Profile Information:**
- שם מלא
- תמונה
- אימייל
- כותרת מקצועית (headline)
- מיקום (location)

**Experience (אם יש גישה):**
- חברות קודמות
- תפקידים
- תאריכים
- תיאורים

**Education:**
- מוסדות לימוד
- תארים
- תאריכים

### 7.2 איך לבדוק

1. לך לפרופיל עובד
2. לחץ **"Fetch Data"** (אם יש כפתור כזה)
3. או: המידע יישלף אוטומטית אחרי התחברות

---

## סיכום

✅ יצרת LinkedIn OAuth App עם Company Page
✅ הגדרת Redirect URLs
✅ הוספת Client ID ו-Client Secret ל-Railway
✅ בדקת שהכל עובד

**הבא:** עכשיו LinkedIn יהיה חובה, ואחריו GitHub, ואז המידע יישלח אוטומטית ל-Gemini לעיבוד.

---

## קישורים שימושיים

- LinkedIn Developer Portal: https://www.linkedin.com/developers/apps
- LinkedIn OAuth Documentation: https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication
- OpenID Connect Documentation: https://openid.net/connect/

---

## הערות חשובות

1. **Company Page חובה:** כדי להשתמש ב-LinkedIn OAuth עם Company Page, צריך Company Page מאומת
2. **OpenID Connect:** LinkedIn עבר ל-OpenID Connect - אל תשתמש ב-scopes הישנים
3. **Security:** שמור את ה-Client Secret במקום בטוח - אל תשתף אותו בפומבי
4. **Testing:** בדוק תחילה בסביבת Development לפני Production

