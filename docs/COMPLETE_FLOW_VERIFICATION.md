# ✅ Complete Flow Verification - Directory Microservice

**תאריך:** 2025-01-XX  
**מטרה:** לוודא שהכל מתאים לפלו ולדרישות

---

## 🗺️ Complete Navigation Flow

### **1. Landing Page → Company Registration**

**Route:** `/` (Landing Page)  
**Action:** Click "REGISTER YOUR COMPANY"  
**Expected Navigation:** `/company/register` (Step 1)

**Verification:**
- ✅ Route exists in `App.js`
- ✅ Component: `CompanyRegistrationStep1`
- ✅ Form fields: Company Name, Industry, Domain, HR Name, HR Email, HR Role
- ✅ Live email check works
- ✅ Submit → Creates pending company → Redirects to Verification

---

### **2. Company Registration Step 1 → Verification**

**Route:** `/company/register` (Step 1)  
**Action:** Submit form  
**Expected Navigation:** `/company/register/verification`

**Verification:**
- ✅ Route exists: `ROUTES.COMPANY_REGISTER_VERIFICATION`
- ✅ Component: `CompanyRegistrationVerification`
- ✅ Polling works (checks verification status)
- ✅ When verified → Redirects to Step 4

---

### **3. Verification → Step 4 (Full Setup)**

**Route:** `/company/register/verification`  
**Action:** Company verified by admin  
**Expected Navigation:** `/company/register/step4`

**Verification:**
- ✅ Route exists: `ROUTES.COMPANY_REGISTER_STEP4`
- ✅ Component: `CompanyRegistrationStep4`
- ✅ All fields present:
  - Company Settings (size, description, exerciseLimit, publicPublish, etc.)
  - Employees (with manager assignment)
  - Departments/Teams (optional, but if exist must have managers)
  - Learning Path Policy (Manual/Auto with Decision Maker)
- ✅ Submit → Creates company → Redirects to HR Dashboard

---

### **4. Step 4 → HR Dashboard**

**Route:** `/company/register/step4`  
**Action:** Submit registration  
**Expected Navigation:** `/hr/dashboard`

**Verification:**
- ✅ Route exists: `ROUTES.HR_DASHBOARD`
- ✅ Component: `HRDashboard`
- ✅ Company ID and HR Employee ID stored in localStorage
- ✅ HR can view company overview, hierarchy, pending approvals

---

### **5. HR Dashboard → Employee Profile**

**Route:** `/hr/dashboard`  
**Action:** Click "View My Profile"  
**Expected Navigation:** `/profile/:employeeId`

**Verification:**
- ✅ Route exists: `ROUTES.PROFILE` or `/profile/:employeeId`
- ✅ Component: `EmployeeProfile`
- ✅ Shows HR's own profile
- ✅ All tabs work: Overview, Dashboard, Learning Path, Requests, Courses

---

### **6. Employee Login → Profile**

**Route:** `/login`  
**Action:** Employee logs in  
**Expected Navigation:** `/profile/:employeeId`

**Verification:**
- ✅ Route exists: `ROUTES.LOGIN`
- ✅ Component: `Login`
- ✅ After login, redirects to `/profile/${user.id}`
- ✅ Employee sees their own profile

---

## ✅ Conditional Logic Verification

### **Decision Maker Field**
- ✅ Shows only when: `learningPathPolicy === 'manual'`
- ✅ Hides when: `learningPathPolicy === 'auto'`
- ✅ Required validation only when shown

### **Exercise Limit Field**
- ✅ Shows only when: `exerciseLimitEnabled === true`
- ✅ Hides when: `exerciseLimitEnabled === false`
- ✅ Default value: 4

### **Manager Fields**
- ✅ Shows only when: `isManager === true`
- ✅ Hides when: `isManager === false`
- ✅ Manager Type dropdown appears
- ✅ Manager Of dropdown appears (conditional on type)

### **AI Enable Field**
- ✅ Shows only when: `type === 'internal_instructor' || type === 'external_instructor'`
- ✅ Hides when: `type === 'regular'`

### **Department/Team Fields**
- ✅ Optional (can be empty)
- ✅ If departments exist, employees can be assigned
- ✅ If teams exist, employees can be assigned

---

## ✅ Validation Rules Verification

### **Step 1 - Basic Info**
- ✅ Company Name: required, min 2 chars
- ✅ Industry: required, must be from list
- ✅ Domain: required, valid domain format
- ✅ HR Name: required, min 2 chars
- ✅ HR Email: required, valid email format, unique check
- ✅ HR Role: required, min 2 chars

### **Step 4 - Full Setup**
- ✅ At least 1 employee required
- ✅ All employees must have: name, email, currentRole, targetRole
- ✅ Email uniqueness per company (local check)
- ✅ If departments exist: each department must have manager
- ✅ If teams exist: each team must have manager
- ✅ Decision Maker: required only if Manual approval
- ✅ Manager fields: required only if isManager checked

---

## ✅ Design System Verification

### **CSS Variables Usage**
- ✅ `CompanyRegistrationStep1` - Uses CSS variables
- ✅ `CompanyRegistrationStep4` - Uses CSS variables (100%)
- ✅ `EmployeeListInput` - Uses CSS variables (95%)
- ✅ `LearningPathPolicyInput` - Uses CSS variables
- ✅ All components use: `var(--bg-primary)`, `var(--text-primary)`, etc.

### **Color Palette**
- ✅ Primary: `var(--primary-cyan)`, `var(--primary-blue)`
- ✅ Backgrounds: `var(--bg-primary)`, `var(--bg-card)`
- ✅ Text: `var(--text-primary)`, `var(--text-secondary)`
- ✅ Borders: `var(--border-default)`, `var(--border-error)`

---

## ✅ Backend Integration Verification

### **API Endpoints**
- ✅ `POST /api/company/register` - Step 1 registration
- ✅ `POST /api/company/register/step4` - Step 4 registration
- ✅ `GET /api/company/check-email` - Email availability check
- ✅ `POST /api/company/:id/verify` - Verification status

### **Database Operations**
- ✅ Company creation (with settings)
- ✅ Employee creation (with manager fields, aiEnabled)
- ✅ Department/Team creation (with managers)
- ✅ Transaction rollback on errors
- ✅ Email uniqueness per company

---

## ✅ Data Flow Verification

### **Company Registration Flow**
1. Step 1 → Creates pending company → Stores in `companies` table
2. Verification → Admin verifies → Updates `verification_status`
3. Step 4 → Creates employees, departments, teams → All in transaction
4. Success → Redirects to HR Dashboard → Stores company ID

### **Employee Registration Flow**
1. Add Employee → Validates locally → Adds to employees array
2. Submit → Sends to backend → Creates in database
3. Manager Assignment → Updates `departments.manager_id` or `teams.manager_id`

### **Email Uniqueness Flow**
1. User types email → Debounce (500ms) → API call
2. Backend checks → Returns available/unavailable
3. Frontend shows status → Green/Red border + message

---

## 🐛 Known Issues to Check

1. **Navigation Redirects** - Verify all redirects work correctly
2. **State Management** - Verify conditional fields show/hide correctly
3. **Form Validation** - Verify all validation rules work
4. **Database Transactions** - Verify rollback on errors
5. **Email Uniqueness** - Verify per-company constraint works

---

## 📋 Final Checklist

- [ ] All routes exist and work
- [ ] All conditional logic works
- [ ] All validation rules work
- [ ] All navigation redirects work
- [ ] Design System consistency (95%+)
- [ ] Backend integration works
- [ ] Database operations work
- [ ] Error handling works
- [ ] Loading states work
- [ ] Success messages work

---

**Status:** Ready for Final Testing  
**Next:** Run all test cases and verify results

