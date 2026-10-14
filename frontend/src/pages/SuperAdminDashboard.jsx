import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Users, Calendar, TrendingUp, LogOut, Plus, Search, 
  Filter, Eye, FileText, BarChart3, UserCheck, UserX, Globe, Building2,
  PlayCircle, ExternalLink
} from 'lucide-react';
import ComparisonModal from '../components/ComparisonModal';
import { useLanguage } from '../context/LanguageContext';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('candidates');
  const [candidates, setCandidates] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [comparisonData, setComparisonData] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    jobRole: 'Software Engineer'
  });

  useEffect(() => {
    fetchCandidates();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (e) {
      toast.error('Failed to fetch companies');
    }
  };

  useEffect(() => {
    filterCandidates();
  }, [candidates, searchTerm, statusFilter]);

  const fetchCandidates = async () => {
    try {
      const response = await api.get('/candidates');
      setCandidates(response.data);
    } catch (error) {
      toast.error('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const filterCandidates = () => {
    let filtered = candidates;

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    setFilteredCandidates(filtered);
  };

  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/candidates', newCandidate);
      toast.success('Candidate created successfully');
      setShowCreateModal(false);
      setNewCandidate({ name: '', email: '', phone: '', jobRole: 'Software Engineer' });
      fetchCandidates();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create candidate');
    }
  };

  const handleStartInterview = async (candidateId) => {
    try {
      const candidate = candidates.find(c => c._id === candidateId);
      if (!candidate.interviewId) {
        const response = await api.post('/interviews', {
          candidateId,
          jobRole: candidate.jobRole
        });
        toast.success('Interview created successfully');
      }
      navigate(`/waiting-room/${candidateId}`);
    } catch (error) {
      toast.error('Failed to start interview');
    }
  };

  const handleViewReport = (candidateId) => {
    navigate(`/report/${candidateId}`);
  };

  const handleCandidateSelection = (candidateId) => {
    if (selectedCandidates.includes(candidateId)) {
      setSelectedCandidates(selectedCandidates.filter(id => id !== candidateId));
    } else {
      if (selectedCandidates.length < 3) {
        setSelectedCandidates([...selectedCandidates, candidateId]);
      } else {
        toast.error('Maximum 3 candidates can be compared');
      }
    }
  };

  const handleCompare = async () => {
    if (selectedCandidates.length < 2) {
      toast.error('Select at least 2 candidates to compare');
      return;
    }
    try {
      const response = await api.post('/candidates/compare', { candidateIds: selectedCandidates });
      setComparisonData(response.data);
      setShowCompareModal(true);
    } catch (error) {
      toast.error('Failed to compare candidates');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      invited: 'bg-yellow-100 text-yellow-800',
      ready: 'bg-blue-100 text-blue-800',
      in_interview: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      selected: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
      under_review: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    total: candidates.length,
    invited: candidates.filter(c => c.status === 'invited').length,
    inProgress: candidates.filter(c => c.status === 'in_interview').length,
    completed: candidates.filter(c => c.status === 'completed').length,
    selected: candidates.filter(c => c.status === 'selected').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">IntervueAI Command</h1>
              <p className="text-xs font-bold text-primary-500 uppercase tracking-widest">Platform Administration</p>
            </div>
            
            <nav className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {[
                { id: 'candidates', label: 'Candidates', icon: Users },
                { id: 'companies', label: 'Companies', icon: Building2 },
                { id: 'reports', label: 'Intelligence', icon: BarChart3 }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                      activeTab === tab.id ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-4 bg-gray-100 rounded-lg p-1 text-xs">
              <Globe className="w-3 h-3 text-gray-400 ml-2" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent border-none py-1 focus:ring-0 cursor-pointer font-bold text-gray-500"
              >
                <option value="en">EN</option>
                <option value="ta">TA</option>
                <option value="hi">HI</option>
              </select>
            </div>
            <button onClick={logout} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'candidates' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 font-bold">Candidates</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <Users className="w-10 h-10 text-blue-200" />
                </div>
              </div>
              <div className="card bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 font-bold">Invited</p>
                    <p className="text-3xl font-bold">{stats.invited}</p>
                  </div>
                  <Calendar className="w-10 h-10 text-yellow-200" />
                </div>
              </div>
              <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 font-bold">Active</p>
                    <p className="text-3xl font-bold">{stats.inProgress}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-200" />
                </div>
              </div>
              <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 font-bold">Analysis</p>
                    <p className="text-3xl font-bold">{stats.completed}</p>
                  </div>
                  <FileText className="w-10 h-10 text-purple-200" />
                </div>
              </div>
              <div className="card bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 font-bold">Selected</p>
                    <p className="text-3xl font-bold">{stats.selected}</p>
                  </div>
                  <UserCheck className="w-10 h-10 text-emerald-200" />
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="card mb-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4 items-center flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search across all companies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-field w-40 font-bold text-gray-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="invited">Invited</option>
                    <option value="ready">Ready</option>
                    <option value="in_interview">Interviewing</option>
                    <option value="completed">Completed</option>
                    <option value="selected">Selected</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCompare}
                    disabled={selectedCandidates.length < 2}
                    className="btn-secondary flex items-center gap-2 disabled:opacity-50"
                  >
                    Compare Experts ({selectedCandidates.length})
                  </button>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Candidate
                  </button>
                </div>
              </div>
            </div>

            {/* Candidates Table */}
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Select
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Candidate Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Applied Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Hiring Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
                      AI Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-gray-400 italic">
                        Synchronizing intelligence data...
                      </td>
                    </tr>
                  ) : filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-gray-400 italic">
                        No candidates found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((candidate) => (
                      <tr key={candidate._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedCandidates.includes(candidate._id)}
                            onChange={() => handleCandidateSelection(candidate._id)}
                            className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-bold text-gray-900">{candidate.name}</div>
                            <div className="text-xs text-gray-400">{candidate.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-600">
                          {candidate.jobRole}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 inline-flex text-[10px] font-bold uppercase tracking-widest rounded-full border ${getStatusColor(candidate.status)}`}>
                            {candidate.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1 font-bold text-gray-900">
                            {candidate.resume?.score || 0}
                            <span className="text-[10px] text-gray-400">%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            {candidate.status === 'invited' || candidate.status === 'ready' ? (
                              <button
                                onClick={() => handleStartInterview(candidate._id)}
                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Start Interview"
                              >
                                <PlayCircle className="w-5 h-5" />
                              </button>
                            ) : null}
                            {candidate.status === 'completed' || candidate.status === 'under_review' ? (
                              <button
                                onClick={() => handleViewReport(candidate._id)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="View AI Report"
                              >
                                <BarChart3 className="w-5 h-5" />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'companies' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Managed Hiring Workspaces</h2>
              <button 
                 onClick={() => toast.error('Advanced Company Registration Coming Soon')}
                 className="btn-primary py-2 px-6 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Register Company
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {companies.map(company => (
                <div key={company._id} className="card group hover:shadow-2xl hover:-translate-y-1 transition-all">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-white rounded-2xl flex items-center justify-center font-bold text-primary-600 border border-primary-100 shadow-inner">
                      {company.logo ? <img src={company.logo} className="w-full h-full object-contain p-2" /> : <Building2 className="w-8 h-8" />}
                    </div>
                    <button 
                      onClick={() => window.open(`/company/${company.workspaceSlug}`, '_blank')}
                      className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                      title="View Workspace"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h3 className="font-bold text-xl text-gray-900 mb-1">{company.name}</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-primary-500 uppercase tracking-widest mb-6">
                    {company.workspaceSlug}.intervueai.ai
                  </div>

                  <div className="space-y-3 pt-6 border-t">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-400 uppercase tracking-widest">Pipeline Health</span>
                      <span className="text-emerald-600">Active</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary-600 h-full w-2/3"></div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-8">
                    <button className="flex-1 text-xs font-bold py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors">Workspace</button>
                    <button className="flex-1 text-xs font-bold py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">Pipeline</button>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => toast.error('Registration is currently locked for this demo.')}
                className="border-2 border-dashed border-gray-200 rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/10 transition-all group"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                  <Plus className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900">Provision New Entity</p>
                  <p className="text-xs mt-1">Spin up a branded workspace</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Candidate Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Onboard Candidate</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <UserX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCandidate} className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  type="text"
                  value={newCandidate.name}
                  onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                  className="input-field py-4 bg-gray-50 border-none focus:bg-white"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Intelligence</label>
                <input
                  type="email"
                  value={newCandidate.email}
                  onChange={(e) => setNewCandidate({...newCandidate, email: e.target.value})}
                  className="input-field py-4 bg-gray-50 border-none focus:bg-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Role Path</label>
                  <select
                    value={newCandidate.jobRole}
                    onChange={(e) => setNewCandidate({...newCandidate, jobRole: e.target.value})}
                    className="input-field py-4 bg-gray-50 border-none focus:bg-white"
                  >
                    <option>Software Engineer</option>
                    <option>Data Scientist</option>
                    <option>Product Manager</option>
                    <option>UX Designer</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Work Group</label>
                  <select className="input-field py-4 bg-gray-50 border-none focus:bg-white">
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Strategy</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Discard
                </button>
                <button type="submit" className="btn-primary flex-1 py-4 rounded-2xl shadow-lg shadow-primary-200">
                  Deploy Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      <ComparisonModal 
        isOpen={showCompareModal} 
        onClose={() => setShowCompareModal(false)} 
        comparisonData={comparisonData} 
      />
    </div>
  );
};

export default SuperAdminDashboard;
