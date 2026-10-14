const express = require('express');
const router = express.Router();
const { auth, superadminOnly } = require('../middleware/auth');
const { PythonShell } = require('python-shell');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/temp';
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

// Parse resume
router.post('/parse-resume', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const options = {
      mode: 'text',
      pythonPath: 'python',
      pythonOptions: ['-u'],
      scriptPath: path.join(__dirname, '../ai_service'),
      args: [req.file.path, 'parse_resume']
    };

    PythonShell.run('main.py', options, (err, results) => {
      if (err) {
        console.error('Python error:', err);
        return res.status(500).json({ error: 'Resume parsing failed' });
      }

      try {
        const parsedData = JSON.parse(results[0]);
        
        // Clean up temp file
        fs.unlinkSync(req.file.path);

        res.json(parsedData);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        res.status(500).json({ error: 'Failed to parse resume data' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyze emotion from video frame
router.post('/analyze-emotion', auth, upload.single('frame'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No frame uploaded' });
    }

    const options = {
      mode: 'text',
      pythonPath: 'python',
      pythonOptions: ['-u'],
      scriptPath: path.join(__dirname, '../ai_service'),
      args: [req.file.path, 'analyze_emotion']
    };

    PythonShell.run('main.py', options, (err, results) => {
      if (err) {
        console.error('Python error:', err);
        return res.status(500).json({ error: 'Emotion analysis failed' });
      }

      try {
        const emotionData = JSON.parse(results[0]);
        
        // Clean up temp file
        fs.unlinkSync(req.file.path);

        res.json(emotionData);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        res.status(500).json({ error: 'Failed to parse emotion data' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyze speech/audio
router.post('/analyze-speech', auth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio uploaded' });
    }

    const options = {
      mode: 'text',
      pythonPath: 'python',
      pythonOptions: ['-u'],
      scriptPath: path.join(__dirname, '../ai_service'),
      args: [req.file.path, 'analyze_speech', req.body.language || 'en']
    };

    PythonShell.run('main.py', options, (err, results) => {
      if (err) {
        console.error('Python error:', err);
        return res.status(500).json({ error: 'Speech analysis failed' });
      }

      try {
        const speechData = JSON.parse(results[0]);
        
        // Clean up temp file
        fs.unlinkSync(req.file.path);

        res.json(speechData);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        res.status(500).json({ error: 'Failed to parse speech data' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Detect faces and analyze
router.post('/detect-faces', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const options = {
      mode: 'text',
      pythonPath: 'python',
      pythonOptions: ['-u'],
      scriptPath: path.join(__dirname, '../ai_service'),
      args: [req.file.path, 'detect_faces']
    };

    PythonShell.run('main.py', options, (err, results) => {
      if (err) {
        console.error('Python error:', err);
        return res.status(500).json({ error: 'Face detection failed' });
      }

      try {
        const faceData = JSON.parse(results[0]);
        
        // Clean up temp file
        fs.unlinkSync(req.file.path);

        res.json(faceData);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        res.status(500).json({ error: 'Failed to parse face data' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyze eye tracking
router.post('/analyze-eyes', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const options = {
      mode: 'text',
      pythonPath: 'python',
      pythonOptions: ['-u'],
      scriptPath: path.join(__dirname, '../ai_service'),
      args: [req.file.path, 'analyze_eyes']
    };

    PythonShell.run('main.py', options, (err, results) => {
      if (err) {
        console.error('Python error:', err);
        return res.status(500).json({ error: 'Eye analysis failed' });
      }

      try {
        const eyeData = JSON.parse(results[0]);
        
        // Clean up temp file
        fs.unlinkSync(req.file.path);

        res.json(eyeData);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        res.status(500).json({ error: 'Failed to parse eye data' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI suggested questions
router.post('/suggest-questions', auth, superadminOnly, async (req, res) => {
  try {
    const { jobRole, candidateContext, previousAnswers } = req.body;

    const options = {
      mode: 'text',
      pythonPath: 'python',
      pythonOptions: ['-u'],
      scriptPath: path.join(__dirname, '../ai_service'),
      args: [JSON.stringify({ jobRole, candidateContext, previousAnswers }), 'suggest_questions']
    };

    PythonShell.run('main.py', options, (err, results) => {
      if (err) {
        console.error('Python error:', err);
        return res.status(500).json({ error: 'Question suggestion failed' });
      }

      try {
        const questions = JSON.parse(results[0]);
        res.json(questions);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        res.status(500).json({ error: 'Failed to parse questions' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Match skills with job role
router.post('/match-skills', auth, async (req, res) => {
  try {
    const { candidateSkills, jobRequirements } = req.body;

    const options = {
      mode: 'text',
      pythonPath: 'python',
      pythonOptions: ['-u'],
      scriptPath: path.join(__dirname, '../ai_service'),
      args: [JSON.stringify({ candidateSkills, jobRequirements }), 'match_skills']
    };

    PythonShell.run('main.py', options, (err, results) => {
      if (err) {
        console.error('Python error:', err);
        return res.status(500).json({ error: 'Skill matching failed' });
      }

      try {
        const matchResult = JSON.parse(results[0]);
        res.json(matchResult);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        res.status(500).json({ error: 'Failed to parse match result' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Detect deepfake
router.post('/detect-deepfake', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const options = {
      mode: 'text',
      pythonPath: 'python',
      pythonOptions: ['-u'],
      scriptPath: path.join(__dirname, '../ai_service'),
      args: [req.file.path, 'detect_deepfake']
    };

    PythonShell.run('main.py', options, (err, results) => {
      if (err) {
        console.error('Python error:', err);
        return res.status(500).json({ error: 'Deepfake detection failed' });
      }

      try {
        const deepfakeData = JSON.parse(results[0]);
        
        // Clean up temp file
        fs.unlinkSync(req.file.path);

        res.json(deepfakeData);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        res.status(500).json({ error: 'Failed to parse deepfake data' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
