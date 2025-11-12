# Railway Deployment Setup - Step by Step

## Prerequisites

- GitHub repository with code pushed
- Railway account (free tier is fine)
- Supabase database connection string

## Step-by-Step Instructions

### Step 1: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub (if not already done)
5. Select your repository
6. Click **"Deploy Now"**

### Step 2: Configure Service

Railway will auto-detect your project. You need to configure it:

1. **Service Name:** `directory-backend` (or any name you prefer)

2. **Root Directory:**
   - Click on the service
   - Go to **Settings** → **Source**
   - Set **Root Directory** to: `backend`
   - Click **Save**

3. **Build Settings:**
   - Railway auto-detects Node.js projects
   - **Build Command:** (auto-detected, usually `npm install`)
   - **Start Command:** `npm start` (should be auto-detected)

### Step 3: Set Environment Variables

1. Go to **Variables** tab
2. Click **+ New Variable**
3. Add each variable one by one:

#### Required Variables:

**1. NODE_ENV**
- **Name:** `NODE_ENV`
- **Value:** `production`
- Click **Add**

**2. DATABASE_URL**
- **Name:** `DATABASE_URL`
- **Value:** Your Supabase connection string
  - Go to Supabase Dashboard → Settings → Database
  - Copy **Connection Pooling** → **Session Mode** URL
  - Replace `[YOUR-PASSWORD]` with your actual password
  - Example: `postgresql://postgres.glnwnrlotpmhjkkkonky:FULLSTACK2025@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres`
- Click **Add**

**3. CORS_ORIGIN**
- **Name:** `CORS_ORIGIN`
- **Value:** `https://your-frontend.vercel.app` (you'll update this after Vercel deployment)
- For now, use: `http://localhost:3000` (temporary, update after Vercel)
- Click **Add**

#### Optional Variables (if not using DATABASE_URL):

**SUPABASE_URL** (only if needed)
- **Name:** `SUPABASE_URL`
- **Value:** `https://glnwnrlotpmhjkkkonky.supabase.co`

**SUPABASE_DB_PASSWORD** (only if needed)
- **Name:** `SUPABASE_DB_PASSWORD`
- **Value:** Your database password

### Step 4: Deploy

1. Railway will automatically:
   - Install dependencies (`npm install`)
   - Start the server (`npm start`)
2. Wait for deployment to complete (2-3 minutes)
3. Check the **Deployments** tab for status

### Step 5: Get Your Backend URL

After deployment:

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"** (or use custom domain)
3. Your URL will be: `https://your-service-name.up.railway.app`
4. **Copy this URL** - you'll need it for:
   - Vercel `REACT_APP_API_URL`
   - Railway `CORS_ORIGIN` update

### Step 6: Test Backend

1. Open: `https://your-backend.railway.app/api/health`
2. Should return: `{"status":"ok","timestamp":"...","service":"directory-backend","version":"1.0.0"}`

### Step 7: Update CORS_ORIGIN (After Vercel Deployment)

Once you have your Vercel frontend URL:

1. Go to **Variables** tab
2. Find `CORS_ORIGIN`
3. Click **Edit**
4. Change value to: `https://your-frontend.vercel.app`
5. Click **Save**
6. Railway will automatically redeploy

## Custom Domain (Optional)

1. Go to **Settings** → **Networking**
2. Click **"Custom Domain"**
3. Add your domain
4. Follow DNS configuration instructions

## Monitoring

- **Logs:** View real-time logs in Railway dashboard
- **Metrics:** CPU, Memory usage in dashboard
- **Deployments:** History of all deployments

## Troubleshooting

### Deployment Fails

**Check:**
- Root directory is set to `backend`
- `package.json` exists in backend folder
- Start command is `npm start`

**Solution:**
- Check deployment logs
- Ensure all dependencies are in `package.json`

### Database Connection Error

**Check:**
- `DATABASE_URL` is correct
- Password is correct (no extra spaces)
- Connection string uses Session Pooler (not Direct Connection)

**Solution:**
- Get fresh connection string from Supabase
- Ensure SSL is enabled (Railway handles this automatically)

### Port Already in Use

**Solution:**
- Railway sets `PORT` automatically via `PORT` environment variable
- Your code should use `process.env.PORT || 5000`
- This is already configured in `server.js`

### CORS Errors

**Check:**
- `CORS_ORIGIN` matches Vercel URL exactly
- No trailing slash in URL
- Includes `https://` protocol

**Solution:**
- Update `CORS_ORIGIN` to exact Vercel URL
- Redeploy after updating

## Environment Variables Summary

```
NODE_ENV=production
PORT=5000 (auto-set by Railway)
DATABASE_URL=postgresql://postgres.glnwnrlotpmhjkkkonky:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
CORS_ORIGIN=https://your-frontend.vercel.app
```

