# Directory Microservice - Requirements Document

## Project Overview

**Project Name:** Directory  
**Purpose:** Central hub within the EduCore system for finding, managing, and interacting with entities (trainers, courses, internal resources) across multiple microservices.  
**Scale:** MVP - 10 companies, 5-20 employees each (~200-500 concurrent users)  
**Platforms:** Desktop, tablet, and mobile web browsers (responsive design)

---

## User Hierarchy & Roles

### 1. Admin / Directory Manager
- **Description:** Super admin of the entire system, not belonging to a specific company
- **Permissions:** 
  - View all companies, employees, departments, and teams across all companies
  - Full permissions on entire system
  - Access dedicated dashboard with aggregated reports
  - View system-level logs and critical requests
  - Manage Directory-level system configurations

### 2. Primary HR / Company Registrar
- **Description:** Employee who registers the company in the system
- **Permissions:**
  - Register company (REGISTER YOUR COMPANY)
  - View company profile: all employees, departments, and teams in the company
  - Manage employee profiles, departments, teams
  - View Analytics via Learning Analytics microservice
  - View Learning paths via Learner AI microservice
  - Approve profile changes, verify info, update employee/company details
  - Set allowed assessment retakes
  - Set number of exercises in courses (default: 4)
  - Set verification grade for skills
  - Set if trainer employee can public publish content
  - Manage company Learning Path approval policy (manual/auto)
  - Update or reassign Decision Makers for Learning Path approval
- **Type:** Can be Regular or Trainer employee

### 3. Department Manager / מנהל מחלקה
- **Description:** Employee who manages a department
- **Permissions:**
  - View profiles of all employees in teams within their department
- **Type:** Can be Regular or Trainer employee

### 4. Team Manager / מנהל צוות
- **Description:** Employee who manages a team
- **Permissions:**
  - View profiles of employees in their team only
- **Type:** Can be Regular or Trainer employee

### 5. Employees
- **Types:**
  - **Regular:** Regular employee who learns in the system
  - **Trainer (internal/external):** Employee who both learns and can teach or upload content
- **Permissions:**
  - View own profile
  - Edit allowed fields (sensitive fields require HR + Admin approval)
  - View missing skills and request self-learning
  - View completed courses (only passed courses)
  - Verify skills (one-time skill verification test)
  - View learning path
  - Access Dashboard (redirects to Learning Analytics)
  - View full skills details via Skills Engine

---

## Feature Breakdown (Smallest Independent Features)

### Feature F001: Company Registration Form
- **ID:** F001
- **Title:** Company Registration Form
- **Description:** HR fills out company registration form including company details, employee list, roles, and approval settings
- **Inputs:** 
  - Company name, industry
  - Departments and teams structure
  - Full employee list with names, emails, roles (regular/internal instructor/external instructor)
  - Career paths for employees
  - Single Decision Maker for Learning Path approval (optional if auto-approval)
  - Learning Path approval policy (Manual/Auto-Approval)
  - Primary KPI(s) for the company
- **Outputs:** 
  - Company registration request data
  - Validation status
- **Artifact Filenames:** 
  - `frontend/src/components/CompanyRegistration/CompanyRegistrationForm.js`
  - `frontend/src/components/CompanyRegistration/EmployeeListForm.js`
  - `backend/routes/companyRegistration.js`
  - `backend/controllers/companyRegistrationController.js`
  - `backend/validators/companyRegistrationValidator.js`
- **Dependencies:** None
- **File List:**
  - `frontend/src/components/CompanyRegistration/CompanyRegistrationForm.js`
  - `frontend/src/components/CompanyRegistration/EmployeeListForm.js`
  - `frontend/src/components/CompanyRegistration/DepartmentTeamForm.js`
  - `frontend/src/pages/RegisterCompany.js`
  - `backend/routes/companyRegistration.js`
  - `backend/controllers/companyRegistrationController.js`
  - `backend/validators/companyRegistrationValidator.js`
  - `backend/services/companyRegistrationService.js`
  - `database/migrations/001_create_companies_table.sql`
  - `database/migrations/002_create_departments_table.sql`
  - `database/migrations/003_create_teams_table.sql`

### Feature F002: Company Legitimacy Verification
- **ID:** F002
- **Title:** Company Legitimacy Verification
- **Description:** Directory verifies company registration request legitimacy
- **Inputs:** Company registration request data
- **Outputs:** 
  - Verification status (valid/invalid)
  - Rejection reason (if invalid)
  - Email notification to HR (if invalid)
- **Artifact Filenames:**
  - `backend/services/companyVerificationService.js`
  - `backend/services/emailService.js`
- **Dependencies:** F001
- **File List:**
  - `backend/services/companyVerificationService.js`
  - `backend/services/emailService.js`
  - `backend/utils/emailTemplates.js`

### Feature F003: Employee Registration Check
- **ID:** F003
- **Title:** Employee Registration Check with Auth Service
- **Description:** Directory checks with Auth Service if all employees are registered
- **Inputs:** Employee list from company registration
- **Outputs:** 
  - List of registered employees
  - List of unregistered employees
  - In-app notifications to HR via SendPulse for unregistered employees
