const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose')
const authenticateToken = require('../middlewares/authenticateToken');  

const router = express.Router();

// Get all conversations for the logged-in user
router.get('/conversations', authenticateToken, async (req, res) => {
    try {
        const conversations = await Message.find({
            $or: [
                { 'sender': req.user.userId },
                { 'receiver': req.user.userId }
            ]
        })
        .sort('-createdAt') // sort by creation time in descending order
        // Simplify conversations to only include unique conversations
        const uniqueConversations = [...new Set(conversations.map(c => {
            return c.sender.equals(req.user.userId) ? c.receiver.toString() : c.sender.toString()
        }))];

        const populatedUniqueConversations = await User.find({
            '_id': { $in: [...new Set(uniqueConversations)] }
        }, 'userName');

        console.log('uniqueConversations', uniqueConversations); // ADD THIS
        console.log('populatedUniqueConversations', populatedUniqueConversations); // ADD THIS
        
        res.json(populatedUniqueConversations);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Get messages in a conversation between the logged-in user and another specific user
router.get('/conversations/:otherUserId', authenticateToken, async (req, res) => {
    console.log('Inside /conversations/:otherUserId route');
    console.log('Logged-in user ID:', req.user.userId);
    console.log('Other user ID:', req.params.otherUserId);
    try {
        const messages = await Message.find({
            $or: [
                { 'sender': req.user.userId, 'receiver': req.params.otherUserId },
                { 'sender': req.params.otherUserId, 'receiver': req.user.userId }
            ]
        })
        .populate('sender receiver', 'userName')
        .sort('createdAt') // sort by creation time in ascending order

        console.log('Messages:', messages);
        res.json(messages);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router