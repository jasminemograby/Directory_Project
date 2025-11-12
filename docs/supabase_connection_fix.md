# Fixing Supabase Database Connection Error

## Error: `getaddrinfo ENOTFOUND db.glnwnrlotpmhjkkkonky.supabase.co`

This error means your computer cannot resolve the database hostname. Here's how to fix it:

## Solution 1: Get Connection Pooler URL (Recommended)

Supabase provides a **Connection Pooler** URL that is more reliable than the direct connection.

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `glnwnrlotpmhjkkkonky`

2. **Get Connection Pooler URL**
   - Go to **Settings** → **Database**
   - Scroll down to **Connection Pooling** section
   - Look for **Connection string** or **Session mode** connection string
   - Copy the **URI** connection string
   - It should look like:
     ```
     postgresql://postgres.glnwnrlotpmhjkkkonky:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
     ```
     OR
     ```
     postgresql://postgres.glnwnrlotpmhjkkkonky:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
     ```

3. **Update `backend/.env`**
   - Replace the `DATABASE_URL` line with the connection pooler URL you copied
   - Make sure to replace `[YOUR-PASSWORD]` with your actual database password: `FULLSTACK2025`

   Example:
   ```env
   DATABASE_URL=postgresql://postgres.glnwnrlotpmhjkkkonky:FULLSTACK2025@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

## Solution 2: Check Direct Connection URL

If Connection Pooler doesn't work, try the direct connection:

1. **Go to Supabase Dashboard**
   - Settings → **Database**
   - Scroll to **Connection string** section
   - Select **URI** tab
   - Copy the connection string
   - It should look like:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.glnwnrlotpmhjkkkonky.supabase.co:5432/postgres
     ```

2. **Update `backend/.env`**
   ```env
   DATABASE_URL=postgresql://postgres:FULLSTACK2025@db.glnwnrlotpmhjkkkonky.supabase.co:5432/postgres
   ```

## Solution 3: Check Network/DNS

If both above solutions don't work:

1. **Check DNS Settings**
   - Try using Google DNS: `8.8.8.8` and `8.8.4.4`
   - Or Cloudflare DNS: `1.1.1.1`

2. **Check Firewall/VPN**
   - Disable VPN if you're using one
   - Check if firewall is blocking port 5432 or 6543

3. **Test Connection**
   ```powershell
   # Test if hostname resolves
   nslookup db.glnwnrlotpmhjkkkonky.supabase.co
   
   # Test connection pooler
   nslookup aws-0-us-east-1.pooler.supabase.com
   ```

## Solution 4: Use Supabase REST API (Alternative)

If direct database connection doesn't work, you can use Supabase REST API instead:

1. Use the `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` you already have
2. Make API calls instead of direct SQL queries
3. This requires code changes but might work if network is the issue

## After Updating

1. **Restart the backend server**
   ```powershell
   # Stop current server (Ctrl+C)
   # Then restart:
   cd backend
   npm start
   ```

2. **Check for success message**
   - You should see: `Database connected successfully`
   - If you see connection errors, try the next solution

## Quick Test

After updating `.env`, test the connection:

```powershell
cd backend
node -e "require('dotenv').config(); const {Pool} = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: false}}); pool.query('SELECT NOW()').then(r => {console.log('Success!', r.rows[0]); pool.end();}).catch(e => {console.error('Error:', e.message); pool.end();});"
```

## Need Help?

If none of these solutions work:
1. Check Supabase project status in dashboard
2. Verify your database password is correct
3. Check if your IP is whitelisted in Supabase (Settings → Database → Connection pooling)
4. Contact Supabase support

