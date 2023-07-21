const mongoose = require('mongoose')
const User = require('./User')

const postSchema = new mongoose.Schema({
    postText: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;