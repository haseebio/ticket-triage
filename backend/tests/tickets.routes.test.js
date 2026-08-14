process.env.DATABASE_URL = 'postgresql://test';
process.env.JWT_SECRET = 'test-secret';
process.env.GEMINI_API_KEY = 'test-key';
process.env.NODE_ENV = 'test';

jest.mock('../src/db/pool', () => ({ query: jest.fn() }));
jest.mock('../src/services/triageService', () => ({
  triageTicket: jest.fn().mockResolvedValue(undefined),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const pool = require('../src/db/pool');

function authHeader(overrides = {}) {
  const token = jwt.sign(
    { id: 1, role: 'agent', name: 'Test Agent', ...overrides },
    process.env.JWT_SECRET
  );
  return `Bearer ${token}`;
}

describe('GET /api/tickets', () => {
  test('rejects requests with no token', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(401);
  });

  test('rejects requests with a malformed token', async () => {
    const res = await request(app).get('/api/tickets').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  test('returns paginated tickets for an authenticated request', async () => {
    // listTickets now runs a COUNT(*) query first, then the paginated SELECT.
    pool.query
      .mockResolvedValueOnce({ rows: [{ count: '1' }] })
      .mockResolvedValueOnce({ rows: [{ id: 1, subject: 'Cannot log in' }] });

    const res = await request(app).get('/api/tickets').set('Authorization', authHeader());
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      tickets: [{ id: 1, subject: 'Cannot log in' }],
      total: 1,
      page: 1,
      limit: 20,
    });
  });
});

describe('POST /api/tickets', () => {
  test('rejects a body shorter than the minimum length', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', authHeader())
      .send({ subject: 'Help', body: 'short' });

    expect(res.status).toBe(400);
  });

  test('creates a ticket and schedules triage without blocking the response', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 42, subject: 'Cannot log in', triage_status: 'pending' }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', authHeader())
      .send({ subject: 'Cannot log in', body: 'I get an error every time I try to log in.' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(42);

    const { triageTicket } = require('../src/services/triageService');
    expect(triageTicket).toHaveBeenCalledWith(42);
  });
});

describe('PATCH /api/tickets/:id', () => {
  test('rejects an invalid status value', async () => {
    const res = await request(app)
      .patch('/api/tickets/1')
      .set('Authorization', authHeader())
      .send({ status: 'not-a-real-status' });

    expect(res.status).toBe(400);
  });
});