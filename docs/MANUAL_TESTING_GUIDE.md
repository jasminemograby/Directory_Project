# 🧪 Manual Testing Guide - Directory Microservice

**תאריך:** 2025-01-XX  
**מטרה:** מדריך לבדיקות ידניות מהירות

---

## ⚡ Quick Tests (5 דקות)

### 1. Backend Health Check
```bash
# בדוקאקאנד עובד
curl https://directoryproject-production.up.railway.app/api/health
```
**Expected:** `{ "status": "ok", ... }`

### 2. Email Check
```bash
# בדוק endpoint של email check
curl "https://directoryproject-production.up.railway.app/api/company/check-email?email=test@example.com"
```
**Expected:** `{ "success": true, "available": true/false }`

### 3. Frontend Routes
פתח בדפדפן:
- `https://your-vercel-app.vercel.app/company/register`
- `https://your-vercel-app.vercel.app/hr/dashboard`

**Expected:** Pages load without errors

---

## 🧪 Full Test Flow (30-60 דקות)

### Test 1: Company Registration Step 1

**Steps:**
1. לך ל-`/company/register`
2. מלא את הטופס:
   - Company Name: "Test Company"
   - Industry: בחר מהרשימה
   - Domain: "testcompany.com"
   - HR Name: "Test HR"
   - HR Email: "testhr@testcompany.com"
   - HR Role: "HR Manager"
3. **צפה ל:** Live email check (border ירוק/אדום)
4. לחץ "Submit"

**Expected:**
- ✅ Form validates correctly
- ✅ Live email check works
- ✅ Redirects to verification page

---

### Test 2: Company Registration Step 4

**Steps:**
1. אחרי verification, לך ל-Step 4
2. מלא Company Settings:
   - Company Size: 50
   - Learning Path Policy: Manual
   - Decision Maker: בחר employee
   - Passing Grade: 70
   - Max Attempts: 3
   - Exercise Limit: ✓ (value: 4)
   - Public Publish: Yes
   - Company Bio: "Test description"
3. הוסף Employees:
   - Employee 1: Regular (no manager)
   - Employee 2: Trainer (with AI Enable ✓)
   - Employee 3: Manager (Department Manager)
4. הוסף Departments:
   - Department: "Engineering" (with manager: Employee 3)
5. לחץ "Submit Registration"

**Expected:**
- ✅ All fields save correctly
- ✅ Employees created
- ✅ Departments created
- ✅ Manager assignments work
- ✅ Redirects to HR Dashboard

---

### Test 3: Conditional Fields

**Decision Maker:**
- [ ] Select "Auto" → Decision Maker field HIDDEN
- [ ] Select "Manual" → Decision Maker field SHOWN

**Exercise Limit:**
- [ ] Uncheck → Number field HIDDEN
- [ ] Check → Number field SHOWN (default: 4)

**Manager Fields:**
- [ ] Uncheck "Is Manager" → Manager fields HIDDEN
- [ ] Check "Is Manager" → Manager fields SHOWN

**AI Enable:**
- [ ] Select "Regular Employee" → AI Enable HIDDEN
- [ ] Select "Trainer" → AI Enable SHOWN

---

### Test 4: Validation

**Email Uniqueness:**
- [ ] Type duplicate email → Shows error
- [ ] Type new email → Shows "✓ Available"

**Manager Assignment:**
- [ ] Check "Is Manager" but don't select type → Error
- [ ] Select type but don't select department/team → Error
- [ ] Complete all fields → No error

**Required Fields:**
- [ ] Try to submit without required fields → Errors shown
- [ ] Fill all required fields → No errors

---

## 📋 Testing Checklist

### Backend
- [ ] Health check: 200 OK
- [ ] Email check: Returns correct status
- [ ] Company registration: Creates company
- [ ] Step 4 registration: Creates employees
- [ ] Database: All data saved correctly

### Frontend
- [ ] Routes: All load correctly
- [ ] Forms: Validate correctly
- [ ] Live checks: Work correctly
- [ ] Conditional fields: Show/hide correctly
- [ ] Theme: Switching works
- [ ] Console: No errors

### E2E
- [ ] Company Registration: Complete flow works
- [ ] Employee Registration: All types work
- [ ] Manager Assignment: Works correctly
- [ ] Validations: All work correctly

---

## 🐛 Common Issues & What to Check

### Issue: Forms don't submit
**Check:**
- Browser console for errors
- Network tab for API calls
- API URL is correct

### Issue: Conditional fields don't show
**Check:**
- React state is updating
- Conditional logic is correct
- Browser console for errors

### Issue: Validations don't work
**Check:**
- Form validation functions
- Error messages display
- Required fields marked

### Issue: Database errors
**Check:**
- Migrations ran successfully
- Column names are correct
- Constraints are correct

---

## 📝 Feedback Template

**מה עובד:**
1. _______________
2. _______________

**מה לא עובד:**
1. _______________
2. _______________

**שיפורים רצויים:**
1. _______________
2. _______________

**Screenshots/Errors:**
- [ ] Attached

---

**תאריך:** 2025-01-XX  
**Status:** Ready for Manual Testing

