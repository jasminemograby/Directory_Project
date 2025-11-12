# Directory Microservice - Requirements Document

## Project Overview

**Project Name:** Directory  
**Purpose:** Central hub within the EduCore system for finding, managing, and interacting with entities (trainers, courses, internal resources) across multiple microservices.  
**Scale (MVP):** 10 companies, 5-20 employees each (~200-500 concurrent users)  
**Platforms:** Desktop, tablet, and mobile web browsers (responsive design)

---

## User Hierarchy & Roles

1. **Admin / Directory Manager** - Super admin, sees all companies, employees, departments, teams. Full system permissions.
2. **Primary HR / Company Registrar** - Registers company, sees all company profiles, departments, teams.
3. **Department Manager** - Sees employee profiles in departments they manage. Can also view own profile like any other Employee.
4. **Team Manager** - Sees employee profiles in their team only. Can also view own profile like any other Employee.
5. **Employees** - Types: Regular (learns) or Trainer (learns + teaches). See only own profile.

---

## Features (Smallest Independent Units)

### Feature F001: Company Registration Form (Two-Step Process)
**ID:** F001  
**Title:** Company Registration Form (Two-Step Process)  
**Description:** HR registers company in two steps: (1) Basic form with company basic data and HR data, (2) After domain verification, full company setup with all details including employee list with external data source links.  
**Inputs - Step 1 (Basic Registration):**
- Company name, industry
- HR/Registrar data (name, email, role)
- Company domain/email domain for verification

**Inputs - Step 2 (Full Setup - After Domain Verification):**
- Departments and teams structure
- Full employee list with:
  - Names, emails
  - Current role (e.g., 'QA', 'Backend Developer', 'Designer')
  - Target role (career path target)
  - Employee type: regular/internal instructor/external instructor
  - External data source links (if available):
    - LinkedIn profile link
    - GitHub profile link
    - Credly profile link
    - YouTube channel link
    - ORCID profile link
    - Crossref profile link
- Career paths per employee
- Single Decision Maker for Learning Path approval (optional if auto-approval)
- Learning Path approval policy (Manual/Auto)
- Primary KPI(s)

**Outputs:** 
- Company registration request data
- Validation status

**Artifact Filenames:**
- `frontend/src/components/CompanyRegistration/CompanyRegistrationForm.js`
- `frontend/src/components/CompanyRegistration/EmployeeListInput.js`
- `frontend/src/components/CompanyRegistration/DepartmentTeamInput.js`
- `backend/routes/companyRegistration.js`
- `backend/controllers/companyRegistrationController.js`
- `backend/validators/companyRegistrationValidator.js`

**Dependencies:** None (first feature)

**File List:**
- `frontend/src/components/CompanyRegistration/CompanyRegistrationForm.js`
- `frontend/src/components/CompanyRegistration/EmployeeListInput.js`
- `frontend/src/components/CompanyRegistration/DepartmentTeamInput.js`
- `frontend/src/components/CompanyRegistration/LearningPathPolicyInput.js`
- `backend/routes/companyRegistration.js`
- `backend/controllers/companyRegistrationController.js`
- `backend/validators/companyRegistrationValidator.js`
- `backend/models/CompanyRegistration.js`

---

### Feature F002: Company Legitimacy Verification (Domain Check)
**ID:** F002  
**Title:** Company Legitimacy Verification (Domain Check)  
**Description:** Directory verifies company legitimacy by checking company domain (e.g., verifying if there is a mail service for the company domain). If invalid, sends email to HR with reason. If valid, allows company to continue with full setup (Step 2).  
**Inputs:** 
- Company domain/email domain from Step 1 registration

**Outputs:** 
- Verification result (valid/invalid)
- Email notification to HR (if invalid)
- Permission to continue with Step 2 full setup (if valid)

**Artifact Filenames:**
- `backend/services/companyVerificationService.js`
- `backend/services/emailService.js`
- `backend/controllers/companyVerificationController.js`

**Dependencies:** F001

**File List:**
- `backend/services/companyVerificationService.js`
- `backend/services/emailService.js`
- `backend/controllers/companyVerificationController.js`

---

### Feature F003: Employee Registration Check
**ID:** F003  
**Title:** Employee Registration Check with Auth Service  
**Description:** After company creation, Directory checks with Auth Service if all employees are registered. Unregistered employees trigger in-app notifications to HR via SendPulse.  
**Inputs:** 
- Employee list from company registration
- Company ID

**Outputs:** 
- Registration status per employee
- In-app notifications to HR for unregistered employees

**Artifact Filenames:**
- `backend/services/authServiceIntegration.js`
- `backend/services/sendPulseService.js`
- `backend/controllers/employeeRegistrationController.js`

**Dependencies:** F002

**File List:**
- `backend/services/authServiceIntegration.js`
- `backend/services/sendPulseService.js`
- `backend/controllers/employeeRegistrationController.js`

---

### Feature F004: External Data Collection
**ID:** F004  
**Title:** External Data Collection for Employee Profiles  
**Description:** Collects employee data from external APIs: LinkedIn, GitHub, Credly, YouTube, ORCID, Crossref. HR provides direct links during company registration (Step 2 of F001). Directory uses these links to extract data from external sources.  
**Inputs:** 
- Employee names, emails
- External source links provided by HR during registration:
  - LinkedIn profile links
  - GitHub profile links
  - Credly profile links
  - YouTube channel links
  - ORCID profile links
  - Crossref profile links
- LinkedIn API credentials

**Outputs:** 
- Raw employee data from all external sources

**Artifact Filenames:**
- `backend/services/linkedInService.js`
- `backend/services/githubService.js`
- `backend/services/credlyService.js`
- `backend/services/youtubeService.js`
- `backend/services/orcidService.js`
- `backend/services/crossrefService.js`
- `backend/services/externalDataCollector.js`

**Dependencies:** F002

**File List:**
- `backend/services/linkedInService.js`
- `backend/services/githubService.js`
- `backend/services/credlyService.js`
- `backend/services/youtubeService.js`
- `backend/services/orcidService.js`
- `backend/services/crossrefService.js`
- `backend/services/externalDataCollector.js`
- `backend/config/externalApis.js`

