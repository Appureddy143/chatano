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

// --- THIS IS THE FIX ---
// Serve static assets like CSS, client-side JS, and videos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));

// Explicitly define routes for each of your PHP/HTML pages
const publicPath = path.join(__dirname, 'public');
app.get('/', (req, res) => res.sendFile(path.join(publicPath, 'index.php')));
app.get('/guest-portal.php', (req, res) => res.sendFile(path.join(publicPath, 'guest-portal.php')));
app.get('/guest-chat.php', (req, res) => res.sendFile(path.join(publicPath, 'guest-chat.php')));
app.get('/login.php', (req, res) => res.sendFile(path.join(publicPath, 'login.php')));
app.get('/register.php', (req, res) => res.sendFile(path.join(publicPath, 'register.php')));

// Middleware to protect the dashboard route
const requireLogin = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/login.php');
    next();
};
app.get('/dashboard.php', requireLogin, (req, res) => res.sendFile(path.join(publicPath, 'dashboard.php')));


// --- API Routes (Login, Register, Friends - same as before) ---
// ... (Your existing API routes for /register, /login, /logout, /api/user, /api/friends/* go here)


// --- Real-time Chat Logic (same as before) ---
io.on('connection', (socket) => {
    // ... (Your existing io.on('connection') logic goes here)
});


// --- Start Server ---
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
