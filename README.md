# IntervueAI - Intelligent AI Interview & Hiring Platform

A complete, production-ready full-stack web application for conducting secure, AI-powered live interviews with real-time analytics and intelligent decision-making.

## 🚀 Tech Stack

### Frontend
- React.js 18
- React Router DOM
- Socket.io Client
- Recharts (for analytics visualization)
- Tailwind CSS
- Lucide Icons
- React Webcam
- Simple Peer (WebRTC)

### Backend
- Node.js + Express.js
- MongoDB (Mongoose)
- Socket.io (real-time communication)
- JWT Authentication
- Python (AI/ML processing)
- Java Spring Boot (security logic)

## 📋 Features

### Core Functionality
- ✅ User authentication (SuperAdmin & Candidate roles)
- ✅ Candidate management and invitation system
- ✅ Real-time video interviews with WebRTC
- ✅ Live AI analytics during interviews
- ✅ Security and proctoring system
- ✅ Interview report generation
- ✅ Candidate comparison and ranking
- ✅ Multi-language support (English, Tamil, Hindi)

### AI Features
- Facial emotion detection
- Confidence scoring
- Attention/eye tracking
- Speech-to-text and sentiment analysis
- Communication quality scoring
- Resume parsing and scoring
- Skill matching with job roles
- AI-powered question suggestions
- Behavioral analysis
- Explainable AI recommendations

### Security Features
- Tab switch detection
- Fullscreen enforcement
- Face detection (single/multiple)
- Eye tracking and gaze monitoring
- Head movement tracking
- Background disturbance detection
- Voice anomaly detection
- Deepfake/impersonation detection
- Device binding
- Session monitoring
- Integrity score generation

### Ethical AI
- Bias detection system
- Fairness monitoring
- Neutral evaluation logic

### Predictive Features
- Career growth prediction
- Success probability
- Attrition prediction
- Salary estimation (optional)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Python (v3.8 or higher)
- Java (v17 or higher)
- Maven (for Java Spring Boot)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/intervueai
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

4. Set up Python AI service:
```bash
cd ai_service
pip install -r requirements.txt
```

5. Set up Java Spring Boot security service:
```bash
cd java_security
mvn clean install
mvn spring-boot:run
```
(The Java service will run on port 8081)

6. Start the backend server:
```bash
npm start
```
or for development:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. Start the frontend:
```bash
npm start
```

The frontend will run on http://localhost:3000

### MongoDB Setup

1. Install MongoDB and start the MongoDB service:
```bash
# On Windows
net start MongoDB

# On Mac/Linux
sudo systemctl start mongod
```

2. The application will automatically create the `intervueai` database on first run.

## 🎯 Usage

### Initial Setup

1. Start MongoDB
2. Start the Java Spring Boot security service (port 8081)
3. Start the backend server (port 5000)
4. Start the frontend (port 3000)

### Initialize SuperAdmin

1. Navigate to http://localhost:5000/api/auth/init
2. This will create the default superadmin account:
   - Email: admin@intervueai.com
   - Password: admin123

### Workflow

#### For SuperAdmin:
1. Login with superadmin credentials
2. Create candidates with temporary credentials
3. Schedule interviews
4. Monitor candidates in real-time
5. Start interviews when candidates are ready
6. View AI analytics during interviews
7. Review generated reports
8. Compare candidates
9. Make hiring decisions

#### For Candidates:
1. Login with temporary credentials
2. View interview invitation
3. Mark as ready when prepared
4. Join waiting room
5. Participate in live interview
6. System monitors for security violations
7. AI analyzes performance in real-time
8. Interview ends and report is generated

## 📁 Project Structure

