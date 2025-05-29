const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

let queue = [];

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('queue', queue);

  socket.on('joinQueue', (user) => {
    console.log('User joined queue:', user);
    queue.push(user);
    io.emit('queue', queue);
  });

  socket.on('leaveQueue', (userId) => {
    queue = queue.filter((u) => u.id !== userId);
    io.emit('queue', queue);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);
  });
});

server.listen(process.env.PORT || 4000, () => {
  console.log('Socket server running on port 4000');
});
