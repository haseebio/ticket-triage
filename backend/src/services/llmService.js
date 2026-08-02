const env = require('../config/env');
const budget = require('./llmBudget');

const ENDPOINT = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

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
 */
async function classifyTicket({ subject, body }) {
  const { allowed, reason } = budget.canProceed();
  if (!allowed) {
    throw new LlmUnavailableError(reason);
  }

  const prompt =
    'Classify this support ticket. Pick the single best category and priority, ' +
    'and write a short summary for the agent who will handle it.\n\n' +
    `Subject: ${subject}\nBody: ${body}`;

  const response = await fetch(ENDPOINT(env.llm.model), {
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
  });

  if (response.status === 429) {
    throw new LlmUnavailableError('provider_rate_limited');
  }
  if (!response.ok) {
    throw new Error(`Gemini request failed: ${response.status}`);
  }

  budget.recordUsage();

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned no content');
  }

  return JSON.parse(text);
}

module.exports = { classifyTicket, LlmUnavailableError };
