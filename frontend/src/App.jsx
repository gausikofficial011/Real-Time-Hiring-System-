import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import WaitingRoom from './pages/WaitingRoom';
import InterviewRoom from './pages/InterviewRoom';
import CandidateReport from './pages/CandidateReport';
import CompanyWorkspace from './pages/CompanyWorkspace';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'superadmin' ? '/superadmin' : '/candidate'} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/company/:slug" element={<CompanyWorkspace />} />
            
            <Route 
              path="/superadmin" 
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/candidate" 
              element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <CandidateDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/waiting-room/:candidateId" 
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <WaitingRoom />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/interview/:interviewId" 
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'candidate']}>
                  <InterviewRoom />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/report/:candidateId" 
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <CandidateReport />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
