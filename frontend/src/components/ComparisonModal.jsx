import React from 'react';
import { X, CheckCircle, AlertCircle, TrendingUp, Brain, Target } from 'lucide-react';

const ComparisonModal = ({ isOpen, onClose, comparisonData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Candidate Comparison</h2>
            <p className="text-gray-600">Side-by-side analysis of AI-evaluated candidates</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-[200px_1fr] gap-6">
            {/* Attributes Column */}
            <div className="space-y-4 pt-[180px]">
              <div className="h-12 flex items-center font-bold text-gray-500 uppercase text-xs tracking-wider">Overall Ranking</div>
              <div className="h-12 flex items-center font-bold text-gray-500 uppercase text-xs tracking-wider">Overall Score</div>
              <div className="h-12 flex items-center font-bold text-gray-500 uppercase text-xs tracking-wider">Confidence</div>
              <div className="h-12 flex items-center font-bold text-gray-500 uppercase text-xs tracking-wider">Communication</div>
              <div className="h-12 flex items-center font-bold text-gray-500 uppercase text-xs tracking-wider">Attention</div>
              <div className="h-24 flex items-center font-bold text-gray-500 uppercase text-xs tracking-wider">AI Recommendation</div>
              <div className="h-32 flex items-center font-bold text-gray-500 uppercase text-xs tracking-wider">Key Strengths</div>
            </div>

            {/* Candidates Grid */}
            <div className={`grid grid-cols-${comparisonData.length} gap-6`}>
              {comparisonData.map((item, index) => (
                <div key={item.candidate._id} className="space-y-4">
                  {/* Candidate Header */}
                  <div className="h-[180px] bg-gray-50 rounded-xl p-4 text-center flex flex-col items-center justify-center border-2 border-transparent hover:border-primary-200 transition-all">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                      <span className="text-xl font-bold text-primary-600">{item.candidate.name.charAt(0)}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 truncate w-full">{item.candidate.name}</h3>
                    <p className="text-sm text-gray-500">{item.candidate.jobRole}</p>
                    <div className="mt-2 text-xs font-semibold px-2 py-0.5 bg-gray-200 rounded text-gray-600">
                      ID: {item.candidate._id.slice(-6)}
                    </div>
                  </div>

                  {/* Ranking */}
                  <div className="h-12 flex items-center justify-center">
                    <span className={`text-2xl font-black ${index === 0 ? 'text-yellow-500' : 'text-gray-400'}`}>
                      #{index + 1}
                    </span>
                  </div>

                  {/* Overall Score */}
                  <div className="h-12 flex items-center justify-center">
                    <div className="w-full bg-gray-100 rounded-full h-8 relative overflow-hidden">
                      <div 
                        className="bg-primary-500 h-full transition-all duration-1000" 
                        style={{ width: `${item.analytics?.overallScore || 0}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center font-bold text-xs text-primary-900">
                        {item.analytics?.overallScore || 0}%
                      </span>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="h-12 flex items-center justify-center font-bold text-gray-700">
                    {item.analytics?.behavioralAnalysis?.confidence || 0}%
                  </div>

                  {/* Communication */}
                  <div className="h-12 flex items-center justify-center font-bold text-gray-700">
                    {item.analytics?.communicationQuality || 0}%
                  </div>

                  {/* Attention */}
                  <div className="h-12 flex items-center justify-center font-bold text-gray-700">
                    {item.analytics?.attentionScore || 0}%
                  </div>

                  {/* Recommendation */}
                  <div className="h-24 flex items-center justify-center">
                    <div className={`p-4 rounded-lg w-full text-center border ${
                      item.analytics?.recommendation === 'selected' ? 'bg-green-50 border-green-200 text-green-700' :
                      item.analytics?.recommendation === 'review' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                      'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      <div className="flex justify-center mb-1">
                        {item.analytics?.recommendation === 'selected' ? <CheckCircle className="w-5 h-5" /> :
                         item.analytics?.recommendation === 'review' ? <AlertCircle className="w-5 h-5" /> :
                         <TrendingUp className="rotate-180 w-5 h-5" />}
                      </div>
                      <span className="font-bold uppercase text-xs">
                        {item.analytics?.recommendation || 'Under Review'}
                      </span>
                    </div>
                  </div>

                  {/* Key Strengths */}
                  <div className="h-32 p-3 bg-gray-50 rounded-lg overflow-y-auto">
                    <ul className="text-xs space-y-1">
                      {(item.analytics?.strengths || ['No data available']).slice(0, 3).map((strength, sIndex) => (
                        <li key={sIndex} className="flex items-start gap-1 text-gray-600">
                          <span className="text-primary-500 font-bold">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-top bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Close Comparison</button>
          <button className="btn-primary">Export Detailed Report</button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;
