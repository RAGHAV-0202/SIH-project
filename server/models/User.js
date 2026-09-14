const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    trim: true,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  memory: {
    wakeUpTime: {
      type: String,
      default: '08:00',
    },
    sleepTime: {
      type: String,
      default: '23:00',
    },
    pace: {
      type: String,
      enum: ['relaxed', 'moderate', 'fast'],
      default: 'moderate',
    },
    dietary: {
      type: [String],
      default: ['any'],
    },
    notes: [
      {
        id: { type: String },
        text: { type: String },
        category: { type: String, default: 'routine' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
});

module.exports = mongoose.model('User', userSchema);
