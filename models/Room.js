const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  max_member: { type: Number, required: true, default: 5 },
  is_active: { type: Boolean, default: true },
  is_available: { type: Boolean, default: true },
});

module.exports = mongoose.model('Room', roomSchema);