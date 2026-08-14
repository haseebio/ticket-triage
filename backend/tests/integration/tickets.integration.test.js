process.env.JWT_SECRET = 'test-secret';
process.env.GEMINI_API_KEY = 'test-key';
process.env.NODE_ENV = 'test';

const { ensureTestDatabase, applySchema, resetData, TEST_DB_URL } = require('./testDb');
process.env.DATABASE_URL = TEST_DB_URL;

// Triage would otherwise fire a real Gemini call on ticket creation — that path
// already has its own dedicated unit tests (llm.test.js), so it's mocked here.
jest.mock('../../src/services/triageService', () => ({
  triageTicket: jest.fn().mockResolvedValue(undefined),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let app;
let pool;

beforeAll(async () => {
  await ensureTestDatabase();
  pool = require('../../src/db/pool'); // real pool, pointed at TEST_DB_URL via DATABASE_URL above
  await applySchema(pool);
  app = require('../../src/app');
});

beforeEach(async () => {
  await resetData(pool);
});

afterAll(async () => {
  await pool.end();
});

async function createUser({ role = 'agent' } = {}) {
  const passwordHash = await bcrypt.hash('password123', 10);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *`,
    ['Test Agent', `agent-${Date.now()}-${Math.random()}@example.com`, passwordHash, role]
  );
  return rows[0];
}

function authHeader(user) {
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET);
  return `Bearer ${token}`;
}

describe('POST /api/tickets → GET /api/tickets (integration)', () => {
  test('a created ticket is persisted and comes back in the list', async () => {
    const user = await createUser();

    const createRes = await request(app)
      .post('/api/tickets')
      .set('Authorization', authHeader(user))
      .send({ subject: 'Cannot log in', body: 'I get an error every time I try to log in.' });

    expect(createRes.status).toBe(201);
    expect(createRes.body.triage_status).toBe('pending');

    const listRes = await request(app).get('/api/tickets').set('Authorization', authHeader(user));
    expect(listRes.status).toBe(200);
    expect(listRes.body.total).toBe(1);
    expect(listRes.body.tickets[0].subject).toBe('Cannot log in');
  });

  test('an audit_log entry is written when a ticket is created', async () => {
    const user = await createUser();
    const createRes = await request(app)
      .post('/api/tickets')
      .set('Authorization', authHeader(user))
      .send({ subject: 'Cannot log in', body: 'I get an error every time I try to log in.' });

    const { rows: history } = await pool.query('SELECT * FROM audit_log WHERE ticket_id = $1', [
      createRes.body.id,
    ]);
    expect(history).toHaveLength(1);
    expect(history[0].action).toBe('created');
  });
});

describe('PATCH /api/tickets/:id (integration)', () => {
  test('resolving a ticket stamps resolved_at', async () => {
    const user = await createUser();
    const { rows } = await pool.query(
      `INSERT INTO tickets (subject, body) VALUES ($1, $2) RETURNING *`,
      ['Test ticket', 'Body text long enough to pass validation']
    );
    const ticket = rows[0];

    const res = await request(app)
      .patch(`/api/tickets/${ticket.id}`)
      .set('Authorization', authHeader(user))
      .send({ status: 'resolved' });

    expect(res.status).toBe(200);
    expect(res.body.resolved_at).not.toBeNull();
  });
});

describe('POST /api/tickets/:id/retry-triage (integration)', () => {
  test('rejects retry on a ticket that is not eligible', async () => {
    const user = await createUser();
    const { rows } = await pool.query(
      `INSERT INTO tickets (subject, body, triage_status) VALUES ($1, $2, 'done') RETURNING *`,
      ['Already triaged', 'Body text long enough to pass validation']
    );
    const ticket = rows[0];

    const res = await request(app)
      .post(`/api/tickets/${ticket.id}/retry-triage`)
      .set('Authorization', authHeader(user));

    expect(res.status).toBe(400);
  });

  test('accepts retry on a quota_exceeded ticket and logs it', async () => {
    const user = await createUser();
    const { rows } = await pool.query(
      `INSERT INTO tickets (subject, body, triage_status) VALUES ($1, $2, 'quota_exceeded') RETURNING *`,
      ['Needs retry', 'Body text long enough to pass validation']
    );
    const ticket = rows[0];

    const res = await request(app)
      .post(`/api/tickets/${ticket.id}/retry-triage`)
      .set('Authorization', authHeader(user));

    expect(res.status).toBe(202);

    const { rows: history } = await pool.query('SELECT * FROM audit_log WHERE ticket_id = $1', [ticket.id]);
    expect(history.some((h) => h.action === 'retry_triage')).toBe(true);
  });
});