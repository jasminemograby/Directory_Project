# Vercel Deployment Setup - Step by Step

## Prerequisites

- GitHub repository with code pushed
- Vercel account (free tier is fine)

## Step-by-Step Instructions

### Step 1: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository:
   - If not connected, click **"Import Git Repository"**
   - Authorize Vercel to access your GitHub
   - Select your repository
   - Click **"Import"**

### Step 2: Configure Project Settings

In the project configuration screen:

1. **Framework Preset:** Select **"React"** (or leave as "Other" - Vercel will auto-detect)

2. **Root Directory:** 
   - Click **"Edit"** next to Root Directory
   - Enter: `frontend`
   - Click **"Continue"**

3. **Build and Output Settings:**
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `build` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

4. **Environment Variables:**
   - Click **"Environment Variables"**
   - Add variable:
     - **Key:** `REACT_APP_API_URL`
     - **Value:** `https://your-backend.railway.app/api` (you'll update this after Railway deployment)
     - **Environment:** Select **Production**, **Preview**, and **Development**
     - Click **"Add"**

5. Click **"Deploy"**

### Step 3: Wait for Deployment

- Vercel will:
  1. Install dependencies
  2. Build the project
  3. Deploy to production
- This takes 2-3 minutes
- You'll see the build logs in real-time

### Step 4: Get Your Frontend URL

After deployment completes:
- You'll see: **"Congratulations! Your project has been deployed"**
- Your URL will be: `https://your-project-name.vercel.app`
- **Copy this URL** - you'll need it for Railway CORS configuration

### Step 5: Update Environment Variables (After Railway Deployment)

Once you have your Railway backend URL:

1. Go to **Settings** → **Environment Variables**
2. Update `REACT_APP_API_URL`:
   - Click **Edit** on `REACT_APP_API_URL`
   - Change value to: `https://your-backend.railway.app/api`
   - Click **Save**
3. **Redeploy:**
   - Go to **Deployments** tab
   - Click **"..."** on the latest deployment
   - Click **"Redeploy"**

## Custom Domain (Optional)

If you want a custom domain:

1. Go to **Settings** → **Domains**
2. Add your domain
3. Follow DNS configuration instructions

## Troubleshooting

### Build Fails

**Check:**
- Root directory is set to `frontend`
- Build command is `npm run build`
- All dependencies are in `package.json`

**Solution:**
- Check build logs in Vercel dashboard
- Ensure `package.json` has `"build": "react-scripts build"`

### Environment Variables Not Working

**Check:**
- Variable name starts with `REACT_APP_`
- Variable is set for the correct environment (Production)
- Project was redeployed after adding variables

**Solution:**
- Variables starting with `REACT_APP_` are embedded at build time
- You must redeploy after adding/changing variables

### CORS Errors

**Check:**
- `REACT_APP_API_URL` is correct
- Backend `CORS_ORIGIN` includes your Vercel URL

**Solution:**
- Update `CORS_ORIGIN` in Railway to match Vercel URL exactly
- Redeploy both frontend and backend

