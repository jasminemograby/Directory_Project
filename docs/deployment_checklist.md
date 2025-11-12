# Deployment Checklist

## ✅ Pre-Deployment Verification

### Code Quality
- [x] All debug logs removed
- [x] No temporary files
- [x] No hardcoded values
- [x] All environment variables use `process.env`
- [x] Code is production-ready

### Git Repository
- [ ] All files committed
- [ ] No .env files in repository
- [ ] .gitignore includes .env files
- [ ] Code pushed to GitHub

## 📋 Deployment Steps

### Step 1: Push to GitHub
- [ ] Run `git add .`
- [ ] Run `git commit -m "Initial deployment-ready version"`
- [ ] Run `git push origin main`
- [ ] Verify code is on GitHub

### Step 2: Deploy Backend (Railway)
- [ ] Create Railway account
- [ ] Create new project from GitHub
- [ ] Set root directory to `backend`
- [ ] Add environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL` (from Supabase)
  - [ ] `CORS_ORIGIN` (temporary: `http://localhost:3000`)
- [ ] Wait for deployment
- [ ] Get backend URL
- [ ] Test health check: `https://your-backend.railway.app/api/health`

### Step 3: Deploy Frontend (Vercel)
- [ ] Create Vercel account
- [ ] Import GitHub repository
- [ ] Set root directory to `frontend`
- [ ] Add environment variable:
  - [ ] `REACT_APP_API_URL` (use Railway backend URL)
- [ ] Deploy
- [ ] Get frontend URL

### Step 4: Update Environment Variables
- [ ] Update `CORS_ORIGIN` in Railway with Vercel URL
- [ ] Update `REACT_APP_API_URL` in Vercel with Railway URL
- [ ] Redeploy both services

### Step 5: Final Testing
- [ ] Backend health check works
- [ ] Frontend loads correctly
- [ ] Frontend can connect to backend
- [ ] Company registration flow works
- [ ] No CORS errors
- [ ] No console errors

## 🔐 Environment Variables Summary

### Railway (Backend)
```
NODE_ENV=production
DATABASE_URL=postgresql://postgres.glnwnrlotpmhjkkkonky:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Vercel (Frontend)
```
REACT_APP_API_URL=https://your-backend.railway.app/api
```

## 📚 Documentation References

- **Full Guide:** `docs/deployment_guide.md`
- **Railway Setup:** `docs/railway_deployment_setup.md`
- **Vercel Setup:** `docs/vercel_deployment_setup.md`
- **Environment Variables:** `docs/environment_variables_reference.md`
- **Git Push:** `docs/git_push_instructions.md`

## 🆘 Troubleshooting

If something fails:
1. Check deployment logs in Railway/Vercel
2. Verify environment variables are set correctly
3. Check that URLs are correct (no typos, correct protocol)
4. Ensure services are redeployed after variable changes

