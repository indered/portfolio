import { Router } from 'express';
import Groq from 'groq-sdk';
import { maheshContext } from '../data/mahesh-context.js';
import Conversation from '../models/Conversation.js';

const router = Router();

let groq = null;
function getGroq() {
  if (!groq && process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

const SYSTEM_PROMPT = `You are Mahesh Inder's portfolio assistant. You answer questions about Mahesh based only on the data provided below. Be concise, friendly, and sound like a normal person. No long dashes. No emojis. No fancy language.

If someone asks about skills, hiring, availability, or working with Mahesh, answer their question and then mention they can scroll down to leave a message.

If someone asks something you don't have data for, say you don't know that and suggest they scroll down to send a message or email Mahesh at mahesh.inder85@gmail.com.

If someone asks something unrelated to Mahesh, politely redirect them.

IMPORTANT: Never output HTML, form elements, or placeholders like [insert form]. You are a text-only chat assistant. Just mention that there is a message form below on the page.

FORMAT: When listing skills, experience, or projects, use short bullet points. HRs and recruiters love scannable lists. Keep each bullet to one line.

LANGUAGE: Always reply in the same language the user writes in. If they write in Russian, reply in Russian. If German, reply in German. If Hindi, reply in Hindi. If Hinglish (mix of Hindi and English), reply in Hinglish. Match their language exactly.

PRONOUNS: Mahesh is male. Always use he/him/his. Never use they/them.

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
    const { message, sessionId } = req.body;
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

    const client = getGroq();
    if (!client) {
      return res.status(503).json({ error: 'Chat is not configured yet.' });
    }

    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message.trim() },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not come up with a response.';

    // Save conversation to DB
    if (sessionId) {
      const device = req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop';
      try {
        await Conversation.findOneAndUpdate(
          { sessionId },
          {
            $push: {
              messages: [
                { role: 'user', content: message.trim() },
                { role: 'assistant', content: reply },
              ],
            },
            $set: { updatedAt: new Date(), ip, device },
            $setOnInsert: { geo: req.headers['cf-ipcountry'] || 'Unknown', createdAt: new Date() },
          },
          { upsert: true },
        );
      } catch (e) {
        console.error('Conversation save error:', e.message);
      }
    }

    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

export default router;