- **Artifact Filenames:**
  - `backend/services/authIntegrationService.js`
  - `backend/services/notificationService.js`
- **Dependencies:** F001
- **File List:**
  - `backend/services/authIntegrationService.js`
  - `backend/services/notificationService.js`
  - `backend/config/externalApis.js`

### Feature F004: Company Account Creation
- **ID:** F004
- **Title:** Company Account and Organizational Structure Creation
- **Description:** Directory creates company account and organizational structure after verification
- **Inputs:** Verified company registration data
- **Outputs:** 
  - Company account in database
  - Departments and teams structure
  - Employee base records
- **Artifact Filenames:**
  - `backend/services/companyCreationService.js`
- **Dependencies:** F001, F002
- **File List:**
  - `backend/services/companyCreationService.js`
  - `database/migrations/001_create_companies_table.sql`
  - `database/migrations/002_create_departments_table.sql`
  - `database/migrations/003_create_teams_table.sql`
  - `database/migrations/004_create_employees_table.sql`

### Feature F005: External Data Collection
- **ID:** F005
- **Title:** External Data Collection for Employee Profiles
- **Description:** Collect employee data from external APIs (LinkedIn, GitHub, Credly, YouTube, ORCID, Crossref)
- **Inputs:** 
  - Employee names and emails
  - Direct links to external sources (provided by HR during registration)
- **Outputs:** 
  - Raw employee data from external sources
  - Collected data stored temporarily
- **Artifact Filenames:**
  - `backend/services/externalDataCollectionService.js`
  - `backend/services/linkedInService.js`
  - `backend/services/githubService.js`
  - `backend/services/credlyService.js`
  - `backend/services/youtubeService.js`
  - `backend/services/orcidService.js`
  - `backend/services/crossrefService.js`
- **Dependencies:** F004
- **File List:**
  - `backend/services/externalDataCollectionService.js`
  - `backend/services/linkedInService.js`
  - `backend/services/githubService.js`
  - `backend/services/credlyService.js`
  - `backend/services/youtubeService.js`
  - `backend/services/orcidService.js`
  - `backend/services/crossrefService.js`
  - `backend/config/externalApis.js`

### Feature F006: AI-Enhanced Profile Enrichment
- **ID:** F006
- **Title:** AI-Enhanced Profile Enrichment via Gemini
- **Description:** Process collected raw data through Gemini AI to generate bio and project summaries
- **Inputs:** Raw employee data from external sources
- **Outputs:** 
  - AI-generated short professional bio
  - Project titles and AI-generated summaries
- **Artifact Filenames:**
  - `backend/services/geminiAIService.js`
  - `backend/services/profileEnrichmentService.js`
- **Dependencies:** F005
- **File List:**
  - `backend/services/geminiAIService.js`
  - `backend/services/profileEnrichmentService.js`
  - `backend/config/geminiConfig.js`

### Feature F007: Skills Normalization Integration
- **ID:** F007
- **Title:** Skills Normalization via Skills Engine
- **Description:** Send raw employee data to Skills Engine for normalization into structured competencies
- **Inputs:** 
  - Raw employee data
  - Employee type (trainer or regular)
- **Outputs:** 
  - Normalized skills as structured competencies (non-verified yet)
  - Skills data stored in employee profile
- **Artifact Filenames:**
  - `backend/services/skillsEngineIntegrationService.js`
- **Dependencies:** F005
- **File List:**
  - `backend/services/skillsEngineIntegrationService.js`
  - `backend/config/microservices.js`

### Feature F008: Employee Profile Creation
- **ID:** F008
- **Title:** Employee Profile Creation and Storage
- **Description:** Create full employee profile with enriched data, normalized skills, bio, and projects
- **Inputs:** 
  - Company registration data
  - Enriched data from AI
  - Normalized skills from Skills Engine
- **Outputs:** 
  - Complete employee profile in database
  - Profile includes: bio, projects, normalized skills, role, type, department, team
- **Artifact Filenames:**
  - `backend/services/employeeProfileService.js`
  - `frontend/src/components/EmployeeProfile/EmployeeProfileView.js`
- **Dependencies:** F004, F006, F007
- **File List:**
  - `backend/services/employeeProfileService.js`
  - `backend/controllers/employeeProfileController.js`
  - `frontend/src/components/EmployeeProfile/EmployeeProfileView.js`
  - `frontend/src/components/EmployeeProfile/EmployeeCard.js`
  - `frontend/src/pages/EmployeeProfile.js`
  - `database/migrations/004_create_employees_table.sql`
  - `database/migrations/005_create_employee_projects_table.sql`

### Feature F009: HR Profile Approval Workflow
- **ID:** F009
- **Title:** HR Profile Approval and Verification
- **Description:** HR reviews and approves employee profiles, confirms experience and information
- **Inputs:** Employee profile data awaiting approval
- **Outputs:** 
  - Approved employee profile
  - Profile status updated to "approved"
- **Artifact Filenames:**
  - `frontend/src/components/HR/ProfileApprovalPanel.js`
  - `backend/routes/hrRoutes.js`
