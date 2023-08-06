const express = require('express')
const jwt = require('jsonwebtoken');
const User = require('../models/User')
const Post = require('../models/Post');
const Book = require('../models/Book');
const Comment = require('../models/Comment');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();
const Message = require('../models/Message');

const deleteRelatedData = async (userId) => {
    await Post.deleteMany({ userId });
    await Book.deleteMany({ userId });
    await Comment.deleteMany({ userId });
    await Message.deleteMany({ 
        $or: [
            { sender: userId },
            { receiver: userId }
        ]
    });
};

router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.send(user);
    } catch (error) {
        res.status(500).send();
    }
});

router.post('/validate', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).send();
        }

        const isMatch = await user.comparePassword(req.body.currentPassword);

        if (!isMatch) {
            return res.status(400).send({ error: 'Current password is incorrect.' });
        }

        res.send({ isValid: true });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.patch('/update', authenticateToken, async (req, res) => {
    const { userName, email, password } = req.body;

    try {
        let user = await User.findById(req.user.userId);
        if (!user) return res.status(400).send();

        if ( !userName && !email && !password) return res.status(200).send(user)

        if (userName) user.userName = userName;
        if (email) user.email = email;
        if (password) user.password = password;

        await user.save();

        res.send(user);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

router.post('/register', async (req, res) => {
    console.log('Received request body:', req.body);
    try {
        const user = new User(req.body);
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        res.status(201).send({ user, token });
    } catch (error) {
        console.log('Error:', error.message);

        let errors = { userName: '', email: '' };

        if (error.code === 11000) {
            
            const duplicateFieldMatch = /index: (\w+)_\d/.exec(error.message);
            if (duplicateFieldMatch) {
                const duplicateField = duplicateFieldMatch[1];
                errors[duplicateField] = `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} already exists. Please use a different one.`;
            }
        }

        res.status(400).send(errors)
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByCredentials(email, password);
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.status(200).send({ user, token });
    } catch (error) {
        console.log('Error:', error.message);
        res.status(400).send(error)
    }
});

router.delete('/delete', authenticateToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
  
      await deleteRelatedData(req.user.userId);
      await User.findByIdAndDelete(req.user.userId);
  
      res.send({ message: 'User and related data deleted successfully' });
    } catch (error) {
      res.status(500).send({ error: 'Server error' });
    }
});

module.exports = router;