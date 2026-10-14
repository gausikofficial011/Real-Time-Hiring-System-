import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, Briefcase, ArrowRight, ShieldCheck, Zap, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, googleLogin, initAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      toast.success('Welcome back, ' + user.name + '!');
      if (user.role === 'superadmin') {
        navigate('/superadmin');
      } else {
        navigate('/candidate');
      }
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleInitAdmin = async () => {
    setLoading(true);
    try {
      await initAdmin();
      toast.success('Admin account ready!');
      setEmail('admin@intervueai.com');
      setPassword('admin123');
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Initialization failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-lg relative z-10">
        {/* Branding */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 group transition-transform hover:scale-105 active:scale-95">
            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-200 group-hover:rotate-12 transition-transform">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Intervue<span className="text-primary-600">AI</span></h1>
              <p className="text-xs font-bold text-primary-500 uppercase tracking-widest">Candidate Intelligence</p>
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <div className="glass-card p-10 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500">Secure access to your intelligence portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-600 transition-colors" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-12"
                    placeholder="name@company.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label htmlFor="password" className="text-sm font-bold text-gray-700">Password</label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-600 transition-colors" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-12 pr-12"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 group shadow-xl shadow-primary-200/50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Connect Securely
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest text-gray-400">
              <span className="bg-white px-4">Secure Social Access</span>
            </div>
          </div>

          {/* Social Login Button */}
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setLoading(true);
                try {
                  const user = await googleLogin({ 
                    credential: credentialResponse.credential 
                  });
                  toast.success('Welcome via Google, ' + user.name);
                  
                  if (user.role === 'superadmin') {
                    navigate('/superadmin');
                  } else {
                    navigate('/candidate');
                  }
                } catch (error) {
                  toast.error(error);
                } finally {
                  setLoading(false);
                }
              }}
              onError={() => {
                toast.error('Google login failed');
              }}
              useOneTap
              theme="outline"
              size="large"
              width="384"
              text="continue_with"
              shape="pill"
            />
          </div>

          {/* Security badges */}
          <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-center gap-6">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              AES-256 Encrypted
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <Zap className="w-4 h-4 text-amber-500" />
              Real-time Sync
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="mt-8 text-center text-gray-600 font-medium">
          New to IntervueAI?{' '}
          <Link to="/register" className="text-primary-600 font-bold hover:underline underline-offset-4">
            Create an account
          </Link>
        </p>

        {/* Demo Credentials Alert */}
        <div className="mt-6 p-4 bg-primary-50/80 border border-primary-100 rounded-xl text-center backdrop-blur-sm">
          <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">Demo Credentials</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm text-gray-600 font-medium mb-3">
            <div className="px-3 py-1 bg-white rounded-lg shadow-sm border border-primary-50">
              <span className="text-gray-400">Admin: </span>admin@intervueai.com
            </div>
            <div className="px-3 py-1 bg-white rounded-lg shadow-sm border border-primary-50">
              <span className="text-gray-400">Pass: </span>admin123
            </div>
          </div>
          <button
            onClick={handleInitAdmin}
            disabled={loading}
            className="text-xs font-bold text-primary-600 hover:text-primary-700 underline underline-offset-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Initializing...' : '→ Click here to auto-fill &amp; reset admin credentials'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
