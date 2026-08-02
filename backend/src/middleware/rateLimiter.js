const rateLimit = require('express-rate-limit');

// Baseline protection for all API routes.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again shortly.' },
});

// Tighter limit on ticket creation specifically, since each one can trigger an LLM call —
// this protects the free-tier LLM budget from being drained by request volume alone,
// independent of the per-minute/per-day budget tracked in llmBudget.js.
const triageLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many ticket submissions. Please slow down.' },
});

module.exports = { apiLimiter, triageLimiter };
