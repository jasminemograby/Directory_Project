# Deployment Guide - Quick Reference

## Overview

- **Frontend:** Vercel
- **Backend:** Railway  
- **Database:** Supabase (already configured)

## Quick Start

1. **Push to GitHub** (see below)
2. **Deploy Backend on Railway** → Get backend URL
3. **Deploy Frontend on Vercel** → Get frontend URL
4. **Update Environment Variables** (see detailed guides)

## Detailed Guides

- **Full Deployment Guide:** `docs/deployment_guide.md`
- **Railway Setup:** `docs/railway_deployment_setup.md`
- **Vercel Setup:** `docs/vercel_deployment_setup.md`
- **Environment Variables:** `docs/environment_variables_reference.md`

## Environment Variables Quick Reference

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

## Deployment Order

1. **Backend first** (Railway) - Get backend URL
2. **Frontend second** (Vercel) - Get frontend URL  
3. **Update CORS_ORIGIN** in Railway with Vercel URL
4. **Update REACT_APP_API_URL** in Vercel with Railway URL
5. **Redeploy both** to apply changes

## Testing After Deployment

- Backend: `https://your-backend.railway.app/api/health`
- Frontend: `https://your-frontend.vercel.app`

