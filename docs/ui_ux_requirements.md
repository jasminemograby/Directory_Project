# Directory Microservice - Complete UI/UX Requirements Document

## Overview

This document provides a comprehensive, production-ready UI/UX specification for the Directory microservice. It covers all pages, components, navigation flows, user journeys, and UI states based on the complete requirements (56 features), flow document (16 flows), and architecture specifications.

**Design Principles:**
- **Coherent & Intuitive:** Logical flow between all pages with no dead ends
- **Role-Based:** Contextual navigation and permissions for each user type
- **Complete:** All intermediate pages, modals, confirmations, error states included
- **Production-Ready:** Comprehensive coverage of all features and edge cases
- **Accessible:** WCAG 2.1 AA compliance, keyboard navigation, screen reader support
- **Responsive:** Mobile-first design for all devices

---

## Design System

### Color Palette (Dark Emerald Theme)

**Primary Colors:**
- `--primary-blue: #065f46`
- `--primary-purple: #047857`
- `--primary-cyan: #0f766e`

**Accent Colors:**
- `--accent-gold: #d97706`
- `--accent-green: #047857`
- `--accent-orange: #f59e0b`

**Neutral Colors:**
- `--bg-primary: #f8fafc` (Day) / `#0f172a` (Night)
- `--bg-secondary: #e2e8f0` (Day) / `#1e293b` (Night)
- `--bg-card: #ffffff` (Day) / `#1e293b` (Night)
- `--text-primary: #1e293b` (Day) / `#f8fafc` (Night)
- `--text-secondary: #475569` (Day) / `#cbd5e1` (Night)
- `--text-muted: #64748b` (Day) / `#94a3b8` (Night)

**Status Colors:**
- Success: `#10b981`
- Warning: `#f59e0b`
- Error: `#ef4444`
- Info: `#3b82f6`
- Pending: `#64748b`

**Gradients:**
- Primary: `linear-gradient(135deg, #065f46, #047857)`
- Secondary: `linear-gradient(135deg, #0f766e, #047857)`
- Accent: `linear-gradient(135deg, #d97706, #f59e0b)`

**Shadows:**
- Glow: `0 0 30px rgba(6, 95, 70, 0.3)`
- Card: `0 10px 40px rgba(0, 0, 0, 0.1)`
- Hover: `0 20px 60px rgba(6, 95, 70, 0.2)`

### Theme Support

- **Day Mode:** Bright, clean interface (default)
- **Night Mode:** Dark, elegant interface
- **Smooth Transitions:** All theme changes animated (0.3s ease)
- **Theme Toggle:** Available in header/navigation
- **Persist Preference:** User theme choice saved in localStorage

### Typography

- **Font Family:** 'Inter', sans-serif (primary), 'Space Grotesk', sans-serif (headings)
- **Font Sizes:**
  - H1: 3.5rem (mobile: 1.8rem)
  - H2: 2.5rem (mobile: 1.5rem)
  - H3: 1.8rem (mobile: 1.2rem)
  - Body: 1rem
  - Small: 0.875rem
- **Line Height:** 1.6
- **Font Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Spacing Scale

- `--spacing-xs: 0.5rem` (8px)
- `--spacing-sm: 1rem` (16px)
- `--spacing-md: 1.5rem` (24px)
- `--spacing-lg: 2rem` (32px)
- `--spacing-xl: 3rem` (48px)
- `--spacing-2xl: 4rem` (64px)

### Accessibility Features

- **Color Blind Friendly:** Override colors for accessibility
- **High Contrast Mode:** Enhanced contrast for visibility
- **Large Font Mode:** Increased font sizes and spacing
- **Reduced Motion:** Respects `prefers-reduced-motion`
- **Keyboard Navigation:** Full keyboard support (Tab, Enter, Escape, Arrow keys)
- **Screen Reader Support:** ARIA labels, live regions, semantic HTML
- **Focus Indicators:** Clear focus states (3px outline, offset 2px)
- **Touch Targets:** Minimum 44px for mobile
- **Skip Links:** Skip to main content

### Responsive Breakpoints

- **Mobile Portrait:** up to 575px
- **Mobile Landscape:** 576px - 767px
- **Tablet Portrait:** 768px - 991px
- **Tablet Landscape:** 992px - 1199px
- **Desktop:** 1200px - 1399px
- **Large Desktop:** 1400px+
- **Ultra-wide:** 1920px+

### Styling Requirements

- **Framework:** Tailwind CSS utility classes only
- **No Standalone CSS/SCSS:** All styling via Tailwind
- **Component-based:** React components with Tailwind classes
- **Mobile-first:** Responsive design starting from mobile

---

## Complete Page Structure & Navigation

### 1. Authentication & Entry Pages

#### 1.1 Login Page
**Route:** `/login`

**Features:**
- Email/password authentication
- Role-based login (Admin / HR / Employee / Trainer / Manager)
- "Forgot Password" link → Password Reset Flow
- "Remember Me" checkbox
- Error handling with clear messages
- Loading state during authentication
- Redirect to appropriate dashboard after login

**UI Components:**
- Login form with email/password inputs
- Role selector (dropdown or radio buttons)
- "Forgot Password" link
- "Remember Me" checkbox
- Submit button with loading state
- Error message display (below form)
- Success redirect (automatic)

**States:**
- Default: Empty form
- Loading: Submit button disabled, spinner shown
- Error: Error message displayed, form remains filled
- Success: Redirect to dashboard

**Accessibility:**
- Form labels associated with inputs
- Error messages announced to screen readers
- Keyboard navigation (Tab through form, Enter to submit)
- Focus management on error

---

#### 1.2 Signup Page
**Route:** `/signup`

**Features:**
- New user registration
- Email verification required
- Role selection during signup
- Terms & Conditions acceptance
- Password strength indicator
- Redirect to email verification page

**UI Components:**
- Signup form (name, email, password, confirm password)
- Role selector
- Password strength meter
- Terms & Conditions checkbox
- Submit button
- "Already have account?" link → Login

**States:**
- Default: Empty form
- Password strength: Visual indicator (weak/medium/strong)
- Validation: Real-time field validation
- Loading: Submit button disabled, spinner
- Error: Field-level and form-level errors
- Success: Redirect to email verification

---

#### 1.3 Forgot Password Page
**Route:** `/forgot-password`

**Features:**
- Email input for password reset
- Send reset link via email
- Success confirmation message
- Link back to login

**UI Components:**
- Email input field
- Submit button
- Success message (after submission)
- "Back to Login" link

**States:**
- Default: Email input
- Loading: Submit button disabled
- Success: Success message, email input hidden
- Error: Error message displayed

---

#### 1.4 Password Reset Page
**Route:** `/reset-password/:token`

**Features:**
- New password input
- Confirm password input
- Password strength indicator
- Token validation
- Success redirect to login

**UI Components:**
- New password input
- Confirm password input
- Password strength meter
- Submit button
- Token expiry message (if invalid)

**States:**
- Default: Password inputs
- Validation: Real-time password match check
- Loading: Submit disabled
- Success: Redirect to login with success message
- Error: Token invalid/expired message

---

#### 1.5 Email Verification Page
**Route:** `/verify-email/:token`

**Features:**
- Email verification status
- Resend verification email option
- Success redirect to login
- Token validation

**UI Components:**
- Verification status message
- "Resend Email" button (if not verified)
- "Continue to Login" button (if verified)
- Loading state

**States:**
- Verifying: Loading spinner
- Success: Success message, redirect to login
- Error: Invalid token message, resend option
- Pending: Waiting for user to click email link

---

#### 1.6 HR Landing Page (Pre-Registration)
**Route:** `/hr/landing` or `/register-company`

