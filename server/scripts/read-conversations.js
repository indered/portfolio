import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from '../src/models/Conversation.js';

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const convos = await Conversation.find({}).sort({ updatedAt: -1 }).lean();

  console.log(`\n=== ${convos.length} conversations ===\n`);

  for (const c of convos) {
    const date = new Date(c.updatedAt).toISOString().slice(0, 16).replace('T', ' ');
    console.log(`\n--- [${date}] ${c.geo || 'Unknown'} | ${c.device || '?'} | ${c.messages.length} msgs ---`);
    for (const m of c.messages) {
      const prefix = m.role === 'user' ? 'USER' : 'COSMOS';
      const content = m.content.length > 300 ? m.content.slice(0, 300) + '...' : m.content;
      console.log(`[${prefix}] ${content}`);
    }
  }

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
