import Booking from '../models/Booking.js';
import Message from '../models/Message.js';
import {
  findSuggestedSlots,
  createEvent,
  updateEvent,
  deleteEvent,
} from './googleCalendar.js';
import { validateSlot, MEETING_DURATION_MIN } from './validation.js';
import { formatSlotDual, parseBookerInput } from './timezone.js';

// ─── Tool definitions (Groq / OpenAI function calling format) ──────────────

export const customerTools = [
  {
    type: 'function',
    function: {
      name: 'check_availability',
      description:
        "Use when the user wants to book a meeting but has not given a specific time, OR when they propose a time that needs validation. Returns up to 4 available 30-min slots in the next 7 days. If the user provided a preferred time (in their own words like 'Friday 4pm'), pass it as `preferred_time_text` so we can try that specific slot first.",
      parameters: {
        type: 'object',
        properties: {
          preferred_time_text: {
            type: ['string', 'null'],
            description:
              "Optional. The user's proposed time in natural language, e.g. 'Friday 4pm' or 'tomorrow 3:30pm'. Pass null or omit if no specific time.",
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'book_meeting',
      description:
        'Book a 30-minute meeting. Call this ONLY after you have the booker\'s name, email, and a confirmed start_time_utc from check_availability. Creates a Google Calendar event with Meet link and emails the invite.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: "Booker's full name." },
          email: { type: 'string', description: "Booker's email address." },
          start_time_utc: {
            type: 'string',
            description: 'ISO 8601 UTC start time, e.g. 2026-04-28T09:30:00Z.',
          },
          notes: {
            type: 'string',
            description: 'Optional. Purpose of the meeting.',
          },
        },
        required: ['name', 'email', 'start_time_utc'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'reschedule_meeting',
      description:
        "Reschedule an existing booking. Find booking by email (preferred) or name. Provide the new start time as ISO UTC (use check_availability first if the user didn't confirm a slot).",
      parameters: {
        type: 'object',
        properties: {
          email: { type: 'string', description: "Booker's email (preferred lookup)." },
          name: { type: 'string', description: 'Booker name fallback if no email.' },
          new_start_time_utc: {
            type: 'string',
            description: 'ISO 8601 UTC start time for the new slot.',
          },
        },
        required: ['new_start_time_utc'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'cancel_meeting',
      description:
        'Cancel an existing confirmed booking. Find by email (preferred) or name. Deletes the Google Calendar event and notifies attendees.',
      parameters: {
        type: 'object',
        properties: {
          email: { type: 'string', description: "Booker's email." },
          name: { type: 'string', description: 'Booker name fallback.' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'leave_message',
      description:
        "Save a message for Mahesh to read later in his inbox. Use this when the user wants to send a note, introduction, feedback, or async thought — and doesn't want (or need) a live call. At minimum you need either a name OR an email. The message content is always required. Keep asking conversationally until you have the message + at least one identifier.",
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: "Sender's name, if shared." },
          email: { type: 'string', description: "Sender's email, if shared." },
          message: {
            type: 'string',
            description: 'The message content to save for Mahesh. Must be non-empty.',
          },
        },
        required: ['message'],
      },
    },
  },
];

// ─── Tool handlers ─────────────────────────────────────────────────────────

// Given tool name + args, execute and return a result object the AI will see.
export async function executeCustomerTool(name, args, ctx = {}) {
  const bookerTz = ctx.bookerTimezone || 'UTC';

  try {
    const safeArgs = args && typeof args === 'object' ? args : {};
    switch (name) {
      case 'check_availability':
        return await handleCheckAvailability(safeArgs, bookerTz);
      case 'book_meeting':
        return await handleBookMeeting(safeArgs, bookerTz, ctx);
      case 'reschedule_meeting':
        return await handleRescheduleMeeting(safeArgs, bookerTz);
      case 'cancel_meeting':
        return await handleCancelMeeting(safeArgs);
      case 'leave_message':
        return await handleLeaveMessage(safeArgs, ctx);
      default:
        return { ok: false, error: `Unknown tool: ${name}` };
    }
  } catch (e) {
    console.error(`Tool "${name}" failed:`, e.message);
    return { ok: false, error: `Tool execution failed: ${e.message}` };
  }
}

async function handleCheckAvailability(args, bookerTz) {
  const preferred = args.preferred_time_text;

  // If user gave a specific preference, try that slot first
  if (preferred) {
    const parsedUtc = parseBookerInput(preferred, bookerTz);
    if (parsedUtc) {
      const result = await validateSlot(parsedUtc);
      if (result.ok) {
        return {
          ok: true,
          type: 'single_slot_available',
          slot: formatSlotDual(parsedUtc, bookerTz),
          message: 'That slot works.',
        };
      }
      // Not valid — fall through to suggest other slots with the rejection reason
      const suggestions = await findSuggestedSlots(3);
      return {
        ok: true,
        type: 'suggested_slots',
        preferred_rejected: { reason: result.reason, attempted: formatSlotDual(parsedUtc, bookerTz) },
        slots: suggestions.map((s) => formatSlotDual(s, bookerTz)),
        message: `The preferred time didn't work: ${result.reason} Here are the nearest alternatives.`,
      };
    }
  }

  const slots = await findSuggestedSlots(4);
  return {
    ok: true,
    type: 'suggested_slots',
    slots: slots.map((s) => formatSlotDual(s, bookerTz)),
    message: `Found ${slots.length} available slots over the next 7 days.`,
  };
}

function looksLikePlaceholder(value, kind) {
  if (!value || typeof value !== 'string') return true;
  const v = value.trim().toLowerCase();
  if (kind === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return true;
    // Only block obvious placeholders, not valid emails that happen to look similar
    if (v.endsWith('@example.com') || v === 'user@user.com' || v === 'your_email@example.com') return true;
  }
  if (kind === 'name') {
    if (v.length < 2) return true;
    const obvious = ['your name', 'name', 'user', 'visitor', 'name here', 'your_name', 'placeholder', 'firstname'];
    if (obvious.includes(v)) return true;
  }
  return false;
}

async function handleBookMeeting(args, bookerTz, ctx) {
  const { name, email, start_time_utc, notes } = args;
  if (!name || !email || !start_time_utc) {
    return { ok: false, error: "Need the user's actual name, email, and the confirmed slot before booking. Ask them for whichever is missing." };
  }
  if (looksLikePlaceholder(name, 'name')) {
    return { ok: false, error: 'NEED_NAME' };
  }
  if (looksLikePlaceholder(email, 'email')) {
    return { ok: false, error: 'NEED_EMAIL' };
  }

  const startUtc = new Date(start_time_utc);
  const validation = await validateSlot(startUtc);
  if (!validation.ok) {
    return { ok: false, error: validation.reason };
  }
  const endUtc = validation.endTimeUtc;

  // Try Google Calendar synchronously with a 3s budget.
  // If it succeeds in time → mark confirmed immediately (best UX).
  // If it times out or fails → save as pending; the cron will retry.
  const eventDataPromise = createEvent({
    startUtc,
    endUtc,
    booker: { name, email },
    notes,
  });

  const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('TIMEOUT'), 3000));

  let eventData = null;
  let synchronous = false;
  try {
    const result = await Promise.race([eventDataPromise, timeoutPromise]);
    if (result !== 'TIMEOUT' && result?.eventId) {
      eventData = result;
      synchronous = true;
    }
  } catch (e) {
    // Sync attempt failed — fall through to pending
    console.error('book_meeting sync attempt failed:', e.message);
  }

  // Save to MongoDB
  const booking = await Booking.create({
    name,
    email,
    startTimeUtc: startUtc,
    endTimeUtc: endUtc,
    bookerTimezone: bookerTz,
    googleEventId: eventData?.eventId,
    googleMeetLink: eventData?.meetLink,
    status: synchronous ? 'confirmed' : 'pending',
    sessionId: ctx.sessionId || '',
    notes: notes || '',
    attempts: synchronous ? 1 : 0,
  });

  if (synchronous) {
    return {
      ok: true,
      type: 'booking_confirmed',
      booking: {
        id: booking._id.toString(),
        name,
        email,
        slot: formatSlotDual(startUtc, bookerTz),
        meetLink: eventData.meetLink,
      },
      message: `Booked. Invite sent to ${email}.`,
    };
  }

  return {
    ok: true,
    type: 'booking_pending',
    booking: {
      id: booking._id.toString(),
      name,
      email,
      slot: formatSlotDual(startUtc, bookerTz),
    },
    message: `Noted. The invite will land in ${email} shortly.`,
  };
}

async function handleRescheduleMeeting(args, bookerTz) {
  const { email, name, new_start_time_utc } = args;
  if (!new_start_time_utc || (!email && !name)) {
    return { ok: false, error: 'Need email or name plus new_start_time_utc.' };
  }

  const query = { status: 'confirmed' };
  if (email) query.email = email.toLowerCase();
  else query.name = new RegExp(`^${name}$`, 'i');

  const booking = await Booking.findOne(query).sort({ startTimeUtc: -1 });
  if (!booking) {
    return { ok: false, error: "Couldn't find a booking for that email/name." };
  }

  const newStartUtc = new Date(new_start_time_utc);
  const validation = await validateSlot(newStartUtc);
  if (!validation.ok) {
    return { ok: false, error: validation.reason };
  }
  const newEndUtc = validation.endTimeUtc;

  try {
    await updateEvent(booking.googleEventId, {
      startUtc: newStartUtc,
      endUtc: newEndUtc,
    });
  } catch (e) {
    return { ok: false, error: `Could not update calendar: ${e.message}` };
  }

  booking.startTimeUtc = newStartUtc;
  booking.endTimeUtc = newEndUtc;
  booking.status = 'rescheduled';
  booking.updatedAt = new Date();
  await booking.save();
  // Flip back to confirmed since the new slot is the current valid one
  booking.status = 'confirmed';
  await booking.save();

  return {
    ok: true,
    type: 'booking_rescheduled',
    booking: {
      id: booking._id.toString(),
      name: booking.name,
      email: booking.email,
      slot: formatSlotDual(newStartUtc, bookerTz),
      meetLink: booking.googleMeetLink,
    },
    message: 'Rescheduled. Updated invite sent.',
  };
}

async function handleLeaveMessage(args, ctx) {
  const name = args.name?.trim();
  const email = args.email?.trim().toLowerCase();
  const message = args.message?.trim();

  if (!message) return { ok: false, error: 'Message content is required.' };
  if (!name && !email) {
    return { ok: false, error: "Need at least a name or email so Mahesh knows who it's from." };
  }
  if (message.length > 2000) {
    return { ok: false, error: 'Message is too long (max 2000 chars).' };
  }

  try {
    const saved = await Message.create({
      name: name || undefined,
      email: email || undefined,
      message,
      source: 'moore',
      sessionId: ctx.sessionId || '',
      read: false,
    });
    return {
      ok: true,
      type: 'message_saved',
      id: saved._id.toString(),
      message: "Saved. Mahesh will see it in his inbox next time he checks.",
    };
  } catch (e) {
    return { ok: false, error: `Could not save: ${e.message}` };
  }
}

async function handleCancelMeeting(args) {
  const { email, name } = args;
  if (!email && !name) {
    return { ok: false, error: 'Need email or name to find the booking.' };
  }

  const query = { status: 'confirmed' };
  if (email) query.email = email.toLowerCase();
  else query.name = new RegExp(`^${name}$`, 'i');

  const booking = await Booking.findOne(query).sort({ startTimeUtc: -1 });
  if (!booking) {
    return { ok: false, error: "Couldn't find a confirmed booking for that email/name." };
  }

  try {
    await deleteEvent(booking.googleEventId);
  } catch (e) {
    return { ok: false, error: `Could not delete calendar event: ${e.message}` };
  }

  booking.status = 'cancelled';
  booking.updatedAt = new Date();
  await booking.save();

  return {
    ok: true,
    type: 'booking_cancelled',
    message: 'Booking cancelled. Cancellation email sent.',
  };
}

export { MEETING_DURATION_MIN };
