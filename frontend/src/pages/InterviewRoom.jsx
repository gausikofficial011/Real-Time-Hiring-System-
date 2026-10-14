import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getSocket } from '../services/socket';
import toast from 'react-hot-toast';
import Webcam from 'react-webcam';
import { 
  Video, VideoOff, Mic, MicOff, Phone, Monitor, 
  AlertTriangle, Smile, Eye, Brain, Shield, Clock 
} from 'lucide-react';

const InterviewRoom = () => {
  const { interviewId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [aiAnalytics, setAiAnalytics] = useState({
    emotion: 'neutral',
    confidence: 0,
    attention: 0,
    sentiment: 'neutral',
    communicationQuality: 0
  });
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchInterviewData();
    connectToSocket();
    startSecurityMonitoring();
    startAIAnalysis();

    const interval = setInterval(() => {
      if (duration > 0) {
        setDuration(duration - 1);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      const socket = getSocket();
      socket?.emit('leave-interview', interviewId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [interviewId]);

  const fetchInterviewData = async () => {
    try {
      const response = await api.get(`/interviews/${interviewId}`);
      setInterview(response.data);
      if (response.data.startTime) {
        const elapsed = Math.floor((new Date() - new Date(response.data.startTime)) / 1000);
        setDuration(elapsed);
      }
    } catch (error) {
      toast.error('Failed to fetch interview data');
    } finally {
      setLoading(false);
    }
  };

  const connectToSocket = () => {
    const socket = getSocket();
    
    socket.emit('join-interview', interviewId);

    socket.on('interview-end', (data) => {
      toast.success('Interview ended by interviewer');
      navigate('/candidate');
    });

    socket.on('ai-analytics', (data) => {
      setAiAnalytics(data);
    });

    socket.on('security-alert', (data) => {
      setSecurityAlerts(prev => [...prev, data]);
      toast.error(`Security alert: ${data.violationType}`);
    });
  };

  const startSecurityMonitoring = () => {
    // Tab switch detection
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Fullscreen enforcement
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Fullscreen request failed');
      });
    }

    // Prevent right-click
    document.addEventListener('contextmenu', (e) => e.preventDefault());
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      setTabSwitches(prev => prev + 1);
      logSecurityViolation('tab_switch', 'medium');
    }
  };

  const logSecurityViolation = async (type, severity) => {
    try {
      await api.post('/security/log-violation', {
        interviewId,
        violationType: type,
        severity
      });
    } catch (error) {
      console.error('Failed to log security violation');
    }
  };

  const startAIAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis - in production, this would send frames to backend
    const interval = setInterval(() => {
      if (webcamRef.current && webcamRef.current.video.readyState === 4) {
        captureAndAnalyze();
      }
    }, 3000); // Analyze every 3 seconds

    return () => clearInterval(interval);
  };

  const captureAndAnalyze = async () => {
    if (!webcamRef.current) return;

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      // Convert base64 to Blob
      const byteString = atob(imageSrc.split(',')[1]);
      const mimeString = imageSrc.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const file = new File([blob], "frame.jpg", { type: mimeString });

      const formData = new FormData();
      formData.append('frame', file);

      const response = await api.post('/ai/analyze-emotion', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { result } = response.data;
      if (result) {
        setAiAnalytics({
          emotion: result.emotion || 'neutral',
          confidence: Math.round(result.confidence * 100) || 70,
          attention: Math.round(result.attention * 100) || 70,
          sentiment: result.sentiment || 'neutral',
          communicationQuality: Math.round(result.communication_score * 100) || 70
        });
      }
    } catch (error) {
      console.error('AI Analysis Error:', error);
      // Fallback to minimal simulation if API fails during dev
      setAiAnalytics(prev => ({
        ...prev,
        confidence: prev.confidence + (Math.random() > 0.5 ? 1 : -1)
      }));
    }
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
  };

  const endInterview = async () => {
    try {
      await api.put(`/interviews/${interviewId}/end`);
      toast.success('Interview ended');
      navigate('/candidate');
    } catch (error) {
      toast.error('Failed to end interview');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Connecting to interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">IntervueAI Interview</h1>
          <span className="bg-red-600 px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="text-xl font-mono">{formatDuration(duration)}</span>
          </div>
          <button
            onClick={endInterview}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Phone className="w-5 h-5" />
            End
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Grid */}
          <div className="flex-1 grid grid-cols-2 gap-4 p-4">
            {/* Candidate Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              {isVideoOn ? (
                <Webcam
                  ref={webcamRef}
                  audio={isAudioOn}
                  mirrored={true}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <VideoOff className="w-16 h-16 text-gray-500" />
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded">
                You
              </div>
            </div>

            {/* Interviewer Video (Simulated) */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Video className="w-16 h-16 text-gray-500" />
                </div>
                <p className="text-gray-400">Interviewer</p>
              </div>
              <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded">
                Interviewer
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 px-6 py-4 flex justify-center gap-4">
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full ${isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full ${isAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* AI Analytics Panel */}
        <div className="w-80 bg-gray-800 p-4 overflow-y-auto">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Analytics
          </h2>

          {/* Emotion Detection */}
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Smile className="w-5 h-5 text-yellow-400" />
              <span className="font-medium">Emotion</span>
            </div>
            <p className="text-2xl font-bold capitalize">{aiAnalytics.emotion}</p>
            <div className="mt-2 bg-gray-600 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${aiAnalytics.confidence}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 mt-1">Confidence: {aiAnalytics.confidence}%</p>
          </div>

          {/* Attention Score */}
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-blue-400" />
              <span className="font-medium">Attention</span>
            </div>
            <p className="text-2xl font-bold">{aiAnalytics.attention}%</p>
            <div className="mt-2 bg-gray-600 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${aiAnalytics.attention}%` }}
              ></div>
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-green-400" />
              <span className="font-medium">Sentiment</span>
            </div>
            <p className="text-2xl font-bold capitalize">{aiAnalytics.sentiment}</p>
          </div>

          {/* Communication Quality */}
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Video className="w-5 h-5 text-purple-400" />
              <span className="font-medium">Communication</span>
            </div>
            <p className="text-2xl font-bold">{aiAnalytics.communicationQuality}%</p>
            <div className="mt-2 bg-gray-600 rounded-full h-2">
              <div 
                className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${aiAnalytics.communicationQuality}%` }}
              ></div>
            </div>
          </div>

          {/* Security Panel */}
          <h2 className="text-lg font-bold mb-4 mt-6 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </h2>

          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Tab Switches</span>
              <span className="font-bold text-red-400">{tabSwitches}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Fullscreen</span>
              <span className={`font-bold ${isFullscreen ? 'text-green-400' : 'text-yellow-400'}`}>
                {isFullscreen ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Security Alerts */}
          {securityAlerts.length > 0 && (
            <div className="space-y-2">
              {securityAlerts.slice(-3).map((alert, index) => (
                <div key={index} className="bg-red-900/50 border border-red-700 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium">{alert.violationType}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
