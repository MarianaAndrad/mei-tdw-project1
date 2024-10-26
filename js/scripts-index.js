// Adicionar eventos aos botões através do Ids dos elementos e redirecionar para as páginas desejadas
document.getElementById('createSession').addEventListener('click', function() {
    window.location.href = 'create-session.html';
});

document.getElementById('joinSession').addEventListener('click', function() {
    window.location.href = 'join-session.html';
});

document.getElementById('rules').addEventListener('click', function() {
    window.location.href = 'rules.html';
});