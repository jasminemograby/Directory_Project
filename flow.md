# Directory Microservice - Flow Document

## Overview

This document maps requirements into detailed feature flows, specifying inputs, outputs, and data paths for each feature in the Directory microservice.

---

## Flow 1: Company Registration Flow

**Actors:** HR (Primary HR / Company Registrar), Auth Service, Directory

**Feature IDs:** F001, F002, F003

### Step-by-Step Flow:

1. **HR Registration/Login (Auth Service)**
   - HR signs up or logs in via Auth Service
   - Auth Service returns authentication token

2. **Company Registration Form - Step 1: Basic Registration (F001)**
   - HR opens Directory → Company Registration Form
   - HR fills out basic form:
     - Company name, industry
     - HR/Registrar data (name, email, role)
     - Company domain/email domain for verification
   - **Input:** Basic company and HR data
   - **Output:** Basic registration request JSON

3. **Company Legitimacy Verification - Domain Check (F002)**
   - Directory receives basic registration request
   - Directory verifies company legitimacy by checking company domain
   - Verification method: Check if there is a mail service for the company domain (e.g., verify domain exists and has email service)
   - **If invalid:**
     - Directory sends email to HR via Mail API with reason
     - Flow ends
   - **If valid:**
     - Directory allows company to continue with Step 2 (full setup)
     - **Output:** Verification result, permission to continue

4. **Company Registration Form - Step 2: Full Setup (F001)**
   - After domain verification, HR continues with full company setup
   - HR fills out complete form:
     - Departments and teams structure
     - Full employee list with:
       - Names, emails
       - Current role (e.g., 'QA', 'Backend Developer', 'Designer')
       - Target role (career path target)
       - Employee type: regular employee, internal instructor, external instructor
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
   - **Input:** Complete company setup data
   - **Output:** Full company registration data

5. **Company Account Creation**
   - Directory creates company account
   - Company structure stored in Directory DB
   - **Output:** Company ID, company account created

6. **Employee Registration Check (F003)**
   - Directory checks with Auth Service if all employees are registered
   - For each employee:
     - **If registered:** Associate employee to company
     - **If unregistered:** Send in-app notification to HR via SendPulse API
   - HR prompts unregistered employees to register
   - **Input:** Employee list, Company ID
   - **Output:** Registration status per employee, notifications sent

---

## Flow 2: Employee Profile Creation & Enrichment

**Actors:** HR, External APIs (LinkedIn, GitHub, Credly, YouTube, ORCID, Crossref), Gemini API, Skills Engine, Directory

**Feature IDs:** F004, F005, F006, F007, F007A, F007B

### Step-by-Step Flow:

1. **External Data Collection (F004)**
   - For each employee in registration form (Step 2):
     - Directory uses external data source links provided by HR during registration:
       - LinkedIn API (using LinkedIn profile links provided by HR)
       - GitHub API (using GitHub profile links provided by HR)
       - Credly API (using Credly profile links provided by HR)
       - YouTube Data API (using YouTube channel links provided by HR)
       - ORCID API (using ORCID profile links provided by HR)
       - Crossref API (using Crossref profile links provided by HR)
   - **Input:** Employee names, emails, external source links (from Step 2 registration)
   - **Output:** Raw employee data from all external sources
   - **Fallback:** If any API fails, load mock data from `/mockData/index.json`

2. **AI-Enhanced Profile Enrichment (F005)**
   - Directory processes collected raw data through Gemini API:
     - Generate short professional bio for each employee
     - Identify project names from raw data
     - Generate short AI summaries for each project
   - **Input:** Raw employee data from external sources
   - **Output:** AI-generated bio, project titles, project summaries
   - **Fallback:** If Gemini API fails, use mock bio/projects from `/mockData/index.json`

3. **Skills Engine Integration - Normalization (F006)**
   - Directory sends to Skills Engine:
     - Collected raw data
     - Employee type (trainer or regular)
   - Skills Engine normalizes raw data into structured competencies
   - Skills Engine returns normalized skills (unverified)
   - **Input:** Raw employee data, employee type
   - **Output:** Normalized skills (unverified) as structured competencies
   - **Fallback:** If Skills Engine fails, use mock normalized skills from `/mockData/index.json`

