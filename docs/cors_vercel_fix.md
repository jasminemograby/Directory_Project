# Fix: CORS Errors with Vercel Preview URLs

## הבעיה

ה-frontend לא יכול לגשת ל-backend בגלל CORS errors, במיוחד ב-preview URLs של Vercel.

## מה תוקן

1. **Vercel Preview URLs Support** - עכשיו כל ה-Vercel preview URLs מורשים אוטומטית
2. **HR Email Storage** - ה-HR email נשמר ב-localStorage גם ב-Step 4
3. **Better CORS Logging** - הוספתי logging מפורט ל-CORS errors

## מה לעשות עכשיו

1. **ב-Railway** - וודא שה-`CORS_ORIGIN` כולל את ה-production URL:
   ```
   https://directory-project-bice.vercel.app
   ```

2. **המתן 2-3 דקות** ל-Railway לבנות מחדש

3. **נסה שוב** - עכשיו זה אמור לעבוד גם ב-preview URLs

## אם עדיין יש בעיה

1. **בדוק את ה-logs ב-Railway** - חפש:
   - `[CORS] Allowing Vercel preview URL: ...`
   - `[CORS] Blocked origin: ...`

2. **בדוק את ה-CORS_ORIGIN ב-Railway** - וודא שהוא מוגדר נכון

3. **נקה את ה-localStorage** - נסה למחוק את ה-localStorage ולנסות שוב

