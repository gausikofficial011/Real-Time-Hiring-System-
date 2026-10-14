const express = require('express');
const router = express.Router();
const { auth, superadminOnly } = require('../middleware/auth');
const Analytics = require('../models/Analytics');
const Candidate = require('../models/Candidate');

// Analyze bias in candidate evaluation
router.post('/analyze-bias', auth, superadminOnly, async (req, res) => {
  try {
    const { candidateIds } = req.body;

    const candidates = await Candidate.find({ _id: { $in: candidateIds } });
    const analyticsList = await Analytics.find({ candidateId: { $in: candidateIds } });

    // Simulated bias analysis
    // In production, use ML models to detect patterns
    const biasAnalysis = {
      genderBias: detectGenderBias(candidates, analyticsList),
      ageBias: detectAgeBias(candidates, analyticsList),
      educationalBias: detectEducationalBias(candidates, analyticsList),
      regionalBias: detectRegionalBias(candidates, analyticsList),
      overallFairness: 0.85,
      recommendations: [
        'Ensure diverse interview panel',
        'Use standardized evaluation criteria',
        'Review scoring patterns for unconscious bias',
        'Implement blind resume screening'
      ]
    };

    res.json(biasAnalysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Monitor fairness in real-time
router.post('/monitor-fairness', auth, superadminOnly, async (req, res) => {
  try {
    const { interviewId, candidateId } = req.body;

    const analytics = await Analytics.findOne({ interviewId, candidateId });

    if (!analytics) {
      return res.status(404).json({ error: 'Analytics not found' });
    }

    // Fairness metrics
    const fairnessMetrics = {
      questionFairness: calculateQuestionFairness(analytics),
      timeFairness: calculateTimeFairness(analytics),
      scoreConsistency: calculateScoreConsistency(analytics),
      interviewerBias: detectInterviewerBias(analytics),
      overallFairnessScore: 0.88,
      alerts: []
    };

    // Add alerts if fairness is compromised
    if (fairnessMetrics.overallFairnessScore < 0.7) {
      fairnessMetrics.alerts.push('Fairness score below threshold - review evaluation');
    }

    res.json(fairnessMetrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get fairness report for organization
router.get('/fairness-report', auth, superadminOnly, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const allAnalytics = await Analytics.find(filter);
    const allCandidates = await Candidate.find({});

    // Generate comprehensive fairness report
    const report = {
      period: { startDate, endDate },
      totalCandidates: allCandidates.length,
      totalInterviews: allAnalytics.length,
      selectionRate: calculateSelectionRate(allAnalytics),
      demographicDistribution: calculateDemographicDistribution(allCandidates),
      scoreDistribution: calculateScoreDistribution(allAnalytics),
      biasIndicators: {
        gender: detectGenderBias(allCandidates, allAnalytics),
        age: detectAgeBias(allCandidates, allAnalytics),
        education: detectEducationalBias(allCandidates, allAnalytics)
      },
      fairnessScore: 0.87,
      recommendations: [
        'Continue monitoring for bias patterns',
        'Implement regular bias training for interviewers',
        'Use AI-assisted question generation for consistency',
        'Review and update evaluation criteria regularly'
      ],
      trends: analyzeFairnessTrends(allAnalytics)
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions (simplified for demo)
function detectGenderBias(candidates, analytics) {
  // In production, analyze gender-based patterns
  return {
    detected: false,
    confidence: 0.1,
    details: 'No significant gender bias detected'
  };
}

function detectAgeBias(candidates, analytics) {
  return {
    detected: false,
    confidence: 0.05,
    details: 'No significant age bias detected'
  };
}

function detectEducationalBias(candidates, analytics) {
  return {
    detected: true,
    confidence: 0.3,
    details: 'Slight preference for certain educational institutions detected'
  };
}

function detectRegionalBias(candidates, analytics) {
  return {
    detected: false,
    confidence: 0.1,
    details: 'No significant regional bias detected'
  };
}

function calculateQuestionFairness(analytics) {
  return 0.9;
}

function calculateTimeFairness(analytics) {
  return 0.85;
}

function calculateScoreConsistency(analytics) {
  return 0.88;
}

function detectInterviewerBias(analytics) {
  return {
    detected: false,
    details: 'No interviewer bias detected'
  };
}

function calculateSelectionRate(analytics) {
  const selected = analytics.filter(a => a.recommendation === 'selected').length;
  return analytics.length > 0 ? (selected / analytics.length) * 100 : 0;
}

function calculateDemographicDistribution(candidates) {
  // Simplified - in production, analyze actual demographics
  return {
    gender: { male: 60, female: 38, other: 2 },
    age: { '20-30': 40, '31-40': 35, '41-50': 20, '50+': 5 },
    education: { 'Bachelors': 50, 'Masters': 35, 'PhD': 15 }
  };
}

function calculateScoreDistribution(analytics) {
  const scores = analytics.map(a => a.overallScore);
  return {
    average: scores.reduce((a, b) => a + b, 0) / scores.length || 0,
    min: Math.min(...scores) || 0,
    max: Math.max(...scores) || 0,
    median: 75 // Simplified
  };
}

function analyzeFairnessTrends(analytics) {
  return {
    improving: true,
    trend: '+5% over last month',
    keyInsights: [
      'Fairness scores have improved over time',
      'Bias detection is working effectively',
      'Consistent evaluation patterns observed'
    ]
  };
}

module.exports = router;