**Features:**
- "Register Your Company" prominent CTA button
- Brief information about registration process
- Benefits of using Directory
- Process overview (2-step registration)
- Link to login if already registered
- Link to contact support

**UI Components:**
- Hero section with headline
- Benefits cards (3-4 key benefits)
- Process overview (Step 1 → Step 2)
- "Register Your Company" CTA button
- "Already registered? Login" link
- Support/Help link

**Navigation:**
- CTA → Company Registration Step 1
- Login link → Login Page

---

### 2. Company Registration Flow (Multi-Step)

#### 2.1 Step 1 - Basic Company Info
**Route:** `/company/register/step1`

**Features:**
- Company name input (required)
- Industry selection (dropdown or search)
- HR/Registrar data:
  - Name (required)
  - Email (required, validated)
  - Role/title (required)
- Company domain/email domain input (required, validated)
- Progress indicator (Step 1 of 4)
- Form validation (real-time)
- "Continue" button (disabled until valid)
- "Cancel" button → Landing page

**UI Components:**
- Multi-step progress bar (4 steps: Basic Info → Verification → Result → Full Setup)
- Form fields with labels
- Validation messages (inline)
- "Continue" button (primary)
- "Cancel" button (secondary)
- Help tooltip for domain field

**Validation:**
- Company name: Required, min 2 characters
- Industry: Required selection
- HR name: Required
- HR email: Required, valid email format
- HR role: Required
- Domain: Required, valid domain format

**States:**
- Default: Empty form
- Validating: Real-time validation
- Invalid: Error messages shown, Continue disabled
- Valid: Continue button enabled
- Loading: Continue button disabled, spinner
- Error: API error message displayed
- Success: Redirect to Step 2 (Verification)

**Navigation:**
- Continue → Step 2 (Verification Status)
- Cancel → HR Landing Page

---

#### 2.2 Step 2 - Verification Status
**Route:** `/company/register/verification`

**Features:**
- Status message: "Verification in progress…"
- Loading animation/spinner
- Option to wait or receive email update
- Cannot proceed until verified
- Auto-refresh status (polling every 10 seconds)
- "Check Status" button (manual refresh)

**UI Components:**
- Status card with icon
- Loading spinner
- Status message
- "Receive Email Update" checkbox
- "Check Status" button
- Progress indicator (Step 2 of 4)

**States:**
- Verifying: Loading spinner, "Verification in progress…"
- Success: "Verification successful" message, "Continue" button appears
- Failed: "Verification failed" message, "Try Again" button
- Timeout: "Verification taking longer than expected" message

**Navigation:**
- Auto-redirect on success → Step 3 (Verification Result)
- "Try Again" → Step 1 (Basic Info)
- Email update → User receives email when verification completes

---

#### 2.3 Step 3 - Verification Result
**Route:** `/company/register/verification-result`

**Success State:**
- Success icon and message
- "Verification successful" confirmation
- "Continue to Setup" button (primary) → Step 4
- Brief explanation of what was verified

**Failure State:**
- Error icon and message
- Rejection reason displayed clearly
- "Try Again" button (primary) → Step 1
- "Contact Support" button (secondary)
- Help text explaining common rejection reasons

**UI Components:**
- Result card (success/error styling)
- Icon (checkmark/X)
- Message text
- Action buttons
- Help/Support links

**Navigation:**
- Success → Step 4 (Full Setup)
- Failure → Step 1 (Basic Info) or Support

---

#### 2.4 Step 4 - Full Company Setup
**Route:** `/company/register/step4`

**Features:**
- Complete employee list with add/remove functionality
- For each employee:
  - Name, email (required)
  - Current role (required, dropdown or text)
  - Target role (required, dropdown or text)
  - Employee type: Regular / Internal Instructor / External Instructor (required)
  - External data source links (optional):
    - LinkedIn profile link
    - GitHub profile link
    - Credly profile link
    - YouTube channel link
    - ORCID profile link
    - Crossref profile link
- Departments and teams structure (hierarchy builder)
- Employee assignment to teams (drag-and-drop or tree view)
- Role assignments
- Learning Path approval policy (Manual/Auto) - required
- Decision Maker selection (required if Manual approval)
- Primary KPI(s) input (optional)
- Progress indicator (Step 4 of 4)
- Form validation
- "Save Draft" button (optional)
- "Submit" button (primary)

**UI Components:**
- Progress bar (Step 4 of 4)
- Employee list component:
  - Add employee button
  - Employee cards with edit/delete
  - Bulk import option (CSV upload)
- Employee form modal (for add/edit):
  - All employee fields
  - External links section (collapsible)
  - Validation
- Department/Team hierarchy builder:
  - Add department button
  - Add team button (under department)
  - Drag-and-drop interface
  - Tree view option
- Employee assignment interface:
  - Department/Team selector
  - Employee list with checkboxes
  - Visual hierarchy display
- Learning Path policy selector:
  - Radio buttons (Manual/Auto)
  - Decision Maker dropdown (shown if Manual)
- KPI input field
- "Save Draft" button (secondary)
- "Submit" button (primary)
- "Back" button (to Step 3)

**Validation:**
- At least 1 employee required
- All employees must have: name, email, current role, target role, type
- Email format validation
- External links: URL format validation
- At least 1 department required
- Decision Maker required if Manual approval
- All required fields validated before submit

**States:**
- Default: Empty form
- Adding Employee: Modal open
- Editing Employee: Modal open with pre-filled data
- Validating: Real-time validation
- Invalid: Error messages, Submit disabled
- Valid: Submit button enabled
- Saving Draft: Loading state, "Saving..." message
- Submitting: Loading state, "Submitting..." message
- Success: Success message, redirect to HR Dashboard
- Error: Error message, form remains filled

**Navigation:**
- Submit → HR Dashboard (with success message)
- Back → Step 3 (Verification Result)
- Save Draft → Stay on page, show "Draft saved" message

**Additional Features:**
- **Bulk Import:** CSV upload for employees
- **Template Download:** Download CSV template
- **Validation Summary:** Show all validation errors before submit
- **Auto-save:** Optional auto-save draft every 30 seconds

---

### 3. Dashboard Pages (Role-Based)

#### 3.1 Admin Dashboard
**Route:** `/admin/dashboard`

**Features:**
- Overview section:
  - Total companies count
  - Total employees count
  - Registration status breakdown (Pending, Verified, Rejected)
  - Quick stats cards
- Company list with:
  - Company name, industry
  - Registration status badge
  - Employee count
  - Quick actions (View, Edit, Delete)
  - Search and filter
- Critical requests panel (F039A):
  - List of critical requests awaiting approval
  - Request type, company, requester
  - Quick approve/reject actions
- System logs access button
- "Dashboard" button → Redirects to Management Reporting microservice
- Quick access to:
  - All companies
  - All employees
  - System configuration
  - Audit logs

**UI Components:**
- Stats cards (4-6 cards with numbers and icons)
- Company list table/cards:
  - Search bar
  - Filter dropdowns (status, industry)
  - Sort options
  - Pagination
- Critical requests panel:
  - Request cards with details
  - Approve/Reject buttons
  - Request detail modal
- Quick action buttons
- "Dashboard" redirect button (prominent)
- Navigation sidebar/top nav

**States:**
- Loading: Skeleton loaders for cards and lists
- Empty: Empty state message (no companies, no requests)
- Error: Error message with retry button
- Success: Data displayed

**Navigation:**
- Company name → Company Profile Page
- Critical request → Request Detail Modal → Approve/Reject
- "Dashboard" button → Management Reporting (external)
- System logs → System Logs Page

**Permissions:**
- Full access to all companies and employees
- Can approve/reject critical requests
- Can view system logs
- Can access Management Reporting dashboard

---

