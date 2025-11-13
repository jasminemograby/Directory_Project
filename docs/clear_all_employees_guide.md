# מדריך למחיקת כל העובדים

## שימוש ב-Script

יש script חדש `backend/scripts/clear-all-employees.js` שמוחק את כל העובדים מה-database.

### איך להשתמש:

```bash
cd backend
node scripts/clear-all-employees.js --confirm
```

**⚠️ חשוב:** ה-script דורש את ה-flag `--confirm` כדי למנוע מחיקה בטעות.

### מה ה-script מוחק:

1. **כל ה-employees** מה-database
2. **כל ה-external_data_links** הקשורים לעובדים
3. **כל ה-oauth_tokens** הקשורים לעובדים
4. **כל ה-external_data_raw** הקשורים לעובדים
5. **כל ה-notifications** הקשורים למיילים של העובדים

### איך זה עובד:

1. ה-script מתחבר ל-database
2. סופר כמה employees יש
3. מוחק את כל הנתונים הקשורים (בסדר הנכון)
4. מוחק את כל ה-employees
5. מאמת שהמחיקה הצליחה

### אם אתה רוצה למחוק ידנית ב-Supabase:

```sql
-- בדוק כמה employees יש
SELECT COUNT(*) as count FROM employees;

-- מחק את כל הנתונים הקשורים
DELETE FROM external_data_links;
DELETE FROM oauth_tokens;
DELETE FROM external_data_raw;
DELETE FROM notifications;

-- מחק את כל ה-employees
DELETE FROM employees;

-- אמת שהמחיקה הצליחה
SELECT COUNT(*) as count FROM employees;
```

### ⚠️ אזהרה

**זה ימחק את כל העובדים!** זה כולל:
- כל הפרופילים
- כל הנתונים החיצוניים (LinkedIn, GitHub)
- כל ה-OAuth tokens
- כל ההתראות

**אל תעשה את זה ב-production!** זה רק לבדיקות ופיתוח.