---

### Feature F005: AI-Enhanced Profile Enrichment
**ID:** F005  
**Title:** AI-Enhanced Profile Enrichment (Bio & Projects)  
**Description:** Before sending to Skills Engine, Directory uses Gemini API to generate short professional bio and identify/summarize projects from collected raw data.  
**Inputs:** 
- Raw employee data from external sources

**Outputs:** 
- AI-generated short bio
- Project titles and AI-generated summaries

**Artifact Filenames:**
- `backend/services/geminiService.js`
- `backend/services/profileEnrichmentService.js`

**Dependencies:** F004

**File List:**
- `backend/services/geminiService.js`
- `backend/services/profileEnrichmentService.js`

---

### Feature F006: Skills Engine Integration - Normalization
**ID:** F006  
**Title:** Skills Engine Integration - Skill Normalization  
**Description:** Directory sends collected raw data and employee type (trainer/regular) to Skills Engine. Skills Engine returns normalized skills as structured competencies (unverified).  
**Inputs:** 
- Raw employee data
- Employee type (trainer/regular)

**Outputs:** 
- Normalized skills (unverified) as structured competencies

**Artifact Filenames:**
- `backend/services/skillsEngineService.js`
- `backend/controllers/skillsEngineController.js`

**Dependencies:** F005

**File List:**
- `backend/services/skillsEngineService.js`
- `backend/controllers/skillsEngineController.js`

---

### Feature F007: Employee Profile Creation
**ID:** F007  
**Title:** Employee Profile Creation & Storage  
**Description:** Creates full employee profile in Directory DB with all collected and enriched data. Profile includes: normalized skills, bio, projects, basic info, role, type. Profile is created in "pending approval" status awaiting HR confirmation.  
**Inputs:** 
- Company registration data
- Enriched profile data (bio, projects)
- Normalized skills from Skills Engine

**Outputs:** 
- Employee profile record in database (status: pending approval)

**Artifact Filenames:**
- `backend/models/Employee.js`
- `backend/services/profileService.js`
- `backend/controllers/profileController.js`
- `database/migrations/001_create_employees_table.sql`

**Dependencies:** F006

**File List:**
- `backend/models/Employee.js`
- `backend/services/profileService.js`
- `backend/controllers/profileController.js`
- `database/migrations/001_create_employees_table.sql`

---

### Feature F007A: HR Initial Profile Approval/Confirmation
**ID:** F007A  
**Title:** HR Initial Profile Approval/Confirmation  
**Description:** HR reviews and confirms employee experience and information for newly created profiles. HR must approve basic profile before employee card can be generated.  
**Inputs:** 
- Employee profile data awaiting approval
- HR confirmation of employee experience and information

**Outputs:** 
- Approved employee profile (status: approved)
- Profile ready for employee card generation

**Artifact Filenames:**
- `frontend/src/components/HR/InitialProfileApproval.js`
- `backend/routes/initialProfileApproval.js`
- `backend/controllers/initialProfileApprovalController.js`

**Dependencies:** F007

**File List:**
- `frontend/src/components/HR/InitialProfileApproval.js`
- `frontend/src/pages/HRDashboard.js`
- `backend/routes/initialProfileApproval.js`
- `backend/controllers/initialProfileApprovalController.js`
- `backend/services/initialProfileApprovalService.js`

---

### Feature F007B: Employee Card Generation
**ID:** F007B  
**Title:** Employee Card Generation  
**Description:** After HR approval of basic profile, Directory generates complete Employee Card including: normalized skills into competencies (from Skills Engine), short bio (AI-generated), value proposition (career plans with required skills), and relevance scoring (numeric: required skills - current verified skills from Skills Engine).  
**Inputs:** 
- Approved employee profile (from F007A)
- Normalized skills from Skills Engine
- Career plans
- Skills Engine data (required vs current skills)

**Outputs:** 
- Complete employee card with:
  - Normalized skills into competencies
  - Short bio (AI-generated)
  - Value proposition
  - Relevance scoring

**Artifact Filenames:**
- `frontend/src/components/Profile/EmployeeCard.js`
- `backend/services/employeeCardService.js`

**Dependencies:** F007A, F006, F009

**File List:**
- `frontend/src/components/Profile/EmployeeCard.js`
- `backend/services/employeeCardService.js`

---

### Feature F008: Employee Profile Display
**ID:** F008  
**Title:** Employee Profile Display  
**Description:** Frontend component to display employee profile with all sections: bio, projects, skills, value proposition, relevance scores, completed courses, learning path button.  
**Inputs:** 
- Employee ID
- User role (for permission-based visibility)

**Outputs:** 
- Rendered employee profile page

**Artifact Filenames:**
- `frontend/src/components/Profile/EmployeeProfile.js`
- `frontend/src/components/Profile/ProfileBio.js`
- `frontend/src/components/Profile/ProfileProjects.js`
- `frontend/src/components/Profile/ProfileSkills.js`
- `frontend/src/components/Profile/ProfileCourses.js`
- `frontend/src/pages/ProfilePage.js`

**Dependencies:** F007B

**File List:**
- `frontend/src/components/Profile/EmployeeProfile.js`
- `frontend/src/components/Profile/ProfileBio.js`
- `frontend/src/components/Profile/ProfileProjects.js`
- `frontend/src/components/Profile/ProfileSkills.js`
- `frontend/src/components/Profile/ProfileCourses.js`
- `frontend/src/components/Profile/ProfileValueProposition.js`
- `frontend/src/pages/ProfilePage.js`
- `frontend/src/services/profileService.js`

---

### Feature F009: Value Proposition Generation
**ID:** F009  
**Title:** Value Proposition Generation  
**Description:** Generates employee value proposition using company career plans and Skills Engine data. Includes skill gap button that leads to Skills Engine frontend.  
**Inputs:** 
- Employee career plan
- Skills Engine data (required vs current skills)

**Outputs:** 
- Value proposition text
- Skill gap URL

