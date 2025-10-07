<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Dashboard</title>
    <script src="https://download.libsodium.org/libsodium.js/v0.7.13/libsodium.js"></script>
    <link rel="stylesheet" href="style.css">
    
    <!-- Include the new security script -->
    <script src="/security.js" defer></script>
</head>
<body>
    <div class="dashboard-container">
        <!-- Sidebar for Friends and User Controls -->
        <div class="sidebar">
            <h2 id="welcome-user">Welcome!</h2>
            
            <!-- Add Friend Section -->
            <div id="add-friend-container">
                <h3>Add Friend</h3>
                <form id="add-friend-form">
                    <input type="text" id="friend-username" placeholder="Enter username" required>
                    <button type="submit">Send Request</button>
                </form>
                <p id="friend-message" class="message"></p>
            </div>
            
            <!-- Friend Requests Section -->
            <div id="friend-requests-container">
                <h3>Friend Requests</h3>
                <ul id="requests-list">
                    <!-- Friend requests will be dynamically inserted here by JavaScript -->
                    <li>No new requests.</li>
                </ul>
            </div>

            <!-- Friends List Section -->
            <div id="friends-list-container">
                <h3>Friends</h3>
                <ul id="friends-list">
                    <!-- Friends will be dynamically inserted here by JavaScript -->
                    <li>Add some friends!</li>
                </ul>
            </div>
            
            <!-- Logout Button -->
            <a href="/logout" id="logout-btn">Logout</a>
        </div>
        
        <!-- Main Chat Area -->
<div class="chat-area">
    <div class="chat-header">
        <h2 id="chat-with-title">Select a friend to start chatting</h2>
        <div id="call-buttons" style="display: none;">
            <button id="video-call-btn">Video Call</button>
            <button id="hang-up-btn" style="display: none;">Hang Up</button>
        </div>
    </div>

    <div id="video-container" style="display: none;">
        <video id="remoteVideo" autoplay playsinline></video>
        <video id="localVideo" autoplay playsinline muted></video>
    </div>

    <div id="messages"></div>
    <form id="message-form" style="display: none;">
        <input type="text" id="message-input" autocomplete="off" placeholder="Type a message..." required>
        <button type="submit">Send</button>
    </form>
</div>
            
            <!-- Message Input Form (hidden by default) -->
            <form id="message-form" style="display: none;">
                <input type="text" id="message-input" autocomplete="off" placeholder="Type a message..." required>
                <button type="submit">Send</button>
            </form>
        </div>
    </div>

    <!-- Include necessary JavaScript libraries and custom scripts -->
    <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
    <script src="dashboard-client.js"></script>
</body>
</html>