#### 3.2 Primary HR Dashboard
**Route:** `/hr/dashboard`

**Features:**
- Company Overview:
  - Company name and details
  - Departments count
  - Teams count
  - Employees count
  - Quick stats
- Requests Overview:
  - Pending employee profile approvals (F007A) - count badge
  - Learning Path requests (F029) - count badge
  - Extra attempt requests (F026) - count badge
  - Training requests - count badge
- Quick actions:
  - Approve profiles
  - View requests
  - Add employees
  - Company settings
- "Dashboard" button → Redirects to Learning Analytics microservice
- Notifications panel (SendPulse integration)
- Recent activity feed

**UI Components:**
- Company overview card
- Stats cards (departments, teams, employees)
- Requests panel:
  - Request type tabs or cards
  - Count badges
  - "View All" links
- Quick action buttons
- "Dashboard" redirect button
- Notifications bell with badge count
- Activity feed (recent actions)

**States:**
- Loading: Skeleton loaders
- Empty: Empty state for requests
- Error: Error message
- Success: Data displayed

**Navigation:**
- Request count → Request List Page (filtered by type)
- "Dashboard" button → Learning Analytics (external)
- Company settings → Company Settings Page
- Add employees → Add Employee Page

**Permissions:**
- View all company employees, departments, teams
- Approve/reject employee profiles
- Approve/reject learning path requests
- Approve/reject extra attempt requests
- Manage company settings

---

#### 3.3 Department Manager Dashboard
**Route:** `/manager/dashboard`

**Features:**
- Department/Team status overview
- Hierarchy view:
  - Department name
  - Teams under department (expandable)
  - Employees in each team (expandable)
  - Employee count per team
- Quick links to employee profiles under management
- Own profile access
- Team performance metrics (if available)
- Recent activity in department

**UI Components:**
- Hierarchy tree/accordion:
  - Department header
  - Team sections (collapsible)
  - Employee list (collapsible)
  - Employee cards with quick links
- Stats cards (team counts, employee counts)
- Quick action buttons
- "My Profile" button

**States:**
- Loading: Skeleton loaders
- Empty: Empty state (no teams/employees)
- Error: Error message
- Success: Hierarchy displayed

**Navigation:**
- Employee name → Employee Profile Page
- "My Profile" → Own Profile Page
- Team name → Team Detail Page (if exists)

**Permissions:**
- View profiles of employees in managed departments
- View own profile
- Cannot view other departments' employees

---

#### 3.4 Team Manager Dashboard
**Route:** `/manager/dashboard` (same route, different data)

**Features:**
- Team status overview
- Team hierarchy:
  - Team name
  - Employees in team (list)
  - Employee count
- Quick links to employee profiles in team
- Own profile access
- Team performance metrics

**UI Components:**
- Team header card
- Employee list (cards or table)
- Stats cards
- Quick action buttons
- "My Profile" button

**States:**
- Loading: Skeleton loaders
- Empty: Empty state (no employees)
- Error: Error message
- Success: Team data displayed

**Navigation:**
- Employee name → Employee Profile Page
- "My Profile" → Own Profile Page

**Permissions:**
- View profiles of employees in managed team only
- View own profile
- Cannot view other teams' employees

---

#### 3.5 Employee Dashboard
**Route:** `/employee/dashboard`

**Features:**
- Active courses list:
  - Course name, progress, due date
  - "Continue Learning" button
- Completed courses list:
  - Course name, completion date, feedback
  - Test attempts number
- Notifications panel:
  - In-app notifications (SendPulse)
  - Notification count badge
- Quick links:
  - My Profile
  - Learning Path
  - Requests
  - Dashboard (redirects to Learning Analytics)
- Learning progress summary
- Upcoming deadlines

**UI Components:**
- Course cards (active and completed)
- Notifications bell with badge
- Quick action buttons
- Progress bars
- Stats cards (courses completed, in progress)
- "Dashboard" redirect button

**States:**
- Loading: Skeleton loaders
- Empty: Empty state (no courses, no notifications)
- Error: Error message
- Success: Data displayed

**Navigation:**
- Course name → Course Detail (external - Course Builder)
- "My Profile" → Own Profile Page
- "Learning Path" → Learning Path Page
- "Requests" → Requests Page
- "Dashboard" button → Learning Analytics (external)
- Notification → Notification Detail

**Permissions:**
- View own courses, profile, learning path
- Cannot view other employees' data

---

#### 3.6 Trainer Dashboard
**Route:** `/trainer/dashboard` (extends Employee Dashboard)

**Features:**
- All Employee Dashboard features PLUS:
- Courses Taught section:
  - List of courses taught
  - Course status (Invited, Active, Archived)
  - Student count per course
- Teaching requests section:
  - Proactive teaching requests submitted
  - Request status
- Trainer settings quick access:
  - AI Enable toggle
  - Public Publish Enable toggle

**UI Components:**
- All Employee Dashboard components PLUS:
- Courses Taught cards
- Teaching Requests list
- Settings toggle switches

**Navigation:**
- Course name → Course Management (external - Content Studio)
- Teaching request → Teaching Request Detail

**Permissions:**
- All Employee permissions PLUS:
- View courses taught
- Submit teaching requests
- Edit trainer settings

---

### 4. Profile Pages

#### 4.1 Employee Profile Page
**Route:** `/profile/:employeeId` or `/profile/me`

**Sections (in order):**

1. **Profile Header:**
   - Employee name (large)
   - Role, Department, Team
   - Employee type badge (Regular/Trainer)
   - Profile status badge (Pending Approval/Approved)
   - Edit button (if own profile or HR/Admin)
   - Avatar/photo (if available)

2. **Basic Info Section:**
   - Name, Email, Phone, Address
   - Current role
   - Target role
   - Employee type
   - Department and Team
   - Preferred language

3. **Employee Card (F007B) - Displayed if approved:**
   - Normalized skills into competencies (from Skills Engine)
   - Short bio (AI-generated)
   - Value proposition (current role → target role)
   - Relevance Score (numeric display with visual indicator)
   - Skill gap button → Skills Engine frontend

4. **Skills Section:**
   - Verified skills (if verified) - badges with checkmarks
   - Unverified skills (if not verified) - badges without checkmarks
   - "Verify Your Skills" button (one-time, hidden after verification)
   - "More" button → Skills Engine frontend
   - Skills grouped by category (if available)

5. **Courses Section:**
   - Active courses:
     - Course name, progress, due date
     - "Continue Learning" button
   - Completed courses (passed only):
     - Course name
     - Completion date
     - Feedback (if available)
     - Test attempts number
     - "Request More Attempts" button (if max reached)
   - Not started courses:
     - Course name
     - "Start Course" button

6. **Projects Section:**
   - Project titles extracted from external data
   - AI-generated summaries
   - Source indicators (GitHub, LinkedIn, etc.)
   - Project cards with expand/collapse

7. **External Data Section:**
   - Links to: LinkedIn, GitHub, YouTube, ORCID, Crossref, Credly
   - Public info display (if available)
   - Link icons with external link indicators

8. **Action Buttons Panel:**
   - Edit Profile (allowed fields only)
   - Request Learning / Become Trainer
   - Verify Skills (if not verified)
   - View Learning Path
   - Dashboard (redirects to Learning Analytics)

**UI Components:**
- Profile header component
- Section cards (collapsible on mobile)
- Skills badges
- Course cards
- Project cards
- External links display
- Action buttons panel
- Loading skeleton
- Empty states for each section

**States:**
- Loading: Skeleton loaders for each section
- Pending Approval: Banner message, limited sections visible
- Approved: Full profile visible
- Empty: Empty state messages for sections with no data
- Error: Error message with retry button
- Success: Full profile displayed

