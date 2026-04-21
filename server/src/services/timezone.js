import { DateTime } from 'luxon';

export const HOST_TIMEZONE = process.env.HOST_TIMEZONE || 'Asia/Kolkata';
export const HOST_HOURS_START = 10; // 10am
export const HOST_HOURS_END = 22;   // 10pm

// Format a UTC Date into dual-timezone display (host + booker).
// If host tz === booker tz (or aliases like Calcutta/Kolkata) we collapse to single label.
export function formatSlotDual(utcDate, bookerTz = 'UTC') {
  const utc = DateTime.fromJSDate(utcDate).toUTC();
  const host = utc.setZone(HOST_TIMEZONE);
  const booker = utc.setZone(bookerTz);

  const sameZone = sameTimezone(HOST_TIMEZONE, bookerTz) || host.offset === booker.offset;
  const hostDisplay = host.toFormat('ccc d LLL, h:mm a');
  const bookerDisplay = booker.toFormat('ccc d LLL, h:mm a');

  // offset diff in HOURS (host - booker). Positive = host is AHEAD of booker.
  const offsetDiffHours = (host.offset - booker.offset) / 60;
  const absDiff = Math.abs(offsetDiffHours);
  const bigGap = absDiff >= 4;
  const direction = offsetDiffHours > 0 ? 'ahead of' : 'behind';
  const offsetNote = bigGap
    ? `Mahesh is ${absDiff} hours ${direction} you`
    : null;

  return {
    startUtc: utc.toISO(),
    hostDisplay,
    hostTimezone: HOST_TIMEZONE,
    bookerDisplay,
    bookerTimezone: bookerTz,
    sameZone,
    offsetDiffHours,
    offsetNote,
    combinedLabel: sameZone
      ? `${hostDisplay} IST`
      : `${hostDisplay} IST (${bookerDisplay} ${bookerTz})`,
  };
}

function sameTimezone(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  const aliases = {
    'Asia/Kolkata': ['Asia/Calcutta'],
    'Asia/Calcutta': ['Asia/Kolkata'],
  };
  return (aliases[a] || []).includes(b);
}

// Parse natural language time input ("Friday 4pm", "tomorrow 3:30pm")
// Returns UTC Date or null.
export function parseBookerInput(text, bookerTz = 'UTC') {
  if (!text || typeof text !== 'string') return null;

  const cleaned = text.trim().toLowerCase();
  const now = DateTime.now().setZone(bookerTz);

  // Try ISO first
  const iso = DateTime.fromISO(text, { zone: bookerTz });
  if (iso.isValid) return iso.toUTC().toJSDate();

  // Parse common patterns
  const timeMatch = cleaned.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!timeMatch) return null;

  let hour = parseInt(timeMatch[1], 10);
  const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
  const meridiem = timeMatch[3];

  if (meridiem === 'pm' && hour < 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;
  // If no meridiem and hour is 1-7, assume PM (e.g. "at 4" = 4pm)
  if (!meridiem && hour >= 1 && hour <= 7) hour += 12;

  // Day parsing
  let target = now.set({ hour, minute, second: 0, millisecond: 0 });

  const days = {
    monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
    friday: 5, saturday: 6, sunday: 7,
  };

  if (/today/.test(cleaned)) {
    // keep today
  } else if (/tomorrow/.test(cleaned)) {
    target = target.plus({ days: 1 });
  } else {
    let matchedDay = null;
    for (const [name, dow] of Object.entries(days)) {
      if (cleaned.includes(name)) {
        matchedDay = dow;
        break;
      }
    }
    if (matchedDay) {
      const currentDow = target.weekday;
      let diff = matchedDay - currentDow;
      if (diff <= 0 || (diff === 0 && target < now)) diff += 7;
      target = target.plus({ days: diff });
    } else {
      // No day mentioned — if time is in past today, push to tomorrow
      if (target < now) target = target.plus({ days: 1 });
    }
  }

  if (!target.isValid) return null;
  return target.toUTC().toJSDate();
}

// Host's "now" in IST
export function hostNow() {
  return DateTime.now().setZone(HOST_TIMEZONE);
}

// Is a UTC date inside host's working hours (10am-10pm IST)?
export function isWithinHostHours(utcDate) {
  const dt = DateTime.fromJSDate(utcDate).setZone(HOST_TIMEZONE);
  const hour = dt.hour;
  const minute = dt.minute;
  // Must start at HOST_HOURS_START or later, and end by HOST_HOURS_END
  if (hour < HOST_HOURS_START) return false;
  // A 30-min slot starting at X:30 still ends by X+1:00 which must be <= HOST_HOURS_END
  if (hour > HOST_HOURS_END - 1) return false;
  if (hour === HOST_HOURS_END - 1 && minute > 30) return false;
  return true;
}

// Round UP to nearest 30-min boundary (IST)
export function roundUpToHalfHour(utcDate) {
  const dt = DateTime.fromJSDate(utcDate).setZone(HOST_TIMEZONE);
  const minute = dt.minute;
  if (minute === 0 || minute === 30) return dt.set({ second: 0, millisecond: 0 }).toUTC().toJSDate();
  if (minute < 30) return dt.set({ minute: 30, second: 0, millisecond: 0 }).toUTC().toJSDate();
  return dt.plus({ hours: 1 }).set({ minute: 0, second: 0, millisecond: 0 }).toUTC().toJSDate();
}
