const express = require('express');
const router = express.Router();
const { auth, superadminOnly, candidateOnly } = require('../middleware/auth');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const Interview = require('../models/Interview');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for resume upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/resumes';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Create candidate (superadmin only)
router.post('/', auth, superadminOnly, upload.single('resume'), async (req, res) => {
  try {
    const { name, email, phone, jobRole, companyId } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create temporary user for candidate
      const tempPassword = Math.random().toString(36).slice(-8);
      user = new User({
        email,
        password: tempPassword,
        name,
        role: 'candidate',
        phone,
        isTemporary: true
      });
      await user.save();
    }

    const candidate = new Candidate({
      userId: user._id,
      name,
      email,
      phone,
      jobRole,
      applications: [{
        companyId: companyId || null, // UI should pass this
        status: 'invited',
        currentRound: 1
      }]
    });

    if (req.file) {
      candidate.resume.fileName = req.file.filename;
      candidate.resume.fileUrl = `/uploads/resumes/${req.file.filename}`;
    }

    await candidate.save();

    res.status(201).json({
      message: 'Candidate created and invited successfully',
      candidate,
      temporaryCredentials: user.isTemporary ? { email: user.email, password: 'Check system for temp password' } : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all candidates (superadmin only)
router.get('/', auth, superadminOnly, async (req, res) => {
  try {
    const { status, jobRole, companyId } = req.query;
    const filter = {};
    if (jobRole) filter.jobRole = jobRole;
    
    // Filter by company in applications if provided
    if (companyId) {
      filter['applications.companyId'] = companyId;
    }

    const candidates = await Candidate.find(filter)
      .populate('userId', 'email phone')
      .populate('applications.interviewId')
      .populate('applications.companyId')
      .sort({ createdAt: -1 });

    // Map to include a flat status for legacy UI compatibility if needed
    const mappedCandidates = candidates.map(c => {
      const mainApp = companyId ? 
        c.applications.find(a => a.companyId._id.toString() === companyId) : 
        c.applications[0];
      
      return {
        ...c.toObject(),
        status: mainApp?.status || 'invited',
        interviewId: mainApp?.interviewId || null,
        companyName: mainApp?.companyId?.name || 'Global'
      };
    });

    res.json(mappedCandidates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get candidate by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('userId')
      .populate('interviewId');

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Check if user is authorized
    if (req.userRole === 'candidate' && candidate.userId._id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update candidate status
router.put('/:id/status', auth, superadminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current candidate profile
router.get('/profile/me', auth, candidateOnly, async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ userId: req.userId })
      .populate('applications.interviewId')
      .populate('applications.companyId');

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate profile not found' });
    }

    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update candidate ready status
router.put('/:id/ready', auth, candidateOnly, async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ 
      _id: req.params.id,
      userId: req.userId 
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    candidate.status = 'ready';
    await candidate.save();

    // Emit socket event
    const io = req.app.get('io');
    if (candidate.interviewId) {
      io.to(candidate.interviewId.toString()).emit('candidate-ready', {
        candidateId: candidate._id,
        name: candidate.name
      });
    }

    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Compare candidates
router.post('/compare', auth, superadminOnly, async (req, res) => {
  try {
    const { candidateIds } = req.body;
    const candidates = await Candidate.find({ _id: { $in: candidateIds } })
      .populate('interviewId')
      .populate('userId');

    const Analytics = require('../models/Analytics');
    const analytics = await Analytics.find({ 
      candidateId: { $in: candidateIds } 
    }).populate('candidateId');

    const comparison = candidates.map(candidate => {
      const candidateAnalytics = analytics.find(a => a.candidateId._id.toString() === candidate._id.toString());
      return {
        candidate,
        analytics: candidateAnalytics || null
      };
    });

    // Sort by overall score
    comparison.sort((a, b) => {
      const scoreA = a.analytics?.overallScore || 0;
      const scoreB = b.analytics?.overallScore || 0;
      return scoreB - scoreA;
    });

    res.json(comparison);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
