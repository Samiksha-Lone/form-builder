import React, { useEffect, useState } from 'react';
import { Lightbulb, AlertTriangle, Info } from 'lucide-react';

function FormSuggestions({ formId, token }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSuggestions();
  }, [formId, token]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/forms/${formId}/improvements`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      
      const data = await response.json();
      setSuggestions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
      {/* Statistics */}
      {suggestions?.respondentCount && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Total Responses</p>
            <p className="text-2xl font-bold text-blue-600">{suggestions.respondentCount}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Average Quality</p>
            <p className="text-2xl font-bold text-green-600">{(suggestions.quality?.averageQuality * 100).toFixed(0)}%</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Avg Spam Score</p>
            <p className="text-2xl font-bold text-orange-600">{(suggestions.quality?.averageSpamScore * 100).toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions?.suggestions && suggestions.suggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lightbulb size={20} className="text-yellow-500" />
            Suggestions to Improve Your Form
          </h3>
          
          <ul className="space-y-3">
            {suggestions.suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="text-yellow-500 font-bold text-lg">→</span>
                <span className="text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Issues */}
      {suggestions?.issues && suggestions.issues.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" />
            Issues Found ({suggestions.issues.length})
          </h3>
          
          <div className="space-y-4">
            {suggestions.issues.map((issue, idx) => (
              <div key={idx} className="bg-red-50 rounded p-4">
                <p className="font-semibold text-red-800 mb-2">{issue.question}</p>
                <p className="text-sm text-red-700 mb-2">
                  <span className="font-semibold">Issue:</span> {issue.issue}
                </p>
                <p className="text-sm text-red-700 flex items-start gap-2">
                  <Info size={14} className="mt-0.5 flex-shrink-0" />
                  <span><span className="font-semibold">Fix:</span> {issue.suggestion}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No suggestions */}
      {(!suggestions?.suggestions || suggestions.suggestions.length === 0) && 
       (!suggestions?.issues || suggestions.issues.length === 0) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700">✓ Your form is looking great! No improvements needed.</p>
        </div>
      )}

      <button
        onClick={fetchSuggestions}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
      >
        Refresh Suggestions
      </button>
    </div>
  );
}

export default FormSuggestions;
