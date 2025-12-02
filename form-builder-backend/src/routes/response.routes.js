const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const Response = require('../models/response.model');

router.get('/forms/:formId/responses', auth, async (req, res) => {
  try {
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
