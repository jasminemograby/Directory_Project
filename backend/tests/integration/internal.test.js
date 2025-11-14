// Integration tests for /api/internal/* endpoints
const request = require('supertest');
const app = require('../../server');

describe('POST /api/internal/*', () => {
  const validToken = process.env.INTERNAL_API_SECRET || 'test-secret-token';

  describe('Authentication', () => {
    it('should reject request without Authorization header', async () => {
      const response = await request(app)
        .post('/api/internal/skills-engine/update')
        .send({
          employee_id: 'test-id'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Authorization');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .post('/api/internal/skills-engine/update')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          employee_id: 'test-id'
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid');
    });
  });

  describe('POST /api/internal/skills-engine/update', () => {
    it('should reject request without employee_id', async () => {
      const response = await request(app)
        .post('/api/internal/skills-engine/update')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          normalized_skills: []
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('employee_id');
    });

    it('should reject request with non-existent employee_id', async () => {
      const response = await request(app)
        .post('/api/internal/skills-engine/update')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          employee_id: '00000000-0000-0000-0000-000000000000',
          normalized_skills: []
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('POST /api/internal/content-studio/update', () => {
    it('should reject request without required fields', async () => {
      const response = await request(app)
        .post('/api/internal/content-studio/update')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          course_name: 'Test Course'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required fields');
    });
  });

  describe('POST /api/internal/course-builder/feedback', () => {
    it('should reject request without required fields', async () => {
      const response = await request(app)
        .post('/api/internal/course-builder/feedback')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          feedback: 'Great course!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required fields');
    });
  });
});

