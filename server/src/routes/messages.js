import { Router } from 'express';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';

const router = Router();

// POST /api/messages — save a message from a visitor
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (name.length > 100 || email.length > 200 || message.length > 2000) {
      return res.status(400).json({ error: 'Input too long.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    const msg = await Message.create({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    res.status(201).json({ id: msg._id });
  } catch (err) {
    console.error('Message save error:', err.message);
    res.status(500).json({ error: 'Could not save message.' });
  }
});

// GET /api/messages — list all messages (protected with PIN)
router.get('/', async (req, res) => {
  try {
    const pin = req.headers['x-pin'] || req.query.pin;
    if (pin !== process.env.INBOX_PIN) {
      return res.status(401).json({ error: 'Invalid PIN.' });
    }

    const messages = await Message.find().sort({ createdAt: -1 }).lean();
    res.json(messages);
  } catch (err) {
    console.error('Message list error:', err.message);
    res.status(500).json({ error: 'Could not load messages.' });
  }
});

// PATCH /api/messages/:id/read — mark as read (protected)
router.patch('/:id/read', async (req, res) => {
  try {
    const pin = req.headers['x-pin'] || req.query.pin;
    if (pin !== process.env.INBOX_PIN) {
      return res.status(401).json({ error: 'Invalid PIN.' });
    }

    await Message.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not update.' });
  }
});

// GET /api/messages/conversations — list all AI chat conversations with
// enriched analytics (protected). Each convo now carries: company, asn,
// city/region, utm_source, device fingerprint, funnel event count.
router.get('/conversations', async (req, res) => {
  try {
    const pin = req.headers['x-pin'] || req.query.pin;
    if (pin !== process.env.INBOX_PIN) {
      return res.status(401).json({ error: 'Invalid PIN.' });
    }

    const conversations = await Conversation.find()
      .sort({ updatedAt: -1 })
      .lean();

    // Bulk-fetch all events for the listed session ids in one query
    const sessionIds = conversations.map((c) => c.sessionId).filter(Boolean);
    const events = await AnalyticsEvent
      .find({ sessionId: { $in: sessionIds } }, { _id: 0, type: 1, sessionId: 1, company: 1, asn: 1, region: 1, postal: 1, fingerprint: 1, meta: 1, createdAt: 1 })
      .sort({ createdAt: 1 })
      .lean();

    const bySession = new Map();
    for (const ev of events) {
      const arr = bySession.get(ev.sessionId) || [];
      arr.push(ev);
      bySession.set(ev.sessionId, arr);
    }

    const enriched = conversations.map((c) => {
      const evs = bySession.get(c.sessionId) || [];
      // Pick the first non-null enrichment across the session's events
      const first = (key) => evs.find((e) => e[key])?.[key] || null;
      const firstMeta = (key) => evs.find((e) => e.meta?.[key])?.meta?.[key] || null;
      const funnelEvents = evs.filter((e) => e.type?.startsWith('ask_')).map((e) => ({
        type: e.type,
        at: e.createdAt,
        meta: e.meta || null,
      }));
      return {
        ...c,
        enrichment: {
          company: first('company'),
          asn: first('asn'),
          region: first('region'),
          postal: first('postal'),
          fingerprint: first('fingerprint'),
          utmSource: firstMeta('utm_source'),
          utmMedium: firstMeta('utm_medium'),
          utmCampaign: firstMeta('utm_campaign'),
          funnelEvents,
          totalEvents: evs.length,
        },
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error('Conversation list error:', err.message);
    res.status(500).json({ error: 'Could not load conversations.' });
  }
});

// DELETE /api/messages/conversations/:id — delete a specific conversation (protected)
router.delete('/conversations/:id', async (req, res) => {
  try {
    const pin = req.headers['x-pin'] || req.query.pin;
    if (pin !== process.env.INBOX_PIN) {
      return res.status(401).json({ error: 'Invalid PIN.' });
    }

    await Conversation.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('Conversation delete error:', err.message);
    res.status(500).json({ error: 'Could not delete conversation.' });
  }
});

// POST /api/messages/conversations/delete-bulk — bulk delete (protected)
router.post('/conversations/delete-bulk', async (req, res) => {
  try {
    const pin = req.headers['x-pin'] || req.query.pin;
    if (pin !== process.env.INBOX_PIN) {
      return res.status(401).json({ error: 'Invalid PIN.' });
    }
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array required.' });
    }
    const result = await Conversation.deleteMany({ _id: { $in: ids } });
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    console.error('Bulk delete error:', err.message);
    res.status(500).json({ error: 'Could not delete conversations.' });
  }
});

export default router;
