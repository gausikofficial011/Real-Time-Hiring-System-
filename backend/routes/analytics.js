const express = require('express');
const router = express.Router();
const { auth, superadminOnly } = require('../middleware/auth');
const Analytics = require('../models/Analytics');
const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');

// Create or update analytics for an interview
router.post('/', auth, superadminOnly, async (req, res) => {
  try {
    const { interviewId, analyticsData } = req.body;

    let analytics = await Analytics.findOne({ interviewId });

    if (analytics) {
      Object.assign(analytics, analyticsData);
      await analytics.save();
    } else {
      analytics = new Analytics({
        interviewId,
        candidateId: analyticsData.candidateId,
        ...analyticsData
      });
      await analytics.save();
    }

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get analytics by interview ID
router.get('/interview/:interviewId', auth, async (req, res) => {
  try {
    const analytics = await Analytics.findOne({ interviewId: req.params.interviewId })
      .populate('interviewId')
      .populate('candidateId');

    if (!analytics) {
      return res.status(404).json({ error: 'Analytics not found' });
    }

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get analytics by candidate ID
router.get('/candidate/:candidateId', auth, superadminOnly, async (req, res) => {
  try {
    const analytics = await Analytics.find({ candidateId: req.params.candidateId })
      .populate('interviewId')
      .populate('candidateId')
      .sort({ createdAt: -1 });

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update analytics in real-time
router.put('/:id', auth, superadminOnly, async (req, res) => {
  try {
    const analytics = await Analytics.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!analytics) {
      return res.status(404).json({ error: 'Analytics not found' });
    }

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(analytics.interviewId.toString()).emit('ai-analytics', analytics);

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate final report
router.post('/:id/report', auth, superadminOnly, async (req, res) => {
  try {
    const analytics = await Analytics.findById(req.params.id)
      .populate('interviewId')
      .populate('candidateId');

    if (!analytics) {
      return res.status(404).json({ error: 'Analytics not found' });
    }

    const interview = await Interview.findById(analytics.interviewId._id);
    const candidate = await Candidate.findById(analytics.candidateId._id);

    // Generate comprehensive report
    const report = {
      candidate: {
        name: candidate.name,
        email: candidate.email,
        jobRole: interview.jobRole
      },
      interview: {
        date: interview.startTime,
        duration: interview.duration,
        questionsAsked: interview.questions.length
      },
      scores: {
        overall: analytics.overallScore,
        confidence: analytics.behavioralAnalysis.confidence,
        communication: analytics.communicationQuality,
        attention: analytics.attentionScore
      },
      strengths: analytics.strengths,
      weaknesses: analytics.weaknesses,
      recommendation: analytics.recommendation,
      reasoning: analytics.reasoning,
      emotionTimeline: analytics.emotionData,
      behavioralAnalysis: analytics.behavioralAnalysis,
      speechAnalysis: analytics.speechAnalysis,
      generatedAt: new Date()
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all analytics for dashboard
router.get('/', auth, superadminOnly, async (req, res) => {
  try {
    const analytics = await Analytics.find()
      .populate('candidateId', 'name email')
      .populate('interviewId', 'jobRole status')
      .sort({ createdAt: -1 });

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
