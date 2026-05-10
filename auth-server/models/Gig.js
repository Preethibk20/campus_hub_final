const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['TECH', 'DESIGN', 'MARKETING', 'CONTENT', 'OTHER'], required: true },
  type: { type: String, enum: ['PAID', 'COLLAB'], required: true },
  budget: { type: String },
  skillsRequired: { type: [String], default: [] },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['OPEN', 'CLOSED', 'IN_PROGRESS'], default: 'OPEN' },
  interestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  acceptedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rejectedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gig', gigSchema);
