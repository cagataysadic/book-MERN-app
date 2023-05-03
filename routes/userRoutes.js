const express = require('express')
const jwt = require('jsonwebtoken');
const User = require('../models/User')
const Post = require('../models/Post');
const Book = require('../models/Book');
const Comment = require('../models/Comment');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();

const deleteRelatedData = async (userId) => {
    await Post.deleteMany({ userId });
    await Book.deleteMany({ userId });
    await Comment.deleteMany({ userId });
};

router.post('/register', async (req, res) => {
    console.log('Received request body:', req.body);
    try {
        const user = new User(req.body);
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        res.status(201).send({ user, token });
    } catch (error) {
        console.log('Error:', error.message);
        res.status(400).send(error);
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