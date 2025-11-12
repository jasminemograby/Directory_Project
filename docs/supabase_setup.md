# Supabase Database Setup Instructions

## Getting Your Database Connection String

To connect to your Supabase database, you need the **database password**, not the service role key.

### Steps to Get Connection String:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `glnwnrlotpmhjkkkonky`

2. **Get Connection String**
   - Go to **Settings** → **Database**
   - Scroll down to **Connection string** section
   - Select **URI** tab
   - Copy the connection string (it looks like):
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.glnwnrlotpmhjkkkonky.supabase.co:5432/postgres
     ```

3. **Update `backend/.env`**
   - Replace `[YOUR-PASSWORD]` with your actual database password
   - Or replace the entire `DATABASE_URL` line with the connection string you copied

### Alternative: Get Database Password

If you need to reset or find your database password:
1. Go to **Settings** → **Database**
2. Look for **Database password** section
3. You can reset it if needed
4. Use this password in the connection string format:
   ```
   postgresql://postgres:YOUR_PASSWORD@db.glnwnrlotpmhjkkkonky.supabase.co:5432/postgres
   ```

## Current Configuration

Your Supabase project:
- **Project URL:** https://glnwnrlotpmhjkkkonky.supabase.co
- **Project Reference:** glnwnrlotpmhjkkkonky
- **Service Role Key:** (stored in .env - for API calls, not direct DB connection)

## Important Notes

- **Service Role Key** is for REST API calls, not direct PostgreSQL connections
- **Database Password** is needed for direct PostgreSQL connections (what we're using)
- The connection string format is: `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`

## Testing Connection

After updating `.env` with the correct `DATABASE_URL`, test the connection:

```bash
cd backend
npm start
```

You should see: `Database connected successfully`

If you see connection errors, verify:
1. The password in `DATABASE_URL` is correct
2. Your IP is allowed in Supabase (Settings → Database → Connection pooling)
3. The database schema was run successfully

