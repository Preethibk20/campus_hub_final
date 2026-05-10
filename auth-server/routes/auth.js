const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const sendOTP = require("../utils/sendOtp");
const sendMatchEmail = require("../utils/sendMatchEmail");
const sendTeamCompleteEmail = require("../utils/sendTeamCompleteEmail");
const sendMatchAcceptedEmail = require("../utils/sendMatchAcceptedEmail");
const rateLimit = require("express-rate-limit");
const Otp = require("../models/Otp");
const User = require("../models/User");
const Gig = require("../models/Gig");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const sendGigEmail = require("../utils/sendGigEmail");

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_campus_hub';

// Rate limiting for sending OTPs
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { message: "Too many requests, please try again after 5 minutes" },
});

router.post("/send-otp", otpLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if user already exists in permanent DB
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
       return res.status(400).json({ message: "An account with this email already exists. Please login." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash password if provided during registration
    let hashedPassword = "";
    if (password) {
       hashedPassword = await bcrypt.hash(password, 10);
    }
  
    // Upsert the OTP record (overwrite if exists)
    await Otp.deleteMany({ email: normalizedEmail });
    await Otp.create({
      email: normalizedEmail,
      name,
      password: hashedPassword,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });
  
    console.log(`[AUTH] Sending OTP ${otp} to ${normalizedEmail}`);
    await sendOTP(normalizedEmail, otp);
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
});

router.post("/resend-otp", otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    
    const existing = await Otp.findOne({ email: normalizedEmail });
    
    await Otp.deleteMany({ email: normalizedEmail });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
    await Otp.create({
      email: normalizedEmail,
      name: existing?.name,
      password: existing?.password,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });
  
    await sendOTP(normalizedEmail, otp);
    res.json({ message: "New OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to resend OTP", error: error.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = otp.toString().trim();
    
    console.log(`[AUTH] Verifying OTP for ${normalizedEmail}...`);
    const record = await Otp.findOne({ email: normalizedEmail });

    if (!record) {
      return res.status(400).json({ message: "No active registration found for this email. Please try signing up again." });
    }

    if (new Date() > record.expiresAt) {
      return res.status(400).json({ message: "Your verification code has expired. Please request a new one." });
    }

    if (record.otp.toString().trim() !== normalizedOtp) {
      record.attemptCount += 1;
      await record.save();
      
      if (record.attemptCount >= 5) {
        await Otp.deleteOne({ _id: record._id });
        return res.status(400).json({ message: "Too many incorrect attempts. Please start the registration process again for safety." });
      }
      return res.status(400).json({ message: `Invalid code. You have ${5 - record.attemptCount} attempts remaining.` });
    }

    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
       user = await User.create({
         email: normalizedEmail,
         name: record.name || normalizedEmail.split('@')[0],
         password: record.password || "oauth_or_default"
       });
    }

    await Otp.deleteOne({ email: normalizedEmail });
    
    // Generate tokens
    const accessToken = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: "Email verified ✅", accessToken, refreshToken });
  } catch (error) {
    console.error("[AUTH] Verification error:", error);
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
     const { email, password } = req.body;
     const user = await User.findOne({ email });
     if (!user) return res.status(400).json({ message: "Invalid email or password" });

     let isMatch = false;
     try {
       isMatch = await bcrypt.compare(password, user.password);
     } catch (err) {
       // Not a valid salt/hash — common if the stored password was plaintext
       isMatch = false;
     }

     if (!isMatch && password === user.password) {
       // Legacy plaintext match! Auto-migrate to bcrypt for future logins
       console.log(`Auto-migrating legacy password for: ${email}`);
       const salt = await bcrypt.genSalt(10);
       user.password = await bcrypt.hash(password, salt);
       await user.save();
       isMatch = true;
     }

     if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

     const accessToken = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '1h' });
     const refreshToken = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });

     res.json({ success: true, accessToken, refreshToken });
  } catch (error) {
     res.status(500).json({ message: "Login failed", error: error.message });
  }
});

