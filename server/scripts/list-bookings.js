import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from '../src/models/Booking.js';

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const recent = await Booking.find({})
  .sort({ createdAt: -1 })
  .limit(20)
  .lean();

console.log(`\n=== ${recent.length} most recent bookings ===\n`);
for (const b of recent) {
  const created = new Date(b.createdAt).toISOString().slice(0, 19).replace('T', ' ');
  console.log(`[${created}] ${b.status} | ${b.name} <${b.email}> | session:${b.sessionId || '-'}`);
  console.log(`  start: ${new Date(b.startTimeUtc).toISOString()}`);
  console.log(`  meet: ${b.googleMeetLink || '(none)'}`);
  console.log('');
}

await mongoose.disconnect();
