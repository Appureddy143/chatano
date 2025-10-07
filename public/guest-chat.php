<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guest Chat Room</title>
    <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
    <script src="/security.js" defer></script>
    <link rel="stylesheet" href="style.css"> <style>
        /* Styles specific to the chat page */
        body {
            background-color: #1a1a1a;
            color: #e0e0e0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .chat-container {
            width: 90%;
            max-width: 800px;
            height: 90vh;
            background: #2a2a2a;
            border-radius: 10px;
            display: flex;
            flex-direction: column;
        }
        #messages {
            flex-grow: 1;
            padding: 20px;
            overflow-y: auto;
        }
        #message-form {
            display: flex;
            padding: 10px;
        }
        #message-input {
            flex-grow: 1;
            padding: 10px;
            border: none;
            border-radius: 5px;
            background: #3a3a3a;
            color: white;
        }
        button {
            padding: 10px 15px;
            border: none;
            background: #007bff;
            color: white;
            border-radius: 5px;
            margin-left: 10px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <div id="messages"></div>
        <form id="message-form">
            <input type="text" id="message-input" placeholder="Type a message..." autocomplete="off" required>
            <button type="submit">Send</button>
        </form>
    </div>
    <script src="chat-client.js"></script>
</body>
</html>
