
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const Form = require('../models/form.model');
const User = require('../models/user.model');
const Response = require('../models/response.model');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const { validateForm, validateSubmission } = require('../middlewares/validation.middleware');
const {
  analyzeSentiment,
  extractKeyPhrases,
  detectSpam,
  calculateQualityScore,
  generateFormFromPrompt
} = require('../utils/aiAnalysis.utils');

const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10, 
  message: { error: 'Submission limit reached. Please try again in an hour.' }
});

router.get('/', auth, async (req, res) => {
  try {
    const forms = await Form.find({ ownerId: req.userId }).sort({ createdAt: -1 });
    
    const formsWithCounts = await Promise.all(forms.map(async (f) => {
      const count = await Response.countDocuments({ formId: f._id });
      return {
        id: f._id,
        title: f.title,
        createdAt: f.createdAt,
        responseCount: count
      };
    }));

    res.json({ forms: formsWithCounts });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load forms' });
  }
});

router.post('/', auth, validateForm, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const { title, questions } = req.body;

    const form = await Form.create({
      ownerId: user._id,
      airtableBaseId: user.airtableBaseId || process.env.AIRTABLE_BASE_ID,
      airtableTableName: user.airtableTableName || process.env.AIRTABLE_TABLE_NAME,
      title,
      questions,
    });

    res.status(201).json({ formId: form._id });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save form' });
  }
});

router.post('/generate', auth, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const generatedForm = await generateFormFromPrompt(prompt);
    res.json(generatedForm);
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate form: ' + e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    res.json({
      id: form._id,
      title: form.title,
      questions: form.questions,
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load form' });
  }
});

router.post('/:id/submit', submissionLimiter, validateSubmission, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    const { answers } = req.body;
    
    const localResponse = await Response.create({
      formId: form._id,
      answers,
      syncStatus: 'pending'
    });

    // AI Analysis (runs asynchronously to not block response)
    if (process.env.ENABLE_AI_FEATURES === 'true') {
      // Extract text responses for analysis
      const textResponses = form.questions
        .filter(q => ['shortText', 'longText'].includes(q.type))
        .map(q => answers[q.fieldId])
        .filter(a => a);

      // Run AI analysis in background
      (async () => {
        try {
          // Sentiment Analysis
          if (textResponses.length > 0) {
            const sentiment = await analyzeSentiment(textResponses);
            if (sentiment) {
              localResponse.sentiment = sentiment;
            }

            // Extract Key Phrases
            const keyPhrases = extractKeyPhrases(textResponses);
            if (keyPhrases.length > 0) {
              localResponse.keyPhrases = keyPhrases;
            }
          }

          // Spam Detection
          if (process.env.SPAM_DETECTION_ENABLED === 'true') {
            const spamResult = detectSpam(answers, form);
            localResponse.spamScore = spamResult.spamScore;
            localResponse.isSpam = spamResult.isSpam;
          }

          // Quality Scoring
          const qualityScore = calculateQualityScore(answers, form);
          localResponse.qualityScore = qualityScore;

          await localResponse.save();
        } catch (aiError) {
          console.error('AI Analysis Error:', aiError.message);
          // Continue even if AI analysis fails
        }
      })();
    }

    const airtableFields = {};
    form.questions.forEach(q => {
      if (answers[q.fieldId] !== undefined && answers[q.fieldId] !== null) {
        airtableFields[q.label || q.fieldId] = answers[q.fieldId];
      }
    });

    if (form.airtableBaseId && form.airtableTableName) {
      try {
        const user = await User.findById(form.ownerId);
        if (user && user.accessToken) {
          const airtableResponse = await fetch(
            `https://api.airtable.com/v0/${form.airtableBaseId}/${form.airtableTableName}`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${user.accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ fields: airtableFields })
            }
          );

          const airtableData = await airtableResponse.json();

          if (airtableResponse.ok) {
            localResponse.airtableRecordId = airtableData.id;
            localResponse.syncStatus = 'success';
          } else {
            localResponse.syncStatus = 'failed';
            localResponse.syncError = airtableData.error?.message || 'Airtable API error';
          }
        }
      } catch (syncErr) {
        localResponse.syncStatus = 'failed';
        localResponse.syncError = syncErr.message;
      }
    }

    await localResponse.save();

    res.status(201).json({
      success: true,
      responseId: localResponse._id,
      syncStatus: localResponse.syncStatus
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

router.put('/:id', auth, validateForm, async (req, res) => {
  try {
    const { title, questions } = req.body;
    const form = await Form.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.userId },
      { title, questions },
      { new: true }
    );

    if (!form) return res.status(403).json({ error: 'Form not found or access denied' });
    res.json({ success: true, formId: form._id });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update form' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const form = await Form.findOneAndDelete({ _id: req.params.id, ownerId: req.userId });
    if (!form) return res.status(403).json({ error: 'Form not found or access denied' });
    
    await Response.deleteMany({ formId: req.params.id });
    
    res.json({ success: true, message: 'Form and responses deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

module.exports = router;
