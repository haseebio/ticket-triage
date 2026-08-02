const { Router } = require('express');
const budget = require('../services/llmBudget');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.get('/llm-budget', authenticate, (req, res) => {
  res.json(budget.getStatus());
});

module.exports = router;
