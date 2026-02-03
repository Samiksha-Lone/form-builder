import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiCall } from '../utils/api';

const FormResponses = () => {
  const { formId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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
  if (!data || !data.responses || data.responses.length === 0)
    return <p className="p-4 text-center text-gray-600">No responses yet.</p>;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-8">Responses</h1>
      <ul className="space-y-4">
        {data.responses.map((r) => (
          <li
            key={r.id}
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-slate-50">
              <span className="font-mono text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">ID: {r.id}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">{new Date(r.createdAt).toLocaleString()}</span>
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
  );
};

export default FormResponses;
