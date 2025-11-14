# Nice to Have Features

This document lists features that are not critical for MVP but would be valuable additions in the future.

---

## Employee Notifications

**Feature:** Direct email/notification to employees inviting them to register after company setup.

**Current Implementation:**
- HR receives notification about unregistered employees
- HR must manually contact employees

**Future Enhancement:**
- Send automated email/notification directly to employees
- Include registration link and instructions
- Track notification delivery status

**Priority:** Low  
**Status:** Future Enhancement

---

## HR Profile Approval Workflow

**Feature:** Manual HR approval of employee profiles after enrichment.

**Current Implementation:**
- Profiles are auto-approved after successful enrichment
- `profile_status` changes from 'pending' to 'approved' automatically

**Future Enhancement:**
- Add HR review step before approval
- HR can view enriched profiles and approve/reject
- Add approval notes/comments
- Track approval history

**Priority:** Low  
**Status:** Future Enhancement  
**Note:** Currently auto-approval is used for faster onboarding

---

## Additional External Data Sources

**Feature:** Support for additional external data sources beyond LinkedIn and GitHub.

**Current Implementation:**
- LinkedIn (optional)
- GitHub (required)

**Future Enhancement:**
- Credly API integration
- YouTube Data API integration
- ORCID API integration
- Crossref API integration

**Priority:** Low  
**Status:** Future Enhancement

---

## Profile Enrichment Retry Mechanism

**Feature:** Automatic retry of failed enrichment attempts.

**Current Implementation:**
- Manual retry by employee

**Future Enhancement:**
- Automatic retry with exponential backoff
- Notification to employee if retry fails
- Admin dashboard for monitoring failed enrichments

**Priority:** Low  
**Status:** Future Enhancement

---

## Advanced Profile Analytics

**Feature:** Analytics dashboard for profile enrichment success rates, completion times, etc.

**Priority:** Low  
**Status:** Future Enhancement