- **Dependencies:** F008
- **File List:**
  - `frontend/src/components/HR/ProfileApprovalPanel.js`
  - `frontend/src/pages/HRDashboard.js`
  - `backend/routes/hrRoutes.js`
  - `backend/controllers/hrController.js`
  - `backend/services/profileApprovalService.js`

### Feature F010: Employee Card Generation
- **ID:** F010
- **Title:** Employee Card Generation with Value Proposition
- **Description:** Generate employee card with normalized skills, bio, value proposition, and relevance scoring
- **Inputs:** 
  - Approved employee profile
  - Normalized skills from Skills Engine
  - Career plans
- **Outputs:** 
  - Employee card with:
    - Normalized skills into competencies
    - Short bio (AI-generated)
    - Value proposition (career plans with required skills)
    - Relevance scoring (numeric: required skills - current verified skills)
- **Artifact Filenames:**
  - `frontend/src/components/EmployeeProfile/EmployeeCard.js`
  - `backend/services/employeeCardService.js`
- **Dependencies:** F008, F009, F007
- **File List:**
  - `frontend/src/components/EmployeeProfile/EmployeeCard.js`
  - `backend/services/employeeCardService.js`

### Feature F011: Hierarchical Profile Visibility
- **ID:** F011
- **Title:** Hierarchical Profile Visibility Control
- **Description:** Implement role-based profile visibility following company hierarchy
- **Inputs:** 
  - User role and hierarchy level
  - Employee profile data
- **Outputs:** 
  - Filtered profile list based on user's viewing permissions
  - Admin sees all, Primary HR sees company, Department Manager sees department, Team Manager sees team, Employee sees own
- **Artifact Filenames:**
  - `backend/middleware/rbacMiddleware.js`
  - `backend/services/profileVisibilityService.js`
- **Dependencies:** F008
- **File List:**
  - `backend/middleware/rbacMiddleware.js`
  - `backend/services/profileVisibilityService.js`
  - `frontend/src/components/ProfileList/ProfileListView.js`
  - `frontend/src/utils/permissions.js`

### Feature F012: Employee Profile View and Edit
- **ID:** F012
- **Title:** Employee Profile View and Edit
- **Description:** Employees can view and edit their own profile with field-level permissions
- **Inputs:** 
  - Employee ID
  - Field updates (for editable fields)
- **Outputs:** 
  - Employee profile display
  - Updated profile (for allowed fields)
  - Approval request (for sensitive fields)
- **Artifact Filenames:**
  - `frontend/src/components/EmployeeProfile/ProfileEditForm.js`
  - `backend/routes/employeeRoutes.js`
- **Dependencies:** F008, F011
- **File List:**
  - `frontend/src/components/EmployeeProfile/ProfileEditForm.js`
  - `frontend/src/components/EmployeeProfile/FieldEditModal.js`
  - `backend/routes/employeeRoutes.js`
  - `backend/controllers/employeeController.js`
  - `backend/services/profileEditService.js`
  - `backend/validators/profileEditValidator.js`

### Feature F013: Preferred Language Management
- **ID:** F013
- **Title:** Employee Preferred Language Management
- **Description:** Employees can set/update preferred language (default: Hebrew), syncs with Course Builder
- **Inputs:** 
  - Employee ID
  - Preferred language selection
- **Outputs:** 
  - Updated preferred language in profile
  - Language sent to Course Builder (one-way sync)
- **Artifact Filenames:**
  - `frontend/src/components/EmployeeProfile/LanguageSelector.js`
  - `backend/services/courseBuilderIntegrationService.js`
- **Dependencies:** F008, F012
- **File List:**
  - `frontend/src/components/EmployeeProfile/LanguageSelector.js`
  - `backend/services/courseBuilderIntegrationService.js`
  - `database/migrations/004_create_employees_table.sql` (add preferred_language column)

### Feature F014: Skill Verification Request
- **ID:** F014
- **Title:** Skill Verification Request (One-Time)
- **Description:** Employee clicks "Verify Your Skills" button to initiate skill verification via Skills Engine
- **Inputs:** 
  - Employee ID
  - Selected skills to verify (optional, or all skills)
- **Outputs:** 
  - Verification request sent to Skills Engine
  - "Verify Your Skills" button hidden after first use
  - Assessment request created
- **Artifact Filenames:**
  - `frontend/src/components/EmployeeProfile/VerifySkillsButton.js`
  - `backend/routes/skillVerificationRoutes.js`
- **Dependencies:** F008, F007
- **File List:**
  - `frontend/src/components/EmployeeProfile/VerifySkillsButton.js`
  - `backend/routes/skillVerificationRoutes.js`
  - `backend/controllers/skillVerificationController.js`
  - `backend/services/skillVerificationService.js`

### Feature F015: Verified Skills Update
- **ID:** F015
- **Title:** Verified Skills Update from Skills Engine
- **Description:** Receive verified skills list and updated relevance scores from Skills Engine after assessment
- **Inputs:** 
  - Verified skills list from Skills Engine
  - Updated relevance scores
- **Outputs:** 
  - Employee profile updated with verified skills
  - Relevance scores updated
  - "More" button available to redirect to Skills Engine frontend
