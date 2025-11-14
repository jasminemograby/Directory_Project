# Development Priorities & Plan

## ✅ Completed Actions

### 1. Removed Notification/Email UI Elements
- ✅ Removed `NotificationCenter` component from `Layout.js`
- ✅ Removed notification info box from `HRDashboard.js`
- ✅ Notification/email features marked as "Nice to Have" for later

---

## 📋 Current Focus: User Profiles

### Next Features to Build (In Order)

#### **F004: External Data Collection (LinkedIn & GitHub Only)**
- **Priority:** HIGH
- **Scope:** LinkedIn + GitHub only (not Credly, YouTube, ORCID, Crossref)
- **Requirements:**
  - User authorization before accessing accounts
  - OAuth flow for LinkedIn
  - OAuth flow for GitHub
  - Store authorization tokens securely
  - Fetch profile data from both sources

#### **F005: AI-Enhanced Profile Enrichment (Gemini)**
- **Priority:** HIGH
- **Requirements:**
  - Integrate Gemini API
  - Generate short professional bio from collected data
  - Identify and summarize projects
  - Display results in user profile
  - **No mock data** - primary integration only

#### **F006: Skills Engine Integration**
- **Priority:** HIGH
- **Requirements:**
  - Send profile data to Skills Engine microservice
  - Use Railway deployment URL for Skills Engine
  - Mock data fallback if Skills Engine unavailable
  - Receive normalized skills (unverified)
  - Store in Directory DB

#### **F007: Employee Profile Creation & Storage**
- **Priority:** HIGH
- **Requirements:**
  - Create full employee profile in Directory DB
  - Include: normalized skills, bio, projects, basic info, role, type
  - Status: 'pending approval' (awaiting HR confirmation)
  - Display profile in UI

---

## 🔧 Technical Implementation Notes

### Inter-Microservice Communication
- **Protocol:** REST API via HTTPS
- **URLs:** Use Railway deployment URLs for each microservice
- **Mock Data:** Implement fallback for unavailable services
- **Example:** `https://skills-engine-production.up.railway.app/api/...`

### External Integrations (Gemini, LinkedIn, GitHub)
- **No Mock Data:** Primary integrations only
- **Fallback:** Skip gracefully if service fails (no secondary fallback for now)
- **Authorization:** OAuth flows for LinkedIn and GitHub
- **Storage:** Store tokens securely in database

### Cross-Microservice Navigation
- **Simple Approach:** Use deployed URLs directly
- **Example:** "Go to Learning Studio" → `https://learning-studio.vercel.app`
- **No Complex Routing:** No frontend routing between apps

---

## 📝 Template Execution Plan

### Current Status
- **Templates Not Executed:** No template files exist in repository
- **Work Proceeding:** Direct implementation based on requirements/roadmap
- **Documentation:** Created retrospectively as needed

### Recommendation: Hybrid Approach
1. **Continue building features** (user profiles, LinkedIn/GitHub, Gemini, Skills Engine)
2. **Create template documentation** retrospectively for completed features
3. **Execute templates** for new features going forward

### If Templates Are Critical
- Can create template files now
- Execute them for next features
- Document completed features retrospectively

**User Decision Needed:** Should I continue building features now, or create/execute templates first?

---

## 🎯 Immediate Next Steps

1. ✅ **Remove notification UI** - DONE
2. 🔄 **Build LinkedIn OAuth integration** - IN PROGRESS
3. ⏳ **Build GitHub OAuth integration** - PENDING
4. ⏳ **Integrate Gemini API** - PENDING
5. ⏳ **Integrate Skills Engine** - PENDING
6. ⏳ **Create user profile UI** - PENDING

---

## 📌 Notes

- **Email/Notifications:** Paused, marked as "Nice to Have"
- **External Data Sources:** Only LinkedIn + GitHub for now
- **User Authorization:** Required before accessing external accounts
- **Gemini AI:** Primary integration only, no fallback
- **Skills Engine:** Mock data fallback if unavailable
- **Templates:** Hybrid approach recommended