**Artifact Filenames:**
- `backend/services/valuePropositionService.js`
- `backend/controllers/valuePropositionController.js`

**Dependencies:** F006, F007

**File List:**
- `backend/services/valuePropositionService.js`
- `backend/controllers/valuePropositionController.js`

---

### Feature F010: Relevance Score Display
**ID:** F010  
**Title:** Relevance Score Display  
**Description:** Displays numeric relevance score (required skills - current verified skills) from Skills Engine in employee profile.  
**Inputs:** 
- Relevance score from Skills Engine

**Outputs:** 
- Displayed relevance score in profile

**Artifact Filenames:**
- `frontend/src/components/Profile/RelevanceScore.js`

**Dependencies:** F008, F006

**File List:**
- `frontend/src/components/Profile/RelevanceScore.js`

---

### Feature F011: Skill Verification Request
**ID:** F011  
**Title:** Skill Verification Request (Initial)  
**Description:** Employee clicks "Verify Your Skills" button. Directory triggers Skills Engine verification process. Skills Engine sends assessment request to Assessment microservice.  
**Inputs:** 
- Employee ID
- Selected skills to verify

**Outputs:** 
- Verification request sent to Skills Engine
- Assessment exam initiated

**Artifact Filenames:**
- `frontend/src/components/Profile/VerifySkillsButton.js`
- `backend/routes/skillVerification.js`
- `backend/controllers/skillVerificationController.js`

**Dependencies:** F008

**File List:**
- `frontend/src/components/Profile/VerifySkillsButton.js`
- `backend/routes/skillVerification.js`
- `backend/controllers/skillVerificationController.js`

---

### Feature F012: Verified Skills Update
**ID:** F012  
**Title:** Verified Skills Update from Skills Engine  
**Description:** After skill verification exam, Skills Engine sends verified skills list back to Directory. Directory updates employee profile with verified skills and relevance scores. Hides "Verify Your Skills" button.  
**Inputs:** 
- Verified skills list from Skills Engine
- Updated relevance scores

**Outputs:** 
- Updated employee profile with verified skills
- Hidden "Verify Your Skills" button

**Artifact Filenames:**
- `backend/routes/skillsEngineWebhook.js`
- `backend/controllers/skillsEngineWebhookController.js`

**Dependencies:** F011

**File List:**
- `backend/routes/skillsEngineWebhook.js`
- `backend/controllers/skillsEngineWebhookController.js`

---

### Feature F013: Skills Engine Frontend Redirect
**ID:** F013  
**Title:** Skills Engine Frontend Redirect  
**Description:** Employee profile includes "More" button that redirects to Skills Engine frontend to view full skills and gap details.  
**Inputs:** 
- Employee ID

**Outputs:** 
- Redirect to Skills Engine frontend with employee context

**Artifact Filenames:**
- `frontend/src/components/Profile/SkillsMoreButton.js`

**Dependencies:** F008

**File List:**
- `frontend/src/components/Profile/SkillsMoreButton.js`

---

### Feature F014: HR Training Request - Fully Personalized
**ID:** F014  
**Title:** HR Training Request - Fully Personalized (Career Path Driven)  
**Description:** HR submits training request aligned with employee career path. Directory checks missing skills via Value Proposition, queries Marketplace for instructors, sends invitations.  
**Inputs:** 
- Employee ID
- Career path alignment
- Missing skills from Value Proposition

**Outputs:** 
- Training request
- Instructor search results from Marketplace
- Invitation emails sent

**Artifact Filenames:**
- `frontend/src/components/HR/TrainingRequestForm.js`
- `frontend/src/components/HR/CareerPathTrainingRequest.js`
- `backend/routes/trainingRequests.js`
- `backend/controllers/trainingRequestController.js`
- `backend/services/marketplaceService.js`

**Dependencies:** F009, F008

**File List:**
- `frontend/src/components/HR/TrainingRequestForm.js`
- `frontend/src/components/HR/CareerPathTrainingRequest.js`
- `backend/routes/trainingRequests.js`
- `backend/controllers/trainingRequestController.js`
- `backend/services/marketplaceService.js`

---

### Feature F015: HR Training Request - Group/Department
**ID:** F015  
**Title:** HR Training Request - Group/Department (Skill-Driven)  
**Description:** HR requests specific skills for employees/groups. Directory checks if employees lack these skills, finds instructors via Marketplace, coordinates training.  
**Inputs:** 
- Employee/group IDs
- Required skills
- Department/team selection

**Outputs:** 
- Group training request
- Instructor matches
- Training coordination

**Artifact Filenames:**
- `frontend/src/components/HR/GroupTrainingRequest.js`
- `backend/controllers/groupTrainingController.js`

**Dependencies:** F014

**File List:**
- `frontend/src/components/HR/GroupTrainingRequest.js`
- `backend/controllers/groupTrainingController.js`

---

### Feature F016: HR Training Request - Specific Instructor
**ID:** F016  
**Title:** HR Training Request - Specific Instructor  
**Description:** HR requests a particular instructor. Directory checks if employee lacks skills taught by instructor, coordinates training assignment.  
**Inputs:** 
- Employee ID(s)
- Instructor ID

**Outputs:** 
- Instructor-led training request
- Training assignment

**Artifact Filenames:**
- `frontend/src/components/HR/InstructorTrainingRequest.js`
- `backend/controllers/instructorTrainingController.js`

**Dependencies:** F014

**File List:**
- `frontend/src/components/HR/InstructorTrainingRequest.js`
- `backend/controllers/instructorTrainingController.js`

---

### Feature F017: Marketplace Integration - Find Trainers
**ID:** F017  
**Title:** Marketplace Integration - Find Trainers by Skills  
**Description:** Directory queries Marketplace to find qualified instructors with required skills. Marketplace returns trainer info.  
**Inputs:** 
- Required skills
- Search criteria

**Outputs:** 
- Trainer search results from Marketplace

**Artifact Filenames:**
- `backend/services/marketplaceService.js`

**Dependencies:** None (can be used independently)

