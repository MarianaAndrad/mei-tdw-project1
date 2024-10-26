// Get session info
const sessionCode = sessionStorage.getItem('sessionCode');
const userName = sessionStorage.getItem('userName');
let studyTime = sessionStorage.getItem('studyTime') ?? null;
let breakTime = sessionStorage.getItem('breakTime') ?? null;
let sessionTime = sessionStorage.getItem('sessionTime') ?? null;
const isHost = sessionStorage.getItem('isHost') === 'true';
let peer;
let connections = new Map();
let hostId = null;
let clockInterval;
let restartsReceived = 0;
let finished = false


// DOM Elements
const status = document.getElementById('status');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const leaveBtn = document.getElementById('leaveBtn');
const participantList = document.getElementById('participantList');
const peerIdDisplay = document.getElementById('peerIdDisplay');
const copyPeerIdButton = document.getElementById('copyPeerIdButton');
const scoreElement = document.getElementById('score');

const modal = {
    element: document.getElementById('myModal'),

    show(options = {}) {
        const {
            title = 'Modal Title',
            content = '',
            onConfirm = () => {},
            confirmText = 'Confirm',
        } = options;

        // Set modal content
        this.element.querySelector('.modal-title').textContent = title;
        this.element.querySelector('.modal-body').innerHTML = content;

        // Set button text
        const confirmBtn = this.element.querySelector('.modal-button.primary');
        confirmBtn.textContent = confirmText;

        // Set up event handlers
        const closeModal = () => {
            this.hide();
        };

        const handleConfirm = () => {
            onConfirm();
            this.hide();
        };

        // Remove existing event listeners
        confirmBtn.replaceWith(confirmBtn.cloneNode(true));
        this.element.querySelector('.modal-close').replaceWith(
            this.element.querySelector('.modal-close').cloneNode(true)
        );

        // Add new event listeners
        this.element.querySelector('.modal-close').addEventListener('click', closeModal);
        this.element.querySelector('.modal-button.primary').addEventListener('click', handleConfirm);

        // Show modal
        this.element.classList.add('active');
    },

    hide() {
        this.element.classList.remove('active');
    }
};

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
        const peerId = peer.id;
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
            sessionTime: sessionTime,
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

