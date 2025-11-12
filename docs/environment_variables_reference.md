# Environment Variables Reference

## Backend (Railway)

### Required Variables

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `NODE_ENV` | Environment mode | `production` | Set manually |
| `PORT` | Server port | `5000` | Set manually (Railway sets automatically) |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres.glnwnrlotpmhjkkkonky:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres` | Supabase Dashboard → Settings → Database → Connection Pooling |
| `CORS_ORIGIN` | Frontend URL for CORS | `https://your-app.vercel.app` | Vercel deployment URL |

### Optional Variables

| Variable | Description | When to Use |
|----------|-------------|-------------|
| `SUPABASE_URL` | Supabase project URL | If not using `DATABASE_URL` directly |
| `SUPABASE_DB_PASSWORD` | Database password | If constructing connection string manually |

## Frontend (Vercel)

### Required Variables

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `REACT_APP_API_URL` | Backend API base URL | `https://your-backend.railway.app/api` | Railway deployment URL + `/api` |

## Supabase (Database)

### Already Configured

- Database is already set up on Supabase
- Connection string is available in Supabase Dashboard
- No additional environment variables needed

## How to Set Environment Variables

### Railway (Backend)

1. Go to [Railway Dashboard](https://railway.app)
2. Select your project
3. Go to **Settings** → **Variables**
4. Click **+ New Variable**
5. Add each variable:
   - **Name:** `NODE_ENV`
   - **Value:** `production`
   - Click **Add**
6. Repeat for all variables

### Vercel (Frontend)

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add variable:
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://your-backend.railway.app/api`
   - **Environment:** Production (and Preview if needed)
   - Click **Save**
6. **Important:** After adding variables, redeploy the project

## Security Notes

- ✅ Never commit `.env` files to Git
- ✅ Never share environment variables publicly
- ✅ Use different values for development and production
- ✅ Rotate secrets regularly
- ✅ Use Railway/Vercel secrets management (not local files)

## Example Values (DO NOT USE IN PRODUCTION)

These are examples only - use your actual values:

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres.glnwnrlotpmhjkkkonky:****@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
CORS_ORIGIN=https://your-app.vercel.app
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
```

## Verification Checklist

After setting up environment variables:

- [ ] Backend `NODE_ENV` is set to `production`
- [ ] Backend `DATABASE_URL` is correct (test connection)
- [ ] Backend `CORS_ORIGIN` matches Vercel URL exactly
- [ ] Frontend `REACT_APP_API_URL` points to Railway backend
- [ ] All variables are set in the correct environment (Production)
- [ ] Frontend has been redeployed after adding variables
- [ ] Backend health check works: `https://your-backend.railway.app/api/health`

