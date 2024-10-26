// Get session info
const sessionCode = sessionStorage.getItem('sessionCode');
const userName = sessionStorage.getItem('userName');
let studyTime = sessionStorage.getItem('studyTime') ?? null;
let breakTime = sessionStorage.getItem('breakTime') ?? null;
const isHost = sessionStorage.getItem('isHost') === 'true';
let peer;
let connections = new Map();
let hostId = null;

// DOM Elements
const status = document.getElementById('status');  // TODO
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const leaveBtn = document.getElementById('leaveBtn');
const participantList = document.getElementById('participantList');
const peerIdDisplay = document.getElementById('peerIdDisplay');
const copyPeerIdButton = document.getElementById('copyPeerIdButton');

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

    // Add copy peer ID button functionality
    copyPeerIdButton.addEventListener('click', () => {
        const peerId = sessionStorage.getItem('peerId');
        if (peerId) {
            navigator.clipboard.writeText(peerId).then(() => {
                copyPeerIdButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyPeerIdButton.textContent = 'Copy Peer ID';
                }, 2000);
            });
        }
    });

    peer.on('open', (id) => {
        // Display and store the peer ID
        peerIdDisplay.textContent = id;

        if (isHost) {
            hostId = id;
            status.textContent = 'Room created. Waiting for participants...';
            enableChat();
        } else {
            connectToHost(sessionCode);
        }
    });

    peer.on('connection', handleIncomingConnection);

    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        status.textContent = `Error: ${err.type} - ${err.message}`;
        status.classList.add('error');
    });
}

function connectToHost(hostPeerId) {
    const conn = peer.connect(hostPeerId, {
        reliable: true,
        metadata: {userName: userName}
    });

    connections.set(hostPeerId, {
        conn: conn,
        userName: 'Host',
        isHost: true
    });

    setupConnectionHandlers(conn);
    hostId = hostPeerId;
}

function handleIncomingConnection(conn) {
    const peerId = conn.peer;
    connections.set(peerId, {
        conn: conn,
        userName: conn.metadata?.userName || `User_${peerId.slice(0, 5)}`
    });
    setupConnectionHandlers(conn);

    // If host, broadcast current participant list
    if (isHost) {
        broadcastParticipants();
    }
}

function setupConnectionHandlers(conn) {
    conn.on('open', () => {
        if (!isHost) {
            enableChat();
        }

        // Send initial info
        conn.send({
            type: 'user-info',
            userName: userName,
            isHost: isHost,
            studyTime: studyTime,
            breakTime: breakTime
        });

        updateParticipantList();
    });

    conn.on('data', (data) => {
        handleMessage(conn.peer, data);
    });

    conn.on('close', () => {
        const participant = connections.get(conn.peer);
        if (participant) {
            appendMessage(`${participant.userName} left the room`, 'system');
            connections.delete(conn.peer);
            updateParticipantList();
        }
    });
}

function handleMessage(peerId, data) {
    switch (data.type) {
        case 'chat':
            appendMessage(data.message, 'received', data.userName);
            // If host, relay the message to all other peers
            if (isHost) {
                connections.forEach(({conn}, connPeerId) => {
                    if (conn && conn.open && connPeerId !== peerId) {
                        conn.send(data);
                    }
                });
            }
            break;
        case 'user-info':
            const peerConn = connections.get(peerId);
            if (peerConn) {
                connections.set(peerId, {
                    ...peerConn,
                    userName: data.userName,
                    isHost: data.isHost
                });
            } else {
                studyTime = data.studyTime;
                breakTime = data.breakTime;

                sessionStorage.setItem("studyTime", studyTime);
                sessionStorage.setItem("breakTime", breakTime);
            }

            appendMessage(`${data.userName} joined the room`, 'system');
            updateParticipantList();
            // If host, broadcast updated participant list
            if (isHost) {
                broadcastParticipants();
            }
            break;
        case 'participants':
            if (!isHost) {
                data.participants.forEach(p => {
                    if (p.peerId !== peer.id) {
                        connections.set(p.peerId, {
                            userName: p.userName,
                            isHost: p.isHost
                        });
                    }
                });
                updateParticipantList();
            }
            break;
    }
}

function broadcastMessage(message) {
    const messageData = {
        type: 'chat',
        message: message,
        userName: userName
    };

    if (isHost) {
        // If host, broadcast to all connections
        connections.forEach(({conn}) => {
            if (conn && conn.open) {
                conn.send(messageData);
            }
        });
    } else {
        // If not host, send only to the host
        const hostConn = connections.get(hostId)?.conn;
        if (hostConn && hostConn.open) {
            hostConn.send(messageData);
        }
    }
}

function broadcastParticipants() {
    const participants = Array.from(connections.entries()).map(([peerId, data]) => ({
        peerId,
        userName: data.userName,
        isHost: data.isHost
    }));

    const participantsData = {
        type: 'participants',
        participants: participants
    };

    connections.forEach(({conn}) => {
        if (conn && conn.open) {
            conn.send(participantsData);
        }
    });
}

function updateParticipantList() {
    participantList.innerHTML = '';

    // Add yourself
    const selfParticipant = document.createElement('div');
    selfParticipant.classList.add('participant', 'you');
    if (isHost) selfParticipant.classList.add('host');
    selfParticipant.textContent = `${userName} (You)`;
    participantList.appendChild(selfParticipant);

    // Add other participants
    connections.forEach((data, peerId) => {
        const participant = document.createElement('div');
        participant.classList.add('participant');
        if (data.isHost) participant.classList.add('host');
        participant.textContent = data.userName;
        participantList.appendChild(participant);
    });
}

function enableChat() {
    messageInput.disabled = false;
    sendBtn.disabled = false;
    status.textContent = 'Connected to room';
    status.classList.remove('error');
}

function appendMessage(message, type, sender = null) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);

    if (sender) {
        const header = document.createElement('div');
        header.classList.add('header');
        header.textContent = sender;
        messageElement.appendChild(header);
    }

    const content = document.createElement('div');
    content.textContent = message;
    messageElement.appendChild(content);

    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
}

// Event Listeners
sendBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        broadcastMessage(message);
        appendMessage(message, 'sent', userName);
        messageInput.value = '';
    }
});

messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendBtn.click();
    }
});

leaveBtn.addEventListener('click', () => {
    connections.forEach(({conn}) => conn && conn.close());
    if (peer && !peer.destroyed) {
        peer.destroy();
    }
    window.location.href = 'index.html';
});

// Initialize
if (((!isHost && !sessionCode) || !userName) || (isHost && !userName)) {
    window.location.href = 'index.html';
} else {
    initializePeer();
}

// Cleanup
window.onunload = window.onbeforeunload = () => {
    connections.forEach(({conn}) => conn && conn.close());
    if (peer && !peer.destroyed) {
        peer.destroy();
    }
};