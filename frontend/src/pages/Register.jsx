import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Phone, Briefcase, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email address is required');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const user = await register(formData.name.trim(), formData.email.trim(), formData.password, formData.phone.trim());
      toast.success('Account created successfully! Welcome, ' + user.name + '!');
      navigate('/candidate');
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute -bottom-8 right-20 w-72 h-72 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Left Side: Branding & Info */}
      <div className="hidden md:flex md:w-1/2 bg-primary-600 p-16 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <Briefcase className="w-10 h-10 text-white" />
            <span className="text-3xl font-bold tracking-tight">IntervueAI</span>
          </div>

          <h1 className="text-5xl font-bold mb-8 leading-tight">
            Launch Your Career <br />with AI Intelligence
          </h1>

          <div className="space-y-6">
            {[
              "Experience high-integrity AI interviews",
              "Get instant detailed performance feedback",
              "Access top-tier enterprise opportunities",
              "Showcase your skills with real-time analytics"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-4 text-primary-100">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <span className="text-lg">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-10 border-t border-white/10">
          <p className="text-primary-100 font-medium italic">
            "IntervueAI helped me land my dream job by highlighting my soft skills in a way a resume never could."
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-white">S</div>
            <div>
              <p className="font-bold">Sarah Chen</p>
              <p className="text-sm text-primary-200">Software Engineer @ TechCorp</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="flex md:hidden items-center gap-2 mb-8 justify-center">
            <Briefcase className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Intervue<span className="text-primary-600">AI</span></span>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Join the Future</h2>
            <p className="text-gray-500 text-lg">Create your candidate account to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-600 transition-colors" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  className="input-field pl-12"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange('name')}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-600 transition-colors" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  className="input-field pl-12"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange('email')}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Phone (optional) */}
            <div>
              <label htmlFor="reg-phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-600 transition-colors" />
                <input
                  id="reg-phone"
                  type="tel"
                  className="input-field pl-12"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-600 transition-colors" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="input-field pl-12 pr-12"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange('password')}
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm-password" className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-600 transition-colors" />
                <input
                  id="reg-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={6}
                  className={`input-field pl-12 pr-12 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1 ml-1 font-medium">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 group mt-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Social Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest text-gray-400">
                <span className="bg-gray-50 px-4">Social Sign Up</span>
              </div>
            </div>

            {/* Google Sign Up Button */}
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  setLoading(true);
                  try {
                    const user = await googleLogin({ 
                      credential: credentialResponse.credential 
                    });
                    toast.success('Account created via Google!');
                    navigate('/candidate');
                  } catch (error) {
                    toast.error(error);
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => {
                  toast.error('Google registration failed');
                }}
                theme="outline"
                size="large"
                width="384"
                text="signup_with"
                shape="pill"
              />
            </div>

            <p className="text-center text-gray-600 pt-2">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-bold hover:underline underline-offset-4">
                Sign In
              </Link>
            </p>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400">
              By joining, you agree to our Terms of Service and Privacy Policy.
              IntervueAI uses AI to objectively assess performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
