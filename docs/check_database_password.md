# בדיקת Database Password

## הבעיה:
השגיאה "Tenant or user not found" אומרת שה-username או ה-password לא נכונים.

## מה לעשות:

### שלב 1: בדוק את ה-Database Password

1. **לך ל-Supabase Dashboard → Settings → Database**
2. **חפש "Database password"** (ראינו את זה קודם)
3. **לחץ על "Reset database password"** (או "Show password" אם יש)
4. **העתק את ה-password החדש**

### שלב 2: עדכן את backend/.env

אחרי שתקבל את ה-password:
1. החלף את `FULLSTACK2025` ב-password החדש
2. או שלח לי את ה-password ואני אעדכן

### שלב 3: נסה שוב

לאחר העדכון, ננסה שוב את החיבור.

---

## או - נסה Connection String אחר

אם יש לך Connection String מפורש מ-Supabase Dashboard:
1. **לך ל-Settings → API** (לא Database)
2. **חפש "Database URL" או "Connection string"**
3. **העתק את זה**

או:

1. **לחץ על "Connect" בתפריט העליון**
2. **זה אמור לפתוח חלון עם Connection Strings**
3. **העתק את ה-Connection Pooler URL**

---

## מה לעשות עכשיו:

1. **לך ל-Settings → Database → Database password**
2. **לחץ על "Reset database password"** (או "Show" אם יש)
3. **העתק את ה-password החדש**
4. **שלח לי** - אני אעדכן את ה-.env

או:

1. **לך ל-Settings → API**
2. **חפש Connection String**
3. **העתק והדבק כאן**