- **Artifact Filenames:**
  - `backend/routes/skillsEngineWebhookRoutes.js`
  - `backend/services/verifiedSkillsUpdateService.js`
- **Dependencies:** F014, F007
- **File List:**
  - `backend/routes/skillsEngineWebhookRoutes.js`
  - `backend/controllers/skillsEngineWebhookController.js`
  - `backend/services/verifiedSkillsUpdateService.js`
  - `frontend/src/components/EmployeeProfile/VerifiedSkillsDisplay.js`
  - `frontend/src/components/EmployeeProfile/SkillsEngineLink.js`

### Feature F016: Completed Courses Display
- **ID:** F016
- **Title:** Completed Courses Display
- **Description:** Display only passed courses in employee profile with course name and feedback
- **Inputs:** 
  - Course completion data from Course Builder
  - Exam results from Assessment (via Skills Engine)
- **Outputs:** 
  - List of completed courses (only passed)
  - Course name, feedback, test attempts displayed
- **Artifact Filenames:**
  - `frontend/src/components/EmployeeProfile/CompletedCoursesList.js`
  - `backend/services/courseCompletionService.js`
- **Dependencies:** F008
- **File List:**
  - `frontend/src/components/EmployeeProfile/CompletedCoursesList.js`
  - `backend/services/courseCompletionService.js`
  - `database/migrations/006_create_completed_courses_table.sql`

### Feature F017: Course Builder Feedback Integration
- **ID:** F017
- **Title:** Course Builder Feedback Integration
- **Description:** Receive and store course feedback from Course Builder for completed courses
- **Inputs:** 
  - Feedback data: feedback, course_id, course_name, learner_id
- **Outputs:** 
  - Employee profile updated with course feedback
  - Feedback displayed in completed courses list
- **Artifact Filenames:**
  - `backend/routes/courseBuilderWebhookRoutes.js`
  - `backend/services/courseFeedbackService.js`
- **Dependencies:** F016
- **File List:**
  - `backend/routes/courseBuilderWebhookRoutes.js`
  - `backend/controllers/courseBuilderWebhookController.js`
  - `backend/services/courseFeedbackService.js`

### Feature F018: Post-Course Skills Update
- **ID:** F018
- **Title:** Post-Course Skills Update from Skills Engine
- **Description:** Receive updated skills (verified and new) and relevance scores from Skills Engine after course completion
- **Inputs:** 
  - Updated skills data from Skills Engine
  - Newly verified skills (if any)
  - New skills added during learning
  - Updated relevance scores
- **Outputs:** 
  - Employee profile updated with new skills
  - Relevance scores updated
- **Artifact Filenames:**
  - `backend/services/postCourseSkillsUpdateService.js`
- **Dependencies:** F015, F016
- **File List:**
  - `backend/services/postCourseSkillsUpdateService.js`

### Feature F019: Extra Exam Attempt Request
- **ID:** F019
- **Title:** Extra Exam Attempt Request Workflow
- **Description:** Employee requests additional exam attempts beyond company-defined maximum, requires HR approval
- **Inputs:** 
  - Employee ID
  - Course ID
  - Current attempt count
- **Outputs:** 
  - "Request More Attempts" button (when max attempts reached)
  - Extra attempt request created
  - Request routed to HR for approval
- **Artifact Filenames:**
  - `frontend/src/components/EmployeeProfile/ExtraAttemptRequestButton.js`
  - `backend/routes/extraAttemptRoutes.js`
- **Dependencies:** F016
- **File List:**
  - `frontend/src/components/EmployeeProfile/ExtraAttemptRequestButton.js`
  - `frontend/src/components/HR/ExtraAttemptApprovalPanel.js`
  - `backend/routes/extraAttemptRoutes.js`
  - `backend/controllers/extraAttemptController.js`
  - `backend/services/extraAttemptService.js`
  - `database/migrations/007_create_extra_attempt_requests_table.sql`

### Feature F020: HR Extra Attempt Approval
- **ID:** F020
- **Title:** HR Extra Attempt Approval
- **Description:** HR reviews and approves/rejects extra attempt requests, Directory sends approval to Course Builder
- **Inputs:** 
  - Extra attempt request ID
  - Approval decision (approve/reject)
- **Outputs:** 
  - Request status updated
  - Approval notification sent to Course Builder (if approved)
  - Course Builder enables additional attempt in Assessment
- **Artifact Filenames:**
  - `frontend/src/components/HR/ExtraAttemptApprovalPanel.js`
  - `backend/services/courseBuilderIntegrationService.js`
- **Dependencies:** F019
- **File List:**
  - `frontend/src/components/HR/ExtraAttemptApprovalPanel.js`
  - `backend/services/courseBuilderIntegrationService.js`

### Feature F021: Fully Personalized Training Request
- **ID:** F021
- **Title:** Fully Personalized Training Request (Career Path Driven)
- **Description:** HR submits training requests aligned with employee career paths, Directory finds qualified instructors
- **Inputs:** 
  - Employee ID
  - Career path data
  - Missing skills from Value Proposition
