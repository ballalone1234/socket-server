const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/room');
const seatRoutes = require('./routes/seat');
const Room = require('./models/Room');
const cors = require('cors');
const { console } = require('inspector/promises');
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


// ...existing code...

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGODB_CONNECTION_STRING);

const db = mongoose.connection;
db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});
db.once('open', () => {
    console.log('MongoDB connected successfully');
    const changeStreamRoom = Room.watch();
    changeStreamRoom.on('change', (change) => {
        console.log('Change detected:', change);
        const changeRoomData = change.fullDocument;
        console.log('Change data:', changeRoomData);
        io.emit('roomUpdated', {
            type: change.operationType,
            data: changeRoomData,
        });
    });

    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('enqueue', async (data) => {
    const item = await QueueItem.create({ name: data.name });
    console.log('New item added:', item);
    // No need to emit manually because Mongo watch will handle it
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});