**Navigation:**
- Edit Profile → Profile Edit Page
- Verify Skills → Skill Verification Flow
- Request Learning → Learning Request Page
- View Learning Path → Learning Path Page
- Dashboard → Learning Analytics (external)
- Skills "More" → Skills Engine (external)
- Course name → Course Detail (external)

**Permissions:**
- Employee: Can view own profile only
- Manager: Can view profiles in their scope + own profile
- HR: Can view all company profiles
- Admin: Can view all profiles

**RBAC Enforcement:**
- Profile visibility checked before rendering
- Unauthorized access → 403 Error Page
- Edit button only shown if user has permission

---

#### 4.2 Trainer Profile Page
**Route:** `/profile/trainer/:trainerId` or `/profile/me` (if trainer)

**All Employee Profile sections PLUS:**

9. **Courses Taught Section:**
   - List of courses taught
   - Course status badges (Invited, Active, Archived)
   - Student count per course
   - Course completion date
   - "View Course" button → Content Studio

10. **Trainer Settings Section:**
    - AI Enable toggle switch
    - Public Publish Enable toggle switch
    - Settings saved automatically on change
    - Help text explaining each setting

11. **Teaching Requests Section:**
    - Proactive teaching requests submitted
    - Request status (Pending, Approved, Rejected)
    - Skill requested
    - Submission date

**UI Components:**
- All Employee Profile components PLUS:
- Trainer-specific sections
- Toggle switches for settings
- Teaching request cards

**Navigation:**
- Course name → Course Management (external - Content Studio)
- Teaching request → Teaching Request Detail

**Permissions:**
- Trainer: Can view own trainer profile, edit settings
- HR: Can view trainer profiles, edit settings
- Admin: Full access

---

#### 4.3 Manager Profile Page
**Route:** `/profile/manager/:managerId` or `/profile/me` (if manager)

**All Employee/Trainer Profile sections PLUS:**

12. **Hierarchy Section:**
    - Employees/Teams under their management
    - Hierarchy tree view
    - Quick links to subordinate profiles
    - Employee count per team/department
    - Expand/collapse functionality

**UI Components:**
- All Employee/Trainer Profile components PLUS:
- Hierarchy tree component
- Employee list with quick links

**Navigation:**
- Subordinate employee name → Employee Profile Page
- Team name → Team Detail Page

**Permissions:**
- Manager: Can view own profile + profiles in their scope
- HR: Can view all manager profiles
- Admin: Full access

---

#### 4.4 Primary HR Profile Page
**Route:** `/hr/profile`

**Features:**
- Company overview card
- Employee list (all company employees):
  - Search and filter (by department, team, role, status)
  - Employee cards with:
    - Name, role, department, team
    - Profile status (Pending/Approved)
    - Quick actions (View, Approve, Edit)
- Departments and teams management:
  - Department list
  - Team list (under departments)
  - Add/Edit/Delete actions
- Requests panel:
  - Profile approvals (F007A) - pending count
  - Learning Path requests - pending count
  - Extra attempts - pending count
  - Training requests - pending count
- Company settings access
- Approve/Reject/Edit actions

**UI Components:**
- Company overview card
- Employee list with:
  - Search bar
  - Filter dropdowns
  - Sort options
  - Pagination
  - Employee cards
- Department/Team management interface
- Requests panel with tabs
- Settings access button

**Navigation:**
- Employee name → Employee Profile Page
- Request → Request Detail Modal
- Settings → Company Settings Page
- Department/Team → Department/Team Detail Page

**Permissions:**
- HR: Full access to company data
- Cannot access other companies' data

---

#### 4.5 Admin Profile Page
**Route:** `/admin/profile`

**Features:**
- System overview:
  - Total companies count
  - Total employees count
  - System health status
- Company list (all companies):
  - Search and filter
  - Company cards with:
    - Name, industry, employee count
    - Registration status
    - Quick actions (View, Edit, Delete)
- Employee list (all employees):
  - Search and filter
  - Employee cards
- Registration requests:
  - Pending company registrations
  - Quick approve/reject
- System logs access
- Critical requests approval panel (F039A)
- System configuration access

**UI Components:**
- System overview cards
- Company list with search/filter
- Employee list with search/filter
- Registration requests panel
- Critical requests panel
- System logs viewer
- Configuration access button

**Navigation:**
- Company name → Company Profile Page
- Employee name → Employee Profile Page
- Critical request → Request Detail Modal
- System logs → System Logs Page
- Configuration → System Configuration Page

**Permissions:**
- Admin: Full system access
- Can approve/reject all requests
- Can view all data
- Can configure system settings

---

### 5. Profile Edit Pages

#### 5.1 Employee Profile Edit Page
**Route:** `/profile/:employeeId/edit` or `/profile/me/edit`

**Features:**
- Editable fields (allowed fields only):
  - Name, Phone, Address
  - Preferred language
  - Bio (if editable)
- Read-only fields (displayed but disabled):
  - Email, Role, Department, Team
  - Employee type
- Sensitive fields (require approval):
  - Role change
  - Department/Team change
  - Employee type change
- Form validation
- "Save" button (primary)
- "Cancel" button (secondary)
- "Request Change" button (for sensitive fields)

**UI Components:**
- Edit form with fields
- Field labels and help text
- Validation messages
- Read-only field indicators
- Sensitive field warnings
- Save/Cancel buttons
- Change request modal (for sensitive fields)

**States:**
- Default: Form pre-filled with current data
- Editing: Form fields enabled
- Validating: Real-time validation
- Invalid: Error messages, Save disabled
- Saving: Loading state, Save disabled
- Success: Success message, redirect to profile
- Error: Error message, form remains

**Navigation:**
- Save → Profile Page (with success message)
- Cancel → Profile Page (no changes)
- Request Change → Change Request created, redirect to profile

**Permissions:**
- Employee: Can edit own allowed fields only
- HR: Can edit all fields for company employees
- Admin: Can edit all fields for all employees

---

#### 5.2 HR Profile Approval Page
**Route:** `/hr/profile-approvals`

**Features:**
- List of pending profile approvals (F007A):
  - Employee name, role
  - Profile data preview
  - Approval actions
- Profile detail view:
  - Full profile data
  - External data sources
  - Skills, projects, bio
- Approve/Reject actions:
  - Approve button (primary)
  - Reject button (secondary)
  - Rejection reason input (if rejected)
- Bulk approval option
- Filter and search

**UI Components:**
- Approval list with cards
- Profile detail modal/sidebar
- Approve/Reject buttons
- Rejection reason textarea
- Bulk selection checkboxes
- Filter dropdowns
- Search bar

**States:**
- Loading: Skeleton loaders
- Empty: No pending approvals message
- Approving: Loading state
- Success: Approval confirmed, removed from list
- Error: Error message

**Navigation:**
- Approve → Profile approved, Employee Card generated, redirect to dashboard
- Reject → Rejection reason required, profile remains pending

**Permissions:**
- HR: Can approve/reject company employee profiles
- Admin: Can approve/reject all profiles

---

### 6. Request Management Pages

#### 6.1 Learning Requests Page
**Route:** `/requests/learning`

**Features:**
- Employee-initiated learning requests:
  - Request details (skill, course, reason)
  - Status (Pending, Approved, Rejected)
  - Request date
  - Actions (View, Cancel if pending)
- HR-initiated learning requests:
  - Request details
  - Employee(s) assigned
  - Status
  - Actions (View, Edit, Cancel)
- Request filters:
  - Status filter
  - Employee filter
  - Date range filter
- Search functionality
- Create new request button (if HR)

**UI Components:**
- Request list (cards or table)
- Status badges
- Filter panel
- Search bar
- "Create Request" button (HR only)
- Request detail modal
- Pagination

