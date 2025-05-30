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
                      const roomAll =  await Room.find()
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

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
  });

