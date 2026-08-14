const { Router } = require('express');
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, role FROM users ORDER BY name');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;