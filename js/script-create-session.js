// Redirect to the index page when the "go back" button is clicked
document.getElementById('back-button').addEventListener('click', () => {
    window.location.href = 'index.html';
});

let peer; // Initialize peer connection variable
const status = document.getElementById('status');
const createBtn = document.getElementById('create-session-button');
const errorMessage = document.getElementById('error-message');
const userNameInput = document.getElementById('name-field');
const studyTimeInput = document.getElementById('study-time-field');

// Initialize PeerJS with server configurations
function initializePeer() {
    peer = new Peer({
        config: {
            iceServers: [
                { urls: "stun:stun.relay.metered.ca:80" },
                { urls: "turn:global.relay.metered.ca:80", username: "c6b847e6b1529929d92031ed", credential: "ax783OE1j1gGpLL5" },
                { urls: "turn:global.relay.metered.ca:80?transport=tcp", username: "c6b847e6b1529929d92031ed", credential: "ax783OE1j1gGpLL5" },
                { urls: "turn:global.relay.metered.ca:443", username: "c6b847e6b1529929d92031ed", credential: "ax783OE1j1gGpLL5" },
                { urls: "turns:global.relay.metered.ca:443?transport=tcp", username: "c6b847e6b1529929d92031ed", credential: "ax783OE1j1gGpLL5" }
            ],
        }
    });

    // Event listener for successful PeerJS connection
    peer.on('open', (id) => {
        status.textContent = 'Connected to server';
        status.classList.remove('error');
        createBtn.disabled = false;
    });

    // Error handling for PeerJS
    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        status.textContent = `Error: ${err.type} - ${err.message}`;
        status.classList.add('error');
    });
}

// Validate form inputs for required fields and correct values
function validateInputs() {
    // Check required fields
    if (!userNameInput.value.trim()) {
        errorMessage.textContent = 'Please fill the required fields';
        errorMessage.style.display = 'block';
        return false;
    }

    // Ensure study and break times are at least 1 minutes
    if (studyTimeInput.value && (parseInt(studyTimeInput.value) < 1 || isNaN(parseInt(studyTimeInput.value)))) {
        errorMessage.textContent = 'Study times must be at least 1 minute and numeric.';
        errorMessage.style.display = 'block';
        return false;
    }

    // Hide error message if all validations pass
    errorMessage.style.display = 'none';
    return true;
}

// Handle session creation button click
createBtn.addEventListener('click', () => {
    if (!validateInputs()) return; // Abort if validation fails

    // Save study and break times to local storage (default values if not provided)
    sessionStorage.setItem('studyTime', studyTimeInput.value ? studyTimeInput.value : 25);

    // Generate unique room name and user name if not provided
    const roomName = `Room_${Math.random().toString(36).substr(2, 6)}`;
    const userName = userNameInput.value.trim() || `User_${Math.random().toString(36).substr(2, 6)}`;

    // Store session data in session storage
    sessionStorage.setItem('sessionTime', new Date().toString());
    sessionStorage.setItem('roomName', roomName);
    sessionStorage.setItem('userName', userName);
    sessionStorage.setItem('peerId', peer.id);
    sessionStorage.setItem('isHost', 'true');

    // Redirect to chat room
    window.location.href = 'session.html';
});

// Start peer initialization
initializePeer();
