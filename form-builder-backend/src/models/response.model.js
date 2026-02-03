const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  airtableRecordId: { type: String },
  answers: { type: Object, required: true }, 
  syncStatus: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  syncError: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Response', responseSchema);
