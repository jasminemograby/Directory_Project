# 🚀 Quick Test Guide - Directory Microservice

**תאריך:** 2025-01-XX  
**מטרה:** בדיקות מהירות ל-Production

---

## ⚡ Quick Tests (5 minutes)

### 1. Backend Health Check
```bash
curl https://directoryproject-production.up.railway.app/api/health
```
**Expected:** `{ "status": "ok", ... }`

### 2. Email Check Endpoint
```bash
curl "https://directoryproject-production.up.railway.app/api/company/check-email?email=test@example.com"
```
**Expected:** `{ "success": true, "available": true/false }`

### 3. Frontend Routes
Open in browser:
- `https://your-vercel-app.vercel.app/company/register`
- `https://your-vercel-app.vercel.app/hr/dashboard`
- `https://your-vercel-app.vercel.app/profile/me`

**Expected:** Pages load without errors

---

## 🧪 Full Test Flow (15 minutes)

### Step 1: Company Registration
1. Go to `/company/register`
2. Fill form:
   - Company Name: "Test Company"
   - Industry: Select from list
   - Domain: "testcompany.com"
   - HR Name: "Test HR"
   - HR Email: "testhr@testcompany.com"
   - HR Role: "HR Manager"
3. Watch for live email check (green/red border)
4. Click "Submit"
5. **Expected:** Redirects to verification page

### Step 2: Verification (if admin)
1. Wait for verification or verify manually
2. **Expected:** Redirects to Step 4

### Step 3: Full Company Setup
1. Fill Company Settings:
   - Company Size: 50
   - Learning Path Policy: Manual
   - Decision Maker: Select employee
   - Passing Grade: 70
   - Max Attempts: 3
   - Exercise Limit: Checked, value: 4
   - Public Publish: Yes
   - Company Bio: "Test description"
   - Primary KPI: "Skill development"
2. Add Employees:
   - Employee 1: Regular (no manager)
   - Employee 2: Trainer (with AI Enable)
   - Employee 3: Manager (Department Manager)
3. Add Departments:
   - Department: "Engineering" (with manager: Employee 3)
   - Team: "Backend" (with manager: Employee 4)
4. Click "Submit Registration"
5. **Expected:** Redirects to HR Dashboard

---

## ✅ Verification Checklist

### Backend
- [ ] Health check returns 200 OK
- [ ] Email check endpoint works
- [ ] Company registration creates company
- [ ] Step 4 registration creates employees
- [ ] Database connection works
- [ ] No errors in logs

### Frontend
- [ ] All routes load
- [ ] Forms validate correctly
- [ ] Live email check works
- [ ] Conditional fields show/hide
- [ ] Theme switching works
- [ ] No console errors

### Database
- [ ] New columns exist
- [ ] Constraints work
- [ ] Data saves correctly
- [ ] Queries are fast

---

## 🐛 Common Issues & Fixes

### Issue: Health check fails
**Fix:** Check Railway deployment logs, verify PORT=8080

### Issue: Email check doesn't work
**Fix:** Verify DATABASE_URL is set correctly in Railway

### Issue: Forms don't submit
**Fix:** Check browser console for errors, verify API URL

### Issue: Conditional fields don't show
**Fix:** Check React state, verify conditional logic

### Issue: Database errors
**Fix:** Verify migrations ran, check column names

---

## 📊 Test Results Template

```
Date: _______________
Tester: _______________

Backend Tests:
- Health Check: [ ] Pass / [ ] Fail
- Email Check: [ ] Pass / [ ] Fail
- Company Registration: [ ] Pass / [ ] Fail

Frontend Tests:
- Routes Load: [ ] Pass / [ ] Fail
- Form Validation: [ ] Pass / [ ] Fail
- Conditional Fields: [ ] Pass / [ ] Fail

E2E Tests:
- Company Registration Flow: [ ] Pass / [ ] Fail
- Employee Registration: [ ] Pass / [ ] Fail

Issues Found:
1. _______________
2. _______________

Notes:
_______________
```

---

**תאריך:** 2025-01-XX  
**Status:** Ready for Quick Testing

