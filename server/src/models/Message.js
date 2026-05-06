import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  name: { type: String, maxlength: 100 },
  email: { type: String, maxlength: 200 },
  message: { type: String, required: true, maxlength: 2000 },
  source: { type: String, enum: ['form', 'moore'], default: 'form' },
  sessionId: { type: String, index: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Require at least one of name or email
messageSchema.pre('validate', function () {
  if (!this.name && !this.email) {
    throw new Error('Either name or email is required.');
  }
});

export default mongoose.model('Message', messageSchema);