**File List:**
- `backend/services/marketplaceService.js`

---

### Feature F018: Marketplace Fallback Course Creation
**ID:** F018  
**Title:** Marketplace Fallback Course Creation  
**Description:** If no trainer found, Marketplace creates course on the fly. Employee clicks card → goes to Course Builder. Marketplace updates Directory → Directory notifies Content Studio for manual content creation by AI.  
**Inputs:** 
- Training request with no trainer match

**Outputs:** 
- Fallback course created
- Content Studio notification

**Artifact Filenames:**
- `backend/services/marketplaceService.js`
- `backend/services/contentStudioService.js`

**Dependencies:** F017

**File List:**
- `backend/services/marketplaceService.js` (updated)
- `backend/services/contentStudioService.js`

---

### Feature F019: Trainer Invitation Email
**ID:** F019  
**Title:** Trainer Invitation Email via Mail API  
**Description:** Directory sends training invitation email to instructor via Mail API. Instructor status changes to "Invited".  
**Inputs:** 
- Instructor email
- Training request details

**Outputs:** 
- Invitation email sent
- Instructor status = Invited

**Artifact Filenames:**
- `backend/services/mailService.js`
- `backend/controllers/invitationController.js`

**Dependencies:** F014, F015, F016

**File List:**
- `backend/services/mailService.js`
- `backend/controllers/invitationController.js`

---

### Feature F020: Trainer Status Management
**ID:** F020  
**Title:** Trainer Status Management (Invited → Active → Archived)  
**Description:** Manages trainer lifecycle: Invited (after invitation), Active (after Content Studio assignment), Archived (after completion or HR disapproval).  
**Inputs:** 
- Trainer ID
- Status change event

**Outputs:** 
- Updated trainer status

**Artifact Filenames:**
- `backend/models/Trainer.js`
- `backend/services/trainerStatusService.js`
- `backend/controllers/trainerStatusController.js`

**Dependencies:** F019

**File List:**
- `backend/models/Trainer.js`
- `backend/services/trainerStatusService.js`
- `backend/controllers/trainerStatusController.js`
- `database/migrations/002_create_trainers_table.sql`

---

### Feature F021: Content Studio Integration - Trainer Data
**ID:** F021  
**Title:** Content Studio Integration - Send Trainer Data  
**Description:** Directory sends trainer info (trainer_id, trainer_name, company_id), AIEnabled field, can_publish_externally field, and exercises limit to Content Studio.  
**Inputs:** 
- Trainer ID
- Company ID
- AI Enabled flag
- Public Publish flag
- Exercises limit (default: 4)

**Outputs:** 
- Trainer data sent to Content Studio

**Artifact Filenames:**
- `backend/services/contentStudioService.js`

**Dependencies:** F020

**File List:**
- `backend/services/contentStudioService.js` (updated)

---

### Feature F022: Content Studio Integration - Course Completion
**ID:** F022  
**Title:** Content Studio Integration - Course Completion Update  
**Description:** Content Studio updates Directory when content upload is complete (status → Archived). Sends accomplished course data: course_id, course_name, trainer_id, trainer_name, status.  
**Inputs:** 
- Course completion data from Content Studio webhook

**Outputs:** 
- Trainer status updated to Archived
- Course data stored

**Artifact Filenames:**
- `backend/routes/contentStudioWebhook.js`
- `backend/controllers/contentStudioWebhookController.js`

**Dependencies:** F021

**File List:**
- `backend/routes/contentStudioWebhook.js`
- `backend/controllers/contentStudioWebhookController.js`

---

### Feature F023: Course Builder Integration - Feedback
**ID:** F023  
**Title:** Course Builder Integration - Receive Course Feedback  
**Description:** Course Builder sends student feedback for each successfully completed course to Directory: feedback, course_id, course_name, learner_id. Directory also receives test attempts number from Assessment microservice. Directory updates employee profile to display completed courses with course name, feedback, and test attempts number.  
**Inputs:** 
- Course feedback data from Course Builder (REST API): feedback, course_id, course_name, learner_id
- Test attempts number from Assessment microservice

**Outputs:** 
- Updated employee profile with completed course, feedback, and test attempts number displayed

**Artifact Filenames:**
- `backend/routes/courseBuilderWebhook.js`
- `backend/controllers/courseBuilderWebhookController.js`

**Dependencies:** F008

**File List:**
- `backend/routes/courseBuilderWebhook.js`
- `backend/controllers/courseBuilderWebhookController.js`
- `frontend/src/components/Profile/ProfileCourses.js` (updated to show test attempts)

---

### Feature F024: Course Builder Integration - Preferred Language
**ID:** F024  
**Title:** Course Builder Integration - Preferred Language Sync  
**Description:** Directory sends each employee's preferred language (default: Hebrew) to Course Builder when company is created and whenever employee updates it manually. One-way update.  
**Inputs:** 
- Employee ID
- Preferred language value

**Outputs:** 
- Language preference sent to Course Builder

**Artifact Filenames:**
- `backend/services/courseBuilderService.js`
- `frontend/src/components/Profile/LanguagePreference.js`

**Dependencies:** F008

**File List:**
- `backend/services/courseBuilderService.js`
- `frontend/src/components/Profile/LanguagePreference.js`

---

### Feature F025: Post-Course Exam Extra Attempts Request
**ID:** F025  
**Title:** Post-Course Exam Extra Attempts Request  
**Description:** If employee reaches max attempts, "Request More Attempts" button appears. Employee clicks → Directory creates request routed to HR for approval.  
**Inputs:** 
- Employee ID
- Course ID
- Current attempt count

**Outputs:** 
- Extra attempt request created
- Request routed to HR

**Artifact Filenames:**
- `frontend/src/components/Profile/RequestExtraAttemptsButton.js`
- `backend/routes/extraAttempts.js`
- `backend/controllers/extraAttemptsController.js`

**Dependencies:** F008, F023

**File List:**
- `frontend/src/components/Profile/RequestExtraAttemptsButton.js`
- `backend/routes/extraAttempts.js`
- `backend/controllers/extraAttemptsController.js`
- `database/migrations/003_create_extra_attempts_requests_table.sql`

