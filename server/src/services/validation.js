import { DateTime } from 'luxon';
import Booking from '../models/Booking.js';
import { HOST_TIMEZONE } from './timezone.js';
import { hasGoogleConflict, ALLOWED_HOURS } from './googleCalendar.js';

const MEETING_DURATION_MIN = 30;
const BOOKING_WINDOW_DAYS = 7;

export { MEETING_DURATION_MIN, BOOKING_WINDOW_DAYS };

// Returns { ok: true, endTimeUtc } or { ok: false, reason }
export async function validateSlot(startUtc) {
  const startDate = startUtc instanceof Date ? startUtc : new Date(startUtc);
  if (isNaN(startDate.getTime())) {
    return { ok: false, reason: "That doesn't look like a valid time." };
  }

  const endDate = new Date(startDate.getTime() + MEETING_DURATION_MIN * 60 * 1000);

  if (isInPast(startDate)) {
    return { ok: false, reason: "That time is in the past." };
  }

  if (!isFromTomorrow(startDate)) {
    return { ok: false, reason: "Same-day bookings aren't open. Pick a slot from tomorrow onwards." };
  }

  if (!isWithinBookingWindow(startDate)) {
    return { ok: false, reason: `Bookings are only open for the next ${BOOKING_WINDOW_DAYS} days.` };
  }

  if (!isAllowedSlotTime(startDate)) {
    return {
      ok: false,
      reason: 'Mahesh only takes calls at 1 PM, 3 PM, or 5 PM IST. Pick one of those.',
    };
  }

  if (await hasMongoBooking(startDate, endDate)) {
    return { ok: false, reason: 'That slot is already booked.' };
  }

  const calendarConflict = await hasGoogleConflict(startDate, endDate).catch(() => false);
  if (calendarConflict) {
    return { ok: false, reason: "That slot is blocked on Mahesh's calendar." };
  }

  return { ok: true, endTimeUtc: endDate };
}

export function isInPast(date) {
  return date.getTime() < Date.now();
}

export function isWithinBookingWindow(date) {
  const maxMs = Date.now() + BOOKING_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return date.getTime() <= maxMs;
}

// Booking must be from tomorrow (host timezone) onwards
export function isFromTomorrow(date) {
  const slot = DateTime.fromJSDate(date).setZone(HOST_TIMEZONE).startOf('day');
  const tomorrow = DateTime.now().setZone(HOST_TIMEZONE).plus({ days: 1 }).startOf('day');
  return slot >= tomorrow;
}

// Time must start exactly at one of the allowed IST hours (1/3/5 PM)
export function isAllowedSlotTime(date) {
  const dt = DateTime.fromJSDate(date).setZone(HOST_TIMEZONE);
  if (dt.minute !== 0 || dt.second !== 0) return false;
  return ALLOWED_HOURS.includes(dt.hour);
}

export async function hasMongoBooking(startUtc, endUtc) {
  const overlapping = await Booking.findOne({
    status: 'confirmed',
    startTimeUtc: { $lt: endUtc },
    endTimeUtc: { $gt: startUtc },
  });
  return !!overlapping;
}

// For prompt/UI hints
export function describeAvailability() {
  return '1 PM, 3 PM, or 5 PM IST, starting tomorrow';
}
