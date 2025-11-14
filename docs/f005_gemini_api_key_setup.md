# Gemini API Key Setup - Step by Step Guide

## Quick Setup Guide

### Step 1: Access Google AI Studio
1. Go to: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account

### Step 2: Create API Key

When you click "Create API Key", you'll see a dialog with two fields:

#### Field 1: "Name your key"
- Enter a descriptive name, for example:
  - `Directory Project API Key`
  - `EduCore Directory Gemini Key`
  - Or any name you prefer

#### Field 2: "Choose an imported project"
You have three options:

**Option A: Default Gemini Project** ⭐ **RECOMMENDED**
- This is the easiest option for first-time users
- No Google Cloud setup required
- Free tier included
- **Select this if you're not sure which to choose**

**Option B: Create Project**
- Creates a new Google Cloud project
- Requires Google Cloud account setup
- May require billing setup (though free tier is available)
- Use this if you want to manage multiple projects

**Option C: Import Project**
- Use an existing Google Cloud project
- Requires you to have a Google Cloud project already
- Use this if you have existing Google Cloud infrastructure

### Step 3: Complete the Setup

1. **Enter key name**: `Directory Project API Key`
2. **Select project**: Choose **"Default Gemini Project"**
3. Click **"Create API Key"**

### Step 4: Copy Your API Key

- Your API key will be displayed (starts with `AIzaSy...`)
- **⚠️ IMPORTANT**: Copy it immediately - you won't be able to see it again!
- If you lose it, you'll need to create a new one

### Step 5: Add to Railway

1. Go to [Railway Dashboard](https://railway.app)
2. Select your backend service (Directory Backend)
3. Go to **Variables** tab
4. Click **"New Variable"**
5. Enter:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Paste your copied API key
6. Click **"Add"**
7. Railway will automatically redeploy

### Step 6: Verify

After Railway redeploys, you can test by:
1. Connecting LinkedIn/GitHub for an employee
2. Calling the enrichment endpoint
3. Check backend logs for Gemini API calls

## Troubleshooting

### "API key not valid" error
- Make sure you copied the entire key (it's long)
- Check for extra spaces before/after
- Verify the key is added to Railway correctly

### "Billing required" error
- If you chose "Create Project", you may need to enable billing
- Try using "Default Gemini Project" instead (no billing required for free tier)

### "Quota exceeded" error
- Free tier has limits (60 requests per minute)
- For production, consider upgrading to paid tier

## Free Tier Limits

- **60 requests per minute**
- **1,500 requests per day**
- **32,000 tokens per minute**

This should be sufficient for development and testing.

