const { Router } = require('express');
const budget = require('../services/llmBudget');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.get('/llm-budget', authenticate, async (req, res, next) => {
  try {
    res.json(await budget.getStatus());
  } catch (err) {
    next(err);
  }
});

module.exports = router;