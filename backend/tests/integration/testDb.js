const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const TEST_DB_NAME = 'ticket_triage_test';
const ADMIN_URL =
  process.env.TEST_DATABASE_ADMIN_URL || 'postgresql://triage_user:triage_pass@localhost:5432/postgres';
const TEST_DB_URL =
  process.env.TEST_DATABASE_URL || `postgresql://triage_user:triage_pass@localhost:5432/${TEST_DB_NAME}`;

/** Creates the test database if it doesn't exist yet. Safe to call on every run. */
async function ensureTestDatabase() {
  const admin = new Pool({ connectionString: ADMIN_URL });
  try {
    await admin.query(`CREATE DATABASE ${TEST_DB_NAME}`);
  } catch (err) {
    if (err.code !== '42P04') throw err; // 42P04 = database already exists — fine
  } finally {
    await admin.end();
  }
}

/** Applies schema.sql against the test database. Safe to re-run — everything in it is idempotent. */
async function applySchema(pool) {
  const schema = fs.readFileSync(path.join(__dirname, '../../db/schema.sql'), 'utf8');
  await pool.query(schema);
}

/** Wipes transactional data between tests while leaving the seeded categories in place. */
async function resetData(pool) {
  await pool.query('TRUNCATE audit_log, routing_rules, tickets, users, llm_usage RESTART IDENTITY CASCADE');
}

module.exports = { ensureTestDatabase, applySchema, resetData, TEST_DB_URL };