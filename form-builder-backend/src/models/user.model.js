const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true    
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  airtableUserId: {
    type: String,
    unique: true,
    sparse: true
  },
  accessToken: {
    type: String
  },
  refreshToken: {
    type: String
  },
  loginTime: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);