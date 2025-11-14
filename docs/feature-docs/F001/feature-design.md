# Feature Design - F001: Company Registration Form

## Feature Information
- **Feature ID:** F001
- **Feature Title:** Company Registration Form (Two-Step Process)
- **Feature Description:** HR registers company in two steps: (1) Basic form with company basic data and HR data, (2) After domain verification, full company setup with all details including employee list with external data source links.
- **Dependencies:** None
- **Status:** ✅ Complete

---

## Design Decisions

### Architecture
- **Approach:** Two-step registration process with domain verification between steps
- **Patterns Used:** MVC pattern (Controllers, Services, Routes), Transaction pattern for data integrity
- **Service Layer:** 
  - `companyRegistrationController.js` - Handles registration logic
  - `companyVerificationService.js` - Handles domain verification
  - `emailService.js` - Handles email notifications (placeholder)
- **Data Flow:** 
  1. Frontend submits Step 1 → Backend creates company record → Domain verification (async)
  2. Frontend submits Step 4 → Backend validates → Transaction creates all entities → Returns company ID

### API Design
- **Endpoints:**
  - `POST /api/company/register` - Step 1: Basic registration
  - `POST /api/company/register/step4` - Step 4: Full setup
  - `POST /api/company/:id/verify` - Check verification status
  - `GET /api/company/:id` - Get company by ID
  - `GET /api/company?hrEmail=...` - Get company by HR email
- **Request/Response Format:** JSON
- **Error Handling:** Standardized error responses with `success`, `error`, `message` fields

### Database Design
- **Tables Affected:** 
  - `companies` - Company basic info
  - `company_settings` - HR info, company settings (exercise_limit, passing_grade, max_attempts)
  - `departments` - Department structure
  - `teams` - Team structure within departments
  - `employees` - Employee list with external links
- **Schema Changes:** All tables created in initial schema
- **Relationships:** 
  - `departments.company_id` → `companies.id`
  - `teams.department_id` → `departments.id`
  - `employees.company_id` → `companies.id`
  - `employees.department_id` → `departments.id` (nullable)
  - `employees.team_id` → `teams.id` (nullable)

### Security Considerations
- **Authentication:** Not required for registration (public endpoint)
- **Authorization:** No authorization needed (public registration)
- **Data Validation:** 
  - Frontend: Real-time validation with error messages
  - Backend: `express-validator` for all inputs
  - Email format validation
  - Domain format validation
  - Required field validation
- **Security Risks:** 
  - SQL Injection: Mitigated by parameterized queries
  - XSS: Mitigated by React's built-in escaping
  - Data Integrity: Transaction support ensures atomicity

---

## Implementation Plan

### Milestones
1. ✅ Create Company Registration Form UI (Step 1)
2. ✅ Implement Backend Registration Endpoint (Step 1)
3. ✅ Create Verification Status Page
4. ✅ Implement Domain Verification Service
5. ✅ Create Full Setup Form UI (Step 4)
6. ✅ Implement Backend Full Setup Endpoint (Step 4)

### Artifacts
- **Frontend:**
  - `frontend/src/components/CompanyRegistration/CompanyRegistrationStep1.js`
  - `frontend/src/components/CompanyRegistration/CompanyRegistrationVerification.js`
  - `frontend/src/components/CompanyRegistration/CompanyRegistrationStep4.js`
  - `frontend/src/components/CompanyRegistration/EmployeeListInput.js`
  - `frontend/src/components/CompanyRegistration/DepartmentTeamInput.js`
  - `frontend/src/components/CompanyRegistration/LearningPathPolicyInput.js`
  - `frontend/src/pages/HRLanding.js`
- **Backend:**
  - `backend/routes/companyRegistration.js`
  - `backend/controllers/companyRegistrationController.js`
  - `backend/validators/companyRegistrationValidator.js`
  - `backend/services/companyVerificationService.js`
  - `backend/services/emailService.js`
- **Database:**
  - `database/schema.sql` (includes all tables)

### Testing Strategy
- **Unit Tests:** Not implemented yet (future)
- **Integration Tests:** Not implemented yet (future)
- **E2E Tests:** Manual testing completed

---

## External Integrations
- **Services:** None (domain verification is simplified for MVP)
- **APIs:** None
- **Mock Data:** N/A

---

## Notes
- Domain verification is simplified for MVP (accepts any valid domain format)
- Email service is placeholder (not implemented)
- Transaction support ensures data integrity during Step 4
- Departments and teams are optional
- Employees can be assigned to existing managers

---

## Approval
- **Design Approved:** ✅ (Implicit - implemented)
- **Ready for Implementation:** ✅ Complete

