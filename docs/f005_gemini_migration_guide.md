# F005: Gemini AI Enrichment - Database Migration Guide

## Overview
This migration adds the `external_data_processed` table to store AI-processed profile data (bio, projects, skills) after Gemini enrichment.

## Migration Steps

### 1. Go to Supabase SQL Editor
- Open your Supabase project dashboard
- Navigate to **SQL Editor** in the left sidebar
- Click **"New Query"**

### 2. Run the Migration SQL
Copy and paste the following SQL script:

```sql
-- Processed external data table (stores AI-processed data from Gemini)
-- This table stores cleaned and processed data after Gemini AI enrichment

CREATE TABLE IF NOT EXISTS external_data_processed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    bio TEXT,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_external_data_processed_employee ON external_data_processed(employee_id);
CREATE INDEX IF NOT EXISTS idx_external_data_processed_processed_at ON external_data_processed(processed_at);
```

### 3. Execute the Query
- Click **"Run"** (or press Ctrl+Enter)
- You should see: **"Success. No rows returned"**

### 4. Verify the Table
- Go to **Table Editor** in the left sidebar
- Check that `external_data_processed` table exists
- Verify the columns: `id`, `employee_id`, `bio`, `processed_at`, `created_at`, `updated_at`

## Environment Variables Required

Add the following to your Railway backend environment variables:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

### How to Get Gemini API Key:

1. **Go to Google AI Studio**
   - Visit: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account

2. **Create API Key**
   - Click **"Create API Key"** button
   - You'll see a dialog with:
     - **"Name your key"** - Enter a name (e.g., "Directory Project API Key")
     - **"Choose an imported project"** - Select one of:
       - **"Default Gemini Project"** ← **Choose this if it's your first time** (Recommended)
       - **"Create Project"** - If you want to create a new Google Cloud project
       - **"Import Project"** - If you have an existing Google Cloud project

3. **Recommended Steps:**
   - **Name your key**: Enter `Directory Project API Key` (or any name you prefer)
   - **Choose project**: Select **"Default Gemini Project"** (this is the easiest option)
   - Click **"Create API Key"** button

4. **Copy the API Key**
   - After creation, you'll see your API key displayed
   - **Important**: Copy it immediately - you won't be able to see it again!
   - It will look like: `AIzaSy...` (long string)

5. **Add to Railway**
   - Go to your Railway project dashboard
   - Navigate to your backend service → **Variables** tab
   - Click **"New Variable"**
   - Name: `GEMINI_API_KEY`
   - Value: Paste your copied API key
   - Click **"Add"**
   - Railway will automatically redeploy with the new variable

**Note**: If you chose "Create Project", you may need to enable billing in Google Cloud Console (though Gemini API has a free tier).

## Data Flow

1. **Raw Data Collection** (F004):
   - User connects LinkedIn/GitHub
   - Raw data stored in `external_data_raw` (processed = false)

2. **Gemini Processing** (F005):
   - System calls `enrichProfile(employeeId)`
   - Raw data sent to Gemini API (sanitized)
   - Gemini generates bio and identifies projects
   - Processed data stored in `external_data_processed`
   - Projects stored in `projects` table (source = 'gemini_ai')
   - Raw data marked as `processed = true`

3. **Frontend Display**:
   - Frontend calls `GET /api/external/processed/:employeeId`
   - Only processed data (bio, projects, skills) is displayed
   - **NO raw data is shown to users**

## Security Features

- ✅ Input sanitization before sending to Gemini
- ✅ Output sanitization after receiving from Gemini
- ✅ Safety settings enabled in Gemini API calls
- ✅ Length limits on all text fields
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (HTML tag removal)

## Testing

After migration, test the flow:

1. Connect LinkedIn and GitHub for an employee
2. Call `POST /api/external/collect/:employeeId`
3. Check that:
   - `external_data_raw` has `processed = true`
   - `external_data_processed` has bio
   - `projects` table has entries with `source = 'gemini_ai'`
4. View profile in frontend - should show processed data only

**📋 For detailed testing instructions, see: `docs/f005_testing_guide.md`**

