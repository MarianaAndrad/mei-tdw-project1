// Add click events to buttons by their element IDs and redirect to the specified pages

document.getElementById('createSession').addEventListener('click', function() {
    window.location.href = 'create-session.html';
});

document.getElementById('joinSession').addEventListener('click', function() {
    window.location.href = 'join-session.html';
});

document.getElementById('about').addEventListener('click', function() {
    window.location.href = 'about.html';
});

document.getElementById('stats').addEventListener('click', function() {
    window.location.href = 'stats.html';
});

