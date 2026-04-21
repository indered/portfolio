import { useState } from 'react';
import styles from './BookingCard.module.scss';

export default function BookingCard({ toolOutput, onSlotPick }) {
  const [picked, setPicked] = useState(null);
  const { tool, result } = toolOutput || {};

  if (!result) return null;

  // Error / rejection from tool
  if (!result.ok) {
    return (
      <div className={styles.errorCard}>
        <p className={styles.errorMsg}>{result.error || "That didn't work."}</p>
      </div>
    );
  }

  // Availability: either single slot or multiple suggestions
  if (tool === 'check_availability') {
    return (
      <div className={styles.slotCard}>
        {result.preferred_rejected && (
          <p className={styles.rejectedNote}>
            <strong>{result.preferred_rejected.attempted.hostDisplay}</strong> didn't work — {result.preferred_rejected.reason.toLowerCase()}
          </p>
        )}

        {result.type === 'single_slot_available' && result.slot && (
          <>
            <p className={styles.cardHeader}>That time works.</p>
            <button
              className={`${styles.slot} ${picked === result.slot.startUtc ? styles.slotPicked : ''}`}
              onClick={() => { setPicked(result.slot.startUtc); onSlotPick?.(result.slot); }}
              disabled={!!picked}
            >
              <span className={styles.slotPrimary}>{result.slot.hostDisplay} IST</span>
              {!result.slot.sameZone && (
                <span className={styles.slotSecondary}>
                  {result.slot.bookerDisplay} ({result.slot.bookerTimezone})
                </span>
              )}
            </button>
          </>
        )}

        {result.type === 'suggested_slots' && result.slots?.length > 0 && (
          <>
            <p className={styles.cardHeader}>Available slots</p>
            <div className={styles.slotGrid}>
              {result.slots.map((slot, i) => (
                <button
                  key={i}
                  className={`${styles.slot} ${picked === slot.startUtc ? styles.slotPicked : ''}`}
                  onClick={() => { setPicked(slot.startUtc); onSlotPick?.(slot); }}
                  disabled={!!picked}
                >
                  <span className={styles.slotPrimary}>{slot.hostDisplay} IST</span>
                  {!slot.sameZone && (
                    <span className={styles.slotSecondary}>
                      {slot.bookerDisplay} ({slot.bookerTimezone})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {result.type === 'suggested_slots' && (!result.slots || result.slots.length === 0) && (
          <p className={styles.emptyMsg}>No open slots in the next 7 days. Try emailing Mahesh directly.</p>
        )}
      </div>
    );
  }

  // Booking confirmed
  if (tool === 'book_meeting' && result.type === 'booking_confirmed') {
    const { booking } = result;
    return (
      <div className={styles.confirmCard}>
        <div className={styles.confirmHeader}>
          <span className={styles.checkIcon}>✓</span>
          <span className={styles.confirmTitle}>Booked</span>
        </div>
        <p className={styles.confirmSlot}>
          <strong>{booking.slot.hostDisplay} IST</strong>
          {!booking.slot.sameZone && (
            <>
              <br />
              <span className={styles.confirmSub}>
                {booking.slot.bookerDisplay} ({booking.slot.bookerTimezone})
              </span>
            </>
          )}
        </p>
        <p className={styles.confirmMeta}>Invite sent to {booking.email}</p>
        {booking.meetLink && (
          <a href={booking.meetLink} target="_blank" rel="noopener noreferrer" className={styles.meetLink}>
            Join Google Meet →
          </a>
        )}
      </div>
    );
  }

  // Rescheduled
  if (tool === 'reschedule_meeting' && result.type === 'booking_rescheduled') {
    const { booking } = result;
    return (
      <div className={styles.confirmCard}>
        <div className={styles.confirmHeader}>
          <span className={styles.checkIcon}>⟳</span>
          <span className={styles.confirmTitle}>Rescheduled</span>
        </div>
        <p className={styles.confirmSlot}>
          <strong>{booking.slot.hostDisplay} IST</strong>
          {!booking.slot.sameZone && (
            <>
              <br />
              <span className={styles.confirmSub}>
                {booking.slot.bookerDisplay} ({booking.slot.bookerTimezone})
              </span>
            </>
          )}
        </p>
        <p className={styles.confirmMeta}>Updated invite sent to {booking.email}</p>
      </div>
    );
  }

  // Message saved for Mahesh
  if (tool === 'leave_message' && result.type === 'message_saved') {
    return (
      <div className={styles.confirmCard}>
        <div className={styles.confirmHeader}>
          <span className={styles.checkIcon}>✉</span>
          <span className={styles.confirmTitle}>Message saved</span>
        </div>
        <p className={styles.confirmMeta}>{result.message}</p>
      </div>
    );
  }

  // Cancelled
  if (tool === 'cancel_meeting' && result.type === 'booking_cancelled') {
    return (
      <div className={styles.confirmCard}>
        <div className={styles.confirmHeader}>
          <span className={styles.checkIcon}>×</span>
          <span className={styles.confirmTitle}>Cancelled</span>
        </div>
        <p className={styles.confirmMeta}>{result.message}</p>
      </div>
    );
  }

  return null;
}
