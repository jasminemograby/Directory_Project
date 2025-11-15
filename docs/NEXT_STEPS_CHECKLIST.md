# 📋 Next Steps Checklist - Directory Microservice

**תאריך:** 2025-01-XX  
**סטטוס:** ✅ Migrations Completed, Ready for Testing

---

## ✅ Completed

- [x] Code pushed to GitHub (commit: ebc7a01)
- [x] Database migrations run (all 4 in Subabase SQL Editor)
- [x] Documentation updated
- [x] PORT configuration verified (Railway uses 8080)

---

## ⏭️ Next Steps - Testing & Verification

### 1. Backend Testing (Railway)

#### Environment Variables Check
- [ ] Verify `DATABASE_URL` is set correctly
- [ ] Verify `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET` are set
- [ ] Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set
- [ ] Verify `GEMINI_API_KEY` is set
- [ ] Verify `INTERNAL_API_SECRET` is set
- [ ] Verify `PORT` is set to 8080 (or auto-set by Railway)

#### Health Check
- [ ] Test: `GET https://directoryproject-production.up.railway.app/api/health`
- [ ] Expected: `{ status: 'ok', ... }`
- [ ] Check response time

#### API Endpoints Testing
- [ ] Test: `GET /api/company/check-email?email=test@example.com`
  - Expected: `{ success: true, available: true/false }`
- [ ] Test: `POST /api/company/register` (Step 1)
  - Send test company data
  - Verify response
- [ ] Test: `POST /api/company/register/step4` (Step 4)
  - Send test company with employees, departments
  - Verify all fields saved correctly

#### Database Connection
- [ ] Check Railway logs for database connection
- [ ] Verify no connection errors
- [ ] Test query: Verify new columns exist in tables

---

### 2. Frontend Testing (Vercel)

#### Environment Variables
- [ ] Verify `REACT_APP_API_URL` is set to Railway backend URL
- [ ] Verify URL is correct: `https://directoryproject-production.up.railway.app`

#### Routes Testing
- [ ] `/company/register` - Step 1 loads correctly
- [ ] `/company/register/verification` - Verification page loads
- [ ] `/company/register/step4` - Step 4 loads correctly
- [ ] `/hr/dashboard` - HR Dashboard loads
- [ ] `/profile/:employeeId` - Employee Profile loads

#### Functionality Testing
- [ ] Live email check works (Step 1)
- [ ] Form validations work
- [ ] Conditional fields show/hide correctly:
  - [ ] Decision Maker (Manual/Auto)
  - [ ] Exercise Limit (checkbox)
  - [ ] Manager Fields (isManager)
  - [ ] AI Enable (Trainers)
- [ ] Theme switching works
- [ ] Responsive design works

---

### 3. End-to-End Testing

#### Company Registration Flow
- [ ] Step 1: Fill form, submit
  - [ ] All validations work
  - [ ] Live email check works
  - [ ] Redirects to verification
- [ ] Verification: Wait for approval
  - [ ] Polling works
  - [ ] Redirects to Step 4 when approved
- [ ] Step 4: Complete registration
  - [ ] All fields save correctly
  - [ ] Employees created
  - [ ] Departments/Teams created
  - [ ] Manager assignments work
  - [ ] Redirects to HR Dashboard

#### Employee Registration
- [ ] Add regular employee (no manager)
- [ ] Add trainer with AI Enable
- [ ] Add manager (Department Manager)
- [ ] Add manager (Team Manager)
- [ ] Verify all fields saved correctly

#### Validation Testing
- [ ] Email uniqueness check (local)
- [ ] Manager assignment validation
- [ ] Department/Team manager validation
- [ ] Required fields validation

---

### 4. Database Verification

#### Check New Columns
Run these queries in Subabase SQL Editor:

```sql
-- Verify employees table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'employees'
AND column_name IN ('is_manager', 'manager_type', 'manager_of_id', 'ai_enabled');

-- Verify companies table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'companies'
AND column_name IN ('size', 'description');

-- Verify company_settings table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'company_settings'
AND column_name IN ('max_test_attempts', 'passing_grade', 'exercise_limit', 'public_publish_enabled');

-- Verify email constraint
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'employees'::regclass
AND conname LIKE '%email%';
```

Expected Results:
- All new columns should exist
- Email constraint should be `employees_company_id_email_key` (UNIQUE on company_id, email)

---

### 5. Error Handling Testing

#### Frontend Errors
- [ ] Network errors handled gracefully
- [ ] Validation errors display correctly
- [ ] Loading states work
- [ ] Error messages are user-friendly

#### Backend Errors
- [ ] Database errors handled
- [ ] Transaction rollback works
- [ ] Error responses are proper JSON
- [ ] Status codes are correct

---

### 6. Performance Testing

#### Response Times
- [ ] Health check: < 100ms
- [ ] Email check: < 500ms
- [ ] Company registration: < 2s
- [ ] Step 4 registration: < 5s

#### Database Queries
- [ ] No N+1 queries
- [ ] Indexes used correctly
- [ ] Transactions are efficient

---

## 📊 Testing Results Template

### Backend Tests
```
Health Check: [ ] Pass / [ ] Fail
Email Check: [ ] Pass / [ ] Fail
Company Registration Step 1: [ ] Pass / [ ] Fail
Company Registration Step 4: [ ] Pass / [ ] Fail
Database Connection: [ ] Pass / [ ] Fail
```

### Frontend Tests
```
Routes Load: [ ] Pass / [ ] Fail
Form Validations: [ ] Pass / [ ] Fail
Conditional Fields: [ ] Pass / [ ] Fail
Live Email Check: [ ] Pass / [ ] Fail
Theme Switching: [ ] Pass / [ ] Fail
```

### E2E Tests
```
Company Registration Flow: [ ] Pass / [ ] Fail
Employee Registration: [ ] Pass / [ ] Fail
Manager Assignment: [ ] Pass / [ ] Fail
Validation Rules: [ ] Pass / [ ] Fail
```

---

## 🐛 Known Issues to Monitor

1. **Design System:** 5% remaining hardcoded colors (not blocker)
2. **Console Logs:** Some debug logs in production (can be removed later)
3. **PORT:** Railway sets 8080 automatically (verified)

---

## ✅ Success Criteria

- [ ] All backend endpoints work
- [ ] All frontend routes work
- [ ] All validations work
- [ ] All conditional logic works
- [ ] Database queries are efficient
- [ ] Error handling works
- [ ] Performance is acceptable

---

## 📞 If Issues Arise

1. Check Railway deployment logs
2. Check Vercel deployment logs
3. Check database connection
4. Verify environment variables
5. Check API responses
6. Review error messages
7. Check documentation in `docs/` folder

---

**תאריך:** 2025-01-XX  
**סטטוס:** ✅ Ready for Testing

