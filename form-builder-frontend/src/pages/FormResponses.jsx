import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart3, ListIcon, Lightbulb, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { apiCall } from '../utils/api';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import FormSuggestions from '../components/FormSuggestions';
import FlaggedResponses from '../components/FlaggedResponses';
import ResponseTimeline from '../components/ResponseTimeline';

const FormResponses = () => {
  const { formId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('responses');
  const [token] = useState(localStorage.getItem('jwtToken') || '');

  useEffect(() => {
  setLoading(true);
  apiCall(`/api/forms/${formId}/responses`)   
    .then(json => {
      setData(json);
      setError('');
    })
    .catch(() => setError('Failed to load responses'))
    .finally(() => setLoading(false));
}, [formId]);

  if (loading) return <p className="p-4 text-center">Loading responses...</p>;
  if (error) return <p className="p-4 text-red-600 text-center">{error}</p>;

  const tabs = [
    { id: 'responses', label: 'Responses', icon: ListIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
    { id: 'flagged', label: 'Quality Control', icon: AlertTriangle },
    { id: 'timeline', label: 'Timeline', icon: TrendingUp }
  ];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">Form Analytics & Responses</h1>
      
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6 border border-slate-100 overflow-x-auto">
        <div className="flex gap-1 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow border border-slate-100 p-6">
        {/* Responses Tab */}
        {activeTab === 'responses' && (
          <div>
            {!data || !data.responses || data.responses.length === 0 ? (
              <p className="text-center text-gray-600 py-8">No responses yet.</p>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Showing <span className="font-bold">{data.responses.length}</span> responses
                </p>
                <ul className="space-y-4">
                  {data.responses.map((r) => (
                    <li
                      key={r.id}
                      className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                        <span className="font-mono text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">ID: {r.id}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">{new Date(r.createdAt).toLocaleString()}</span>
                        {r.sentiment && (
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            r.sentiment.label === 'POSITIVE' ? 'bg-green-100 text-green-800' :
                            r.sentiment.label === 'NEGATIVE' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {r.sentiment.label}
                          </span>
                        )}
                        {r.qualityScore && (
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            r.qualityScore >= 0.8 ? 'bg-green-100 text-green-800' :
                            r.qualityScore >= 0.5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            Quality: {(r.qualityScore * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-gray-800 space-y-1">
                        {Object.entries(r.answers)
                          .slice(0, 5) 
                          .map(([key, value]) => (
                            <div key={key}>
                              <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : String(value)}
                            </div>
                          ))}
                        {Object.entries(r.answers).length > 5 && (
                          <div className="text-xs text-gray-500 mt-1">...and more</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && formId && (
          <AnalyticsDashboard formId={formId} token={token} />
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && formId && (
          <FormSuggestions formId={formId} token={token} />
        )}

        {/* Flagged Tab */}
        {activeTab === 'flagged' && formId && (
          <FlaggedResponses formId={formId} token={token} />
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && formId && (
          <ResponseTimeline formId={formId} token={token} />
        )}
      </div>
    </div>
  );
};

export default FormResponses;