4. **Employee Profile Creation (F007)**
   - Directory creates base profile from:
     - Company form data
     - LinkedIn data
     - Enriched data (bio, projects)
     - Normalized skills from Skills Engine
   - Profile stored in Directory DB (PostgreSQL on Supabase) with status "pending approval"
   - **Input:** All collected and enriched data
   - **Output:** Employee profile record in database (status: pending approval)
   - **Data Path:** Directory DB → Employee table

5. **HR Initial Profile Approval (F007A)**
   - HR reviews employee profile data
   - HR confirms employee experience and information
   - HR approves basic profile
   - Profile status updated to "approved"
   - **Input:** Employee profile data awaiting approval
   - **Output:** Approved employee profile (status: approved)

6. **Employee Card Generation (F007B)**
   - After HR approval, Directory generates complete Employee Card:
     - Normalized skills into competencies (from Skills Engine)
     - Short bio (AI-generated from verified data)
     - Value proposition (career plans with required skills)
     - Relevance scoring (numeric: required skills - current verified skills)
   - **Input:** Approved employee profile, normalized skills, career plans, Skills Engine data
   - **Output:** Complete employee card generated

7. **Profile Data Distribution**
   - Directory sends relevant data to:
     - Contextual Corporate Assistant (F042)
     - HR & Management Reporting (F041)
     - Marketplace (F017)
     - Learning Analytics (F043)

---

## Flow 3: Employee Profile Display & Interaction

**Actors:** Employee, HR, Department Manager, Team Manager, Admin, Directory

**Feature IDs:** F008, F009, F010, F013, F030, F031, F032, F033, F034, F037

### Step-by-Step Flow:

1. **Profile Access (F037 - RBAC)**
   - User requests employee profile
   - Directory checks hierarchical permissions:
     - Admin: Can view all profiles
     - Primary HR: Can view all company profiles
     - Department Manager: Can view profiles in their departments, plus own profile
     - Team Manager: Can view profiles in their team, plus own profile
     - Employee: Can view only own profile
   - **Note:** All users (including managers) can view their own profile like any other Employee
   - **Input:** Viewer employee ID, target employee ID, company hierarchy
   - **Output:** Profile visibility decision (allowed/denied)

2. **Profile Display (F008)**
   - If access allowed, Directory loads profile data:
     - Employee Card (F007B) with:
       - Normalized skills into competencies (from Skills Engine)
       - Short bio (AI-generated from verified data)
       - Value proposition (career plans with required skills)
       - Relevance scoring (numeric: required skills - current verified skills)
     - Projects section (F005)
     - Verified skills (if verified) - from Skills Engine (F012)
     - Completed courses (F044) with test attempts number
     - Learning path button (F031)
     - Dashboard button (F030)
     - Skills "More" button (F013)
   - **Input:** Employee ID, user role
   - **Output:** Rendered employee profile page
   - **Data Path:** Directory DB → Frontend React components

3. **Value Proposition Display (F009)**
   - Directory generates value proposition using:
     - Employee career plan
     - Skills Engine data (required vs current skills)
   - Includes skill gap button that redirects to Skills Engine frontend
   - **Input:** Employee career plan, Skills Engine data
   - **Output:** Value proposition text, skill gap URL

4. **Relevance Score Display (F010)**
   - Directory displays numeric relevance score from Skills Engine
   - Score = (Required skills - Current verified skills)
   - **Input:** Relevance score from Skills Engine
   - **Output:** Displayed relevance score in profile

5. **Skills Engine Frontend Redirect (F013)**
   - Employee clicks "More" button in profile
   - Directory redirects to Skills Engine frontend with employee context
   - **Input:** Employee ID
   - **Output:** Redirect to Skills Engine frontend

