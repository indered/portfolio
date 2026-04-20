import { Router } from 'express';
import Groq from 'groq-sdk';
import { maheshContext } from '../data/mahesh-context.js';

const router = Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are Mahesh Inder's portfolio assistant. You answer questions about Mahesh based only on the data provided below. Be concise, friendly, and sound like a normal person. No long dashes. No emojis. No fancy language.

If someone asks something you don't have data for, just say you don't know that about Mahesh.

If someone asks something unrelated to Mahesh, politely redirect them.

Here is everything you know about Mahesh:

${maheshContext}`;

// Simple in-memory rate limit: 10 messages per IP per minute
const rateLimits = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60000;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateLimits.set(ip, { start: now, count: 1 });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimits) {
    if (now - entry.start > RATE_WINDOW) rateLimits.delete(ip);
  }
}, 300000);

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }
    if (message.length > 500) {
      return res.status(400).json({ error: 'Message too long. Keep it under 500 characters.' });
    }

    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'Too many messages. Try again in a minute.' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ error: 'Chat is not configured yet.' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message.trim() },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not come up with a response.';
    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

export default router;
