const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = {}; // Store users and their socket connections
const messages = {}; // Store messages

// Middleware to parse JSON requests
app.use(express.json());

// API route to get user status
app.get('/api/status/:userId', (req, res) => {
    const userId = req.params.userId;
    const status = users[userId] ? 'online' : 'offline';
    res.json({ status });
});

// API route to send a message via HTTP
app.post('/api/send-message', (req, res) => {
    const { from, to, message } = req.body;
    if (users[to]) {
        users[to].emit('receive-message', { from, message, status: 'single-tick' });
        messages[to].push({ from, message, status: 'single-tick' });
        res.json({ success: true, status: 'Message sent' });
    } else {
        res.json({ success: false, status: 'User is offline' });
    }
});

// Socket.io connection event
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('register', (userId) => {
        users[userId] = socket;
        messages[userId] = messages[userId] || [];
        io.emit('user-status', { userId, status: 'online' });
        console.log(`${userId} is now online`);
    });

    socket.on('send-message', ({ from, to, message }) => {
        const messageData = { from, message, status: 'single-tick' };
        if (users[to]) {
            users[to].emit('receive-message', messageData);
            messages[to].push(messageData);
        }
    });

    socket.on('message-received', ({ from, to }) => {
        messages[to].forEach(msg => {
            if (msg.from === from && msg.status === 'single-tick') {
                msg.status = 'double-tick';
            }
        });
        users[from].emit('message-status', { to, status: 'double-tick' });
    });

    socket.on('message-read', ({ from, to }) => {
        messages[to].forEach(msg => {
            if (msg.from === from && msg.status === 'double-tick') {
                msg.status = 'blue-double-tick';
            }
        });
        users[from].emit('message-status', { to, status: 'blue-double-tick' });
    });

    socket.on('disconnect', () => {
        for (const userId in users) {
            if (users[userId] === socket) {
                delete users[userId];
                io.emit('user-status', { userId, status: 'offline' });
                console.log(`${userId} disconnected`);
                break;
            }
        }
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
