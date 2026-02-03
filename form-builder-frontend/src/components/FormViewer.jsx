import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

import { shouldShowQuestion } from '../logic/visibility';
import { apiCall } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const FormViewer = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); 

  useEffect(() => {
    apiCall(`/api/forms/${formId}`)
      .then(data => setForm(data))
      .catch(() => setError('Failed to load form'));
  }, [formId]);

  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const data = await apiCall(`/api/forms/${formId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });
      
      if (data.responseId || data.success) {
        setSubmitStatus('success');
        setAnswers({}); 
      } else {
        setSubmitStatus('error');
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return (
    <div className="flex flex-col items-center justify-center p-12 text-red-600">
      <AlertCircle size={48} className="mb-4" />
      <p className="text-xl font-medium">{error}</p>
    </div>
  );
  
  if (!form) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size={40} />
    </div>
  );

  const visibleQuestions = (form.questions || []).filter((q) =>
    shouldShowQuestion(q.conditionalRules, answers)
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6"
    >
      <header className="border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-900">{form.title}</h1>
        <p className="text-slate-500 mt-1">Please fill out the form below.</p>
      </header>

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {visibleQuestions.map((q, idx) => (
            <motion.div 
              key={q.fieldId}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className="space-y-2 bg-white p-4 rounded-xl border border-slate-100 shadow-sm"
            >
              <label className="block text-sm font-semibold text-slate-700">
                {q.label} {q.required && <span className="text-red-500 font-bold">*</span>}
              </label>
              {q.type === 'longText' ? (
                <textarea
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all outline-none min-h-[100px]"
                  placeholder="Type your answer here..."
                  value={answers[q.fieldId] || ''}
                  onChange={(e) => handleChange(q.fieldId, e.target.value)}
                />
              ) : q.type === 'singleSelect' ? (
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all outline-none bg-white font-medium text-slate-700"
                  value={answers[q.fieldId] || ''}
                  onChange={(e) => handleChange(q.fieldId, e.target.value)}
                >
                  <option value="">Select an option...</option>
                  {(q.options || []).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all outline-none"
                  placeholder="Type your answer here..."
                  value={answers[q.fieldId] || ''}
                  onChange={(e) => handleChange(q.fieldId, e.target.value)}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="pt-4 flex items-center gap-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="px-8 py-3 rounded-lg bg-sky-600 text-white font-bold hover:bg-sky-700 active:scale-95 disabled:opacity-60 disabled:pointer-events-none transition-all shadow-lg shadow-sky-200 flex items-center gap-2"
        >
          {submitting ? <LoadingSpinner size={18} className="text-white" /> : 'Submit Form'}
        </button>

        <AnimatePresence>
          {submitStatus === 'success' && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-emerald-600 font-medium"
            >
              <CheckCircle2 size={20} />
              Response submitted!
            </motion.div>
          )}
          {submitStatus === 'error' && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-red-600 font-medium"
            >
              <AlertCircle size={20} />
              Submission failed.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FormViewer;
