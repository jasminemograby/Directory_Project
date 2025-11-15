# יצירת Company Page ב-LinkedIn - מדריך שלב אחרי שלב

## סקירה כללית

לפני שיוצרים LinkedIn OAuth App, צריך Company Page ב-LinkedIn. מדריך זה מסביר איך ליצור Company Page.

---

## שלב 1: כניסה ל-LinkedIn

1. לך ל: https://www.linkedin.com
2. התחבר עם חשבון LinkedIn שלך
3. ודא שיש לך חשבון Premium או Business (אם נדרש)

---

## שלב 2: יצירת Company Page

### 2.1 כניסה ל-Company Pages

1. לחץ על **"Work"** בתפריט העליון (או **"עבודה"** בעברית)
2. בחר **"Create a Company Page"** (או **"צור דף חברה"**)

**או:**

1. לך ישירות ל: https://www.linkedin.com/company/create
2. התחבר אם נדרש

### 2.2 בחירת סוג דף

LinkedIn מציע 3 סוגי דפים:

1. **Small business** - לחברות קטנות (עד 200 עובדים)
2. **Medium to large business** - לחברות בינוניות וגדולות
3. **Showcase page** - דף תצוגה (לא מתאים לנו)

**בחר:** **Small business** או **Medium to large business** (תלוי בגודל החברה שלך)

### 2.3 מילוי פרטי החברה

**⚠️ חשוב:** אם אין לך חברה אמיתית, אפשר להשתמש במידע דמה/זמני. LinkedIn דורש Company Page ל-OAuth Apps, אבל אפשר ליצור דף עם מידע זמני.

**Company Name (שם החברה):**
```
אם אין לך חברה אמיתית, השתמש בשם דמה:
לדוגמה: "My Development Company" או "Test Company" או "Personal Projects"
```

**LinkedIn Address (כתובת LinkedIn):**
```
LinkedIn יציע כתובת אוטומטית לפי שם החברה
לדוגמה: linkedin.com/company/my-development-company
אפשר להשתמש בהצעה האוטומטית או לשנות
```

**Website (אתר):**
```
אם אין לך אתר, השתמש באחד מהאופציות:
1. אתר אישי שלך (אם יש)
2. GitHub profile: "https://github.com/yourusername"
3. LinkedIn profile: "https://www.linkedin.com/in/yourprofile"
4. או כל URL תקין: "https://example.com"
```

**Industry (תעשייה):**
```
בחר מהרשימה את התעשייה המתאימה
אם לא בטוח, בחר: "Technology, Information and Internet"
או "Computer Software" או "Information Services"
```

**Company Size (גודל החברה):**
```
בחר את גודל החברה
אם אין חברה אמיתית, בחר: "1-10 employees" או "Self-employed"
```

**Company Type (סוג החברה):**
```
בחר את סוג החברה
אם אין חברה אמיתית, בחר: "Privately Held" או "Sole Proprietorship"
```

**Description (תיאור):**
```
אם אין לך חברה אמיתית, כתוב תיאור כללי:
לדוגמה: "Personal development and professional projects" 
או "Software development and technology consulting"
או "Individual developer working on various projects"
```

### 2.4 הוספת לוגו ותמונת כותרת

**Company Logo (לוגו):**
- העלה לוגו של החברה
- גודל מומלץ: 300x300px
- פורמט: PNG או JPG
- רקע: שקוף או לבן

**Cover Image (תמונת כותרת):**
- העלה תמונת כותרת
- גודל מומלץ: 1128x191px
- פורמט: PNG או JPG

**הערה:** אפשר לדלג על זה עכשיו ולהוסיף אחר כך.

### 2.5 אישור ויצירה

1. קרא את התנאים והמדיניות
2. סמן את התיבה **"I agree to LinkedIn's Terms of Service"**
3. לחץ **"Create page"** (או **"צור דף"**)

---

## שלב 3: אימות Company Page

### 3.1 אימות דומיין (אופציונלי - אפשר לדלג)

LinkedIn יבקש לאמת את הדומיין של החברה, אבל **זה לא חובה!**

**אם יש לך אתר:**
1. LinkedIn יציע לך להוסיף קובץ HTML או meta tag לאתר שלך
2. בחר את השיטה הנוחה לך:
   - **HTML File Upload** - העלה קובץ HTML לשרת
   - **Meta Tag** - הוסף meta tag ל-`<head>` של האתר

**דוגמה ל-Meta Tag:**
```html
<meta name="linkedin-verification" content="YOUR_VERIFICATION_CODE" />
```

**או קובץ HTML:**
```
linkedin_verification_XXXXX.html
```

**אם אין לך אתר (או לא רוצה לאמת):**
1. **פשוט דלג על האימות** - לחץ **"Skip"** או **"Skip verification"**
2. הדף יווצר גם בלי אימות
3. זה לא ימנע ממך ליצור OAuth App

**הערה:** אימות דומיין הוא אופציונלי. אם אין לך אתר או לא רוצה לאמת, אפשר לדלג על זה בלי בעיה.

---

## שלב 4: הגדרת Company Page

### 4.1 הוספת פרטים נוספים (אופציונלי)

1. לך ל-Company Page שיצרת
2. לחץ **"Edit page"** (או **"ערוך דף"**)
3. הוסף פרטים נוספים (אפשר לדלג על הכל):
   - **Location** - מיקום (אופציונלי)
   - **Phone** - טלפון (אופציונלי)
   - **Email** - אימייל (אופציונלי)
   - **Founded** - שנת הקמה (אופציונלי)
   - **Specialties** - התמחויות (אופציונלי)

**הערה:** אם אין לך חברה אמיתית, אפשר לדלג על כל השדות האלה. הם לא חובה.

### 4.2 פרסום דף

