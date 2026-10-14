const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  emotionData: [{
    timestamp: Date,
    emotion: String,
    confidence: Number
  }],
  confidenceScore: {
    type: Number,
    default: 0
  },
  attentionScore: {
    type: Number,
    default: 0
  },
  eyeTracking: [{
    timestamp: Date,
    gazeX: Number,
    gazeY: Number,
    lookingAtCamera: Boolean
  }],
  speechAnalysis: {
    totalWords: Number,
    speakingRate: Number,
    fillerWords: Number,
    clarity: Number,
    sentiment: String,
    sentimentScore: Number
  },
  communicationQuality: {
    type: Number,
    default: 0
  },
  behavioralAnalysis: {
    confidence: Number,
    stress: Number,
    engagement: Number,
    professionalism: Number
  },
  overallScore: {
    type: Number,
    default: 0
  },
  strengths: [String],
  weaknesses: [String],
  recommendation: {
    type: String,
    enum: ['selected', 'review', 'rejected'],
    default: 'review'
  },
  reasoning: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

analyticsSchema.index({ interviewId: 1 });
analyticsSchema.index({ candidateId: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
