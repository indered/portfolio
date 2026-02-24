import mongoose from 'mongoose';

const signatureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  strokes: {
    type: Array,
    required: true,
  },
  color: {
    type: String,
    default: '#ffffff',
    match: /^#[0-9a-fA-F]{6}$/,
  },
  compressed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

const Signature = mongoose.model('Signature', signatureSchema);

export default Signature;
