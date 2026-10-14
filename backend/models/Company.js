const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  logo: {
    type: String, // URL or base64
  },
  description: {
    type: String
  },
  website: {
    type: String
  },
  workspaceSlug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  roundsConfig: [{
    name: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['aptitude', 'technical', 'video_ai', 'hr', 'final'],
      default: 'video_ai'
    },
    order: Number,
    isPublished: { type: Boolean, default: false }
  }],
  adminIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Company', companySchema);
