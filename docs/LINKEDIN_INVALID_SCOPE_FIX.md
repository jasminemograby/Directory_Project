# פתרון בעיית invalid_scope_error ב-LinkedIn OAuth

## הבעיה

אם אתה מקבל שגיאה `invalid_scope_error` עם ההודעה:
```
The requested permission scope is not valid
```

זה אומר שה-LinkedIn App שלך לא מוגדר נכון.

## הפתרון

### שלב 1: בדוק שה-Product מופעל

1. לך ל-[LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. בחר את ה-App שלך (`Directory Project - Employee Profiles`)
3. לך לטאב **"Products"**
4. ודא שיש לך **"Sign In with LinkedIn using OpenID Connect"** מופעל

**אם אין לך את ה-Product הזה:**
1. לחץ על **"Request access"** או **"Add product"**
2. בחר **"Sign In with LinkedIn using OpenID Connect"**
3. לחץ **"Request"** או **"Add"**
4. LinkedIn יאשר את זה מיד (אין צורך באישור מיוחד)

### שלב 2: בדוק את ה-Redirect URLs

1. לך לטאב **"Auth"**
2. תחת **"OAuth 2.0 settings"**
3. ודא שיש לך את ה-Redirect URL הבא:
   ```
   https://directoryproject-production.up.railway.app/api/external/linkedin/callback
   ```
4. **חשוב:** ה-URL חייב להיות **בדיוק** כמו שכתוב (ללא `/` בסוף, עם `https://`)

### שלב 3: בדוק את ה-Client ID ו-Client Secret

1. לך לטאב **"Auth"**
2. תחת **"Application credentials"**
3. ודא שיש לך:
   - **Client ID** (לדוגמה: `REMOVED_CLIENT_ID`)
   - **Client Secret** (לדוגמה: `REMOVED_SECRET`)

### שלב 4: ודא שהמשתנים ב-Railway נכונים

1. לך ל-Railway Dashboard
2. בחר את ה-Service (Backend)
3. לך ל-**"Variables"**
4. ודא שיש:
   - `LINKEDIN_CLIENT_ID` = ה-Client ID שלך (לדוגמה: `REMOVED_CLIENT_ID`)
   - `LINKEDIN_CLIENT_SECRET` = ה-Client Secret שלך (העתק מ-LinkedIn Developer Portal)
   - `LINKEDIN_REDIRECT_URI` = `https://directoryproject-production.up.railway.app/api/external/linkedin/callback`
   
   **⚠️ חשוב:** אל תשלח את ה-Client Secret בפומבי! רק העתק אותו ל-Railway Variables.

### שלב 5: בדוק את ה-App Status

1. לך לטאב **"Settings"**
2. ודא שה-App Status הוא **"Live"** (לא "Development" או "Restricted")
3. אם ה-App ב-Development mode, רק משתמשים מורשים יכולים להתחבר

## בדיקה מהירה

אחרי שתעשה את כל השלבים:

1. נסה להתחבר ל-LinkedIn מהאפליקציה
2. בדוק את הלוגים ב-Railway - צריך לראות:
   ```
   [LinkedIn] Generating authorization URL with scopes: openid profile email
   [LinkedIn] Scopes count: 3
   ```
3. אם עדיין יש שגיאה, בדוק את ה-LinkedIn Developer Portal שוב

## שגיאות נפוצות

### שגיאה: "The requested permission scope is not valid"
**פתרון:** ודא ש-"Sign In with LinkedIn using OpenID Connect" מופעל ב-Products

### שגיאה: "redirect_uri_mismatch"
**פתרון:** ודא שה-Redirect URL ב-LinkedIn Developer Portal תואם בדיוק ל-URL ב-Railway

### שגיאה: "invalid_client"
**פתרון:** ודא שה-Client ID ו-Client Secret ב-Railway נכונים

## אם עדיין לא עובד

1. בדוק את הלוגים ב-Railway - מה ה-scopes שנשלחים?
2. בדוק את ה-LinkedIn Developer Portal - מה ה-Products שמופעלים?
3. נסה ליצור App חדש ב-LinkedIn (אם כלום לא עובד)

## קישורים שימושיים

- [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
- [LinkedIn OAuth Documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [OpenID Connect Documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication#openid-connect)

