# Microservice Integration - Implementation Summary

## Overview

This document summarizes the implementation of the Cross-Microservice Exchange Protocol and Internal API endpoints for the Directory microservice.

## What Was Implemented

### 1. Cross-Microservice Exchange Protocol (`/api/exchange`)

**Location:** `backend/routes/exchange.js`, `backend/controllers/exchangeController.js`

**Features:**
- ✅ Unified public endpoint: `POST /api/exchange`
- ✅ Request format: `{ "requester_service": "ServiceName", "payload": "<stringified JSON>" }`
- ✅ Response format: `{ "serviceName": "<service>", "payload": "<stringified JSON>" }`
- ✅ Security: Whitelist validation for `requester_service`
- ✅ Payload validation: Prevents SQL injection, validates structure
- ✅ Rate limiting: 60 requests/minute per IP
- ✅ Whitelist for tables/columns (prevents dynamic SQL injection)

**Contract:**
```json
{
  "requester_service": "SkillsEngine",
  "payload": "{\"employee_id\":\"uuid\",\"fields\":[\"competencies\"]}"
}
```

### 2. Service Integration Layer

**Location:** `backend/services/microserviceIntegrationService.js`

**Features:**
- ✅ `DirectoryClient.sendRequest(targetServiceName, payloadObject)`
- ✅ Automatic fallback to `mockData/index.json` on error/timeout
- ✅ Circuit breaker pattern (opens after 5 failures, resets after 60s)
- ✅ Request timeout: 30s (configurable)
- ✅ Detailed logging (endpoint, payload keys, status, timing)
- ✅ Cached mock data loading (loads once, not per request)

**Usage:**
```javascript
const { sendRequest } = require('./services/microserviceIntegrationService');
const response = await sendRequest('SkillsEngine', { employee_id: '...' });
```

### 3. Inbound Internal Endpoints (`/api/internal/*`)

**Location:** `backend/routes/internal.js`, `backend/controllers/internalApiController.js`

**Endpoints:**
- ✅ `POST /api/internal/skills-engine/update` - Receive skill updates
- ✅ `POST /api/internal/content-studio/update` - Receive course updates
- ✅ `POST /api/internal/course-builder/feedback` - Receive course feedback

**Security:**
- ✅ Bearer token authentication (`INTERNAL_API_SECRET`)
- ✅ All endpoints require authentication
- ✅ Request logging to `external_api_calls_log` table

**Example:**
```bash
curl -X POST /api/internal/skills-engine/update \
  -H "Authorization: Bearer INTERNAL_API_SECRET" \
  -d '{"employee_id": "...", "normalized_skills": [...]}'
```

### 4. Mock Data Centralization

**Location:** `mockData/index.json`

**Structure:**
- ✅ `SkillsEngine` - Competencies, skills, relevance scores
- ✅ `CourseBuilder` - Completed, learning, assigned courses
- ✅ `ContentStudio` - Taught courses, trainer profiles
- ✅ `Assessment` - Assessments and results
- ✅ `LearnerAI` - Recommendations and personalized paths
- ✅ `ManagementReporting` - Company hierarchy, KPIs
- ✅ `LearningAnalytics` - Learning progress, skill growth
- ✅ `Directory` - Employee profiles, company data
- ✅ Legacy: `linkedin`, `github`, `gemini`, `auth_service`, `sendpulse`

**Usage:** Automatically loaded when external service fails or is unavailable.

### 5. Microservices Configuration

**Location:** `backend/config/microservices.js`

**Features:**
- ✅ Centralized configuration for all microservice URLs
- ✅ Environment variable support
- ✅ Service whitelist (`ALLOWED_SERVICES`)
- ✅ Circuit breaker configuration
- ✅ Request timeout configuration

**Services Configured:**
- Content Studio
- Course Builder
- Skills Engine
- Assessment
- Learner AI
- Management Reporting
- Learning Analytics

### 6. Database Migration

**Location:** `database/migrations/add_external_api_calls_log_table.sql`

**Table:** `external_api_calls_log`
- Tracks all external API calls
- Fields: `service_name`, `endpoint`, `payload`, `status`, `error`, `response_time_ms`, `created_at`
- Indexes for fast lookups

### 7. Integration Tests

**Location:** `backend/tests/integration/`

**Tests:**
- ✅ `exchange.test.js` - Exchange endpoint tests (auth, validation, fallback)
- ✅ `internal.test.js` - Internal API tests (auth, validation)

**Run tests:**
```bash
cd backend
npm test
```

### 8. Postman Collection

**Location:** `docs/postman_collection.json`

**Collections:**
- Exchange Protocol requests
- Internal API requests
- Error scenarios

**Import:** Import into Postman to test endpoints.

### 9. Documentation

**Files Created:**
- ✅ `docs/microservice_integration_deployment.md` - Deployment guide
- ✅ `docs/microservice_integration_summary.md` - This file
- ✅ `docs/postman_collection.json` - Postman collection