---

### Feature F026: HR Extra Attempts Approval
**ID:** F026  
**Title:** HR Extra Attempts Approval  
**Description:** HR reviews extra attempt requests in Directory, approves or rejects. If approved, Directory sends approval notification to Course Builder (not directly to Assessment). Course Builder then updates Assessment microservice to enable additional exam attempt.  
**Inputs:** 
- Extra attempt request ID
- HR approval/rejection decision

**Outputs:** 
- Request status updated
- Approval notification sent to Course Builder (if approved)
- Course Builder updates Assessment microservice with extra attempt approval

**Artifact Filenames:**
- `frontend/src/components/HR/ExtraAttemptsApproval.js`
- `backend/controllers/extraAttemptsApprovalController.js`

**Dependencies:** F025

**File List:**
- `frontend/src/components/HR/ExtraAttemptsApproval.js`
- `backend/controllers/extraAttemptsApprovalController.js`

---

### Feature F027: Skills Engine Integration - Post-Course Skills Update
**ID:** F027  
**Title:** Skills Engine Integration - Post-Course Skills Update  
**Description:** Each time employee passes course exam, Skills Engine updates Directory with: newly verified skills, new skills added during learning, updated relevance scores. Directory also receives the number of exam attempts performed by the employee from Assessment microservice.  
**Inputs:** 
- Skills update data from Skills Engine (REST API)
- Exam attempts number from Assessment microservice

**Outputs:** 
- Updated employee profile with new/verified skills and relevance scores
- Exam attempts number stored and displayed in profile

**Artifact Filenames:**
- `backend/routes/skillsEngineWebhook.js` (updated)

**Dependencies:** F012, F023

**File List:**
- `backend/routes/skillsEngineWebhook.js` (updated)

---

### Feature F028: Learning Path Approval Policy Management
**ID:** F028  
**Title:** Learning Path Approval Policy Management  
**Description:** HR sets company Learning Path approval policy (Manual/Auto) during registration or later. Directory sends policy and Decision Makers list to Learner AI (one-way). When an employee is assigned to a new course or training by company, Skills Engine microservice sends employee skill data to Learner AI for Learning Path generation.  
**Inputs:** 
- Company ID
- Approval policy (Manual/Auto)
- Decision Maker employee ID
- Employee skill data from Skills Engine (when employee assigned to course/training)

**Outputs:** 
- Policy updated in Directory
- Policy sent to Learner AI
- Employee skill data forwarded to Learner AI for Learning Path generation

**Artifact Filenames:**
- `frontend/src/components/HR/LearningPathPolicySettings.js`
- `backend/routes/learningPathPolicy.js`
- `backend/controllers/learningPathPolicyController.js`
- `backend/services/learnerAIService.js`

**Dependencies:** F001

**File List:**
- `frontend/src/components/HR/LearningPathPolicySettings.js`
- `backend/routes/learningPathPolicy.js`
- `backend/controllers/learningPathPolicyController.js`
- `backend/services/learnerAIService.js`

---

### Feature F029: Decision Maker Learning Path Requests View
**ID:** F029  
**Title:** Decision Maker Learning Path Requests View  
**Description:** Decision Makers can view pending Learning Path requests under their Directory profile. When clicked, redirects to Learner AI module for detailed approval.  
**Inputs:** 
- Decision Maker employee ID

**Outputs:** 
- List of pending Learning Path requests
- Redirect link to Learner AI

**Artifact Filenames:**
- `frontend/src/components/Profile/LearningPathRequests.js`
- `backend/routes/learningPathRequests.js`
- `backend/controllers/learningPathRequestsController.js`

**Dependencies:** F028, F008

**File List:**
- `frontend/src/components/Profile/LearningPathRequests.js`
- `backend/routes/learningPathRequests.js`
- `backend/controllers/learningPathRequestsController.js`

---

### Feature F030: Learning Analytics Dashboard Redirect
**ID:** F030  
**Title:** Learning Analytics Dashboard Redirect  
**Description:** Employee profile includes "Dashboard" button. When clicked, Directory redirects to Learning Analytics microservice. Learning Analytics determines appropriate dashboard view based on employee role.  
**Inputs:** 
- Employee ID
- Employee role

**Outputs:** 
- Redirect to Learning Analytics with employee context

**Artifact Filenames:**
- `frontend/src/components/Profile/DashboardButton.js`

**Dependencies:** F008

**File List:**
- `frontend/src/components/Profile/DashboardButton.js`

---

### Feature F031: Learning Path Display
**ID:** F031  
**Title:** Learning Path Display in Profile  
**Description:** Each employee can see their approved learning path in profile by clicking "Learning Path" button. Each company can see learning paths of its employees.  
**Inputs:** 
- Employee ID
- Company ID (for company view)

**Outputs:** 
- Learning path displayed in profile or company view

**Artifact Filenames:**
- `frontend/src/components/Profile/LearningPathButton.js`
- `frontend/src/components/Profile/LearningPathDisplay.js`
- `backend/routes/learningPath.js`
- `backend/controllers/learningPathController.js`

**Dependencies:** F008

**File List:**
- `frontend/src/components/Profile/LearningPathButton.js`
- `frontend/src/components/Profile/LearningPathDisplay.js`
- `backend/routes/learningPath.js`
- `backend/controllers/learningPathController.js`

---

### Feature F032: Employee Profile Edit
**ID:** F032  
**Title:** Employee Profile Edit (Allowed Fields)  
**Description:** Employee can view own profile and edit allowed fields. Sensitive fields require HR + Admin approval.  
**Inputs:** 
- Employee ID
- Field updates (allowed fields only)

**Outputs:** 
- Updated profile (if allowed fields)
- Approval request (if sensitive fields)

**Artifact Filenames:**
- `frontend/src/components/Profile/ProfileEditForm.js`
- `backend/routes/profileEdit.js`
- `backend/controllers/profileEditController.js`

**Dependencies:** F008

