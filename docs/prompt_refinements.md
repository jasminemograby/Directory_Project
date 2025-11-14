# Prompt Refinements

This document tracks prompt improvements, clarifications, and AI/LLM usage decisions.

---

## 2025-01-11

### Template Execution Clarification
- **Issue:** Templates were not being executed as required by the main prompt
- **Clarification:** Templates must be Cursor-runnable markdown prompts, not just documentation. Each template should:
  - Ask interactive questions one-by-one
  - Generate artifacts based on answers
  - Include a final checklist
- **Action:** Updated template structure to be interactive and executable
- **Status:** In Progress

---

## 2025-01-11

### Notification/Email Features Pause
- **Issue:** User requested to pause email/notification work
- **Clarification:** SendPulse, SendGrid, SMTP features are marked as "Nice to Have" for later
- **Action:** Removed notification UI elements from frontend
- **Status:** Applied

---

## 2025-01-11

### External Data Sources Scope
- **Issue:** User requested to limit external data sources for MVP
- **Clarification:** Only LinkedIn and GitHub integration for now. Other sources (Credly, YouTube, ORCID, Crossref) deferred.
- **Action:** Updated F004 scope in development priorities
- **Status:** Pending

---

## AI/LLM Usage

### Gemini API Integration (F005)
- **Purpose:** Generate short professional bio and identify/summarize projects from collected data
- **Inputs:** Raw employee data from external sources
- **Outputs:** AI-generated short bio, project titles and summaries
- **Guardrails:** 
  - Input validation
  - Rate limiting
  - Error handling
  - No mock data fallback (primary integration only)
- **Status:** Pending implementation

### Dynamic SQL Query Generation
- **Purpose:** Generate SQL queries dynamically based on JSON requests
- **Inputs:** Service identifier, JSON describing requested data
- **Outputs:** SQL query, query results
- **Guardrails:**
  - Schema validation before query generation
  - SQL injection prevention
  - Input sanitization
  - Security review required
- **Status:** Pending implementation

---

## Future Refinements

[Additional prompt refinements and AI usage decisions will be recorded here]

