const { Router } = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');
const validate = require('../middleware/validate');

const router = Router();

router.post(
  '/register',
  validate([
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
  ]),
  register
);

router.post(
  '/login',
  validate([body('email').isEmail().normalizeEmail(), body('password').notEmpty()]),
  login
);

module.exports = router;
