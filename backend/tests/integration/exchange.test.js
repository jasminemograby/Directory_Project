// Integration tests for /api/exchange endpoint
const request = require('supertest');
const app = require('../../server');

describe('POST /api/exchange', () => {
  describe('Authentication and Authorization', () => {
    it('should reject request without requester_service', async () => {
      const response = await request(app)
        .post('/api/exchange')
        .send({
          payload: JSON.stringify({ employee_id: 'test-id' })
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('requester_service');
    });

    it('should reject unauthorized requester_service', async () => {
      // Set ALLOWED_SERVICES to only allow specific services
      process.env.ALLOWED_SERVICES = 'SkillsEngine,CourseBuilder';

      const response = await request(app)
        .post('/api/exchange')
        .send({
          requester_service: 'UnauthorizedService',
          payload: JSON.stringify({ employee_id: 'test-id' })
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not authorized');

      // Reset
      delete process.env.ALLOWED_SERVICES;
    });
  });

  describe('Payload Validation', () => {
    it('should reject invalid JSON in payload', async () => {
      const response = await request(app)
        .post('/api/exchange')
        .send({
          requester_service: 'SkillsEngine',
          payload: 'invalid json{'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid JSON');
    });

    it('should reject payload with SQL injection attempts', async () => {
      const response = await request(app)
        .post('/api/exchange')
        .send({
          requester_service: 'SkillsEngine',
          payload: JSON.stringify({
            sql: 'DROP TABLE employees;'
          })
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not allowed');
    });
  });

  describe('Service Integration', () => {
    it('should return fallback mock data when service is not configured', async () => {
      // Temporarily remove service URL
      const originalUrl = process.env.SKILLS_ENGINE_URL;
      delete process.env.SKILLS_ENGINE_URL;

      const response = await request(app)
        .post('/api/exchange')
        .send({
          requester_service: 'SkillsEngine',
          payload: JSON.stringify({
            employee_id: 'test-employee-id',
            fields: ['competencies', 'relevance_score']
          })
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.serviceName).toBe('SkillsEngine');
      expect(response.body.source).toContain('fallback');

      // Restore
      if (originalUrl) {
        process.env.SKILLS_ENGINE_URL = originalUrl;
      }
    });

    it('should handle timeout gracefully and return fallback', async () => {
      // Set a very short timeout
      process.env.MICROSERVICE_TIMEOUT = '100';

      const response = await request(app)
        .post('/api/exchange')
        .send({
          requester_service: 'SkillsEngine',
          payload: JSON.stringify({
            employee_id: 'test-employee-id'
          })
        });

      // Should either succeed with fallback or timeout
      expect([200, 503]).toContain(response.status);

      // Reset
      delete process.env.MICROSERVICE_TIMEOUT;
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Make 65 requests (over the 60/min limit)
      const requests = Array(65).fill(null).map(() =>
        request(app)
          .post('/api/exchange')
          .send({
            requester_service: 'SkillsEngine',
            payload: JSON.stringify({ employee_id: 'test-id' })
          })
      );

      const responses = await Promise.all(requests);
      
      // At least one should be rate limited
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    }, 10000); // Increase timeout for this test
  });
});

