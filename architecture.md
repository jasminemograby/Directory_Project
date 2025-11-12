# Directory Microservice - Architecture Document

## Overview

Directory is a central hub microservice within the EduCore system, built with React (frontend) and Node.js/Express (backend), deployed on Vercel and Railway respectively, with PostgreSQL database hosted on Supabase.

---

## Technology Stack

### Frontend
- **Framework:** React (JavaScript ES6 only - no TypeScript)
- **Styling:** Tailwind CSS (utility classes only - no standalone CSS/SCSS files)
- **Deployment:** Vercel
- **Responsive Design:** Desktop, tablet, and mobile web browsers

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** JavaScript (ES6) only - no TypeScript
- **Deployment:** Railway

### Database
- **Database:** PostgreSQL
- **Hosting:** Supabase
- **Migrations:** SQL migration files in `database/migrations/`

### CI/CD
- **Platform:** GitHub Actions
- **Workflow:** `.github/workflows/deploy.yml`

### External APIs & Integrations
- **AI:** Gemini API (for profile enrichment and dynamic query generation)
- **External Data Sources:** LinkedIn, GitHub, Credly, YouTube, ORCID, Crossref
- **Microservices:** Auth Service, Skills Engine, Assessment, Content Studio, Course Builder, Marketplace, Learning Analytics, Learner AI, HR & Management Reporting, Contextual Corporate Assistant
- **Communication:** Mail API, SendPulse API

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                       │
│                      Deployed on Vercel                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Company    │  │   Employee   │  │     Admin    │      │
│  │ Registration │  │    Profile   │  │   Dashboard  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                 │
│                     Deployed on Railway                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routes &   │  │   Services   │  │  Controllers │      │
│  │  Middleware  │  │  (Business   │  │  (Request    │      │
│  │              │  │   Logic)     │  │   Handling)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┼───────────┐
                │           │           │
        ┌───────▼──────┐  ┌▼──────────┐  ┌──────────────┐
        │  PostgreSQL   │  │ External  │  │ Microservices│
        │   (Supabase)  │  │   APIs    │  │  Integration │
        └──────────────┘  └───────────┘  └──────────────┘