1. ודא שכל הפרטים החובה מלאים (שם, תעשייה, גודל, סוג)
2. לחץ **"Publish"** (או **"פרסם"**)
3. הדף יפורסם ויהיה זמין

**⚠️ חשוב:** גם אם השתמשת במידע דמה, הדף יפורסם ויהיה זמין ליצירת OAuth App.

---

## שלב 5: בדיקה שהדף מוכן

### 5.1 בדיקות

1. ודא שהדף פורסם (לא בטיוטה)
2. ודא שיש לוגו ותמונת כותרת (אופציונלי)
3. ודא שהדף מאומת (אם עשית אימות)

### 5.2 גישה ל-Developer Portal

1. לך ל: https://www.linkedin.com/developers/apps
2. ודא שאתה מחובר עם אותו חשבון שיצר את ה-Company Page
3. אתה אמור לראות את ה-Company Page ברשימה

---

## שלב 6: יצירת OAuth App חדש

### 6.1 יצירת App

1. לחץ **"Create app"**
2. מילוי פרטים:

**App Name:**
```
Directory Project - Employee Profiles
```

**LinkedIn Page:**
- **חשוב:** בחר את ה-Company Page שיצרת מהרשימה
- אם לא רואה את הדף, ודא שאתה מחובר עם אותו חשבון

**App Logo:**
- העלה לוגו (אופציונלי)
- גודל: 100x100px

**App Usage:**
- בחר: **"Sign in with LinkedIn using OpenID Connect"**

**Developer Contact Email:**
- הכנס את האימייל שלך

**Privacy Policy URL:**
- הכנס קישור למדיניות פרטיות
- או: `https://your-domain.com/privacy`

**Terms of Service URL:**
- הכנס קישור לתנאי שירות
- או: `https://your-domain.com/terms`

**App Type:**
- בחר: **"Web application"**

### 6.2 שמירה

1. לחץ **"Create app"**
2. תצטרך לאשר את התנאים
3. לחץ **"Agree and create"**

---

## שלב 7: הגדרת OAuth 2.0

### 7.1 Redirect URLs

1. בטאב **"Auth"**
2. תחת **"OAuth 2.0 settings"**
3. הוסף Redirect URLs:

**Production:**
```
https://directoryproject-production.up.railway.app/api/external/linkedin/callback
```

**Development (אם יש):**
```
http://localhost:5000/api/external/linkedin/callback
```

### 7.2 Scopes

תחת **"Products"**, ודא שיש:

✅ **Sign In with LinkedIn using OpenID Connect**

זה יאפשר:
- `openid`
- `profile`
- `email`

### 7.3 Client ID ו-Client Secret

1. בטאב **"Auth"**
2. תחת **"Application credentials"**
3. העתק:
   - **Client ID**
   - **Client Secret** (לחץ "Show")

---

## שלב 8: הוספת Credentials ל-Railway

1. לך ל-Railway: https://railway.app
2. בחר את הפרויקט
3. לך ל-**"Variables"**
4. הוסף:

**LINKEDIN_CLIENT_ID:**
```
[הדבק את ה-Client ID]
```

**LINKEDIN_CLIENT_SECRET:**
```
[הדבק את ה-Client Secret]
```

**LINKEDIN_REDIRECT_URI (אופציונלי):**
```
https://directoryproject-production.up.railway.app/api/external/linkedin/callback
```

---

## טיפול בשגיאות נפוצות

### שגיאה: "You don't have permission to create a Company Page"

**פתרון:**
1. ודא שיש לך חשבון LinkedIn פעיל
2. ודא שיש לך לפחות חיבור אחד (connection)
3. נסה ליצור דף דרך: https://www.linkedin.com/company/create
4. אם עדיין לא עובד, נסה ליצור חשבון LinkedIn Business (חינם)

### שגיאה: "Website URL is required"

**פתרון:**
- השתמש ב-URL תקין, גם אם זה לא אתר אמיתי
- אפשר להשתמש ב-GitHub profile: `https://github.com/yourusername`
- או LinkedIn profile: `https://www.linkedin.com/in/yourprofile`
- או כל URL תקין: `https://example.com`

### שאלה: "אבל אין לי חברה אמיתית!"

**תשובה:**
- זה בסדר! LinkedIn דורש Company Page ל-OAuth Apps, אבל אפשר ליצור דף עם מידע דמה
- השתמש בשם דמה, URL כללי, ותיאור כללי
- הדף יפורסם ויהיה זמין ליצירת OAuth App
- זה לא ישפיע על היכולת לשלוף מידע מ-LinkedIn

### שגיאה: "Company Page not found in app creation"

**פתרון:**
1. ודא שאתה מחובר עם אותו חשבון שיצר את ה-Company Page
2. ודא שה-Company Page פורסם (לא בטיוטה)
3. נסה לרענן את הדף

### שגיאה: "Domain verification failed"

**פתרון:**
1. ודא שהוספת את הקובץ/תג לאתר
2. ודא שהקובץ נגיש דרך: `https://your-domain.com/linkedin_verification_XXXXX.html`
3. נסה שוב אחרי כמה דקות

---

## סיכום

✅ יצרת Company Page ב-LinkedIn
✅ אימתת את הדומיין (אופציונלי אבל מומלץ)
✅ יצרת OAuth App חדש עם Company Page
✅ הגדרת Redirect URLs ו-Scopes
✅ הוספת Credentials ל-Railway

**הבא:** עכשיו LinkedIn OAuth אמור לעבוד עם Company Page!

---

## קישורים שימושיים

- יצירת Company Page: https://www.linkedin.com/company/create
- LinkedIn Developer Portal: https://www.linkedin.com/developers/apps
- מדריך OAuth Setup: `docs/LINKEDIN_COMPANY_PAGE_OAUTH_SETUP.md`

