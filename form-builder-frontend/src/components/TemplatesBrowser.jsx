import React, { useEffect, useState } from 'react';
import { Copy, ExternalLink, Plus } from 'lucide-react';

function TemplatesBrowser() {
  const [templates, setTemplates] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/templates');
      
      if (!response.ok) throw new Error('Failed to fetch templates');
      
      const data = await response.json();
      setTemplates(data.templates);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplateDetails = async (templateId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/templates/${templateId}`);
      
      if (!response.ok) throw new Error('Failed to fetch template');
      
      const data = await response.json();
      setSelectedTemplate(data);
    } catch (err) {
      console.error('Error fetching template:', err);
    }
  };

  const createFormFromTemplate = async (template) => {
    const formData = {
      title: template.title,
      questions: template.questions.map(q => ({
        fieldId: `q_${Math.random().toString(36).substr(2, 9)}`,
        label: q.label,
        type: q.type,
        required: q.required || false,
        options: q.options || [],
      }))
    };

    // This would call the form creation API
    // For now, just show in console
    console.log('Creating form from template:', formData);
    
    // In a real app, you'd do:
    // const response = await fetch('http://localhost:5000/api/forms', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`
    //   },
    //   body: JSON.stringify(formData)
    // });
  };

  const copyTemplateJson = (template) => {
    navigator.clipboard.writeText(JSON.stringify(template, null, 2));
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.map((template) => (
          <div 
            key={template.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition border-t-4 border-blue-500 overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{template.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {template.questionCount} Questions
                </span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    fetchTemplateDetails(template.id);
                    setSelectedTemplate({ id: template.id, ...template });
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded flex items-center justify-center gap-2 transition"
                >
                  <ExternalLink size={16} />
                  View Details
                </button>

                <button
                  onClick={() => createFormFromTemplate(template)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded flex items-center justify-center gap-2 transition"
                >
                  <Plus size={16} />
                  Use Template
                </button>

                <button
                  onClick={() => copyTemplateJson(template)}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded flex items-center justify-center gap-2 transition text-sm"
                >
                  <Copy size={14} />
                  {copiedId === template.id ? 'Copied!' : 'Copy JSON'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Template Details */}
      {selectedTemplate && (
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <h3 className="text-2xl font-bold mb-4">{selectedTemplate.title}</h3>
          <p className="text-gray-600 mb-6">{selectedTemplate.description}</p>

          <div className="bg-gray-50 rounded p-6 overflow-auto">
            <h4 className="font-bold mb-4">Questions Preview:</h4>
            <div className="space-y-4">
              {selectedTemplate.questions?.map((q, idx) => (
                <div key={idx} className="bg-white p-4 rounded border border-gray-200">
                  <p className="font-semibold text-gray-900">{idx + 1}. {q.label}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Type: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{q.type}</span>
                    {q.required && <span className="ml-2 text-red-500">*Required</span>}
                  </p>
                  {q.options && q.options.length > 0 && (
                    <div className="mt-2 ml-4">
                      {q.options.map((opt, oidx) => (
                        <p key={oidx} className="text-sm text-gray-600">• {opt}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setSelectedTemplate(null)}
            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
          >
            Close Details
          </button>
        </div>
      )}
    </div>
  );
}

export default TemplatesBrowser;
