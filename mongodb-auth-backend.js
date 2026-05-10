import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = 3001;

// MongoDB connection
const mongoUrl = 'mongodb://localhost:27017';
const client = new MongoClient(mongoUrl);

// Middleware
app.use(cors());
app.use(express.json());

let db;

// Connect to MongoDB
async function connectToMongo() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    db = client.db('campushub'); // Change to your database name
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
}

// Authentication endpoints
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);
    
    // Find user in MongoDB
    const user = await db.collection('users').findOne({ email: email });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // For demo, accept any password (in production, verify with bcrypt)
    console.log('User found:', { id: user._id, email: user.email, name: user.name || 'No Name' });
    
    // Generate tokens
    const accessToken = 'jwt-token-' + Date.now();
    const refreshToken = 'refresh-token-' + Date.now();
    
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name || user.email.split('@')[0]
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// OTP endpoints
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    console.log('Registration request for:', email);
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: email });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const newUser = {
      email: email,
      name: name || email.split('@')[0],
      password: password, // In production, hash this
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('users').insertOne(newUser);
    console.log('New user created:', { id: result.insertedId, email: email });
    
    res.json({ 
      message: 'User registered successfully',
      userId: result.insertedId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('Verify OTP for:', email);
    
    // Find user
    const user = await db.collection('users').findOne({ email: email });
    
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    // For demo, accept any OTP
    const accessToken = 'jwt-token-' + Date.now();
    const refreshToken = 'refresh-token-' + Date.now();
    
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name || user.email.split('@')[0]
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'OTP verification failed' });
  }
});

// User profile endpoint
app.get('/api/users/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // For demo, get first user (in production, decode JWT and get user ID)
    const user = await db.collection('users').findOne({});
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Profile data:', { id: user._id, email: user.email, name: user.name });

    res.json({
      id: user._id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      bio: user.bio || '',
      collegeName: user.college || '',
      department: user.department || '',
      yearOfStudy: user.year || 1,
      skills: user.skills ? user.skills.map(skill => ({ name: skill })) : [],
      avgRating: user.rating || 0,
      reviewCount: user.reviewCount || 0,
      profilePicUrl: user.profilePicUrl || null,
      verified: true,
      role: 'USER',
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user profile
app.put('/api/users/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const updates = req.body;
    console.log('Updating profile:', updates);

    // For demo, update first user
    const result = await db.collection('users').updateOne(
      {},
      { 
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get updated user
    const user = await db.collection('users').findOne({});

    res.json({
      id: user._id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      bio: user.bio || '',
      collegeName: user.college || '',
      department: user.department || '',
      yearOfStudy: user.year || 1,
      skills: user.skills ? user.skills.map(skill => ({ name: skill })) : [],
      avgRating: user.rating || 0,
      reviewCount: user.reviewCount || 0,
      profilePicUrl: user.profilePicUrl || null,
      verified: true,
      role: 'USER',
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Add skill
app.post('/api/users/me/skills', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { skill } = req.body;
    console.log('Adding skill:', skill);

    // For demo, update first user
    const result = await db.collection('users').updateOne(
      {},
      { 
        $addToSet: { skills: skill },
        $set: { updatedAt: new Date() }
      }
    );

    res.json({ message: 'Skill added successfully' });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({ message: 'Failed to add skill' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'MongoDB Auth Backend running on port 3001',
    timestamp: new Date().toISOString()
  });
});

// Start server
connectToMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 MongoDB Auth Backend running on http://localhost:${PORT}`);
    console.log(`📋 Available endpoints:`);
    console.log(`   POST /api/login - User login`);
    console.log(`   POST /api/send-otp - User registration`);
    console.log(`   POST /api/verify-otp - OTP verification`);
    console.log(`   GET  /api/users/me - Get user profile`);
    console.log(`   PUT  /api/users/me - Update profile`);
    console.log(`   POST /api/users/me/skills - Add skill`);
    console.log(`   GET  /health - Health check`);
    console.log(`\n🔧 To stop the server: Press Ctrl+C`);
  });
}).catch(console.error);
