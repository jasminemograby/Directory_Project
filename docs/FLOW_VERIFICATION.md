# Flow Verification - User Flow Check

**Date:** 2025-01-XX  
**Status:** Comprehensive Flow Review

---

## 📋 Flow 1: Company Registration Flow

### ✅ Step 1: HR Registration/Login (Auth Service)
**Status:** ✅ Implemented (Mock)
- **Location:** `backend/controllers/authController.js`
- **Flow:** HR logs in with email (no password for now)
- **Returns:** Auth token with employee data
- **Note:** Currently mock - will integrate with real Auth Service later

### ✅ Step 2: Company Registration Form - Step 1: Basic Registration
**Status:** ✅ Fully Implemented
- **Frontend:** `frontend/src/components/CompanyRegistration/CompanyRegistrationStep1.js`
- **Backend:** `backend/controllers/companyRegistrationController.js` → `registerCompanyStep1`
- **Input:** Company name, industry, HR name/email/role, domain
- **Output:** Company record created with `verification_status = 'pending'`
- **HR Data:** Stored in `company_settings` table (hr_name, hr_email, hr_role)
- **Next Step:** Redirects to Verification page

**✅ Verified:**
- Form validation ✅
- Company creation ✅
- HR data storage ✅
- Domain verification initiation ✅

### ✅ Step 3: Company Legitimacy Verification - Domain Check
**Status:** ✅ Implemented
- **Service:** `backend/services/companyVerificationService.js`
- **Method:** Checks if domain has email service (MX record check)
- **Status Update:** `verification_status` updated to 'verified' or 'rejected'
- **Frontend:** `frontend/src/components/CompanyRegistration/CompanyRegistrationVerification.js`
- **Polling:** Auto-refreshes status every 10 seconds
- **If Invalid:** Email sent to HR (via emailService - placeholder)
- **If Valid:** Allows continuation to Step 4

**✅ Verified:**
- Domain verification logic ✅
- Status polling ✅
- Redirect on verification ✅

### ✅ Step 4: Company Registration Form - Step 4: Full Setup
**Status:** ✅ Fully Implemented
- **Frontend:** `frontend/src/components/CompanyRegistration/CompanyRegistrationStep4.js`
- **Backend:** `backend/controllers/companyRegistrationController.js` → `registerCompanyStep4`
- **Input:**
  - Employees list (names, emails, roles, types, external links)
  - Departments and teams structure
  - Learning path policy
  - Primary KPI
  - Company settings (exercise_limit, passing_grade, max_attempts)
- **Process:**
  1. Validates company is verified
  2. Creates departments and teams (if provided)
  3. Creates employee records (skips HR if already exists)
  4. Creates HR employee record (if not in employees list)
  5. Updates department/team managers
  6. Stores external data links
  7. Stores company settings
  8. Stores learning path policy
- **Output:** 
  - Company ID
  - HR Employee ID
  - HR Email
- **Next Step:** Redirects to HR Dashboard

**✅ Verified:**
- Transaction-based creation ✅
- HR employee creation ✅
- Employee creation ✅
- Department/Team creation ✅
- Manager assignment ✅
- External links storage ✅
- Company settings storage ✅

### ✅ Step 5: Employee Registration Check (F003)
**Status:** ✅ Implemented (Async)
- **Controller:** `backend/controllers/employeeRegistrationController.js`
- **Function:** `checkCompanyEmployeesRegistration(companyId)`
- **Process:**
  1. Gets all employees for company
  2. Checks with Auth Service (mock) if employees are registered
  3. Separates registered vs unregistered
  4. Sends notification to HR about unregistered employees
