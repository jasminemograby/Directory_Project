# בדיקת Database Password - שלב אחרון

## הבעיה:
השגיאה "Tenant or user not found" אומרת שה-username או ה-password לא נכונים.

## מה לעשות:

### שלב 1: אפס את ה-Database Password

1. **לך ל-Supabase Dashboard → Settings → Database**
2. **חפש "Database password"**
3. **לחץ על "Reset database password"**
4. **העתק את ה-password החדש** (או הגדר אחד חדש)

### שלב 2: עדכן את backend/.env

אחרי שתקבל את ה-password החדש:
1. שלח לי את ה-password החדש
2. אני אעדכן את `backend/.env`

או:

1. פתח את `backend/.env`
2. מצא את השורה: `DATABASE_URL=postgresql://postgres:FULLSTACK2025@...`
3. החלף את `FULLSTACK2025` ב-password החדש
4. שמור את הקובץ

### שלב 3: נסה שוב

לאחר העדכון, נפעיל מחדש את השרת ונבדוק.

---

## Connection String הנכון:

לאחר שתקבל את ה-password הנכון, ה-Connection String יהיה:

```
postgresql://postgres:[YOUR_NEW_PASSWORD]@db.glnwnrlotpmhjkkkonky.supabase.co:5432/postgres
```

או ל-Connection Pooler:

```
postgresql://postgres.glnwnrlotpmhjkkkonky:[YOUR_NEW_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

---

## מה לעשות עכשיו:

1. **לך ל-Settings → Database → Database password**
2. **לחץ על "Reset database password"**
3. **העתק את ה-password החדש**
4. **שלח לי** - אני אעדכן את ה-.env

או:

**אם אתה יודע מה ה-password הנכון**, שלח לי אותו ואני אעדכן.