**States:**
- Loading: Skeleton loaders
- Empty: No requests message
- Error: Error message
- Success: Requests displayed

**Navigation:**
- Request → Request Detail Modal
- Create Request → Learning Request Form Page
- Employee name → Employee Profile Page

**Permissions:**
- Employee: Can view own requests, create requests
- HR: Can view all company requests, create requests
- Manager: Can view team requests
- Admin: Can view all requests

---

#### 6.2 Learning Request Form Page
**Route:** `/requests/learning/new`

**Features:**
- Request type selection:
  - Fully Personalized (Career Path Driven) - F014
  - Group/Department (Skill-Driven) - F015
  - Specific Instructor - F016
- Form fields based on type:
  - Employee selection (single or multiple)
  - Skill selection
  - Course selection (if applicable)
  - Instructor selection (if type 3)
  - Reason/notes
- Form validation
- "Submit" button
- "Cancel" button

**UI Components:**
- Request type selector (radio buttons or tabs)
- Dynamic form fields
- Employee selector (multi-select if group)
- Skill selector
- Course selector
- Instructor selector
- Notes textarea
- Submit/Cancel buttons

**States:**
- Default: Empty form
- Type selected: Relevant fields shown
- Validating: Real-time validation
- Submitting: Loading state
- Success: Success message, redirect to requests list
- Error: Error message

**Navigation:**
- Submit → Request created, redirect to requests list
- Cancel → Requests list (no changes)

**Permissions:**
- Employee: Can create self-learning requests
- HR: Can create all types of requests
- Manager: Can create requests for team members

---

#### 6.3 Trainer Requests Page
**Route:** `/requests/trainer`

**Features:**
- Become trainer requests:
  - Request details
  - Status
  - Actions
- Skill assignment requests:
  - Skill requested
  - Status
  - Actions
- Proactive teaching requests (F035):
  - Skill to teach
  - Status
  - Submission date
  - Actions
- Create new request button
- Filters and search

**UI Components:**
- Request list
- Status badges
- "Create Request" button
- Request detail modal
- Filter panel

**Navigation:**
- Create Request → Trainer Request Form
- Request → Request Detail Modal

**Permissions:**
- Trainer: Can create teaching requests
- HR: Can approve/reject trainer requests
- Admin: Can approve/reject all requests

---

#### 6.4 Trainer Request Form Page
**Route:** `/requests/trainer/new`

**Features:**
- Request type selection:
  - Become Trainer
  - Skill Assignment
  - Proactive Teaching (F035)
- Form fields:
  - Skill selection (for teaching requests)
  - Reason/notes
- Submit button
- Cancel button

**UI Components:**
- Request type selector
- Dynamic form fields
- Submit/Cancel buttons

**Navigation:**
- Submit → Request created, redirect to requests list
- Cancel → Requests list

---

#### 6.5 Profile Enrichment Requests Page
**Route:** `/requests/enrichment`

**Features:**
- LinkedIn data import requests:
  - Employee name
  - Status
  - Request date
- Public data import requests:
  - Data source
  - Status
- Create new request button
- Approve/Reject actions (HR)

**UI Components:**
- Request list
- Status badges
- "Create Request" button
- Approve/Reject buttons (HR)
- Request detail modal

**Navigation:**
- Create Request → Enrichment Request Form
- Request → Request Detail Modal

---

#### 6.6 Extra Attempts Requests Page
**Route:** `/requests/extra-attempts`

**Features:**
- List of extra attempt requests (F025):
  - Employee name
  - Course name
  - Current attempts / Max attempts
  - Status (Pending, Approved, Rejected)
  - Request date
- HR approval interface (F026):
  - Approve/Reject buttons
  - Approval notes
- Employee view:
  - Own requests only
  - Request status
  - Cancel option (if pending)
- Filters:
  - Status filter
  - Course filter
  - Employee filter (HR)

**UI Components:**
- Request list (cards or table)
- Status badges
- Approve/Reject buttons (HR)
- Approval notes textarea
- Filter panel
- Request detail modal

**States:**
- Loading: Skeleton loaders
- Empty: No requests message
- Approving: Loading state
- Success: Request approved/rejected, status updated

**Navigation:**
- Request → Request Detail Modal
- Approve → Request approved, Course Builder notified
- Reject → Request rejected, employee notified

**Permissions:**
- Employee: Can view own requests, create requests
- HR: Can view all company requests, approve/reject
- Admin: Can view all requests, approve/reject

---

### 7. Learning Path Pages

#### 7.1 Learning Path Display Page
**Route:** `/learning-path/:employeeId` or `/learning-path/me`

**Features:**
- Approved learning path display:
  - Learning path steps/courses
  - Progress indicators
  - Completion status
  - Next steps
- Learning path details:
  - Course names
  - Prerequisites
  - Estimated completion time
  - Skills to be gained
- "Start Learning" button (if available)
- "View in Learner AI" button → Redirects to Learner AI

**UI Components:**
- Learning path timeline/roadmap
- Course cards
- Progress bars
- Status indicators
- Action buttons

**Navigation:**
- Course name → Course Detail (external - Course Builder)
- "View in Learner AI" → Learner AI (external)

**Permissions:**
- Employee: Can view own learning path
- HR: Can view all company learning paths
- Manager: Can view team learning paths
- Admin: Can view all learning paths

---

#### 7.2 Learning Path Requests Page (Decision Maker)
**Route:** `/learning-path/requests`

**Features:**
- List of pending Learning Path requests (F029):
  - Employee name
  - Request date
  - Learning path preview
  - Status
- "Review in Learner AI" button → Redirects to Learner AI
- Filter and search

**UI Components:**
- Request list
- Status badges
- "Review" button (redirects to Learner AI)
- Filter panel

**Navigation:**
- "Review" → Learner AI (external) with request context

**Permissions:**
- Decision Maker: Can view pending requests
- HR: Can view all requests
- Admin: Can view all requests

---

### 8. Company Management Pages

#### 8.1 Company Profile Page
**Route:** `/company/:companyId`

**Features:**
- Company overview:
  - Company name, industry
  - Registration status
  - Employee count
  - Department count
  - Team count
- Departments and teams hierarchy:
  - Tree view
  - Expand/collapse
  - Employee count per node
- Employee list:
  - All company employees
  - Search and filter
  - Quick links to profiles
- Company settings access (HR/Admin)
- Edit company button (HR/Admin)

**UI Components:**
- Company header card
- Hierarchy tree component
- Employee list with search/filter
- Settings button
- Edit button

**Navigation:**
- Employee name → Employee Profile Page
- Department/Team → Department/Team Detail Page
- Settings → Company Settings Page
- Edit → Company Edit Page

**Permissions:**
- HR: Can view own company
- Admin: Can view all companies

---

#### 8.2 Company Settings Page
**Route:** `/company/:companyId/settings`

**Features:**
- Settings categories:
  - Learning Path Approval Policy (F028):
    - Manual/Auto selector
    - Decision Maker selection (if Manual)
  - Assessment Settings (F040):
    - Allowed assessment retakes
    - Verification grade for skills
  - Course Settings (F040):
    - Number of exercises (default: 4)
  - Trainer Settings (F040):
    - If trainer can public publish content
  - Primary KPIs
- Save button
- Cancel button
- Settings validation

**UI Components:**
- Settings form with sections
- Toggle switches
- Dropdown selectors
- Number inputs
- Text inputs
- Save/Cancel buttons

**States:**
- Loading: Loading current settings
- Saving: Loading state
- Success: Settings saved, success message
- Error: Error message

**Navigation:**
- Save → Settings saved, stay on page with success message
- Cancel → Company Profile Page (no changes)