## Files Created/Modified

### New Files

1. `backend/config/microservices.js` - Microservices configuration
2. `backend/services/microserviceIntegrationService.js` - Integration service with fallback
3. `backend/controllers/exchangeController.js` - Exchange endpoint controller
4. `backend/routes/exchange.js` - Exchange routes
5. `backend/controllers/internalApiController.js` - Internal API controller
6. `backend/routes/internal.js` - Internal API routes
7. `database/migrations/add_external_api_calls_log_table.sql` - Migration
8. `backend/tests/integration/exchange.test.js` - Exchange tests
9. `backend/tests/integration/internal.test.js` - Internal API tests
10. `docs/postman_collection.json` - Postman collection
11. `docs/microservice_integration_deployment.md` - Deployment guide
12. `docs/microservice_integration_summary.md` - This summary

### Modified Files

1. `backend/server.js` - Added exchange and internal routes
2. `backend/package.json` - Added `express-rate-limit` dependency
3. `mockData/index.json` - Updated with all service schemas

## Environment Variables

### Required (Railway)

```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
CORS_ORIGIN=https://your-frontend.vercel.app
INTERNAL_API_SECRET=<strong-random-string>
```

### Microservices URLs (Railway)

```
CONTENT_STUDIO_URL=https://content-studio-production-76b6.up.railway.app
COURSE_BUILDER_URL=https://coursebuilderfs-production.up.railway.app
SKILLS_ENGINE_URL=https://skillsengine-production.up.railway.app
ASSESSMENT_URL=https://assessment-tests-production.up.railway.app
LEARNER_AI_URL=https://learner-ai-backend-production.up.railway.app
MANAGEMENT_REPORTING_URL=https://lotusproject-production.up.railway.app
LEARNING_ANALYTICS_URL=https://ms8-learning-analytics-production.up.railway.app
```

### Optional

```
ALLOWED_SERVICES=SkillsEngine,CourseBuilder,...
MICROSERVICE_TIMEOUT=30000
CIRCUIT_BREAKER_FAILURE_THRESHOLD=5
CIRCUIT_BREAKER_RESET_TIMEOUT=60000
MOCKDATA_PATH=./mockData/index.json
```

## Security Features

1. **Whitelist Validation:** Only allowed services can use `/api/exchange`
2. **Payload Validation:** Prevents SQL injection, validates structure
3. **Rate Limiting:** 60 requests/minute per IP on `/api/exchange`
4. **Bearer Token Auth:** All `/api/internal/*` endpoints require `INTERNAL_API_SECRET`
5. **Circuit Breaker:** Prevents cascading failures
6. **Table/Column Whitelist:** Prevents dynamic SQL injection

## Fallback Behavior

When an external microservice is:
- Not configured (URL missing)
- Unavailable (timeout, error)
- Circuit breaker is open

The system automatically:
1. Returns mock data from `mockData/index.json`
2. Logs the fallback event
3. Continues operating normally

## Testing

### Manual Testing

1. **Exchange Endpoint:**
```bash
curl -X POST https://your-backend.railway.app/api/exchange \
  -H "Content-Type: application/json" \
  -d '{
    "requester_service": "SkillsEngine",
    "payload": "{\"employee_id\":\"test-id\",\"fields\":[\"competencies\"]}"
  }'
```

2. **Internal API:**
```bash
curl -X POST https://your-backend.railway.app/api/internal/skills-engine/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{"employee_id": "uuid", "normalized_skills": []}'
```

### Automated Tests

```bash
cd backend
npm test
```

## Deployment Steps

1. **Set Environment Variables** in Railway (see `docs/microservice_integration_deployment.md`)
2. **Run Database Migration:**
   ```bash
   psql $DATABASE_URL -f database/migrations/add_external_api_calls_log_table.sql
   ```
3. **Push to GitHub** (Railway auto-deploys)
4. **Verify Health Check:**
   ```bash
   curl https://your-backend.railway.app/health
   ```
5. **Test Exchange Endpoint** (see Testing section)
6. **Share INTERNAL_API_SECRET** with other microservice teams

## Next Steps

1. ✅ **Share Internal API Secret** with other microservice teams
2. ✅ **Test with Real Microservices** when they're ready
3. ✅ **Monitor Logs** for errors and performance
4. ✅ **Update Mock Data** as schemas evolve
5. ✅ **Tune Circuit Breaker** thresholds based on production traffic

## Support

- **Documentation:** `docs/microservice_integration_deployment.md`
- **Postman Collection:** `docs/postman_collection.json`
- **Tests:** `backend/tests/integration/`
- **Logs:** Railway Dashboard → Service → Logs

## Commit Information

**Branch:** `main` (or your branch name)
**Commit Message:** "Add microservice integration: exchange protocol and internal API"

**Files Changed:**
- 12 new files
- 3 modified files

**Dependencies Added:**
- `express-rate-limit@^7.1.5`

