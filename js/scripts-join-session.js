
document.querySelector('#back-button').addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.querySelector('#join-button').addEventListener('click', () => {
const nameField = document.querySelector('#name-field').value.trim();
const sessionCodeField = document.querySelector('#session-code-field').value.trim();
const errorMessage = document.querySelector('#error-message');

    if (!nameField || !sessionCodeField) {
    errorMessage.style.display = 'block';
} else {
    errorMessage.style.display = 'none';
    alert('Joining session...');
}
});