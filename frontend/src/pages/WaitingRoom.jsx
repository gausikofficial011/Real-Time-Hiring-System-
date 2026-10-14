import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getSocket } from '../services/socket';
import toast from 'react-hot-toast';
import { Clock, Users, Video, CheckCircle, AlertCircle } from 'lucide-react';

const WaitingRoom = () => {
  const { interviewId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    fetchInterviewData();
    connectToSocket();

    return () => {
      const socket = getSocket();
      socket?.emit('leave-interview', interviewId);
    };
  }, [interviewId]);

  const fetchInterviewData = async () => {
    try {
      const interviewResponse = await api.get(`/interviews/${interviewId}`);
      setInterview(interviewResponse.data);

      const candidateResponse = await api.get(`/candidates/profile/me`);
      setCandidate(candidateResponse.data);
      setIsReady(candidateResponse.data.status === 'ready');
    } catch (error) {
      toast.error('Failed to fetch interview data');
    } finally {
      setLoading(false);
    }
  };

  const connectToSocket = () => {
    const socket = getSocket();
    
    socket.on('connect', () => {
      setConnectionStatus('connected');
      socket.emit('join-interview', interviewId);
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('interview-start', (data) => {
      toast.success('Interview is starting!');
      navigate(`/interview/${interviewId}`);
    });

    socket.on('error', (error) => {
      toast.error(error.message);
    });
  };

  const handleReady = async () => {
    try {
      await api.put(`/candidates/${candidate._id}/ready`);
      setIsReady(true);
      toast.success('You are marked as ready');

      const socket = getSocket();
      socket.emit('candidate-ready', {
        interviewId,
        candidateId: candidate._id,
        name: candidate.name
      });
    } catch (error) {
      toast.error('Failed to mark as ready');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading waiting room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Waiting Room</h1>
          <div className={`flex items-center gap-2 ${connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-600' : 'bg-red-600'}`}></div>
            <span className="text-sm font-medium">
              {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="card mb-6">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {isReady ? (
                <CheckCircle className="w-20 h-20 text-green-500" />
              ) : (
                <AlertCircle className="w-20 h-20 text-yellow-500" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isReady ? 'You are Ready!' : 'Get Ready'}
            </h2>
            <p className="text-gray-600">
              {isReady 
                ? 'The interviewer will start the interview shortly'
                : 'Click the button below when you are ready to begin'
              }
            </p>
          </div>

          {/* Interview Info */}
          {interview && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Video className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-500">Job Role</p>
                    <p className="font-semibold">{interview.jobRole}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-500">Meeting ID</p>
                    <p className="font-semibold">{interview.meetingId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-500">Interviewer</p>
                    <p className="font-semibold">{interview.superadminId?.name || 'Not assigned'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold capitalize">{interview.status.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ready Button */}
          {!isReady && (
            <button
              onClick={handleReady}
              className="btn-primary w-full py-4 text-lg mb-6"
            >
              I'm Ready
            </button>
          )}

          {/* Waiting Message */}
          {isReady && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-6 h-6 text-blue-600 animate-pulse" />
                <p className="font-semibold text-blue-900">Waiting for Interviewer</p>
              </div>
              <p className="text-blue-700">
                Please stay on this page. The interviewer will start the interview when ready.
                Do not close this browser window or switch tabs.
              </p>
            </div>
          )}
        </div>

        {/* Checklist */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Pre-Interview Checklist</h3>
          <ul className="space-y-3">
            {[
              'Stable internet connection',
              'Working webcam',
              'Working microphone',
              'Quiet environment',
              'Good lighting',
              'No background distractions',
              'Browser notifications enabled'
            ].map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
