import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body, query } from 'express-validator';
import Signature from '../models/Signature.js';
import { handleValidationErrors } from '../middleware/validate.js';

const router = Router();

// Separate rate limiter for POST: 3 per hour per IP
const signatureRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { error: 'Too many signatures. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/guestbook - Create a quantum signature
router.post(
  '/',
  signatureRateLimit,
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ max: 50 }).withMessage('Name must be 50 characters or less'),
    body('strokes')
      .isArray({ min: 1 }).withMessage('Strokes are required')
      .custom((strokes) => {
        // Count total points across all strokes
        const totalPoints = strokes.reduce((sum, stroke) => {
          if (!Array.isArray(stroke)) return sum;
          return sum + stroke.length;
        }, 0);
        if (totalPoints > 5000) {
          throw new Error('Signature too complex. Maximum 5000 points allowed.');
        }
        return true;
      }),
    body('color')
      .optional()
      .matches(/^#[0-9a-fA-F]{6}$/).withMessage('Color must be a valid hex color'),
    body('compressed')
      .optional()
      .isBoolean(),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { name, strokes, color, compressed } = req.body;
      const signature = await Signature.create({ name, strokes, color, compressed });
      res.status(201).json(signature);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/guestbook - List signatures (paginated, newest first)
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const page = req.query.page || 1;
      const limit = Math.min(req.query.limit || 20, 50);
      const skip = (page - 1) * limit;

      const [signatures, total] = await Promise.all([
        Signature.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Signature.countDocuments(),
      ]);

      res.json({
        signatures,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
