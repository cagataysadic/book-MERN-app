const mongoose = require('mongoose');
const User = require('./User');

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;