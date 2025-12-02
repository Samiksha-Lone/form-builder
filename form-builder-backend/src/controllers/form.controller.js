const Form = require('../models/form.model');
const User = require('../models/user.model');
const Response = require('../models/response.model');
const fetch = require('node-fetch');

const { validateForm } = require('../utils/conditionalLogic');

const submitForm = async (req, res) => {
  try {
    const formId = req.params.id;
    const { answers } = req.body;

    const user = await User.findOne({ airtableUserId: req.userId });
    if (!user) return res.status(401).json({ error: 'User not found' });

    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    validateForm(form, answers);
    
    const airtableFields = {};
    form.questions.forEach(q => {
      if (answers[q.fieldId] !== undefined) {
        airtableFields[q.label || q.fieldId] = answers[q.fieldId];
      }
    });

    const response = await fetch(`https://api.airtable.com/v0/${form.airtableBaseId}/${form.airtableTableName}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: airtableFields })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(400).json({ error: 'Airtable save failed', details: errorData });
    }

    const airtableRecord = await response.json();

    const saved = await Response.create({
      formId: form._id,
      airtableRecordId: airtableRecord.id,
      answers,
      createdAt: new Date()
    });

    res.status(201).json({ responseId: saved._id, airtableRecordId: airtableRecord.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { submitForm };
