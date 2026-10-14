import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Briefcase, Brain, Shield, BarChart3, Users, 
  ArrowRight, Globe, Zap, CheckCircle2 
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-primary-100 selection:text-primary-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Intervue<span className="text-primary-600">AI</span></span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Features</a>
              <a href="#solutions" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Solutions</a>
              <Link to="/login" className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors">Sign In</Link>
              <button 
                onClick={() => navigate('/register')}
                className="btn-primary"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48">
          {/* Background Blobs */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-8 border border-primary-100 animate-fade-in">
                <Zap className="w-4 h-4" />
                Next-Gen AI Hiring Platform
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-[1.1]">
                Hire Smarter with <br />
                <span className="gradient-text">Candidate Intelligence</span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-12 leading-relaxed">
                Experience the future of recruitment. IntervueAI combines advanced AI proctoring, 
                real-time analytics, and behavioral insights to help you find the perfect fit.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="btn-primary text-lg px-8 py-4 w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  Start Hiring Now
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto"
                >
                  View Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Enterprise-Grade Features</h2>
              <p className="text-xl text-gray-600">Everything you need to streamline your recruitment pipeline.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Brain className="w-8 h-8" />,
                  title: "AI Interviewer",
                  desc: "Intelligent AI-driven interviewers that adapt to candidate responses and assess technical skills."
                },
                {
                  icon: <Shield className="w-8 h-8" />,
                  title: "Smart Proctoring",
                  desc: "Advanced security forensics and anti-cheating measures to ensure interview integrity."
                },
                {
                  icon: <BarChart3 className="w-8 h-8" />,
                  title: "Predictive Analytics",
                  desc: "Data-driven insights to predict candidate performance and cultural fit."
                },
                {
                  icon: <Globe className="w-8 h-8" />,
                  title: "Multi-Language",
                  desc: "Conduct interviews in multiple languages with real-time translation and sentiment analysis."
                },
                {
                  icon: <Users className="w-8 h-8" />,
                  title: "Candidate CRM",
                  desc: "Manage your entire candidate pool with intelligent tagging and automated workflows."
                },
                {
                  icon: <Zap className="w-8 h-8" />,
                  title: "Instant Reports",
                  desc: "Generate comprehensive candidate reports with detailed behavioral and technical scores."
                }
              ].map((feature, idx) => (
                <div key={idx} className="card group hover:scale-[1.02] transition-all duration-300">
                  <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-900">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-extrabold text-primary-600 mb-2">98%</div>
                <div className="text-gray-500 font-medium">Hiring Accuracy</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-primary-600 mb-2">60%</div>
                <div className="text-gray-500 font-medium">Reduced Hiring Time</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-primary-600 mb-2">50k+</div>
                <div className="text-gray-500 font-medium">Interviews Conducted</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-primary-600 mb-2">4.9/5</div>
                <div className="text-gray-500 font-medium">User Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-primary-600 rounded-3xl p-12 lg:p-20 relative overflow-hidden text-center text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to revolutionize <br /> your hiring process?</h2>
                <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto italic">
                  "The most advanced recruitment tool we've ever used. IntervueAI changed how we think about talent."
                </p>
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-white text-primary-600 hover:bg-gray-50 px-10 py-4 rounded-xl text-lg font-bold shadow-xl transition-all active:scale-95"
                >
                  Join IntervueAI Today
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 pt-20 pb-10 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Briefcase className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Intervue<span className="text-primary-600">AI</span></span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <a href="#" className="hover:text-primary-600">Product</a>
            <a href="#" className="hover:text-primary-600">Company</a>
            <a href="#" className="hover:text-primary-600">Solutions</a>
            <a href="#" className="hover:text-primary-600">Privacy</a>
          </div>
          <p className="text-sm">© 2024 IntervueAI - Candidate Intelligence System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