6. **Learning Analytics Dashboard Redirect (F030)**
   - Employee clicks "Dashboard" button in profile
   - Directory redirects to Learning Analytics microservice
   - Learning Analytics determines dashboard view based on employee role
   - **Input:** Employee ID, employee role
   - **Output:** Redirect to Learning Analytics

7. **Learning Path Display (F031)**
   - Employee clicks "Learning Path" button
   - Directory displays approved learning path
   - Company can view learning paths of all employees
   - **Input:** Employee ID, Company ID (for company view)
   - **Output:** Learning path displayed

8. **Profile Edit (F032)**
   - Employee edits allowed fields in own profile
   - **If allowed field:** Update immediately
   - **If sensitive field:** Create approval request
   - **Input:** Employee ID, field updates
   - **Output:** Updated profile or approval request

9. **HR Profile Approval (F033)**
   - HR reviews profile change requests
   - HR approves or rejects
   - If approved, Directory updates profile
   - Admin approval also required for critical changes
   - **Input:** Profile change request ID, HR decision
   - **Output:** Updated profile (if approved)

10. **Self-Learning Request (F034)**
    - Employee views missing skills
    - Employee requests self-learning
    - **If active learner:** Direct enrollment allowed
    - **If not yet directed:** HR approval required
    - **Input:** Employee ID, requested course/skill, learning status
    - **Output:** Self-learning request or direct enrollment

---

## Flow 4: Skill Verification Flow

**Actors:** Employee, Skills Engine, Assessment, Directory

**Feature IDs:** F011, F012

### Step-by-Step Flow:

1. **Initial Skill Verification Request (F011)**
   - Employee views profile with unverified skills
   - Employee clicks "Verify Your Skills" button
   - Directory triggers Skills Engine verification process
   - Skills Engine sends assessment request to Assessment microservice
   - **Input:** Employee ID, selected skills to verify
   - **Output:** Verification request sent, assessment exam initiated

2. **Assessment Completion**
   - Employee completes assessment exam in Assessment microservice
   - Assessment returns results to Skills Engine
   - **Note:** "Verify Your Skills" is one-time test with only passing grade, no max attempts

3. **Verified Skills Update (F012)**
   - Skills Engine receives assessment results
   - Skills Engine sends verified skills list to Directory via REST API
   - Directory updates employee profile:
     - Adds verified skills
     - Updates relevance scores
     - Hides "Verify Your Skills" button
   - **Input:** Verified skills list, updated relevance scores (from Skills Engine REST API)
   - **Output:** Updated employee profile with verified skills

---

## Flow 5: HR Training Requests

**Actors:** HR, Marketplace, Content Studio, Mail API, Directory

**Feature IDs:** F014, F015, F016, F017, F018, F019, F020, F021, F022

### Flow 5.1: Fully Personalized Training (Career Path Driven) - F014

1. **HR Submits Request**
   - HR submits training request aligned with employee career path
   - Directory checks missing skills via employee Value Proposition (F009)

2. **Marketplace Query (F017)**
   - Directory queries Marketplace for instructors with required skills
   - **If instructor found:** Return instructor info
   - **If no instructor found:** Proceed to fallback (F018)

3. **Marketplace Fallback (F018)**
   - Marketplace creates course on the fly
   - Employee clicks course card → redirects to Course Builder
   - Marketplace updates Directory
   - Directory notifies Content Studio for manual content creation by AI
   - **Input:** Training request with no trainer match
   - **Output:** Fallback course created, Content Studio notified

4. **Trainer Invitation (F019)**
   - Directory sends invitation email to instructor via Mail API
   - Instructor status changes to "Invited" (F020)
   - **Input:** Instructor email, training request details
   - **Output:** Invitation email sent, status = Invited

5. **Instructor Acceptance**
   - Instructor accepts invitation
   - Instructor status changes to "Active" (F020)

6. **Content Studio Assignment (F021)**
   - Directory sends to Content Studio:
     - Trainer info (trainer_id, trainer_name, company_id)
     - AIEnabled field
     - can_publish_externally field
     - Exercises limit (default: 4 if not defined by company)

