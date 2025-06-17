const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/room');
const seatRoutes = require('./routes/seat');
const Room = require('./models/Room');
const Seat = require('./models/Seat');
const Queue = require('./models/Queue');


const cors = require('cors');
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/seats', seatRoutes);



const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGODB_CONNECTION_STRING);

const db = mongoose.connection;
db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
db.once('open', () => {
  console.log('MongoDB connected successfully');
  const changeStreamSeat = Seat.watch();
  changeStreamSeat.on('change', async (change) => {
    switch (change.operationType) {
      case 'insert':
        break;
      case 'update':
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
        io.emit('roomUpdated', roomData);

        const seatById = await Seat.findById(change.documentKey._id);
        const Seats = await Seat.find({
          room_id: seatById.room_id
        });
        if (Seats) {
          io.emit('seatUpdated', Seats);
        }
    }
  });

  server.listen(PORT, () => {
    console.log(`Server running on :${PORT}`);
  });
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('joinQueue', async (room) => {
    const countRoomUserInRoom = await Queue.countDocuments({ room_id: room._id ,in_room: true });
    console .log("countRoomUserInRoom", countRoomUserInRoom);
    if (countRoomUserInRoom < 5) {
      socket.join(room._id);
      await Queue.findOneAndUpdate(
        { token: room.token, room_id: room._id  , },
        { in_room: true },
        { upsert: true, new: true }
      );
      console.log(`User ${socket.id} joined room ${room._id}`);
      socket.emit('joinSuccess', { message: 'Joined queue successfully' , room : room });
    } else {
      console.log(`Room ${room._id} is full`);
      socket.emit('queueFull', { message: 'Room is full. Please wait or try again later.' });
    }
  });
  socket.on('manualDisconnect',async (token) => {
      const deleteStatus = await Queue.deleteOne({ token: token.token });
    console.log('deleteStatus', deleteStatus);
    if (deleteStatus.deletedCount > 0) {
      console.log(`deleted queue with token: ${token.token}`);
    } 
      console.log('User manualDisconnect:', socket.id , 'Token:', token.token);

    
  });
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

