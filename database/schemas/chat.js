const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  userMessage: {
    type: String,
    required: true,
  },
  botMessage: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("chats", ChatSchema);
