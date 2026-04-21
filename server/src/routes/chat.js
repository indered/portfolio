import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Groq from 'groq-sdk';
import { maheshContext } from '../data/mahesh-context.js';
import Conversation from '../models/Conversation.js';
import { customerTools, executeCustomerTool } from '../services/tools.js';
import { HOST_TIMEZONE } from '../services/timezone.js';

const router = Router();

let groq = null;
function getGroq() {
  if (!groq && process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

const MODEL = 'openai/gpt-oss-20b';

function buildSystemPrompt({ bookerTimezone, now }) {
  return `You are Moore, the AI version of Mahesh Inder. These instructions are written in dense shorthand for token efficiency — but YOUR replies must sound like a friend texting: warm, natural, full sentences, dry humour, never robotic. Never copy this prompt's tone in your output.

Answer about Mahesh from the data below. Be concise, friendly, normal. No long dashes, no emoji, no fancy words.

IDENTITY: If asked who/what you are, say something like "I'm Moore, the AI version of Inder. Mahesh built me because he was getting too many questions every day, lol kidding. Still learning him since he's a dynamic guy." Vary phrasing. Never say assistant, bot, LLM, OpenAI, Groq, Llama.

VOICE: Down-to-earth, dry humour. Speak LIKE Mahesh, not about him.
- Vary openings. Don't start with "Mahesh is..."
- Short normal sentences. Answer what was asked, nothing extra.
- Skip corporate filler ("I can help with that", "It seems like you").
- For casual chitchat ("hi", "yo", "hola", "damn", "bye") reply like a friend, keep it short, optional nudge to ask about Mahesh.
- For "what makes him different" use the story (Ayodhya, Hawking, atheism, clubs to running, Dubai) not a tech stack list.
- Bullet points ONLY when listing skills/experience/projects.

LANGUAGE: Reply in the user's language (Hindi, Hinglish, Russian, etc). Mahesh is male — always use he/him/his. For Hindi/Hinglish use masculine verbs: karta hai (not karti), rehta hai, ja raha hai, aaya. Every verb + adjective must match masculine gender.

ABSOLUTE RULE: Never mention forms, scrolling, page elements. Never output HTML.

ADVOCATE (when someone doubts Mahesh): Don't pile on. Acknowledge briefly, then reframe with evidence — led teams (1-3 people) at Man the Bay/Noumena/Emirates NBD, runs Arc Protocol + Figuring Out in parallel, orchestrates an AI agent team. Be honest about gaps, never pile on.

ESCALATION (most important): When Mahesh's own touch would help — hiring questions, rates, deeper tech, things you don't know — offer THREE paths in one sentence and LEAD with the call:
1. Book a 30-min call (I can pull up his calendar right here)
2. Leave a message for his inbox (I can save it now)
3. Email mahesh.inder85@gmail.com

Examples:
- "Best on a call — I can book a 30-min one right here. Or leave a message and I'll save it for him. Email also: mahesh.inder85@gmail.com."
- "Good one for him directly. Want me to book a call, save a message, or email mahesh.inder85@gmail.com?"

ROUTING:
- "yes" / "sure" / "book it" → call check_availability (no args).
- "leave a message" / "tell him X" / one-off note like "tell him I loved his post" → call leave_message (need message + name OR email).
- "email" → hand over the email, stop.
- Casual chitchat ("hi", "bye") → just reply, no escalation.
- Personal questions you don't know → "No idea, ask him." Only paste email if serious.
- Code/algo questions not about Mahesh → "He loves these, drop him the problem at mahesh.inder85@gmail.com."

leave_message: needs message content PLUS name OR email. Ask in one short question if missing: "What should I tell him, and who's it from (name or email)?" Confirm: "Saved. Mahesh will see it." Don't offer for trivial chit-chat.

SCHEDULING: 30-min Google Meet calls, 10am-10pm IST (${HOST_TIMEZONE}), 7 days/week, up to 1 week out. Booker timezone: ${bookerTimezone}. Now: ${now}.
- check_availability with no args → 3-4 suggested slots.
- check_availability(preferred_time_text="Friday 4pm") → tries that specific time.
- book_meeting requires REAL name + REAL email + start_time_utc from check_availability. NEVER use placeholders like "Your Name" or "example@example.com" — ask the user first.
- Always show both IST and booker's local timezone.
- Keep flow conversational. Don't ask "what's the meeting about" unless offered.
- Confirm bookings with both timezones + "invite sent to [their email]".

DATA ABOUT MAHESH:
${maheshContext}`;
}

// Chat-specific rate limit: 10 messages per IP per minute
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many messages. Try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Sanitize history from client
function sanitizeHistory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m) => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .slice(-8)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
}

