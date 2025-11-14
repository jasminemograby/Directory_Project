# איך לראות את ה-Notifications?

## איפה מופיע ה-Notification Center?

**ה-Notification Center מופיע בכל הדפים!** 🎉

### 1. Navigation Bar

ה-Notification Center מופיע ב-**Navigation Bar** (מימין למעלה) בכל הדפים שכוללים Layout:
- ✅ דף הנחיתה (Home)
- ✅ דף הרישום (Company Registration)
- ✅ כל הדפים האחרים

### 2. איך זה נראה?

- **Bell Icon** 🔔 - אייקון פעמון מימין למעלה
- **Badge Count** - מספר אדום עם מספר ההתראות הלא נקראו
- **Dropdown** - לחיצה על הפעמון פותחת רשימת התראות

---

## איך לראות התראות?

### Step 1: השלמי Company Registration

1. **לכי ל-Step 1** - הזני פרטי חברה (כולל HR Email)
2. **השלמי את כל השלבים** עד Step 3
3. **השלמי את Step 3** עם רשימת עובדים

### Step 2: בדיקת התראות

**אחרי השלמת Step 3:**
- ✅ המערכת בודקת אוטומטית אם העובדים רשומים
- ✅ אם יש עובדים לא רשומים → התראה נשמרת ב-Database
- ✅ ההתראה נשלחת ל-HR Email שהוזן ב-Step 1

### Step 3: צפייה בהתראות

1. **פתחי את הדף** (דף הנחיתה או כל דף אחר)
2. **חפשי את Bell Icon** 🔔 מימין למעלה
3. **לחצי על הפעמון** → צריך לראות Dropdown עם ההתראות

---

## איך לבדוק שזה עובד?

### Option 1: יצירת התראה ידנית (לבדיקה)

**Run in Supabase SQL Editor:**
```sql
INSERT INTO notifications (company_id, type, recipient_email, message, status, created_at)
VALUES (
  (SELECT id FROM companies LIMIT 1),
  'unregistered_employees',
  'YOUR_HR_EMAIL@example.com',  -- החלפי במייל שהוזן ב-Step 1
  'Test notification: 3 employees need registration',
  'sent',
  CURRENT_TIMESTAMP
);
```

**אחרי זה:**
1. רענני את הדף
2. לחצי על Bell Icon
3. צריך לראות את ההתראה!

### Option 2: השלמת Registration עם עובדים

1. **השלמי Company Registration** עם רשימת עובדים
2. **המערכת בודקת אוטומטית** אם העובדים רשומים
3. **אם יש עובדים לא רשומים** → התראה נוצרת אוטומטית
4. **לחצי על Bell Icon** → צריך לראות את ההתראה

---

## מה אם לא רואה התראות?

### בדיקה 1: HR Email נכון?

**וודאי שה-HR Email ב-Layout נכון:**
1. פתחי את Console בדפדפן (F12)
2. בדקי: `localStorage.getItem('hrEmail')`
3. צריך לראות את ה-Email שהוזן ב-Step 1

### בדיקה 2: יש התראות ב-Database?

**Run in Supabase SQL Editor:**
```sql
SELECT * FROM notifications 
WHERE recipient_email = 'YOUR_HR_EMAIL@example.com'
ORDER BY created_at DESC;
```

**אם יש התראות:**
- ✅ הבעיה היא ב-Frontend
- ✅ בדקי את Console לראות שגיאות

**אם אין התראות:**
- ✅ צריך ליצור התראה (Option 1 למעלה)
- ✅ או להשלים Registration עם עובדים

### בדיקה 3: API עובד?

**פתחי בדפדפן:**
```
http://localhost:5000/api/notifications?user_email=YOUR_HR_EMAIL@example.com
```

**צריך לראות:**
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "unreadCount": 1
  }
}
```

---

## סיכום

✅ **Notification Center מופיע בכל הדפים** (מימין למעלה)  
✅ **Bell Icon** עם Badge Count  
✅ **לחיצה** → Dropdown עם רשימת התראות  
✅ **התראות נשמרות ב-Database** אחרי Company Registration

**הכל מוכן!** 🎉


