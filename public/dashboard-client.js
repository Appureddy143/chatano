document.addEventListener('DOMContentLoaded', async () => {
    // --- Element Selectors ---
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');
    const videoCallBtn = document.getElementById('video-call-btn');
    const hangUpBtn = document.getElementById('hang-up-btn');
    const callButtons = document.getElementById('call-buttons');
    const videoContainer = document.getElementById('video-container');
    // ... (all other element selectors are the same)

    // --- State Variables ---
    let currentUser = null;
    let currentChat = { friendId: null, friendUsername: null };
    const socket = io();
    let peerConnection;
    let localStream;
    
    // --- WebRTC Configuration ---
    const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] };

    // --- Main Dashboard & WebRTC Setup ---
    const initialize = async () => {
        try {
            const userRes = await fetch('/api/user');
            if (!userRes.ok) throw new Error('Not logged in');
            currentUser = await userRes.json();
            document.getElementById('welcome-user').textContent = `Welcome, ${currentUser.username}!`;
            
            // Get user's camera and microphone
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideo.srcObject = localStream;
        } catch (error) {
            window.location.href = '/login.php';
        }
        loadFriends(); // Load friends list
    };

    // --- Chat & Call Logic ---
    const startChat = (e) => {
        // ... (existing startChat logic)
        callButtons.style.display = 'block'; // Show call buttons
    };

    // --- WebRTC Functions ---
    const createPeerConnection = () => {
        peerConnection = new RTCPeerConnection(configuration);
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('webrtc-ice-candidate', {
                    recipientId: currentChat.friendId,
                    candidate: event.candidate
                });
            }
        };

        peerConnection.ontrack = event => {
            remoteVideo.srcObject = event.streams[0];
        };
    };

    videoCallBtn.addEventListener('click', async () => {
        console.log("Starting video call...");
        createPeerConnection();
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socket.emit('webrtc-offer', {
            recipientId: currentChat.friendId,
            offer: offer
        });
        
        showCallUI();
    });
    
    hangUpBtn.addEventListener('click', () => {
        socket.emit('webrtc-hang-up', { recipientId: currentChat.friendId });
        closeCall();
    });

    const closeCall = () => {
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
        videoContainer.style.display = 'none';
        hangUpBtn.style.display = 'none';
        videoCallBtn.style.display = 'inline-block';
        document.getElementById('messages').style.display = 'block';
        document.getElementById('message-form').style.display = 'flex';
    };

    const showCallUI = () => {
        videoContainer.style.display = 'block';
        hangUpBtn.style.display = 'inline-block';
        videoCallBtn.style.display = 'none';
        document.getElementById('messages').style.display = 'none';
        document.getElementById('message-form').style.display = 'none';
    };

    // --- Socket Listeners for WebRTC ---
    socket.on('webrtc-offer', async (data) => {
        if (confirm(`Incoming call from a friend. Accept?`)) {
            currentChat = { friendId: data.senderId, friendUsername: 'Friend' };
            createPeerConnection();
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            socket.emit('webrtc-answer', {
                recipientId: data.senderId,
                answer: answer
            });

            showCallUI();
        }
    });

    socket.on('webrtc-answer', async (data) => {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    socket.on('webrtc-ice-candidate', async (data) => {
        if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    });
    
    socket.on('webrtc-hang-up', () => {
        closeCall();
    });

    // ... (rest of your file: loadFriends, render functions, E2EE, etc.)
    // Make sure to add the 'startChat' logic inside your friends list rendering
    initialize();
});