router.get("/users/me", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "Unauthorized" });
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: (user.role === 'USER' || user.role === 'STUDENT') ? 'student' : user.role.toLowerCase(),
            verified: user.isVerified,
            branch: user.branch || user.department || '',
            academicYear: (function() {
                const y = user.academicYear || user.yearOfStudy;
                if (!y) return '';
                if (typeof y === 'number' || !isNaN(y)) {
                    const years = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
                    return years[parseInt(y)] || String(y);
                }
                return String(y);
            })(),
            college: user.college || user.collegeName || '',
            bio: user.bio || '',
            availability: user.availability || 'Open to Both',
            domains: user.domains || [],
            githubUrl: user.githubUrl || '',
            linkedinUrl: user.linkedinUrl || '',
            portfolioUrl: user.portfolioUrl || '',
            rating: user.rating || 0,
            reviewCount: user.reviewCount || 0,
            profilePicUrl: user.profilePicUrl || '',
            profileCompletion: user.profileCompletion || 0,
            skills: user.skills || []
        });
    } catch(err) {
        res.status(401).json({ message: "Invalid token" });
    }
});

router.put("/users/me", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "Unauthorized" });
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const body = req.body;
        console.log("[UPDATE] Incoming Body:", JSON.stringify(body, null, 2));
        console.log("[UPDATE] User ID from token:", decoded.id);
        if (mongoose.connection.readyState !== 1) {
            console.error("[DB ERROR] MongoDB disconnected!");
            return res.status(500).json({ message: "Database connection lost" });
        }
        
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (body.name        !== undefined) user.name        = body.name;
        if (body.bio         !== undefined) user.bio         = body.bio;
        if (body.college     !== undefined) user.college     = body.college;
        
        // Handle both branch and department
        if (body.branch      !== undefined) user.branch      = body.branch;
        else if (body.department !== undefined) user.branch  = body.department;
        
        // Handle both academicYear and yearOfStudy
        if (body.academicYear !== undefined) {
          user.academicYear = body.academicYear;
        } else if (body.yearOfStudy !== undefined) {
          // Normalize numeric years to strings for the DB enum
          user.academicYear = String(body.yearOfStudy);
        }

        if (body.availability!== undefined) user.availability= body.availability;
        if (body.skills      !== undefined) user.skills      = body.skills;
        if (body.domains     !== undefined) user.domains     = body.domains;
        if (body.githubUrl   !== undefined) user.githubUrl   = body.githubUrl;
        if (body.linkedinUrl !== undefined) user.linkedinUrl = body.linkedinUrl;
        if (body.portfolioUrl!== undefined) user.portfolioUrl= body.portfolioUrl;
        
        // Handle profile picture
        if (body.profilePicUrl !== undefined) user.profilePicUrl = body.profilePicUrl;
        else if (body.avatar  !== undefined) user.profilePicUrl = body.avatar;

        await user.save();
        res.json({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            branch: user.branch || '',
            academicYear: (function() {
                const y = user.academicYear || user.yearOfStudy;
                if (!y) return '';
                if (typeof y === 'number' || !isNaN(y)) {
                    const years = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
                    return years[parseInt(y)] || String(y);
                }
                return String(y);
            })(),
            college: user.college || '',
            bio: user.bio || '',
            availability: user.availability,
            skills: user.skills || [],
            domains: user.domains || [],
            githubUrl: user.githubUrl || '',
            linkedinUrl: user.linkedinUrl || '',
            portfolioUrl: user.portfolioUrl || '',
            profileCompletion: user.profileCompletion || 0
        });
    } catch (err) {
        console.error("[UPDATE] CRITICAL FAILURE:", err.message);
        const errorDetails = err.errors ? Object.keys(err.errors).map(key => `${key}: ${err.errors[key].message}`) : [err.message];
        res.status(500).json({ 
            message: "Update failed", 
            error: err.message,
            details: errorDetails
        });
    }
});