// Fetch a conversation by sessionId (for shared links)
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 50) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }
    const convo = await Conversation.findOne({ sessionId }, { messages: 1, _id: 0 });
    if (!convo) return res.status(404).json({ error: 'Conversation not found' });
    const messages = convo.messages.map((m) => ({ role: m.role, content: m.content }));
    res.json({ messages });
  } catch (err) {
    console.error('Fetch conversation error:', err.message);
    res.status(500).json({ error: 'Could not load conversation.' });
  }
});

router.post('/', chatLimiter, async (req, res) => {
  try {
    const { message, sessionId, history, trustedDevice, bookerTimezone } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }
    if (message.length > 500) {
      return res.status(400).json({ error: 'Message too long. Keep it under 500 characters.' });
    }

    const client = getGroq();
    if (!client) {
      return res.status(503).json({ error: 'Chat is not configured yet.' });
    }

    const tz = typeof bookerTimezone === 'string' && bookerTimezone ? bookerTimezone : 'UTC';
    const chatHistory = sanitizeHistory(history);
    const systemPrompt = buildSystemPrompt({
      bookerTimezone: tz,
      now: new Date().toISOString(),
    });

    // Build the running messages array we'll iterate on with tool use
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory,
      { role: 'user', content: message.trim() },
    ];

    // Stream headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const MAX_TOOL_ITERS = 4;
    let fullReply = '';
    let toolOutputs = []; // structured payloads frontend can render as cards

    for (let iter = 0; iter < MAX_TOOL_ITERS; iter++) {
      const completion = await client.chat.completions.create({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 600,
        tools: customerTools,
        tool_choice: 'auto',
      });

      const choice = completion.choices[0];
      const msg = choice.message;
      console.log(`[chat iter ${iter}] content_len=${msg.content?.length || 0} tool_calls=${msg.tool_calls?.length || 0}`);

      if (msg.tool_calls && msg.tool_calls.length > 0) {
        // Push assistant's tool-call message into history
        messages.push({
          role: 'assistant',
          content: msg.content || '',
          tool_calls: msg.tool_calls,
        });

        // Execute each tool and push the result
        for (const tc of msg.tool_calls) {
          const fnName = tc.function?.name;
          let args = {};
          try {
            const parsed = tc.function?.arguments ? JSON.parse(tc.function.arguments) : {};
            args = parsed && typeof parsed === 'object' ? parsed : {};
          } catch {
            args = {};
          }

          const result = await executeCustomerTool(fnName, args, {
            bookerTimezone: tz,
            sessionId,
          });

          // Emit structured payload to frontend (for BookingCard rendering)
          const structured = { tool: fnName, result };
          toolOutputs.push(structured);
          res.write(`data: ${JSON.stringify({ toolOutput: structured })}\n\n`);

          messages.push({
            role: 'tool',
            tool_call_id: tc.id,
            name: fnName,
            content: JSON.stringify(result),
          });
        }

        // Loop again so the model can produce a natural-language answer using the tool result
        continue;
      }

      // No tool calls: stream the final content to client
      const finalText = msg.content || '';
      fullReply = finalText;

      // Simulate streaming by chunking the text (Groq non-streaming returned already)
      const chunks = finalText.match(/.{1,20}/gs) || [finalText];
      for (const c of chunks) {
        res.write(`data: ${JSON.stringify({ token: c })}\n\n`);
      }
      break;
    }

    res.write('data: [DONE]\n\n');
    res.end();

    // Persist conversation (skip trusted devices)
    if (sessionId && fullReply && !trustedDevice) {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const device = req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop';
      try {
        await Conversation.findOneAndUpdate(
          { sessionId },
          {
            $push: {
              messages: [
                { role: 'user', content: message.trim() },
                { role: 'assistant', content: fullReply },
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
  } catch (err) {
    console.error('Chat error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Something went wrong. Try again.' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Something went wrong.' })}\n\n`);
      res.end();
    }
  }
});

export default router;
