import { google } from 'googleapis';
import { DateTime } from 'luxon';
import { HOST_TIMEZONE, HOST_HOURS_START, HOST_HOURS_END, isWithinHostHours } from './timezone.js';
import Booking from '../models/Booking.js';

let oauth2Client = null;
let calendar = null;
let gmail = null;

function getOAuth() {
  if (oauth2Client) return oauth2Client;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Google OAuth not configured. Run scripts/google-oauth-setup.js first.');
  }
  oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

function getCalendar() {
  if (calendar) return calendar;
  calendar = google.calendar({ version: 'v3', auth: getOAuth() });
  return calendar;
}

function getGmail() {
  if (gmail) return gmail;
  gmail = google.gmail({ version: 'v1', auth: getOAuth() });
  return gmail;
}

// Check if a slot conflicts with anything on the host's Google Calendar
export async function hasGoogleConflict(startUtc, endUtc) {
  try {
    const cal = getCalendar();
    const res = await cal.freebusy.query({
      requestBody: {
        timeMin: new Date(startUtc).toISOString(),
        timeMax: new Date(endUtc).toISOString(),
        items: [{ id: 'primary' }],
      },
    });
    const busy = res.data.calendars?.primary?.busy || [];
    return busy.length > 0;
  } catch (e) {
    console.error('Google Calendar freebusy error:', e.message);
    // Fail closed: if we can't check, reject to be safe? No — fail open so user flow isn't blocked by infra.
    return false;
  }
}

// Fixed slot hours in HOST_TIMEZONE (IST): 1pm, 3pm, 5pm.
export const ALLOWED_HOURS = [13, 15, 17];

// Find up to N suggested slots starting from TOMORROW, at fixed hours (1pm/3pm/5pm IST).
// One Google Calendar freebusy call covers all 7 days at once + one Mongo query — fast.
export async function findSuggestedSlots(count = 4, fromUtc = new Date()) {
  const slots = [];
  const now = DateTime.fromJSDate(fromUtc).setZone(HOST_TIMEZONE);

  const rangeStart = now.plus({ days: 1 }).startOf('day');
  const rangeEnd = now.plus({ days: 7 }).endOf('day');

  // ONE Google freebusy query for the whole 7-day range
  let busyBlocks = [];
  try {
    const cal = getCalendar();
    const res = await cal.freebusy.query({
      requestBody: {
        timeMin: rangeStart.toUTC().toISO(),
        timeMax: rangeEnd.toUTC().toISO(),
        items: [{ id: 'primary' }],
      },
    });
    busyBlocks = (res.data.calendars?.primary?.busy || []).map((b) => ({
      start: new Date(b.start).getTime(),
      end: new Date(b.end).getTime(),
    }));
  } catch (e) {
    console.error('findSuggestedSlots freebusy error:', e.message);
  }

  // ONE Mongo query for all confirmed/pending bookings in the range
  const mongoBookings = await Booking.find({
    status: { $in: ['confirmed', 'pending'] },
    startTimeUtc: { $lt: rangeEnd.toUTC().toJSDate() },
    endTimeUtc: { $gt: rangeStart.toUTC().toJSDate() },
  }, { startTimeUtc: 1, endTimeUtc: 1 }).lean();
  const mongoBlocks = mongoBookings.map((b) => ({
    start: new Date(b.startTimeUtc).getTime(),
    end: new Date(b.endTimeUtc).getTime(),
  }));

  const allBusy = [...busyBlocks, ...mongoBlocks];
  const overlaps = (start, end) =>
    allBusy.some((b) => b.start < end && b.end > start);

  let day = rangeStart;
  while (slots.length < count && day < rangeEnd) {
    for (const hour of ALLOWED_HOURS) {
      if (slots.length >= count) break;
      const slotStart = day.set({ hour, minute: 0, second: 0, millisecond: 0 });
      const startUtc = slotStart.toUTC().toJSDate();
      const startMs = startUtc.getTime();
      const endMs = startMs + 30 * 60 * 1000;
      if (overlaps(startMs, endMs)) continue;
      slots.push(startUtc);
    }
    day = day.plus({ days: 1 });
  }

  return slots;
}

// Create a calendar event with a Google Meet link and notify attendees.
export async function createEvent({ startUtc, endUtc, booker, notes }) {
  const cal = getCalendar();
  const hostEmail = process.env.HOST_EMAIL;
  const res = await cal.events.insert({
    calendarId: 'primary',
    sendUpdates: 'all',
    conferenceDataVersion: 1,
    requestBody: {
      summary: `Intro call — ${booker.name} × Mahesh`,
      description: notes
        ? `Booked via Moore (maheshinder.in/ask)\n\nNotes: ${notes}`
        : 'Booked via Moore (maheshinder.in/ask)',
      start: { dateTime: new Date(startUtc).toISOString(), timeZone: 'UTC' },
      end: { dateTime: new Date(endUtc).toISOString(), timeZone: 'UTC' },
      attendees: [
        { email: booker.email, displayName: booker.name },
        hostEmail ? { email: hostEmail } : null,
      ].filter(Boolean),
      conferenceData: {
        createRequest: {
          requestId: `moore-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  });

  const event = res.data;
  const meetLink =
    event.hangoutLink ||
    event.conferenceData?.entryPoints?.find((p) => p.entryPointType === 'video')?.uri ||
    null;
  return { eventId: event.id, meetLink, raw: event };
}

// Update event start/end (reschedule)
export async function updateEvent(eventId, { startUtc, endUtc }) {
  const cal = getCalendar();
  const res = await cal.events.patch({
    calendarId: 'primary',
    eventId,
    sendUpdates: 'all',
    requestBody: {
      start: { dateTime: new Date(startUtc).toISOString(), timeZone: 'UTC' },
      end: { dateTime: new Date(endUtc).toISOString(), timeZone: 'UTC' },
    },
  });
  return res.data;
}

// Delete (cancel) event
export async function deleteEvent(eventId) {
  const cal = getCalendar();
  await cal.events.delete({
    calendarId: 'primary',
    eventId,
    sendUpdates: 'all',
  });
  return true;
}

// Create a Gmail draft (for personal assistant)
export async function createGmailDraft({ to, subject, body }) {
  const g = getGmail();
  const headers = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    body,
  ].join('\r\n');
  const raw = Buffer.from(headers).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  const res = await g.users.drafts.create({
    userId: 'me',
    requestBody: { message: { raw } },
  });
  return { draftId: res.data.id };
}

// List events on the host's calendar (personal assistant)
export async function listEvents(fromUtc, toUtc) {
  const cal = getCalendar();
  const res = await cal.events.list({
    calendarId: 'primary',
    timeMin: new Date(fromUtc).toISOString(),
    timeMax: new Date(toUtc).toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });
  return res.data.items || [];
}
