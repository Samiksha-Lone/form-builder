const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const Response = require('../models/response.model');
const Form = require('../models/form.model');

router.get('/:formId/responses', auth, async (req, res) => {
  try {
    const form = await Form.findOne({ _id: req.params.formId, ownerId: req.userId });
    if (!form) return res.status(403).json({ error: 'Access denied: You do not own this form' });

    const responses = await Response.find({ formId: req.params.formId })
      .sort({ createdAt: -1 });
    res.json({
      responses: responses.map(r => ({
        id: r._id,
        createdAt: r.createdAt,
        answers: r.answers,
        airtableRecordId: r.airtableRecordId
      }))
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load responses' });
  }
});

module.exports = router;