router.get("/users/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            branch: user.branch || user.department || '',
            academicYear: (function() {
                const y = user.academicYear || user.yearOfStudy;
                if (!y) return '';
                if (typeof y === 'number' || !isNaN(y)) {
                    const years = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
                    return years[parseInt(y)] || String(y);
                }
                return String(y);
            })(),
            college: user.college || user.collegeName || '',
            bio: user.bio || '',
            availability: user.availability || 'Not Available',
            skills: user.skills || [],
            domains: user.domains || [],
            githubUrl: user.githubUrl || '',
            linkedinUrl: user.linkedinUrl || '',
            portfolioUrl: user.portfolioUrl || '',
            rating: user.rating || 0,
            reviewCount: user.reviewCount || 0,
            profileCompletion: user.profileCompletion || 0
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch profile", error: err.message });
    }
});

// --- GIG ROUTES ---

// Helper to verify token inline (matching existing pattern)
const verifyToken = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1];
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
};

router.get("/gigs", async (req, res) => {
    try {
        const { category, type, skills } = req.query;
        let query = {};
        if (category) query.category = category;
        if (type) query.type = type;
        if (skills) {
            const skillList = skills.split(',').map(s => s.trim());
            query.skillsRequired = { $in: skillList };
        }

        const gigs = await Gig.find(query)
            .populate('postedBy', 'name college collegeName')
            .sort({ createdAt: -1 });

        const formattedGigs = gigs.map(g => ({
            id: g._id.toString(),
            gigId: g._id.toString(),
            title: g.title,
            description: g.description,
            category: g.category,
            type: g.type,
            budget: g.budget,
            skillsRequired: g.skillsRequired,
            postedBy: g.postedBy?._id || 'unknown',
            posterName: g.postedBy?.name || 'Explorer',
            posterCollege: g.postedBy?.college || g.postedBy?.collegeName || 'Campus Hub',
            status: g.status,
            applicationCount: g.interestedUsers?.length || 0,
            createdAt: g.createdAt
        }));

        res.json(formattedGigs);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch gigs", error: err.message });
    }
});

router.get("/gigs/my", async (req, res) => {
    try {
        const decoded = verifyToken(req);
        if (!decoded) return res.status(401).json({ message: "Unauthorized" });

        const created = await Gig.find({ postedBy: decoded.id })
            .sort({ createdAt: -1 });
            
        const applied = await Gig.find({ interestedUsers: decoded.id })
            .populate('postedBy', 'name')
            .sort({ createdAt: -1 });

        const formattedCreated = created.map(g => ({
            id: g._id.toString(),
            title: g.title,
            description: g.description,
            category: g.category,
            status: g.status,
            applicationCount: g.interestedUsers?.length || 0,
            createdAt: g.createdAt
        }));

        const formattedApplied = applied.map(g => {
            let userStatus = 'PENDING';
            if (g.acceptedUsers.includes(decoded.id)) userStatus = 'ACCEPTED';
            else if (g.rejectedUsers.includes(decoded.id)) userStatus = 'REJECTED';
            
            return {
                id: g._id.toString(),
                title: g.title,
                category: g.category,
                posterName: g.postedBy?.name || 'Explorer',
                userStatus,
                createdAt: g.createdAt
            };
        });

        res.json({ created: formattedCreated, applied: formattedApplied });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch your gigs", error: err.message });
    }
});

router.post("/gigs", async (req, res) => {
    try {
        const decoded = verifyToken(req);
        if (!decoded) return res.status(401).json({ message: "Unauthorized" });

        const { title, description, category, type, budget, skillsRequired } = req.body;
        
        const newGig = await Gig.create({
            title,
            description,
            category,
            type,
            budget,
            skillsRequired: skillsRequired || [],
            postedBy: decoded.id,
            status: 'OPEN'
        });

        res.status(201).json(newGig);
    } catch (err) {
        res.status(500).json({ message: "Failed to create gig", error: err.message });
    }
});

