import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'EXPLORE_SECTION',
      'TOGGLE_THEME',
      'LEAVE_SIGNATURE',
      'CLICK_PLANET',
      'VIEW_PROJECT',
      'PLAY_MUSIC',
    ],
  },
  amount: {
    type: Number,
    required: true,
  },
  geo: {
    country: String,
    city: String,
    currency: String,
  },
  sessionId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

const Token = mongoose.model('Token', tokenSchema);

export default Token;
