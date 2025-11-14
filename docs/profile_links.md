# Profile Links - Frontend Testing

## Base URL
**Vercel Frontend:** `https://directory-project-bice.vercel.app`

---

## Profile Pages

### 1. Employee Profile
**Route:** `/profile/:employeeId?` or `/profile`

**Links:**
- `https://directory-project-bice.vercel.app/profile`
- `https://directory-project-bice.vercel.app/profile/{employee-id}`

**Note:** If no employee ID is provided, the page will try to get it from `localStorage.getItem('currentEmployeeId')`

**To test:**
1. Open browser console
2. Set employee ID: `localStorage.setItem('currentEmployeeId', 'your-employee-uuid')`
3. Navigate to `/profile`

---

### 2. Trainer Profile
**Route:** `/trainer/profile/:employeeId?` or `/trainer/profile`

**Links:**
- `https://directory-project-bice.vercel.app/trainer/profile`
- `https://directory-project-bice.vercel.app/trainer/profile/{employee-id}`

**Note:** Employee must have `type = 'internal_instructor'` or `type = 'external_instructor'` in the database

**To test:**
1. Set employee ID in localStorage (must be a trainer)
2. Navigate to `/trainer/profile`

---

### 3. Team Leader Profile
**Route:** `/team-leader/profile/:employeeId?` or `/team-leader/profile`

**Links:**
- `https://directory-project-bice.vercel.app/team-leader/profile`
- `https://directory-project-bice.vercel.app/team-leader/profile/{employee-id}`

**Note:** Shows hierarchy tree with team and employees

**To test:**
1. Set employee ID in localStorage (must be assigned to a team)
2. Navigate to `/team-leader/profile`

---

### 4. Department Manager Profile
**Route:** `/department-manager/profile/:employeeId?` or `/department-manager/profile`

**Links:**
- `https://directory-project-bice.vercel.app/department-manager/profile`
- `https://directory-project-bice.vercel.app/department-manager/profile/{employee-id}`

**Note:** Shows full hierarchy: department → teams → employees

**To test:**
1. Set employee ID in localStorage (must be assigned to a department)
2. Navigate to `/department-manager/profile`

---

### 5. Company Profile (HR View)
**Route:** `/company/:companyId`

**Links:**
- `https://directory-project-bice.vercel.app/company/{company-id}`

**Note:** Shows company overview, KPIs, hierarchy, requests, and employee list

**To test:**
1. Get company ID from database or localStorage (`localStorage.getItem('companyId')`)
2. Navigate to `/company/{company-id}`

---

### 6. Super Admin Profile
**Route:** `/admin/dashboard`

**Links:**
- `https://directory-project-bice.vercel.app/admin/dashboard`

**Note:** Shows all companies, all employees (read-only), and system logs

**To test:**
1. Navigate directly to `/admin/dashboard`
2. No authentication required (for now - will be added later)

---

## How to Get Employee/Company IDs

### Option 1: From Database (Supabase)
```sql
-- Get all employees
SELECT id, name, email, type FROM employees ORDER BY created_at DESC LIMIT 10;

-- Get all companies
SELECT id, name, domain FROM companies ORDER BY created_at DESC LIMIT 10;
```

### Option 2: From Browser Console (after company registration)
```javascript
// Employee ID
localStorage.getItem('currentEmployeeId')

// Company ID
localStorage.getItem('companyId')

// HR Email
localStorage.getItem('hrEmail')
```

### Option 3: From Network Tab
1. Open browser DevTools → Network tab
2. Complete company registration
3. Look for API responses that contain `id` fields

---

## Quick Test Flow

### Test Employee Profile:
1. Complete company registration (creates HR employee)
2. Open console: `localStorage.getItem('currentEmployeeId')`
3. Navigate to: `https://directory-project-bice.vercel.app/profile`

### Test Trainer Profile:
1. Find a trainer employee ID from database
2. Set in console: `localStorage.setItem('currentEmployeeId', 'trainer-uuid')`
3. Navigate to: `https://directory-project-bice.vercel.app/trainer/profile`

### Test Company Profile:
1. After company registration, get company ID
2. Navigate to: `https://directory-project-bice.vercel.app/company/{company-id}`

### Test Super Admin:
1. Navigate directly to: `https://directory-project-bice.vercel.app/admin/dashboard`

---

## Expected Features per Profile

### Employee Profile:
- ✅ Top section (name, email, Edit/Dashboard buttons)
- ✅ External data icons (LinkedIn, GitHub, Credly, ORCID, Crossref, YouTube)
- ✅ Professional Bio (AI-generated from Gemini)
- ✅ Projects section (from GitHub/LinkedIn)
- ✅ Career Block (current role, target role, value proposition, relevance score)
- ✅ Skills Tree (hierarchical competencies → skills)
- ✅ Courses Section (assigned, learning, completed)
- ✅ Requests Section (training, trainer, skill verification, self-learning)
- ✅ Enhance Profile section (OAuth for LinkedIn/GitHub)

### Trainer Profile:
- ✅ All Employee Profile features
- ✅ Trainer Info Section (status, AI enabled, public publish enabled)
- ✅ Courses Taught (from Content Studio)
- ✅ Teaching Requests Section

### Team Leader Profile:
- ✅ All Employee Profile features
- ✅ Hierarchy Tree (Team → Employees, clickable)

### Department Manager Profile:
- ✅ All Employee Profile features
- ✅ Hierarchy Tree (Department → Teams → Employees, clickable)

### Company Profile:
- ✅ Company Overview (name, industry, departments, teams, KPIs)
- ✅ Hierarchy Tree (Company → Departments → Teams → Employees)
- ✅ Requests Section (pending approvals)
- ✅ Employee List (name, email, role, status, quick actions)
- ✅ Company Dashboard button (redirects to Learning Analytics)

### Super Admin Profile:
- ✅ Companies Tab (all companies with statistics)
- ✅ Employees Tab (all employees across companies, read-only)
- ✅ Logs Tab (system logs - placeholder)
- ✅ Analytics Dashboard button (redirects to Management Reporting)

---

## Notes

- All profiles require GitHub connection for enrichment (LinkedIn is optional)
- Mock data is used as fallback if external microservices are unavailable
- Profile enrichment (Gemini) happens automatically after GitHub connection
- Value proposition is generated by Gemini using `current_role` and `target_role`

