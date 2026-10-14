const express = require('express');
const router = express.Router();
const { auth, superadminOnly, candidateOnly } = require('../middleware/auth');
const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');
const { v4: uuidv4 } = require('uuid');

// Create interview
router.post('/', auth, superadminOnly, async (req, res) => {
  try {
    const { candidateId, jobRole, scheduledTime } = req.body;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const interview = new Interview({
      candidateId,
      superadminId: req.userId,
      jobRole,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      meetingId: uuidv4(),
      status: 'scheduled'
    });

    await interview.save();

    // Update candidate with interview reference
    candidate.interviewId = interview._id;
    candidate.status = 'invited';
    await candidate.save();

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all interviews (superadmin)
router.get('/', auth, superadminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const interviews = await Interview.find(filter)
      .populate('candidateId')
      .populate('superadminId', 'name email')
      .sort({ createdAt: -1 });

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get interview by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidateId')
      .populate('superadminId', 'name email');

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Check authorization
    if (req.userRole === 'candidate' && interview.candidateId.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get interview by meeting ID
router.get('/meeting/:meetingId', auth, async (req, res) => {
  try {
    const interview = await Interview.findOne({ meetingId: req.params.meetingId })
      .populate('candidateId')
      .populate('superadminId', 'name email');

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start interview
router.put('/:id/start', auth, superadminOnly, async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      {
        status: 'in_progress',
        startTime: new Date()
      },
      { new: true }
    ).populate('candidateId');

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Update candidate status
    await Candidate.findByIdAndUpdate(interview.candidateId._id, { status: 'in_interview' });

    // Emit socket event
    const io = req.app.get('io');
    io.to(interview._id.toString()).emit('interview-start', { interviewId: interview._id });

    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// End interview
router.put('/:id/end', auth, superadminOnly, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    interview.status = 'completed';
    interview.endTime = new Date();
    interview.duration = Math.floor((interview.endTime - interview.startTime) / 1000 / 60); // in minutes
    await interview.save();

    // Update candidate status
    await Candidate.findByIdAndUpdate(interview.candidateId, { status: 'completed' });

    // Emit socket event
    const io = req.app.get('io');
    io.to(interview._id.toString()).emit('interview-end', { interviewId: interview._id });

    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add question and answer
router.put('/:id/questions', auth, async (req, res) => {
  try {
    const { question, answer, aiSuggested, duration } = req.body;
    
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    interview.questions.push({
      id: uuidv4(),
      question,
      answer,
      aiSuggested: aiSuggested || false,
      timestamp: new Date(),
      duration
    });

    await interview.save();
    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add transcript entry
router.put('/:id/transcript', auth, async (req, res) => {
  try {
    const { speaker, text, sentiment } = req.body;
    
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    interview.transcript.push({
      speaker,
      text,
      timestamp: new Date(),
      sentiment: sentiment || 'neutral'
    });

    await interview.save();
    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get candidate's interview
router.get('/candidate/me', auth, candidateOnly, async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ userId: req.userId });
    if (!candidate || !candidate.interviewId) {
      return res.status(404).json({ error: 'No interview found' });
    }

    const interview = await Interview.findById(candidate.interviewId)
      .populate('superadminId', 'name email');

    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
