const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  password: { type: String },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, expires: 0 },
  attemptCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Otp', otpSchema);
