document.addEventListener('DOMContentLoaded', async () => {
    // --- Element Selectors ---
    const welcomeUserEl = document.getElementById('welcome-user');
    const friendsListEl = document.getElementById('friends-list');
    const requestsListEl = document.getElementById('requests-list');
    const addFriendForm = document.getElementById('add-friend-form');
    const friendMessageEl = document.getElementById('friend-message');
    const chatWithTitleEl = document.getElementById('chat-with-title');
    const messagesDiv = document.getElementById('messages');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    
    // --- State Variables ---
    let currentUser = null;
    let currentChat = { friendId: null, friendUsername: null };
    const socket = io();

    // --- Main Dashboard Loader ---
    const loadDashboard = async () => {
        try {
            const userRes = await fetch('/api/user');
            if (!userRes.ok) throw new Error('Not logged in');
            currentUser = await userRes.json();
            welcomeUserEl.textContent = `Welcome, ${currentUser.username}!`;

            const friendsRes = await fetch('/api/friends/list');
            const lists = await friendsRes.json();
            
            renderFriends(lists.friends);
            renderRequests(lists.pending);
        } catch (error) {
            window.location.href = '/login.php';
        }
    };

    // --- Render Functions ---
    const renderFriends = (friends) => {
        friendsListEl.innerHTML = '';
        if (friends.length === 0) {
            friendsListEl.innerHTML = '<li>Add some friends!</li>';
            return;
        }
        friends.forEach(friend => {
            const li = document.createElement('li');
            li.textContent = friend.username;
            li.dataset.friendId = friend.id;
            li.dataset.friendUsername = friend.username;
            li.addEventListener('click', startChat);
            friendsListEl.appendChild(li);
        });
    };
    const renderRequests = (requests) => {
        requestsListEl.innerHTML = '';
        if (requests.length === 0) {
            requestsListEl.innerHTML = '<li>No new requests.</li>';
            return;
        }
        requests.forEach(req => { /* ... same as before ... */ });
    };

    // --- Chat Logic ---
    const startChat = (e) => {
        const friendId = e.target.dataset.friendId;
        const friendUsername = e.target.dataset.friendUsername;

        if (currentChat.friendId === friendId) return; // Already chatting with this person

        currentChat = { friendId, friendUsername };
        
        chatWithTitleEl.textContent = `Chat with ${friendUsername}`;
        messagesDiv.innerHTML = ''; // Clear previous chat
        messageForm.style.display = 'flex';
        
        // Highlight the selected friend
        document.querySelectorAll('#friends-list li').forEach(li => li.classList.remove('active'));
        e.target.classList.add('active');
    };

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (message && currentChat.friendId) {
            socket.emit('private_message', {
                recipientId: currentChat.friendId,
                message: message
            });
            messageInput.value = '';
        }
    });

    socket.on('private_message', (data) => {
        const from = (data.senderId === currentUser.id) ? 'You' : currentChat.friendUsername;
        addMessage(data.text, data.id, from);
    });
    
    socket.on('delete_message', (data) => deleteMessage(data.id));

    const addMessage = (text, id, from) => {
        const p = document.createElement('p');
        p.id = id;
        p.innerHTML = `<strong>${from}:</strong> ${text}`;
        messagesDiv.appendChild(p);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    };
    const deleteMessage = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 500);
        }
    };
    
    // --- Friend Request Logic (same as before) ---
    addFriendForm.addEventListener('submit', async (e) => { /* ... */ });
    const acceptFriendRequest = async (e) => { /* ... */ };

    // Initial load
    loadDashboard();
});
