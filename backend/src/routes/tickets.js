const { Router } = require('express');
const { body } = require('express-validator');
const {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
  retryTriage,
} = require('../controllers/ticketController');
const { authenticate } = require('../middleware/auth');
const { triageLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');

const router = Router();

router.use(authenticate);

router.get('/', listTickets);
router.get('/:id', getTicket);

router.post(
  '/',
  triageLimiter,
  validate([
    body('subject').trim().isLength({ min: 3, max: 255 }),
    body('body').trim().isLength({ min: 10 }),
    body('requesterEmail').optional().isEmail(),
    body('source').optional().isIn(['email', 'form', 'manual']),
  ]),
  createTicket
);

router.patch(
  '/:id',
  validate([
    body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']),
    body('assigneeId').optional().isInt(),
  ]),
  updateTicket
);

router.post('/:id/retry-triage', triageLimiter, retryTriage);

module.exports = router;