**File List:**
- `frontend/src/components/Profile/ProfileEditForm.js`
- `backend/routes/profileEdit.js`
- `backend/controllers/profileEditController.js`

---

### Feature F033: HR Profile Approval
**ID:** F033  
**Title:** HR Profile Approval for Sensitive Fields  
**Description:** HR reviews and approves/rejects employee requests to change sensitive profile fields. Admin approval also required for critical changes.  
**Inputs:** 
- Profile change request ID
- HR approval/rejection decision

**Outputs:** 
- Profile updated (if approved)
- Request status updated

**Artifact Filenames:**
- `frontend/src/components/HR/ProfileApproval.js`
- `backend/controllers/profileApprovalController.js`

**Dependencies:** F032

**File List:**
- `frontend/src/components/HR/ProfileApproval.js`
- `backend/controllers/profileApprovalController.js`

---

### Feature F034: Self-Learning Request
**ID:** F034  
**Title:** Employee Self-Learning Request  
**Description:** Employee views missing skills and can request self-learning. Active learners: direct enrollment allowed. Not yet directed: HR approval required.  
**Inputs:** 
- Employee ID
- Requested course/skill
- Employee learning status

**Outputs:** 
- Self-learning request created
- Direct enrollment (if active learner) or approval request (if not)

**Artifact Filenames:**
- `frontend/src/components/Profile/SelfLearningRequest.js`
- `backend/routes/selfLearning.js`
- `backend/controllers/selfLearningController.js`

**Dependencies:** F008, F009

**File List:**
- `frontend/src/components/Profile/SelfLearningRequest.js`
- `backend/routes/selfLearning.js`
- `backend/controllers/selfLearningController.js`

---

### Feature F035: Trainer Proactive Teaching Request
**ID:** F035  
**Title:** Trainer Proactive Teaching Request  
**Description:** Trainers can proactively choose to teach a skill and send teaching requests in Directory.  
**Inputs:** 
- Trainer ID
- Skill to teach
- Teaching request details

**Outputs:** 
- Teaching request created
- Request sent to HR/Marketplace

**Artifact Filenames:**
- `frontend/src/components/Trainer/TeachingRequestForm.js`
- `backend/routes/teachingRequest.js`
- `backend/controllers/teachingRequestController.js`

**Dependencies:** F020

**File List:**
- `frontend/src/components/Trainer/TeachingRequestForm.js`
- `backend/routes/teachingRequest.js`
- `backend/controllers/teachingRequestController.js`

---

### Feature F036: Trainer Profile Updates
**ID:** F036  
**Title:** Trainer Profile Updates (Courses Taught)  
**Description:** Trainer profile updates show courses taught. Profile includes AI Enable and Public Publish Enable fields (editable by instructor/company).  
**Inputs:** 
- Trainer ID
- Course completion data
- AI Enable flag
- Public Publish flag

**Outputs:** 
- Updated trainer profile with courses taught

**Artifact Filenames:**
- `frontend/src/components/Trainer/TrainerProfile.js`
- `backend/controllers/trainerProfileController.js`

**Dependencies:** F020, F022

**File List:**
- `frontend/src/components/Trainer/TrainerProfile.js`
- `backend/controllers/trainerProfileController.js`

---

### Feature F037: Hierarchical Profile Visibility
**ID:** F037  
**Title:** Hierarchical Profile Visibility (RBAC)  
**Description:** Profile visibility follows company hierarchy: Company Manager/HR → Department Leader → Team Leader → Employees. Each higher-level role can view profiles of all lower-level roles within their scope. All users (including managers) can view their own profile like any other Employee.  
**Inputs:** 
- Viewer employee ID
- Target employee ID
- Company hierarchy data

**Outputs:** 
- Profile visibility decision (allowed/denied)
- Profile data (if allowed)

**Artifact Filenames:**
- `backend/services/rbacService.js`
- `backend/middleware/profileVisibilityMiddleware.js`

**Dependencies:** F008

**File List:**
- `backend/services/rbacService.js`
- `backend/middleware/profileVisibilityMiddleware.js`

---

### Feature F038: Directory Super Admin Dashboard
**ID:** F038  
**Title:** Directory Super Admin Dashboard  
**Description:** Super Admin can access dedicated dashboard. Displays aggregated reports and analytics from HR & Management Reporting microservice. Can view all companies and employee profiles.  
**Inputs:** 
- Admin credentials

**Outputs:** 
- Admin dashboard with analytics
- Company and employee list views

**Artifact Filenames:**
- `frontend/src/pages/AdminDashboard.js`
- `frontend/src/components/Admin/CompanyListView.js`
- `frontend/src/components/Admin/EmployeeListView.js`
- `backend/routes/admin.js`
- `backend/controllers/adminController.js`
- `backend/services/managementReportingService.js`

**Dependencies:** None (admin feature)

**File List:**
- `frontend/src/pages/AdminDashboard.js`
- `frontend/src/components/Admin/CompanyListView.js`
- `frontend/src/components/Admin/EmployeeListView.js`
- `frontend/src/components/Admin/AnalyticsView.js`
- `backend/routes/admin.js`
- `backend/controllers/adminController.js`
- `backend/services/managementReportingService.js`

---

### Feature F039: Admin Action Logging
**ID:** F039  
**Title:** Admin Action Logging  
**Description:** Logs all critical admin actions: profile creation, deletion, updates, approvals. Logs stored for at least 12 months for auditing.  
**Inputs:** 
- Admin action type
- Action details
- Admin user ID

**Outputs:** 
- Action log entry

**Artifact Filenames:**
- `backend/services/auditLogService.js`
- `backend/middleware/auditLogMiddleware.js`
- `database/migrations/004_create_audit_logs_table.sql`

**Dependencies:** None (logging feature)

**File List:**
- `backend/services/auditLogService.js`
- `backend/middleware/auditLogMiddleware.js`
- `database/migrations/004_create_audit_logs_table.sql`

---