7. **Content Upload**
   - Instructor uploads content in Content Studio
   - Content Studio uses company-defined exercises limit (or default: 4)

8. **Course Completion (F022)**
   - Content Studio updates Directory when content upload complete (via REST API call)
   - Trainer status changes to "Archived" (F020)
   - Content Studio sends accomplished course data via REST API:
     - course_id, course_name, trainer_id, trainer_name, status
   - **Input:** Course completion data from Content Studio (REST API)
   - **Output:** Trainer status = Archived, course data stored

### Flow 5.2: Group/Department Training (Skill-Driven) - F015

1. **HR Submits Group Request**
   - HR requests specific skills for employees/groups
   - Directory checks each employee's verified skills

2. **Skill Check**
   - **If employee lacks skills:** Proceed with training
   - **If employee already has skills:** HR decides whether enrollment required

3. **Marketplace Query & Coordination**
   - Directory queries Marketplace for instructors (F017)
   - Invitations sent via Mail API (F019)
   - Instructor accepts → status = Active (F020)
   - Instructor uploads content in Content Studio (F021)
   - Upon completion → employee profiles updated (F022)

### Flow 5.3: Specific Instructor Training - F016

1. **HR Submits Instructor Request**
   - HR requests a particular instructor
   - Directory checks if employee lacks skills taught by instructor

2. **Skill Check & Coordination**
   - **If skills missing:** Proceed with training
   - **If skills already acquired:** HR decides whether enrollment required
   - Invitation sent → instructor accepts → status = Active (F019, F020)
   - Instructor uploads course in Content Studio (F021)
   - Upon completion → employee profiles updated (F022)

---

## Flow 6: Course Completion & Skills Update

**Actors:** Employee, Course Builder, Assessment, Skills Engine, Directory

**Feature IDs:** F023, F024, F027, F044

### Step-by-Step Flow:

1. **Course Completion in Course Builder**
   - Employee completes course in Course Builder
   - Employee takes post-course exam in Assessment microservice
   - Assessment sends exam results to Skills Engine

2. **Skills Engine Update (F027)**
   - Skills Engine receives exam results from Assessment
   - Skills Engine updates Directory via REST API with:
     - Newly verified skills (if any)
     - New skills added during learning (not necessarily verified)
     - Updated relevance scores
   - Directory receives the number of exam attempts performed by the employee from Assessment microservice
   - **Input:** Skills update data from Skills Engine (REST API), exam attempts number from Assessment
   - **Output:** Updated employee profile with new/verified skills and exam attempts number stored

3. **Course Builder Feedback (F023)**
   - Course Builder sends student feedback to Directory via REST API:
     - feedback, course_id, course_name, learner_id
   - Directory receives test attempts number from Assessment microservice
   - **Only if employee passed the exam:** Directory updates profile with completed course, feedback, and test attempts number
   - **If employee failed:** Course not shown in completed courses, but new verified skills (if any) are still updated
   - **Input:** Course feedback data from Course Builder (REST API), test attempts number from Assessment
   - **Output:** Updated employee profile with completed course, feedback, and test attempts number displayed

4. **Completed Courses Display (F044)**
   - Only passed courses displayed under "Completed Courses"
   - Failed courses not shown, even if Assessment identified new verified skills
   - **Input:** Employee ID, course completion status
   - **Output:** List of completed (passed) courses in profile

5. **Preferred Language Sync (F024)**
   - Directory sends employee's preferred language to Course Builder:
     - When company is created with employees
     - When employee updates language manually
   - One-way update (Course Builder does not respond)
   - **Input:** Employee ID, preferred language value
   - **Output:** Language preference sent to Course Builder

---

## Flow 7: Post-Course Exam Extra Attempts

**Actors:** Employee, HR, Course Builder, Assessment, Skills Engine, Directory

**Feature IDs:** F025, F026, F027

### Step-by-Step Flow:

