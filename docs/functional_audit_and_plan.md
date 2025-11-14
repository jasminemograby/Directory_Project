# Functional Audit & Development Plan

## 📋 Current Status Audit

### ✅ What's Already Built (Functional)

#### 1. Company Registration Flow
- ✅ Step 1: Basic company info (name, industry, domain, HR details)
- ✅ Step 2: Verification pending page
- ✅ Step 3: Full setup (departments, teams, employees, settings)
- ✅ Backend: Company creation, employee creation, department/team structure
- ✅ Database: Companies, departments, teams, employees tables

#### 2. Profile Pages (UI Structure)
- ✅ Employee Profile (basic structure)
- ✅ Trainer Profile (extends Employee)
- ✅ Team Leader Profile (with hierarchy)
- ✅ Department Manager Profile (with full hierarchy)
- ✅ Company Profile (HR view)
- ✅ Super Admin Profile

#### 3. External Data Integration
- ✅ LinkedIn OAuth (partial - requires Company Page)
- ✅ GitHub OAuth (working)
- ✅ Gemini AI enrichment (bio, projects)
- ✅ Value Proposition generation (Gemini)

#### 4. Backend Infrastructure
- ✅ Database schema (companies, departments, teams, employees, oauth_tokens, external_data_raw, external_data_processed)
- ✅ API routes (company, employee, profile, external, admin)
- ✅ Health check endpoints
- ✅ Mock data service (frontend)

---

## ❌ What's Missing (Critical for Full Flow)

### 1. Authentication & Role-Based Access Control (RBAC)
**Status:** ❌ NOT IMPLEMENTED
- No login system
- No role detection
- No route protection based on roles
- No user session management
- Profiles accessible without authentication

**Required:**
- Mock authentication service (since Auth Service not ready)
- Role detection from employee data
- Protected routes based on role
- Session management (localStorage-based for now)

### 2. Role-Based Navigation & Entry Points
**Status:** ❌ NOT IMPLEMENTED
- No automatic routing based on role
- No role-specific dashboards
- Users must manually navigate to profiles

**Required:**
- Role detection on login/entry
- Automatic routing:
  - HR → HR Dashboard
  - Employee → Employee Profile
  - Trainer → Trainer Profile
  - Team Leader → Team Leader Profile
  - Department Manager → Department Manager Profile
  - Admin → Super Admin Dashboard

### 3. HR Initial Profile Approval (F007A)
**Status:** ❌ NOT IMPLEMENTED
- No UI for HR to approve employee profiles
- No workflow for profile approval
- Profiles created but not approved

**Required:**
- HR Dashboard: Pending profiles section
- Approval/rejection UI
- Backend: Update profile_status to 'approved'

### 4. Skills Engine Integration (F006)
**Status:** ❌ NOT IMPLEMENTED (Mock data only)
- No actual Skills Engine API calls
- Skills displayed from mock data
- No skill normalization

**Required:**
- Mock Skills Engine service (since Skills Engine not ready)
- Skills data structure in DB
- Skills display in profiles

### 5. Course Data Integration
**Status:** ⚠️ PARTIAL (Mock data only)
- Course Builder integration: Mock
- Content Studio integration: Mock
- Assessment integration: Mock
- No actual course data display

**Required:**
- Mock Course Builder service
- Mock Content Studio service
- Course data display in profiles

### 6. Requests System
**Status:** ❌ NOT IMPLEMENTED
- No training requests
- No skill verification requests
- No self-learning requests
- No extra attempts requests
- No HR approval workflow

**Required:**
- Request creation UI
- Request storage (DB)
- HR approval UI
- Request status tracking

### 7. Company Isolation
**Status:** ❌ NOT IMPLEMENTED
- No middleware to enforce company isolation
- No validation that users can only access their company's data

**Required:**
- Company isolation middleware
- Validation in all profile/employee endpoints

### 8. Hierarchical Profile Visibility (RBAC)
**Status:** ⚠️ PARTIAL (UI exists, logic missing)
- Hierarchy tree displays correctly
- No backend validation of visibility permissions
- Anyone can view any profile

**Required:**
- RBAC service for profile visibility
- Middleware to check permissions
- Backend validation before returning profile data

---

## 🎯 Development Plan (Functional Only)

### Phase 1: Authentication & Role Detection (CRITICAL)
**Priority:** 🔴 HIGHEST

1. **Mock Authentication Service**
   - Create `frontend/src/services/mockAuthService.js`
   - Functions: `login(email)`, `getCurrentUser()`, `getUserRole()`, `logout()`
   - Store user data in localStorage
   - Map employee email → employee data → role

2. **Role Detection Logic**
   - Backend: Determine role from employee data:
     - Check if `type = 'internal_instructor'` or `'external_instructor'` → Trainer
     - Check if employee is team manager → Team Leader
     - Check if employee is department manager → Department Manager
     - Check if employee is HR (from company_settings) → HR
     - Check if employee is admin → Super Admin
     - Default → Regular Employee

3. **Protected Routes**
   - Update `ProtectedRoute.js` to use mock auth
   - Add role-based route protection
   - Redirect unauthorized users

