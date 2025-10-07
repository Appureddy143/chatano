document.addEventListener('DOMContentLoaded', async () => {
    // --- Element Selectors & State Variables (same as before) ---
    // ...

    // --- E2EE Variables and Functions (same as before) ---
    let sodium;
    let userKeyPair;
    // ... (encryptMessage and decryptMessage functions are the same)

    const initializeSodium = async () => {
        // ... (same as before)
    };

    // --- Main Dashboard Loader ---
    const loadDashboard = async () => {
        await initializeSodium(); // Load crypto library first
        
        // When sodium is ready, send our public key to the server
        socket.emit('send_public_key', sodium.to_base64(userKeyPair.publicKey));

        // ... (The rest of your loadDashboard function is the same)
    };

    // --- Chat Logic (FULLY UPDATED FOR E2EE) ---
    const startChat = (e) => {
        const friendId = e.target.dataset.friendId;
        const friendUsername = e.target.dataset.friendUsername;
        if (currentChat.friendId === friendId) return;

        chatWithTitleEl.textContent = `Establishing secure chat with ${friendUsername}...`;
        messagesDiv.innerHTML = '';
        messageForm.style.display = 'none'; // Hide form until secure
        currentChat = { friendId, friendUsername, sharedKey: null };

        // Request the friend's public key from the server
        socket.emit('request_public_key', friendId);
    };

    socket.on('public_key_response', (data) => {
        // Check if this key is for the currently selected chat
        if (data.friendId === currentChat.friendId) {
            const friendPublicKey = sodium.from_base64(data.publicKey);
            
            // Compute the shared secret key
            const sharedKey = sodium.crypto_box_beforenm(friendPublicKey, userKeyPair.privateKey);
            currentChat.sharedKey = sharedKey;

            chatWithTitleEl.textContent = `Chat with ${currentChat.friendUsername} (Encrypted)`;
            messageForm.style.display = 'flex';
            console.log("Secure channel established!");
        }
    });

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        
        // Encrypt the message before sending if a shared key exists
        if (message && currentChat.sharedKey) {
            const encryptedMessage = encryptMessage(message, currentChat.sharedKey);
            
            socket.emit('private_message', {
                recipientId: currentChat.friendId,
                message: encryptedMessage // Send the encrypted object
            });
            
            // Decrypt for our own screen
            const decryptedForSelf = decryptMessage(encryptedMessage, currentChat.sharedKey);
            addMessage(decryptedForSelf, `pm-${Date.now()}`, 'You');

            messageInput.value = '';
        }
    });

    socket.on('private_message', (data) => {
        // Only process if a shared key exists for the current chat
        if (currentChat.sharedKey && (data.senderId === currentChat.friendId || data.senderId === currentUser.id)) {
            const decryptedMessage = decryptMessage(data.message, currentChat.sharedKey);
            
            if (decryptedMessage) {
                const from = (data.senderId === currentUser.id) ? 'You' : currentChat.friendUsername;
                addMessage(decryptedMessage, data.id, from);
            }
        }
    });
    
    // ... (rest of the file is the same: deleteMessage, friend requests, etc.)
});
