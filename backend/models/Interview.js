const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  superadminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  roundNumber: {
    type: Number,
    default: 1
  },
  jobRole: {
    type: String,
    required: true
  },
  scheduledTime: {
    type: Date
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number
  },
  status: {
    type: String,
    enum: ['scheduled', 'ready', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  meetingId: {
    type: String,
    unique: true
  },
  questions: [{
    id: String,
    question: String,
    answer: String,
    aiSuggested: Boolean,
    timestamp: Date,
    duration: Number
  }],
  transcript: [{
    speaker: String,
    text: String,
    timestamp: Date,
    sentiment: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

interviewSchema.index({ candidateId: 1 });
interviewSchema.index({ status: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
