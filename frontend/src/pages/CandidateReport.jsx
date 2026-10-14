import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Award, AlertCircle, 
  CheckCircle, XCircle, BarChart3, Brain, Target, Briefcase 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const CandidateReport = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [report, setReport] = useState(null);
  const [predictive, setPredictive] = useState(null);
  const [ethical, setEthical] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [candidateId]);

  const fetchReportData = async () => {
    try {
      const candidateResponse = await api.get(`/candidates/${candidateId}`);
      setCandidate(candidateResponse.data);

      const analyticsResponse = await api.get(`/analytics/candidate/${candidateId}`);
      if (analyticsResponse.data.length > 0) {
        setAnalytics(analyticsResponse.data[0]);
        
        const reportResponse = await api.post(`/analytics/${analyticsResponse.data[0]._id}/report`);
        setReport(reportResponse.data);

        // Fetch Predictive Data
        try {
          const successResponse = await api.post('/predictive/success-probability', { candidateId });
          const growthResponse = await api.post('/predictive/career-growth', { candidateId });
          setPredictive({ ...successResponse.data, growth: growthResponse.data });
        } catch (e) { console.error('Predictive data fetch failed'); }

        // Fetch Ethical Data
        try {
          const ethicalResponse = await api.post('/ethical/monitor-fairness', { 
            candidateId, 
            interviewId: analyticsResponse.data[0].interviewId 
          });
          setEthical(ethicalResponse.data);
        } catch (e) { console.error('Ethical data fetch failed'); }
      }
    } catch (error) {
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'selected':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'selected':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'review':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!analytics || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Report Available</h2>
          <p className="text-gray-600 mb-4">The interview has not been completed yet.</p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const radarData = [
    { subject: 'Confidence', value: analytics.behavioralAnalysis?.confidence || 70 },
    { subject: 'Communication', value: analytics.communicationQuality || 70 },
    { subject: 'Attention', value: analytics.attentionScore || 70 },
    { subject: 'Stress Management', value: 100 - (analytics.behavioralAnalysis?.stress || 30) },
    { subject: 'Engagement', value: analytics.behavioralAnalysis?.engagement || 70 },
    { subject: 'Professionalism', value: analytics.behavioralAnalysis?.professionalism || 70 }
  ];

  const emotionTimeline = analytics.emotionData?.slice(0, 10).map((item, index) => ({
    time: `${index * 5}m`,
    score: item.confidence * 100
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Candidate Report</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Candidate Info */}
        <div className="card mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{candidate?.name}</h2>
              <p className="text-gray-600">{candidate?.email}</p>
              <p className="text-gray-600">{candidate?.phone}</p>
            </div>
            <div className={`px-6 py-3 rounded-lg border-2 flex items-center gap-2 ${getRecommendationColor(analytics.recommendation)}`}>
              {getRecommendationIcon(analytics.recommendation)}
              <span className="text-xl font-bold uppercase">{analytics.recommendation}</span>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Overall Score</p>
                <p className="text-4xl font-bold">{analytics.overallScore}</p>
              </div>
              <Award className="w-12 h-12 text-blue-200" />
            </div>
          </div>
          <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Confidence</p>
                <p className="text-4xl font-bold">{analytics.behavioralAnalysis?.confidence || 0}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-200" />
            </div>
          </div>
          <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Communication</p>
                <p className="text-4xl font-bold">{analytics.communicationQuality}</p>
              </div>
              <Target className="w-12 h-12 text-purple-200" />
            </div>
          </div>
          <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Attention</p>
                <p className="text-4xl font-bold">{analytics.attentionScore}</p>
              </div>
              <Brain className="w-12 h-12 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Radar Chart */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Skills Assessment
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Score" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Emotion Timeline */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Emotion Timeline
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={emotionTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="card bg-green-50 border-green-200">
            <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Strengths
            </h3>
            <ul className="space-y-2">
              {analytics.strengths?.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card bg-red-50 border-red-200">
            <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Areas for Improvement
            </h3>
            <ul className="space-y-2">
              {analytics.weaknesses?.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2 text-red-800">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI Reasoning */}
        <div className="card mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Recommendation Reasoning
          </h3>
          <p className="text-gray-700 leading-relaxed">{analytics.reasoning}</p>
        </div>

        {/* Predictive and Ethical Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Predictive Analysis */}
          <div className="card border-primary-100 bg-primary-50/30">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              Predictive Success Analysis
            </h3>
            {predictive ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hiring Success Probability</span>
                  <span className="text-2xl font-black text-primary-600">{Math.round(predictive.successProbability)}%</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-primary-100">
                    <p className="text-xs text-gray-500 uppercase">Career Growth</p>
                    <p className="font-bold text-primary-800">{predictive.growth?.predictions?.threeYears?.role || 'N/A'}</p>
                    <p className="text-[10px] text-gray-400">Predicted in 3 years</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-primary-100">
                    <p className="text-xs text-gray-500 uppercase">Retention Score</p>
                    <p className="font-bold text-primary-800">{Math.round(100 - (predictive.attritionRisk || 15))}%</p>
                    <p className="text-[10px] text-gray-400">AI stability index</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Success Recommendation:</p>
                  <p className="text-sm text-gray-600">{predictive.recommendation}</p>
                </div>
              </div>
            ) : <p className="text-gray-400 text-sm">Processing predictive models...</p>}
          </div>

          {/* Ethical AI & Fairness */}
          <div className="card border-emerald-100 bg-emerald-50/30">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              Ethical AI & Fairness Monitor
            </h3>
            {ethical ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fairness Consistency Score</span>
                  <span className="text-2xl font-black text-emerald-600">{Math.round(ethical.overallFairnessScore * 100)}%</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Neutral Questioning</span>
                    <span className="font-semibold">{ethical.questionFairness * 100}%</span>
                  </div>
                  <div className="w-full bg-emerald-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${ethical.questionFairness * 100}%` }}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Scoring Consistency</span>
                    <span className="font-semibold">{ethical.scoreConsistency * 100}%</span>
                  </div>
                  <div className="w-full bg-emerald-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${ethical.scoreConsistency * 100}%` }}></div>
                  </div>
                </div>
                <div className="mt-4 p-2 bg-white rounded border border-emerald-100">
                  <p className="text-[10px] uppercase text-emerald-600 font-bold mb-1">AI Bias Alert</p>
                  <p className="text-xs text-gray-600">{ethical.interviewerBias?.details || 'No significant bias traits detected in this session.'}</p>
                </div>
              </div>
            ) : <p className="text-gray-400 text-sm">Running fairness algorithms...</p>}
          </div>
        </div>

        {/* Interview Details */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Interview Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Job Role</p>
              <p className="font-semibold">{report.candidate?.jobRole}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Interview Date</p>
              <p className="font-semibold">{new Date(report.interview?.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-semibold">{report.interview?.duration} minutes</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Questions Asked</p>
              <p className="font-semibold">{report.interview?.questionsAsked}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4 justify-end">
          <button
            onClick={() => navigate('/superadmin')}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
          <button className="btn-primary">
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateReport;
