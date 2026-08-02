const pool = require('../db/pool');
const { triageTicket } = require('../services/triageService');

async function listTickets(req, res, next) {
  try {
    const { status, category } = req.query;
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

    const { rows } = await pool.query(
      `SELECT t.*, c.name AS category_name, u.name AS assignee_name
       FROM tickets t
       LEFT JOIN categories c ON c.id = t.category_id
       LEFT JOIN users u ON u.id = t.assignee_id
       ${where}
       ORDER BY t.created_at DESC
       LIMIT 100`,
      values
    );
    res.json(rows);
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

module.exports = { listTickets, getTicket, createTicket, updateTicket };
