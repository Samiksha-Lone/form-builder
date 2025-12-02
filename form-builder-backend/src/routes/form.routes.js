
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const Form = require('../models/form.model');
const User = require('../models/user.model');
const Response = require('../models/response.model');
const fetch = require('node-fetch');

router.get('/', auth, async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    res.json({
      forms: forms.map((f) => ({
        id: f._id,
        title: f.title,
        createdAt: f.createdAt,
      })),
    });
  } catch (e) {
    console.error('List forms error:', e);
    res.status(500).json({ error: 'Failed to load forms' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findOne({ airtableUserId: req.userId });
    if (!user) return res.status(401).json({ error: 'Not logged in' });

    const { title, questions } = req.body;

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Title and questions are required' });
    }

    const form = await Form.create({
      ownerUserId: user.airtableUserId,
      airtableBaseId: process.env.AIRTABLE_BASE_ID,
      airtableTableName: process.env.AIRTABLE_TABLE_NAME,
      title,
      questions,
    });

    res.status(201).json({ formId: form._id });
  } catch (e) {
    console.error('Failed to save form:', e);
    res.status(500).json({ error: 'Failed to save form' });
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
    console.error('Error loading form:', e);
    res.status(500).json({ error: 'Failed to load form' });
  }
});

router.post('/:id/submit', auth, async (req, res) => {
  try {
   
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }


    const user = await User.findOne({ airtableUserId: req.userId });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    const token = user.accessToken;

    const { answers } = req.body;
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'answers object is required' });
    }

    const missing = [];
    for (const q of form.questions) {
      if (q.required && (answers[q.fieldId] == null || answers[q.fieldId] === '')) {
        missing.push(q.fieldId);
      }
    }
    if (missing.length) {
      return res.status(400).json({ error: 'Missing required fields', missing });
    }

    const airtableFields = {};
    form.questions.forEach(q => {
      if (answers[q.fieldId] !== undefined && answers[q.fieldId] !== null) {
        airtableFields[q.label || q.fieldId] = answers[q.fieldId];
      }
    });

    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${form.airtableBaseId}/${form.airtableTableName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields: airtableFields })
      }
    );

    if (!airtableResponse.ok) {
      const errorData = await airtableResponse.json();
      return res.status(400).json({ error: 'Failed to save to Airtable', details: errorData });
    }

    const airtableRecord = await airtableResponse.json();

    const saved = await Response.create({
      formId: form._id,
      airtableRecordId: airtableRecord.id,
      answers,
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      responseId: saved._id,
      airtableRecordId: airtableRecord.id
    });
  } catch (e) {
    console.error('Submit error:', e);
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

module.exports = router;
