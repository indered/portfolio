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

// Find up to N suggested slots in the next 7 days, 30-min, 10am-10pm IST
export async function findSuggestedSlots(count = 4, fromUtc = new Date()) {
  const slots = [];
  const now = DateTime.fromJSDate(fromUtc).setZone(HOST_TIMEZONE);

  // Start from next half hour
  let cursor = now.startOf('minute');
  const m = cursor.minute;
  if (m === 0 || m === 30) {
    cursor = cursor.plus({ minutes: 30 });
  } else if (m < 30) {
    cursor = cursor.set({ minute: 30, second: 0, millisecond: 0 });
  } else {
    cursor = cursor.plus({ hours: 1 }).set({ minute: 0, second: 0, millisecond: 0 });
  }

  const maxAhead = DateTime.now().setZone(HOST_TIMEZONE).plus({ days: 7 });

  let tries = 0;
  while (slots.length < count && cursor < maxAhead && tries < 400) {
    tries++;
    // Only keep slots within host hours
    if (cursor.hour < HOST_HOURS_START) {
      cursor = cursor.set({ hour: HOST_HOURS_START, minute: 0 });
      continue;
    }
    if (cursor.hour > HOST_HOURS_END - 1 || (cursor.hour === HOST_HOURS_END - 1 && cursor.minute > 30)) {
      cursor = cursor.plus({ days: 1 }).set({ hour: HOST_HOURS_START, minute: 0 });
      continue;
    }
    const startUtc = cursor.toUTC().toJSDate();
    const endUtc = new Date(startUtc.getTime() + 30 * 60 * 1000);

    // Skip if there's a Mongo booking conflict
    const mongoConflict = await Booking.findOne({
      status: 'confirmed',
      startTimeUtc: { $lt: endUtc },
      endTimeUtc: { $gt: startUtc },
    });
    if (mongoConflict) {
      cursor = cursor.plus({ minutes: 30 });
      continue;
    }

    // Skip if Google says busy
    const calendarConflict = await hasGoogleConflict(startUtc, endUtc);
    if (calendarConflict) {
      cursor = cursor.plus({ minutes: 30 });
      continue;
    }

    slots.push(startUtc);
    // Space suggestions out a bit for variety — skip next 90 min for spread
    cursor = cursor.plus({ hours: 2 });
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
