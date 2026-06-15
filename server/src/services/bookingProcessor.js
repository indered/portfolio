// Cron-driven processor that picks up pending bookings from MongoDB
// and creates the actual Google Calendar event + Meet link + email invite.
// Lets the chat respond instantly without waiting on Google's API.

import Booking from '../models/Booking.js';
import { classifyCalendarWriteError, createEvent } from './googleCalendar.js';

const MAX_ATTEMPTS = 5;

export async function processPendingBookings() {
  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < 20; i++) {
    const b = await Booking.findOneAndUpdate(
      {
        status: 'pending',
        attempts: { $lt: MAX_ATTEMPTS },
      },
      {
        $set: {
          status: 'processing',
          updatedAt: new Date(),
        },
      },
      {
        sort: { createdAt: 1 },
        new: true,
      },
    ).lean();

    if (!b) break;
    processed++;

    try {
      const eventData = await createEvent({
        startUtc: b.startTimeUtc,
        endUtc: b.endTimeUtc,
        booker: { name: b.name, email: b.email },
        notes: b.notes,
      });

      await Booking.findByIdAndUpdate(b._id, {
        $set: {
          status: 'confirmed',
          googleEventId: eventData.eventId,
          googleMeetLink: eventData.meetLink,
          updatedAt: new Date(),
        },
        $inc: { attempts: 1 },
      });
      succeeded++;
    } catch (err) {
      const classification = classifyCalendarWriteError(err);
      const newAttempts = (b.attempts || 0) + 1;
      const reachedMax = newAttempts >= MAX_ATTEMPTS || !classification.retryable;
      await Booking.findByIdAndUpdate(b._id, {
        $set: {
          status: reachedMax ? 'failed' : 'pending',
          lastError: err.message,
          updatedAt: new Date(),
        },
        $inc: { attempts: 1 },
      });
      failed++;
      console.error(`[bookingProcessor] booking ${b._id} failed (attempt ${newAttempts}):`, err.message);
    }
  }

  console.log(`[bookingProcessor] processed=${processed} succeeded=${succeeded} failed=${failed}`);
  return { processed, succeeded, failed };
}
