const env = require('../config/env');
const budget = require('./llmBudget');

const ENDPOINT = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const REQUEST_TIMEOUT_MS = 15000;

const TRIAGE_SCHEMA = {
  type: 'object',
  properties: {
    category: { type: 'string', enum: ['billing', 'technical', 'account', 'general'] },
    priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
    summary: { type: 'string', description: 'One or two sentence summary for an agent' },
  },
  required: ['category', 'priority', 'summary'],
};

/** Custom error carrying a machine-readable reason so callers can branch on it. */
class LlmUnavailableError extends Error {
  constructor(reason) {
    super(`LLM unavailable: ${reason}`);
    this.reason = reason;
  }
}

/**
 * Classifies a ticket via Gemini. Throws LlmUnavailableError (not a generic Error)
 * when the local budget is exhausted or the provider itself rate-limits us, so
 * triageService can mark the ticket for retry instead of treating it as a failure.
 * Any other thrown error (timeout, network failure, malformed response) is a
 * transient failure — triageService retries those once before giving up.
 */
async function classifyTicket({ subject, body }) {
  const { allowed, reason } = await budget.canProceed();
  if (!allowed) {
    throw new LlmUnavailableError(reason);
  }

  const prompt =
    'Classify this support ticket. Pick the single best category and priority, ' +
    'and write a short summary for the agent who will handle it.\n\n' +
    `Subject: ${subject}\nBody: ${body}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(ENDPOINT(env.llm.model), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.llm.apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: TRIAGE_SCHEMA,
        },
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Gemini request timed out');
    }
    throw new Error(`Gemini request failed: ${err.message}`);
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 429) {
    throw new LlmUnavailableError('provider_rate_limited');
  }
  if (!response.ok) {
    throw new Error(`Gemini request failed: ${response.status}`);
  }

  await budget.recordUsage();

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned no content');
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Gemini returned malformed JSON');
  }
}

module.exports = { classifyTicket, LlmUnavailableError };