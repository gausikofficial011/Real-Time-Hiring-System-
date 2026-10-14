const express = require('express');
const router = express.Router();
const { auth, superadminOnly } = require('../middleware/auth');
const Company = require('../models/Company');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');

// Get all companies (Public for discovery)
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find().select('name logo description workspaceSlug');
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get company by slug (Public for workspace access)
router.get('/workspace/:slug', async (req, res) => {
  try {
    const company = await Company.findOne({ workspaceSlug: req.params.slug });
    if (!company) {
      return res.status(404).json({ error: 'Company workspace not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create company (Superadmin only)
router.post('/', auth, superadminOnly, async (req, res) => {
  try {
    const { name, logo, description, workspaceSlug, roundsConfig } = req.body;
    
    const existingCompany = await Company.findOne({ $or: [{ name }, { workspaceSlug }] });
    if (existingCompany) {
      return res.status(400).json({ error: 'Company with this name or slug already exists' });
    }

    const company = new Company({
      name,
      logo,
      description,
      workspaceSlug,
      roundsConfig: roundsConfig || [
        { name: 'Initial Assessment', type: 'aptitude', order: 1 },
        { name: 'AI Video Interview', type: 'video_ai', order: 2 },
        { name: 'Technical Round', type: 'technical', order: 3 }
      ],
      adminIds: [req.userId]
    });

    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply to a company round
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const companyId = req.params.id;
    const candidate = await Candidate.findOne({ userId: req.userId });
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate profile not found. Please register first.' });
    }

    const existingApp = candidate.applications.find(app => app.companyId.toString() === companyId);
    if (existingApp) {
      return res.status(400).json({ error: 'You have already applied to this company' });
    }

    candidate.applications.push({
      companyId,
      status: 'invited',
      currentRound: 1
    });

    await candidate.save();
    res.json({ message: 'Application submitted successfully', candidate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Publish/Unpublish results for a company
router.put('/:id/publish-results', auth, superadminOnly, async (req, res) => {
  try {
    const { roundId, isPublished } = req.body;
    const company = await Company.findById(req.params.id);
    
    if (!company) return res.status(404).json({ error: 'Company not found' });

    // Update specific round's publication status
    const round = company.roundsConfig.id(roundId);
    if (round) {
      round.isPublished = isPublished;
      await company.save();
    }

    res.json({ message: 'Publication status updated', company });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
