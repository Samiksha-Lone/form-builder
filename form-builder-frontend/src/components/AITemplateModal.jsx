import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, FileText, ChevronRight } from 'lucide-react';

const AITemplateModal = ({ isOpen, onClose, onSelect, token }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-sky-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500 rounded-xl text-white shadow-lg shadow-sky-100">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">AI Form Templates</h2>
              <p className="text-xs font-bold text-sky-600 uppercase tracking-widest">Select a pre-built design</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600 shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-10 h-10 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading magic...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onSelect(template.id)}
                  className="group flex flex-col p-5 bg-slate-50 hover:bg-white border border-transparent hover:border-sky-100 rounded-2xl transition-all text-left hover:shadow-xl hover:shadow-sky-50/50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-white rounded-xl text-slate-400 group-hover:text-sky-500 group-hover:scale-110 transition-all shadow-sm">
                      <FileText size={20} />
                    </div>
                    <span className="text-[10px] font-black bg-white px-2 py-1 rounded-full text-slate-400 group-hover:text-sky-600 group-hover:bg-sky-50 transition-colors border border-slate-100 uppercase tracking-tighter">
                      {template.questionCount} Questions
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 group-hover:text-sky-600 transition-colors uppercase tracking-tight text-sm mb-1">{template.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-[10px] font-black text-sky-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                    Use Template <ChevronRight size={12} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            More templates being generated weekly
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AITemplateModal;
