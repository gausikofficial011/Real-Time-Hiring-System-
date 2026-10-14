const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview'
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  violationType: {
    type: String,
    enum: ['tab_switch', 'fullscreen_exit', 'multiple_faces', 'no_face', 'eye_tracking', 'head_movement', 'background_disturbance', 'voice_anomaly', 'deepfake_suspected', 'device_mismatch'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: {
    snapshotUrl: String,
    description: String,
    confidence: Number,
    additionalData: mongoose.Schema.Types.Mixed
  },
  resolved: {
    type: Boolean,
    default: false
  },
  integrityScore: {
    type: Number,
    default: 100
  }
});

securityLogSchema.index({ candidateId: 1 });
securityLogSchema.index({ interviewId: 1 });
securityLogSchema.index({ timestamp: 1 });

module.exports = mongoose.model('SecurityLog', securityLogSchema);
