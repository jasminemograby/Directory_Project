# RBAC: employee.type vs employee.role - Critical Clarification

## ⚠️ IMPORTANT: Two Different Fields

### `employee.role` (Professional Job Title)
- **Purpose:** Describes the professional job title/position in the company
- **Examples:** "QA", "Developer", "HR", "Product Manager", "Designer", "Sales"
- **Usage:** Display only - shows what the employee does professionally
- **NOT USED FOR:** System permissions, RBAC, access control, navigation

### `employee.type` (RBAC Level - System Permissions)
- **Purpose:** Determines system access level and permissions (RBAC)
- **Values:**
  - `'regular'` → Regular employee (basic access)
  - `'internal_instructor'` → Internal trainer
  - `'external_instructor'` → External trainer
- **Additional RBAC Levels (determined by hierarchy):**
  - `'hr'` → HR/Company Registrar (from company_settings)
  - `'department_manager'` → Department Manager (from departments.manager_id)
  - `'team_manager'` → Team Manager (from teams.manager_id)
  - `'trainer'` → Trainer (if type is internal_instructor or external_instructor)
  - `'employee'` → Regular employee (default)
- **Usage:** All system permissions, access control, navigation, RBAC

---

## 🔒 RBAC Implementation Rules

### ✅ CORRECT Usage
```javascript
// Check RBAC type (system permissions)
const userType = authService.getUserType(); // 'hr', 'department_manager', 'team_manager', 'trainer', 'employee'
if (userType === 'hr') { ... }

// Display job title (for UI only)
const jobTitle = authService.getEmployeeRole(); // 'QA', 'Developer', etc.
```

### ❌ WRONG Usage
```javascript
// DON'T use employee.role for permissions
const userRole = user.role; // This is job title, NOT RBAC level!
if (userRole === 'QA') { ... } // WRONG - QA is not a permission level!
```

---

## 📋 Backend Implementation

### Auth Controller
- Determines RBAC type from:
  1. HR check (from company_settings)
  2. Department manager check (from departments.manager_id)
  3. Team manager check (from teams.manager_id)
  4. Trainer check (if employee.type is internal_instructor/external_instructor)
  5. Default: 'employee'

- Returns:
  - `user.type` → RBAC level (used for permissions)
  - `user.employeeRole` → Job title (display only)
  - `user.employeeType` → Original employee.type from DB

### Database Schema
```sql
employees (
  id UUID,
  name VARCHAR,
  email VARCHAR,
  role VARCHAR,        -- Professional job title (QA, Developer, etc.) - NOT for RBAC
  type VARCHAR,        -- 'regular', 'internal_instructor', 'external_instructor' - used for RBAC
  team_id UUID,        -- Used to check if team manager
  department_id UUID,  -- Used to check if department manager
  ...
)
```

---

## 🎯 Frontend Implementation

### Auth Service
- `getUserType()` → Returns RBAC level (use this for permissions)
- `getEmployeeRole()` → Returns job title (display only)
- `getUserRole()` → Backward compatibility (returns type, not role)

### Navigation
- All navigation based on `user.type` (RBAC level)
- Job title (`user.employeeRole`) never used for navigation

### Protected Routes
- All route protection based on `user.type` (RBAC level)
- `allowedRoles` array should contain RBAC types, not job titles

---

## ✅ Verification Checklist

- [x] Backend auth controller uses `employee.type` and hierarchy checks for RBAC
- [x] Backend returns `user.type` (RBAC) and `user.employeeRole` (job title) separately
- [x] Frontend auth service has `getUserType()` for RBAC and `getEmployeeRole()` for display
- [x] All navigation based on `user.type` (RBAC level)
- [x] All protected routes check `user.type` (RBAC level)
- [x] No code uses `employee.role` for permissions or access control

---

## 📝 Examples

### Example 1: QA Employee
```javascript
{
  name: "John Doe",
  email: "john@company.com",
  role: "QA",                    // Job title - NOT for permissions
  type: "regular",              // RBAC level - used for permissions
  team_id: null,
  department_id: null
}
// RBAC: 'employee' (regular access)
// Navigation: /profile
```

### Example 2: Developer Team Manager
```javascript
{
  name: "Jane Smith",
  email: "jane@company.com",
  role: "Developer",            // Job title - NOT for permissions
  type: "regular",              // Original type
  team_id: "team-uuid",
  // Is manager of team_id
}
// RBAC: 'team_manager' (team management access)
// Navigation: /team-leader/profile
```

### Example 3: HR Manager
```javascript
{
  name: "HR Person",
  email: "hr@company.com",
  role: "HR Manager",           // Job title - NOT for permissions
  type: "regular",              // Original type
  // Email matches company_settings.hr_email
}
// RBAC: 'hr' (HR access)
// Navigation: /hr/dashboard
```

---

## 🚨 Common Mistakes to Avoid

1. **Using `employee.role` for permissions** ❌
   - Wrong: `if (user.role === 'QA') { allowAccess() }`
   - Right: `if (user.type === 'employee') { allowAccess() }`

2. **Mixing job title with RBAC level** ❌
   - Wrong: `const isManager = user.role === 'Manager'`
   - Right: `const isManager = user.type === 'department_manager' || user.type === 'team_manager'`

3. **Navigation based on job title** ❌
   - Wrong: `if (user.role === 'Developer') { navigate('/dev-dashboard') }`
   - Right: `if (user.type === 'employee') { navigate('/profile') }`

---

## 📌 Summary

- **`employee.role`** = Professional job title (QA, Developer, etc.) → Display only
- **`employee.type`** = RBAC level (hr, department_manager, team_manager, trainer, employee) → All permissions
- **Always use `employee.type` (or derived RBAC level) for:**
  - Access control
  - Navigation
  - Route protection
  - Permission checks
  - Feature visibility

- **Never use `employee.role` for:**
  - Permissions
  - Access control
  - Navigation
  - RBAC checks

