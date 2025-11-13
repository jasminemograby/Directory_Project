# Feature F004: External Data Collection (LinkedIn & GitHub) - Implementation Summary

## Overview

Feature F004 implements OAuth-based data collection from LinkedIn and GitHub for employee profiles. This feature allows employees to authorize Directory to access their external accounts and collect profile data.

## Status: In Progress

**Date Started:** 2025-01-11  
**Current Status:** Backend implementation complete, frontend integration complete, testing pending

---

## What Was Implemented

### 1. Database Schema

**New Tables:**
- `oauth_tokens` - Stores OAuth access tokens and refresh tokens securely
- `external_data_raw` - Stores raw fetched data from external APIs before processing

**Migration File:**
- `database/migrations/add_oauth_tokens_table.sql`

### 2. Backend Services

#### LinkedIn Service (`backend/services/linkedInService.js`)
- OAuth 2.0 authorization flow
- Token exchange and storage
- Token refresh mechanism
- Profile data fetching from LinkedIn API
- Graceful error handling

**Key Functions:**
- `getAuthorizationUrl(employeeId, state)` - Generate OAuth authorization URL
- `exchangeCodeForToken(code, employeeId)` - Exchange code for access token
- `getValidAccessToken(employeeId)` - Get valid token (refresh if needed)
- `refreshAccessToken(employeeId, refreshToken)` - Refresh expired token
- `fetchProfileData(employeeId)` - Fetch LinkedIn profile data

#### GitHub Service (`backend/services/githubService.js`)
- OAuth 2.0 authorization flow
- Token exchange and storage
- Profile data fetching from GitHub API
- Repository data fetching
- Email data fetching
- Graceful error handling

**Key Functions:**
- `getAuthorizationUrl(employeeId, state)` - Generate OAuth authorization URL
- `exchangeCodeForToken(code, employeeId)` - Exchange code for access token
- `getValidAccessToken(employeeId)` - Get valid token
- `fetchProfileData(employeeId)` - Fetch GitHub profile, repos, and emails

### 3. Backend Routes & Controllers

#### Routes (`backend/routes/externalData.js`)
- `/api/external/linkedin/authorize/:employeeId` - Initiate LinkedIn OAuth
- `/api/external/linkedin/callback` - Handle LinkedIn OAuth callback
- `/api/external/linkedin/data/:employeeId` - Fetch LinkedIn data
- `/api/external/github/authorize/:employeeId` - Initiate GitHub OAuth
- `/api/external/github/callback` - Handle GitHub OAuth callback
- `/api/external/github/data/:employeeId` - Fetch GitHub data
- `/api/external/collect/:employeeId` - Collect all external data

#### Controller (`backend/controllers/externalDataController.js`)
- `initiateLinkedInAuth` - Start LinkedIn OAuth flow
- `handleLinkedInCallback` - Process LinkedIn OAuth callback
- `fetchLinkedInData` - Fetch LinkedIn profile data
- `initiateGitHubAuth` - Start GitHub OAuth flow
- `handleGitHubCallback` - Process GitHub OAuth callback
- `fetchGitHubData` - Fetch GitHub profile data
- `collectAllData` - Collect data from all connected sources

---

## Environment Variables Required

### LinkedIn
```env
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=https://your-backend-url.com/api/external/linkedin/callback
```

