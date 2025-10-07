<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Anonymous Chat</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <div id="loading-screen">
        <div class="terminal">
            <div id="terminal-output"></div>
            <span class="cursor">_</span>
        </div>
    </div>

    <video autoplay muted loop playsinline class="background-video">
        <source src="videos/background.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
    
    <main class="main-container">
        <div class="glass-container">
            <h1>Select A Gateway</h1>
            <div class="button-grid">
                <a href="/guest-portal.php" class="btn">Guest Chat</a>
                <a href="/login.php" class="btn">Anonymous Login</a>
            </div>
        </div>
    </main>

    <script src="script.js"></script>
</body>
</html>
