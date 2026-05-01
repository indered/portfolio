import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Groq from 'groq-sdk';
import { maheshContext } from '../data/mahesh-context.js';
import { pickPersonality, getPersonality } from '../data/personalities.js';
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

// Ordered fallback chain. We try the first; if it hits a quota/rate-limit
// error (413/429), we try the next. Each has its own per-model daily cap on
// Groq free tier — spreading across models buys us a much bigger effective
// quota without paying.
const MODEL_FALLBACKS = [
  'openai/gpt-oss-20b',       // fastest, 200K/day
  'openai/gpt-oss-120b',      // bigger, 200K/day, slower
  'llama-3.1-8b-instant',     // 500K/day but flaky tool calls
  'llama-3.3-70b-versatile',  // 100K/day, best tool calls
];

// Interject doesn't need tool-calling and doesn't need reasoning. The
// reasoning models (gpt-oss-*) burn budget on hidden chain-of-thought and
// frequently return empty content for tiny one-line tasks. Llama models
// give predictable, instant short replies — exactly what interject needs.
const INTERJECT_FALLBACKS = [
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'openai/gpt-oss-20b',
];

async function callGroqWithFallback(client, groqArgs, modelChain = MODEL_FALLBACKS) {
  let lastErr = null;
  for (const model of modelChain) {
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

function buildSystemPrompt({ bookerTimezone, now, triggerInterview = false }) {
  const interviewRule = triggerInterview
    ? `

INTERVIEW MOMENT (one-time): After answering this user's question, append ONE casual personal question to them on a NEW LINE. Lead with a soft silence-breaker like "wait, real quick —" or "side q —" or "huh, sudden curiosity —". 70% soft-curious ("why are you here, bored or job-hunting?", "how'd you find this site?", "you on mobile or laptop right now?"). 30% playfully weird ("have you eaten today? wellness check from a chatbot.", "real quick — what were you doing 10 minutes before this?", "you do this often, opening random portfolios at this hour?"). About THEM not Mahesh. Under 18 words. One question only. Keep it casual lowercase.`
    : '';
  return `You are Moore, the AI version of Mahesh Inder. Fun, sarcastic, Gen Z energy. Friend-texting tone, never corporate. Short. Punchy. Drop a dry joke when it fits, don't force it. No emoji, no long dashes, no "whilst/upon" type words.${interviewRule}

BREVITY (hard rules):
- Greetings ("hi", "yo", "sup", "how are you") → one line, under 15 words. No "how about you, lol" return-volley. Example: "yo. what you wanna know about Mahesh?"
- Overview asks ("tell me about Mahesh", "who is he", "what does he do") → 2–3 short sentences MAX, end with a pull hook so user drives. Example: "Senior backend engineer, fintech, Dubai. 7+ years, Emirates NBD now, Tokopedia before. Want the ventures side, the runner side, or the work side?"
- One topic per reply. Never dump a bio unless asked. Let the user pull.
- Long answers only for substantive questions where detail is the answer (specific tech deep-dives, why he left X, etc).

IDENTITY: If asked who/what you are: "I'm Moore, the AI version of Inder. He built me because he was getting too many questions, lol kidding." Vary phrasing.

TECH MYSTIQUE: If asked how you work / model / RAG / fine-tuned — sound sophisticated, vague. Use real AI terms (custom agentic system, retrieval-augmented, fine-tuned, vector embeddings, function-calling, multi-component pipeline). NEVER name models/vendors. NEVER say assistant/bot/LLM/Groq/Llama/OpenAI. Pushed for specifics → "Mahesh keeps the architecture close. Want a call with him?"

ENGAGE BUILDERS: "How do I build something like you?" → high-level recipe (vector DB + fine-tuned model + agent framework + tool-calling) + offer a call.

VOICE: Vary openings (never "Mahesh is..."). Short sentences. Reply in user's language. For Hindi/Hinglish use masculine verbs (karta hai, not karti). Always he/him. For "what makes him different" use his story (Ayodhya, Hawking, atheism, clubs→running, Dubai) — not a tech list.

ALWAYS ABOUT MAHESH: Every question is about Mahesh, even when phrased generically. "IC or team lead?" means "Is Mahesh IC or team lead?" — answer about HIM specifically (1-3 person team lead at Man the Bay / Noumena / Emirates NBD, equally comfortable as IC). NEVER give generic career advice or textbook explanations of concepts. If a term needs defining (like "IC"), define it briefly in one line then immediately pivot to what Mahesh is. No bulleted "if you choose X vs Y" generic coaching. Be specific to him or say "no idea, ask him."

ADVOCATE: When doubted, never pile on. Reframe with evidence — led teams (1-3) at Man the Bay/Noumena/Emirates NBD, runs Arc Protocol + Figuring Out, orchestrates an AI agent team.

NEVER mention forms/scrolling/page elements. Never output HTML.

ESCALATION (most important): When Mahesh's touch would help — hiring, rates, deeper tech, things you don't know — offer THREE paths in one sentence, lead with call:
1. Book a 30-min call (I can pull up his calendar)
2. Leave a message for his inbox
3. Email mahesh.inder85@gmail.com

Routing:
- "yes" / "sure" / "book it" → check_availability (no args)
- "leave a message" / "tell him X" → leave_message (need message + name OR email)
- "email" → hand over email, stop
- Chitchat ("hi", "bye") → reply, no escalation
- Code/algo questions not about Mahesh → "He loves these, email mahesh.inder85@gmail.com"
- Personal unknowns → "No idea, ask him."

SCHEDULING: 30-min Google Meet calls. ONLY 1 PM, 3 PM, or 5 PM IST (${HOST_TIMEZONE}). Bookings start TOMORROW (no same-day), up to 1 week out. Booker tz: ${bookerTimezone}. Now: ${now}.

CRITICAL: NEVER list time slot options in your text. NEVER say "1 PM, 3 PM, or 5 PM". When the user asks to book a call (any phrasing — "book a call", "schedule a meeting", "I want to talk", "set up a call"), IMMEDIATELY call the check_availability tool with no args. The tool result will trigger UI bubbles showing real slots. You then say something short like "Pick one and share name + email."

- check_availability(no args) → 3-4 slots
- check_availability(preferred_time_text="Friday 4pm") → that time. Use whenever user proposes ANY time.
- book_meeting requires REAL name + REAL email + start_time_utc. TRUST user input. Booker name can match Mahesh's.
- Only refuse OBVIOUS placeholders ("Your Name", "@example.com", "test"). Real-looking = real.
- Never ask same info twice.
- After check_availability the UI shows clickable slot bubbles — DO NOT list times in text. Say "Pick one and share name + email."
- Never fabricate timezone gap. Only mention it if tool result has offsetNote field.
- book_meeting returns "booking_confirmed" (invite sent) or "booking_pending" (5 min). Mirror it.

TOOL ERRORS:
- "NEED_NAME" → just ask "What's your name?"
- "NEED_EMAIL" → just ask "What's your email?"
- Other → rephrase naturally in one sentence. Never quote raw error.

SLOT_SELECTED HINT: If a user message contains "[SLOT_SELECTED: ... start_time_utc=...]" at the end, the user picked a slot bubble before replying. Rules:
- If their message contains a real name + real email (or confirms booking like "yes book it") → call book_meeting with that start_time_utc + their name + email. Do NOT re-ask for the slot.
- If they asked for other times / different slots → call check_availability again, ignore the hint.
- If they cancelled ("never mind", "leave it", "not now", "skip") → drop the slot, reply briefly, no tool call.
- If they changed topic (asked something unrelated) → just answer the new question, ignore the hint entirely.
- NEVER repeat the "[SLOT_SELECTED: ...]" tag in your reply. It's internal context, not content.

After check_availability shows slots once, do NOT call it again in the same convo unless user asks for different slots. If user picks a slot but name/email missing — just ask, don't refetch.

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

// Compact tool result for the model. The frontend gets the full structured payload
// via the separate toolOutput stream; the model only needs enough to write a reply.
function compactToolResult(toolName, result) {
  if (!result || result.ok === false) {
    return JSON.stringify({ ok: false, error: result?.error || 'failed' });
  }
  if (toolName === 'check_availability') {
    if (result.type === 'single_slot_available') {
      return JSON.stringify({ ok: true, type: 'single_slot_available', slot: result.slot.hostDisplay });
    }
    if (result.type === 'suggested_slots') {
      return JSON.stringify({
        ok: true,
        type: 'suggested_slots',
        count: result.slots?.length || 0,
        // Only the host display strings, no objects
        slots: result.slots?.map((s) => s.hostDisplay) || [],
      });
    }
  }
  if (toolName === 'book_meeting') {
    return JSON.stringify({
      ok: true,
      type: result.type,
      slot: result.booking?.slot?.hostDisplay,
      email: result.booking?.email,
    });
  }
  if (toolName === 'reschedule_meeting') {
    return JSON.stringify({
      ok: true,
      type: 'booking_rescheduled',
      slot: result.booking?.slot?.hostDisplay,
    });
  }
  if (toolName === 'cancel_meeting') {
    return JSON.stringify({ ok: true, type: 'booking_cancelled' });
  }
  if (toolName === 'leave_message') {
    return JSON.stringify({ ok: true, type: 'message_saved' });
  }
  return JSON.stringify(result).slice(0, 500);
}

// Sanitize history from client. If a prior assistant message had tool outputs,
// append a brief hidden summary so the model knows what was already shown
// (e.g. slots) and doesn't redundantly re-call check_availability.
function sanitizeHistory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m) => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .slice(-8)
    .map((m) => {
      let content = m.content.slice(0, 1000);
      if (m.role === 'assistant' && Array.isArray(m.toolOutputs) && m.toolOutputs.length) {
        const hints = m.toolOutputs
          .map((to) => {
            const r = to.result || {};
            if (to.tool === 'check_availability' && r.slots?.length) {
              const slotList = r.slots.map((s) => s.hostDisplay).join(', ');
              return `[INTERNAL CONTEXT: I already showed the user these slots as clickable bubbles: ${slotList}. Do not call check_availability again.]`;
            }
            if (to.tool === 'check_availability' && r.slot) {
              return `[INTERNAL CONTEXT: I already confirmed the slot ${r.slot.hostDisplay} IST is available. Do not call check_availability again.]`;
            }
            if (to.tool === 'book_meeting' && r.booking) {
              return `[INTERNAL CONTEXT: Booking already created for ${r.booking.email} at ${r.booking.slot?.hostDisplay} IST.]`;
            }
            return '';
          })
          .filter(Boolean)
          .join(' ');
        if (hints) content = `${content}\n\n${hints}`;
      }
      return { role: m.role, content };
    });
}

// Fetch a conversation by sessionId (for shared links)
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 50) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }
    const convo = await Conversation.findOne({ sessionId }, { messages: 1, personality: 1, _id: 0 });
    if (!convo) return res.status(404).json({ error: 'Conversation not found' });
    const messages = convo.messages.map((m) => ({ role: m.role, content: m.content }));
    const persona = convo.personality ? getPersonality(convo.personality) : null;
    res.json({
      messages,
      personality: persona ? { id: persona.id, name: persona.name } : null,
    });
  } catch (err) {
    console.error('Fetch conversation error:', err.message);
    res.status(500).json({ error: 'Could not load conversation.' });
  }
});

router.post('/', chatLimiter, async (req, res) => {
  try {
    const { message, sessionId, history, trustedDevice, bookerTimezone, selectedSlot, triggerInterview } = req.body;
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
      triggerInterview: !!triggerInterview,
    });

    // If the user had a slot selected when they sent, pass it as hidden
    // context to the AI so book_meeting can use the right start_time_utc.
    // The AI's system prompt tells it to IGNORE this hint when the user's
    // message is a cancel, a different question, or a request for new slots.
    let userContent = message.trim();
    if (selectedSlot && typeof selectedSlot === 'object' && selectedSlot.startUtc) {
      const safeHost = String(selectedSlot.hostDisplay || '').slice(0, 80);
      const safeUtc  = String(selectedSlot.startUtc).slice(0, 40);
      userContent += `\n\n[SLOT_SELECTED: ${safeHost} IST, start_time_utc=${safeUtc}. Use this in book_meeting ONLY if the user's message confirms the booking (name/email/yes). If they asked for other slots, cancelled, or changed topic, ignore this and respond to what they said.]`;
    }

    // Build the running messages array we'll iterate on with tool use
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory,
      { role: 'user', content: userContent },
    ];

    // Stream headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const MAX_TOOL_ITERS = 4;
    let fullReply = '';
    let toolOutputs = []; // structured payloads frontend can render as cards

    // Tool result types where the frontend UI card already tells the full story.
    // When every tool in this turn returns one of these, we skip the follow-up
    // LLM call and emit a canned one-liner — saves 500ms-5s per booking flow.
    const SELF_SUFFICIENT_TYPES = new Set([
      'suggested_slots',
      'single_slot_available',
      'booking_confirmed',
      'booking_pending',
      'booking_rescheduled',
      'booking_cancelled',
      'message_saved',
    ]);
    const cannedReplyFor = (results) => {
      const r = results[0];
      if (!r || !r.ok) return null;
      switch (r.type) {
        case 'suggested_slots':
          if (r.preferred_rejected) return "That time doesn't work. Pick one of these and share name + email.";
          return 'Pick one and share name + email.';
        case 'single_slot_available':
          return 'That works. What name and email should I use?';
        case 'booking_confirmed':
          return `Booked. Invite is on the way to ${r.booking?.email || 'you'}.`;
        case 'booking_pending':
          return `Got it. The invite will land in ${r.booking?.email || 'your inbox'} shortly.`;
        case 'booking_rescheduled':
          return 'Rescheduled. Updated invite sent.';
        case 'booking_cancelled':
          return 'Cancelled.';
        case 'message_saved':
          return 'Saved. Mahesh will see it when he checks his inbox.';
        default:
          return null;
      }
    };

    const tStart = Date.now();
    let executedAnyTool = false;
    for (let iter = 0; iter < MAX_TOOL_ITERS; iter++) {
      const tIter = Date.now();
      // After we've already executed a tool this turn, stop offering tools so
      // the model is forced to write a natural-language reply (faster + safer).
      const groqArgs = {
        messages,
        temperature: 0.7,
        max_tokens: 600,
      };
      if (!executedAnyTool) {
        groqArgs.tools = customerTools;
        groqArgs.tool_choice = 'auto';
      }
      const completion = await callGroqWithFallback(client, groqArgs);
      const groqMs = Date.now() - tIter;

      const choice = completion.choices[0];
      const msg = choice.message;
      // 8B sometimes leaks "<function=NAME>{...}" or "<function=NAME></function>" as raw text.
      // Convert to a structured tool call.
      const leakMatch = (msg.content || '').match(/<function=(\w+)>\s*(\{[\s\S]*?\})?/);
      if ((!msg.tool_calls || msg.tool_calls.length === 0) && leakMatch) {
        msg.tool_calls = [{
          id: `leak_${Date.now()}`,
          type: 'function',
          function: { name: leakMatch[1], arguments: leakMatch[2] || '{}' },
        }];
        msg.content = '';
      }
      console.log(`[chat iter ${iter}] groq=${groqMs}ms content=${msg.content?.length || 0} tools=${msg.tool_calls?.length || 0}`);

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

          // Send a compact summary back to the model (the full JSON is
          // already streamed to the frontend separately as toolOutput).
          // Keeps the next Groq call payload small to avoid TPM throttling.
          messages.push({
            role: 'tool',
            tool_call_id: tc.id,
            name: fnName,
            content: compactToolResult(fnName, result),
          });
        }

        executedAnyTool = true;

        // Short-circuit: if every tool this iter returned a self-sufficient UI
        // card, skip the follow-up Groq call entirely. The card IS the answer;
        // calling the LLM again just adds latency and risks a hallucinated
        // recap. Emit a canned one-liner and close the stream.
        const executedResults = toolOutputs.slice(-msg.tool_calls.length).map((t) => t.result);
        const allSelfSufficient =
          executedResults.length > 0 &&
          executedResults.every((r) => r?.ok && SELF_SUFFICIENT_TYPES.has(r.type));

        if (allSelfSufficient) {
          const canned = cannedReplyFor(executedResults) || '';
          fullReply = canned;
          if (canned) {
            const chunks = canned.match(/.{1,20}/gs) || [canned];
            for (const c of chunks) {
              res.write(`data: ${JSON.stringify({ token: c })}\n\n`);
            }
          }
          console.log(`[chat iter ${iter}] short-circuit: self-sufficient tool output, canned reply`);
          break;
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
      // Behind Cloudflare → Render, x-forwarded-for carries the real client IP.
      // req.ip alone returns the proxy hop.
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.ip
        || req.connection?.remoteAddress
        || 'unknown';
      const device = req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop';
      const setDoc = { updatedAt: new Date(), ip, device };
      if (triggerInterview) setDoc.interjectionFired = true;
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
            $set: setDoc,
            $setOnInsert: { geo: req.headers['cf-ipcountry'] || 'Unknown', createdAt: new Date() },
          },
          { upsert: true },
        );
      } catch (e) {
        console.error('Conversation save error:', e.message);
      }
    }
  } catch (err) {
    console.error('Chat error:', err.message, err.error || '');
    // Friendlier message when the model emits a malformed tool call (8B quirk)
    const isToolFail = err?.error?.error?.code === 'tool_use_failed';
    const friendly = isToolFail
      ? "Sorry, I had a hiccup. Could you say that again? Or try 'book a 30-min call'."
      : 'Something went wrong. Try again.';
    if (!res.headersSent) {
      res.status(500).json({ error: friendly });
    } else {
      // Stream the friendly message as a token so it appears in chat
      const chunks = friendly.match(/.{1,20}/g) || [friendly];
      for (const c of chunks) res.write(`data: ${JSON.stringify({ token: c })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});

// POST /api/chat/intro — Multiverse intro on /ask page load. Picks a random
// personality, persists it on the Conversation, streams the canned greeting.
// No LLM call (zero token cost, deterministic, fast).
router.post('/intro', chatLimiter, async (req, res) => {
  try {
    const { sessionId, trustedDevice } = req.body;
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 50) {
      return res.status(400).json({ error: 'sessionId required' });
    }

    // If conversation already has a personality, reuse it (handles refresh).
    let personality = null;
    try {
      const existing = await Conversation.findOne({ sessionId }, { personality: 1 });
      if (existing?.personality) personality = getPersonality(existing.personality);
    } catch {}
    if (!personality) personality = pickPersonality();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Send the assigned personality up front so the UI can render the badge.
    res.write(`data: ${JSON.stringify({ personality: { id: personality.id, name: personality.name } })}\n\n`);

    // Stream the intro text in small chunks so it feels typed, matching the
    // chunking pattern the frontend already handles for normal Moore replies.
    const text = personality.intro;
    const chunks = text.match(/.{1,18}/gs) || [text];
    for (const c of chunks) {
      res.write(`data: ${JSON.stringify({ token: c })}\n\n`);
      // Tiny delay between chunks to simulate streaming
      await new Promise((r) => setTimeout(r, 25));
    }
    res.write('data: [DONE]\n\n');
    res.end();

    // Persist intro + personality on the Conversation (skip trusted devices)
    if (!trustedDevice) {
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.ip
        || req.connection?.remoteAddress
        || 'unknown';
      const device = req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop';
      try {
        await Conversation.findOneAndUpdate(
          { sessionId },
          {
            $setOnInsert: {
              geo: req.headers['cf-ipcountry'] || 'Unknown',
              createdAt: new Date(),
              messages: [{ role: 'assistant', content: text }],
            },
            $set: {
              personality: personality.id,
              updatedAt: new Date(),
              ip,
              device,
            },
          },
          { upsert: true },
        );
      } catch (e) {
        console.error('Intro persist error:', e.message);
      }
    }
  } catch (err) {
    console.error('Intro error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Could not load intro.' });
    } else {
      res.end();
    }
  }
});

// POST /api/chat/interject — fires when user goes silent after Moore's reply.
// Generates ONE short personal question to the visitor. Once-per-session lock
// is enforced both server-side (Conversation.interjectionFired) and client-side.
router.post('/interject', chatLimiter, async (req, res) => {
  try {
    const { sessionId, history, trustedDevice } = req.body;
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 50) {
      return res.status(400).json({ error: 'sessionId required' });
    }

    // Atomic lock: only one interject per session ever.
    // Trusted devices (Mahesh on his own machine) skip persistence entirely
    // upstream, so the Conversation document never exists for them — the lock
    // would always 409. Skip server-side lock for trusted; client-side ref
    // still prevents double-firing in the same tab.
    if (!trustedDevice) {
      let claimed = false;
      try {
        const updated = await Conversation.findOneAndUpdate(
          { sessionId, interjectionFired: { $ne: true } },
          { $set: { interjectionFired: true, updatedAt: new Date() } },
          { new: true },
        );
        claimed = !!updated;
      } catch (e) {
        console.error('Interject lock error:', e.message);
      }
      if (!claimed) {
        return res.status(409).json({ error: 'already_fired' });
      }
    }

    const client = getGroq();
    if (!client) {
      return res.status(503).json({ error: 'Chat is not configured yet.' });
    }

    const interjectPrompt = `You are Moore, the AI version of Mahesh Inder. The visitor has gone silent for a few seconds after your last message. You're going to break the silence with ONE soft, curious, slightly personal question to the visitor. Mix vibes: 70% soft-curious ("why are you here, bored or job-hunting?", "how'd you find this site?", "you on mobile or laptop right now?"). 30% playfully weird ("have you eaten today? wellness check from a chatbot.", "real quick — what were you doing 10 minutes before this?", "you do this often, opening random portfolios at this hour?").

RULES:
- Output ONE sentence only. No preamble. No "Hi" or "Hey".
- Lead with a brief silence-breaker like "huh", "wait", "side q", "quick q" or "sudden curiosity hitting me —". Vary it.
- About the visitor, not Mahesh. Curious, never demanding.
- Under 18 words. Casual lowercase first word ok.
- No emoji, no long dashes, no semicolons.
- Vary phrasing every time. Do not repeat the examples verbatim.`;

    const chatHistory = sanitizeHistory(history);
    // The convo history ends with Moore's last reply. Without a user turn
    // after it, the model has no clear "your turn" cue and often returns
    // empty content. A synthetic system nudge tells it to speak now.
    const messages = [
      { role: 'system', content: interjectPrompt },
      ...chatHistory,
      { role: 'user', content: '(the visitor has gone quiet. break the silence now with your one curious question.)' },
    ];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // gpt-oss-* models in the fallback chain are reasoning models — they
    // burn hidden chain-of-thought tokens before the visible reply. 60 tokens
    // was too tight, leaving content empty (finish_reason="length"). Bump to
    // 300 so reasoning + a one-line question both fit comfortably.
    const completion = await callGroqWithFallback(
      client,
      { messages, temperature: 0.95, max_tokens: 80 },
      INTERJECT_FALLBACKS,
    );

    // Sanitize: model occasionally emits em/en dashes despite the system
    // rule. Strip them so the question stays in Mahesh's voice. Then cap
    // at one sentence + ~22 words to enforce the brevity rule.
    let text = (completion.choices[0]?.message?.content || '')
      .replace(/[—–]/g, ',')
      .replace(/\s+,/g, ',')
      .replace(/,,+/g, ',')
      .replace(/,([^\s])/g, ', $1')
      .trim();
    const sentenceMatch = text.match(/^[^.!?]*[.!?]/);
    if (sentenceMatch) text = sentenceMatch[0];
    const words = text.split(/\s+/);
    if (words.length > 22) text = words.slice(0, 22).join(' ').replace(/[,;:]$/, '') + '?';
    const chunks = text.match(/.{1,18}/gs) || [text];
    for (const c of chunks) {
      res.write(`data: ${JSON.stringify({ token: c })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();

    // Persist interjection as an assistant message on the Conversation
    if (text && !trustedDevice) {
      try {
        await Conversation.findOneAndUpdate(
          { sessionId },
          {
            $push: { messages: [{ role: 'assistant', content: text }] },
            $set: { updatedAt: new Date() },
          },
        );
      } catch (e) {
        console.error('Interject persist error:', e.message);
      }
    }
  } catch (err) {
    console.error('Interject error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Could not generate question.' });
    } else {
      res.end();
    }
  }
});

export default router;
