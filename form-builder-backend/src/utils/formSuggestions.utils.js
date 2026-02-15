// Form suggestions and recommendations based on patterns
const Form = require('../models/form.model');
const Response = require('../models/response.model');

// Common form templates with questions (pre-built for quick forms)
const FORM_TEMPLATES = {
  'customer-feedback': {
    title: 'Customer Feedback Form',
    description: 'Collect feedback on products or services',
    questions: [
      { label: 'How satisfied are you with our service?', type: 'singleSelect', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'], required: true },
      { label: 'What did you like most?', type: 'longText', required: false },
      { label: 'What could we improve?', type: 'longText', required: false },
      { label: 'Would you recommend us?', type: 'singleSelect', options: ['Yes', 'No', 'Maybe'], required: true },
      { label: 'Additional comments', type: 'longText', required: false }
    ]
  },
  'employee-survey': {
    title: 'Employee Satisfaction Survey',
    description: 'Measure employee engagement and satisfaction',
    questions: [
      { label: 'How satisfied are you with your job?', type: 'singleSelect', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'], required: true },
      { label: 'Do you have the tools to do your job effectively?', type: 'singleSelect', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'], required: true },
      { label: 'How well does management support your growth?', type: 'singleSelect', options: ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor'], required: true },
      { label: 'What improvements would you suggest?', type: 'longText', required: false }
    ]
  },
  'product-research': {
    title: 'Product Research Survey',
    description: 'Gather insights for product development',
    questions: [
      { label: 'What is your main use case?', type: 'shortText', required: true },
      { label: 'How often do you use this type of product?', type: 'singleSelect', options: ['Daily', 'Weekly', 'Monthly', 'Rarely'], required: true },
      { label: 'What features are most important to you?', type: 'longText', required: true },
      { label: 'What price range would you prefer?', type: 'shortText', required: false },
      { label: 'Any additional feedback?', type: 'longText', required: false }
    ]
  },
  'event-registration': {
    title: 'Event Registration Form',
    description: 'Collect attendee information for events',
    questions: [
      { label: 'Full Name', type: 'shortText', required: true },
      { label: 'Email Address', type: 'shortText', required: true },
      { label: 'Will you attend?', type: 'singleSelect', options: ['Yes', 'No', 'Maybe'], required: true },
      { label: 'Dietary Restrictions', type: 'longText', required: false },
      { label: 'How did you hear about this event?', type: 'singleSelect', options: ['Email', 'Social Media', 'Word of Mouth', 'Other'], required: false }
    ]
  },
  'bug-report': {
    title: 'Bug Report Form',
    description: 'Report software issues and bugs',
    questions: [
      { label: 'What is the bug?', type: 'shortText', required: true },
      { label: 'Detailed Description', type: 'longText', required: true },
      { label: 'Steps to Reproduce', type: 'longText', required: true },
      { label: 'Expected Behavior', type: 'longText', required: false },
      { label: 'Actual Behavior', type: 'longText', required: false },
      { label: 'Severity', type: 'singleSelect', options: ['Critical', 'High', 'Medium', 'Low'], required: true }
    ]
  },
  'nps-survey': {
    title: 'Net Promoter Score (NPS) Survey',
    description: 'Measure customer loyalty using NPS',
    questions: [
      { label: 'How likely are you to recommend us to a friend or colleague?', type: 'singleSelect', options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], required: true },
      { label: 'Why did you give this score?', type: 'longText', required: true },
      { label: 'What could we do better?', type: 'longText', required: false }
    ]
  }
};

// Analyze user's form to suggest a matching template
function suggestTemplate(formData) {
  const suggestions = [];
  
  // Analyze form characteristics
  const questionCount = formData.questions?.length || 0;
  const hasLongText = formData.questions?.some(q => q.type === 'long-text') || false;
  const hasRating = formData.questions?.some(q => q.type === 'single-select' && (q.options.length > 4 || q.options.some(o => ['Yes', 'No', 'Maybe', 'Strongly Agree', 'Agree'].includes(o)))) || false;
  const title = (formData.title || '').toLowerCase();

  // Score each template
  const scores = {};
  
  Object.entries(FORM_TEMPLATES).forEach(([key, template]) => {
    let score = 0;

    // Check title similarity
    if (title.includes('feedback')) score += key === 'customer-feedback' ? 50 : 0;
    if (title.includes('employee') || title.includes('survey')) score += key === 'employee-survey' ? 50 : 0;
    if (title.includes('product')) score += key === 'product-research' ? 50 : 0;
    if (title.includes('event') || title.includes('registration')) score += key === 'event-registration' ? 50 : 0;
    if (title.includes('bug') || title.includes('issue')) score += key === 'bug-report' ? 50 : 0;
    if (title.includes('nps')) score += key === 'nps-survey' ? 50 : 0;

    // Check question count similarity
    const templateQuestionCount = template.questions.length;
    score += Math.max(0, 20 - Math.abs(templateQuestionCount - questionCount) * 2);

    // Check content similarity
    if (hasLongText && template.questions.some(q => q.type === 'long-text')) score += 15;
    if (hasRating && template.questions.some(q => q.type === 'single-select')) score += 15;

    scores[key] = score;
  });

  // Get top 3 suggestions
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .filter(([, score]) => score > 0);

  return sorted.map(([key, score]) => ({
    templateId: key,
    templateName: FORM_TEMPLATES[key].title,
    description: FORM_TEMPLATES[key].description,
    similarity: Math.min(100, score),
    suggestedQuestions: FORM_TEMPLATES[key].questions
  }));
}

// Suggest form improvements based on responses
async function suggestImprovements(formId) {
  try {
    const form = await Form.findById(formId);
    const responses = await Response.find({ formId }).limit(50);

    if (responses.length === 0) {
      return {
        suggestions: ['Collect more responses to generate improvement suggestions'],
        priority: 'low'
      };
    }

    const suggestions = [];
    const issues = [];

    // Check for questions with no responses (high skip rate)
    responses.forEach(response => {
      form.questions.forEach(q => {
        if (!response.answers[q.fieldId] && q.required) {
          issues.push({
            question: q.label,
            issue: 'High skip rate on required field',
            suggestion: 'Consider clarifying the question or making it optional'
          });
        }
      });
    });

    // Check for high spam scores
    const spamResponses = responses.filter(r => r.spamScore > 0.3);
    if (spamResponses.length > responses.length * 0.1) {
      suggestions.push('Add validation to prevent spam submissions');
      suggestions.push('Consider adding CAPTCHA or rate limiting');
    }

    // Check for low quality responses
    const lowQualityResponses = responses.filter(r => r.qualityScore < 0.5);
    if (lowQualityResponses.length > responses.length * 0.2) {
      suggestions.push('Consider adding help text or examples to guide users');
      suggestions.push('Review form length - users may be rushing');
    }

    // Check form length
    if (form.questions.length > 20) {
      suggestions.push('Form has many questions - consider breaking into multiple forms');
    }

    if (form.questions.length < 3) {
      suggestions.push('Form has very few questions - consider adding more detail-oriented questions');
    }

    // Check for negative sentiment
    const negativeResponses = responses.filter(r => r.sentiment?.label === 'NEGATIVE');
    if (negativeResponses.length > responses.length * 0.3) {
      suggestions.push('Many responses have negative sentiment - review questions for clarity');
    }

    return {
      suggestions: [...new Set(suggestions)], // Remove duplicates
      issues: issues.slice(0, 5),
      respondentCount: responses.length,
      quality: {
        averageQuality: (responses.reduce((sum, r) => sum + (r.qualityScore || 1), 0) / responses.length).toFixed(2),
        averageSpamScore: (responses.reduce((sum, r) => sum + (r.spamScore || 0), 0) / responses.length).toFixed(3)
      }
    };
  } catch (error) {
    console.error('Suggestions Error:', error.message);
    return { suggestions: [], issues: [] };
  }
}

// Get template by ID
function getTemplate(templateId) {
  return FORM_TEMPLATES[templateId] || null;
}

// List all available templates
function listTemplates() {
  return Object.entries(FORM_TEMPLATES).map(([id, template]) => ({
    id,
    title: template.title,
    description: template.description,
    questionCount: template.questions.length
  }));
}

module.exports = {
  suggestTemplate,
  suggestImprovements,
  getTemplate,
  listTemplates,
  FORM_TEMPLATES
};
