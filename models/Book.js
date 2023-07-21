const mongoose = require('mongoose')
const User = require('./User')

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    description: String,
    genre: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;