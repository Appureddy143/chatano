const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve all static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));

// --- Real-time Chat Logic ---
io.on('connection', (socket) => {
  const roomCode = socket.handshake.query.room;
  if (!roomCode) {
    return socket.disconnect();
  }

  socket.join(roomCode);
  console.log(`User ${socket.id} connected to room: ${roomCode}`);

  socket.emit('welcome', socket.id);

  socket.on('new_message', (msg) => {
    const messageId = `msg-${Date.now()}`;
    // Sanitize message to prevent any HTML from being rendered
    const sanitizedMsg = String(msg || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    if (sanitizedMsg.trim().length === 0) return;

    const messageData = {
      id: messageId,
      senderId: socket.id,
      text: sanitizedMsg
    };

    io.to(roomCode).emit('new_message', messageData);
    console.log(`Message broadcast in room '${roomCode}'`);

    setTimeout(() => {
      io.to(roomCode).emit('delete_message', { id: messageId });
    }, 30000); // 30 seconds
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected from room: ${roomCode}`);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
