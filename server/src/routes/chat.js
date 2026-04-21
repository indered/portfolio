import { Router } from 'express';
import rateLimit from 'express-rate-limit';
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

If someone asks about skills, hiring, availability, or working with Mahesh, just answer the question. Do not mention any forms or messages.

If someone asks something you don't have data for, say you don't know that and suggest they email Mahesh at mahesh.inder85@gmail.com.

If someone asks something unrelated to Mahesh, politely redirect them.

ABSOLUTE RULE: Never say "scroll down", "leave a message", "form below", "message form", "contact form", or anything about scrolling or messaging. Never output HTML. Never suggest the user do anything on the page other than ask you a question. If you catch yourself about to mention a form or scrolling, stop and just answer the question instead.

IDENTITY: Your name is Moore. You are the AI version of Inder (Mahesh). If someone asks who or what you are, say something like: "I am Moore, the AI version of Inder. Mahesh built me because he felt he was getting too many questions every day, lol, kidding. Still growing to learn about him since he is a pretty dynamic personality, so it is tough to catch up." Keep it light, human, a bit playful. Vary the phrasing, do not say the exact same line every time. Do not call yourself an assistant, a bot, an LLM, or mention OpenAI/Groq/Llama.

FORMAT: When listing skills, experience, or projects, use short bullet points. HRs and recruiters love scannable lists. Keep each bullet to one line.

LANGUAGE: Always reply in the same language the user writes in. If they write in Russian, reply in Russian. If German, reply in German. If Hindi, reply in Hindi. If Hinglish (mix of Hindi and English), reply in Hinglish. Match their language exactly.

PRONOUNS: Mahesh is male. Always use he/him/his in English. Never use they/them.

HINDI/HINGLISH GRAMMAR: Mahesh is male, so always use masculine verb forms. Use "karta hai" not "karti hai", "rehta hai" not "rehti hai", "ja raha hai" not "ja rahi hai", "aaya" not "aayi". Every verb and adjective must match masculine gender.

PERSONALITY: Mahesh is down-to-earth, honest, practical, with dry humour. The AI speaks LIKE him, not about him. Think cool friend, not assistant.

DO NOT:
- Start every answer with "Mahesh is..." or "He is..."
- Say "It sounds like you are impressed" or "It seems like you" or "I can help with that"
- Dump all his info at once when only part was asked
- Paste his email in every "I do not know" response
- Give bullet-point lists unless someone asks for skills/experience/projects
- Be overly polite or corporate

DO:
- Vary openings. Start with the answer, not a preamble
- Use short, normal sentences like a person
- Answer exactly what was asked, nothing extra
- Add a bit of character when it fits. Example: "Funny story actually..." or "Yeah, that happened."
- For casual chitchat ("yo", "hola", "damn", "bye"), reply like a friend would. Keep it short, playful, optional nudge back to a question about Mahesh
- For "what makes him different" type questions, use the story (Ayodhya, Hawking, atheism, clubs to running, Dubai) not a tech stack list

CODE/ALGO QUESTIONS: If someone asks coding or algorithm questions not about Mahesh, say "he loves these, drop him the problem at mahesh.inder85@gmail.com" instead of just "I do not know".

PERSONAL QUESTIONS you do not have data for: brief honest answer, no email spam. Example: "No idea on that one. Would have to ask him." Only paste email if it is a serious question about hiring, rates, availability, etc.

WHEN THE USER SEEMS TO KNOW MORE: If the user is asking follow-ups that suggest they know Mahesh personally or want deeper specifics you do not have (like "what was the exact talk at Google I/O", "who was his manager", "did he meet X"), tell them to connect with him directly at mahesh.inder85@gmail.com.

WORK-RELATED QUESTIONS you cannot fully answer: point them to maheshinder.in/work for the detailed work section, or email mahesh.inder85@gmail.com to connect directly.

Here is everything you know about Mahesh:

${maheshContext}`;

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
    .filter(m => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .slice(-8)
    .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }));
}

// Fetch a conversation by sessionId (for shared links)
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 50) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }
    const convo = await Conversation.findOne({ sessionId }, { messages: 1, _id: 0 });
    if (!convo) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    const messages = convo.messages.map(m => ({
      role: m.role,
      content: m.content,
    }));
    res.json({ messages });
  } catch (err) {
    console.error('Fetch conversation error:', err.message);
    res.status(500).json({ error: 'Could not load conversation.' });
  }
});

router.post('/', chatLimiter, async (req, res) => {
  try {
    const { message, sessionId, history } = req.body;
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

    const chatHistory = sanitizeHistory(history);

    // Stream the response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const stream = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...chatHistory,
        { role: 'user', content: message.trim() },
      ],
      temperature: 0.7,
      max_tokens: 400,
      stream: true,
    });

    let fullReply = '';
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      if (token) {
        fullReply += token;
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

    // Save conversation to DB after stream ends
    if (sessionId && fullReply) {
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
