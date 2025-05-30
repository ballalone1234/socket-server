const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  seat_number: { type: Number, required: true },
  is_available: { type: Boolean, default: true },
});

module.exports = mongoose.model('Seat', seatSchema);