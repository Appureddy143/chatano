document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const roomCode = params.get('room');

    if (!roomCode) {
        window.location.href = '/guest-portal.php';
        return;
    }

    // Connect using Socket.IO, passing the room code as a query
    const socket = io({
        query: { room: roomCode }
    });
    
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const messagesDiv = document.getElementById('messages');

    let myId = null;

    // Listen for the 'welcome' event from the server
    socket.on('welcome', (id) => {
        myId = id;
        console.log("Connection established. My ID is:", myId);
    });

    // Listen for new messages from the server
    socket.on('new_message', (data) => {
        const from = (data.senderId === myId) ? 'You' : 'Stranger';
        addMessage(data.text, data.id, from);
    });

    // Listen for delete commands from the server
    socket.on('delete_message', (data) => {
        deleteMessage(data.id);
    });

    socket.on('connect_error', (err) => {
        console.log("Connection failed:", err.message);
    });

    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = messageInput.value.trim();
        
        if (message) {
            // Send a message to the server using 'emit'
            socket.emit('new_message', message); 
            messageInput.value = '';
        }
    });

    function addMessage(text, id, from) { /* ... same as before ... */ }
    function deleteMessage(id) { /* ... same as before ... */ }
});