### GitHub
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=https://your-backend-url.com/api/external/github/callback
```

### General
```env
BACKEND_URL=https://your-backend-url.com
FRONTEND_URL=https://your-frontend-url.com
```

**📘 מדריך מפורט:** ראה `docs/f004_oauth_setup_guide.md` להסבר שלב אחר שלב איך להגדיר את כל ה-OAuth Apps ו-Environment Variables.

---

## OAuth Flow

### LinkedIn OAuth Flow

1. **Initiate Authorization:**
   - Frontend calls: `GET /api/external/linkedin/authorize/:employeeId`
   - Backend returns authorization URL
   - Frontend redirects user to LinkedIn

2. **User Authorizes:**
   - User logs in to LinkedIn
   - User grants permissions
   - LinkedIn redirects to callback URL with code

3. **Token Exchange:**
   - Backend receives code at callback
   - Backend exchanges code for access token
   - Token stored in database

4. **Data Fetching:**
   - Frontend calls: `GET /api/external/linkedin/data/:employeeId`
   - Backend fetches profile data using stored token
   - Data stored in `external_data_raw` table

### GitHub OAuth Flow

Same flow as LinkedIn, but using GitHub endpoints.

---

## Security Features

1. **CSRF Protection:** State parameter in OAuth flow
2. **Secure Token Storage:** Tokens stored in database, not in frontend
3. **Token Refresh:** Automatic token refresh when expired
4. **Error Handling:** Graceful degradation if API fails
5. **Scope Limitation:** Minimal OAuth scopes requested

---

## Data Storage

### OAuth Tokens
- Stored in `oauth_tokens` table
- Encrypted at rest (database encryption)
- Unique constraint on (employee_id, provider)
- Automatic expiration tracking

### Raw External Data
- Stored in `external_data_raw` table
- JSONB format for flexible schema
- Marked as `processed: false` initially
- Will be processed by F005 (Gemini AI) and F006 (Skills Engine)

---

## Frontend Integration (✅ Complete)

### Components Created

#### 1. EnhanceProfile Component (`frontend/src/components/Profile/EnhanceProfile.js`)
- **Purpose:** UI component for LinkedIn and GitHub OAuth connection
- **Features:**
  - "Enhance My Profile" section with Connect buttons
  - OAuth flow initiation (redirects to LinkedIn/GitHub)
  - OAuth callback handling (reads URL params)
  - Connection status checking
  - Data preview after successful connection
  - Success/error messages
  - Loading states

#### 2. EmployeeProfile Page (`frontend/src/pages/EmployeeProfile.js`)
- **Purpose:** Main employee profile page with mandatory enrichment
- **Features:**
  - Displays "Enhance My Profile" section
  - **Blocking message** if LinkedIn/GitHub not connected
  - Profile content only shown after enrichment
  - Automatic status checking
  - Mock login support (uses localStorage for employeeId)

### Routes Added
- `/profile` - Employee profile page
- `/profile/:employeeId` - Employee profile with ID
- `/profile/me` - Current employee profile

### API Integration
- Added external data endpoints to `apiService`:
  - `initiateLinkedInAuth(employeeId)`
  - `initiateGitHubAuth(employeeId)`
  - `fetchLinkedInData(employeeId)`
  - `fetchGitHubData(employeeId)`
  - `collectAllExternalData(employeeId)`

### User Flow

1. **User logs in** (mock login - uses localStorage)
2. **User navigates to profile** (`/profile`)
3. **Profile page shows:**
   - "Enhance My Profile" section
   - LinkedIn: [Connect] button
   - GitHub: [Connect] button
   - **Blocking message:** "Please connect your LinkedIn and GitHub accounts..."
4. **User clicks "Connect" for LinkedIn:**
   - Redirects to LinkedIn OAuth
   - User authorizes
   - LinkedIn redirects back to callback
   - Backend stores token
   - Frontend shows success message
   - Data is fetched and displayed
5. **User clicks "Connect" for GitHub:**
   - Same flow as LinkedIn
6. **Once both connected:**
   - Blocking message disappears
   - Profile content is displayed
   - Success message: "Profile Enriched Successfully"
   - Data preview shown

## Next Steps

### Testing (Pending)
1. Test OAuth flow end-to-end
2. Test blocking message behavior
3. Test data fetching and display
4. Test error handling

### Integration with F005 (Gemini AI)
- Process raw external data through Gemini API
- Generate professional bio
- Identify and summarize projects

### Integration with F006 (Skills Engine)
- Send processed data to Skills Engine
- Receive normalized skills

---

## Testing

### Manual Testing Steps

1. **Test LinkedIn OAuth:**
   ```bash
   # Get authorization URL
   curl http://localhost:5000/api/external/linkedin/authorize/{employeeId}
   
   # After authorization, test data fetch
   curl http://localhost:5000/api/external/linkedin/data/{employeeId}
   ```

2. **Test GitHub OAuth:**
   ```bash
   # Get authorization URL
   curl http://localhost:5000/api/external/github/authorize/{employeeId}
   
   # After authorization, test data fetch
   curl http://localhost:5000/api/external/github/data/{employeeId}
   ```

3. **Test Combined Collection:**
   ```bash
   curl -X POST http://localhost:5000/api/external/collect/{employeeId}
   ```

---

## Notes

- **No Mock Data:** As per project requirements, external integrations (LinkedIn, GitHub) do NOT use mock data fallback
- **Graceful Degradation:** If API fails, returns empty data structure instead of throwing error
- **Token Management:** Tokens are automatically refreshed when expired (if refresh token available)
- **State Management:** OAuth state parameter should be properly managed in production (currently simplified)

---

## Files Created/Modified

### New Files
- `backend/services/linkedInService.js`
- `backend/services/githubService.js`
- `backend/routes/externalData.js`
- `backend/controllers/externalDataController.js`
- `database/migrations/add_oauth_tokens_table.sql`
- `frontend/src/components/Profile/EnhanceProfile.js`
- `frontend/src/pages/EmployeeProfile.js`
- `docs/f004_implementation_summary.md`

### Modified Files
- `backend/server.js` - Added external data routes
- `database/schema.sql` - Added OAuth tokens and raw data tables
- `frontend/src/services/api.js` - Added external data API methods
- `frontend/src/App.js` - Added EmployeeProfile routes
- `frontend/src/utils/constants.js` - Added EMPLOYEE_PROFILE route
- `features-map.json` - Added F004 entry

---

## Dependencies

- **F002:** Company Legitimacy Verification (must be complete)
- **F001:** Company Registration (employees must exist)

---

## Related Features

- **F005:** AI-Enhanced Profile Enrichment (Gemini) - Will process raw data
- **F006:** Skills Engine Integration - Will receive processed data
- **F007:** Employee Profile Creation - Will use collected data