**Permissions:**
- HR: Can edit company settings
- Admin: Can edit all company settings

---

#### 8.3 Add Employee Page
**Route:** `/company/:companyId/employees/new`

**Features:**
- Employee form:
  - Name, email (required)
  - Current role, target role (required)
  - Employee type (required)
  - Department and team assignment
  - External data source links (optional)
- Form validation
- "Add Employee" button
- "Cancel" button

**UI Components:**
- Employee form
- Department/Team selector
- External links section
- Validation messages
- Add/Cancel buttons

**Navigation:**
- Add → Employee created, redirect to employee list
- Cancel → Company Profile Page

**Permissions:**
- HR: Can add employees to own company
- Admin: Can add employees to any company

---

### 9. Skill Verification Pages

#### 9.1 Skill Verification Request Page
**Route:** `/skills/verify`

**Features:**
- Skill selection:
  - List of unverified skills
  - Multi-select checkboxes
  - Skill descriptions
- "Verify Skills" button (F011)
- Information about verification process
- One-time verification notice

**UI Components:**
- Skill list with checkboxes
- Skill cards with descriptions
- "Verify Skills" button
- Info banner
- Loading state

**States:**
- Default: Skill list displayed
- Selecting: Skills selected
- Submitting: Loading state, button disabled
- Success: Redirect to verification in progress
- Error: Error message

**Navigation:**
- Verify → Verification initiated, redirect to profile
- Cancel → Profile Page

**Permissions:**
- Employee: Can verify own skills (one-time)
- Hidden after verification (F012)

---

#### 9.2 Skill Verification Status Page
**Route:** `/skills/verify/status`

**Features:**
- Verification status:
  - In progress
  - Completed
  - Failed
- Assessment link (if in progress)
- Results display (if completed)
- "Back to Profile" button

**UI Components:**
- Status card
- Progress indicator
- Assessment link button
- Results display
- Action buttons

**Navigation:**
- Assessment link → Assessment microservice (external)
- Back → Profile Page

---

### 10. System Administration Pages

#### 10.1 System Logs Page
**Route:** `/admin/logs`

**Features:**
- Audit logs list (F039):
  - Action type
  - Actor (admin name)
  - Target (employee/company)
  - Timestamp
  - Action details
- Filters:
  - Action type filter
  - Date range filter
  - Actor filter
- Search functionality
- Export logs option
- Pagination

**UI Components:**
- Logs table
- Filter panel
- Search bar
- Export button
- Pagination

**Permissions:**
- Admin only

---

#### 10.2 Critical Requests Approval Page
**Route:** `/admin/critical-requests`

**Features:**
- List of critical requests (F039A):
  - Request type
  - Company name
  - Requester
  - Request details
  - Request date
  - Status
- Request detail view:
  - Full request data
  - Context information
- Approve/Reject actions:
  - Approve button
  - Reject button
  - Rejection reason (if rejected)
- Bulk approval option
- Filters and search

**UI Components:**
- Request list
- Request detail modal/sidebar
- Approve/Reject buttons
- Rejection reason textarea
- Filter panel
- Bulk selection

**States:**
- Loading: Skeleton loaders
- Empty: No critical requests
- Approving: Loading state
- Success: Request approved/rejected

**Navigation:**
- Request → Request Detail Modal
- Approve → Request approved, operation executed
- Reject → Request rejected, requester notified

**Permissions:**
- Admin only

---

#### 10.3 System Configuration Page
**Route:** `/admin/config`

**Features:**
- System-wide settings:
  - Default values
  - System limits
  - Feature flags
- Save button
- Configuration validation

**UI Components:**
- Settings form
- Toggle switches
- Number inputs
- Save button

**Permissions:**
- Admin only

---

### 11. Error & Status Pages

#### 11.1 404 Not Found Page
**Route:** Any invalid route

**Features:**
- 404 error message
- "Go Home" button
- "Back" button
- Search suggestion

**UI Components:**
- Error message
- Illustration/icon
- Action buttons

---

#### 11.2 403 Forbidden Page
**Route:** Unauthorized access attempt

**Features:**
- Access denied message
- Explanation of why access was denied
- "Go Back" button
- "Contact Admin" link (if applicable)

**UI Components:**
- Error message
- Explanation text
- Action buttons

---

#### 11.3 500 Error Page
**Route:** Server error

**Features:**
- Server error message
- "Try Again" button
- "Go Home" button
- Support contact information

**UI Components:**
- Error message
- Action buttons
- Support link

---

#### 11.4 Loading States
**Applied to all pages during data fetching**

**Features:**
- Skeleton loaders matching content structure
- Loading spinners for buttons
- Progress indicators for long operations
- Smooth transitions

**UI Components:**
- Skeleton loaders
- Spinners
- Progress bars
- Loading overlays

---

#### 11.5 Empty States
**Applied to all list/collection pages when empty**

**Features:**
- Empty state message
- Illustration/icon
- Action button (if applicable)
- Help text

**UI Components:**
- Empty state card
- Illustration
- Message text
- Action button

---

### 12. Navigation System

#### 12.1 Top Navigation Bar
**Components:**
- Logo (left) → Home/Dashboard
- Navigation links (center):
  - Dashboard
  - Profile
  - Learning Path
  - Requests
  - Company Overview (HR/Admin)
  - Hierarchy (Managers/HR)
  - Settings
- User profile (right):
  - Avatar
  - Name
  - Role badge
  - Dropdown menu:
    - My Profile
    - Settings
    - Logout
- Theme toggle button
- Accessibility controls toggle
- Notifications bell (with badge count)

**Role-Based Menu Items:**
- **Admin:**
  - Dashboard
  - All Companies
  - System Logs
  - Critical Requests
  - Settings
- **HR:**
  - Dashboard
  - Company Overview
  - Employees
  - Requests
  - Settings
- **Manager:**
  - Dashboard
  - Hierarchy
  - My Team
  - Profile
  - Settings
- **Employee:**
  - Dashboard
  - Profile
  - Learning Path
  - Requests
  - Settings
- **Trainer:**
  - All Employee items PLUS:
  - Courses Taught
  - Teaching Requests

**Responsive:**
- Desktop: Full navigation bar
- Tablet: Collapsed menu with hamburger
- Mobile: Hamburger menu, slide-out drawer

---

#### 12.2 Side Navigation (Optional for Desktop)
**Features:**
- Collapsible sidebar
- Same menu items as top nav
- Icons + labels
- Active state indicators
- Expand/collapse toggle

**UI Components:**
- Sidebar container
- Menu items with icons
- Active indicator
- Collapse button

---

#### 12.3 Breadcrumbs
**Usage:** Deep pages (e.g., Company → Department → Team → Employee)

**Format:** `Home > Company > Department > Team > Employee`

**UI Component:**
- Breadcrumb trail
- Clickable links to parent pages
- Current page (non-clickable, highlighted)
- Separator icons

**Responsive:**
- Desktop: Full breadcrumb trail
- Mobile: "Back" button + current page name

---

#### 12.4 Mobile Navigation
**Features:**
- Hamburger menu icon
- Slide-out drawer:
  - Menu items
  - User profile
  - Settings
  - Logout
- Sticky bottom navigation (optional):
  - Dashboard
  - Profile
  - Requests
  - Settings
- Overlay when menu open
- Close on outside click

**UI Components:**
- Hamburger icon
- Slide-out drawer
- Overlay
- Bottom navigation bar

---

### 13. UI Component Library

#### 13.1 Multi-Step Forms
**Usage:** Company registration, complex workflows

**Features:**
- Progress indicator (Step X of Y)
- Visual progress bar
- Step indicators (completed, current, upcoming)
- Previous/Next buttons
- Form validation per step
- Save draft functionality
- Step navigation (click to go to step, if allowed)
- Step completion status

