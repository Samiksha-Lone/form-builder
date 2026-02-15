const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const {
  getSentimentStats,
  getSpamStats,
  getQualityStats,
  getTopPhrases,
  generateAnalyticsReport,
  getResponseTimeline
} = require('../utils/analytics.utils');
const { suggestImprovements, listTemplates, getTemplate } = require('../utils/formSuggestions.utils');
const Form = require('../models/form.model');
const Response = require('../models/response.model');

// Get comprehensive analytics for a form
router.get('/forms/:formId/analytics', auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    // Verify user owns the form
    if (form.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const report = await generateAnalyticsReport(req.params.formId);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// Get sentiment statistics
router.get('/forms/:formId/analytics/sentiment', auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    if (form.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const stats = await getSentimentStats(req.params.formId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get sentiment stats' });
  }
});

// Get spam detection statistics
router.get('/forms/:formId/analytics/spam', auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    if (form.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const stats = await getSpamStats(req.params.formId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get spam stats' });
  }
});

// Get quality statistics
router.get('/forms/:formId/analytics/quality', auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    if (form.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const stats = await getQualityStats(req.params.formId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get quality stats' });
  }
});

// Get top phrases/themes from responses
router.get('/forms/:formId/analytics/phrases', auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    if (form.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const limit = req.query.limit || 10;
    const phrases = await getTopPhrases(req.params.formId, parseInt(limit));
    res.json({ phrases });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get phrases' });
  }
});

// Get response timeline
router.get('/forms/:formId/analytics/timeline', auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    if (form.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const days = req.query.days || 30;
    const timeline = await getResponseTimeline(req.params.formId, parseInt(days));
    res.json({ timeline });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get timeline' });
  }
});

// Get form improvement suggestions
router.get('/forms/:formId/improvements', auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    if (form.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const suggestions = await suggestImprovements(req.params.formId);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Get all available form templates
router.get('/templates', (req, res) => {
  try {
    const templates = listTemplates();
    res.json({ templates });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list templates' });
  }
});

// Get specific form template
router.get('/templates/:templateId', (req, res) => {
  try {
    const template = getTemplate(req.params.templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get template' });
  }
});

// Get flagged responses (potential spam)
router.get('/forms/:formId/flagged-responses', auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    if (form.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const flaggedResponses = await Response.find({
      formId: req.params.formId,
      $or: [
        { isSpam: true },
        { spamScore: { $gt: 0.3 } },
        { 'sentiment.label': 'NEGATIVE' },
        { qualityScore: { $lt: 0.5 } }
      ]
    }).select('_id spamScore qualityScore sentiment isSpam createdAt').limit(50);

    res.json({ flaggedResponses, count: flaggedResponses.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get flagged responses' });
  }
});

module.exports = router;
