import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['page_view', 'planet_click', 'session_end'],
    required: true,
    index: true,
  },
  route: { type: String, default: '/' },
  planet: { type: String, default: null },
  duration: { type: Number, default: null }, // seconds
  sessionId: { type: String, index: true },
  device: { type: String, enum: ['desktop', 'mobile', 'tablet'], default: 'desktop' },
  country: { type: String, default: null },
  city: { type: String, default: null },
  referrer: { type: String, default: null },
  createdAt: { type: Date, default: Date.now, index: true },
}, {
  timestamps: false,
  // Auto-delete after 90 days
  expireAfterSeconds: 90 * 24 * 60 * 60,
});

// TTL index on createdAt
analyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model('AnalyticsEvent', analyticsEventSchema);
