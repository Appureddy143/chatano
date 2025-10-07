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
    secret: 'a-very-secret-key-that-you-should-change',
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


// --- AUTHENTICATION API ---
app.post('/register', async (req, res) => { /* ... same as before ... */ });
app.post('/login', (req, res) => { /* ... same as before ... */ });
app.get('/logout', (req, res) => { /* ... same as before ... */ });
app.get('/api/user', requireLogin, (req, res) => { /* ... same as before ... */ });


// --- NEW: FRIENDS API ---

// Add a new friend
app.post('/api/friends/add', requireLogin, (req, res) => {
    const { username } = req.body;
    const currentUserId = req.session.userId;

    db.get('SELECT id FROM users WHERE username = ? AND id != ?', [username, currentUserId], (err, friend) => {
        if (err || !friend) {
            return res.status(404).json({ message: 'User not found or you cannot add yourself.' });
        }
        const user_one_id = Math.min(currentUserId, friend.id);
        const user_two_id = Math.max(currentUserId, friend.id);
        
        const sql = `INSERT INTO friends (user_one_id, user_two_id, status, action_user_id) VALUES (?, ?, 'pending', ?)`;
        db.run(sql, [user_one_id, user_two_id, currentUserId], function(err) {
            if (err) {
                return res.status(409).json({ message: 'Friend request already sent or you are already friends.' });
            }
            res.status(200).json({ message: 'Friend request sent!' });
        });
    });
});

// List all friends and friend requests
app.get('/api/friends/list', requireLogin, (req, res) => {
    const currentUserId = req.session.userId;
    const sql = `
        SELECT u.id, u.username, f.status, f.action_user_id
        FROM friends f
        JOIN users u ON u.id = (CASE WHEN f.user_one_id = ? THEN f.user_two_id ELSE f.user_one_id END)
        WHERE f.user_one_id = ? OR f.user_two_id = ?
    `;
    db.all(sql, [currentUserId, currentUserId, currentUserId], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error.' });
        }
        const friends = rows.filter(f => f.status === 'accepted');
        const pending = rows.filter(f => f.status === 'pending' && f.action_user_id !== currentUserId);
        res.json({ friends, pending });
    });
});

// Accept a friend request
app.post('/api/friends/accept', requireLogin, (req, res) => {
    const { friendId } = req.body;
    const currentUserId = req.session.userId;
    const user_one_id = Math.min(currentUserId, friendId);
    const user_two_id = Math.max(currentUserId, friendId);

    const sql = `UPDATE friends SET status = 'accepted', action_user_id = ? WHERE user_one_id = ? AND user_two_id = ? AND status = 'pending'`;
    db.run(sql, [currentUserId, user_one_id, user_two_id], function(err) {
        if (err || this.changes === 0) {
            return res.status(400).json({ message: 'Failed to accept request. It may not exist.' });
        }
        res.status(200).json({ message: 'Friend request accepted!' });
    });
});


// --- Real-time Guest Chat Logic (remains the same) ---
io.on('connection', (socket) => { /* ... same as before ... */ });


// --- Start Server ---
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
