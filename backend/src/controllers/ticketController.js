const pool = require('../db/pool');
const { triageTicket } = require('../services/triageService');

async function listTickets(req, res, next) {
  try {
    const { status, category } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
    const offset = (page - 1) * limit;

    const conditions = [];
    const values = [];

    if (status) {
      values.push(status);
      conditions.push(`t.status = $${values.length}`);
    }
    if (category) {
      values.push(category);
      conditions.push(`c.name = $${values.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) FROM tickets t
       LEFT JOIN categories c ON c.id = t.category_id
       ${where}`,
      values
    );
    const total = parseInt(countRows[0].count, 10);

    const { rows } = await pool.query(
      `SELECT t.*, c.name AS category_name, u.name AS assignee_name
       FROM tickets t
       LEFT JOIN categories c ON c.id = t.category_id
       LEFT JOIN users u ON u.id = t.assignee_id
       ${where}
       ORDER BY t.created_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, offset]
    );

    res.json({ tickets: rows, total, page, limit });
  } catch (err) {
    next(err);
  }
}

async function getTicket(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, c.name AS category_name, u.name AS assignee_name
       FROM tickets t
       LEFT JOIN categories c ON c.id = t.category_id
       LEFT JOIN users u ON u.id = t.assignee_id
       WHERE t.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Ticket not found' });

    const { rows: history } = await pool.query(
      'SELECT * FROM audit_log WHERE ticket_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );
    res.json({ ...rows[0], history });
  } catch (err) {
    next(err);
  }
}

async function createTicket(req, res, next) {
  try {
    const { subject, body, requesterEmail, source } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO tickets (subject, body, requester_email, source)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [subject, body, requesterEmail ?? null, source ?? 'form']
    );
    const ticket = rows[0];

    await pool.query(
      "INSERT INTO audit_log (ticket_id, actor, action) VALUES ($1, 'system', 'created')",
      [ticket.id]
    );

    res.status(201).json(ticket);

    // Triage runs after the response is sent — the requester shouldn't wait on an LLM
    // call, and a slow/failed classification shouldn't turn into a failed submission.
    triageTicket(ticket.id).catch((err) => console.error('Triage failed to start:', err));
  } catch (err) {
    next(err);
  }
}

async function updateTicket(req, res, next) {
  try {
    const { status, assigneeId } = req.body;
    const { rows } = await pool.query(
      `UPDATE tickets SET
         status = COALESCE($1, status),
         assignee_id = COALESCE($2, assignee_id),
         resolved_at = CASE
           WHEN $1 = 'resolved' THEN now()
           WHEN $1 IS NOT NULL THEN NULL
           ELSE resolved_at
         END,
         updated_at = now()
       WHERE id = $3 RETURNING *`,
      [status ?? null, assigneeId ?? null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Ticket not found' });

    await pool.query(
      "INSERT INTO audit_log (ticket_id, actor, action, details) VALUES ($1, $2, 'status_changed', $3)",
      [req.params.id, req.user.name, JSON.stringify(req.body)]
    );

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function retryTriage(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM tickets WHERE id = $1', [req.params.id]);
    const ticket = rows[0];
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    if (!['quota_exceeded', 'failed'].includes(ticket.triage_status)) {
      return res.status(400).json({ error: 'Ticket is not eligible for retry' });
    }

    await pool.query(
      "INSERT INTO audit_log (ticket_id, actor, action) VALUES ($1, $2, 'retry_triage')",
      [ticket.id, req.user.name]
    );

    res.status(202).json({ message: 'Retry triggered' });

    // Same fire-and-forget pattern as createTicket — the caller doesn't wait on the LLM.
    triageTicket(ticket.id).catch((err) => console.error('Retry triage failed to start:', err));
  } catch (err) {
    next(err);
  }
}

module.exports = { listTickets, getTicket, createTicket, updateTicket, retryTriage };