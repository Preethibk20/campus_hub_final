require('dotenv').config({ path: '../.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const conversationRoutes = require('./routes/conversationRoutes');

const app = express();
const PORT = 3001; // ✅ Strictly using port 3001 as requested

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => res.json({ message: 'Campus Hub Auth API is running perfectly! 🚀' }));
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
// ✅ Connect DB FIRST, then start server
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campushub')
  .then(() => {
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Auth server running on http://localhost:${PORT}`);
    });

  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });