const pool = require('../db/pool');
const { classifyTicket, LlmUnavailableError } = require('./llmService');

const MAX_ATTEMPTS = 2;

async function logAudit(client, ticketId, actor, action, details) {
  await client.query(
    'INSERT INTO audit_log (ticket_id, actor, action, details) VALUES ($1, $2, $3, $4)',
    [ticketId, actor, action, details ? JSON.stringify(details) : null]
  );
}

/** Finds the active routing rule for a category whose min_priority the ticket meets. */
async function resolveAssignee(client, categoryId, priority) {
  const priorityRank = { low: 0, medium: 1, high: 2, urgent: 3 };
  const { rows } = await client.query(
    `SELECT assignee_id, min_priority FROM routing_rules
     WHERE category_id = $1 AND is_active = true`,
    [categoryId]
  );
  const match = rows.find((rule) => priorityRank[priority] >= priorityRank[rule.min_priority]);
  return match?.assignee_id ?? null;
}

/**
 * Calls classifyTicket, retrying once on transient failures (timeout, network error,
 * malformed response). Budget/rate-limit errors (LlmUnavailableError) are never
 * retried here — retrying immediately won't help, so those propagate straight up
 * to be marked quota_exceeded.
 */
async function classifyWithRetry(ticket) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await classifyTicket({ subject: ticket.subject, body: ticket.body });
    } catch (err) {
      if (err instanceof LlmUnavailableError) throw err;
      lastErr = err;
      if (attempt < MAX_ATTEMPTS) continue;
    }
  }
  throw lastErr;
}

/** Runs AI triage for a ticket and writes the outcome back. Never throws — the
 *  ticket's triage_status always reflects what happened. */
async function triageTicket(ticketId) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    const ticket = rows[0];
    if (!ticket) return;

    await client.query('UPDATE tickets SET triage_status = $1 WHERE id = $2', [
      'processing',
      ticketId,
    ]);

    const result = await classifyWithRetry(ticket);

    const { rows: categoryRows } = await client.query(
      'SELECT id FROM categories WHERE name = $1',
      [result.category]
    );
    const categoryId = categoryRows[0]?.id ?? null;
    const assigneeId = categoryId
      ? await resolveAssignee(client, categoryId, result.priority)
      : null;

    await client.query(
      `UPDATE tickets
       SET category_id = $1, priority = $2, ai_summary = $3, assignee_id = $4,
           triage_status = 'done', updated_at = now()
       WHERE id = $5`,
      [categoryId, result.priority, result.summary, assigneeId, ticketId]
    );

    await logAudit(client, ticketId, 'ai', 'triaged', result);
    if (assigneeId) await logAudit(client, ticketId, 'system', 'routed', { assigneeId });
  } catch (err) {
    const isQuota = err instanceof LlmUnavailableError;
    const status = isQuota ? 'quota_exceeded' : 'failed';

    await client.query('UPDATE tickets SET triage_status = $1, updated_at = now() WHERE id = $2', [
      status,
      ticketId,
    ]);
    await logAudit(client, ticketId, 'system', 'triage_error', {
      reason: isQuota ? err.reason : err.message,
    });
  } finally {
    client.release();
  }
}

module.exports = { triageTicket };