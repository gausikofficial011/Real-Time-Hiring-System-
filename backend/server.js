const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Security middleware
app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  contentSecurityPolicy: false // Disabling CSP for development as it's causing multiple issues with Google GSI and inline styles
}));
// CORS Configuration
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

console.log('Allowed CORS Origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection logic with fallback
const connectDB = async () => {
  const primaryURI = process.env.MONGODB_URI;
  const fallbackURI = 'mongodb://localhost:27017/intervueai';

  try {
    console.log('Attempting to connect to Primary MongoDB...');
    await mongoose.connect(primaryURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Primary MongoDB connected successfully');
  } catch (err) {
    console.error('Primary MongoDB connection error:', err.message);
    console.log('Attempting to connect to Fallback Local MongoDB...');
    try {
      await mongoose.connect(fallbackURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      console.log('Fallback Local MongoDB connected successfully');
    } catch (fallbackErr) {
      console.error('All MongoDB connection attempts failed:', fallbackErr.message);
      console.log('Backend will continue running, but database operations will fail.');
    }
  }
};

connectDB().then(async () => {
  // Auto-initialize superadmin if no users exist
  const User = require('./models/User');
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found in database. Initializing default SuperAdmin...');
      const admin = new User({
        email: 'admin@intervueai.com',
        password: 'admin123',
        name: 'Super Admin',
        role: 'superadmin',
        isTemporary: false
      });
      await admin.save();
      console.log('Default SuperAdmin created: admin@intervueai.com / admin123');
    }
  } catch (err) {
    console.error('Error during auto-initialization:', err.message);
  }
});

// Import routes
const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidates');
const interviewRoutes = require('./routes/interviews');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');
const securityRoutes = require('./routes/security');
const ethicalRoutes = require('./routes/ethical');
const predictiveRoutes = require('./routes/predictive');
const companyRoutes = require('./routes/companies');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/ethical', ethicalRoutes);
app.use('/api/predictive', predictiveRoutes);
app.use('/api/companies', companyRoutes);

// Socket.io for real-time communication
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-interview', (interviewId) => {
    socket.join(interviewId);
    console.log(`User joined interview: ${interviewId}`);
  });

  socket.on('leave-interview', (interviewId) => {
    socket.leave(interviewId);
    console.log(`User left interview: ${interviewId}`);
  });

  socket.on('candidate-ready', (data) => {
    io.to(data.interviewId).emit('candidate-ready', data);
  });

  socket.on('interview-start', (data) => {
    io.to(data.interviewId).emit('interview-start', data);
  });

  socket.on('interview-end', (data) => {
    io.to(data.interviewId).emit('interview-end', data);
  });

  socket.on('video-signal', (data) => {
    socket.to(data.interviewId).emit('video-signal', data);
  });

  socket.on('ai-analytics', (data) => {
    io.to(data.interviewId).emit('ai-analytics', data);
  });

  socket.on('security-alert', (data) => {
    io.to(data.interviewId).emit('security-alert', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'IntervueAI Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
