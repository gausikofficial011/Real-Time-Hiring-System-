import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  LogOut, Clock, CheckCircle, AlertCircle, Calendar, 
  Building2, ArrowRight, ExternalLink, Play
} from 'lucide-react';

const CandidateDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, companiesRes] = await Promise.all([
        api.get('/candidates/profile/me').catch(err => {
          // New user may not have a candidate profile yet — that's OK
          if (err.response?.status === 404) return { data: null };
          throw err;
        }),
        api.get('/companies').catch(() => ({ data: [] }))
      ]);
      setCandidate(profileRes.data);
      setAvailableCompanies(companiesRes.data);
    } catch (error) {
      // Only show error for unexpected failures
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (companyId) => {
    try {
      await api.post(`/companies/${companyId}/apply`);
      toast.success('Application sent!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to apply');
    }
  };

  const getStatusInfo = (status) => {
    const map = {
      invited: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
      ready: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
      in_interview: { icon: Clock, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
      completed: { icon: CheckCircle, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' }
    };
    return map[status] || map.invited;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">IntervueAI Portal</h1>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Candidate Intelligence</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-900 border-r pr-4">{user?.name}</span>
            <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Active Applications */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Active Applications</h2>
            <span className="px-3 py-1 bg-white border rounded-full text-xs font-bold text-gray-500">
              {candidate?.applications?.length || 0} Company
            </span>
          </div>

          {!candidate?.applications?.length && (
            <div className="card text-center py-20 bg-gray-50 border-dashed border-2">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-lg">No active applications found.</p>
              <p className="text-gray-400 text-sm mt-1">Explore companies below to get started.</p>
            </div>
          )}

          <div className="space-y-4">
            {candidate?.applications?.map(app => {
              const statusInfo = getStatusInfo(app.status);
              const StatusIcon = statusInfo.icon;
              const company = availableCompanies.find(c => c._id === app.companyId);

              return (
                <div key={app._id} className="card hover:shadow-xl transition-all border-l-4" style={{ borderColor: 'var(--primary-600)' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center font-bold text-gray-400 border">
                        {company?.logo ? <img src={company.logo} className="w-full h-full object-contain" /> : <Building2 />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{company?.name || 'Company Workspace'}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`px-3 py-1 ${statusInfo.bg} ${statusInfo.color} rounded-full text-xs font-bold uppercase tracking-widest border ${statusInfo.border}`}>
                            {app.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-medium text-gray-400">• Round {app.currentRound}</span>
                        </div>
                      </div>
                    </div>
                    {app.interviewId && (
                      <button 
                        onClick={() => navigate(`/interview/${app.interviewId}`)}
                        className="btn-primary rounded-xl px-6 py-3 flex items-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Join Test
                      </button>
                    )}
                  </div>
                  
                  {app.resultsPublished && (
                    <div className="mt-6 pt-6 border-t flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-500">Your results for Round {app.currentRound} are now available.</p>
                      <button 
                        onClick={() => navigate(`/report/${candidate._id}`)}
                        className="text-sm font-bold text-primary-600 flex items-center gap-2 hover:underline"
                      >
                        View Dashboard <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Explore Companies */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">Explore Companies</h2>
          <div className="space-y-4">
            {availableCompanies.filter(c => !candidate?.applications?.find(app => app.companyId === c._id)).map(company => (
              <div key={company._id} className="card group hover:border-primary-300 transition-all cursor-pointer" onClick={() => navigate(`/company/${company.workspaceSlug}`)}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border font-bold text-gray-300 group-hover:text-primary-600 transition-colors">
                    {company.logo ? <img src={company.logo} className="w-full h-full object-contain" /> : <Building2 className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 uppercase tracking-tight">{company.name}</h4>
                    <p className="text-xs text-gray-400">{company.workspaceSlug}.intervueai.ai</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-primary-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;

