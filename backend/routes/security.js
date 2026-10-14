const express = require('express');
const router = express.Router();
const { auth, superadminOnly } = require('../middleware/auth');
const SecurityLog = require('../models/SecurityLog');
const Candidate = require('../models/Candidate');

// Log security violation
router.post('/log-violation', auth, async (req, res) => {
  try {
    const { interviewId, violationType, severity, details } = req.body;

    // Get candidate ID from request if candidate
    let candidateId = req.body.candidateId;
    if (req.userRole === 'candidate') {
      const candidate = await Candidate.findOne({ userId: req.userId });
      candidateId = candidate._id;
    }

    const securityLog = new SecurityLog({
      interviewId,
      candidateId,
      violationType,
      severity,
      details
    });

    await securityLog.save();

    // Emit socket event for real-time alert
    const io = req.app.get('io');
    if (interviewId) {
      io.to(interviewId.toString()).emit('security-alert', {
        violationType,
        severity,
        timestamp: securityLog.timestamp,
        candidateId
      });
    }

    res.status(201).json(securityLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get security logs for interview
router.get('/interview/:interviewId', auth, superadminOnly, async (req, res) => {
  try {
    const logs = await SecurityLog.find({ interviewId: req.params.interviewId })
      .populate('candidateId', 'name email')
      .sort({ timestamp: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get security logs for candidate
router.get('/candidate/:candidateId', auth, superadminOnly, async (req, res) => {
  try {
    const logs = await SecurityLog.find({ candidateId: req.params.candidateId })
      .sort({ timestamp: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate integrity score
router.get('/integrity/:candidateId', auth, superadminOnly, async (req, res) => {
  try {
    const logs = await SecurityLog.find({ candidateId: req.params.candidateId });

    let integrityScore = 100;
    logs.forEach(log => {
      switch (log.severity) {
        case 'low':
          integrityScore -= 5;
          break;
        case 'medium':
          integrityScore -= 10;
          break;
        case 'high':
          integrityScore -= 20;
          break;
        case 'critical':
          integrityScore -= 40;
          break;
      }
    });

    integrityScore = Math.max(0, integrityScore);

    res.json({
      candidateId: req.params.candidateId,
      integrityScore,
      totalViolations: logs.length,
      violationsBySeverity: {
        low: logs.filter(l => l.severity === 'low').length,
        medium: logs.filter(l => l.severity === 'medium').length,
        high: logs.filter(l => l.severity === 'high').length,
        critical: logs.filter(l => l.severity === 'critical').length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve violation
router.put('/:id/resolve', auth, superadminOnly, async (req, res) => {
  try {
    const log = await SecurityLog.findByIdAndUpdate(
      req.params.id,
      { resolved: true },
      { new: true }
    );

    if (!log) {
      return res.status(404).json({ error: 'Security log not found' });
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all security logs (admin)
router.get('/', auth, superadminOnly, async (req, res) => {
  try {
    const { candidateId, violationType, severity } = req.query;
    const filter = {};
    if (candidateId) filter.candidateId = candidateId;
    if (violationType) filter.violationType = violationType;
    if (severity) filter.severity = severity;

    const logs = await SecurityLog.find(filter)
      .populate('candidateId', 'name email')
      .populate('interviewId', 'jobRole')
      .sort({ timestamp: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