- **Notification:** Via SendPulse API (in-app notification)
- **Note:** Runs asynchronously after Step 4 completes (doesn't block registration)

**✅ Verified:**
- Employee registration check ✅
- Notification to HR ✅
- Async execution ✅

---

## 📋 Flow 2: Employee Profile Creation & Enrichment

### ⚠️ Step 1: External Data Collection (F004)
**Status:** ⚠️ Partially Implemented
- **Current:** External links are stored in `external_data_links` table during registration
- **Missing:** Automatic data collection from external APIs after registration
- **Note:** Data collection happens when employee connects accounts via `EnhanceProfile` component
- **Flow:** Employee must manually connect LinkedIn/GitHub accounts

**✅ What Works:**
- External links storage during registration ✅
- Manual connection via EnhanceProfile component ✅

**❌ What's Missing:**
- Automatic data collection after registration (as per flow.md)
- Collection from Credly, YouTube, ORCID, Crossref (only LinkedIn/GitHub implemented)

### ⚠️ Step 2: AI-Enhanced Profile Enrichment (F005)
**Status:** ⚠️ Partially Implemented
- **Current:** Enrichment happens when employee connects external accounts
- **Service:** `backend/services/geminiService.js`
- **Process:** 
  - Employee connects LinkedIn/GitHub
  - Raw data collected
  - Gemini generates bio and projects
- **Missing:** Automatic enrichment after registration (waits for employee action)

**✅ What Works:**
- Bio generation from LinkedIn/GitHub ✅
- Project identification and summarization ✅
- Fallback to mock data ✅

**❌ What's Missing:**
- Automatic enrichment after registration (requires employee to connect accounts)

### ✅ Step 3: Skills Engine Integration - Normalization (F006)
**Status:** ✅ Implemented (Mock)
- **Service:** `backend/services/mockSkillsEngineService.js`
- **Process:** Returns normalized skills structure
- **Fallback:** Mock data if Skills Engine unavailable
- **Note:** Currently using mock - will integrate with real Skills Engine when available

### ⚠️ Step 4: Employee Profile Creation (F007)
**Status:** ⚠️ Partially Implemented
- **Current:** Employee records created during Step 4 with `profile_status = 'pending'`
- **Missing:** Automatic profile enrichment after creation
- **Note:** Profile enrichment requires employee to connect external accounts

**✅ What Works:**
- Employee record creation ✅
- Profile status = 'pending' ✅
- Basic profile data stored ✅

**❌ What's Missing:**
- Automatic enrichment after creation
- Skills normalization at creation time

### ✅ Step 5: HR Initial Profile Approval (F007A)
**Status:** ✅ Fully Implemented
- **Controller:** `backend/controllers/profileApprovalController.js`
- **Frontend:** `frontend/src/pages/HRDashboard.js` → Pending Profiles section
- **Process:**
  1. HR views pending profiles
  2. HR reviews profile data
  3. HR approves/rejects
  4. Profile status updated to 'approved' or 'rejected'
- **Note:** Profiles start as 'pending' and require HR approval

**✅ Verified:**
- Pending profiles list ✅
- Approval workflow ✅
- Status update ✅

### ⚠️ Step 6: Employee Card Generation (F007B)
**Status:** ⚠️ Partially Implemented
- **Current:** Value proposition generated on-demand when viewing profile
- **Service:** `backend/services/valuePropositionService.js`
- **Missing:** Automatic card generation after approval
- **Note:** Card components exist but generation happens on-demand

**✅ What Works:**
- Value proposition generation ✅
- Relevance score calculation ✅
- Skills tree display ✅
- Career block display ✅

---

## 🔍 Flow Analysis - Issues Found

### Issue 1: Employee Profile Enrichment Flow
**Problem:** 
- Flow.md says: "For each employee in registration form (Step 2): Directory uses external data source links provided by HR during registration"
- Current Implementation: External links are stored, but data collection happens only when employee manually connects accounts

**Gap:**
- Flow expects automatic data collection after registration
- Current implementation requires employee action (connecting accounts)

**Recommendation:**
- Option A: Keep current flow (employee connects accounts manually) - more privacy-friendly
- Option B: Implement automatic collection after registration (as per flow.md)

**Question for User:** Should we implement automatic data collection after registration, or keep the manual connection flow?

---

### Issue 2: Profile Status After Registration
**Problem:**
- Flow.md doesn't explicitly state when profile status should be 'pending' vs 'approved'
- Current: All profiles start as 'pending' and require HR approval

**Current Flow:**
1. Employee created → `profile_status = 'pending'`
2. Employee connects accounts → Enrichment happens
3. HR approves → `profile_status = 'approved'`

**This seems correct** - profiles need approval before being fully active.

---

### Issue 3: Employee Notification After Registration
**Problem:**
- Flow.md Step 6: "HR prompts unregistered employees to register"
- Current: Notification sent to HR about unregistered employees
- Missing: Direct notification to employees

**Current Implementation:**
- HR receives notification about unregistered employees
- HR must manually contact employees

**Recommendation:**
- Add direct email/notification to employees inviting them to register
- Or: Add employee invitation flow

**Question for User:** Should we add direct employee notifications, or is HR notification sufficient?

---

## ✅ What Works Correctly

### 1. Company Registration Flow ✅
- Step 1 → Verification → Step 4 → HR Dashboard
- All steps implemented correctly
- HR employee created automatically
- Employee records created
- Departments/Teams created

### 2. Employee Registration Check ✅
- Checks with Auth Service (mock)
- Separates registered/unregistered
- Notifies HR about unregistered

### 3. Profile Approval Flow ✅
- Profiles start as 'pending'
- HR can view pending profiles
- HR can approve/reject
- Status updates correctly

### 4. Profile Enrichment Flow ✅
- Employee connects accounts
- Data collected from LinkedIn/GitHub
- Gemini generates bio/projects
- Skills normalized (mock)
- Profile updated

---

## 📝 Recommendations

### Priority 1: Clarify Employee Enrichment Flow
**Question:** Should profile enrichment be:
- **A)** Automatic after registration (using links from Step 4)?
- **B)** Manual (employee connects accounts when ready)?

**Current:** B (Manual)
**Flow.md suggests:** A (Automatic)

### Priority 2: Employee Notifications
**Question:** Should we:
- **A)** Add direct employee notifications after registration?
- **B)** Keep HR notification only?

**Current:** B (HR notification only)

### Priority 3: Profile Status Flow
**Current flow seems correct:**
- Employee created → 'pending'
- Employee enriches → Still 'pending'
- HR approves → 'approved'

**Question:** Is this the desired flow?

---

## ✅ Summary

**Flow 1 (Company Registration):** ✅ Fully Implemented
- All steps work correctly
- HR employee created automatically
- Employees created
- Registration check works

**Flow 2 (Profile Enrichment):** ⚠️ Partially Implemented
- Manual enrichment works (employee connects accounts)
- Automatic enrichment after registration is missing
- Approval flow works correctly

**Main Gap:** 
- Flow.md expects automatic data collection after registration
- Current implementation requires manual connection

**Recommendation:** 
- Keep manual connection (more privacy-friendly)
- OR implement automatic collection (as per flow.md)
- Need user decision on this

