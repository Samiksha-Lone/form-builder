const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  airtableRecordId: { type: String },
  answers: { type: Object, required: true }, 
  syncStatus: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  syncError: { type: String },
  
  // AI Analysis Fields
  sentiment: {
    label: { type: String, enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'], default: null },
    score: { type: Number, min: 0, max: 1, default: null },
    analyzedAt: { type: Date, default: null }
  },
  spamScore: { type: Number, min: 0, max: 1, default: 0 },
  isSpam: { type: Boolean, default: false },
  qualityScore: { type: Number, min: 0, max: 1, default: 1 },
  keyPhrases: [String],
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Response', responseSchema);
