const express = require('express');
const router = express.Router();
const { auth, superadminOnly } = require('../middleware/auth');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register Candidate (Public)
router.post('/register-candidate', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = new User({
      email,
      password,
      name,
      role: 'candidate',
      phone,
      isTemporary: false
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Candidate registered successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register (only superadmin can register other roles)
router.post('/register', superadminOnly, async (req, res) => {
  try {
    const { email, password, name, role, phone, isTemporary } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = new User({
      email,
      password,
      name,
      role: role || 'candidate',
      phone,
      isTemporary: isTemporary || false
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, deviceId } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: user.role === 'superadmin' ? '365d' : '7d' } // 1 year for SuperAdmin
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isTemporary: user.isTemporary
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        isTemporary: req.user.isTemporary
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or Reset default superadmin
router.post('/init', async (req, res) => {
  try {
    console.log('--- SuperAdmin Initialization Triggered ---');
    let admin = await User.findOne({ role: 'superadmin' });
    
    if (admin) {
      admin.email = 'admin@intervueai.com';
      admin.password = 'admin123';
      admin.name = 'Super Admin (Reset)';
      await admin.save();
      console.log('SuperAdmin credentials reset to default: admin@intervueai.com');
      return res.status(200).json({ 
        message: 'Superadmin credentials have been reset to default.',
        email: 'admin@intervueai.com'
      });
    }

    admin = new User({
      email: 'admin@intervueai.com',
      password: 'admin123',
      name: 'Super Admin',
      role: 'superadmin',
      isTemporary: false
    });

    await admin.save();
    console.log('New SuperAdmin created: admin@intervueai.com');

    res.status(201).json({
      message: 'Superadmin created successfully',
      credentials: {
        email: 'admin@intervueai.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('SuperAdmin Init Error:', error);
    res.status(500).json({ error: 'Initialization failed: ' + error.message });
  }
});

// Google OAuth Login/Signup
router.post('/google-login', async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ error: 'Google credential (token) is missing' });
    }

    // Verify the Google ID Token
    console.log('Verifying Google Token...');
    console.log('Credential length:', credential?.length);
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      console.log('Token verified successfully');
    } catch (verifyError) {
      console.error('Google Token Verification Failed:', verifyError.message);
      return res.status(401).json({ error: 'Invalid Google token: ' + verifyError.message });
    }
    
    const payload = ticket.getPayload();
    console.log('Google Payload:', JSON.stringify(payload, null, 2));
    const { sub: googleId, email, name, picture: imageUrl } = payload;
    
    console.log(`Google Auth Attempt: ${email}`);

    let user = await User.findOne({ 
      $or: [{ googleId }, { email }] 
    });

    if (!user) {
      // Create new user via Google Sign-up
      console.log(`Creating new user for ${email} via Google`);
      user = new User({
        email,
        name,
        googleId,
        role: 'candidate',
        isTemporary: false
      });
      await user.save();
    } else if (!user.googleId) {
      // Link Google ID to existing email account
      console.log(`Linking Google ID to existing user ${email}`);
      user.googleId = googleId;
      await user.save();
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: user.role === 'superadmin' ? '365d' : '7d' }
    );

    res.json({
      message: 'Google login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isTemporary: user.isTemporary
      },
      token
    });
  } catch (error) {
    console.error('General Google Login Error:', error);
    res.status(500).json({ error: 'Authentication failed: ' + error.message });
  }
});

module.exports = router;
