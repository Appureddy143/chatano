const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require("socket.io");
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- Database Setup ---
const db = new sqlite3.Database('./chatano.db', (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to the SQLite database.');
});
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL)`);
    db.run(`CREATE TABLE IF NOT EXISTS friends (user_one_id INTEGER NOT NULL, user_two_id INTEGER NOT NULL, status TEXT NOT NULL, action_user_id INTEGER NOT NULL, PRIMARY KEY (user_one_id, user_two_id))`);
});

// --- Middleware & Session ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const sessionMiddleware = session({
    secret: 'change-this-secret-key-to-something-random',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 1000 * 60 * 60 * 24 }
});
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

// --- Static File & Page Serving ---
app.use(express.static(path.join(__dirname, 'public')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.php')));
const requireLogin = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/login.php');
    next();
};
app.get('/dashboard.php', requireLogin, (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.php')));

// --- API Routes (Auth, Friends) ---
// ... (Your existing API routes for /register, /login, friends, etc., go here)

// =================================================================
// --- THIS IS THE MAIN REAL-TIME CONNECTION BLOCK ---
// =================================================================
io.on('connection', (socket) => {
    const session = socket.request.session;
    const roomCode = socket.handshake.query.room;
    
    // --- GUEST CHAT LOGIC ---
    if (roomCode) {
        socket.join(roomCode);
        console.log(`User ${socket.id} connected to GUEST room: ${roomCode}`);
        socket.emit('welcome', socket.id);
        socket.on('new_message', (msg) => {
            // ... (guest chat message logic)
        });
    }

    // --- LOGGED-IN USER LOGIC ---
    if (session && session.userId) {
        const currentUserId = session.userId;
        socket.join(currentUserId.toString());
        console.log(`User ${session.username} (ID: ${currentUserId}) connected for PRIVATE chat.`);

        // --- PRIVATE MESSAGING LOGIC ---
        socket.on('private_message', (data) => {
            // ... (private message logic)
        });

        // --- WebRTC SIGNALING LOGIC (MUST BE INSIDE HERE) ---
        socket.on('webrtc-offer', (data) => {
            const { recipientId, offer } = data;
            io.to(recipientId.toString()).emit('webrtc-offer', { senderId: currentUserId, offer });
        });
        socket.on('webrtc-answer', (data) => {
            const { recipientId, answer } = data;
            io.to(recipientId.toString()).emit('webrtc-answer', { senderId: currentUserId, answer });
        });
        socket.on('webrtc-ice-candidate', (data) => {
            const { recipientId, candidate } = data;
            io.to(recipientId.toString()).emit('webrtc-ice-candidate', { senderId: currentUserId, candidate });
        });
        socket.on('webrtc-hang-up', (data) => {
            const { recipientId } = data;
            io.to(recipientId.toString()).emit('webrtc-hang-up');
        });
    }

    socket.on('disconnect', () => {
        console.log(`User ${socket.id} disconnected.`);
    });
});
// =================================================================
// --- END OF THE MAIN REAL-TIME CONNECTION BLOCK ---
// =================================================================

// --- Start Server ---
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
