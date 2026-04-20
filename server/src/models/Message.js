import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, maxlength: 200 },
  message: { type: String, required: true, maxlength: 2000 },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Message', messageSchema);
