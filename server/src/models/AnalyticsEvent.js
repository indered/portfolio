import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema({
  // enum removed — ask_* funnel events + future events shouldn't break validation
  type: { type: String, required: true, index: true },
  route: { type: String, default: '/' },
  planet: { type: String, default: null },
  duration: { type: Number, default: null },
  sessionId: { type: String, index: true },
  device: { type: String, enum: ['desktop', 'mobile', 'tablet'], default: 'desktop' },
  country: { type: String, default: null },
  city: { type: String, default: null },
  // Silent enrichment — added server-side from IP lookup + client fingerprint
  region: { type: String, default: null },
  postal: { type: String, default: null },
  company: { type: String, default: null },
  asn: { type: String, default: null },
  fingerprint: { type: String, default: null, index: true },
  ip: { type: String, default: null },
  referrer: { type: String, default: null },
  returnVisitor: { type: Boolean, default: false },
  meta: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now, index: true },
}, {
  timestamps: false,
});

// TTL index on createdAt
analyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model('AnalyticsEvent', analyticsEventSchema);
