# 🚀 Quick Start - Deployment

## Step 1: Push to GitHub

```powershell
# Commit all files
git commit -m "Initial deployment-ready version - F001 Company Registration complete"

# If first time, add remote (replace with your repo URL):
git remote add origin https://github.com/your-username/your-repo.git

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy Backend (Railway)

1. Go to [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. **Settings** → **Source** → Set **Root Directory** to: `backend`
5. **Variables** → Add:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://postgres.glnwnrlotpmhjkkkonky:FULLSTACK2025@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
   CORS_ORIGIN=http://localhost:3000
   ```
6. Wait for deployment
7. **Settings** → **Networking** → Generate domain
8. **Copy backend URL** (e.g., `https://your-app.railway.app`)

## Step 3: Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com)
2. **Add New Project** → Import GitHub repo
3. **Root Directory:** `frontend`
4. **Environment Variables** → Add:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   ```
   (Use the Railway URL from Step 2)
5. Click **Deploy**
6. **Copy frontend URL** (e.g., `https://your-app.vercel.app`)

## Step 4: Update Environment Variables

### In Railway:
1. **Variables** → Edit `CORS_ORIGIN`
2. Change to: `https://your-frontend.vercel.app` (from Step 3)
3. Save (auto-redeploys)

### In Vercel:
1. **Settings** → **Environment Variables** → Edit `REACT_APP_API_URL`
2. Verify it's: `https://your-backend.railway.app/api`
3. **Deployments** → **Redeploy** latest deployment

## Step 5: Test

- Backend: `https://your-backend.railway.app/api/health`
- Frontend: `https://your-frontend.vercel.app`

## 📚 Detailed Guides

- **Full Guide:** `docs/deployment_guide.md`
- **Railway:** `docs/railway_deployment_setup.md`
- **Vercel:** `docs/vercel_deployment_setup.md`
- **Environment Variables:** `docs/environment_variables_reference.md`

