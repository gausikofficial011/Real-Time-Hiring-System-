const express = require('express');
const router = express.Router();
const { auth, superadminOnly } = require('../middleware/auth');
const Analytics = require('../models/Analytics');
const Candidate = require('../models/Candidate');

// Predict career growth for a candidate
router.post('/career-growth', auth, superadminOnly, async (req, res) => {
  try {
    const { candidateId } = req.body;

    const analytics = await Analytics.findOne({ candidateId });
    const candidate = await Candidate.findById(candidateId);

    if (!analytics || !candidate) {
      return res.status(404).json({ error: 'Candidate or analytics not found' });
    }

    // Simulated career growth prediction
    // In production, use ML models trained on historical data
    const prediction = {
      candidateId,
      overallScore: analytics.overallScore,
      predictions: {
        oneYear: {
          role: predictRole(analytics.overallScore, 1),
          probability: 0.85,
          salaryIncrease: predictSalaryIncrease(analytics.overallScore, 1)
        },
        threeYears: {
          role: predictRole(analytics.overallScore, 3),
          probability: 0.72,
          salaryIncrease: predictSalaryIncrease(analytics.overallScore, 3)
        },
        fiveYears: {
          role: predictRole(analytics.overallScore, 5),
          probability: 0.65,
          salaryIncrease: predictSalaryIncrease(analytics.overallScore, 5)
        }
      },
      growthFactors: {
        leadershipPotential: analytics.behavioralAnalysis?.confidence * 0.8 + 20,
        technicalGrowth: analytics.communicationQuality * 0.9 + 10,
        adaptability: analytics.attentionScore * 0.7 + 30
      },
      recommendations: [
        'Focus on developing leadership skills',
        'Pursue advanced technical certifications',
        'Take on cross-functional projects'
      ],
      confidence: 0.78
    };

    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Predict success probability
router.post('/success-probability', auth, superadminOnly, async (req, res) => {
  try {
    const { candidateId } = req.body;

    const analytics = await Analytics.findOne({ candidateId });

    if (!analytics) {
      return res.status(404).json({ error: 'Analytics not found' });
    }

    // Calculate success probability based on various factors
    const factors = {
      technicalSkills: analytics.communicationQuality * 0.3,
      communication: analytics.communicationQuality * 0.25,
      confidence: analytics.behavioralAnalysis?.confidence * 0.2,
      attention: analytics.attentionScore * 0.15,
      professionalism: analytics.behavioralAnalysis?.professionalism * 0.1
    };

    const totalProbability = Object.values(factors).reduce((a, b) => a + b, 0);

    const prediction = {
      candidateId,
      successProbability: Math.min(95, Math.max(40, totalProbability)),
      factors,
      riskFactors: identifyRiskFactors(analytics),
      strengths: identifyStrengths(analytics),
      recommendation: getSuccessRecommendation(totalProbability),
      confidence: 0.82
    };

    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Predict attrition risk
router.post('/attrition-risk', auth, superadminOnly, async (req, res) => {
  try {
    const { candidateId } = req.body;

    const analytics = await Analytics.findOne({ candidateId });

    if (!analytics) {
      return res.status(404).json({ error: 'Analytics not found' });
    }

    // Calculate attrition risk
    const riskFactors = {
      lowEngagement: analytics.behavioralAnalysis?.engagement < 60 ? 0.3 : 0,
      highStress: analytics.behavioralAnalysis?.stress > 70 ? 0.25 : 0,
      lowConfidence: analytics.behavioralAnalysis?.confidence < 50 ? 0.2 : 0,
      poorCommunication: analytics.communicationQuality < 50 ? 0.15 : 0
    };

    const totalRisk = Object.values(riskFactors).reduce((a, b) => a + b, 0);

    const prediction = {
      candidateId,
      attritionRisk: Math.min(80, Math.max(10, totalRisk * 100)),
      riskLevel: getRiskLevel(totalRisk * 100),
      riskFactors,
      timeframe: predictAttritionTimeframe(totalRisk * 100),
      retentionStrategies: getRetentionStrategies(riskFactors),
      confidence: 0.75
    };

    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Estimate salary
router.post('/salary-estimate', auth, superadminOnly, async (req, res) => {
  try {
    const { candidateId, jobRole, location, experience } = req.body;

    const analytics = await Analytics.findOne({ candidateId });

    // Base salary ranges (simplified - in production, use real market data)
    const baseSalaries = {
      'Software Engineer': { min: 80000, max: 150000 },
      'Data Scientist': { min: 90000, max: 160000 },
      'Product Manager': { min: 100000, max: 180000 },
      'UX Designer': { min: 75000, max: 140000 },
      'DevOps Engineer': { min: 85000, max: 155000 }
    };

    const base = baseSalaries[jobRole] || { min: 70000, max: 130000 };

    // Adjust based on analytics score
    const scoreMultiplier = analytics ? (analytics.overallScore / 100) * 0.3 + 0.85 : 1;

    // Adjust for experience
    const experienceMultiplier = 1 + (experience || 0) * 0.1;

    // Adjust for location (simplified)
    const locationMultiplier = location === 'high_cost' ? 1.3 : 1;

    const estimatedMin = base.min * scoreMultiplier * experienceMultiplier * locationMultiplier;
    const estimatedMax = base.max * scoreMultiplier * experienceMultiplier * locationMultiplier;

    const prediction = {
      candidateId,
      jobRole,
      estimatedSalary: {
        min: Math.round(estimatedMin),
        max: Math.round(estimatedMax),
        average: Math.round((estimatedMin + estimatedMax) / 2)
      },
      factors: {
        performanceScore: analytics?.overallScore || 0,
        experience: experience || 0,
        location: location || 'standard'
      },
      marketComparison: getMarketComparison(jobRole, (estimatedMin + estimatedMax) / 2),
      confidence: 0.70
    };

    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get team composition recommendations
router.post('/team-composition', auth, superadminOnly, async (req, res) => {
  try {
    const { candidateIds, teamSize } = req.body;

    const candidates = await Candidate.find({ _id: { $in: candidateIds } });
    const analyticsList = await Analytics.find({ candidateId: { $in: candidateIds } });

    // Analyze team composition
    const composition = {
      recommendedMix: {
        leaders: Math.max(1, Math.round(teamSize * 0.2)),
        specialists: Math.round(teamSize * 0.5),
        generalists: Math.round(teamSize * 0.3)
      },
      skillCoverage: analyzeSkillCoverage(candidates, analyticsList),
      personalityFit: analyzePersonalityFit(analyticsList),
      diversityMetrics: analyzeDiversity(candidates),
      recommendations: [
        'Ensure balanced skill distribution',
        'Include diverse perspectives',
        'Consider complementary personality types',
        'Balance experience levels'
      ],
      confidence: 0.75
    };

    res.json(composition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function predictRole(score, years) {
  const roles = {
    high: ['Senior Engineer', 'Team Lead', 'Architect'],
    medium: ['Engineer', 'Senior Engineer'],
    low: ['Junior Engineer', 'Engineer']
  };
  
  const level = score > 80 ? 'high' : score > 60 ? 'medium' : 'low';
  const roleList = roles[level];
  return roleList[Math.floor(Math.random() * roleList.length)];
}

function predictSalaryIncrease(score, years) {
  const baseIncrease = score > 80 ? 15 : score > 60 ? 10 : 5;
  return baseIncrease * years;
}

function identifyRiskFactors(analytics) {
  const risks = [];
  if (analytics.behavioralAnalysis?.stress > 70) risks.push('High stress levels');
  if (analytics.behavioralAnalysis?.engagement < 50) risks.push('Low engagement');
  if (analytics.communicationQuality < 50) risks.push('Communication gaps');
  if (analytics.attentionScore < 50) risks.push('Attention issues');
  return risks;
}

function identifyStrengths(analytics) {
  const strengths = [];
  if (analytics.behavioralAnalysis?.confidence > 70) strengths.push('High confidence');
  if (analytics.communicationQuality > 70) strengths.push('Strong communication');
  if (analytics.attentionScore > 70) strengths.push('Good focus');
  if (analytics.behavioralAnalysis?.engagement > 70) strengths.push('High engagement');
  return strengths;
}

function getSuccessRecommendation(probability) {
  if (probability > 80) return 'Highly recommended for hire';
  if (probability > 60) return 'Good candidate with growth potential';
  if (probability > 40) return 'Consider with reservations';
  return 'Not recommended at this time';
}

function getRiskLevel(risk) {
  if (risk > 60) return 'High';
  if (risk > 40) return 'Medium';
  return 'Low';
}

function predictAttritionTimeframe(risk) {
  if (risk > 60) return '6-12 months';
  if (risk > 40) return '12-24 months';
  return '24+ months';
}

function getRetentionStrategies(riskFactors) {
  const strategies = [];
  if (riskFactors.lowEngagement > 0) strategies.push('Provide challenging projects');
  if (riskFactors.highStress > 0) strategies.push('Offer work-life balance support');
  if (riskFactors.lowConfidence > 0) strategies.push('Provide mentorship');
  if (riskFactors.poorCommunication > 0) strategies.push('Offer communication training');
  return strategies;
}

function getMarketComparison(role, salary) {
  const averages = {
    'Software Engineer': 115000,
    'Data Scientist': 125000,
    'Product Manager': 140000,
    'UX Designer': 110000,
    'DevOps Engineer': 120000
  };
  
  const avg = averages[role] || 115000;
  const diff = ((salary - avg) / avg) * 100;
  
  return {
    marketAverage: avg,
    difference: diff.toFixed(1) + '%',
    aboveMarket: diff > 0
  };
}

function analyzeSkillCoverage(candidates, analyticsList) {
  return {
    technical: 85,
    softSkills: 78,
    leadership: 65,
    overall: 76
  };
}

function analyzePersonalityFit(analyticsList) {
  return {
    collaborative: 80,
    independent: 70,
    detailOriented: 75,
    bigPicture: 68,
    overall: 73
  };
}

function analyzeDiversity(candidates) {
  return {
    genderDiversity: 0.75,
    experienceDiversity: 0.68,
    backgroundDiversity: 0.72,
    overall: 0.72
  };
}

module.exports = router;
