import mongoose from 'mongoose';

const causeSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tokenValue: {
    type: Number,
    default: 0.10,
  },
  totalTokens: {
    type: Number,
    default: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Cause = mongoose.model('Cause', causeSchema);

export default Cause;
