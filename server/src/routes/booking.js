import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { findSuggestedSlots } from '../services/googleCalendar.js';
import { formatSlotDual } from '../services/timezone.js';

const router = Router();

// Rate limit: 30 requests per IP per minute. The slot chip can legitimately be
// clicked a few times, but a runaway loop should bounce off this.
const slotsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

// Direct slot fetch — zero LLM involvement. Used by the "Book a 30-min call"
// suggestion chip on /ask to make the primary demo click feel native. The
// chat endpoint still handles every other booking path.
router.get('/slots', slotsLimiter, async (req, res) => {
  try {
    const bookerTimezone =
      typeof req.query.tz === 'string' && req.query.tz ? req.query.tz : 'UTC';

    const slots = await findSuggestedSlots(4);
    const formatted = slots.map((s) => formatSlotDual(s, bookerTimezone));

    res.json({
      ok: true,
      type: 'suggested_slots',
      slots: formatted,
      message: `Found ${formatted.length} available slots over the next 7 days.`,
    });
  } catch (err) {
    console.error('Slots endpoint error:', err.message);
    res.status(500).json({ ok: false, error: 'Could not load slots.' });
  }
});

export default router;
