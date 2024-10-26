// Event listener to navigate back to the index page
document.getElementById('back-button').addEventListener('click', () => {
    window.location.href = 'index.html';
});

let peer;  // Variable to hold the PeerJS instance
const status = document.getElementById('status');  // Status display element
const roomNameInput = document.getElementById('session-code-field');  // Input for session code
const userNameInput = document.getElementById('name-field');  // Input for username
const joinBtn = document.getElementById('join-button');  // Button to join the session

// Initialize PeerJS and configure STUN/TURN servers for connection
function initializePeer() {
    peer = new Peer({
        config: {
            iceServers: [
                { urls: "stun:stun.relay.metered.ca:80" },
                { urls: "turn:global.relay.metered.ca:80", username: "c6b847e6b1529929d92031ed", credential: "ax783OE1j1gGpLL5" },
                { urls: "turn:global.relay.metered.ca:80?transport=tcp", username: "c6b847e6b1529929d92031ed", credential: "ax783OE1j1gGpLL5" },
                { urls: "turn:global.relay.metered.ca:443", username: "c6b847e6b1529929d92031ed", credential: "ax783OE1j1gGpLL5" },
                { urls: "turns:global.relay.metered.ca:443?transport=tcp", username: "c6b847e6b1529929d92031ed", credential: "ax783OE1j1gGpLL5" },
            ],
        }
    });

    peer.on('open', (id) => {
        status.textContent = 'Connected to server';
        status.classList.remove('error');
        joinBtn.disabled = false;
    });

    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        status.textContent = `Error: ${err.type} - ${err.message}`;
        status.classList.add('error');
    });
}


// Validate form inputs for required fields and correct values
function validateInputs() {
    // Check if the username input is empty
    if (!userNameInput.value.trim()) {
        status.textContent = 'Please enter a username to join';
        status.classList.add('error');
        return false;
    }

    // Check if the session code input is empty
    if (!roomNameInput.value.trim()) {
        status.textContent = 'Please enter a session code to join';
        status.classList.add('error');
        return false;
    }

    return true;
}
// Event listener for joining a session
joinBtn.addEventListener('click', () => {
    if (!validateInputs()) {
        return;
    }

    sessionStorage.clear();

    // Store session information in sessionStorage for access in other pages
    sessionStorage.setItem('sessionCode', roomNameInput.value);  // HOST
    sessionStorage.setItem('userName', userNameInput.value);
    sessionStorage.setItem('peerId', peer.id);                   // EU
    sessionStorage.setItem('isHost', 'false');

    // Redirect to chat room page
    window.location.href = 'session.html';
});

// Initialize PeerJS on page load
initializePeer();
