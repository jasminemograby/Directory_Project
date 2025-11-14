# F004: Quick Fixes - Vercel 404 & Supabase Migration

## בעיה 1: עדיין רואה 404 ב-Vercel

### פתרון: Redeploy ב-Vercel

ה-`vercel.json` כבר נדחף ל-GitHub, אבל Vercel צריך לבנות מחדש:

1. **לך ל-Vercel Dashboard:**
   - https://vercel.com/dashboard
   - בחר את הפרויקט `directory-project-bice`

2. **Redeploy:**
   - לך ל-**"Deployments"** tab
   - לחץ על ה-**"..."** ליד ה-deployment האחרון
   - בחר **"Redeploy"**
   - המתן 2-3 דקות

3. **בדוק שוב:**
   - `https://directory-project-bice.vercel.app/profile`
   - אמור לעבוד עכשיו!

### אם עדיין לא עובד:

**בדוק את ה-Build Logs:**
1. ב-Vercel Dashboard → Deployments
2. לחץ על ה-deployment האחרון
3. בדוק את ה-Build Logs
4. חפש שגיאות או warnings

**ודא שה-`vercel.json` קיים:**
- ב-GitHub, לך ל-`frontend/vercel.json`
- ודא שהקובץ קיים ותוכנו:
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```

---

## בעיה 2: עדכון Supabase (Migration)

### פתרון: הרץ את ה-SQL ב-Supabase Dashboard

1. **היכנס ל-Supabase Dashboard:**
   - https://supabase.com/dashboard
   - בחר את הפרויקט שלך

2. **לך ל-SQL Editor:**
   - בתפריט השמאלי, לחץ על **"SQL Editor"**

3. **לחץ "New query"**

4. **העתק והדבק את ה-SQL הבא:**

```sql
-- OAuth Tokens Table for LinkedIn and GitHub
CREATE TABLE IF NOT EXISTS oauth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('linkedin', 'github')),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type VARCHAR(50) DEFAULT 'Bearer',
    expires_at TIMESTAMP,
    scope TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, provider)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_employee_provider ON oauth_tokens(employee_id, provider);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_expires_at ON oauth_tokens(expires_at);

-- Raw external data table (stores fetched data before processing)
CREATE TABLE IF NOT EXISTS external_data_raw (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('linkedin', 'github')),
    data JSONB NOT NULL,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_external_data_raw_employee_provider ON external_data_raw(employee_id, provider);
CREATE INDEX IF NOT EXISTS idx_external_data_raw_processed ON external_data_raw(processed);
```

5. **לחץ "Run"** (או Ctrl+Enter)

6. **ודא שהצלח:**
   - אתה אמור לראות: "Success. No rows returned"
   - לך ל-**"Table Editor"** בתפריט השמאלי
   - בדוק שיש:
     - ✅ `oauth_tokens`
     - ✅ `external_data_raw`

---

## סיכום - מה לעשות עכשיו

### 1. Vercel 404:
- ✅ Redeploy ב-Vercel Dashboard
- ✅ המתן 2-3 דקות
- ✅ בדוק שוב: `https://directory-project-bice.vercel.app/profile`

### 2. Supabase Migration:
- ✅ לך ל-Supabase SQL Editor
- ✅ העתק והדבק את ה-SQL למעלה
- ✅ לחץ "Run"
- ✅ ודא שה-tables נוצרו

---

**תאריך עדכון:** 2025-01-11

