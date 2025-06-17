const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  book_at: { type: Date, default: Date.now },
  token: { type: String, required: true, unique: true },
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  in_room: { type: Boolean, default: false },
});

module.exports = mongoose.model('Queue', queueSchema);