1. **Employee Completes Post-Course Exam**
   - Employee completes post-course exam in Assessment (triggered by Course Builder)
   - Assessment sends exam results to Skills Engine
   - Skills Engine forwards verified skill updates to Directory (F027)
   - Directory receives number of exam attempts from Assessment

2. **Extra Attempts Request (F025)**
   - If employee reaches maximum attempts:
     - "Request More Attempts" button appears under each successfully completed course
   - Employee clicks button
   - Directory creates "Extra Attempt Request"
   - Request routed to HR/Company Admin
   - **Input:** Employee ID, Course ID, current attempt count
   - **Output:** Extra attempt request created, routed to HR

3. **HR Approval (F026)**
   - HR reviews extra attempt request in Directory
   - HR approves or rejects
   - **If approved:**
     - Directory sends approval notification to Course Builder (not directly to Assessment)
     - Course Builder receives approval and updates Assessment microservice to enable additional exam attempt
   - **Input:** Extra attempt request ID, HR decision
   - **Output:** Request status updated, approval sent to Course Builder, Course Builder updates Assessment microservice

4. **Additional Attempt**
   - Assessment manages new attempt
   - Assessment returns updated results to Skills Engine
   - Skills Engine updates Directory if there are new verified skills or changes in relevance score (F027)
   - Directory logs all extra attempt requests and approvals (F039)

**Note:**
- "Verify Your Skills" (initial skill verification) is one-time test with only passing grade, no max attempts
- "Post-Course Exams" have maximum number of allowed attempts; employees can request additional attempts via HR approval

---

## Flow 8: Learning Path Approval Flow

**Actors:** HR, Decision Maker, Learner AI, Directory

**Feature IDs:** F028, F029

### Step-by-Step Flow:

1. **Policy Setup (F028)**
   - HR sets company Learning Path approval policy during registration or later:
     - Manual Approval: Requires Decision Maker approval
     - Auto-Approval: Learning Paths automatically approved
   - HR designates single Decision Maker (optional if auto-approval)
   - Directory sends policy and Decision Makers list to Learner AI (one-way)
   - **Input:** Company ID, approval policy, Decision Maker employee ID
   - **Output:** Policy updated, sent to Learner AI

2. **Learning Path Generation**
   - When employee assigned to new course/training by company:
     - Skills Engine microservice sends employee skill data to Learner AI
     - Learner AI generates personalized Learning Path based on employee skill data

3. **Approval Check**
   - Directory checks company's approval policy:
     - **If Auto-Approval:** Learning Path immediately approved, employee can begin learning
     - **If Manual Approval:** Learner AI sends Learning Path request to Decision Maker

4. **Decision Maker Review (F029)**
   - Decision Maker views pending requests under Directory profile
   - Decision Maker clicks request → redirected to Learner AI module
   - Decision Maker reviews and approves/rejects in Learner AI
   - **Input:** Decision Maker employee ID
   - **Output:** List of pending requests, redirect to Learner AI

5. **Approval Processing**
   - Learner AI records approval or rejection
   - If rejected, Learner AI manages revisions and resubmissions internally
   - Directory logs that approval policy was sent to Learner AI (for auditing)
   - **Note:** Directory does not track approval outcomes directly (one-way integration)

---

## Flow 9: Trainer Proactive Teaching Request

**Actors:** Trainer, HR, Marketplace, Directory

**Feature IDs:** F035, F036

### Step-by-Step Flow:

1. **Teaching Request Submission (F035)**
   - Trainer views own profile
   - Trainer chooses skill to teach
   - Trainer submits teaching request in Directory
   - **Input:** Trainer ID, skill to teach, teaching request details
   - **Output:** Teaching request created, sent to HR/Marketplace

2. **Request Processing**
   - HR/Marketplace reviews teaching request
   - If approved, trainer assigned to teach skill
   - Trainer profile updated with courses taught (F036)

3. **Trainer Profile Updates (F036)**
   - Trainer profile shows courses taught
   - Profile includes:
     - AI Enable field (editable by instructor)
     - Public Publish Enable field (editable by instructor/company)
   - **Input:** Trainer ID, course completion data, AI Enable flag, Public Publish flag
   - **Output:** Updated trainer profile with courses taught