function chronometer() {
    clockInterval = setInterval(() => {
        const start = new Date(sessionTime);
        const offset = studyTime * 60 * 1000; // Convert minutes to milliseconds

        const diff = (start.getTime() + offset) - Date.now();
        const final = new Date(diff);

        const hrs = String(final.getUTCHours()).padStart(2, '0');
        const min = String(final.getUTCMinutes()).padStart(2, '0');
        const sec = String(final.getUTCSeconds()).padStart(2, '0');

        document.getElementById('hrs').textContent = hrs;
        document.getElementById('min').textContent = min;
        document.getElementById('sec').textContent = sec;

        if (hrs === min && min === sec && sec === '00') {
            clearInterval(clockInterval);
            success = false;
            while (!success) {
                modal.show({
                    title: 'Trivia Time!',
                    content: 'Ready to start the game?',
                    confirmText: 'Start Game',
                    onConfirm: () => {
                        // This will fetch questions and start the game
                        fetch('https://trivia-questions-api.p.rapidapi.com/triviaApi', {
                            headers: {
                                'x-rapidapi-host': 'trivia-questions-api.p.rapidapi.com',
                                'x-rapidapi-key': '202be8871dmsh5ca38612327dcb4p195af3jsn5be5e34f2ef6'
                            }
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (!data.triviaQuestions) {
                                    alert("Too many requests! Try again later");
                                }

                                success = true;
                                createTriviaGame(data.triviaQuestions);
                            });
                    }
                }
            });
        }
    }, 500)
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
        case 'restart':
            restartsReceived += 1;
            if (restartsReceived === connections.size && finished === true) {
                sessionTime = new Date();
                chronometer();
                restartsReceived = 0;
                finished = false;
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
            }

            if (!studyTime) {
                studyTime = data.studyTime;
                breakTime = data.breakTime;
                sessionTime = data.sessionTime;
                chronometer();
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

function broadcastRestart() {
    const participants = Array.from(connections.entries()).map(([peerId, data]) => ({
        peerId,
        userName: data.userName,
        isHost: data.isHost
    }));

    const data = {
        type: 'restart',
        participants: participants
    };

    connections.forEach(({conn}) => {
        if (conn && conn.open) {
            conn.send(data);
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

function createTriviaGame(questions) {
    let currentQuestion = 0;
    let score = 0;

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function showQuestion() {
        if (currentQuestion >= questions.length) {
            const oldScores = localStorage.getItem("scores") || '[]';
            localStorage.setItem("scores", JSON.stringify([
                ...JSON.parse(oldScores),
                {
                    at: new Date(),
                    score: score
                }
            ]))
            scoreElement.innerText = score;
            finished = true;
            broadcastRestart();

            // Game over
            modal.show({
                title: 'Game Over!',
                content: `
                    <div class="text-center">
                        <h2>Final Score: ${score}/${questions.length}</h2>
                        <p>Thanks for playing!</p>
                    </div>
                `,
            });

            if (restartsReceived === connections.size) {
                sessionTime = new Date();
                chronometer();
                restartsReceived = 0;
                finished = false;
            }
            return;
        }

        const question = questions[currentQuestion];
        const allAnswers = [question.correct_answer, ...question.incorrect_answers];
        const shuffledAnswers = shuffleArray([...allAnswers]);
        console.log(shuffledAnswers)

        modal.show({
            title: `Question ${currentQuestion + 1} of ${questions.length}`,
            content: `
                <div class="trivia-container">
                    <div class="category">${question.category}</div>
                    <div class="difficulty">Difficulty: ${question.difficulty}</div>
                    <div class="question">${question.question}</div>
                    <div class="answers">
                        ${shuffledAnswers.map((answer, ix) => `
                            <button class="answer-btn modal-button secondary" data-answer="${ix}">
                                ${answer}
                            </button>
                        `).join('')}
                    </div>
                    <div class="score">Score: ${score}/${questions.length}</div>
                </div>
            `,
            showCancel: false,
            confirmText: 'Skip Question',
            onConfirm: () => {
                setTimeout(() => {
                    currentQuestion++;
                    showQuestion();
                }, 0);
            }
        });

        // Add click handlers for answer buttons
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedAnswer = btn.dataset.answer;
                const isCorrect = parseInt(selectedAnswer) === shuffledAnswers.indexOf(question.correct_answer);

                if (isCorrect) {
                    score++;
                    btn.style.backgroundColor = '#4CAF50';
                } else {
                    btn.style.backgroundColor = '#f44336';
                    const ix = shuffledAnswers.indexOf(question.correct_answer);
                    document.querySelector(`[data-answer="${ix}"]`)
                        .style.backgroundColor = '#4CAF50';
                }

                // Disable all buttons
                document.querySelectorAll('.answer-btn').forEach(b => {
                    b.disabled = true;
                });

                // Show next question after delay
                setTimeout(() => {
                    currentQuestion++;
                    showQuestion();
                }, 1500);
            });
        });
    }

    // Add some styles for the trivia game
    const style = document.createElement('style');
    style.textContent = `
        .trivia-container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .category {
            font-weight: bold;
            color: var(--primary-color);
        }

        .difficulty {
            font-size: 0.9em;
            color: var(--text-color);
            opacity: 0.8;
        }

        .question {
            font-size: 1.2em;
            margin: 1rem 0;
        }

        .answers {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .answer-btn {
            width: 100%;
            text-align: left;
            padding: 0.75rem 1rem;
            transition: all 0.3s;
        }

        .answer-btn:hover:not(:disabled) {
            transform: translateX(5px);
        }

        .score {
            text-align: center;
            font-weight: bold;
            margin-top: 1rem;
        }
    `;
    document.head.appendChild(style);

    // Start the game
    showQuestion();
}

// Cleanup
window.onunload = window.onbeforeunload = () => {
    connections.forEach(({conn}) => conn && conn.close());
    if (peer && !peer.destroyed) {
        peer.destroy();
    }
    clearInterval(clockInterval);
};

// Initialize
if (((!isHost && !sessionCode) || !userName) || (isHost && !userName)) {
    window.location.href = 'index.html';
} else {
    initializePeer();
}

if (isHost) {
    chronometer();
}
