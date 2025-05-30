const express = require('express');
const User = require('../models/User');
const Room = require('../models/Room');
const Seat = require('../models/Seat');
const router = express.Router();

router.get('/:id', async (req, res) => {
const room_id = req.params.id;
  try {
    const seatByRoom = await Seat.find({
        room_id: room_id,
    })
    res.json(seatByRoom);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/booking', async (req, res) => {
const id = req.body.id;
const userId = req.body.user_id;
  try {
    // Check if the user exists
    const seatExists = await Seat.find(
        {user_id: userId }
    )
    if (seatExists.length > 0) {
        return res.status(400).json({ msg: 'You already has a seat booked' });
    }
    const seatById = await Seat.updateOne(
        { _id: id  , is_available: true },
        { $set: { user_id: userId, is_available: false } }
    );

    if (seatById.modifiedCount === 0) {
        return res.status(404).json({ msg: 'Seat not found or already taken' });
        }
    res.json(seatById);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('', async (req, res) => {

    try {
        const seatNumber = req.body.seat_number;
        const roomId = req.body.room_id;
        const newSeat = await Seat.create({
            room_id: roomId,
            seat_number: seatNumber,
            is_available: true,
        });
        res.json(newSeat);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