---

## Flow 10: Directory Super Admin Dashboard

**Actors:** Directory Admin, HR & Management Reporting, Directory

**Feature IDs:** F038, F039

### Step-by-Step Flow:

1. **Admin Login**
   - Directory Admin logs in with super-admin credentials
   - Directory verifies admin permissions

2. **Dashboard Display (F038)**
   - Admin dashboard retrieves analytics data from HR & Management Reporting microservice
   - Admin can view:
     - All registered companies
     - All employee profiles in full detail
     - Aggregated reports and analytics
   - **Input:** Admin credentials
   - **Output:** Admin dashboard with analytics, company/employee list views

3. **System Logs Access**
   - Admin can access logs of all critical requests:
     - Extra assessment attempts (F026)
     - Profile changes
     - Company registrations
   - All views are read-only for company data
   - Configuration changes limited to Directory system settings

4. **Admin Action Logging (F039)**
   - All admin actions logged:
     - Profile creation, deletion, updates
     - Approvals
     - System configuration changes
   - Logs stored for at least 12 months
   - **Input:** Admin action type, action details, admin user ID
   - **Output:** Action log entry

---

## Flow 11: HR Settings Management

**Actors:** HR, Directory

**Feature IDs:** F040

### Step-by-Step Flow:

1. **HR Accesses Settings**
   - HR opens Company Settings page
   - HR views current company settings

2. **Settings Configuration (F040)**
   - HR can set:
     - Allowed assessment retakes
     - Number of exercises in courses (default: 4 if not defined)
     - Verification grade for skills
     - If trainer can public publish content
     - Learning Path approval policy (Manual/Auto)
     - Decision Makers for Learning Path approval
   - **Input:** Company ID, setting name, setting value
   - **Output:** Updated company settings

3. **Settings Application**
   - Settings applied to:
     - New course assignments
     - Skill verification processes
     - Trainer permissions
     - Learning Path workflows

---

## Flow 12: Data Integration Flows

**Actors:** Directory, External Microservices

**Feature IDs:** F041, F042, F043

### Flow 12.1: HR & Management Reporting Integration (F041)

1. **Data Sending**
   - Directory sends to HR & Management Reporting:
     - All company data
     - All employee data
     - Primary KPIs
   - **Input:** Company data, employee data, KPI data
   - **Output:** Data sent to HR & Management Reporting

### Flow 12.2: Contextual Corporate Assistant Integration (F042)

1. **Data Sending**
   - Directory provides to Contextual Corporate Assistant:
     - Company data
     - Employee profile data
   - Used for RAG/Graph recommendations
   - **Input:** Company data, employee profile data
   - **Output:** Data sent to Contextual Corporate Assistant

### Flow 12.3: Learning Analytics Integration (F043)

1. **Data Sending**
   - Directory sends to Learning Analytics:
     - Company data
     - Employee data
     - KPIs
     - Student feedback
   - Used for insights and analytics
   - **Input:** Company data, employee data, student feedback, KPI data
   - **Output:** Data sent to Learning Analytics

---

## Flow 13: Single Public Entry Endpoint

**Actors:** External Services, Directory, AI Query Service

**Feature IDs:** F046, F048

### Step-by-Step Flow:

1. **External Service Request (F046)**
   - External service calls Directory's single public entry endpoint
   - Request includes:
     - Calling service name/identifier
     - JSON object describing requested data

2. **AI-Assisted Query Generation**
   - Directory uses AI-assisted prompt (Gemini API) to:
     - Analyze requested data structure
     - Reference current database schema (F047)
     - Dynamically generate SQL query

3. **SQL Injection Prevention (F048)**
   - Generated SQL query validated
   - Input sanitized to prevent SQL injection
   - Query parameters properly escaped

