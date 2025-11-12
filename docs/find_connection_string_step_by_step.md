# איך למצוא Connection String ב-Supabase - שלב אחר שלב

## מה יש לנו כבר:
✅ Database password - אפשר לראות או לאפס  
✅ Connection pooling - Shared Pooler פעיל  
✅ Network Restrictions - פתוח לכל ה-IPs (טוב!)  
❌ Connection String - לא רואים כאן

## שלב 1: בדוק ב-Settings → API

1. **לך ל-Settings** (ההילינגים בצד)
2. **לחץ על "API"** (לא Database)
3. **חפש:**
   - **Database URL**
   - **Connection string**
   - **PostgreSQL connection**
   - או כל קישור ל-Database

## שלב 2: בדוק ב-"Connect" Button

1. **בתפריט העליון**, יש כפתור **"Connect"**
2. **לחץ עליו**
3. **זה אמור לפתוח חלון עם Connection Strings**

## שלב 3: בדוק ב-SQL Editor

1. **לך ל-SQL Editor** (בתפריט הצד)
2. **חפש קישור ל-"Connection info" או "Database connection"**
3. **או לחץ על ה-⚙️ (Settings) icon** אם יש

## שלב 4: בנייה ידנית

אם לא מוצאים, נבנה Connection String ידנית:

### Connection Pooler (מומלץ):
```
postgresql://postgres.glnwnrlotpmhjkkkonky:FULLSTACK2025@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Direct Connection:
```
postgresql://postgres:FULLSTACK2025@db.glnwnrlotpmhjkkkonky.supabase.co:5432/postgres
```

---

## מה לעשות עכשיו:

1. **לך ל-Settings → API** - מה אתה רואה שם?
2. **לחץ על "Connect" בתפריט העליון** - מה קורה?
3. **או שלח לי תמונה** של מה שאתה רואה

אחרי שתשלח, אני אעדכן את ה-.env עם ה-Connection String הנכון.

