process.env.DATABASE_URL = 'postgresql://test';
process.env.JWT_SECRET = 'test-secret';
process.env.GEMINI_API_KEY = 'test-key';
process.env.NODE_ENV = 'test';

describe('llmBudget', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.LLM_MAX_REQUESTS_PER_MINUTE = '2';
    process.env.LLM_MAX_REQUESTS_PER_DAY = '10';
  });

  test('allows requests under the per-minute limit', () => {
    const budget = require('../src/services/llmBudget');
    expect(budget.canProceed()).toEqual({ allowed: true, reason: null });
    budget.recordUsage();
    expect(budget.canProceed().allowed).toBe(true);
  });

  test('blocks with a specific reason once the per-minute limit is hit', () => {
    const budget = require('../src/services/llmBudget');
    budget.recordUsage();
    budget.recordUsage();
    expect(budget.canProceed()).toEqual({ allowed: false, reason: 'rate_limited' });
  });

  test('blocks with a distinct reason once the daily limit is hit', () => {
    process.env.LLM_MAX_REQUESTS_PER_MINUTE = '50';
    process.env.LLM_MAX_REQUESTS_PER_DAY = '3';
    jest.resetModules();
    const budget = require('../src/services/llmBudget');
    budget.recordUsage();
    budget.recordUsage();
    budget.recordUsage();
    expect(budget.canProceed()).toEqual({ allowed: false, reason: 'daily_quota_exceeded' });
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

    const llmService = require('../src/services/llmService');
    const budget = require('../src/services/llmBudget');
    budget.recordUsage();
    budget.recordUsage();

    await expect(llmService.classifyTicket({ subject: 'x', body: 'y' })).rejects.toMatchObject({
      reason: 'daily_quota_exceeded',
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
