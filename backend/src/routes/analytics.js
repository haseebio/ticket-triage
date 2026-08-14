const { Router } = require('express');
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.get('/summary', authenticate, async (req, res, next) => {
  try {
    const [byCategory, byStatus, avgResolution, overTime] = await Promise.all([
      pool.query(
        `SELECT c.name AS category, COUNT(t.id)::int AS count
         FROM tickets t
         JOIN categories c ON c.id = t.category_id
         GROUP BY c.name
         ORDER BY count DESC`
      ),
      pool.query(
        `SELECT status, COUNT(*)::int AS count
         FROM tickets
         GROUP BY status
         ORDER BY count DESC`
      ),
      pool.query(
        `SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) AS avg_hours
         FROM tickets
         WHERE resolved_at IS NOT NULL`
      ),
      pool.query(
        `SELECT date_trunc('day', created_at)::date AS day, COUNT(*)::int AS count
         FROM tickets
         WHERE created_at >= now() - interval '14 days'
         GROUP BY day
         ORDER BY day`
      ),
    ]);

    res.json({
      byCategory: byCategory.rows,
      byStatus: byStatus.rows,
      avgResolutionHours: avgResolution.rows[0]?.avg_hours
        ? Number(avgResolution.rows[0].avg_hours.toFixed(1))
        : null,
      overTime: overTime.rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;