const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Get all conversations for a user
router.get('/', async (req, res) => {
  try {
    // In production, get user ID from JWT middleware
    // For now, we'll assume a dummy user ID or handle it if missing
    const userId = req.headers['user-id']; 
    if (!userId) return res.status(401).json({ message: 'User ID required' });

    const conversations = await Conversation.find({
      participants: userId
    }).populate('participants', 'name profilePicUrl email')
      .populate('gigId', 'title')
      .sort({ updatedAt: -1 });

    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(p => p._id.toString() !== userId);
      return {
        id: conv._id,
        participantName: otherParticipant ? otherParticipant.name : 'Unknown User',
        participantAvatar: otherParticipant ? otherParticipant.profilePicUrl : null,
        lastMessage: conv.lastMessage,
        updatedAt: conv.updatedAt,
        gigTitle: conv.gigId ? conv.gigId.title : null
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

// Create or get a conversation between two users
router.post('/', async (req, res) => {
  try {
    const currentUserId = req.headers['user-id'];
    const { participantId, gigId } = req.body;

    if (!currentUserId || !participantId) {
      return res.status(400).json({ message: 'User involvement required' });
    }

    // Check if conversation already exists for this gig
    let query = {
      participants: { $all: [currentUserId, participantId] }
    };
    if (gigId) query.gigId = gigId;

    let conversation = await Conversation.findOne(query);

    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, participantId],
        gigId: gigId
      });
      await conversation.save();
    }

    res.json({ id: conversation._id });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Failed to create conversation' });
  }
});

module.exports = router;
