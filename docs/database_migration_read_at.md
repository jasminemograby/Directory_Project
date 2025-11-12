# Database Migration: Add read_at Column

## מה צריך לעשות?

**צריך להוסיף `read_at` column ל-`notifications` table.**

---

## איך לעשות?

### Option 1: Supabase SQL Editor (מומלץ)

1. **פתחי את Supabase Dashboard**
2. **לכי ל-SQL Editor**
3. **הדבקי את ה-SQL הזה:**

```sql
-- Add read_at column if it doesn't exist
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
```

4. **לחצי על "Run"**

### Option 2: Command Line (אם יש לך psql)

```bash
psql "your-connection-string" -f database/migrations/add_read_at_to_notifications.sql
```

---

## איך לבדוק שזה עבד?

```sql
-- Check if column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications' AND column_name = 'read_at';
```

**צריך לראות:**
```
column_name | data_type | is_nullable
------------+-----------+-------------
read_at     | timestamp | YES
```

---

## אחרי ה-Migration

**הרצי שוב את הבדיקה:**
```bash
cd backend
node scripts/test-notifications.js
```

**צריך לראות:**
- ✅ `read_at` column exists
- ✅ Unread count works
- ✅ All tests pass

---

## סיכום

✅ **הוסיפי `read_at` column**  
✅ **צרי index**  
✅ **בדקי שהכל עובד**

**אחרי זה - הכל מוכן!** 🎉

