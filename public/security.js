document.addEventListener('DOMContentLoaded', () => {
    // Disable right-clicking on the entire page
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        alert('This functionality is disabled.');
    });

    // Disable copy event on the entire page
    document.addEventListener('copy', (event) => {
        event.preventDefault();
        alert('Copying is disabled.');
    });

    // Disable common keyboard shortcuts for copying
    document.addEventListener('keydown', (event) => {
        // Disable Ctrl+C, Ctrl+X, Ctrl+U
        if (event.ctrlKey && ['c', 'x', 'u'].includes(event.key.toLowerCase())) {
            event.preventDefault();
            alert('This functionality is disabled.');
        }
        // Disable Print Screen (works in some browsers)
        if (event.key === 'PrintScreen') {
            event.preventDefault();
            alert('Screenshots are disabled.');
        }
    });
});
