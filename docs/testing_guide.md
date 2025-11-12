# Testing Guide - Directory Microservice

## Prerequisites

Before testing, ensure you have:
- Node.js 18+ installed
- npm installed
- PostgreSQL database (or Supabase account)
- Git (optional, for cloning)

---

## Step 1: Install Dependencies

### Frontend
```bash
cd frontend
npm install
```

### Backend
```bash
cd backend
npm install
```

---

## Step 2: Set Up Environment Variables

### Frontend Environment

Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

### Backend Environment

Create `backend/.env`:
```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database (Supabase or Local PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database
# OR for Supabase:
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# CORS
CORS_ORIGIN=http://localhost:3000

# Optional: External API keys (for future features)
GEMINI_API_KEY=your_gemini_api_key
MAIL_API_URL=your_mail_api_url
MAIL_API_KEY=your_mail_api_key
```

**Note:** For initial testing, you can use a local PostgreSQL database or set up a free Supabase account.

---

## Step 3: Set Up Database

### Option A: Using Supabase (Recommended for Testing)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to SQL Editor
4. Copy and paste the contents of `database/schema.sql`
5. Run the SQL script to create all tables
6. Copy your project URL and service role key to `backend/.env`

### Option B: Using Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
   ```sql
   CREATE DATABASE directory_db;
   ```
3. Run the schema:
   ```bash
   psql -d directory_db -f database/schema.sql
   ```
4. Update `DATABASE_URL` in `backend/.env`

---

## Step 4: Start the Application

### Terminal 1: Backend Server
```bash
cd backend
npm start
```

You should see:
```
Directory Backend running on port 5000
Environment: development
Database connected successfully
```

### Terminal 2: Frontend Development Server
```bash
cd frontend
npm start
```

The frontend will automatically open at `http://localhost:3000`

---

## Step 5: Test the Company Registration Flow

### Test Flow 1: Complete Registration (Happy Path)

1. **Navigate to HR Landing Page**
   - Go to: `http://localhost:3000/hr/landing`
   - You should see the landing page with "Register Your Company" button

2. **Step 1: Basic Information**
   - Click "Register Your Company"
   - Fill in the form:
     - Company Name: `Test Company`
     - Industry: Select any industry
     - HR Name: `John Doe`
     - HR Email: `john@testcompany.com`
     - HR Role: `HR Manager`
     - Domain: `testcompany.com`
   - Click "Continue"
   - **Expected:** Redirects to verification page

3. **Step 2: Verification Status**
   - You should see "Verification in progress..."
   - Wait 5-10 seconds (simulated verification delay)
   - **Expected:** Status changes to "Verification successful" or shows success message

4. **Step 3: Verification Result**
   - If verification succeeds, click "Continue to Setup"
   - **Expected:** Redirects to Step 4

5. **Step 4: Full Company Setup**
   - **Add Employees:**
     - Click "+ Add Employee"
     - Fill in:
       - Name: `Jane Smith`
       - Email: `jane@testcompany.com`
       - Current Role: `QA Engineer`
       - Target Role: `Senior QA Engineer`
       - Type: `Regular Employee`
       - (Optional) Add external links
     - Click "Add"
   - **Add Departments:**
     - Click "+ Add Department"
     - Name: `Engineering`
     - Click "Add"
     - Click "+ Add Team" under Engineering
     - Name: `QA Team`
     - Click "Add"
   - **Learning Path Policy:**
     - Select "Manual Approval"
     - Select Decision Maker (choose the employee you added)
   - **Primary KPI:** (Optional) `Employee skill development`
   - Click "Submit Registration"
   - **Expected:** Success message and redirect to HR Dashboard (or success page)

### Test Flow 2: Validation Errors

1. **Step 1 Validation:**
   - Try submitting with empty fields
   - **Expected:** Error messages appear for each required field
   - Try invalid email format
   - **Expected:** "Invalid email format" error
   - Try invalid domain format
   - **Expected:** "Invalid domain format" error

2. **Step 4 Validation:**
   - Try submitting without employees
   - **Expected:** "At least one employee is required" error
   - Try submitting without departments
   - **Expected:** "At least one department is required" error
   - Select "Manual Approval" without selecting Decision Maker
   - **Expected:** "Decision Maker is required" error

