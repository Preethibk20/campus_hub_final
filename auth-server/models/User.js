const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  password: { type: String, required: true },
  role: { type: String, default: 'USER' },
  isVerified: { type: Boolean, default: true },
  
  // Profile Information
  bio: { type: String, maxLength: 300 },
  college: { type: String },
  academicYear: { 
    type: String, 
    default: null 
  },

  branch: { type: String }, // e.g. 'Computer Science', 'ECE'
  
  // Skills & Expertise
  skills: { 
    type: [String], 
    validate: [v => v.length <= 50, '{PATH} exceeds the limit of 50'],
    default: [] 
  },
  domains: { 
    type: [String], 
    default: [] 
  },

  // External Links
  githubUrl: { type: String, match: /^(https?:\/\/(www\.)?github\.com\/.+)?$/ },
  linkedinUrl: { type: String, match: /^(https?:\/\/(www\.)?linkedin\.com\/in\/.+)?$/ },
  portfolioUrl: { type: String, match: /^(https?:\/\/.+)?$/ },

  // Status
  availability: { 
    type: String, 
    enum: ['Open to Gigs', 'Open to Hackathons', 'Open to Both', 'Not Available'],
    default: 'Open to Both'
  },
  
  // Stats & Metadata
  profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
  profilePicUrl: { type: String },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  notifications: [
    {
      message: { type: String, required: true },
      date: { type: Date, default: Date.now },
      read: { type: Boolean, default: false }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  
  // Old fields for backward compatibility (optional)
  collegeName: { type: String },
  department: { type: String },
  yearOfStudy: { type: String }
}, { strict: false });

// Auto-calculate profile completion before saving
userSchema.pre('save', async function() {
  try {
    console.log("[MODEL] Pre-save hook started for:", this.email);
    let score = 0;
    
    // Core profile fields
    if (this.bio) score += 15;
    if (this.college || this.collegeName) score += 10;
    if (this.academicYear || this.yearOfStudy) score += 10;
    if (this.branch || this.department) score += 10;
    
    // Expertise
    if (this.skills && this.skills.length >= 3) score += 20;
    if (this.domains && this.domains.length >= 1) score += 10;
    
    // External presence
    if (this.githubUrl) score += 10;
    if (this.linkedinUrl) score += 10;
    if (this.availability) score += 5;
    
    this.profileCompletion = Math.min(score, 100);
    console.log("[MODEL] Pre-save hook success! Score:", this.profileCompletion);
  } catch (err) {
    console.error("[MODEL] Pre-save hook CRASHED:", err.message);
    // In async hooks, throwing an error will pass it to the next middleware/save caller
    throw err;
  }
});

module.exports = mongoose.model('User', userSchema);
