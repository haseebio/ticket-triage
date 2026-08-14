const env = require('../config/env');
const pool = require('../db/pool');

// Per-minute window stays in memory — it's checked on every ticket creation, so a
// DB round-trip here would add real latency for negligible benefit. A false reset
// on redeploy just means a slightly-too-early rate-limit relaxation: low stakes.
let minuteWindowStart = Date.now();
let requestsThisMinute = 0;

function rollMinuteWindow() {
  const now = Date.now();
  if (now - minuteWindowStart >= 60_000) {
    minuteWindowStart = now;
    requestsThisMinute = 0;
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/** Reads today's persisted request count, creating today's row if it doesn't exist yet. */
async function getTodayCount() {
  await pool.query(
    `INSERT INTO llm_usage (day_key, request_count) VALUES ($1, 0)
     ON CONFLICT (day_key) DO NOTHING`,
    [todayKey()]
  );
  const { rows } = await pool.query(
    'SELECT request_count FROM llm_usage WHERE day_key = $1',
    [todayKey()]
  );
  return rows[0]?.request_count ?? 0;
}

/** Call before every LLM request. Returns { allowed, reason }. */
async function canProceed() {
  rollMinuteWindow();

  if (requestsThisMinute >= env.llm.maxRequestsPerMinute) {
    return { allowed: false, reason: 'rate_limited' };
  }

  const requestsToday = await getTodayCount();
  if (requestsToday >= env.llm.maxRequestsPerDay) {
    return { allowed: false, reason: 'daily_quota_exceeded' };
  }

  return { allowed: true, reason: null };
}

/** Call after a successful LLM request to consume budget. */
async function recordUsage() {
  requestsThisMinute += 1;

  await pool.query(
    `INSERT INTO llm_usage (day_key, request_count) VALUES ($1, 1)
     ON CONFLICT (day_key) DO UPDATE SET request_count = llm_usage.request_count + 1, updated_at = now()`,
    [todayKey()]
  );
}

async function getStatus() {
  rollMinuteWindow();
  const requestsToday = await getTodayCount();
  return {
    requestsThisMinute,
    requestsToday,
    limitPerMinute: env.llm.maxRequestsPerMinute,
    limitPerDay: env.llm.maxRequestsPerDay,
  };
}

module.exports = { canProceed, recordUsage, getStatus };