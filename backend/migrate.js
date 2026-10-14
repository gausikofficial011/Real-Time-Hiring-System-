const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const Company = require('./models/Company');
const Candidate = require('./models/Candidate');
const Interview = require('./models/Interview');
const User = require('./models/User');

const migrate = async () => {
  try {
    const primaryURI = process.env.MONGODB_URI;
    const fallbackURI = 'mongodb://localhost:27017/intervueai';

    try {
      console.log('Attempting Primary DB Connect...');
      await mongoose.connect(primaryURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      console.log('Primary MongoDB connected.');
    } catch (err) {
      console.error('Primary DB failed, using local fallback.');
      await mongoose.connect(fallbackURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      console.log('Local MongoDB connected.');
    }

    // 1. Create Default Company
    let defaultCompany = await Company.findOne({ workspaceSlug: 'intervue-global' });
    if (!defaultCompany) {
      defaultCompany = new Company({
        name: 'Intervue Global',
        workspaceSlug: 'intervue-global',
        description: 'Default hiring workspace for all candidates.',
        roundsConfig: [
          { name: 'Initial Screening', type: 'aptitude', order: 1 },
          { name: 'AI Video Assessment', type: 'video_ai', order: 2 },
          { name: 'HR Final Round', type: 'hr', order: 3 }
        ]
      });
      const admin = await User.findOne({ role: 'superadmin' });
      if (admin) defaultCompany.adminIds.push(admin._id);
      await defaultCompany.save();
      console.log('Default company created.');
    }

    // 2. Migrate Candidates
    const candidates = await Candidate.find({ 'applications.0': { $exists: false } });
    for (const candidate of candidates) {
      // Move legacy fields to applications array
      candidate.applications = [{
        companyId: defaultCompany._id,
        status: candidate.status || 'invited',
        currentRound: 1,
        interviewId: candidate.interviewId || null
      }];
      await candidate.save();
    }
    console.log(`Migrated ${candidates.length} candidates.`);

    // 3. Migrate Interviews
    const interviews = await Interview.find({ companyId: { $exists: false } });
    for (const interview of interviews) {
      interview.companyId = defaultCompany._id;
      interview.roundNumber = 1;
      await interview.save();
    }
    console.log(`Migrated ${interviews.length} interviews.`);

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
