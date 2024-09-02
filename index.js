const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve the static files (if you have a frontend)
app.use(express.static('public'));

// Log when a user connects
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Optional: Log when a user disconnects
  socket.on('disconnect', () => {
    console.log(`A user disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