- **Outputs:** 
  - Training request created
  - Qualified instructors found via Marketplace
  - Invitation sent to instructor (status → Invited)
- **Artifact Filenames:**
  - `frontend/src/components/HR/PersonalizedTrainingRequestForm.js`
  - `backend/services/marketplaceIntegrationService.js`
- **Dependencies:** F008, F010
- **File List:**
  - `frontend/src/components/HR/PersonalizedTrainingRequestForm.js`
  - `backend/routes/trainingRequestRoutes.js`
  - `backend/controllers/trainingRequestController.js`
  - `backend/services/personalizedTrainingService.js`
  - `backend/services/marketplaceIntegrationService.js`
  - `database/migrations/008_create_training_requests_table.sql`

### Feature F022: Group/Department Training Request
- **ID:** F022
- **Title:** Group/Department Training Request (Skill-Driven)
- **Description:** HR requests specific skills for employees/groups, Directory checks skill gaps and finds instructors
- **Inputs:** 
  - Employee/group selection
  - Required skills
- **Outputs:** 
  - Training request created
  - Skill gap analysis
  - Qualified instructors found (if skills missing)
  - HR decision prompt (if skills already acquired)
- **Artifact Filenames:**
  - `frontend/src/components/HR/GroupTrainingRequestForm.js`
  - `backend/services/skillGapAnalysisService.js`
- **Dependencies:** F008, F007
- **File List:**
  - `frontend/src/components/HR/GroupTrainingRequestForm.js`
  - `backend/services/skillGapAnalysisService.js`
  - `backend/services/marketplaceIntegrationService.js`

### Feature F023: Specific Instructor Training Request
- **ID:** F023
- **Title:** Specific Instructor Training Request
- **Description:** HR requests a particular instructor, Directory checks if employee lacks instructor's skills
- **Inputs:** 
  - Employee ID
  - Instructor ID
- **Outputs:** 
  - Training request created
  - Skill gap check (instructor's skills vs employee's skills)
  - HR decision prompt (if skills already acquired)
  - Invitation sent to instructor
- **Artifact Filenames:**
  - `frontend/src/components/HR/InstructorTrainingRequestForm.js`
  - `backend/services/instructorTrainingService.js`
- **Dependencies:** F008
- **File List:**
  - `frontend/src/components/HR/InstructorTrainingRequestForm.js`
  - `backend/services/instructorTrainingService.js`
  - `backend/services/marketplaceIntegrationService.js`

### Feature F024: Marketplace Fallback Course Creation
- **ID:** F024
- **Title:** Marketplace Fallback Course Creation
- **Description:** If no trainer found, Marketplace creates course on the fly, Directory notifies Content Studio
- **Inputs:** 
  - Training request with no matching instructor
- **Outputs:** 
  - Course created in Marketplace
  - Employee redirected to Course Builder
  - Directory notifies Content Studio for AI/manual content creation
- **Artifact Filenames:**
  - `backend/services/marketplaceIntegrationService.js`
  - `backend/services/contentStudioIntegrationService.js`
- **Dependencies:** F021, F022, F023
- **File List:**
  - `backend/services/marketplaceIntegrationService.js`
  - `backend/services/contentStudioIntegrationService.js`

### Feature F025: Instructor Invitation and Status Management
- **ID:** F025
- **Title:** Instructor Invitation and Status Management
- **Description:** Send training invitations via Mail API, manage instructor status (Invited → Active → Archived)
- **Inputs:** 
  - Instructor ID
  - Training request details
- **Outputs:** 
  - Email invitation sent
  - Instructor status updated to "Invited"
  - Status updates: Active (after Content Studio assignment), Archived (after completion or HR disapproval)
- **Artifact Filenames:**
  - `backend/services/instructorStatusService.js`
  - `backend/services/emailService.js`
- **Dependencies:** F021, F022, F023
- **File List:**
  - `backend/services/instructorStatusService.js`
  - `backend/services/emailService.js`
  - `database/migrations/009_create_instructor_status_table.sql`

### Feature F026: Content Studio Integration
- **ID:** F026
- **Title:** Content Studio Integration for Trainer Data
- **Description:** Send trainer data to Content Studio, receive course completion updates
- **Inputs:** 
  - Trainer ID, trainer name, company ID
  - AIEnabled field (true/false)
  - can_publish_externally (true/false)
  - Company-defined exercises limit (default: 4)
- **Outputs:** 
  - Trainer data sent to Content Studio
  - Course completion updates received (course_id, course_name, trainer_id, trainer_name, status)
  - Employee and trainer profiles updated
- **Artifact Filenames:**
  - `backend/services/contentStudioIntegrationService.js`
  - `backend/routes/contentStudioWebhookRoutes.js`
- **Dependencies:** F025
- **File List:**
  - `backend/services/contentStudioIntegrationService.js`
  - `backend/routes/contentStudioWebhookRoutes.js`
  - `backend/controllers/contentStudioWebhookController.js`

### Feature F027: Instructor Profile Management
- **ID:** F027
- **Title:** Instructor Profile Management
- **Description:** Manage instructor-specific fields: status, AI Enable, Public Publish Enable
- **Inputs:** 
  - Instructor ID
  - Status updates
  - AI Enable toggle
  - Public Publish Enable toggle
