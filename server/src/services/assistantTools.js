// Tools for the personal assistant at /me. These have wider read/write
// access than the customer-facing tools — they let Mahesh query his own
// bookings, messages, conversations, and calendar events, plus draft emails.
// Handlers are only called from /api/assistant which is PIN-gated.

import Booking from '../models/Booking.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { listEvents, createGmailDraft, updateEvent, deleteEvent } from './googleCalendar.js';
import { DateTime } from 'luxon';
import { HOST_TIMEZONE } from './timezone.js';

export const personalTools = [
  {
    type: 'function',
    function: {
      name: 'list_bookings',
      description:
        "List bookings (meetings booked via Moore). Filter by date range ('today', 'tomorrow', 'this_week', 'next_week', or a specific date) and/or status.",
      parameters: {
        type: 'object',
        properties: {
          when: {
            type: ['string', 'null'],
            description: "Which range: 'today', 'tomorrow', 'this_week', 'next_week', 'upcoming'. Default 'upcoming'.",
          },
          status: {
            type: ['string', 'null'],
            description: "Filter by status: 'pending', 'confirmed', 'cancelled', or 'all'. Default 'confirmed'.",
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_messages',
      description:
        'List messages left in Mahesh\'s inbox. Filter by read state.',
      parameters: {
        type: 'object',
        properties: {
          unread_only: {
            type: ['boolean', 'null'],
            description: 'If true, only returns unread messages. Default true.',
          },
          limit: {
            type: ['number', 'null'],
            description: 'Max results. Default 10.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_conversations',
      description:
        'List recent Moore chat conversations (sessions with visitors). Useful for seeing what people have been asking about.',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: ['number', 'null'],
            description: 'Max results. Default 5.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'draft_email_reply',
      description:
        'Create a Gmail draft reply to a booker or message sender. The draft appears in Mahesh\'s Gmail drafts — he reviews and sends himself. Never auto-sends.',
      parameters: {
        type: 'object',
        properties: {
          to: { type: 'string', description: "Recipient email address." },
          subject: { type: 'string', description: 'Email subject.' },
          body: { type: 'string', description: 'Plain-text email body.' },
        },
        required: ['to', 'subject', 'body'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'reschedule_booking_admin',
      description:
        "Reschedule an existing booking to a new time (admin path — no booker verification needed). Use when Mahesh wants to move a meeting.",
      parameters: {
        type: 'object',
        properties: {
          booking_id: { type: 'string', description: 'The Mongo _id of the booking.' },
          new_start_time_utc: { type: 'string', description: 'New start time in ISO 8601 UTC.' },
        },
        required: ['booking_id', 'new_start_time_utc'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'cancel_booking_admin',
      description:
        'Cancel a booking by id. Deletes the Google Calendar event and marks the booking cancelled.',
      parameters: {
        type: 'object',
        properties: {
          booking_id: { type: 'string' },
        },
        required: ['booking_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_daily_brief',
      description:
        "Generate a morning summary: today's bookings, unread messages, recent conversation highlights. Call this when the user says 'brief', 'daily brief', 'morning summary', or just arrives.",
      parameters: { type: 'object', properties: {} },
    },
  },
];

function rangeFor(when) {
  const now = DateTime.now().setZone(HOST_TIMEZONE);
  switch (when) {
    case 'today':
      return { from: now.startOf('day').toUTC().toJSDate(), to: now.endOf('day').toUTC().toJSDate() };
    case 'tomorrow': {
      const d = now.plus({ days: 1 });
      return { from: d.startOf('day').toUTC().toJSDate(), to: d.endOf('day').toUTC().toJSDate() };
    }
    case 'this_week':
      return { from: now.startOf('week').toUTC().toJSDate(), to: now.endOf('week').toUTC().toJSDate() };
    case 'next_week': {
      const d = now.plus({ weeks: 1 });
      return { from: d.startOf('week').toUTC().toJSDate(), to: d.endOf('week').toUTC().toJSDate() };
    }
    case 'upcoming':
    default:
      return { from: now.toUTC().toJSDate(), to: now.plus({ days: 14 }).toUTC().toJSDate() };
  }
}

export async function executePersonalTool(name, args) {
  try {
    const a = args && typeof args === 'object' ? args : {};
    switch (name) {
      case 'list_bookings':
        return await listBookings(a);
      case 'list_messages':
        return await listMessages(a);
      case 'list_conversations':
        return await listConversations(a);
      case 'draft_email_reply':
        return await draftEmailReply(a);
      case 'reschedule_booking_admin':
        return await rescheduleAdmin(a);
      case 'cancel_booking_admin':
        return await cancelAdmin(a);
      case 'get_daily_brief':
        return await dailyBrief();
      default:
        return { ok: false, error: `Unknown tool: ${name}` };
    }
  } catch (e) {
    console.error(`Personal tool ${name} failed:`, e.message);
    return { ok: false, error: e.message };
  }
}

async function listBookings({ when, status }) {
  const range = rangeFor(when || 'upcoming');
  const statusFilter = status && status !== 'all' ? { status } : { status: { $in: ['confirmed', 'pending'] } };
  const bookings = await Booking.find({
    ...statusFilter,
    startTimeUtc: { $gte: range.from, $lte: range.to },
  })
    .sort({ startTimeUtc: 1 })
    .limit(20)
    .lean();

  return {
    ok: true,
    type: 'bookings_list',
    count: bookings.length,
    bookings: bookings.map((b) => ({
      id: b._id.toString(),
      name: b.name,
      email: b.email,
      start: DateTime.fromJSDate(b.startTimeUtc).setZone(HOST_TIMEZONE).toFormat("ccc d LLL, h:mm a 'IST'"),
      status: b.status,
      meetLink: b.googleMeetLink,
    })),
  };
}

async function listMessages({ unread_only = true, limit = 10 }) {
  const query = unread_only === false ? {} : { read: false };
  const msgs = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(Math.min(limit || 10, 50))
    .lean();
  return {
    ok: true,
    type: 'messages_list',
    count: msgs.length,
    messages: msgs.map((m) => ({
      id: m._id.toString(),
      name: m.name,
      email: m.email,
      message: m.message,
      source: m.source,
      read: m.read,
      createdAt: m.createdAt,
    })),
  };
}

async function listConversations({ limit = 5 }) {
  const convos = await Conversation.find()
    .sort({ updatedAt: -1 })
    .limit(Math.min(limit || 5, 20))
    .lean();
  return {
    ok: true,
    type: 'conversations_list',
    count: convos.length,
    conversations: convos.map((c) => ({
      id: c._id.toString(),
      sessionId: c.sessionId,
      geo: c.geo,
      device: c.device,
      messageCount: c.messages?.length || 0,
      firstQuestion: c.messages?.[0]?.content?.slice(0, 120) || '',
      updatedAt: c.updatedAt,
    })),
  };
}

async function draftEmailReply({ to, subject, body }) {
  if (!to || !subject || !body) return { ok: false, error: 'Need to, subject, body.' };
  const { draftId } = await createGmailDraft({ to, subject, body });
  return {
    ok: true,
    type: 'email_draft_created',
    draftId,
    message: `Draft created in your Gmail drafts folder. Review and send from Gmail.`,
  };
}

async function rescheduleAdmin({ booking_id, new_start_time_utc }) {
  const booking = await Booking.findById(booking_id);
  if (!booking) return { ok: false, error: 'Booking not found.' };
  const newStart = new Date(new_start_time_utc);
  const newEnd = new Date(newStart.getTime() + 30 * 60 * 1000);
  if (booking.googleEventId) {
    await updateEvent(booking.googleEventId, { startUtc: newStart, endUtc: newEnd });
  }
  booking.startTimeUtc = newStart;
  booking.endTimeUtc = newEnd;
  booking.updatedAt = new Date();
  await booking.save();
  return {
    ok: true,
    type: 'booking_rescheduled',
    bookingId: booking._id.toString(),
    newStart: DateTime.fromJSDate(newStart).setZone(HOST_TIMEZONE).toFormat("ccc d LLL, h:mm a 'IST'"),
  };
}

async function cancelAdmin({ booking_id }) {
  const booking = await Booking.findById(booking_id);
  if (!booking) return { ok: false, error: 'Booking not found.' };
  if (booking.googleEventId) {
    try {
      await deleteEvent(booking.googleEventId);
    } catch (e) {
      console.warn('Calendar delete failed:', e.message);
    }
  }
  booking.status = 'cancelled';
  booking.updatedAt = new Date();
  await booking.save();
  return { ok: true, type: 'booking_cancelled', bookingId: booking._id.toString() };
}

async function dailyBrief() {
  const now = DateTime.now().setZone(HOST_TIMEZONE);
  const todayRange = rangeFor('today');

  const [todayBookings, unreadMessages, recentConvos, calendarEvents] = await Promise.all([
    Booking.find({
      status: { $in: ['confirmed', 'pending'] },
      startTimeUtc: { $gte: todayRange.from, $lte: todayRange.to },
    }).sort({ startTimeUtc: 1 }).lean(),
    Message.find({ read: false }).sort({ createdAt: -1 }).limit(5).lean(),
    Conversation.find().sort({ updatedAt: -1 }).limit(3).lean(),
    listEvents(todayRange.from, todayRange.to).catch(() => []),
  ]);

  return {
    ok: true,
    type: 'daily_brief',
    date: now.toFormat('ccc d LLL yyyy'),
    today: {
      bookingsCount: todayBookings.length,
      bookings: todayBookings.map((b) => ({
        name: b.name,
        email: b.email,
        time: DateTime.fromJSDate(b.startTimeUtc).setZone(HOST_TIMEZONE).toFormat("h:mm a"),
        status: b.status,
      })),
      calendarEventsCount: calendarEvents.length,
    },
    unread: {
      count: unreadMessages.length,
      messages: unreadMessages.map((m) => ({
        id: m._id.toString(),
        from: m.name || m.email || 'Unknown',
        preview: m.message.slice(0, 120),
      })),
    },
    recentConversations: recentConvos.map((c) => ({
      firstQuestion: c.messages?.[0]?.content?.slice(0, 80) || '',
      geo: c.geo,
      messageCount: c.messages?.length || 0,
    })),
  };
}
