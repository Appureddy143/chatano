document.addEventListener('DOMContentLoaded', () => {
    const welcomeUserEl = document.getElementById('welcome-user');
    const friendsListEl = document.getElementById('friends-list');
    const requestsListEl = document.getElementById('requests-list');
    const addFriendForm = document.getElementById('add-friend-form');
    const friendMessageEl = document.getElementById('friend-message');

    let currentUser = null;

    // Main function to load all dashboard data
    const loadDashboard = async () => {
        // Fetch current user's info
        try {
            const userResponse = await fetch('/api/user');
            if (!userResponse.ok) throw new Error('Not logged in');
            currentUser = await userResponse.json();
            welcomeUserEl.textContent = `Welcome, ${currentUser.username}!`;
        } catch (error) {
            window.location.href = '/login.php';
            return;
        }

        // Fetch friends and requests list
        const friendsResponse = await fetch('/api/friends/list');
        const lists = await friendsResponse.json();
        
        // Populate friends list
        friendsListEl.innerHTML = ''; // Clear list
        if (lists.friends.length > 0) {
            lists.friends.forEach(friend => {
                const li = document.createElement('li');
                li.textContent = friend.username;
                li.dataset.friendId = friend.id;
                friendsListEl.appendChild(li);
            });
        } else {
            friendsListEl.innerHTML = '<li>Add some friends!</li>';
        }

        // Populate friend requests list
        requestsListEl.innerHTML = ''; // Clear list
        if (lists.pending.length > 0) {
            lists.pending.forEach(request => {
                const li = document.createElement('li');
                li.textContent = `${request.username} sent you a request.`;
                const acceptBtn = document.createElement('button');
                acceptBtn.textContent = 'Accept';
                acceptBtn.dataset.friendId = request.id;
                acceptBtn.onclick = acceptFriendRequest;
                li.appendChild(acceptBtn);
                requestsListEl.appendChild(li);
            });
        } else {
            requestsListEl.innerHTML = '<li>No new requests.</li>';
        }
    };

    // Handle the "Add Friend" form submission
    addFriendForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('friend-username');
        const username = usernameInput.value;
        friendMessageEl.textContent = '';

        const response = await fetch('/api/friends/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        const result = await response.json();
        friendMessageEl.textContent = result.message;
        friendMessageEl.style.color = response.ok ? 'lightgreen' : '#ff9999';
        usernameInput.value = '';
        if (response.ok) {
            setTimeout(loadDashboard, 1500); // Reload lists after a delay
        }
    });

    // Handle accepting a friend request
    const acceptFriendRequest = async (e) => {
        const friendId = e.target.dataset.friendId;
        const response = await fetch('/api/friends/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ friendId })
        });
        if (response.ok) {
            loadDashboard(); // Reload lists immediately
        }
    };

    // Initial load
    loadDashboard();
});
