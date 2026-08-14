process.env.DATABASE_URL = 'postgresql://test';
process.env.JWT_SECRET = 'test-secret';
process.env.GEMINI_API_KEY = 'test-key';
process.env.NODE_ENV = 'test';

jest.mock('../src/db/pool', () => ({ query: jest.fn() }));

/** Wires the mocked pool to behave like a real llm_usage table backed by a single counter. */
function mockDayCounter(pool, startingCount = 0) {
  let count = startingCount;
  pool.query.mockImplementation((sql) => {
    if (sql.includes('VALUES ($1, 1)')) {
      count += 1;
      return Promise.resolve({ rows: [] });
    }
    if (sql.includes('SELECT request_count')) {
      return Promise.resolve({ rows: [{ request_count: count }] });
    }
    return Promise.resolve({ rows: [] });
  });
}

describe('llmBudget', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.LLM_MAX_REQUESTS_PER_MINUTE = '2';
    process.env.LLM_MAX_REQUESTS_PER_DAY = '10';
  });

  test('allows requests under the per-minute limit', async () => {
    const pool = require('../src/db/pool');
    mockDayCounter(pool);
    const budget = require('../src/services/llmBudget');

    expect(await budget.canProceed()).toEqual({ allowed: true, reason: null });
    await budget.recordUsage();
    expect((await budget.canProceed()).allowed).toBe(true);
  });

  test('blocks with a specific reason once the per-minute limit is hit', async () => {
    const pool = require('../src/db/pool');
    mockDayCounter(pool);
    const budget = require('../src/services/llmBudget');

    await budget.recordUsage();
    await budget.recordUsage();
    expect(await budget.canProceed()).toEqual({ allowed: false, reason: 'rate_limited' });
  });

  test('blocks with a distinct reason once the daily limit is hit', async () => {
    process.env.LLM_MAX_REQUESTS_PER_MINUTE = '50';
    process.env.LLM_MAX_REQUESTS_PER_DAY = '3';
    jest.resetModules();
    const pool = require('../src/db/pool');
    mockDayCounter(pool);
    const budget = require('../src/services/llmBudget');

    await budget.recordUsage();
    await budget.recordUsage();
    await budget.recordUsage();
    expect(await budget.canProceed()).toEqual({ allowed: false, reason: 'daily_quota_exceeded' });
  });
});

describe('llmService.classifyTicket', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.LLM_MAX_REQUESTS_PER_MINUTE = '5';
    process.env.LLM_MAX_REQUESTS_PER_DAY = '5';
    global.fetch = jest.fn();
  });

  test('parses a successful structured response into category/priority/summary', async () => {
    const pool = require('../src/db/pool');
    mockDayCounter(pool);

    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    category: 'billing',
                    priority: 'high',
                    summary: 'Customer wants a refund.',
                  }),
                },
              ],
            },
          },
        ],
      }),
    });

    const llmService = require('../src/services/llmService');
    const result = await llmService.classifyTicket({ subject: 'Refund', body: 'I need a refund' });

    expect(result).toEqual({ category: 'billing', priority: 'high', summary: 'Customer wants a refund.' });
  });

  test('throws a typed error when the provider itself rate-limits the request', async () => {
    const pool = require('../src/db/pool');
    mockDayCounter(pool);
    global.fetch.mockResolvedValue({ ok: false, status: 429 });

    const llmService = require('../src/services/llmService');
    await expect(llmService.classifyTicket({ subject: 'x', body: 'y' })).rejects.toMatchObject({
      reason: 'provider_rate_limited',
    });
  });

  test('stops before calling the API once the local daily budget is exhausted', async () => {
    process.env.LLM_MAX_REQUESTS_PER_DAY = '2';
    jest.resetModules();
    global.fetch = jest.fn();

    const pool = require('../src/db/pool');
    mockDayCounter(pool, 2);

    const llmService = require('../src/services/llmService');
    await expect(llmService.classifyTicket({ subject: 'x', body: 'y' })).rejects.toMatchObject({
      reason: 'daily_quota_exceeded',
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('retries once on a transient failure, then succeeds', async () => {
    const pool = require('../src/db/pool');
    mockDayCounter(pool);

    global.fetch
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            { content: { parts: [{ text: JSON.stringify({ category: 'general', priority: 'low', summary: 'ok' }) }] } },
          ],
        }),
      });

    const { classifyTicket } = require('../src/services/llmService');
    // First call fails (500), simulating the first of triageService's two attempts.
    await expect(classifyTicket({ subject: 'x', body: 'y' })).rejects.toThrow('Gemini request failed: 500');
    // Second call (the retry) succeeds.
    const result = await classifyTicket({ subject: 'x', body: 'y' });
    expect(result.category).toBe('general');
  });
});