- **Outputs:** 
  - Instructor profile updated
  - Courses taught list updated
- **Artifact Filenames:**
  - `frontend/src/components/Instructor/InstructorProfileView.js`
  - `backend/services/instructorProfileService.js`
- **Dependencies:** F008, F025
- **File List:**
  - `frontend/src/components/Instructor/InstructorProfileView.js`
  - `frontend/src/components/Instructor/InstructorSettings.js`
  - `backend/routes/instructorRoutes.js`
  - `backend/controllers/instructorController.js`
  - `backend/services/instructorProfileService.js`

### Feature F028: Proactive Teaching Request
- **ID:** F028
- **Title:** Proactive Teaching Request by Instructor
- **Description:** Instructors can proactively choose to teach a skill and send teaching requests
- **Inputs:** 
  - Instructor ID
  - Skill to teach
  - Teaching request details
- **Outputs:** 
  - Teaching request created
  - Request visible to HR/company
- **Artifact Filenames:**
  - `frontend/src/components/Instructor/TeachingRequestForm.js`
  - `backend/routes/teachingRequestRoutes.js`
- **Dependencies:** F027
- **File List:**
  - `frontend/src/components/Instructor/TeachingRequestForm.js`
  - `backend/routes/teachingRequestRoutes.js`
  - `backend/controllers/teachingRequestController.js`
  - `backend/services/teachingRequestService.js`
  - `database/migrations/010_create_teaching_requests_table.sql`

### Feature F029: Learning Path Approval Policy Management
- **ID:** F029
- **Title:** Learning Path Approval Policy Management
- **Description:** HR sets company Learning Path approval policy (Manual/Auto-Approval) and Decision Makers list
- **Inputs:** 
  - Company ID
  - Approval policy (Manual/Auto)
  - Decision Maker employee ID (single approver per company)
- **Outputs:** 
  - Approval policy updated in Directory
  - Policy and approvers list sent to Learner AI (one-way)
  - Policy change logged
- **Artifact Filenames:**
  - `frontend/src/components/HR/LearningPathPolicySettings.js`
  - `backend/services/learnerAIIntegrationService.js`
- **Dependencies:** F004
- **File List:**
  - `frontend/src/components/HR/LearningPathPolicySettings.js`
  - `backend/routes/learningPathPolicyRoutes.js`
  - `backend/controllers/learningPathPolicyController.js`
  - `backend/services/learningPathPolicyService.js`
  - `backend/services/learnerAIIntegrationService.js`
  - `database/migrations/011_create_learning_path_policies_table.sql`

### Feature F030: Learning Path Approval Check
- **ID:** F030
- **Title:** Learning Path Approval Check
- **Description:** Directory checks company approval policy when Learning Path is generated, redirects to Learner AI for approval
- **Inputs:** 
  - Company ID
  - Learning Path request from Learner AI
- **Outputs:** 
  - Approval policy checked
  - If Auto-Approval: Learning Path approved immediately
  - If Manual: Decision Maker notified, redirected to Learner AI for review
- **Artifact Filenames:**
  - `backend/services/learningPathApprovalService.js`
  - `frontend/src/components/DecisionMaker/PendingApprovalsList.js`
- **Dependencies:** F029
- **File List:**
  - `backend/services/learningPathApprovalService.js`
  - `frontend/src/components/DecisionMaker/PendingApprovalsList.js`
  - `frontend/src/pages/DecisionMakerDashboard.js`
  - `backend/routes/learningPathApprovalRoutes.js`

### Feature F031: Dashboard Redirect to Learning Analytics
- **ID:** F031
- **Title:** Dashboard Redirect to Learning Analytics
- **Description:** Employee profile includes "Dashboard" button that redirects to Learning Analytics microservice
- **Inputs:** 
  - Employee ID
  - Employee role and access level
- **Outputs:** 
  - Redirect to Learning Analytics microservice
  - Learning Analytics determines appropriate dashboard view based on role
- **Artifact Filenames:**
  - `frontend/src/components/EmployeeProfile/DashboardButton.js`
  - `backend/services/learningAnalyticsIntegrationService.js`
- **Dependencies:** F008
- **File List:**
  - `frontend/src/components/EmployeeProfile/DashboardButton.js`
  - `backend/services/learningAnalyticsIntegrationService.js`

### Feature F032: Learning Path Display
- **ID:** F032
- **Title:** Learning Path Display in Profile
- **Description:** Employees can view their approved learning path, companies can view learning paths of their employees
- **Inputs:** 
  - Employee ID (for employee view)
  - Company ID (for company view)
- **Outputs:** 
  - Learning path displayed in profile
  - "Learning Path" button redirects to Learner AI
- **Artifact Filenames:**
  - `frontend/src/components/EmployeeProfile/LearningPathButton.js`
  - `backend/services/learnerAIIntegrationService.js`
- **Dependencies:** F008, F030
- **File List:**
  - `frontend/src/components/EmployeeProfile/LearningPathButton.js`
  - `backend/services/learnerAIIntegrationService.js`

