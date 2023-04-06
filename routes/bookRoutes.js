const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const User = require('../models/User')
const authenticateToken = require('../middlewares/authenticateToken');

router.get('/every', async (req, res) => {
    const books = await Book.find();
    res.status(200).json(books);
})

router.get('/', authenticateToken, async (req, res) => {
  try {
    const books = await Book.find({ userId: req.user.userId });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { title, author, description } = req.body;
  const user = await User.findById(req.user.userId)
  const book = new Book({ title, author, description, userName: user.userName, userId: req.user.userId });

  try {
    const newBook = await book.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await Book.findByIdAndDelete(id);
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