### Test Flow 3: API Testing (Using Postman/curl)

#### Test Health Check
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "directory-backend",
  "version": "1.0.0"
}
```

#### Test Step 1 Registration
```bash
curl -X POST http://localhost:5000/api/company/register \
  -H "Content-Type: application/json" \
  -d '{
    "step": 1,
    "companyName": "Test Company",
    "industry": "Technology",
    "hrName": "John Doe",
    "hrEmail": "john@testcompany.com",
    "hrRole": "HR Manager",
    "domain": "testcompany.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Test Company",
    "industry": "Technology",
    "domain": "testcompany.com",
    "verification_status": "pending"
  },
  "message": "Company registration submitted. Verification in progress."
}
```

#### Test Verification Status
```bash
# Replace {companyId} with the ID from previous response
curl -X POST http://localhost:5000/api/company/{companyId}/verify \
  -H "Content-Type: application/json" \
  -d '{
    "checkStatus": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Test Company",
    "domain": "testcompany.com",
    "verification_status": "pending" // or "verified" after 5 seconds
  }
}
```

---

## Step 6: Verify Database

### Check Company Created
```sql
SELECT * FROM companies;
```

### Check Employees Created
```sql
SELECT * FROM employees;
```

### Check Departments Created
```sql
SELECT * FROM departments;
```

### Check Teams Created
```sql
SELECT * FROM teams;
```

### Check External Links
```sql
SELECT * FROM external_data_links;
```

---

## Step 7: Test Error Handling

### Test Invalid Routes
- Navigate to: `http://localhost:3000/invalid-route`
- **Expected:** 404 Error Page

### Test Backend Errors
- Stop the backend server
- Try to submit a form
- **Expected:** Error message displayed to user

### Test Network Errors
- Disconnect internet (or stop backend)
- Try API calls
- **Expected:** Error handling in place

---

## Step 8: Browser Console Checks

1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate through the registration flow
4. **Check for:**
   - No JavaScript errors
   - No undefined components
   - No missing imports
   - API calls are being made correctly

---

## Step 9: Network Tab Verification

1. Open browser DevTools → Network tab
2. Navigate through registration flow
3. **Verify:**
   - API calls to `/api/company/register` (POST)
   - API calls to `/api/company/{id}/verify` (POST)
   - Responses have correct status codes (200, 201)
   - Request/response payloads are correct

---

## Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:**
- Check `DATABASE_URL` in `backend/.env`
- Verify database is running
- Check database credentials

### Issue: "CORS error"
**Solution:**
- Verify `CORS_ORIGIN` in `backend/.env` matches frontend URL
- Check backend server is running on port 5000

### Issue: "Module not found"
**Solution:**
- Run `npm install` in both frontend and backend
- Check all imports are correct

### Issue: "Port already in use"
**Solution:**
- Change `PORT` in `backend/.env`
- Update `REACT_APP_API_URL` in `frontend/.env` to match

### Issue: "Verification stuck on pending"
**Solution:**
- Check backend logs for errors
- Verify email service is configured (optional for testing)
- Domain verification is simulated with 5-second delay

---

## Quick Test Checklist

- [ ] Frontend starts without errors
- [ ] Backend starts without errors
- [ ] Health check endpoint works
- [ ] HR Landing page loads
- [ ] Step 1 form validation works
- [ ] Step 1 submission creates company in database
- [ ] Verification status updates correctly
- [ ] Step 4 form loads
- [ ] Employee addition works
- [ ] Department/Team addition works
- [ ] Step 4 submission creates all data in database
- [ ] No console errors
- [ ] No network errors
- [ ] Error pages work (404, 403, 500)

---

## Next Steps After Testing

Once testing is complete:
1. Fix any issues found
2. Continue with next feature implementation
3. Set up CI/CD pipeline
4. Deploy to staging environment

---

## Testing Notes

- **Domain Verification:** Currently simulated with 5-second delay. In production, this would check actual DNS/MX records.
- **Email Service:** Currently placeholder. Emails are logged to console.
- **Authentication:** Not yet implemented. Routes are currently public for testing.
- **Database:** All data persists. Use a test database to avoid cluttering production data.

---

**Happy Testing!** 🚀

