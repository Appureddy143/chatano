<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Join a Room</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <video autoplay muted loop playsinline class="background-video">
        <source src="videos/background.mp4" type="video/mp4">
    </video>
    
    <main class="main-container">
        <div class="glass-container">
            <h1>Guest Chat Portal</h1>
            
            <form id="join-form" class="button-grid">
                <input type="text" id="room-code-input" placeholder="Enter Room Code" required style="padding: 15px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.4); background: rgba(0,0,0,0.3); color: white; text-align: center; font-size: 1.1em;">
                <button type="submit" class="btn">Join Room</button>
            </form>

            <p id="or-separator" style="margin: 20px 0;">- OR -</p>

            <div id="create-room-container" class="button-grid">
                 <button id="create-room-btn" class="btn">Create a New Room</button>
            </div>

            <div id="new-room-info" style="display: none; margin-top: 20px; text-align: center;">
                <h3 style="margin-bottom: 10px;">Your New Room Code:</h3>
                <p id="new-room-code" style="font-size: 1.5em; font-weight: bold; background: rgba(0,0,0,0.4); padding: 10px; border-radius: 5px;"></p>
                <a href="#" id="join-new-room-link" class="btn" style="margin-top: 15px; display: block;">Join Now</a>
            </div>
        </div>
    </main>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const joinForm = document.getElementById('join-form');
            const roomCodeInput = document.getElementById('room-code-input');
            const createRoomBtn = document.getElementById('create-room-btn');
            
            const createRoomContainer = document.getElementById('create-room-container');
            const newRoomInfo = document.getElementById('new-room-info');
            const newRoomCodeDisplay = document.getElementById('new-room-code');
            const joinNewRoomLink = document.getElementById('join-new-room-link');
            const orSeparator = document.getElementById('or-separator');

            // Handle joining an existing room
            joinForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const roomCode = roomCodeInput.value.trim();
                if (roomCode) {
                    window.location.href = `/guest-chat.php?room=${roomCode}`;
                }
            });

            // Handle creating a new room
            createRoomBtn.addEventListener('click', () => {
                // Generate a random 6-character alphanumeric code
                const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                
                // --- THIS IS THE NEW LOGIC ---
                // 1. Display the code on the page
                newRoomCodeDisplay.textContent = newRoomCode;
                
                // 2. Set the "Join Now" button's link
                joinNewRoomLink.href = `/guest-chat.php?room=${newRoomCode}`;
                
                // 3. Hide the original forms and "OR" separator
                joinForm.style.display = 'none';
                createRoomContainer.style.display = 'none';
                orSeparator.style.display = 'none';
                
                // 4. Show the new room info
                newRoomInfo.style.display = 'block';
            });
        });
    </script>
</body>
</html>
