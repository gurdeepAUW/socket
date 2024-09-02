const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {}; // To store user information

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('register', (userId) => {
        users[userId] = socket.id;
        console.log(`User registered: ${userId}`);
    });

    socket.on('sendMessage', ({ senderId, receiverId, message }) => {
        const receiverSocketId = users[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('receiveMessage', { senderId, message });
        } else {
            console.log('Receiver not connected');
        }
    });

    socket.on('disconnect', () => {
        for (let userId in users) {
            if (users[userId] === socket.id) {
                delete users[userId];
                console.log(`User disconnected: ${userId}`);
                break;
            }
        }
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
