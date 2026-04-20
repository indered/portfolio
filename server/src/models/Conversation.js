import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
  geo: { type: String, default: 'Unknown' },
  ip: { type: String },
  device: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Conversation', conversationSchema);