### Feature F039A: Critical Requests Routing to Directory Admin
**ID:** F039A  
**Title:** Critical Requests Routing to Directory Admin  
**Description:** All critical requests (profile creation with real data, course/instructor assignments, sensitive operations) must go through Directory admin for approval before execution. Directory routes these requests to admin dashboard for review and approval.  
**Inputs:** 
- Critical request data
- Request type (profile creation, course assignment, instructor assignment, etc.)

**Outputs:** 
- Request routed to Directory admin
- Admin approval/rejection decision
- Request executed (if approved) or rejected (if denied)

**Artifact Filenames:**
- `frontend/src/components/Admin/CriticalRequestsApproval.js`
- `backend/services/criticalRequestRoutingService.js`
- `backend/controllers/criticalRequestController.js`

**Dependencies:** F038, F039

**File List:**
- `frontend/src/components/Admin/CriticalRequestsApproval.js`
- `backend/services/criticalRequestRoutingService.js`
- `backend/controllers/criticalRequestController.js`
- `database/migrations/007_create_critical_requests_table.sql`

---

### Feature F040: HR Settings Management
**ID:** F040  
**Title:** HR Settings Management  
**Description:** HR can set: allowed assessment retakes, number of exercises in courses (default: 4), verification grade for skills, if trainer can public publish content, Learning Path approval policy, Decision Makers.  
**Inputs:** 
- Company ID
- Setting name
- Setting value

**Outputs:** 
- Updated company settings

**Artifact Filenames:**
- `frontend/src/components/HR/CompanySettings.js`
- `backend/routes/companySettings.js`
- `backend/controllers/companySettingsController.js`

**Dependencies:** F001

**File List:**
- `frontend/src/components/HR/CompanySettings.js`
- `backend/routes/companySettings.js`
- `backend/controllers/companySettingsController.js`
- `database/migrations/005_create_company_settings_table.sql`

---

### Feature F041: Data Integration - HR & Management Reporting
**ID:** F041  
**Title:** Data Integration - HR & Management Reporting  
**Description:** Directory sends all company and employee data, including primary KPIs, to HR & Management Reporting microservice.  
**Inputs:** 
- Company data
- Employee data
- KPI data

**Outputs:** 
- Data sent to HR & Management Reporting

**Artifact Filenames:**
- `backend/services/managementReportingService.js`

**Dependencies:** F007

**File List:**
- `backend/services/managementReportingService.js` (updated)

---

### Feature F042: Data Integration - Contextual Corporate Assistant
**ID:** F042  
**Title:** Data Integration - Contextual Corporate Assistant  
**Description:** Directory provides company and profiles data to Contextual Corporate Assistant for RAG/Graph recommendations.  
**Inputs:** 
- Company data
- Employee profile data

**Outputs:** 
- Data sent to Contextual Corporate Assistant

**Artifact Filenames:**
- `backend/services/contextualAssistantService.js`

**Dependencies:** F007

**File List:**
- `backend/services/contextualAssistantService.js`

---

### Feature F043: Data Integration - Learning Analytics
**ID:** F043  
**Title:** Data Integration - Learning Analytics  
**Description:** Directory sends company and employee data including KPIs and student feedback to Learning Analytics microservice for insights.  
**Inputs:** 
- Company data
- Employee data
- Student feedback
- KPI data

**Outputs:** 
- Data sent to Learning Analytics

**Artifact Filenames:**
- `backend/services/learningAnalyticsService.js`

**Dependencies:** F007, F023

**File List:**
- `backend/services/learningAnalyticsService.js`

---

### Feature F044: Completed Courses Display (Passed Only)
**ID:** F044  
**Title:** Completed Courses Display (Passed Only)  
**Description:** Only passed courses are displayed under "Completed Courses" in employee profile. Failed courses are not shown, even if Assessment identified new verified skills.  
**Inputs:** 
- Employee ID
- Course completion status

**Outputs:** 
- List of completed (passed) courses in profile

**Artifact Filenames:**
- `frontend/src/components/Profile/ProfileCourses.js` (updated)

**Dependencies:** F008, F023

**File List:**
- `frontend/src/components/Profile/ProfileCourses.js` (updated)

---

### Feature F045: Mock Data Fallback System
**ID:** F045  
**Title:** Mock Data Fallback System  
**Description:** When Directory calls external APIs (microservices or third-party), if API call fails (timeout, error, missing response), Directory automatically loads mock data from centralized `/mockData/index.json` file.  
**Inputs:** 
- Failed API call
- API identifier

**Outputs:** 
- Mock data response

**Artifact Filenames:**
- `mockData/index.json`
- `backend/services/mockDataService.js`
- `backend/middleware/mockDataFallbackMiddleware.js`

**Dependencies:** None (fallback system)

**File List:**
- `mockData/index.json`
- `backend/services/mockDataService.js`
- `backend/middleware/mockDataFallbackMiddleware.js`

---

### Feature F046: Single Public Entry Endpoint
**ID:** F046  
**Title:** Single Public Entry Endpoint  
**Description:** Directory exposes one main public endpoint that serves as unified communication gateway. Accepts: calling service name/identifier, JSON object describing requested data. Uses AI-assisted prompt to dynamically generate and execute SQL queries based on database schema. Returns exactly the data fields requested.  
**Inputs:** 
- Calling service name/identifier
- JSON object describing requested data

**Outputs:** 
- Dynamically generated SQL query result

**Artifact Filenames:**
- `backend/routes/publicEntry.js`
- `backend/controllers/publicEntryController.js`
- `backend/services/aiQueryService.js`
- `backend/services/dynamicQueryService.js`

**Dependencies:** None (core API feature)

**File List:**
- `backend/routes/publicEntry.js`
- `backend/controllers/publicEntryController.js`
- `backend/services/aiQueryService.js`
- `backend/services/dynamicQueryService.js`

---

### Feature F047: Database Schema Management
**ID:** F047  
**Title:** Database Schema Management  
**Description:** Maintains database schema definitions. AI-assisted query generation must reference current database schema before executing. Schema stored in Supabase.  
**Inputs:** 
- Schema definition
- Migration files

**Outputs:** 
- Database schema in Supabase
- Schema reference for AI queries

