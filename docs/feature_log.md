# Feature Log

This document tracks all features, their IDs, descriptions, dependencies, and file lists.

**Last Updated:** 2025-01-11

---

## Feature F001: Company Registration Form

- **ID:** F001
- **Title:** Company Registration Form (Two-Step Process)
- **Description:** HR registers company in two steps: (1) Basic form with company basic data and HR data, (2) After domain verification, full company setup with all details including employee list with external data source links.
- **Status:** ✅ Complete
- **Dependencies:** None
- **Files:**
  - Frontend: CompanyRegistrationStep1.js, CompanyRegistrationVerification.js, CompanyRegistrationStep4.js, EmployeeListInput.js, DepartmentTeamInput.js, LearningPathPolicyInput.js, HRLanding.js
  - Backend: companyRegistration.js (routes), companyRegistrationController.js, companyRegistrationValidator.js, companyVerificationService.js, emailService.js
  - Database: schema.sql

---

## Feature F002: Company Legitimacy Verification

- **ID:** F002
- **Title:** Company Legitimacy Verification
- **Description:** Directory verifies company registration request. If invalid, sends email to HR with reason. If valid, creates company account.
- **Status:** ✅ Complete
- **Dependencies:** F001
- **Files:**
  - Backend: companyVerificationService.js, emailService.js

---

## Feature F003: Employee Registration Check with Auth Service

- **ID:** F003
- **Title:** Employee Registration Check with Auth Service
- **Description:** After company creation, Directory checks with Auth Service if all employees are registered. Unregistered employees trigger in-app notifications to HR via SendPulse.
- **Status:** ✅ Complete
- **Dependencies:** F002
- **Files:**
  - Backend: authServiceIntegration.js, sendPulseService.js, employeeRegistrationController.js, employeeRegistration.js (routes), notifications.js (routes), notificationsController.js
  - Database: schema.sql (notifications table)

---

## Feature Lifecycle

- **F001:** Created → Implemented → Complete
- **F002:** Created → Implemented → Complete
- **F003:** Created → Implemented → Complete

---

## Next Features (Planned)

- **F004:** External Data Collection for Employee Profiles (LinkedIn & GitHub)
- **F005:** AI-Enhanced Profile Enrichment (Gemini)
- **F006:** Skills Engine Integration
- **F007:** Employee Profile Creation & Storage

