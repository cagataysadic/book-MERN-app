const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const authenticateToken = require('../middlewares/authenticateToken');

router.get('/every', async (req, res) => {
    const posts = await Post.find();
    res.status(200).json(posts);
})

router.get('/', authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user.userId });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const {postText } = req.body;
  const user = await User.findById(req.user.userId)
  const post = new Post({ postText, userName: user.userName, createdAt: Date.now(), userId: req.user.userId });

  try {
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { postText } = req.body;

    try {
        const updatedPost = await Post.findByIdAndUpdate(id, { postText, updatedAt: Date.now() }, { new: true });
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await Post.findByIdAndDelete(id);
    await Comment.deleteMany({ postId: id });
    res.status(200).json({ message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId }).select('text userName userId createdAt updatedAt');
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:postId/comment', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;
  const user = await User.findById(req.user.userId);
  const comment = new Comment({ text, userName: user.userName, createdAt: Date.now(), userId: req.user.userId, postId });

  try {
    const newComment = await comment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:postId/comment/:commentId', authenticateToken, async (req, res) => {
  const { commentId }= req.params;
  const { text } = req.body;

  try {
    const updatedComment = await Comment.findByIdAndUpdate(commentId, { text, updatedAt: Date.now() }, { new: true });
    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:postId/comment/:commentId', authenticateToken, async (req, res) => {
  const { commentId } = req.params;

  try {
    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({ message: 'Comment deleted succesfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;