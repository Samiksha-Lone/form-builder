const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema(
  {
    questionKey: String,
    operator: String, 
    value: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const conditionalRulesSchema = new mongoose.Schema(
  {
    logic: String, 
    conditions: [conditionSchema],
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema({
  fieldId: String,   
  label: String,      
  type: String,       
  required: Boolean,
  options: [String],
  conditionalRules: conditionalRulesSchema,
});

const formSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },    
  airtableBaseId: { type: String },
  airtableTableName: { type: String },
  title: { type: String, required: true },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Form', formSchema);
