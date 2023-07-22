const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const User = require('../models/User')
const authenticateToken = require('../middlewares/authenticateToken');

router.get('/every', async (req, res) => {
  try {
      const books = await Book.find().populate('userId');
      res.send(books);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const books = await Book.find({ userId: req.user.userId }).populate('userId', 'userName -_id');
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { title, author, description, genre } = req.body;
  const book = new Book({ title, author, description, genre, createdAt: Date.now(), userId: req.user.userId });

  try {
    const newBook = await book.save();
    const populatedBook = await Book.findById(newBook._id).populate('userId', 'userName -_id');
    res.status(201).json(populatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, author, description, genre } = req.body;

  try {
      const updatedBook = await Book.findByIdAndUpdate(id, { title, author, description, genre, updatedAt: Date.now() }, { new: true });
      res.status(200).json(updatedBook);
  } catch (error) {
      res.status(500).json({ message: error.message });
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