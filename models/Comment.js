const mongoose = require('mongoose');
const User = require('./User');
const Post = require('./Post');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;