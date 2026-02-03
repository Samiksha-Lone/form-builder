import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LogOut, FileText, BarChart3, ExternalLink, Copy, Check, Edit2, Trash2 } from 'lucide-react';
import { API_BASE_URL } from './config';
import { apiCall } from './utils/api';
import LoadingSpinner from './components/LoadingSpinner';

const Dashboard = () => {
  const [copiedId, setCopiedId] = useState(null);
  const [me, setMe] = useState(null);
  const [bases, setBases] = useState([]);
  const [tables, setTables] = useState([]);
  const [fields, setFields] = useState([]);
  const [builder, setBuilder] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState('');
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formTitle, setFormTitle] = useState('My New Form');

  const navigate = useNavigate();

  useEffect(() => {
    apiCall('/api/me')
    .then(data => {
      setMe(data);
      setLoading(false);
    })
    .catch(() => {
      localStorage.removeItem('jwtToken');
      setLoading(false);
    });
}, []);

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (token) {
    localStorage.setItem('jwtToken', token);
    window.history.replaceState({}, '', '/dashboard');
  }
}, []);

  useEffect(() => {
    if (!me?.loggedIn) return;
  
    apiCall('/api/fields')
      .then(data => {
        setFields(data.fields);
        setBuilder(data.fields.map(f => ({
          ...f,
          enabled: true,
          conditionalRules: f.id === 'githubUrl' ? {
            logic: 'AND',
            conditions: [{ questionKey: 'role', operator: 'equals', value: 'Engineer' }]
          } : null
        })));
      })
      .catch(err => setError('Failed to load fields'));
  }, [me]);

  useEffect(() => {
    if (!me?.loggedIn) return;
    apiCall('/api/forms')
      .then(data => setForms(data.forms || []))
      .catch(err => setError('Failed to load forms'));
  }, [me]);

  const toggleEnabled = (id) => {
    setBuilder(prev => prev.map(f => 
      f.id === id ? { ...f, enabled: !f.enabled } : f
    ));
  };

  const updateLabel = (id, label) => {
    setBuilder(prev => prev.map(f => 
      f.id === id ? { ...f, label } : f
    ));
  };

  const toggleRequired = (id) => {
    setBuilder(prev => prev.map(f => 
      f.id === id ? { ...f, required: !f.required } : f
    ));
  };

  const addOption = (id) => {
    setBuilder(prev => prev.map(f => 
      f.id === id ? { ...f, options: [...(f.options || []), `Option ${(f.options?.length || 0) + 1}`] } : f
    ));
  };

  const removeOption = (fieldId, optIndex) => {
    setBuilder(prev => prev.map(f => 
      f.id === fieldId ? { ...f, options: f.options.filter((_, i) => i !== optIndex) } : f
    ));
  };

  const updateOption = (fieldId, optIndex, value) => {
    setBuilder(prev => prev.map(f => {
      if (f.id !== fieldId) return f;
      const newOptions = [...f.options];
      newOptions[optIndex] = value;
      return { ...f, options: newOptions };
    }));
  };

  const addQuestion = () => {
    const id = 'q' + Date.now();
    setBuilder(prev => [...prev, {
      id,
      label: 'New question',
      type: 'shortText',
      required: false,
      enabled: true
    }]);
  };

  const handleSaveForm = async () => {
    setSaving(true);
    setSaveMessage('');

    const questions = builder
      .filter(f => f.enabled)
      .map(f => ({
        fieldId: f.id,
        label: f.label,
        type: f.type,
        required: f.required,
        options: f.options,
        conditionalRules: f.conditionalRules
      }));

    try {
      const url = editingId ? `/api/forms/${editingId}` : '/api/forms';
      const method = editingId ? 'PUT' : 'POST';

      const data = await apiCall(url, {
        method,
        body: JSON.stringify({
          title: formTitle,
          questions
        })
      });
      
      setSaveMessage(editingId ? 'Form updated!' : `Form saved!`);
      if (data.formId) setEditingId(data.formId);
      
      apiCall('/api/forms').then(data => setForms(data.forms));
    } catch (err) {
      setSaveMessage('Failed to save form: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditForm = (form) => {
    apiCall(`/api/forms/${form.id}`).then(data => {
      setEditingId(data.id);
      setFormTitle(data.title);
      setBuilder(data.questions.map(q => ({
        id: q.fieldId,
        label: q.label,
        type: q.type,
        required: q.required,
        enabled: true,
        options: q.options,
        conditionalRules: q.conditionalRules
      })));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const handleDeleteForm = async (id) => {
    if (!window.confirm('Are you sure you want to delete this form and all its responses?')) return;
    
    try {
      await apiCall(`/api/forms/${id}`, { method: 'DELETE' });
      setForms(prev => prev.filter(f => f.id !== id));
      if (editingId === id) resetToNewForm();
    } catch (err) {
      alert('Failed to delete form');
    }
  };

  const resetToNewForm = () => {
    setEditingId(null);
    setFormTitle('My New Form');
    apiCall('/api/fields').then(data => {
      setBuilder(data.fields.map(f => ({ ...f, enabled: true, conditionalRules: null })));
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    navigate('/login');
  };

  const handleCopy = (id) => {
    const url = `${window.location.origin}/forms/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <LoadingSpinner size={40} />
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center text-red-600 bg-slate-50">
      <p className="text-xl font-semibold mb-2">Something went wrong</p>
      <p>{error}</p>
    </div>
  );
  if (!me?.loggedIn) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
      <p className="mb-4 text-slate-600 font-medium">Please login to continue</p>
      <a href="/login" className="px-6 py-2 bg-sky-600 text-white rounded-lg font-bold hover:bg-sky-700 transition-colors">
        Go to Login
      </a>
    </div>
  );
  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">FormBuilder</h1>
            <p className="text-slate-500 text-sm font-medium">Create and manage your forms</p>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-center sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0">
            <span className="text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 px-4 py-1.5 rounded-full truncate max-w-[150px] sm:max-w-none">
              {me.name || 'User'}
            </span>
            <button 
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="space-y-1 w-full flex-1">
                <input
                  type="text"
                  className="text-2xl font-black text-slate-800 bg-transparent border-b-2 border-transparent hover:border-slate-100 focus:border-sky-500 transition-all outline-none px-0 w-full"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Enter form title..."
                />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {editingId ? 'Editing Mode' : 'New Form Design'}
                </p>
              </div>
              <div className="flex gap-2">
                {editingId && (
                  <button
                    onClick={resetToNewForm}
                    className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all border border-slate-100"
                    title="Clear to New Form"
                  >
                    <Plus size={20} />
                  </button>
                )}
                <button 
                  onClick={addQuestion}
                  className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-100"
                  title="Add Question"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {builder.map(field => (
                <div key={field.id} className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex flex-col gap-4 hover:border-sky-200 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={field.enabled}
                        onChange={() => toggleEnabled(field.id)}
                        className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 border-slate-300 transition-all"
                      />
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{field.type}</span>
                    </div>
                    {field.required && <span className="text-[10px] text-red-500 font-bold px-2 py-0.5 bg-red-50 rounded">REQUIRED</span>}
                  </div>
                  
                  <input 
                    type="text"
                    value={field.label}
                    onChange={e => updateLabel(field.id, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all outline-none"
                    placeholder="Question label"
                  />
                  
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={field.required || false}
                        onChange={() => toggleRequired(field.id)}
                        className="w-3.5 h-3.5 text-sky-600 rounded focus:ring-sky-500 border-slate-300"
                      />
                      <span>Mark Required</span>
                    </label>
                  </div>

                  {field.type === 'singleSelect' && (
                    <div className="space-y-2 mt-2 bg-slate-100/50 p-3 rounded-lg border border-slate-200/50">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Options</span>
                        <button 
                          onClick={() => addOption(field.id)}
                          className="text-[10px] font-bold text-sky-600 hover:text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-100"
                        >
                          + ADD
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {(field.options || []).map((opt, i) => (
                          <div key={i} className="flex gap-2">
                            <input 
                              type="text"
                              value={opt}
                              onChange={e => updateOption(field.id, i, e.target.value)}
                              className="flex-1 bg-white border border-slate-200 rounded-md px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-sky-500"
                            />
                            <button 
                              onClick={() => removeOption(field.id, i)}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={handleSaveForm}
              disabled={saving}
              className="mt-6 w-full py-4 px-6 rounded-2xl bg-sky-600 text-white font-black uppercase tracking-widest text-xs hover:bg-sky-700 active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-sky-100 flex items-center justify-center gap-3"
            >
              {saving ? <LoadingSpinner size={20} className="text-white" /> : (editingId ? <Edit2 size={16} /> : <Plus size={16} />)}
              {saving ? 'Processing...' : (editingId ? 'Update Design' : 'Publish Form')}
            </button>
            {saveMessage && (
              <p className={`mt-3 p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${
                saveMessage.includes('saved') || saveMessage.includes('updated') 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                <Check size={16} />
                {saveMessage}
              </p>
            )}
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-2 mb-6">
              <FileText className="text-sky-600" size={24} />
              <h3 className="text-xl font-bold text-slate-800">Your Forms</h3>
            </div>
            {forms.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-slate-400 font-medium">No forms yet. Create one on the left!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {forms.map((form, idx) => (
                    <motion.div 
                      key={form.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl p-5 transition-all hover:shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1 w-full sm:w-auto">
                          <h4 className="font-bold text-slate-800 group-hover:text-sky-600 transition-colors uppercase tracking-tight break-words">{form.title}</h4>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
                              {new Date(form.createdAt).toLocaleDateString()}
                            </p>
                            <span className="text-[9px] sm:text-[10px] px-2 py-0.5 bg-sky-50 text-sky-600 rounded-full font-bold border border-sky-100 whitespace-nowrap">
                              {form.responseCount || 0} Responses
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                          <button 
                            onClick={() => handleCopy(form.id)}
                            className={`p-2 border rounded-lg transition-all shadow-sm ${
                              copiedId === form.id 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                : 'bg-white text-slate-600 border-slate-200 hover:text-sky-600 hover:border-sky-600'
                            }`}
                            title="Copy Share Link"
                          >
                            {copiedId === form.id ? <Check size={18} /> : <Copy size={18} />}
                          </button>
                          <button 
                            onClick={() => handleEditForm(form)}
                            className="p-2 bg-white text-slate-600 border border-slate-200 rounded-lg hover:text-sky-600 hover:border-sky-600 transition-all shadow-sm"
                            title="Edit Design"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => navigate(`/forms/${form.id}`)}
                            className="p-2 bg-white text-slate-600 border border-slate-200 rounded-lg hover:text-sky-600 hover:border-sky-600 transition-all shadow-sm"
                            title="Preview Form"
                          >
                            <ExternalLink size={18} />
                          </button>
                          <button 
                            onClick={() => navigate(`/forms/${form.id}/responses`)}
                            className="p-2 bg-white text-slate-600 border border-slate-200 rounded-lg hover:text-emerald-600 hover:border-emerald-600 transition-all shadow-sm"
                            title="View Data"
                          >
                            <BarChart3 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteForm(form.id)}
                            className="p-2 bg-white text-slate-400 border border-slate-200 rounded-lg hover:text-red-600 hover:border-red-600 transition-all shadow-sm"
                            title="Delete Form"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
};

export default Dashboard;

