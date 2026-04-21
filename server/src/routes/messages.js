import { Router } from 'express';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

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

// GET /api/messages/conversations — list all AI chat conversations (protected)
router.get('/conversations', async (req, res) => {
  try {
    const pin = req.headers['x-pin'] || req.query.pin;
    if (pin !== process.env.INBOX_PIN) {
      return res.status(401).json({ error: 'Invalid PIN.' });
    }

    const conversations = await Conversation.find()
      .sort({ updatedAt: -1 })
      .lean();
    res.json(conversations);
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

export default router;
