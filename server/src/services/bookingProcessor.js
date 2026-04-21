// Cron-driven processor that picks up pending bookings from MongoDB
// and creates the actual Google Calendar event + Meet link + email invite.
// Lets the chat respond instantly without waiting on Google's API.

import Booking from '../models/Booking.js';
import { createEvent } from './googleCalendar.js';

const MAX_ATTEMPTS = 5;

export async function processPendingBookings() {
  const pending = await Booking.find({
    status: 'pending',
    attempts: { $lt: MAX_ATTEMPTS },
  })
    .sort({ createdAt: 1 })
    .limit(20)
    .lean();

  if (pending.length === 0) return { processed: 0, succeeded: 0, failed: 0 };

  let succeeded = 0;
  let failed = 0;

  for (const b of pending) {
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
      const newAttempts = (b.attempts || 0) + 1;
      const reachedMax = newAttempts >= MAX_ATTEMPTS;
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

  console.log(`[bookingProcessor] processed=${pending.length} succeeded=${succeeded} failed=${failed}`);
  return { processed: pending.length, succeeded, failed };
}