router.get("/gigs/:id", async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id)
            .populate('postedBy', 'name college collegeName email bio profileCompletion skills')
            .populate('interestedUsers', 'name email college branch');

        if (!gig) return res.status(404).json({ message: "Gig not found" });

        const decoded = verifyToken(req);
        const hasApplied = decoded ? gig.interestedUsers.some(u => u._id.toString() === decoded.id) : false;

        res.json({
            ...gig.toObject(),
            id: gig._id.toString(),
            gigId: gig._id.toString(),
            posterName: gig.postedBy?.name || 'Explorer',
            posterCollege: gig.postedBy?.college || gig.postedBy?.collegeName || 'Campus Hub',
            applicationCount: gig.interestedUsers?.length || 0,
            hasApplied
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch gig details", error: err.message });
    }
});

router.get("/gigs/:id/applications", async (req, res) => {
    try {
        const decoded = verifyToken(req);
        if (!decoded) return res.status(401).json({ message: "Unauthorized" });

        const gig = await Gig.findById(req.params.id)
            .populate('interestedUsers', 'name email college branch academicYear profilePicUrl skills');

        if (!gig) return res.status(404).json({ message: "Gig not found" });

        if (gig.postedBy.toString() !== decoded.id) {
            return res.status(403).json({ message: "Forbidden: You don't own this gig" });
        }

        res.json(gig.interestedUsers);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch applications", error: err.message });
    }
});

router.post("/gigs/:id/interest", async (req, res) => {
    try {
        console.log(`[GIG] Application attempt for Gig: ${req.params.id}`);
        const decoded = verifyToken(req);
        if (!decoded) {
            console.error("[GIG] Unauthorized: No valid token");
            return res.status(401).json({ message: "Unauthorized" });
        }

        const gig = await Gig.findById(req.params.id);
        if (!gig) {
            console.error(`[GIG] Not found: ${req.params.id}`);
            return res.status(404).json({ message: "Gig not found" });
        }

        console.log(`[GIG] Poster ID: ${gig.postedBy.toString()}, Applicant ID: ${decoded.id}`);

        if (gig.postedBy.toString() === decoded.id) {
            return res.status(400).json({ message: "You cannot apply to your own gig" });
        }

        // Use .some() for robust ObjectId comparison
        const alreadyApplied = gig.interestedUsers.some(uid => uid.toString() === decoded.id);
        if (alreadyApplied) {
            console.log("[GIG] User already applied");
            return res.status(400).json({ message: "You have already applied to this gig" });
        }

        gig.interestedUsers.push(decoded.id);
        await gig.save();

        // Send Notification to Poster
        try {
            const poster = await User.findById(gig.postedBy);
            const applicant = await User.findById(decoded.id);
            if (poster && applicant) {
                await sendGigEmail(poster.email, 'NEW_INTEREST', {
                    gigTitle: gig.title,
                    applicantName: applicant.name
                });
            }
        } catch (emailErr) {
            console.error("[NOTIFICATION ERROR] Failed to notify poster:", emailErr.message);
        }

        console.log("[GIG] Application SUCCESSful!");
        res.json({ message: "Interest recorded successfully", applicationCount: gig.interestedUsers.length });
    } catch (err) {
        console.error("[GIG] Application CRASHED:", err.message);
        res.status(500).json({ message: "Failed to apply", error: err.message });
    }
});

