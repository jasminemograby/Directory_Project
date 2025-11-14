# Microservice Integration - Deployment Guide

## Overview

This guide covers the deployment of the Cross-Microservice Exchange Protocol and Internal API endpoints for the Directory microservice.

## Prerequisites

- Railway account (for backend)
- Vercel account (for frontend)
- Supabase account (for database)
- Access to other microservice URLs (Skills Engine, Course Builder, etc.)

## Environment Variables Setup

### Railway (Backend)

1. Go to [Railway Dashboard](https://railway.app)
2. Select your Directory project
3. Navigate to **Settings** → **Variables**
4. Add the following variables:

#### Core Configuration
```
NODE_ENV=production
PORT=5000
```

#### Database
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

#### CORS
```
CORS_ORIGIN=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
```

#### Microservices URLs
```
CONTENT_STUDIO_URL=https://content-studio-production-76b6.up.railway.app
COURSE_BUILDER_URL=https://coursebuilderfs-production.up.railway.app
SKILLS_ENGINE_URL=https://skillsengine-production.up.railway.app
ASSESSMENT_URL=https://assessment-tests-production.up.railway.app
LEARNER_AI_URL=https://learner-ai-backend-production.up.railway.app
MANAGEMENT_REPORTING_URL=https://lotusproject-production.up.railway.app
LEARNING_ANALYTICS_URL=https://ms8-learning-analytics-production.up.railway.app
```

#### Internal API Security
```
INTERNAL_API_SECRET=<generate-strong-random-string>
```

**Generate secret:**
```bash
openssl rand -hex 32
```

#### Service Whitelist (Optional)
```
ALLOWED_SERVICES=SkillsEngine,CourseBuilder,ContentStudio,Assessment,LearnerAI,ManagementReporting,LearningAnalytics
```

#### Circuit Breaker Configuration (Optional)
```
MICROSERVICE_TIMEOUT=30000
CIRCUIT_BREAKER_FAILURE_THRESHOLD=5
CIRCUIT_BREAKER_RESET_TIMEOUT=60000
CIRCUIT_BREAKER_HALF_OPEN_MAX=3
```

#### Mock Data Path (Optional)
```
MOCKDATA_PATH=./mockData/index.json
```

### Vercel (Frontend)

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your Directory project
3. Navigate to **Settings** → **Environment Variables**
4. Add:

```
REACT_APP_API_URL=https://your-backend.railway.app/api
```

**Important:** After adding variables, trigger a new deployment.

## Database Migrations

### Run Migration for external_api_calls_log Table

1. Connect to your Supabase database
2. Run the migration:

```bash
psql $DATABASE_URL -f database/migrations/add_external_api_calls_log_table.sql
```

Or via Supabase SQL Editor:
- Go to Supabase Dashboard → SQL Editor
- Copy contents of `database/migrations/add_external_api_calls_log_table.sql`
- Execute

### Verify Migration

```sql
SELECT * FROM external_api_calls_log LIMIT 1;
```

## Deployment Steps

### 1. Backend (Railway)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add microservice integration: exchange protocol and internal API"
   git push origin main
   ```

2. **Railway will auto-deploy** (if connected to GitHub)

3. **Or manually deploy:**
   - Go to Railway Dashboard
   - Click **Deploy** button

4. **Check logs:**
   - Railway Dashboard → Deployments → View logs
   - Look for: `Directory Backend running on port 5000`

### 2. Frontend (Vercel)

1. **Push to GitHub** (if not auto-deployed)

2. **Or trigger manual deploy:**
   - Vercel Dashboard → Deployments → Redeploy

3. **Verify deployment:**
   - Check Vercel deployment URL
   - Test frontend loads correctly

## Verification

### 1. Health Check

```bash
curl https://your-backend.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "directory-backend",
  "version": "1.0.0"
}
```

### 2. Exchange Endpoint Test

```bash
curl -X POST https://your-backend.railway.app/api/exchange \
  -H "Content-Type: application/json" \
  -d '{
    "requester_service": "SkillsEngine",
    "payload": "{\"employee_id\":\"test-id\",\"fields\":[\"competencies\"]}"
  }'
```

Expected: Response with `serviceName: "SkillsEngine"` and `payload` (may be fallback mock data if service not configured).

### 3. Internal API Test

```bash
curl -X POST https://your-backend.railway.app/api/internal/skills-engine/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_INTERNAL_API_SECRET" \
  -d '{
    "employee_id": "valid-employee-uuid",
    "normalized_skills": [{"skill_name": "React", "level": "intermediate"}]
  }'
```

Expected: `{"success": true, "message": "Skills updated successfully"}`

### 4. Fallback Test

Temporarily set an invalid URL:
```bash
# In Railway, set:
SKILLS_ENGINE_URL=https://invalid-url.example.com
```

Then test exchange endpoint - should return fallback mock data.

## Monitoring

### Check API Call Logs

```sql
SELECT * FROM external_api_calls_log 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Circuit Breaker Status

Monitor logs for:
- `[CircuitBreaker] ServiceName: Circuit opened`
- `[CircuitBreaker] ServiceName: Circuit closed (recovered)`

### Railway Logs

- Railway Dashboard → Service → Logs
- Look for `[MicroserviceIntegration]` and `[Exchange]` entries

## Troubleshooting

### Issue: 403 Forbidden on /api/exchange

**Solution:** Check `ALLOWED_SERVICES` env var includes the requester service.

### Issue: 401 Unauthorized on /api/internal/*

**Solution:** Verify `INTERNAL_API_SECRET` matches in both services.

### Issue: Timeout errors

**Solution:** 
1. Check `MICROSERVICE_TIMEOUT` (default: 30000ms)
2. Verify microservice URLs are correct
3. Check network connectivity

### Issue: Fallback always used

**Possible causes:**
1. Microservice URL not configured
2. Circuit breaker is open
3. Microservice is down

**Check:**
- Railway logs for `[CircuitBreaker]` messages
- Verify `SKILLS_ENGINE_URL` (or other service URLs) are set correctly

### Issue: Migration fails

**Solution:**
1. Check database connection
2. Verify table doesn't already exist: `SELECT * FROM external_api_calls_log LIMIT 1;`
3. Run migration manually via Supabase SQL Editor

## Post-Deployment Checklist

- [ ] All environment variables set in Railway
- [ ] All environment variables set in Vercel
- [ ] Database migration executed successfully
- [ ] Health check endpoint returns 200
- [ ] Exchange endpoint responds (may use fallback)
- [ ] Internal API endpoints require authentication
- [ ] Fallback mock data works when service unavailable
- [ ] Railway logs show no startup errors
- [ ] Frontend can connect to backend API

## Next Steps

1. **Share Internal API Secret** with other microservice teams
2. **Test integration** with real microservices when available
3. **Monitor logs** for errors and performance
4. **Update mock data** in `mockData/index.json` as needed
5. **Configure circuit breaker** thresholds based on production traffic

## Support

For issues or questions:
- Check Railway logs
- Check Supabase logs
- Review `docs/PROJECT_STATUS_REPORT.md` for system status
- Test with Postman collection: `docs/postman_collection.json`

