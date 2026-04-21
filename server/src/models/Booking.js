import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, index: true },
  startTimeUtc: { type: Date, required: true, index: true },
  endTimeUtc: { type: Date, required: true },
  bookerTimezone: { type: String, default: 'UTC' },
  googleEventId: { type: String, index: true },
  googleMeetLink: { type: String },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'rescheduled', 'failed'],
    default: 'pending',
    index: true,
  },
  sessionId: { type: String, index: true },
  notes: { type: String, default: '' },
  attempts: { type: Number, default: 0 },
  lastError: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

bookingSchema.index({ status: 1, startTimeUtc: 1 });

export default mongoose.model('Booking', bookingSchema);