### Feature F033: HR Analytics Access
- **ID:** F033
- **Title:** HR Analytics Access via Learning Analytics
- **Description:** HR can view Analytics via Learning Analytics microservice
- **Inputs:** 
  - HR user ID
  - Company ID
- **Outputs:** 
  - Redirect to Learning Analytics with company context
  - Analytics dashboard displayed
- **Artifact Filenames:**
  - `frontend/src/components/HR/AnalyticsButton.js`
  - `backend/services/learningAnalyticsIntegrationService.js`
- **Dependencies:** F008
- **File List:**
  - `frontend/src/components/HR/AnalyticsButton.js`
  - `backend/services/learningAnalyticsIntegrationService.js`

### Feature F034: HR Company Settings Management
- **ID:** F034
- **Title:** HR Company Settings Management
- **Description:** HR manages company-level settings: exercises limit, verification grade, trainer publish permissions
- **Inputs:** 
  - Company ID
  - Exercises limit (default: 4)
  - Verification grade for skills
  - Trainer public publish permission
- **Outputs:** 
  - Company settings updated
  - Settings sent to Content Studio and Assessment
- **Artifact Filenames:**
  - `frontend/src/components/HR/CompanySettingsPanel.js`
  - `backend/services/companySettingsService.js`
- **Dependencies:** F004
- **File List:**
  - `frontend/src/components/HR/CompanySettingsPanel.js`
  - `backend/routes/companySettingsRoutes.js`
  - `backend/controllers/companySettingsController.js`
  - `backend/services/companySettingsService.js`
  - `database/migrations/012_create_company_settings_table.sql`

### Feature F035: Directory Super Admin Dashboard
- **ID:** F035
- **Title:** Directory Super Admin Dashboard
- **Description:** Super Admin accesses dedicated dashboard with aggregated reports from HR & Management Reporting
- **Inputs:** 
  - Admin credentials
- **Outputs:** 
  - Dashboard with aggregated reports and analytics
  - View all registered companies and employee profiles
  - Access logs of critical requests
  - System-level configurations (read-only for company data)
- **Artifact Filenames:**
  - `frontend/src/pages/AdminDashboard.js`
  - `backend/services/adminDashboardService.js`
- **Dependencies:** None (Admin is separate from company hierarchy)
- **File List:**
  - `frontend/src/pages/AdminDashboard.js`
  - `frontend/src/components/Admin/AdminDashboardView.js`
  - `frontend/src/components/Admin/CompanyListView.js`
  - `frontend/src/components/Admin/SystemLogsView.js`
  - `backend/routes/adminRoutes.js`
  - `backend/controllers/adminController.js`
  - `backend/services/adminDashboardService.js`
  - `backend/services/managementReportingIntegrationService.js`

### Feature F036: Admin Action Logging
- **ID:** F036
- **Title:** Admin Action Logging
- **Description:** Log all admin actions: profile creation, deletion, updates, approvals, critical requests
- **Inputs:** 
  - Admin user ID
  - Action type
  - Action details
  - Timestamp
- **Outputs:** 
  - Action logged in admin log
  - Logs accessible to Super Admin
- **Artifact Filenames:**
  - `backend/services/adminLoggingService.js`
  - `database/migrations/013_create_admin_logs_table.sql`
- **Dependencies:** None
- **File List:**
  - `backend/services/adminLoggingService.js`
  - `backend/middleware/adminLoggingMiddleware.js`
  - `database/migrations/013_create_admin_logs_table.sql`

### Feature F037: RBAC Implementation
- **ID:** F037
- **Title:** Role-Based Access Control (RBAC) Implementation
- **Description:** Implement RBAC for all user types with proper permission checks
- **Inputs:** 
  - User role
  - Requested action
  - Resource being accessed
- **Outputs:** 
  - Access granted or denied
  - Appropriate error message if denied
- **Artifact Filenames:**
  - `backend/middleware/rbacMiddleware.js`
  - `backend/services/permissionService.js`
- **Dependencies:** None (foundational)
- **File List:**
  - `backend/middleware/rbacMiddleware.js`
  - `backend/services/permissionService.js`
  - `backend/utils/permissionMatrix.js`
  - `database/migrations/014_create_roles_permissions_table.sql`

### Feature F038: PII Minimization and GDPR Compliance
- **ID:** F038
- **Title:** PII Minimization and GDPR Compliance
- **Description:** Store only necessary personal data, implement explicit consent storage (GDPR-ready)
- **Inputs:** 
  - User consent data
  - PII data to be stored
- **Outputs:** 
  - Consent stored
  - PII minimized according to requirements
  - GDPR-compliant data handling
- **Artifact Filenames:**
  - `backend/services/gdprService.js`
  - `database/migrations/015_create_consent_table.sql`
- **Dependencies:** F008
- **File List:**
  - `backend/services/gdprService.js`
  - `backend/middleware/gdprMiddleware.js`
  - `database/migrations/015_create_consent_table.sql`

### Feature F039: Data Retention and Backup System
- **ID:** F039
- **Title:** Data Retention and Backup System
- **Description:** Implement data retention policies (5 years for profiles, 12 months for logs) and automated backup system
- **Inputs:** 
  - Data type
  - Retention policy