router.patch("/gigs/:gigId/applicants/:userId/accept", async (req, res) => {
    try {
        const decoded = verifyToken(req);
        if (!decoded) return res.status(401).json({ message: "Unauthorized" });

        const gig = await Gig.findById(req.params.gigId);
        if (!gig) return res.status(404).json({ message: "Gig not found" });

        if (gig.postedBy.toString() !== decoded.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        if (!gig.acceptedUsers.includes(req.params.userId)) {
            gig.acceptedUsers.push(req.params.userId);
            // Remove from rejected if they were there
            gig.rejectedUsers = gig.rejectedUsers.filter(id => id.toString() !== req.params.userId);
            await gig.save();

            // Send Notification to Applicant
            try {
                const applicant = await User.findById(req.params.userId);
                const poster = await User.findById(decoded.id);
                if (applicant && poster) {
                    await sendGigEmail(applicant.email, 'ACCEPTED', {
                        gigTitle: gig.title,
                        posterName: poster.name
                    });

                    // AUTO-START CONVERSATION
                    try {
                        let conv = await Conversation.findOne({
                            participants: { $all: [decoded.id, req.params.userId] },
                            gigId: gig._id
                        });

                        if (!conv) {
                            conv = await Conversation.create({
                                participants: [decoded.id, req.params.userId],
                                gigId: gig._id,
                                lastMessage: "Collaboration started! 👋"
                            });
                            
                            // Send initial message
                            await Message.create({
                                conversationId: conv._id,
                                sender: decoded.id,
                                content: "Application accepted! Let's get started on the project. 🎉"
                            });
                        }
                    } catch (convErr) {
                        console.error("[CONV ERROR] Failed to auto-start chat:", convErr.message);
                    }
                }
            } catch (emailErr) {
                console.error("[NOTIFICATION ERROR] Failed to notify applicant:", emailErr.message);
            }
        }

        res.json(gig);
    } catch (err) {
        res.status(500).json({ message: "Failed to accept applicant", error: err.message });
    }
});

router.patch("/gigs/:gigId/applicants/:userId/reject", async (req, res) => {
    try {
        const decoded = verifyToken(req);
        if (!decoded) return res.status(401).json({ message: "Unauthorized" });

        const gig = await Gig.findById(req.params.gigId);
        if (!gig) return res.status(404).json({ message: "Gig not found" });

        if (gig.postedBy.toString() !== decoded.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        if (!gig.rejectedUsers.includes(req.params.userId)) {
            gig.rejectedUsers.push(req.params.userId);
            // Remove from accepted if they were there
            gig.acceptedUsers = gig.acceptedUsers.filter(id => id.toString() !== req.params.userId);
            await gig.save();
        }

        res.json(gig);
    } catch (err) {
        res.status(500).json({ message: "Failed to reject applicant", error: err.message });
    }
});

router.post("/notify/match", async (req, res) => {
    try {
        const internalSecret = req.headers["x-internal-secret"];
        if (internalSecret !== "super_secret_internal_key") {
            return res.status(403).json({ message: "Forbidden: Invalid internal secret" });
        }
        const { toUserId, fromUserName, postTitle } = req.body;
        const recipient = await User.findById(toUserId);
        if (!recipient) return res.status(404).json({ message: "Recipient user not found" });
        await sendMatchEmail(recipient.email, fromUserName, postTitle);
        res.json({ message: "Notification sent successfully" });
    } catch (err) {
        res.status(500).json({ message: "Notification failed", error: err.message });
    }
});

router.post("/notify/team-complete", async (req, res) => {
    try {
        const internalSecret = req.headers["x-internal-secret"];
        if (internalSecret !== "super_secret_internal_key") {
            return res.status(403).json({ message: "Forbidden: Invalid internal secret" });
        }
        const { toUserId, postTitle } = req.body;
        const recipient = await User.findById(toUserId);
        if (!recipient) return res.status(404).json({ message: "Recipient user not found" });
        await sendTeamCompleteEmail(recipient.email, postTitle);
        res.json({ message: "Notification sent successfully" });
    } catch (err) {
        res.status(500).json({ message: "Notification failed", error: err.message });
    }
});

router.post("/notify/match-accepted", async (req, res) => {
    try {
        const internalSecret = req.headers["x-internal-secret"];
        if (internalSecret !== "super_secret_internal_key") {
            return res.status(403).json({ message: "Forbidden: Invalid internal secret" });
        }
        const { toUserId, postTitle } = req.body;
        const recipient = await User.findById(toUserId);
        if (!recipient) return res.status(404).json({ message: "Recipient user not found" });
        await sendMatchAcceptedEmail(recipient.email, postTitle);
        res.json({ message: "Notification sent successfully" });
    } catch (err) {
        res.status(500).json({ message: "Notification failed", error: err.message });
    }
});

// --- CONVERSATION & MESSAGING ROUTES ---

router.get("/conversations", async (req, res) => {
    try {
        const decoded = verifyToken(req);
        if (!decoded) return res.status(401).json({ message: "Unauthorized" });

        const convs = await Conversation.find({ participants: decoded.id })
            .populate('participants', 'name email profilePicUrl avatar')
            .populate('gigId', 'title')
            .sort({ updatedAt: -1 });

        const formatted = convs.map(c => {
            const otherParticipant = c.participants.find(p => p._id.toString() !== decoded.id);
            return {
                id: c._id.toString(),
                participantId: otherParticipant?._id || 'unknown',
                participantName: otherParticipant?.name || 'Explorer',
                participantAvatar: otherParticipant?.profilePicUrl || otherParticipant?.avatar || '',
                lastMessage: { content: c.lastMessage || 'Start a conversation!', timestamp: c.updatedAt },
                gigTitle: c.gigId?.title || 'Direct Chat',
                unreadCount: 0, // Simplified for now
                updatedAt: c.updatedAt
            };
        });

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: "Failed to load conversations", error: err.message });
    }
});

