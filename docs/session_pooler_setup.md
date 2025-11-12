# Session Pooler Setup - הפתרון לבעיית IPv4

## הבעיה:
ה-Direct Connection לא עובד כי הוא **IPv6 בלבד**, והמחשב שלך (או Node.js) לא יכול להתחבר דרך IPv6.

## הפתרון:
להשתמש ב-**Session Pooler** במקום Direct Connection.

## מה לעשות:

### שלב 1: בחירת Session Pooler

בחלון "Connect to your project" שאתה רואה:

1. **חפש "Pooler settings" או "Session Pooler"**
2. **בחר "Session mode"** (לא Direct connection)
3. **בחר "URI"** (לא Parameters)
4. **העתק את ה-Connection String**

זה אמור להיראות כך:
```
postgresql://postgres.glnwnrlotpmhjkkkonky:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

או:
```
postgresql://postgres.glnwnrlotpmhjkkkonky:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### שלב 2: עדכן את backend/.env

אחרי שתקבל את ה-Connection String:
1. החלף `[YOUR_PASSWORD]` ב-`FULLSTACK2025`
2. שלח לי את ה-Connection String המלא
3. אני אעדכן את `backend/.env`

---

## אם לא רואה Session Pooler בחלון:

1. **לך ל-Settings → Database**
2. **חפש "Connection pooling"**
3. **זה אמור להראות Connection Pooler URLs**

---

## מה לעשות עכשיו:

**בחלון "Connect to your project":**
1. **חפש אפשרות לבחור "Session Pooler" או "Pooler"**
2. **בחר "Session mode"**
3. **העתק את ה-URI**
4. **שלח לי** - אני אעדכן את ה-.env

או:

**תאר לי מה אתה רואה בחלון** - אילו אפשרויות יש שם?