- **Outputs:** 
  - Automated daily backups
  - Monthly long-term backups
  - Data retention enforcement
- **Artifact Filenames:**
  - `backend/services/backupService.js`
  - `backend/services/dataRetentionService.js`
- **Dependencies:** None (infrastructure)
- **File List:**
  - `backend/services/backupService.js`
  - `backend/services/dataRetentionService.js`
  - `backend/scripts/backupScript.js`
  - `backend/scripts/retentionScript.js`

### Feature F040: Single Public Entry Endpoint
- **ID:** F040
- **Title:** Single Public Entry Endpoint for External API Requests
- **Description:** Directory exposes one main public endpoint that serves as unified communication gateway for all external API requests
- **Inputs:** 
  - Calling service/client name
  - JSON object describing requested data
- **Outputs:** 
  - Dynamically generated SQL query (AI-assisted)
  - Query results returned
- **Artifact Filenames:**
  - `backend/routes/publicApiRoutes.js`
  - `backend/services/dynamicQueryService.js`
- **Dependencies:** None (core infrastructure)
- **File List:**
  - `backend/routes/publicApiRoutes.js`
  - `backend/controllers/publicApiController.js`
  - `backend/services/dynamicQueryService.js`
  - `backend/services/queryValidationService.js`
  - `backend/services/geminiAIService.js` (for query generation)

### Feature F041: Mock Data Fallback System
- **ID:** F041
- **Title:** Mock Data Fallback System
- **Description:** Implement fallback mechanism to load mock data when external API calls fail
- **Inputs:** 
  - Failed API call
  - API/feature identifier
- **Outputs:** 
  - Mock data loaded from centralized `/mockData/index.json`
  - Mock response returned
- **Artifact Filenames:**
  - `mockData/index.json`
  - `backend/services/mockDataService.js`
- **Dependencies:** None (infrastructure)
- **File List:**
  - `mockData/index.json`
  - `backend/services/mockDataService.js`
  - `backend/middleware/mockDataFallbackMiddleware.js`

### Feature F042: Global URL Configuration
- **ID:** F042
- **Title:** Global URL Configuration Management
- **Description:** Store all external base URLs in global configuration (config.js or .env)
- **Inputs:** 
  - External service URLs
- **Outputs:** 
  - URLs stored in configuration
  - URLs accessible throughout application
- **Artifact Filenames:**
  - `backend/config/externalApis.js`
  - `backend/config/microservices.js`
  - `.env.example`
- **Dependencies:** None (configuration)
- **File List:**
  - `backend/config/externalApis.js`
  - `backend/config/microservices.js`
  - `.env.example`
  - `backend/config/config.js`

---

## Non-Functional Requirements

### Performance
- **Concurrent Users:** Support 200-500 concurrent users
- **Response Times:**
  - Employee profile loading: < 2 seconds
  - Company registration: < 5 seconds (including basic profile creation)
  - Course assignment / Skill verification requests: < 3-4 seconds
- **Availability:** ~99% uptime (MVP level, primarily during business hours)

### Data Retention
- **Employee profiles & company data:** Retain for at least 5 years, or until company requests deletion
- **Activity logs & audit logs:** Retain for at least 12 months
- **Backups:**
  - Daily backups of database and critical files
  - Monthly backups for long-term storage
  - Stored off main server (cloud storage or separate storage)
- **Recovery Time Objective (RTO):** Full data recovery within 24 hours

### Security
- **RBAC:** Role-based access control for all user types
- **Admin Action Logging:** Log all profile creation, deletion, updates, approvals
- **PII Minimization:** Store only necessary personal data
- **GDPR Compliance:** Explicit consent storage
- **Input Validation:** All inputs validated to prevent injection attacks
- **SQL Injection Prevention:** Dynamic queries validated before execution

### Integration Requirements
- **Auth Service:** Employee registration verification
- **Skills Engine:** Skills normalization, verification, relevance scoring
- **Assessment:** Skill verification tests, post-course exams
- **Content Studio:** Trainer data, course completion updates
- **Course Builder:** Course feedback, preferred language sync, extra attempt approvals
- **Marketplace:** Instructor finding, course recommendations, fallback course creation
- **Learning Analytics:** Analytics data and dashboard redirects
- **Learner AI:** Learning Path approval policy and Decision Makers
- **HR & Management Reporting:** Company and employee data, KPIs
- **Contextual Corporate Assistant:** Company and profile data for RAG/Graph recommendations
- **External APIs:** LinkedIn, GitHub, Credly, YouTube, ORCID, Crossref, Gemini AI
- **Notification APIs:** SendPulse (in-app notifications), Mail API/SendGrid (emails)

---

## Technology Stack

- **Frontend:** React + Tailwind CSS → deployed to Vercel
- **Backend:** Node.js + Express → deployed to Railway
- **Database:** PostgreSQL → hosted on Supabase
- **CI/CD:** GitHub Actions
- **Language:** JavaScript (ES6) only — no TypeScript

---

## Deployment Targets

- **Frontend:** Vercel
- **Backend:** Railway
- **Database:** Supabase