router.post("/conversations", async (req, res) => {
    try {
        const decoded = verifyToken(req);
        if (!decoded) return res.status(401).json({ message: "Unauthorized" });

        const { participantId, gigId } = req.body;
        
        let conv = await Conversation.findOne({
            participants: { $all: [decoded.id, participantId] },
            gigId: gigId || null
        });

        if (!conv) {
            conv = await Conversation.create({
                participants: [decoded.id, participantId],
                gigId: gigId || null,
                lastMessage: "Conversation started"
            });
        }

        const otherUser = await User.findById(participantId, 'name profilePicUrl avatar');

        res.status(201).json({
            id: conv._id.toString(),
            participantId: otherUser?._id,
            participantName: otherUser?.name,
            participantAvatar: otherUser?.profilePicUrl || otherUser?.avatar
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to create conversation", error: err.message });
    }
});

router.get("/conversations/:id/messages", async (req, res) => {
    try {
        const decoded = verifyToken(req);
        if (!decoded) return res.status(401).json({ message: "Unauthorized" });

        const messages = await Message.find({ conversationId: req.params.id })
            .sort({ timestamp: 1 });

        const formatted = messages.map(m => ({
            id: m._id.toString(),
            conversationId: m.conversationId.toString(),
            senderId: m.sender.toString(),
            content: m.content,
            type: m.type,
            timestamp: m.timestamp
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch messages", error: err.message });
    }
});

router.post("/conversations/:id/messages", async (req, res) => {
    try {
        const decoded = verifyToken(req);
        if (!decoded) return res.status(401).json({ message: "Unauthorized" });

        const { content, type } = req.body;
        
        const msg = await Message.create({
            conversationId: req.params.id,
            sender: decoded.id,
            content,
            type: type || 'text'
        });

        await Conversation.findByIdAndUpdate(req.params.id, {
            lastMessage: content,
            updatedAt: Date.now()
        });

        res.status(201).json({
            id: msg._id.toString(),
            conversationId: msg.conversationId.toString(),
            senderId: msg.sender.toString(),
            content: msg.content,
            type: msg.type,
            timestamp: msg.timestamp
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to send message", error: err.message });
    }
});

router.post("/logout", (req, res) => res.json({ message: "Logged out" }));

module.exports = router;
