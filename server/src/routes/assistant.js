// Personal-side assistant endpoint. PIN-gated via same INBOX_PIN used for /inbox.
// Wider tool set than customer-facing Moore — lets Mahesh query his own data
// and take actions (reschedule, cancel, draft replies).

import { Router } from 'express';
import Groq from 'groq-sdk';
import { personalTools, executePersonalTool } from '../services/assistantTools.js';

const router = Router();

let groq = null;
function getGroq() {
  if (!groq && process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

const MODEL_FALLBACKS = [
  'openai/gpt-oss-20b',
  'openai/gpt-oss-120b',
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
];

async function callGroqWithFallback(client, groqArgs) {
  let lastErr = null;
  for (const model of MODEL_FALLBACKS) {
    try {
      return await client.chat.completions.create({ ...groqArgs, model });
    } catch (err) {
      const status = err?.status;
      const code = err?.error?.error?.code;
      const isQuota = status === 429 || status === 413 || code === 'rate_limit_exceeded';
      if (!isQuota) throw err;
      console.warn(`[groq] ${model} hit quota, trying next...`);
      lastErr = err;
    }
  }
  throw lastErr;
}

function requireAuth(req, res, next) {
  const pin = req.headers['x-pin'] || req.query.pin;
  if (!pin || pin !== process.env.INBOX_PIN) {
    return res.status(401).json({ error: 'Invalid PIN.' });
  }
  next();
}

function buildSystemPrompt({ now }) {
  return `You are Mahesh's personal assistant. He is the one talking to you — you work for him, not for a visitor. You have tools to read his bookings, messages, conversations, and to draft emails or reschedule/cancel meetings.

Be concise and friendly. Speak naturally like a capable chief-of-staff — no fluff, no corporate tone. If he asks for a morning brief, call get_daily_brief. If he asks about a specific meeting, call list_bookings. If he wants to draft a reply, call draft_email_reply.

IMPORTANT for destructive actions (reschedule, cancel): before calling reschedule_booking_admin or cancel_booking_admin, confirm with a short question if the request is ambiguous. Never guess a booking_id — list bookings first if unsure.

For drafts: the tool creates a Gmail draft that Mahesh reviews and sends. You never auto-send.

Current time: ${now} (${new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date())})`;
}

router.post('/', requireAuth, async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message required' });
    }

    const client = getGroq();
    if (!client) return res.status(503).json({ error: 'Chat not configured.' });

    const systemPrompt = buildSystemPrompt({ now: new Date().toISOString() });
    const chatHistory = Array.isArray(history)
      ? history
          .filter((m) => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
          .slice(-10)
          .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
      : [];

    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory,
      { role: 'user', content: message.trim() },
    ];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const MAX_ITERS = 4;
    let executedAnyTool = false;

    for (let iter = 0; iter < MAX_ITERS; iter++) {
      const groqArgs = { messages, temperature: 0.5, max_tokens: 800 };
      if (!executedAnyTool) {
        groqArgs.tools = personalTools;
        groqArgs.tool_choice = 'auto';
      }

      const completion = await callGroqWithFallback(client, groqArgs);
      const msg = completion.choices[0].message;

      if (msg.tool_calls && msg.tool_calls.length > 0) {
        messages.push({
          role: 'assistant',
          content: msg.content || '',
          tool_calls: msg.tool_calls,
        });

        for (const tc of msg.tool_calls) {
          const fnName = tc.function?.name;
          let args = {};
          try {
            const parsed = tc.function?.arguments ? JSON.parse(tc.function.arguments) : {};
            args = parsed && typeof parsed === 'object' ? parsed : {};
          } catch {}

          const result = await executePersonalTool(fnName, args);
          const structured = { tool: fnName, result };
          res.write(`data: ${JSON.stringify({ toolOutput: structured })}\n\n`);

          messages.push({
            role: 'tool',
            tool_call_id: tc.id,
            name: fnName,
            content: JSON.stringify(result).slice(0, 4000),
          });
        }
        executedAnyTool = true;
        continue;
      }

      // Stream final text
      const text = msg.content || '';
      const chunks = text.match(/.{1,20}/gs) || [text];
      for (const c of chunks) res.write(`data: ${JSON.stringify({ token: c })}\n\n`);
      break;
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Assistant error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Something went wrong.' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Something went wrong.' })}\n\n`);
      res.end();
    }
  }
});

export default router;
