import { DateTime } from 'luxon';
import Booking from '../models/Booking.js';
import { isWithinHostHours, HOST_TIMEZONE } from './timezone.js';
import { hasGoogleConflict } from './googleCalendar.js';

const MEETING_DURATION_MIN = 30;
const BOOKING_WINDOW_DAYS = 7;

export { MEETING_DURATION_MIN, BOOKING_WINDOW_DAYS };

// Returns { ok: true } or { ok: false, reason: string, suggestion?: Date }
export async function validateSlot(startUtc) {
  const startDate = startUtc instanceof Date ? startUtc : new Date(startUtc);
  if (isNaN(startDate.getTime())) {
    return { ok: false, reason: "That doesn't look like a valid time." };
  }

  const endDate = new Date(startDate.getTime() + MEETING_DURATION_MIN * 60 * 1000);

  if (isInPast(startDate)) {
    return { ok: false, reason: "That time is in the past." };
  }

  if (!isWithinBookingWindow(startDate)) {
    return {
      ok: false,
      reason: `Bookings are only open for the next ${BOOKING_WINDOW_DAYS} days.`,
    };
  }

  if (!isWithinHostHours(startDate)) {
    return {
      ok: false,
      reason: `Mahesh is available 10am to 10pm IST. That slot is outside his hours.`,
    };
  }

  const mongoConflict = await hasMongoBooking(startDate, endDate);
  if (mongoConflict) {
    return { ok: false, reason: "That slot is already booked." };
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

export async function hasMongoBooking(startUtc, endUtc) {
  const overlapping = await Booking.findOne({
    status: 'confirmed',
    startTimeUtc: { $lt: endUtc },
    endTimeUtc: { $gt: startUtc },
  });
  return !!overlapping;
}

// Helper exposed for UI/text error formatting
export function describeHours() {
  return `10am–10pm ${HOST_TIMEZONE.split('/')[1]} (${HOST_TIMEZONE})`;
}
