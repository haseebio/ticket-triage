const { validationResult } = require('express-validator');

/** Wraps an array of express-validator checks; short-circuits with 400 on failure. */
function validate(checks) {
  return async (req, res, next) => {
    await Promise.all(checks.map((check) => check.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    next();
  };
}

module.exports = validate;
