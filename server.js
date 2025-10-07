const http = require('http');
const WebSocket = require('ws');

// Create a standard HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket server is running');
});

// Create a WebSocket server and attach it to the HTTP server
const wss = new WebSocket.Server({ server });

// --- THIS IS THE CRITICAL FIX ---
// Use the port provided by Render's environment variable, or default to 8080
const PORT = process.env.PORT || 8080;

// This function will broadcast a message to all connected clients
function broadcast(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Set up a connection listener for the WebSocket server
wss.on('connection', (ws) => {
    console.log('A new client connected!');

    // Listen for messages from this specific client
    ws.on('message', (message) => {
        const messageString = message.toString();
        console.log('Received message =>', messageString);
        broadcast(messageString);
    });

    // Listen for this client to disconnect
    ws.on('close', () => {
        console.log('Client has disconnected.');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Start the HTTP server
server.listen(PORT, () => {
    // This message will now show the correct port on Render
    console.log(`Server is listening on port ${PORT}`);
});
