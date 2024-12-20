// Update statistics when localStorage changes
window.addEventListener('storage', function(e) {
    if (e.key === 'scores') {
        updateStats();
    }
});

// Navigate back to the index page
document.getElementById('back-button').addEventListener('click', () => {
    window.location.href = 'index.html';
});


// Load scores from localStorage
function getScores() {
    const scoresJson = localStorage.getItem("scores") || '[]';
    return JSON.parse(scoresJson);
}

// Calculate statistics
function calculateStats(scores) {
    if (scores.length === 0) {
        return {
            total: 0,
            average: 0,
            highest: 0,
            lowest: 0
        };
    }

    const scoreValues = scores.map(s => s.score);
    return {
        total: scores.length,
        average: (scoreValues.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
        highest: Math.max(...scoreValues),
        lowest: Math.min(...scoreValues)
    };
}

// Update statistics display
function updateStats() {
    const scores = getScores();
    const stats = calculateStats(scores);

    // Update the UI with calculated statistics
    document.getElementById('totalGames').textContent = stats.total;
    document.getElementById('avgScore').textContent = stats.average;
    document.getElementById('highScore').textContent = stats.highest;
    document.getElementById('lowScore').textContent = stats.lowest;

    // Update the score history table
    updateTable(scores);
}

// Update score history table
function updateTable(scores) {
    const tbody = document.getElementById('scoreHistory');
    tbody.innerHTML = '';

    // Sort scores by date, newest first
    const sortedScores = [...scores].sort((a, b) => new Date(b.at) - new Date(a.at));

    // Display the last 10 scores
    sortedScores.slice(0, 10).forEach(score => {
        const row = document.createElement('tr');
        const date = new Date(score.at);

        // Populate the row with date and score
        row.innerHTML = `
            <td>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</td>
            <td>${score.score}</td>
        `;

        tbody.appendChild(row);
    });
}

updateStats();
