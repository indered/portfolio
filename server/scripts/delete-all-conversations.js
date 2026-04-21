import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from '../src/models/Conversation.js';

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const count = await Conversation.countDocuments();
  console.log(`\nFound ${count} conversations in DB.`);

  if (count === 0) {
    console.log('Nothing to delete.');
    await mongoose.disconnect();
    return;
  }

  const result = await Conversation.deleteMany({});
  console.log(`\nDeleted ${result.deletedCount} conversations.\n`);

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
