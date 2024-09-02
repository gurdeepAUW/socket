const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');
 
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins (use a specific origin if needed)
    methods: ['GET', 'POST'],
  },
});
 
// Use CORS middleware
app.use(cors());
 
// Log when a user connects
io.on('connection', socket => {
  console.log(`A user connected: ${socket.id}`);
 
  // Listen for 'sendMessage' events from clients
  socket.on('sendMessage', message => {
    console.log('Received message:', message);
    // Emit a response back to the client
    socket.emit('message', 'Message received: Rahul sasajs' + message);
  });
 
  // const interval = setInterval(() => {
  //   io.emit('message', 'Hello from the server!');
  //   console.log("message sent to client ");
  // }, 2000); // 10 seconds
 
  socket.on('disconnect', () => {
    console.log(`A user disconnected: ${socket.id}`);
    //clearInterval(interval);
     });
});
 
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