```

### Monorepo Structure

```
Directory_Project/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CompanyRegistration/
│   │   │   ├── Profile/
│   │   │   ├── HR/
│   │   │   ├── Trainer/
│   │   │   └── Admin/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── public/
│   └── package.json
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── middleware/
│   ├── validators/
│   ├── config/
│   └── package.json
├── database/
│   ├── migrations/
│   └── schema.sql
├── mockData/
│   └── index.json
├── docs/
│   ├── feature_log.md
│   ├── project_customization.md
│   ├── prompt_refinements.md
│   ├── change_log.md
│   └── security_checks.md
├── .github/
│   └── workflows/
│       └── deploy.yml
├── features-map.json
└── README.md
```

---

## Database Architecture

### Core Tables

#### Companies
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `industry` (VARCHAR)
- `primary_kpi` (TEXT)
- `learning_path_approval_policy` (ENUM: 'manual', 'auto')
- `decision_maker_id` (UUID, Foreign Key → Employees)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Employees
- `id` (UUID, Primary Key)
- `company_id` (UUID, Foreign Key → Companies)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `role` (VARCHAR) - e.g., 'QA', 'Backend Developer', 'Designer'
- `type` (ENUM: 'regular', 'internal_instructor', 'external_instructor')
- `department_id` (UUID, Foreign Key → Departments)
- `team_id` (UUID, Foreign Key → Teams)
- `career_path` (TEXT)
- `preferred_language` (VARCHAR, Default: 'Hebrew')
- `bio` (TEXT) - AI-generated
- `value_proposition` (TEXT) - AI-generated
- `relevance_score` (NUMERIC)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Departments
- `id` (UUID, Primary Key)
- `company_id` (UUID, Foreign Key → Companies)
- `name` (VARCHAR)
- `manager_id` (UUID, Foreign Key → Employees)
- `created_at` (TIMESTAMP)

#### Teams
- `id` (UUID, Primary Key)
- `department_id` (UUID, Foreign Key → Departments)
- `name` (VARCHAR)
- `manager_id` (UUID, Foreign Key → Employees)
- `created_at` (TIMESTAMP)

#### Trainers
- `id` (UUID, Primary Key)
- `employee_id` (UUID, Foreign Key → Employees, Unique)
- `status` (ENUM: 'invited', 'active', 'archived')
- `ai_enabled` (BOOLEAN, Default: false)
- `public_publish_enabled` (BOOLEAN, Default: false)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Skills
- `id` (UUID, Primary Key)
- `employee_id` (UUID, Foreign Key → Employees)
- `skill_name` (VARCHAR)
- `skill_type` (ENUM: 'normalized', 'verified')
- `source` (VARCHAR) - 'skills_engine', 'assessment', etc.
- `created_at` (TIMESTAMP)

#### Projects
- `id` (UUID, Primary Key)
- `employee_id` (UUID, Foreign Key → Employees)
- `title` (VARCHAR)
- `summary` (TEXT) - AI-generated
- `source` (VARCHAR) - 'github', 'linkedin', etc.
- `created_at` (TIMESTAMP)

#### Completed Courses
- `id` (UUID, Primary Key)
- `employee_id` (UUID, Foreign Key → Employees)
- `course_id` (VARCHAR)
- `course_name` (VARCHAR)
- `trainer_id` (UUID, Foreign Key → Employees)
- `trainer_name` (VARCHAR)
- `feedback` (TEXT)
- `completed_at` (TIMESTAMP)

#### Extra Attempt Requests
- `id` (UUID, Primary Key)
- `employee_id` (UUID, Foreign Key → Employees)
- `course_id` (VARCHAR)
- `current_attempts` (INTEGER)
- `max_attempts` (INTEGER)
- `status` (ENUM: 'pending', 'approved', 'rejected')
- `hr_approver_id` (UUID, Foreign Key → Employees)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Company Settings
- `id` (UUID, Primary Key)
- `company_id` (UUID, Foreign Key → Companies)
- `setting_key` (VARCHAR)
- `setting_value` (TEXT)
- `updated_at` (TIMESTAMP)

#### Audit Logs
- `id` (UUID, Primary Key)
- `action_type` (VARCHAR)
- `actor_id` (UUID, Foreign Key → Employees)
- `target_type` (VARCHAR) - 'employee', 'company', etc.
- `target_id` (UUID)
- `action_details` (JSONB)
- `created_at` (TIMESTAMP)

#### Consent Records
- `id` (UUID, Primary Key)
- `employee_id` (UUID, Foreign Key → Employees)
- `consent_type` (VARCHAR)
- `consent_given` (BOOLEAN)
- `consent_date` (TIMESTAMP)
- `expiry_date` (TIMESTAMP)

### Relationships

- Companies → Employees (1:N)
- Companies → Departments (1:N)
- Departments → Teams (1:N)
- Employees → Skills (1:N)
- Employees → Projects (1:N)
- Employees → Completed Courses (1:N)
- Employees → Trainers (1:1)
- Companies → Company Settings (1:N)
- Employees → Audit Logs (1:N) - as actor
- Employees → Consent Records (1:N)

---

## API Architecture

### Internal Endpoints

Directory includes multiple internal endpoints for its own feature logic. These endpoints communicate internally within the Directory service and are not exposed externally.

**Naming Pattern:** `/api/internal/{feature}/{action}`

Examples:
- `/api/internal/company/register`
- `/api/internal/profile/create`
- `/api/internal/training/request`

### Single Public Entry Endpoint

Directory exposes one main public endpoint that serves as a unified communication gateway for all external API requests.

**Endpoint:** `POST /api/public/query`

**Request Body:**
```json
{
  "service_name": "string",
  "request_data": {
    "entity_type": "string",
    "filters": {},
    "fields": []
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [],
  "query_executed": "string"
}
```

**Process:**
1. Receives service name/identifier and JSON describing requested data
2. Uses AI-assisted prompt (Gemini API) to analyze request
3. References current database schema
4. Dynamically generates and executes SQL query
5. Returns exactly the data fields requested
6. All queries validated for SQL injection prevention

### External Microservice Integration Endpoints

**Note:** Directory uses REST API and HTTPS only. No webhooks are used. All communication is synchronous HTTP/REST.

**Inbound API Endpoints (REST):**
- `POST /api/internal/skills-engine/update` - Skills updates from Skills Engine
- `POST /api/internal/content-studio/update` - Course completion from Content Studio
- `POST /api/internal/course-builder/feedback` - Course feedback from Course Builder

**Outbound API Calls (REST/HTTPS):**
- Auth Service: Employee registration verification
- Skills Engine: Skill normalization, verification
- Marketplace: Trainer search
- Content Studio: Trainer data, course notifications
- Course Builder: Preferred language sync, course feedback
- Learner AI: Learning Path approval policy
- HR & Management Reporting: Company/employee data
- Learning Analytics: Analytics data
- Contextual Corporate Assistant: Profile data

---

## Security Architecture

### Authentication & Authorization

- **Authentication:** Handled by Auth Service (external)
- **Authorization:** RBAC (Role-Based Access Control) implemented in Directory
- **Roles:** Admin, Primary HR, Department Manager, Team Manager, Employee

### Input Validation

- All user inputs validated before processing
- SQL injection prevention for dynamic queries
- XSS prevention in frontend
- CSRF protection for state-changing operations

### Secrets Management

- All API keys, tokens, and secrets stored in environment variables
- No hardcoded secrets in code
- `.env.example` provided for documentation
- Secrets managed via Railway/Vercel environment variables

### Data Protection

- **PII Minimization:** Store only necessary personal data
- **GDPR Compliance:** Explicit consent storage
- **Data Retention:**
  - Employee profiles: 5 years or until deletion requested
  - Audit logs: 12 months
- **Encryption:** HTTPS for all communications, database encryption at rest (Supabase)

### Audit Logging

- All admin actions logged
- Critical operations logged (profile creation, deletion, updates, approvals)
- Logs stored for at least 12 months
- Logs include: action type, actor, target, timestamp, details

---

## Deployment Architecture

### Frontend Deployment (Vercel)

- **Build:** `npm run build` in `frontend/` directory
- **Output:** Static React build
- **Environment Variables:** VERCEL_TOKEN (for CI/CD)
- **Custom Domain:** Configured via Vercel dashboard

### Backend Deployment (Railway)

- **Runtime:** Node.js
- **Start Command:** `npm start` in `backend/` directory
- **Environment Variables:**
  - Database connection (Supabase)
  - API keys (LinkedIn, GitHub, Gemini, etc.)
  - Microservice URLs
  - RAILWAY_TOKEN (for CI/CD)

### Database Deployment (Supabase)

- **Migrations:** Applied via Supabase CLI or dashboard
- **Backups:** Daily automated backups
- **Connection:** PostgreSQL connection string stored in Railway environment variables

### CI/CD Pipeline (GitHub Actions)

**Workflow:** `.github/workflows/deploy.yml`

**Triggers:**
- Pull requests: Run tests and security scans
- Feature branches: Create preview deploys
- Milestone merge/tag: Full deployment

**Steps:**
1. **Test:** Run unit and integration tests
2. **Security Scan:** Run dependency vulnerability scans
3. **Build:** Build frontend and backend
4. **Deploy Frontend:** Deploy to Vercel
5. **Deploy Backend:** Deploy to Railway
6. **Database Migrations:** Apply Supabase migrations
7. **Health Check:** Verify deployment success
8. **Rollback:** Automatic rollback on health check failure

**Secrets Required:**
- `VERCEL_TOKEN`
- `RAILWAY_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Integration Architecture

### Microservice Communication

**Note:** All microservice communication uses REST API and HTTPS only. No webhooks are used.

**Synchronous (HTTP/REST/HTTPS):**
- Auth Service: Employee registration check
- Skills Engine: Skill normalization, verification, skills updates
- Marketplace: Trainer search
- Content Studio: Trainer data, course completion updates
- Course Builder: Language sync, course feedback
- Learner AI: Approval policy
- HR & Management Reporting: Company/employee data
- Learning Analytics: Analytics data
- Contextual Corporate Assistant: Profile data

**External APIs (REST/HTTPS):**
- LinkedIn, GitHub, Credly, YouTube, ORCID, Crossref: Data collection
- Gemini API: AI enrichment, dynamic query generation
- Mail API: Email notifications
- SendPulse API: In-app notifications

### Mock Data Fallback

- Centralized mock data in `/mockData/index.json`
- Automatic fallback when external API calls fail
- Mock data structure matches expected API responses
- Fallback triggered on: timeout, error, missing response

---

## Performance Architecture

### Caching Strategy

- **Frontend:** React component memoization
- **Backend:** In-memory caching for frequently accessed data (company structure, settings)
- **Database:** PostgreSQL query optimization, indexes on foreign keys

### Database Optimization

- Indexes on:
  - Foreign keys (company_id, employee_id, etc.)
  - Frequently queried fields (email, status)
  - Composite indexes for common query patterns
- Connection pooling via Supabase
- Query optimization for profile loading

### Response Time Targets

- Profile loading: < 2 seconds
- Company registration: < 5 seconds
- Course assignment / Skill verification: < 3-4 seconds
- Support 200-500 concurrent users

### Scalability

- **MVP:** 10 companies, 5-20 employees each (~200-500 users)
- **Future:** Designed to scale horizontally
- Database: Supabase auto-scaling
- Backend: Railway auto-scaling
- Frontend: Vercel CDN

---

## Monitoring & Logging

### Application Logging

- **Backend:** Winston or similar logging library
- **Log Levels:** Error, Warn, Info, Debug
- **Log Storage:** Logs sent to monitoring service (Railway logs, external service)

### Health Checks

- **Endpoint:** `GET /api/health`
- **Checks:**
  - Database connectivity
  - External API availability (optional)
  - System resources
- **Response:** JSON with status and details

### Error Tracking

- Error logging with stack traces
- Error notifications for critical failures
- Error aggregation and reporting

### Performance Monitoring

- Response time tracking
- Database query performance
- API call performance
- Resource usage monitoring

---

## Backup & Recovery

### Backup Strategy

- **Daily Backups:** Database and critical files
- **Monthly Backups:** Long-term storage
- **Storage:** Off main server (cloud storage or separate storage)
- **Backup Retention:** 5 years for profiles, 12 months for logs

### Recovery

- **RTO (Recovery Time Objective):** 24 hours
- **Recovery Process:**
  1. Restore database from backup
  2. Restore critical files
  3. Verify data integrity
  4. Resume operations

---

## Development Workflow

### Local Development

1. **Frontend:**
   - `cd frontend && npm install && npm start`
   - Runs on `http://localhost:3000`

2. **Backend:**
   - `cd backend && npm install && npm start`
   - Runs on `http://localhost:5000`
   - Requires `.env` file with all secrets

3. **Database:**
   - Connect to Supabase development database
   - Run migrations: `supabase db push`

### Testing

- **Unit Tests:** Jest for backend, React Testing Library for frontend
- **Integration Tests:** API endpoint testing
- **E2E Tests:** (Optional) Playwright or Cypress

### Code Quality

- **Linting:** ESLint
- **Formatting:** Prettier
- **Type Checking:** (Not applicable - JavaScript only)

---

## Security Checklist

- [x] Input validation on all endpoints
- [x] SQL injection prevention
- [x] XSS prevention
- [x] CSRF protection
- [x] Secrets in environment variables
- [x] HTTPS for all communications
- [x] RBAC implementation
- [x] Audit logging
- [x] GDPR compliance (consent storage)
- [x] PII minimization
- [x] Regular security scans in CI/CD

---

## Future Considerations

- **Caching Layer:** Redis for improved performance
- **Message Queue:** For async microservice communication
- **API Gateway:** For centralized authentication/authorization
- **GraphQL:** Alternative to REST API (if needed)
- **Real-time Updates:** WebSocket support for live updates
- **Mobile Apps:** Native mobile app support (post-MVP)