**UI Component:**
- Progress bar with steps
- Step indicators (numbered circles or tabs)
- Navigation controls
- Step content area

**States:**
- Current step: Highlighted
- Completed steps: Checkmark, clickable
- Upcoming steps: Disabled, grayed out
- Error step: Red indicator

---

#### 13.2 Notifications / Alerts System
**Types:**
- In-app notifications (SendPulse integration)
- Success alerts
- Error alerts
- Info messages
- Warning messages

**Display:**
- Notification center/bell icon (top nav)
- Toast notifications (temporary, top-right)
- Persistent notifications (until action)
- Email notifications (triggered)

**UI Components:**
- Notification bell with badge count
- Notification dropdown/panel:
  - Notification list
  - Mark as read
  - Clear all
  - View all link
- Toast notification component:
  - Auto-dismiss (5 seconds)
  - Manual dismiss button
  - Action button (optional)
- Alert banners (page-level)

**States:**
- Unread: Badge count, highlighted
- Read: No badge, normal styling
- Dismissed: Removed from list

---

#### 13.3 Approval Modals
**Usage:** HR/Admin approvals

**Features:**
- Request details display
- Full context information
- Approve/Reject buttons
- Comments/notes field (optional)
- Confirmation dialog (for critical actions)
- Cancel button

**UI Component:**
- Modal overlay
- Modal container
- Header with title
- Content area with details
- Approval form
- Action buttons (Approve, Reject, Cancel)
- Confirmation dialog (nested)

**States:**
- Default: Modal open, details displayed
- Approving: Loading state, buttons disabled
- Success: Success message, modal closes
- Error: Error message, modal remains open

---

#### 13.4 Filters / Search Components
**Usage:** Employee lists, courses, companies

**Features:**
- Search input (real-time or on submit)
- Filter dropdowns (role, department, status, etc.)
- Sort options (dropdown)
- Clear filters button
- Active filters display (tags)
- Results count
- Filter persistence (URL params or localStorage)

**UI Component:**
- Search bar
- Filter panel (collapsible on mobile)
- Filter dropdowns
- Sort dropdown
- Active filters (tags with remove)
- Clear all button
- Results count text

**States:**
- Default: No filters applied
- Filtered: Active filters shown, results updated
- Empty results: "No results" message

---

#### 13.5 Hierarchy View Components
**Usage:** Department/Team structure display

**Features:**
- Tree view or accordion
- Expand/collapse functionality
- Employee count per node
- Quick links to profiles
- Visual hierarchy indicators (lines, indentation)
- Search within hierarchy
- Collapse all / Expand all buttons

**UI Component:**
- Tree component
- Accordion component
- Hierarchy card
- Node expand/collapse icons
- Employee count badges
- Quick link buttons

**States:**
- Collapsed: Node closed, children hidden
- Expanded: Node open, children visible
- Loading: Skeleton loaders

---

#### 13.6 Theme Toggle
**Location:** Header/navigation

**Features:**
- Day/Night mode switch
- Smooth transition (0.3s)
- Persist user preference (localStorage)
- Icon indicator (sun/moon)
- System preference detection (optional)

**UI Component:**
- Toggle button
- Icon animation
- Tooltip on hover

**States:**
- Day mode: Sun icon
- Night mode: Moon icon
- Transitioning: Smooth color transition

---

#### 13.7 Accessibility Controls
**Location:** Fixed position (top-right or header)

**Features:**
- Color blind friendly toggle
- High contrast toggle
- Large font toggle
- Reduced motion toggle
- Keyboard navigation indicator
- Screen reader announcement toggle

**UI Component:**
- Accessibility panel (collapsible)
- Toggle switches
- Active state indicators
- Help tooltips

**States:**
- Default: All toggles off
- Active: Toggle on, styles applied
- Persisted: Preferences saved

---

#### 13.8 Data Tables
**Usage:** Employee lists, company lists, logs

**Features:**
- Sortable columns
- Filterable columns
- Pagination
- Row selection (checkboxes)
- Bulk actions
- Export option
- Responsive (card view on mobile)

**UI Component:**
- Table container
- Table header with sort indicators
- Table rows
- Pagination controls
- Bulk action bar
- Export button

**Responsive:**
- Desktop: Full table
- Tablet: Horizontal scroll
- Mobile: Card view

---

#### 13.9 Form Components
**Standard form elements with consistent styling:**

- Text inputs
- Textareas
- Select dropdowns
- Checkboxes
- Radio buttons
- Toggle switches
- Date pickers
- File uploads
- Multi-select

**Features:**
- Consistent styling
- Validation states (error, success)
- Help text
- Required field indicators
- Disabled states
- Loading states

---

#### 13.10 Buttons
**Button types:**
- Primary (main actions)
- Secondary (secondary actions)
- Tertiary (tertiary actions)
- Danger (destructive actions)
- Link (text buttons)
- Icon buttons

**Features:**
- Consistent sizing
- Loading states
- Disabled states
- Icon support
- Tooltips

---

### 14. Complete User Journeys

#### 14.1 New HR - Company Registration Journey
1. **Landing Page** → Click "Register Your Company"
2. **Step 1: Basic Info** → Fill form → Click "Continue"
3. **Step 2: Verification** → Wait for verification → Status updates
4. **Step 3: Verification Result** → Success → Click "Continue to Setup"
5. **Step 4: Full Setup** → Fill employee list, departments, teams → Click "Submit"
6. **HR Dashboard** → View company overview, pending approvals
7. **Profile Approvals** → Review profiles → Approve/Reject
8. **Company Settings** → Configure settings → Save

**No dead ends:** Every step has clear next action and back option.

---

#### 14.2 Employee - Profile & Learning Journey
1. **Login** → Employee Dashboard
2. **Dashboard** → View active courses → Click "Continue Learning"
3. **Profile** → View own profile → Click "Edit Profile"
4. **Profile Edit** → Update allowed fields → Save
5. **Profile** → View unverified skills → Click "Verify Your Skills"
6. **Skill Verification** → Select skills → Submit
7. **Profile** → View verified skills → Click "Request Learning"
8. **Learning Request** → Fill form → Submit
9. **Requests** → View request status
10. **Profile** → View completed course → Click "Request More Attempts" (if needed)
11. **Extra Attempts Request** → Submit
12. **Profile** → Click "Learning Path" → View learning path
13. **Profile** → Click "Dashboard" → Learning Analytics (external)

**No dead ends:** All actions have clear outcomes and next steps.

---

#### 14.3 Manager - Team Management Journey
1. **Login** → Manager Dashboard
2. **Dashboard** → View hierarchy → Expand team
3. **Team View** → Click employee name → Employee Profile
4. **Employee Profile** → View profile → Back to Dashboard
5. **Dashboard** → Click "My Profile" → Own Profile
6. **Profile** → View own data → Edit if needed
7. **Dashboard** → View team performance → Take actions if needed

**No dead ends:** Clear navigation between hierarchy, profiles, and dashboard.

---

#### 14.4 HR - Request Management Journey
1. **Login** → HR Dashboard
2. **Dashboard** → View pending approvals → Click count
3. **Profile Approvals** → Review profile → Approve
4. **Dashboard** → View learning requests → Click request
5. **Request Detail** → Review → Approve/Reject
6. **Dashboard** → View extra attempts → Click request
7. **Extra Attempts** → Review → Approve → Course Builder notified
8. **Company Settings** → Update settings → Save
9. **Employee List** → Search employee → View profile
10. **Profile** → Edit if needed → Save

**No dead ends:** All requests have clear approval workflows.

---

