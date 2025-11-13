# פתרון: 404 ב-Vercel עבור React Router Routes

## הבעיה

כשנכנסים ל-`https://directory-project-bice.vercel.app/profile` מקבלים 404:
```
Page Not Found
The page you're looking for doesn't exist or has been moved.
```

## הסיבה

Vercel צריך לדעת איך לטפל ב-React Router routes. בלי קובץ `vercel.json`, כל route שלא קיים ב-build יחזיר 404.

## הפתרון

נוצר קובץ `frontend/vercel.json` שמגדיר rewrite rules:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

זה אומר ל-Vercel: "כל route שלא קיים, תעביר ל-`index.html`" (שם React Router לוקח שליטה).

## מה לעשות עכשיו?

1. **הקובץ כבר נוצר** - `frontend/vercel.json`
2. **Push ל-GitHub:**
   ```bash
   git add frontend/vercel.json
   git commit -m "Add vercel.json for React Router support"
   git push
   ```
3. **Vercel יבנה מחדש אוטומטית** - זה ייקח 2-3 דקות
4. **בדוק שוב:**
   - `https://directory-project-bice.vercel.app/profile`
   - אמור לעבוד עכשיו!

## הערה על Employee ID

אם אתה רואה הודעת שגיאה על "Please set an employee ID", זה אומר שה-route עובד אבל צריך employee ID.

**לבדיקה:**
1. פתח את ה-Console בדפדפן (F12)
2. הרץ:
   ```javascript
   localStorage.setItem("currentEmployeeId", "your-employee-uuid-here")
   ```
3. רענן את הדף

**איך למצוא Employee UUID?**
- אחרי company registration, ה-employee ID נשמר ב-database
- אפשר לבדוק ב-Supabase או להשתמש ב-UUID של employee מהרישום

---

**תאריך עדכון:** 2025-01-11

