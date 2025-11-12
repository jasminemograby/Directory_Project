# Test Notification Center & SendPulse Integration

## מה צריך לבדוק?

### 1. Database Setup

**צריך להוסיף `read_at` column אם לא קיים:**

```sql
-- Run in Supabase SQL Editor:
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
```

### 2. Backend Test

```bash
cd backend
node scripts/test-notifications.js
```

**צריך לראות:**
- ✅ מספר התראות ב-Database
- ✅ Unread count
- ✅ `read_at` column קיים

### 3. Frontend Test

1. **הפעילי את השרת:**
   ```bash
   cd frontend
   npm start
   ```

2. **פתחי את הדפדפן:**
   - `http://localhost:3000`
   - צריך לראות **Bell icon** ב-Navigation Bar

3. **בדיקת Notification Center:**
   - לחצי על ה-Bell icon
   - צריך לראות Dropdown עם רשימת התראות
   - Badge count צריך להציג מספר לא נקראו

### 4. SendPulse Test

**SendPulse Push = אופציונלי!**

אם SendPulse לא מוגדר:
- ✅ **התראות נשמרות ב-Database** (זה העיקר!)
- ✅ **Frontend מציג אותן** (זה העיקר!)
- ✅ **Push Notifications לא נשלחים** (זה בסדר!)

**אם SendPulse מוגדר:**
- ✅ **התראות נשמרות ב-Database**
- ✅ **Frontend מציג אותן**
- ✅ **Push Notifications נשלחים** (אם User subscribed)

---

## איך לבדוק?

### Step 1: Database Migration

```sql
-- Run in Supabase SQL Editor:
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
```

### Step 2: Backend Test

```bash
cd backend
node scripts/test-notifications.js
```

### Step 3: Create Test Notification

```sql
-- Run in Supabase SQL Editor:
INSERT INTO notifications (company_id, type, recipient_email, message, status, created_at)
VALUES (
  (SELECT id FROM companies LIMIT 1),
  'unregistered_employees',
  'hr@example.com',
  'Test notification: 3 employees need registration',
  'sent',
  CURRENT_TIMESTAMP
);
```

### Step 4: Frontend Test

1. פתחי `http://localhost:3000`
2. לחצי על Bell icon
3. צריך לראות את ההתראה

### Step 5: Test Actions

1. **Mark as read** → צריך לעדכן `read_at`
2. **Delete** → צריך למחוק מה-Database
3. **Mark all as read** → כל ההתראות כנקראו

---

## SendPulse Integration

### מה SendPulse עושה?

**SendPulse Push API** (אופציונלי):
- שולח **Web Push Notifications** בדפדפן
- דורש: User subscribed ל-Push Notifications
- אם לא מוגדר → רק שמירה ב-Database (זה בסדר!)

### איך לבדוק SendPulse?

1. **בדוק את ה-Logs:**
   ```bash
   # Backend logs should show:
   📱 Sending in-app notification via SendPulse Push: { to: '...', title: '...' }
   ```

2. **אם SendPulse לא מוגדר:**
   ```
   [Mock Data Fallback] SendPulse unavailable, using mock data...
   ```
   **זה בסדר!** התראות נשמרות ב-Database.

3. **אם SendPulse מוגדר:**
   ```
   📱 SendPulse Push API Response: { ... }
   ```
   **Push notification נשלח** (אם User subscribed).

---

## סיכום

✅ **In-App Notifications = חינמי!**  
✅ **Database + Frontend = הכל עובד!**  
✅ **SendPulse Push = אופציונלי!**

**הכל מוכן לבדיקה!** 🎉

