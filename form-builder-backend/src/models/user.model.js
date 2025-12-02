const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  airtableUserId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true    
  }, 
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  loginTime: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);