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
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);
});

// --- Middleware & Session Setup ---
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

// --- Static File Serving ---
app.use(express.static(path.join(__dirname, 'public')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));

// --- Page Serving Routes (Updated for .php) ---

// Explicitly serve index.php for the root route '/'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.php'));
});

// Middleware to protect routes
const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login.php');
    }
    next();
};

// Protect and serve the dashboard
app.get('/dashboard.php', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.php'));
});


// --- API Routes for Login/Registration ---

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password || password.length < 6) {
        return res.status(400).json({ message: 'Username and password are required. Password must be at least 6 characters.' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
            if (err) {
                return res.status(409).json({ message: 'Username already exists.' });
            }
            res.status(201).json({ message: 'User created successfully!' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            req.session.userId = user.id;
            req.session.username = user.username;
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid credentials.' });
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.redirect('/login.php');
    });
});

// API route to get current user info
app.get('/api/user', requireLogin, (req, res) => {
    res.json({ id: req.session.userId, username: req.session.username });
});


// --- Real-time Guest Chat Logic ---
io.on('connection', (socket) => {
  const roomCode = socket.handshake.query.room;
  if (roomCode) {
      socket.join(roomCode);
      console.log(`User ${socket.id} connected to guest room: ${roomCode}`);
      socket.emit('welcome', socket.id);
      socket.on('new_message', (msg) => {
          const messageId = `msg-${Date.now()}`;
          const sanitizedMsg = String(msg || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
          if (sanitizedMsg.trim().length === 0) return;
          const messageData = { id: messageId, senderId: socket.id, text: sanitizedMsg };
          io.to(roomCode).emit('new_message', messageData);
          setTimeout(() => {
            io.to(roomCode).emit('delete_message', { id: messageId });
          }, 30000);
      });
  }
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
