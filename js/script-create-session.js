document.getElementById('back-button').addEventListener('click', () => {
    window.location.href = 'index.html';
});

let peer;
const status = document.getElementById('status');
const createBtn = document.getElementById('create-session-button');
const errorMessage = document.getElementById('error-message');
const userNameInput = document.getElementById('name-field');
const studyTimeInput = document.getElementById('study-time-field');
const breakTimeInput = document.getElementById('break-time-field');
const sessionEndInput = document.getElementById('session-end-field');

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

    peer.on('open', (id) => {
        status.textContent = 'Connected to server';
        status.classList.remove('error');
        createBtn.disabled = false;
    });

    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        status.textContent = `Error: ${err.type} - ${err.message}`;
        status.classList.add('error');
    });
}

function validateInputs() {
    if (!userNameInput.value.trim() || !sessionEndInput.value) {
        errorMessage.textContent = 'Please fill the required fields';
        errorMessage.style.display = 'block';
        return false;
    }

    const sessionEndTime = new Date(sessionEndInput.value);
    const currentTime = new Date();

    if (sessionEndTime <= currentTime) {
        errorMessage.textContent = 'The end time of the session must be after the current time';
        errorMessage.style.display = 'block';
        return false;
    }

    if (studyTimeInput.value && breakTimeInput.value && (studyTimeInput.value < 5 || breakTimeInput.value < 5)) {
        errorMessage.textContent = 'Study and Break times must be at least 5 minutes';
        errorMessage.style.display = 'block';
        return false;
    }

    errorMessage.style.display = 'none';
    return true;
}

createBtn.addEventListener('click', () => {
    if (!validateInputs()) return;

    localStorage.setItem('studyTime', studyTimeInput.value ? studyTimeInput.value : 25);
    localStorage.setItem('breakTime', breakTimeInput.value ? breakTimeInput.value : 5);
    localStorage.setItem('sessionEnd', sessionEndInput.value);

    const roomName =`Room_${Math.random().toString(36).substr(2, 6)}`;
    const userName = userNameInput.value.trim() || `User_${Math.random().toString(36).substr(2, 6)}`;

    sessionStorage.setItem('roomName', roomName);
    sessionStorage.setItem('userName', userName);
    sessionStorage.setItem('peerId', peer.id);
    sessionStorage.setItem('isHost', 'true');

    window.location.href = 'test/chat-room.html';
});

initializePeer();