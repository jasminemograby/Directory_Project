# Feature F003: In-App Notifications via SendPulse

## מה זה In-App Notifications?

**In-App Notifications** = התראות שנשמרות ב-Database והצד לקוח (Frontend) שולף אותן ומציג אותן ב-Notification Center.

**זה לא אימיילים!** זה התראות בתוך המערכת.

---

## איך זה עובד?

### 1. שמירת התראות ב-Database (עיקר)

כשיש עובדים לא רשומים:
- ✅ **התראה נשמרת ב-Database** ב-`notifications` table
- ✅ **Frontend יכול לשלוף** את ההתראות דרך API
- ✅ **HR רואה את ההתראות** ב-Notification Center (כשיהיה)

### 2. SendPulse Push API (אופציונלי)

**Web Push Notifications** - התראות בדפדפן (כמו "יש לך הודעה חדשה")

- ✅ **אופציונלי** - לא חובה
- ✅ **דורש:** User subscribed ל-Push Notifications
- ✅ **אם לא מוגדר:** רק שמירה ב-Database (זה בסדר!)

---

## מה נדרש?

### Environment Variables

```env
# SendPulse Configuration (for Push Notifications - optional)
SENDPULSE_USER_ID=your_user_id
SENDPULSE_SECRET=your_secret
SENDPULSE_WEBSITE_ID=your_website_id  # Optional - for Push Notifications
```

**הערה:** אם SendPulse לא מוגדר, המערכת עובדת ב-Mock Mode - התראות נשמרות ב-Database בלבד.

---

## איך זה עובד עכשיו?

### 1. Company Registration (Step 3)

כש-HR מסיימת Step 3:
1. ✅ **המערכת בודקת** עם Auth Service אם העובדים רשומים
2. ✅ **אם יש עובדים לא רשומים:**
   - התראה נשמרת ב-Database
   - SendPulse Push API מנסה לשלוח Push (אם מוגדר)
   - **אם Push לא עובד** → רק שמירה ב-Database (זה בסדר!)

### 2. Database Storage

**Table:** `notifications`

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    type VARCHAR(100),  -- 'unregistered_employees'
    recipient_email VARCHAR(255),  -- HR email
    message TEXT,  -- Notification message
    status VARCHAR(20),  -- 'sent', 'failed', 'pending'
    message_id VARCHAR(255),  -- SendPulse message ID (if sent)
    created_at TIMESTAMP
);
```

### 3. Frontend (עתידי)

**Notification Center:**
- Bell icon עם badge count
- Dropdown עם רשימת התראות
- Mark as read / Clear all
- API endpoint: `GET /api/notifications?user_email=...`

---

## API Endpoints

### 1. Check Employee Registration

```http
GET /api/employee-registration/company/:companyId/check
```

**Response:**
```json
{
  "success": true,
  "data": {
    "companyId": "...",
    "registered": [...],
    "unregistered": [...],
    "total": 10
  }
}
```

### 2. Trigger HR Notification

```http
POST /api/employee-registration/company/:companyId/notify-hr
```

**Response:**
```json
{
  "success": true,
  "data": {
    "companyId": "...",
    "unregisteredCount": 3,
    "unregisteredEmployees": [...],
    "notificationSent": true
  }
}
```

---

## Mock Mode

אם SendPulse לא מוגדר:
- ✅ **התראות נשמרות ב-Database** (זה העיקר!)
- ✅ **Push Notifications לא נשלחים** (זה בסדר!)
- ✅ **המערכת עובדת מצוין**

---

## מה הלאה?

### 1. Frontend - Notification Center

צריך לבנות:
- Bell icon עם badge count
- Dropdown עם רשימת התראות
- API endpoint: `GET /api/notifications?user_email=...`

### 2. SendPulse Push Setup (אופציונלי)

אם רוצים Push Notifications:
1. **הירשמי ל-SendPulse Push**
2. **קבלי Website ID**
3. **הוסיפי ל-`.env`:** `SENDPULSE_WEBSITE_ID=...`
4. **Frontend צריך:** Subscribe ל-Push Notifications

---

## סיכום

✅ **In-App Notifications = שמירה ב-Database**  
✅ **SendPulse Push = אופציונלי** (Web Push Notifications)  
✅ **Mock Mode = עובד מצוין** (רק Database, בלי Push)

**הכל עובד!** 🎉