#### 14.5 Admin - System Management Journey
1. **Login** → Admin Dashboard
2. **Dashboard** → View companies → Click company
3. **Company Profile** → View details → View employees
4. **Employee List** → Click employee → Employee Profile
5. **Dashboard** → View critical requests → Click request
6. **Critical Request** → Review → Approve/Reject
7. **System Logs** → View logs → Filter → Export
8. **System Configuration** → Update settings → Save
9. **Dashboard** → Click "Dashboard" → Management Reporting (external)

**No dead ends:** Full system access with clear navigation.

---

### 15. RBAC UI Enforcement

#### 15.1 Component-Level Permissions
- All components check user role before rendering
- Hidden components for unauthorized users
- Disabled actions for unauthorized users
- Clear error messages if access denied
- Permission checks on both frontend and backend

#### 15.2 Route Protection
- Protected routes based on role
- Route guards check permissions
- Redirect to appropriate page if unauthorized
- 403 error page for denied access
- Login redirect if not authenticated

#### 15.3 Data Filtering
- API calls filtered by role
- Backend enforces permissions
- Frontend displays only authorized data
- Company isolation enforced (F053)
- No cross-company data access

#### 15.4 Visual Indicators
- Role badges/indicators
- Permission indicators on actions
- Locked/unavailable state for restricted features
- Tooltips explaining why action is unavailable
- Grayed-out buttons for unauthorized actions

---

### 16. Integration Points

#### 16.1 Learning Analytics Redirect
- "Dashboard" button in employee profile
- Redirects to Learning Analytics microservice
- Passes employee context (ID, role)
- Learning Analytics determines dashboard view
- Return link to Directory

#### 16.2 Management Reporting Redirect
- "Dashboard" button in admin profile
- Redirects to Management Reporting microservice
- Passes admin context
- Return link to Directory

#### 16.3 Skills Engine Redirect
- "More" button in skills section
- Redirects to Skills Engine frontend
- Passes employee ID and skills context
- Return link to Directory

#### 16.4 Learner AI Redirect
- "Learning Path" button
- "Review in Learner AI" button (Decision Maker)
- Redirects to Learner AI frontend
- Passes employee ID and approval context
- Return link to Directory

#### 16.5 Course Builder Redirect
- Course name links
- "Continue Learning" buttons
- Redirects to Course Builder frontend
- Passes course and employee context
- Return link to Directory

#### 16.6 Content Studio Redirect
- "View Course" button (Trainer)
- Redirects to Content Studio frontend
- Passes trainer and course context
- Return link to Directory

#### 16.7 Assessment Redirect
- Skill verification assessment link
- Redirects to Assessment microservice
- Passes employee and skill context
- Return link to Directory

---

### 17. Error Handling & Edge Cases

#### 17.1 API Error Handling
- Network errors: Retry button, clear error message
- Timeout errors: Timeout message, retry option
- 404 errors: "Not found" message, redirect option
- 403 errors: Access denied message, redirect to appropriate page
- 500 errors: Server error message, support contact
- Validation errors: Field-level error messages

#### 17.2 Form Validation Errors
- Real-time validation
- Field-level error messages
- Form-level error summary
- Required field indicators
- Format validation (email, URL, etc.)
- Custom validation rules

#### 17.3 Empty States
- No data messages
- Helpful suggestions
- Action buttons to create/add
- Illustrations/icons
- Context-specific messages

#### 17.4 Loading States
- Skeleton loaders
- Progress indicators
- Loading spinners
- Optimistic updates where appropriate
- Timeout handling

#### 17.5 Offline Handling
- Offline detection
- Offline message
- Queue actions for when online
- Sync when back online

---

### 18. Performance Optimization

#### 18.1 Frontend Performance
- Code splitting
- Lazy loading for routes
- Image optimization
- Component memoization
- Virtual scrolling for long lists
- Debounced search inputs

#### 18.2 Loading Strategies
- Skeleton loaders (perceived performance)
- Progressive loading
- Pagination for lists
- Infinite scroll (optional)
- Caching strategies

#### 18.3 Response Time Targets
- Profile loading: < 2 seconds
- Company registration: < 5 seconds
- Course assignment: < 3-4 seconds
- Page navigation: < 1 second
- Form submission: < 2 seconds

---

### 19. Accessibility Requirements

#### 19.1 WCAG 2.1 AA Compliance
- Color contrast ratios
- Keyboard navigation
- Screen reader support
- Focus management
- ARIA labels and roles
- Semantic HTML

#### 19.2 Keyboard Navigation
- Tab through interactive elements
- Enter to activate buttons/links
- Escape to close modals
- Arrow keys for navigation (where applicable)
- Skip links for main content

#### 19.3 Screen Reader Support
- ARIA labels on all interactive elements
- ARIA live regions for dynamic content
- Semantic HTML structure
- Alt text for images
- Descriptive link text

#### 19.4 Focus Management
- Visible focus indicators
- Focus trap in modals
- Focus return after modal close
- Focus on error messages
- Logical tab order

---

### 20. Responsive Design Specifications

#### 20.1 Mobile-First Approach
- Design for mobile first
- Progressive enhancement for larger screens
- Touch-friendly targets (min 44px)
- Adequate spacing between interactive elements

#### 20.2 Breakpoint Strategy
- Mobile: Single column, stacked layout
- Tablet: Two columns where appropriate
- Desktop: Multi-column, sidebars
- Large desktop: Max-width containers, centered

#### 20.3 Component Adaptations
- Tables → Cards on mobile
- Sidebars → Drawers on mobile
- Multi-column → Single column on mobile
- Horizontal scroll where necessary (tables)
- Collapsible sections on mobile

#### 20.4 Navigation Adaptations
- Top nav → Hamburger menu on mobile
- Side nav → Drawer on mobile
- Breadcrumbs → Back button + current page on mobile
- Bottom nav bar (optional) on mobile

---

## Implementation Checklist

### Phase 1: Core Pages
- [ ] Authentication pages (Login, Signup, Forgot Password, Reset Password)
- [ ] HR Landing Page
- [ ] Company Registration Flow (4 steps)
- [ ] Role-based Dashboards (5 types)
- [ ] Profile Pages (5 types)
- [ ] Basic Navigation

### Phase 2: Request Management
- [ ] Learning Requests Pages
- [ ] Trainer Requests Pages
- [ ] Extra Attempts Pages
- [ ] Profile Approval Pages
- [ ] Request Forms

### Phase 3: Advanced Features
- [ ] Learning Path Pages
- [ ] Skill Verification Pages
- [ ] Company Management Pages
- [ ] Settings Pages
- [ ] Admin Pages

### Phase 4: UI Components
- [ ] Multi-step forms
- [ ] Notifications system
- [ ] Approval modals
- [ ] Filters and search
- [ ] Hierarchy views
- [ ] Data tables
- [ ] Form components

### Phase 5: Polish & Enhancement
- [ ] Error pages
- [ ] Loading states
- [ ] Empty states
- [ ] Accessibility enhancements
- [ ] Performance optimization
- [ ] Responsive refinements

---

## Critical Requirements Summary

1. **Complete Coverage:** All 56 features have corresponding UI pages/components
2. **No Dead Ends:** Every page has clear navigation paths
3. **RBAC Enforcement:** All components respect role-based permissions
4. **Logical Flow:** Intuitive navigation between related pages
5. **Error Handling:** All error states and edge cases covered
6. **Accessibility:** WCAG 2.1 AA compliance throughout
7. **Responsive:** Mobile-first design for all devices
8. **Performance:** Meets all response time targets
9. **Integration:** All external microservice redirects implemented
10. **Production-Ready:** Comprehensive, tested, polished

---

This document serves as the complete blueprint for UI/UX implementation during the UI-UX-Design-Template phase and subsequent development phases.