4. **Login Page**
   - Simple email-based login (no password for now)
   - Lookup employee by email
   - Set role and redirect to appropriate dashboard

### Phase 2: Role-Based Navigation (CRITICAL)
**Priority:** 🔴 HIGHEST

1. **Entry Point Routing**
   - After login, detect role and redirect:
     - HR → `/hr/dashboard`
     - Employee → `/profile`
     - Trainer → `/trainer/profile`
     - Team Leader → `/team-leader/profile`
     - Department Manager → `/department-manager/profile`
     - Admin → `/admin/dashboard`

2. **Dashboard Updates**
   - HR Dashboard: Add "Pending Profiles" section
   - Employee Dashboard: Redirect to profile
   - Manager Dashboards: Show hierarchy + pending requests

### Phase 3: HR Profile Approval (F007A)
**Priority:** 🟡 HIGH

1. **Backend: Profile Approval Endpoint**
   - `POST /api/profile/:employeeId/approve`
   - Update `profile_status` to 'approved'
   - Return updated profile

2. **Frontend: HR Approval UI**
   - HR Dashboard: List of pending profiles
   - Approval/rejection buttons
   - Profile preview before approval

### Phase 4: Skills & Courses (Mock Data)
**Priority:** 🟡 HIGH

1. **Mock Skills Engine Service**
   - Create `backend/services/mockSkillsEngineService.js`
   - Return structured competencies/skills
   - Store in DB (skills table or employees.skills JSONB)

2. **Mock Course Builder Service**
   - Create `backend/services/mockCourseBuilderService.js`
   - Return completed/learning/assigned courses
   - Display in profile

3. **Mock Content Studio Service**
   - Create `backend/services/mockContentStudioService.js`
   - Return taught courses for trainers
   - Display in trainer profile

### Phase 5: Requests System
**Priority:** 🟢 MEDIUM

1. **Request Tables (DB)**
   - `training_requests`
   - `skill_verification_requests`
   - `self_learning_requests`
   - `extra_attempts_requests`

2. **Request Creation**
   - UI buttons in profiles
   - Backend endpoints to create requests
   - Store in DB

3. **HR Approval**
   - HR Dashboard: Requests section
   - Approve/reject functionality
   - Update request status

### Phase 6: Company Isolation & RBAC
**Priority:** 🟢 MEDIUM

1. **Company Isolation Middleware**
   - Check company_id on all requests
   - Ensure users can only access their company's data
   - Return 403 if cross-company access attempted

2. **Profile Visibility RBAC**
   - Service to check if user can view profile
   - Hierarchy-based permissions:
     - HR: All employees in company
     - Department Manager: All employees in department
     - Team Leader: All employees in team
     - Employee: Own profile only
   - Backend validation before returning profile

---

## 📝 Implementation Order

### Week 1: Core Flow
1. ✅ Mock Authentication (Day 1-2)
2. ✅ Role Detection (Day 2-3)
3. ✅ Protected Routes (Day 3-4)
4. ✅ Role-Based Navigation (Day 4-5)

### Week 2: HR Workflows
5. ✅ HR Profile Approval (Day 1-2)
6. ✅ HR Dashboard Updates (Day 2-3)
7. ✅ Company Profile Access (Day 3-4)

### Week 3: Data Integration (Mock)
8. ✅ Mock Skills Engine (Day 1-2)
9. ✅ Mock Course Builder (Day 2-3)
10. ✅ Mock Content Studio (Day 3-4)
11. ✅ Skills/Courses Display (Day 4-5)

### Week 4: Requests & Security
12. ✅ Requests System (Day 1-3)
13. ✅ Company Isolation (Day 3-4)
14. ✅ Profile Visibility RBAC (Day 4-5)

---

## 🧪 Test Scenarios (End-to-End)

### Scenario 1: Company Registration → HR Login → Profile Approval
1. HR registers company
2. Company created, employees created
3. HR logs in (email-based)
4. HR redirected to HR Dashboard
5. HR sees pending profiles
6. HR approves employee profile
7. Profile status → 'approved'

### Scenario 2: Employee Login → Profile View
1. Employee logs in (email)
2. System detects role: 'employee'
3. Redirected to `/profile`
4. Sees own profile (if approved)
5. Can connect GitHub/LinkedIn
6. Profile enriched with Gemini

### Scenario 3: Manager Login → Hierarchy View
1. Team Leader logs in
2. System detects role: 'team_leader'
3. Redirected to `/team-leader/profile`
4. Sees own profile + hierarchy tree
5. Can click on team members to view their profiles

### Scenario 4: Cross-Company Access Prevention
1. Employee from Company A logs in
2. Tries to access employee from Company B
3. System returns 403 Forbidden
4. Company isolation enforced

---

## 📌 Notes

- **No Design Work:** All UI should be functional but basic (Tailwind utility classes only)
- **Mock Data:** All external microservices use mock data until endpoints are ready
- **Authentication:** Mock auth for now (email-based, no password)
- **Focus:** Complete functional flow, not visual polish

