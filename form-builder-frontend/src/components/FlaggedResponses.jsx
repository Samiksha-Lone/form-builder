import React, { useEffect, useState } from 'react';
import { AlertTriangle, TrendingDown, Trash2, Eye } from 'lucide-react';

function FlaggedResponses({ formId, token }) {
  const [flaggedResponses, setFlaggedResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, spam, negative, lowQuality

  useEffect(() => {
    fetchFlaggedResponses();
  }, [formId, token]);

  const fetchFlaggedResponses = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/forms/${formId}/flagged-responses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!response.ok) throw new Error('Failed to fetch flagged responses');
      
      const data = await response.json();
      setFlaggedResponses(data.flaggedResponses || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredResponses = () => {
    if (filterType === 'all') return flaggedResponses;
    if (filterType === 'spam') return flaggedResponses.filter(r => r.isSpam);
    if (filterType === 'negative') return flaggedResponses.filter(r => r.sentiment?.label === 'NEGATIVE');
    if (filterType === 'lowQuality') return flaggedResponses.filter(r => r.qualityScore < 0.5);
    return flaggedResponses;
  };

  const getSeverityBadge = (response) => {
    if (response.isSpam) return { color: 'red', label: 'Spam' };
    if (response.sentiment?.label === 'NEGATIVE') return { color: 'orange', label: 'Negative' };
    if (response.qualityScore < 0.5) return { color: 'yellow', label: 'Low Quality' };
    if (response.spamScore > 0.3) return { color: 'red', label: 'Suspicious' };
    return { color: 'gray', label: 'Review' };
  };

  const getColorClass = (color) => {
    const colors = {
      red: 'bg-red-100 text-red-800 border-red-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[color] || colors.gray;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error: {error}</p>
      </div>
    );
  }

  const filteredResponses = getFilteredResponses();

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setFilterType('all')}
          className={`cursor-pointer rounded-lg p-4 transition ${filterType === 'all' ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white border border-gray-200'}`}
        >
          <p className="text-gray-600 text-sm">Total Flagged</p>
          <p className="text-2xl font-bold text-blue-600">{flaggedResponses.length}</p>
        </div>

        <div 
          onClick={() => setFilterType('spam')}
          className={`cursor-pointer rounded-lg p-4 transition ${filterType === 'spam' ? 'bg-red-50 border-2 border-red-500' : 'bg-white border border-gray-200'}`}
        >
          <p className="text-gray-600 text-sm">Spam</p>
          <p className="text-2xl font-bold text-red-600">{flaggedResponses.filter(r => r.isSpam).length}</p>
        </div>

        <div 
          onClick={() => setFilterType('negative')}
          className={`cursor-pointer rounded-lg p-4 transition ${filterType === 'negative' ? 'bg-orange-50 border-2 border-orange-500' : 'bg-white border border-gray-200'}`}
        >
          <p className="text-gray-600 text-sm">Negative</p>
          <p className="text-2xl font-bold text-orange-600">{flaggedResponses.filter(r => r.sentiment?.label === 'NEGATIVE').length}</p>
        </div>

        <div 
          onClick={() => setFilterType('lowQuality')}
          className={`cursor-pointer rounded-lg p-4 transition ${filterType === 'lowQuality' ? 'bg-yellow-50 border-2 border-yellow-500' : 'bg-white border border-gray-200'}`}
        >
          <p className="text-gray-600 text-sm">Low Quality</p>
          <p className="text-2xl font-bold text-yellow-600">{flaggedResponses.filter(r => r.qualityScore < 0.5).length}</p>
        </div>
      </div>

      {/* Responses List */}
      <div className="space-y-4">
        {filteredResponses.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <p className="text-green-700 font-semibold">✓ No flagged responses in this category</p>
          </div>
        ) : (
          filteredResponses.map((response, idx) => {
            const severity = getSeverityBadge(response);
            return (
              <div key={response._id || idx} className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getColorClass(severity.color)}`}>
                        {severity.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(response.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded transition">
                      <Eye size={18} className="text-blue-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded transition">
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-4 gap-4 mb-4 pb-4 border-b">
                  <div>
                    <p className="text-xs text-gray-500">Quality Score</p>
                    <p className="text-lg font-bold text-blue-600">{(response.qualityScore * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Spam Score</p>
                    <p className="text-lg font-bold text-red-600">{(response.spamScore * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Sentiment</p>
                    <p className="text-lg font-bold text-purple-600">{response.sentiment?.label || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-lg font-bold text-gray-600">{response.isSpam ? 'Spam' : 'Review'}</p>
                  </div>
                </div>

                {/* Issues if negative sentiment */}
                {response.sentiment?.label === 'NEGATIVE' && (
                  <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-3 flex gap-2">
                    <TrendingDown size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-800">
                      <span className="font-semibold">Negative feedback detected</span> - Consider reaching out to address concerns
                    </p>
                  </div>
                )}

                {/* Spam warning */}
                {response.isSpam && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 flex gap-2">
                    <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">
                      <span className="font-semibold">Spam detected</span> - This response may be from a bot or contain invalid data
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={fetchFlaggedResponses}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
      >
        Refresh
      </button>
    </div>
  );
}

export default FlaggedResponses;
