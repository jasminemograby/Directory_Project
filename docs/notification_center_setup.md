# Notification Center - Setup Guide

## ✅ התשובה: **לא צריך לשלם ל-SendPulse!**

**In-App Notifications = חינמי לחלוטין!**

- ✅ **שמירה ב-Database** - חינמי
- ✅ **Frontend מציג** - חינמי
- ✅ **Bell icon + Badge count** - חינמי

**SendPulse Push = אופציונלי** (רק אם רוצים Web Push Notifications בדפדפן)

---

## מה נבנה?

### 1. Backend API ✅

**Routes:**
- `GET /api/notifications?user_email=...` - קבלת התראות
- `GET /api/notifications/unread-count?user_email=...` - מספר התראות לא נקראו
- `PATCH /api/notifications/:id/read` - סימון כנקרא
- `PATCH /api/notifications/mark-all-read` - סימון הכל כנקרא
- `DELETE /api/notifications/:id` - מחיקת התראה

**Database:**
- `notifications` table עם `read_at` column

### 2. Frontend Component ✅

**NotificationCenter Component:**
- Bell icon עם badge count
- Dropdown עם רשימת התראות
- Mark as read / Delete
- Auto-refresh כל 30 שניות

---

## איך להשתמש?

### 1. הוספת Component ל-Navigation

```jsx
import NotificationCenter from './components/common/NotificationCenter';

// ב-Navigation Bar:
<NotificationCenter userEmail="hr@company.com" />
```

### 2. Database Migration

**צריך להוסיף `read_at` column:**

```sql
-- אם ה-table כבר קיים, הוסיפי:
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

-- יצירת indexes:
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
```

---

## איך זה עובד?

### 1. שמירת התראות

כשיש עובדים לא רשומים:
- ✅ **התראה נשמרת ב-Database** ב-`notifications` table
- ✅ **`read_at = NULL`** = לא נקרא

### 2. הצגת התראות

- ✅ **Bell icon** עם badge count (מספר לא נקראו)
- ✅ **לחיצה** → Dropdown עם רשימת התראות
- ✅ **Auto-refresh** כל 30 שניות

### 3. פעולות

- ✅ **Mark as read** → `read_at = CURRENT_TIMESTAMP`
- ✅ **Delete** → מחיקה מה-Database
- ✅ **Mark all as read** → כל ההתראות כנקראו

---

## Database Schema

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    type VARCHAR(100),  -- 'unregistered_employees'
    recipient_email VARCHAR(255),  -- HR email
    message TEXT,
    status VARCHAR(20),  -- 'sent', 'failed', 'pending'
    message_id VARCHAR(255),
    read_at TIMESTAMP,  -- NULL = לא נקרא
    created_at TIMESTAMP
);
```

---

## API Examples

### Get Notifications

```http
GET /api/notifications?user_email=hr@company.com&limit=50&offset=0&unread_only=false
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "...",
        "type": "unregistered_employees",
        "message": "The following employees...",
        "read_at": null,
        "created_at": "2025-01-11T..."
      }
    ],
    "unreadCount": 3,
    "total": 10
  }
}
```

### Mark as Read

```http
PATCH /api/notifications/:id/read
Content-Type: application/json

{
  "user_email": "hr@company.com"
}
```

---

## סיכום

✅ **In-App Notifications = חינמי!**  
✅ **לא צריך SendPulse!**  
✅ **רק Database + Frontend!**

**הכל מוכן!** 🎉

