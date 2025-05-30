const express = require('express');
const User = require('../models/User');
const Room = require('../models/Room');
const Seat = require('../models/Seat');
const router = express.Router();

// Register Route
router.get('', async (req, res) => {

  try {
    const roomAll = await Room.find()
    if (!roomAll || roomAll.length === 0) {
      return res.status(404).json({ msg: 'No rooms found' });
    }
    //count the room member count with the seats
    const roomData = []
    for (let i = 0; i < roomAll.length; i++) {
      const seatCount = await Seat.countDocuments({ room_id: roomAll[i]._id, is_available: false });
      roomData.push({
        ...roomAll[i]._doc,
        member_count: seatCount,
      });
    }


    res.json(roomData);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});


module.exports = router;
