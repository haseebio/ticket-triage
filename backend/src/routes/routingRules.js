const { Router } = require('express');
const { body } = require('express-validator');
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, c.name AS category_name, u.name AS assignee_name
       FROM routing_rules r
       JOIN categories c ON c.id = r.category_id
       LEFT JOIN users u ON u.id = r.assignee_id
       ORDER BY c.name, r.min_priority`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  validate([
    body('categoryId').isInt(),
    body('assigneeId').isInt(),
    body('minPriority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  ]),
  async (req, res, next) => {
    try {
      const { categoryId, assigneeId, minPriority } = req.body;
      const { rows } = await pool.query(
        `INSERT INTO routing_rules (category_id, assignee_id, min_priority)
         VALUES ($1, $2, $3) RETURNING *`,
        [categoryId, assigneeId, minPriority ?? 'low']
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id',
  validate([
    body('assigneeId').optional().isInt(),
    body('minPriority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('isActive').optional().isBoolean(),
  ]),
  async (req, res, next) => {
    try {
      const { assigneeId, minPriority, isActive } = req.body;
      const { rows } = await pool.query(
        `UPDATE routing_rules SET
           assignee_id = COALESCE($1, assignee_id),
           min_priority = COALESCE($2, min_priority),
           is_active = COALESCE($3, is_active)
         WHERE id = $4 RETURNING *`,
        [assigneeId ?? null, minPriority ?? null, isActive ?? null, req.params.id]
      );
      if (!rows[0]) return res.status(404).json({ error: 'Routing rule not found' });
      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM routing_rules WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Routing rule not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;