**Artifact Filenames:**
- `database/schema.sql`
- `database/migrations/`
- `backend/services/schemaService.js`

**Dependencies:** None (infrastructure)

**File List:**
- `database/schema.sql`
- `database/migrations/`
- `backend/services/schemaService.js`

---

### Feature F048: Security - Input Validation & SQL Injection Prevention
**ID:** F048  
**Title:** Security - Input Validation & SQL Injection Prevention  
**Description:** All dynamically generated SQL queries must be validated to prevent SQL injection. All user inputs validated before processing.  
**Inputs:** 
- User input
- SQL query

**Outputs:** 
- Validated input
- Sanitized SQL query

**Artifact Filenames:**
- `backend/middleware/inputValidationMiddleware.js`
- `backend/services/sqlInjectionPreventionService.js`

**Dependencies:** F046

**File List:**
- `backend/middleware/inputValidationMiddleware.js`
- `backend/services/sqlInjectionPreventionService.js`

---

### Feature F049: Security - Secrets Management
**ID:** F049  
**Title:** Security - Secrets Management  
**Description:** All API keys, tokens, and secrets stored securely in environment variables. No hardcoded secrets in code.  
**Inputs:** 
- Secret values

**Outputs:** 
- Secure secret storage

**Artifact Filenames:**
- `backend/config/secrets.js`
- `.env.example`

**Dependencies:** None (security infrastructure)

**File List:**
- `backend/config/secrets.js`
- `.env.example`

---

### Feature F050: GDPR Compliance - Consent Storage
**ID:** F050  
**Title:** GDPR Compliance - Consent Storage  
**Description:** Explicit user consent stored for GDPR compliance. PII minimization - store only necessary personal data.  
**Inputs:** 
- User consent data
- PII data

**Outputs:** 
- Consent record stored
- Minimized PII stored

**Artifact Filenames:**
- `database/migrations/006_create_consent_table.sql`
- `backend/services/consentService.js`

**Dependencies:** F007

**File List:**
- `database/migrations/006_create_consent_table.sql`
- `backend/services/consentService.js`

---

### Feature F051: Data Backup System
**ID:** F051  
**Title:** Data Backup System  
**Description:** Daily backups of database and critical files. Monthly backups for long-term storage. Backups stored off main server (cloud storage).  
**Inputs:** 
- Database data
- Critical files

**Outputs:** 
- Daily backup
- Monthly backup

**Artifact Filenames:**
- `backend/scripts/backup.js`
- `backend/services/backupService.js`

**Dependencies:** F047

**File List:**
- `backend/scripts/backup.js`
- `backend/services/backupService.js`

---

### Feature F052: Health Check Endpoint
**ID:** F052  
**Title:** Health Check Endpoint  
**Description:** Provides health check endpoint for monitoring and deployment verification. Returns system status.  
**Inputs:** 
- Health check request

**Outputs:** 
- System health status

**Artifact Filenames:**
- `backend/routes/health.js`
- `backend/controllers/healthController.js`

**Dependencies:** None (infrastructure)

**File List:**
- `backend/routes/health.js`
- `backend/controllers/healthController.js`

---

### Feature F053: Company Isolation Constraint
**ID:** F053  
**Title:** Company Isolation Constraint  
**Description:** Companies cannot contact other companies directly. This is a system-wide constraint that prevents cross-company communication and data access. All company data is isolated within each company's scope.  
**Inputs:** 
- Company ID
- Request to access another company's data

**Outputs:** 
- Access denied (if attempting cross-company access)
- Isolation enforced

**Artifact Filenames:**
- `backend/middleware/companyIsolationMiddleware.js`
- `backend/services/companyIsolationService.js`

**Dependencies:** None (security constraint)

**File List:**
- `backend/middleware/companyIsolationMiddleware.js`
- `backend/services/companyIsolationService.js`

---

## UI/UX Requirements Note

**UI/UX Design Phase:** Detailed UI/UX requirements, page structures, navigation flows, and design system specifications are documented in `docs/ui_ux_requirements.md`. 

All UI components (authentication pages, navigation system, dashboard pages, request management pages, multi-step forms, notifications, approval modals, filters/search, hierarchy views, theme system, accessibility controls) will be designed during the **UI-UX-Design-Template.md** phase.

The current requirements focus on functional features. UI components will be implemented using:
- **Tailwind CSS** utility classes only (no standalone CSS/SCSS files)
- **React** components
- **Design System** as specified in `docs/ui_ux_requirements.md`
- **RBAC** enforcement in all UI components
- **Responsive design** (mobile-first approach)

---

## Non-Functional Requirements

### Performance
- Profile loading: < 2 seconds
- Company registration: < 5 seconds (including basic profile creation)
- Course assignment / Skill verification: < 3-4 seconds
- Support 200-500 concurrent users

### Availability
- ~99% uptime (MVP level)
- Error handling with clear error messages for critical operations

### Data Retention
- Employee profiles & company data: 5 years or until deletion requested
- Activity logs & audit logs: 12 months
- Daily backups
- Monthly long-term backups
- RTO: 24 hours

### Security
- RBAC (Role-Based Access Control)
- Input validation
- SQL injection prevention
- Secrets management
- GDPR compliance (consent storage, PII minimization)
- Admin action logging

### Scalability
- MVP: 10 companies, 5-20 employees each
- Designed to scale to more companies and employees post-MVP

---

## Technology Stack

- **Frontend:** React + Tailwind CSS → Vercel
- **Backend:** Node.js + Express → Railway
- **Database:** PostgreSQL → Supabase
- **CI/CD:** GitHub Actions
- **Language:** JavaScript (ES6) only - no TypeScript

---

## External Integrations

- Auth Service
- Skills Engine
- Assessment
- HR & Management Reporting
- Content Studio
- Course Builder
- Marketplace
- Learning Analytics
- Learner AI
- Mail API / SendPulse API
- LinkedIn API
- GitHub API
- YouTube Data API
- ORCID API
- Crossref API
- Credly API
- Gemini API
