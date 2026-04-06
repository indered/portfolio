import { Router } from 'express';
import { body } from 'express-validator';
import Token from '../models/Token.js';
import Cause from '../models/Cause.js';
import { handleValidationErrors } from '../middleware/validate.js';

const router = Router();

// Default cause fallback when no DB document exists
const DEFAULT_CAUSE = {
  month: new Date().toISOString().slice(0, 7), // "YYYY-MM"
  title: 'Books Over Brooms',
  description: 'Supporting education for children of household helpers, washermen, and daily wage workers. The people who take care of us deserve to see their kids in classrooms, not following the same cycle.',
  tokenValue: 0.50,
  totalTokens: 0,
  active: true,
};

// Helper: get current month string "YYYY-MM"
function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// POST /api/tokens/earn - Record a token earned event
router.post(
  '/earn',
  [
    body('action')
      .notEmpty().withMessage('Action is required')
      .isIn([
        'EXPLORE_SECTION',
        'TOGGLE_THEME',
        'LEAVE_SIGNATURE',
        'CLICK_PLANET',
        'VIEW_PROJECT',
        'PLAY_MUSIC',
      ]).withMessage('Invalid action'),
    body('amount')
      .isNumeric().withMessage('Amount must be a number')
      .custom((val) => val > 0).withMessage('Amount must be positive'),
    body('geo').optional().isObject(),
    body('sessionId').optional().isString(),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { action, amount, geo, sessionId } = req.body;
      // Fire and forget — don't block the response on DB write
      Token.create({ action, amount, geo, sessionId }).catch((err) => {
        console.error('Failed to record token:', err.message);
      });
      res.status(202).json({ success: true, action, amount });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/tokens/stats - Global stats
router.get('/stats', async (req, res, next) => {
  try {
    const [aggregation, cause] = await Promise.all([
      Token.aggregate([
        {
          $group: {
            _id: null,
            totalTokens: { $sum: '$amount' },
            totalEvents: { $sum: 1 },
          },
        },
      ]),
      Cause.findOne({ month: getCurrentMonth() }),
    ]);

    const stats = aggregation[0] || { totalTokens: 0, totalEvents: 0 };
    const activeCause = cause || { ...DEFAULT_CAUSE, month: getCurrentMonth() };
    const totalValue = (stats.totalTokens * (activeCause.tokenValue || 0.10)).toFixed(2);

    res.json({
      totalTokens: stats.totalTokens,
      totalEvents: stats.totalEvents,
      totalValue: `$${totalValue}`,
      cause: {
        month: activeCause.month,
        title: activeCause.title,
        description: activeCause.description,
        tokenValue: activeCause.tokenValue,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/tokens/cause - Current month's cause details
router.get('/cause', async (req, res, next) => {
  try {
    const cause = await Cause.findOne({ month: getCurrentMonth() });
    res.json(cause || { ...DEFAULT_CAUSE, month: getCurrentMonth() });
  } catch (error) {
    next(error);
  }
});

export default router;
