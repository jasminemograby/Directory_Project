# 🔌 External APIs Status - Directory Microservice

## ✅ Active External APIs (Real Integration)

### 1. Gemini AI (Profile Enrichment)
- **Status:** ✅ Active
- **Service:** `backend/services/geminiService.js`
- **Usage:** 
  - Generate professional bio from LinkedIn/GitHub data
  - Identify and summarize projects
  - Generate value propositions
- **Configuration:**
  - `GEMINI_API_KEY` - Required
  - `GEMINI_API_BASE` - Default: `https://generativelanguage.googleapis.com/v1beta`
  - `GEMINI_MODEL` - Default: `gemini-2.0-flash`
- **Fallback:** Returns `null` if API key not configured or API fails (graceful degradation)

### 2. GitHub OAuth & Data Collection
- **Status:** ✅ Active
- **Service:** `backend/services/githubService.js`
- **Usage:**
  - OAuth authorization flow
  - Fetch user profile data
  - Fetch public repositories
- **Configuration:**
  - `GITHUB_CLIENT_ID` - Required
  - `GITHUB_CLIENT_SECRET` - Required
  - `GITHUB_REDIRECT_URI` - Required
- **Fallback:** Returns error if OAuth fails (user must authorize)

### 3. LinkedIn OAuth & Data Collection
- **Status:** ✅ Active
- **Service:** `backend/services/linkedInService.js`
- **Usage:**
  - OAuth authorization flow
  - Fetch user profile data
  - Fetch work experience
- **Configuration:**
  - `LINKEDIN_CLIENT_ID` - Required
  - `LINKEDIN_CLIENT_SECRET` - Required
  - `LINKEDIN_REDIRECT_URI` - Required
- **Fallback:** Returns error if OAuth fails (user must authorize)

---

## 🔄 Microservices (Mock Data with Real API Fallback)

### 1. Skills Engine
- **Status:** 🔄 Mock Data (Real API when available)
- **Service:** `backend/services/mockSkillsEngineService.js`
- **Integration:** `backend/services/microserviceIntegrationService.js`
- **Usage:**
  - Get normalized skills/competencies
  - Get relevance score
- **Configuration:**
  - `SKILLS_ENGINE_URL` - Optional (if not set, uses mock)
- **Fallback:** ✅ Always uses mock data from `mockData/index.json` if API unavailable

### 2. Course Builder
- **Status:** 🔄 Mock Data (Real API when available)
- **Service:** `backend/services/mockCourseBuilderService.js`
- **Integration:** `backend/services/microserviceIntegrationService.js`
- **Usage:**
  - Get completed courses
  - Get learning courses (in progress)
  - Get assigned courses
- **Configuration:**
  - `COURSE_BUILDER_URL` - Optional (if not set, uses mock)
- **Fallback:** ✅ Always uses mock data from `mockData/index.json` if API unavailable

### 3. Content Studio
- **Status:** 🔄 Mock Data (Real API when available)
- **Service:** `backend/services/mockContentStudioService.js`
- **Integration:** `backend/services/microserviceIntegrationService.js`
- **Usage:**
  - Get courses taught by trainer
- **Configuration:**
  - `CONTENT_STUDIO_URL` - Optional (if not set, uses mock)
- **Fallback:** ✅ Always uses mock data from `mockData/index.json` if API unavailable

### 4. Assessment
- **Status:** 🔄 Mock Data (Real API when available)
- **Configuration:**
  - `ASSESSMENT_URL` - Optional
- **Fallback:** ✅ Uses mock data from `mockData/index.json`

### 5. Learner AI
- **Status:** 🔄 Mock Data (Real API when available)
- **Configuration:**
  - `LEARNER_AI_URL` - Optional
- **Fallback:** ✅ Uses mock data from `mockData/index.json`

### 6. Management Reporting
- **Status:** 🔄 Mock Data (Real API when available)
- **Configuration:**
  - `MANAGEMENT_REPORTING_URL` - Optional
- **Fallback:** ✅ Uses mock data from `mockData/index.json`

### 7. Learning Analytics
- **Status:** 🔄 Mock Data (Real API when available)
- **Configuration:**
  - `LEARNING_ANALYTICS_URL` - Optional
- **Fallback:** ✅ Uses mock data from `mockData/index.json`

---

## 🔧 Integration Architecture

### How It Works:

1. **External APIs (Gemini, GitHub, LinkedIn):**
   - Direct API calls
   - No fallback (returns error if fails)
   - User must authorize for GitHub/LinkedIn

2. **Microservices (Skills Engine, Course Builder, etc.):**
   - Uses `microserviceIntegrationService.sendRequest()`
   - Tries real API first (if URL configured)
   - Falls back to mock data automatically
   - Circuit breaker pattern (opens after 5 failures)

### Flow:

```
Request → microserviceIntegrationService.sendRequest()
  ↓
Try Real API (if URL configured)
  ↓
Success? → Return real data
  ↓
Fail/Timeout? → Use mock data from mockData/index.json
  ↓
Return mock data
```

---

## 📝 Configuration Summary

### Required (External APIs):
- `GEMINI_API_KEY` - For AI enrichment
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_REDIRECT_URI`
- `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_REDIRECT_URI`

### Optional (Microservices - will use mock if not set):
- `SKILLS_ENGINE_URL`
- `COURSE_BUILDER_URL`
- `CONTENT_STUDIO_URL`
- `ASSESSMENT_URL`
- `LEARNER_AI_URL`
- `MANAGEMENT_REPORTING_URL`
- `LEARNING_ANALYTICS_URL`

---

## ✅ Current Status

**External APIs:** ✅ Fully integrated and working
- Gemini: ✅ Active
- GitHub: ✅ Active
- LinkedIn: ✅ Active

**Microservices:** ✅ Mock data with real API fallback ready
- All microservices configured to use mock data
- Real API integration ready when services are available
- Automatic fallback to mock data if API unavailable

**Integration Service:** ✅ Complete
- `microserviceIntegrationService.js` - Handles all microservice calls
- Circuit breaker pattern implemented
- Mock data fallback working
- Logging and error handling complete

---

## 🎯 Next Steps

1. ✅ External APIs (Gemini, GitHub, LinkedIn) - **DONE**
2. ✅ Mock data for microservices - **DONE**
3. ✅ Integration service with fallback - **DONE**
4. ⏳ When microservices are ready - Just add URLs to Railway Variables
5. ⏳ System will automatically switch from mock to real data

---

**Last Updated:** 2024-01-01  
**Status:** ✅ Ready for production with mock data, real APIs ready when microservices are available

