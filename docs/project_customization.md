# Project Customization

This document records project-specific customizations, diffs, and custom rules that override or extend the general templates.

**Purpose:** Store non-generalized, project-specific adjustments only. 

**Related Document:** Generalized refinements (applicable to multiple projects) should go in `docs/precision.md`.

---

## Customization Rules

### 1. Notification/Email Features - Paused
- **Date:** 2025-01-11
- **Rule:** Email sending and notification features (SendPulse, SendGrid, SMTP) are paused and marked as "Nice to Have" for later.
- **Impact:** UI elements related to notifications/emails should be removed from the interface.
- **Status:** Applied

### 2. External Data Sources - Limited Scope
- **Date:** 2025-01-11
- **Rule:** For MVP, only LinkedIn and GitHub integration are implemented. Other sources (Credly, YouTube, ORCID, Crossref) are deferred.
- **Impact:** F004 implementation focuses on LinkedIn and GitHub only.
- **Status:** Pending

### 3. Mock Data Fallback
- **Date:** 2025-01-11
- **Rule:** All external API calls must have mock data fallback stored in `/mockData/index.json`. If API fails, system should gracefully fall back to mock data.
- **Impact:** All service integrations must implement fallback logic.
- **Status:** Applied

### 4. Inter-Microservice Communication
- **Date:** 2025-01-11
- **Rule:** Communication between Directory and other microservices uses Railway deployment URLs. Mock data fallback is required for unavailable services.
- **Impact:** All microservice integrations must use Railway URLs and implement fallback.
- **Status:** Applied

### 5. External Integrations (Gemini, LinkedIn, GitHub)
- **Date:** 2025-01-11
- **Rule:** External integrations (Gemini API, LinkedIn, GitHub) should NOT rely on mock data. If service fails, skip gracefully or use secondary fallback (for Gemini only).
- **Impact:** Primary integrations must work correctly; fallback logic can be refined later.
- **Status:** Pending

---

## UI/UX Customizations

### Design System
- **Styling:** Tailwind CSS utility classes only (no standalone CSS/SCSS files)
- **Framework:** React
- **Responsive:** Mobile-first approach

### Navigation
- **Structure:** Top navigation bar with Layout component
- **Routes:** Defined in App.js with React Router

---

## API Customizations

### Single Public Entry Endpoint
- **Pattern:** Directory exposes one main public endpoint for external API requests
- **Functionality:** Accepts service identifier and JSON describing requested data, dynamically generates SQL queries via AI-assisted prompt
- **Status:** Pending implementation

---

## Database Customizations

### Schema
- **Provider:** Supabase (PostgreSQL)
- **Connection:** Session Pooler for production
- **Migrations:** Applied via Supabase SQL Editor

---

## Deployment Customizations

### Targets
- **Frontend:** Vercel
- **Backend:** Railway
- **Database:** Supabase

### CI/CD
- **Provider:** GitHub Actions
- **Workflow:** `.github/workflows/deploy.yml`
- **Status:** Implemented

---

## Future Customizations

[Additional project-specific customizations will be recorded here as they are identified]

