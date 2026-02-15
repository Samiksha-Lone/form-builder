import React, { useEffect, useState } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';

function ResponseTimeline({ formId, token }) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchTimeline();
  }, [formId, token, days]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/forms/${formId}/analytics/timeline?days=${days}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!response.ok) throw new Error('Failed to fetch timeline');
      
      const data = await response.json();
      setTimeline(data.timeline || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMaxCount = () => {
    return Math.max(...timeline.map(t => t.count), 1);
  };

  const getBarHeight = (count) => {
    const max = getMaxCount();
    return (count / max) * 100;
  };

  const getTrendIndicator = () => {
    if (timeline.length < 2) return null;
    
    const firstHalf = timeline.slice(0, Math.floor(timeline.length / 2));
    const secondHalf = timeline.slice(Math.floor(timeline.length / 2));
    
    const avgFirst = firstHalf.reduce((sum, t) => sum + t.count, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, t) => sum + t.count, 0) / secondHalf.length;
    
    const change = ((avgSecond - avgFirst) / avgFirst) * 100;
    
    return {
      change: change.toFixed(1),
      trend: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable'
    };
  };

  const totalResponses = timeline.reduce((sum, t) => sum + t.count, 0);
  const averagePerDay = totalResponses / timeline.length || 0;
  const trend = getTrendIndicator();

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

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Total Responses</p>
          <p className="text-3xl font-bold text-blue-600">{totalResponses}</p>
          <p className="text-xs text-gray-500 mt-1">Last {days} days</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Avg/Day</p>
          <p className="text-3xl font-bold text-purple-600">{averagePerDay.toFixed(1)}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Peak Day</p>
          <p className="text-3xl font-bold text-green-600">
            {timeline.length > 0 ? Math.max(...timeline.map(t => t.count)) : 0}
          </p>
        </div>

        {trend && (
          <div className={`bg-gradient-to-br rounded-lg p-4 border ${
            trend.trend === 'increasing' ? 'from-green-50 to-green-100 border-green-200' :
            trend.trend === 'decreasing' ? 'from-red-50 to-red-100 border-red-200' :
            'from-gray-50 to-gray-100 border-gray-200'
          }`}>
            <p className="text-gray-600 text-sm">Trend</p>
            <div className="flex items-center gap-2">
              <TrendingUp size={24} className={`${
                trend.trend === 'increasing' ? 'text-green-600' :
                trend.trend === 'decreasing' ? 'text-red-600' :
                'text-gray-600'
              }`} 
                style={{
                  transform: trend.trend === 'decreasing' ? 'rotate(180deg)' : 'none'
                }}
              />
              <p className={`text-2xl font-bold ${
                trend.trend === 'increasing' ? 'text-green-600' :
                trend.trend === 'decreasing' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {Math.abs(parseFloat(trend.change))}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Time Period Selector */}
      <div className="flex gap-2">
        {[7, 14, 30, 60].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-2 rounded font-medium transition ${
              days === d
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Calendar size={20} className="text-blue-500" />
          Response Trend
        </h3>

        {timeline.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No response data for this period</p>
        ) : (
          <div className="space-y-3">
            {timeline.map((day, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <span className="text-sm font-bold text-blue-600">{day.count} {day.count === 1 ? 'response' : 'responses'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-300"
                    style={{ width: `${getBarHeight(day.count)}%` }}
                  >
                    {day.count > 0 && (
                      <span className="text-xs font-bold text-white">
                        {day.count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insights */}
      {timeline.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900">
            <span className="font-semibold">📊 Insights:</span> Your form received{' '}
            <span className="font-bold">{totalResponses}</span> responses over the last{' '}
            <span className="font-bold">{days}</span> days, averaging{' '}
            <span className="font-bold">{averagePerDay.toFixed(1)}</span> responses per day.
            {trend && (
              <>
                {' '}Response rate is{' '}
                <span className={trend.trend === 'increasing' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                  {trend.trend === 'increasing' ? '↑ increasing' : '↓ decreasing'}
                </span>{' '}
                by <span className="font-bold">{Math.abs(parseFloat(trend.change))}%</span>.
              </>
            )}
          </p>
        </div>
      )}

      <button
        onClick={fetchTimeline}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
      >
        Refresh
      </button>
    </div>
  );
}

export default ResponseTimeline;
