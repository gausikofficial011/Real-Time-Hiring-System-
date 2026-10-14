import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Building2, Globe, FileText, CheckCircle2, ArrowRight,
  ChevronRight, Lock, PlayCircle 
} from 'lucide-react';

const CompanyWorkspace = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    fetchCompanyData();
  }, [slug]);

  const fetchCompanyData = async () => {
    try {
      const response = await api.get(`/companies/workspace/${slug}`);
      setCompany(response.data);
      
      if (user) {
        const candidateResponse = await api.get('/candidates/profile/me');
        setCandidate(candidateResponse.data);
      }
    } catch (error) {
      toast.error('Company workspace not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error('Please login to apply');
      navigate('/login');
      return;
    }

    try {
      await api.post(`/companies/${company._id}/apply`);
      toast.success('Successfully applied to ' + company.name);
      fetchCompanyData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Application failed');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  const currentApplication = candidate?.applications?.find(app => app.companyId === company?._id);

  return (
    <div className="min-h-screen bg-white">
      {/* Dynamic Header */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="w-10 h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-600" />
              </div>
            )}
            <span className="text-xl font-bold text-gray-900">{company.name}</span>
          </div>
          <div className="flex items-center gap-6">
            <a href={company.website} target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-500 hover:text-primary-600 flex items-center gap-1">
              <Globe className="w-4 h-4" />
              Website
            </a>
            {!user ? (
              <button onClick={() => navigate('/login')} className="btn-primary px-6 py-2">Join Talent Pool</button>
            ) : (
              <button onClick={() => navigate('/candidate')} className="text-sm font-bold text-primary-600 uppercase tracking-widest">My Dashboard</button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Build your future at <br />
            <span className="text-primary-600">{company.name}</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            {company.description || "Join our team of innovators and shape the next generation of technology. Experience an AI-first recruitment process designed to find your true potential."}
          </p>
          
          {!currentApplication ? (
            <button 
              onClick={handleApply}
              className="bg-primary-600 text-white px-10 py-5 rounded-2xl text-xl font-bold shadow-2xl shadow-primary-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto"
            >
              Start Your Application
              <ArrowRight className="w-6 h-6" />
            </button>
          ) : (
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-full font-bold">
              <CheckCircle2 className="w-5 h-5" />
              Application Submitted
            </div>
          )}
        </div>
      </div>

      {/* Rounds Section */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex items-center justify-between mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Recruitment Pipeline</h2>
          <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            {company.roundsConfig?.length} Stages
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {company.roundsConfig?.map((round, idx) => {
            const isAccessible = currentApplication && currentApplication.currentRound >= round.order;
            const isCompleted = currentApplication && currentApplication.currentRound > round.order;
            
            return (
              <div key={round._id} className={`p-8 rounded-3xl border-2 transition-all ${
                isCompleted ? 'border-emerald-100 bg-emerald-50/30' : 
                isAccessible ? 'border-primary-100 bg-primary-50/30' : 'border-gray-50 bg-gray-50/50'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                    isCompleted ? 'bg-emerald-600 text-white' : 
                    isAccessible ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {idx + 1}
                  </div>
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : !isAccessible && (
                    <Lock className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                
                <h3 className={`text-xl font-bold mb-3 ${!isAccessible && 'text-gray-400'}`}>{round.name}</h3>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  {round.type === 'video_ai' ? "Automated video interview assessing your communication and technical logic." : 
                   round.type === 'aptitude' ? "Analytical and problem-solving assessment." : "In-depth technical or behavioral discussion."}
                </p>

                {isAccessible && !isCompleted && round.type === 'video_ai' && (
                  <button 
                    onClick={() => navigate(`/waiting-room/${candidate._id}`)}
                    className="w-full py-4 bg-white border-2 border-primary-600 text-primary-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-600 hover:text-white transition-all shadow-lg shadow-primary-100"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Enter Test Room
                  </button>
                )}
                
                {round.isPublished && (
                  <div className="mt-4 pt-4 border-t border-gray-100 text-xs font-bold text-primary-600 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Results Published
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CompanyWorkspace;