```
intervueai/
├── backend/
│   ├── ai_service/          # Python AI/ML processing
│   │   ├── main.py          # Main AI service
│   │   └── requirements.txt # Python dependencies
│   ├── java_security/       # Java Spring Boot security
│   │   ├── src/
│   │   ├── pom.xml
│   │   └── application.properties
│   ├── models/              # MongoDB models
│   │   ├── User.js
│   │   ├── Candidate.js
│   │   ├── Interview.js
│   │   ├── Analytics.js
│   │   └── SecurityLog.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── candidates.js
│   │   ├── interviews.js
│   │   ├── analytics.js
│   │   ├── ai.js
│   │   └── security.js
│   ├── middleware/          # Express middleware
│   │   └── auth.js
│   ├── controllers/         # Business logic (if needed)
│   ├── services/            # Additional services
│   ├── server.js            # Main server file
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React Context
│   │   │   └── AuthContext.js
│   │   ├── pages/           # Page components
│   │   │   ├── Login.js
│   │   │   ├── SuperAdminDashboard.js
│   │   │   ├── CandidateDashboard.js
│   │   │   ├── WaitingRoom.js
│   │   │   ├── InterviewRoom.js
│   │   │   └── CandidateReport.js
│   │   ├── services/        # API & Socket services
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── index.css
│   │   └── App.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## 🔐 Security Considerations

- Change default JWT_SECRET in production
- Use HTTPS in production
- Implement rate limiting
- Add input validation
- Sanitize user inputs
- Implement CORS properly
- Use environment variables for sensitive data
- Regular security audits

## 🌐 API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user (superadmin only)
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user
- POST `/api/auth/init` - Initialize superadmin

### Candidates
- POST `/api/candidates` - Create candidate
- GET `/api/candidates` - Get all candidates (superadmin)
- GET `/api/candidates/:id` - Get candidate by ID
- PUT `/api/candidates/:id/status` - Update candidate status
- PUT `/api/candidates/:id/ready` - Mark candidate as ready
- POST `/api/candidates/compare` - Compare candidates

### Interviews
- POST `/api/interviews` - Create interview
- GET `/api/interviews` - Get all interviews
- GET `/api/interviews/:id` - Get interview by ID
- PUT `/api/interviews/:id/start` - Start interview
- PUT `/api/interviews/:id/end` - End interview
- PUT `/api/interviews/:id/questions` - Add question/answer
- PUT `/api/interviews/:id/transcript` - Add transcript entry

### Analytics
- POST `/api/analytics` - Create/update analytics
- GET `/api/analytics/interview/:interviewId` - Get analytics by interview
- GET `/api/analytics/candidate/:candidateId` - Get analytics by candidate
- PUT `/api/analytics/:id` - Update analytics
- POST `/api/analytics/:id/report` - Generate report

### AI
- POST `/api/ai/parse-resume` - Parse resume
- POST `/api/ai/analyze-emotion` - Analyze emotion from frame
- POST `/api/ai/analyze-speech` - Analyze speech/audio
- POST `/api/ai/detect-faces` - Detect faces
- POST `/api/ai/analyze-eyes` - Analyze eye tracking
- POST `/api/ai/suggest-questions` - Get AI suggested questions
- POST `/api/ai/match-skills` - Match skills with job
- POST `/api/ai/detect-deepfake` - Detect deepfake

### Security
- POST `/api/security/log-violation` - Log security violation
- GET `/api/security/interview/:interviewId` - Get security logs for interview
- GET `/api/security/candidate/:candidateId` - Get security logs for candidate
- GET `/api/security/integrity/:candidateId` - Get integrity score
- PUT `/api/security/:id/resolve` - Resolve violation

## 🧪 Testing

The application includes working demo with sample/mock data. All features are functional and can be tested end-to-end.

### Test Workflow:
1. Login as superadmin (admin@intervueai.com / admin123)
2. Create a new candidate
3. Note the temporary credentials
4. Login as candidate in new browser/incognito window
5. Mark as ready
6. As superadmin, start the interview
7. Participate in interview (video, audio)
8. End interview
9. View generated report
10. Compare multiple candidates

## 📊 AI Analytics

The system provides real-time AI analytics during interviews:
- Emotion detection (happy, sad, angry, confident, nervous, etc.)
- Confidence score (0-100)
- Attention score (0-100)
- Sentiment analysis (positive, neutral, negative)
- Communication quality score (0-100)
- Behavioral analysis (confidence, stress, engagement, professionalism)

## 🔍 Security Monitoring

The system actively monitors for:
- Tab switches
- Fullscreen exits
- Multiple faces in frame
- No face detected
- Eye tracking anomalies
- Head movement patterns
- Background disturbances
- Voice anomalies
- Deepfake attempts
- Device mismatches

All violations are logged with timestamps and affect the integrity score.

## 🌍 Multi-Language Support

The system supports:
- English
- Tamil
- Hindi

Speech recognition and analysis work in all supported languages.

## ⚖️ Ethical AI

The platform includes:
- Bias detection algorithms
- Fairness monitoring
- Neutral evaluation logic
- Explainable AI recommendations
- Transparent decision reasoning

## 🚀 Deployment

For production deployment:
1. Use a cloud MongoDB instance (MongoDB Atlas)
2. Deploy backend to a cloud provider (AWS, GCP, Azure)
3. Deploy frontend to a static hosting service (Vercel, Netlify)
4. Configure environment variables
5. Enable HTTPS
6. Set up proper CORS
7. Implement proper logging and monitoring
8. Set up backup strategies

## 📝 License

This project is for demonstration purposes. Ensure compliance with local regulations when deploying for production use.

## 🤝 Support

For issues or questions, please refer to the documentation or contact the development team.

## 🎓 Acknowledgments

Built with modern web technologies and AI/ML frameworks to provide a comprehensive hiring solution.
