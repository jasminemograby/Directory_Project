# בניית Connection String ידנית

## יש לנו את הנתונים הבאים:
- **Project Reference**: `glnwnrlotpmhjkkkonky`
- **Database Password**: `FULLSTACK2025`
- **Project URL**: `https://glnwnrlotpmhjkkkonky.supabase.co`

## אפשרויות Connection String:

### אפשרות 1: Direct Connection (נסה קודם)
```
postgresql://postgres:FULLSTACK2025@db.glnwnrlotpmhjkkkonky.supabase.co:5432/postgres
```

### אפשרות 2: Connection Pooler (Session mode)
```
postgresql://postgres.glnwnrlotpmhjkkkonky:FULLSTACK2025@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### אפשרות 3: Connection Pooler (Port 5432)
```
postgresql://postgres.glnwnrlotpmhjkkkonky:FULLSTACK2025@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### אפשרות 4: עם Region אחר (אם us-east-1 לא עובד)
נסה:
- `aws-0-eu-west-1.pooler.supabase.com`
- `aws-0-ap-southeast-1.pooler.supabase.com`
- או כל region אחר

---

## איך למצוא את ה-Region:

1. לך ל-**Settings** → **General** (או **Project Settings**)
2. חפש **Region** או **Location**
3. העתק את ה-Region (למשל: `us-east-1`, `eu-west-1`)

או:

1. בדף הראשי של הפרויקט
2. חפש **Region** או **Location**

---

## עדכון ה-.env:

אחרי שתמצא את ה-Region, נעדכן את `backend/.env` עם ה-Connection String הנכון.

