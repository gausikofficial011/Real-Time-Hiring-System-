const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  resume: {
    fileName: String,
    fileUrl: String,
    parsedData: {
      skills: [String],
      experience: String,
      education: String,
      summary: String
    },
    score: {
      type: Number,
      default: 0
    }
  },
  jobRole: {
    type: String
  },
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    score: Number
  }],
  applications: [{
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    status: {
      type: String,
      enum: ['invited', 'ready', 'in_interview', 'completed', 'selected', 'rejected', 'under_review'],
      default: 'invited'
    },
    currentRound: {
      type: Number,
      default: 1
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview'
    },
    resultsPublished: {
      type: Boolean,
      default: false
    }
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

candidateSchema.index({ email: 1 });
candidateSchema.index({ status: 1 });

module.exports = mongoose.model('Candidate', candidateSchema);
