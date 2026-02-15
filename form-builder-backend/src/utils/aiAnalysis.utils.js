const { HfInference } = require('@huggingface/inference');
const natural = require('natural');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Sentiment Analysis using free Hugging Face model
// Model: distilbert-base-uncased-finetuned-sst-2-english
async function analyzeSentiment(textResponses) {
  try {
    if (!textResponses || textResponses.length === 0) {
      return null;
    }

    // Combine all text responses
    const combinedText = Array.isArray(textResponses)
      ? textResponses.filter(t => t && typeof t === 'string').join(' ')
      : String(textResponses);

    if (combinedText.length < 3) {
      return null;
    }

    // Truncate to 512 tokens (limit for this model)
    const truncatedText = combinedText.substring(0, 512);

    const result = await hf.textClassification({
      model: 'distilbert-base-uncased-finetuned-sst-2-english',
      inputs: truncatedText,
    });

    if (result && result.length > 0) {
      // Map model output to our labels
      const topResult = result[0];
      const label = topResult.label === 'POSITIVE' ? 'POSITIVE' : topResult.label === 'NEGATIVE' ? 'NEGATIVE' : 'NEUTRAL';
      
      return {
        label,
        score: topResult.score,
        analyzedAt: new Date()
      };
    }

    return null;
  } catch (error) {
    console.error('Sentiment Analysis Error:', error.message);
    return null; // Fail gracefully
  }
}

// Extract key phrases from text responses
function extractKeyPhrases(textResponses) {
  try {
    const text = Array.isArray(textResponses)
      ? textResponses.filter(t => t && typeof t === 'string').join(' ')
      : String(textResponses);

    if (text.length < 10) {
      return [];
    }

    // Simple key phrase extraction based on frequency
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase());
    
    // Remove common stopwords
    const stopwords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'is', 'was', 'are', 'be', 'have', 'has',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'i', 'you',
      'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those'
    ]);

    const filtered = tokens.filter(token => 
      token.length > 3 && !stopwords.has(token) && /^[a-z]+$/.test(token)
    );

    // Count frequency
    const frequency = {};
    filtered.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Get top phrases
    const phrases = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([phrase]) => phrase);

    return phrases;
  } catch (error) {
    console.error('Key Phrase Extraction Error:', error.message);
    return [];
  }
}

// Spam and Bot Detection using heuristics
function detectSpam(answers, formData) {
  let spamScore = 0;
  const issues = [];

  // Check for empty/null answers
  const emptyCount = Object.values(answers).filter(a => !a || String(a).trim() === '').length;
  if (emptyCount > formData.questions.length * 0.5) {
    spamScore += 0.25;
    issues.push('Too many empty answers');
  }

  // Check for repetitive answers
  const answerValues = Object.values(answers).filter(a => typeof a === 'string');
  const valueCounts = {};
  answerValues.forEach(val => {
    valueCounts[val] = (valueCounts[val] || 0) + 1;
  });
  
  const repetitionRatio = Math.max(...Object.values(valueCounts)) / Math.max(answerValues.length, 1);
  if (repetitionRatio > 0.7) {
    spamScore += 0.3;
    issues.push('Highly repetitive answers');
  }

  // Check for suspicious patterns
  let shortTextCount = 0;
  answerValues.forEach(val => {
    if (val.length < 2) shortTextCount++;
  });
  
  if (shortTextCount > answerValues.length * 0.5) {
    spamScore += 0.2;
    issues.push('Too many single-character answers');
  }

  // Check for random characters
  const randomCharPattern = /[^a-zA-Z0-9\s.,!?'\-()]/g;
  const hasWeirdChars = answerValues.filter(val => 
    (val.match(randomCharPattern) || []).length / Math.max(val.length, 1) > 0.3
  ).length;
  
  if (hasWeirdChars > answerValues.length * 0.3) {
    spamScore += 0.25;
    issues.push('Unusual character patterns detected');
  }

  // Check submission speed (would need timestamp from client)
  // Average human takes 15-20 seconds per question
  // This would be implemented in the route handler

  return {
    spamScore: Math.min(spamScore, 1),
    isSpam: spamScore > 0.5,
    issues
  };
}

// Calculate response quality score
function calculateQualityScore(answers, formData) {
  let qualityScore = 1;

  // Penalty for each issue
  const textAnswers = Object.values(answers).filter(a => typeof a === 'string');
  
  // Very short responses get lower quality
  const tooShort = textAnswers.filter(a => a.length < 3).length;
  qualityScore -= tooShort * 0.05;

  // Bonus for detailed responses
  const detailed = textAnswers.filter(a => a.length > 50).length;
  qualityScore += detailed * 0.05;

  // Required fields properly filled
  const requiredFilled = formData.questions.filter(q => q.required && answers[q.fieldId]).length;
  const requiredTotal = formData.questions.filter(q => q.required).length;
  
  if (requiredTotal > 0 && requiredFilled === requiredTotal) {
    qualityScore += 0.1;
  }

  return Math.min(Math.max(qualityScore, 0), 1);
}

// Generate form structure from a natural language prompt
async function generateFormFromPrompt(prompt) {
  try {
    // For a real implementation, we would use an LLM (like GPT-4 or Gemini)
    // to generate a structured JSON. Since we are using free Hugging Face
    // models, we'll use a combination of keyword extraction and templates.
    
    const lowerPrompt = prompt.toLowerCase();
    let selectedTemplate = 'customer-feedback'; // Default

    if (lowerPrompt.includes('event') || lowerPrompt.includes('wedding') || lowerPrompt.includes('party')) {
      selectedTemplate = 'event-registration';
    } else if (lowerPrompt.includes('bug') || lowerPrompt.includes('issue') || lowerPrompt.includes('error')) {
      selectedTemplate = 'bug-report';
    } else if (lowerPrompt.includes('employee') || lowerPrompt.includes('staff') || lowerPrompt.includes('internal')) {
      selectedTemplate = 'employee-survey';
    } else if (lowerPrompt.includes('product') || lowerPrompt.includes('market') || lowerPrompt.includes('user research')) {
      selectedTemplate = 'product-research';
    } else if (lowerPrompt.includes('nps') || lowerPrompt.includes('loyalty') || lowerPrompt.includes('score')) {
      selectedTemplate = 'nps-survey';
    }

    const { FORM_TEMPLATES } = require('./formSuggestions.utils');
    const template = FORM_TEMPLATES[selectedTemplate];

    return {
      title: `${prompt.charAt(0).toUpperCase() + prompt.slice(1)} Form`,
      questions: template.questions.map((q, idx) => ({
        ...q,
        fieldId: `gen_${idx}_${Date.now()}`
      }))
    };
  } catch (error) {
    console.error('Form Generation Error:', error.message);
    throw new Error('Failed to generate form structure');
  }
}

module.exports = {
  analyzeSentiment,
  extractKeyPhrases,
  detectSpam,
  calculateQualityScore,
  generateFormFromPrompt
};