4. **Query Execution**
   - Directory executes validated SQL query
   - Returns exactly the data fields requested
   - **Input:** Calling service name, JSON describing requested data
   - **Output:** Dynamically generated SQL query result

---

## Flow 14: Mock Data Fallback

**Actors:** Directory, External APIs, Mock Data Service

**Feature IDs:** F045

### Step-by-Step Flow:

1. **External API Call**
   - Directory attempts to call external API (microservice or third-party)
   - Examples: Skills Engine, Marketplace, LinkedIn API, etc.

2. **Failure Detection**
   - API call fails (timeout, error, missing response)
   - Directory detects failure

3. **Mock Data Loading (F045)**
   - Directory automatically loads mock data from centralized `/mockData/index.json`
   - Mock data structure matches expected API response
   - **Input:** Failed API call, API identifier
   - **Output:** Mock data response

4. **Fallback Response**
   - Directory returns mock data as if it came from API
   - System continues operation with mock data
   - Error logged for monitoring

---

## Data Flow Summary

### Key Data Paths:

1. **Company Registration:**
   - HR Form → Directory Validation → Company DB → Auth Service Check → Employee Profiles

2. **Profile Creation:**
   - External APIs → Raw Data → Gemini AI → Enriched Data → Skills Engine → Normalized Skills → Profile DB

3. **Training Requests:**
   - HR Request → Marketplace Query → Trainer Match → Mail Invitation → Content Studio → Course Completion

4. **Skills Updates:**
   - Assessment → Skills Engine → Directory → Profile Update

5. **Course Completion:**
   - Course Builder → Feedback → Directory → Profile Update
   - Assessment → Skills Engine → Directory → Skills Update

6. **Learning Path:**
   - Skills Engine → Learner AI → Learning Path Generation → Approval (Manual/Auto) → Employee Profile

### Integration Points:

- **Inbound:** Auth Service, Skills Engine, Assessment, Content Studio, Course Builder, Marketplace, Learner AI
- **Outbound:** HR & Management Reporting, Contextual Corporate Assistant, Learning Analytics, Mail API, SendPulse API, External APIs (LinkedIn, GitHub, etc.)

---

## Error Handling & Fallbacks

1. **API Failures:** Automatic fallback to mock data (F045)
2. **Validation Errors:** Clear error messages returned to user
3. **Database Errors:** Transaction rollback, error logging
4. **Authentication Errors:** Redirect to login, clear error message
5. **Permission Errors:** Access denied message, audit log entry

---

## Performance Targets

- Profile loading: < 2 seconds
- Company registration: < 5 seconds
- Course assignment / Skill verification: < 3-4 seconds
- Support 200-500 concurrent users

---

## Flow 15: Company Isolation Constraint

**Actors:** Companies, Directory

**Feature IDs:** F053

### Step-by-Step Flow:

1. **Cross-Company Access Attempt**
   - Company A attempts to access data from Company B
   - Directory checks company isolation constraint

2. **Isolation Enforcement (F053)**
   - Directory middleware checks company ID
   - If request attempts cross-company access:
     - Access denied
     - Error message returned
   - **Input:** Company ID, request to access another company's data
   - **Output:** Access denied, isolation enforced

**Note:** Companies cannot contact other companies directly. All company data is isolated within each company's scope.

---

## Flow 16: Critical Requests Routing to Directory Admin

**Actors:** HR, Directory Admin, Directory

**Feature IDs:** F039A

### Step-by-Step Flow:

1. **Critical Request Creation**
   - HR or system creates critical request:
     - Profile creation with real data
     - Course/instructor assignments
     - Sensitive operations
   - Request automatically routed to Directory admin

2. **Admin Review (F039A)**
   - Directory admin views critical request in admin dashboard
   - Admin reviews request details
   - Admin approves or rejects

3. **Request Execution**
   - **If approved:** Request executed, operation completed
   - **If rejected:** Request denied, operation cancelled
   - **Input:** Critical request data, request type
   - **Output:** Request routed to admin, admin decision, request executed (if approved)

**Note:** All critical requests must go through Directory admin for approval before execution.

