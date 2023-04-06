const mongoose = require('mongoose')
const User = require('./User')

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    description: String,
    userName: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;