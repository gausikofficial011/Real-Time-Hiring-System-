# IntervueAI - Setup & Installation Guide

This guide will help you set up and run the IntervueAI platform on your local machine.

## Prerequisites

Ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/downloads/)
- **Java** (v17 or higher) - [Download](https://www.oracle.com/java/technologies/downloads/)
- **Maven** (for Java Spring Boot) - [Download](https://maven.apache.org/download.cgi)

## Quick Start

### 1. Clone/Extract the Project

The project should be located at:
```
c:\Real-Time AI Hiring & Candidate Intelligence System
```

### 2. Start MongoDB

**Windows:**
```powershell
net start MongoDB
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
```

Verify MongoDB is running:
```bash
mongosh
```

### 3. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install Node.js dependencies:
```bash
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/intervueai
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

Install Python dependencies:
```bash
cd ai_service
pip install -r requirements.txt
cd ..
```

**Note:** The Java Spring Boot security service is optional for basic functionality. To run it:
```bash
cd java_security
mvn clean install
mvn spring-boot:run
```
(The Java service will run on port 8081)

Start the backend server:
```bash
npm start
```

Backend will run on: `http://localhost:5000`

### 4. Frontend Setup

Navigate to the frontend directory:
```bash
cd frontend
```

Install Node.js dependencies:
```bash
npm install
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

Start the frontend:
```bash
npm start
```

Frontend will run on: `http://localhost:3000`

### 5. Initialize SuperAdmin

Once the backend is running, open your browser and navigate to:
```
http://localhost:5000/api/auth/init
```

This will create the default superadmin account:
- **Email:** admin@intervueai.com
- **Password:** admin123

## Usage

### Login as SuperAdmin

1. Open `http://localhost:3000` in your browser
2. Login with:
   - Email: admin@intervueai.com
   - Password: admin123
3. You will be redirected to the SuperAdmin Dashboard

### Create a Candidate

1. In the SuperAdmin Dashboard, click "Add Candidate"
2. Fill in the candidate details:
   - Name
   - Email
   - Phone (optional)
   - Job Role
3. Click "Create Candidate"
4. Note the temporary credentials (if shown)

### Conduct an Interview

**As SuperAdmin:**
1. Click "Start Interview" on a candidate
2. Wait for the candidate to mark themselves as ready
3. Click "Start Interview" to begin
4. Monitor the AI analytics panel in real-time
5. End the interview when complete

**As Candidate:**
1. Login with temporary credentials
2. You will see the interview invitation
3. Click "Mark as Ready" when prepared
4. Wait in the waiting room for the interviewer
5. Join the interview when it starts
6. Participate in the video interview
7. The system will monitor for security violations
8. AI will analyze your performance in real-time

### View Reports

1. After an interview is completed, click "View Report" on the candidate
2. Review the comprehensive AI-generated report
3. Compare multiple candidates using the "Compare" feature

## Project Structure

```
intervueai/
├── backend/
│   ├── ai_service/          # Python AI/ML processing
│   ├── java_security/       # Java Spring Boot security
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── middleware/          # Express middleware
│   ├── server.js            # Main server file
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React Context
│   │   ├── pages/           # Page components
│   │   ├── services/        # API & Socket services
│   │   └── App.js
│   ├── package.json
│   └── tailwind.config.js
├── README.md
└── SETUP.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/init` - Initialize superadmin
- `GET /api/auth/me` - Get current user

### Candidates
- `GET /api/candidates` - Get all candidates
- `POST /api/candidates` - Create candidate
- `PUT /api/candidates/:id/ready` - Mark as ready
- `POST /api/candidates/compare` - Compare candidates

### Interviews
- `POST /api/interviews` - Create interview
- `PUT /api/interviews/:id/start` - Start interview
- `PUT /api/interviews/:id/end` - End interview

### Analytics
- `GET /api/analytics/interview/:id` - Get analytics
- `POST /api/analytics/:id/report` - Generate report

### AI
- `POST /api/ai/parse-resume` - Parse resume
- `POST /api/ai/analyze-emotion` - Analyze emotion
- `POST /api/ai/suggest-questions` - Get AI questions

### Security
- `POST /api/security/log-violation` - Log violation
- `GET /api/security/integrity/:id` - Get integrity score

### Ethical AI
- `POST /api/ethical/analyze-bias` - Analyze bias
- `GET /api/ethical/fairness-report` - Get fairness report

### Predictive
- `POST /api/predictive/career-growth` - Predict career growth
- `POST /api/predictive/success-probability` - Predict success
- `POST /api/predictive/attrition-risk` - Predict attrition

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `net start MongoDB` (Windows)
- Check the MongoDB URI in `.env`
- Verify MongoDB is accessible on port 27017

### Port Already in Use
- Change the PORT in backend `.env` file
- Change the port in frontend `.env` file (React uses 3000 by default)

### Python Dependencies
- Ensure Python 3.8+ is installed
- Use a virtual environment: `python -m venv venv`
- Activate virtual environment before installing

### Java Service Issues
- The Java service is optional for basic functionality
- Ensure Java 17+ and Maven are installed
- The service runs on port 8081

### Frontend Build Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear browser cache

### Socket.io Connection Issues
- Ensure backend is running
- Check CORS settings in backend `.env`
- Verify socket URL in frontend `.env`

## Development Tips

### Backend Development
- Use `npm run dev` for auto-restart with nodemon
- Check logs in terminal for errors
- Use MongoDB Compass to view database

### Frontend Development
- React hot reload is enabled by default
- Use browser DevTools for debugging
- Check Network tab for API calls

### Testing AI Features
- The Python AI service uses simulated data for demo
- In production, replace with actual ML models
- Test with different resume files

## Security Notes

**Important for Production:**
- Change the JWT_SECRET in backend `.env`
- Use HTTPS instead of HTTP
- Implement proper rate limiting
- Add input validation
- Use environment variables for sensitive data
- Enable CORS only for trusted domains
- Implement proper logging and monitoring

## Performance Optimization

- Use Redis for session storage in production
- Implement caching for frequently accessed data
- Use CDN for static assets
- Optimize database queries with indexes
- Implement pagination for large datasets

## Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Review the API endpoints section
3. Check browser console for errors
4. Check backend terminal for server errors

## Next Steps

After successful setup:
1. Create test candidates
2. Conduct test interviews
3. Review generated reports
4. Explore AI analytics
5. Test security monitoring
6. Try multi-language support
7. Review ethical AI reports
8. Explore predictive features

## License

This project is for demonstration purposes. Ensure compliance with local regulations when deploying for production use.
