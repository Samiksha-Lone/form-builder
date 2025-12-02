const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  airtableRecordId: { type: String },
  answers: { type: Object, required: true }, 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Response', responseSchema);
