// tests/appointments.test.js
const request = require('supertest');
const app     = require('../src/server');

// Mock Supabase
jest.mock('../src/config/supabase', () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockResolvedValue({ data: [], count: 0, error: null }),
  single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
}));

// Mock auth middleware
jest.mock('../src/middleware/auth', () => ({
  authenticate: (req, res, next) => { req.user = { id: 'test-user-id' }; next(); },
  requireAdmin: (req, res, next) => next(),
}));

describe('Appointment Routes', () => {
  describe('GET /api/appointments', () => {
    it('returns 200 with paginated data', async () => {
      const res = await request(app).get('/api/appointments');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
    });
  });

  describe('POST /api/appointments', () => {
    it('returns 422 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .send({ title: 'Test' }); // missing customer_id, type, scheduled_at
      expect(res.status).toBe(422);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 422 for invalid UUID customer_id', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .send({ customer_id: 'not-a-uuid', title: 'Test', type: 'demo', scheduled_at: new Date().toISOString() });
      expect(res.status).toBe(422);
    });
  });

  describe('GET /health', () => {
    it('returns 200 health check', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});

describe('Lead Routes', () => {
  describe('GET /api/leads', () => {
    it('returns 200', async () => {
      const res = await request(app).get('/api/leads');
      expect(res.status).toBe(200);
    });
  });
});

describe('Customer Routes', () => {
  describe('GET /api/customers', () => {
    it('returns 200', async () => {
      const res = await request(app).get('/api/customers');
      expect(res.status).toBe(200);
    });
  });
});
