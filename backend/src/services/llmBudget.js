const env = require('../config/env');

// Single-process, in-memory counters. Good enough for one backend instance;
// a multi-instance deployment would move this to Redis instead.
let minuteWindowStart = Date.now();
let requestsThisMinute = 0;
let dayKey = new Date().toISOString().slice(0, 10);
let requestsToday = 0;

function rollWindows() {
  const now = Date.now();
  if (now - minuteWindowStart >= 60_000) {
    minuteWindowStart = now;
    requestsThisMinute = 0;
  }

  const today = new Date().toISOString().slice(0, 10);
  if (today !== dayKey) {
    dayKey = today;
    requestsToday = 0;
  }
}

/** Call before every LLM request. Returns { allowed, reason }. */
function canProceed() {
  rollWindows();

  if (requestsToday >= env.llm.maxRequestsPerDay) {
    return { allowed: false, reason: 'daily_quota_exceeded' };
  }
  if (requestsThisMinute >= env.llm.maxRequestsPerMinute) {
    return { allowed: false, reason: 'rate_limited' };
  }
  return { allowed: true, reason: null };
}

/** Call after a successful LLM request to consume budget. */
function recordUsage() {
  requestsThisMinute += 1;
  requestsToday += 1;
}

function getStatus() {
  rollWindows();
  return {
    requestsThisMinute,
    requestsToday,
    limitPerMinute: env.llm.maxRequestsPerMinute,
    limitPerDay: env.llm.maxRequestsPerDay,
  };
}

module.exports = { canProceed, recordUsage, getStatus };
