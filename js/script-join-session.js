document.getElementById('back-button').addEventListener('click', () => {
    window.location.href = 'index.html';
});

let peer;
const status = document.getElementById('status');
const roomNameInput = document.getElementById('session-code-field');
const userNameInput = document.getElementById('name-field');
const joinBtn = document.getElementById('join-button');

function initializePeer() {
    peer = new Peer({
        config: {
            iceServers: [
                {
                    urls: "stun:stun.relay.metered.ca:80",
                },
                {
                    urls: "turn:global.relay.metered.ca:80",
                    username: "c6b847e6b1529929d92031ed",
                    credential: "ax783OE1j1gGpLL5",
                },
                {
                    urls: "turn:global.relay.metered.ca:80?transport=tcp",
                    username: "c6b847e6b1529929d92031ed",
                    credential: "ax783OE1j1gGpLL5",
                },
                {
                    urls: "turn:global.relay.metered.ca:443",
                    username: "c6b847e6b1529929d92031ed",
                    credential: "ax783OE1j1gGpLL5",
                },
                {
                    urls: "turns:global.relay.metered.ca:443?transport=tcp",
                    username: "c6b847e6b1529929d92031ed",
                    credential: "ax783OE1j1gGpLL5",
                },
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

joinBtn.addEventListener('click', () => {
    const roomName = roomNameInput.value.trim();
    const userName = userNameInput.value.trim() || `User_${Math.random().toString(36).substr(2, 6)}`;

    if (!roomName) {
        status.textContent = 'Please enter a session code to join';
        status.classList.add('error');
        return;
    }

    // Store room info in sessionStorage
    sessionStorage.setItem('roomName', roomName);
    sessionStorage.setItem('userName', userName);
    sessionStorage.setItem('peerId', peer.id);
    sessionStorage.setItem('isHost', 'false');

    // Redirect to chat room
    window.location.href = 'test/chat-room.html'; // TODO CHANGE THE PATH
});

initializePeer();