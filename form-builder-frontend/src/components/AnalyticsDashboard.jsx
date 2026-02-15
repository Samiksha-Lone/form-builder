import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, BarChart3, Zap } from 'lucide-react';

function AnalyticsPage({ formId, token }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [formId, token]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/forms/${formId}/analytics`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!response.ok) throw new Error('Failed to fetch analytics');
      
      const data = await response.json();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  if (!analytics) {
    return <div className="text-gray-500">No analytics data available</div>;
  }

  const { sentiment, spam, quality, topPhrases, summary } = analytics;

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="text-blue-500" size={24} />
          Summary
        </h2>
        <div className="space-y-2">
          {summary && summary.map((item, idx) => (
            <p key={idx} className="text-gray-700">{item}</p>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sentiment Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-500" />
            Sentiment
          </h3>
          
          {sentiment && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Positive</span>
                  <span className="text-sm font-bold text-green-600">{sentiment.percentages?.positive}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${sentiment.percentages?.positive}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Negative</span>
                  <span className="text-sm font-bold text-red-600">{sentiment.percentages?.negative}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${sentiment.percentages?.negative}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Neutral</span>
                  <span className="text-sm font-bold text-gray-600">{sentiment.percentages?.neutral}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-400 h-2 rounded-full" 
                    style={{ width: `${sentiment.percentages?.neutral}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">Trend: <span className="font-semibold text-blue-600">{sentiment.trend}</span></p>
                <p className="text-sm text-gray-600">Avg Score: <span className="font-semibold">{sentiment.averageScore}</span></p>
              </div>
            </div>
          )}
        </div>

        {/* Quality Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-blue-500" />
            Quality
          </h3>
          
          {quality && (
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{(quality.averageQualityScore * 100).toFixed(0)}%</p>
                <p className="text-sm text-gray-600">Average Quality</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>High Quality</span>
                  <span className="font-semibold text-green-600">{quality.distribution?.high}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Medium Quality</span>
                  <span className="font-semibold text-yellow-600">{quality.distribution?.medium}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Low Quality</span>
                  <span className="font-semibold text-red-600">{quality.distribution?.low}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Spam Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-orange-500" />
            Spam Detection
          </h3>
          
          {spam && (
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{spam.spamPercentage}%</p>
                <p className="text-sm text-gray-600">Likely Spam</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded p-3">
                <p className="text-xs text-orange-800">
                  <span className="font-semibold">{spam.spamCount}</span> of {spam.total} responses flagged
                </p>
              </div>

              {spam.flaggedForReview && spam.flaggedForReview.length > 0 && (
                <div className="text-xs">
                  <p className="font-semibold mb-2">Recent Flags:</p>
                  {spam.flaggedForReview.slice(0, 3).map((flag, idx) => (
                    <p key={idx} className="text-orange-700">
                      Score: {(flag.spamScore * 100).toFixed(0)}%
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top Phrases */}
      {topPhrases && topPhrases.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-purple-500" />
            Top Themes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPhrases.map((phrase, idx) => (
              <div key={idx} className="bg-purple-50 border border-purple-200 rounded p-4">
                <p className="font-semibold text-purple-900">{phrase.phrase}</p>
                <p className="text-sm text-purple-700">
                  Mentioned <span className="font-bold">{phrase.count}</span> times ({phrase.frequency}%)
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={fetchAnalytics}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
      >
        Refresh Analytics
      </button>
    </div>
  );
}

export default AnalyticsPage;
