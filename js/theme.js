document.getElementById('icon-theme').addEventListener('click', function() {
    toggleTheme();
});

// Função para inicializar o tema da página (light/dark) a partir da informação guardada no localStorage
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const body = document.body;
    const icon = document.getElementById("icon-theme");

    body.setAttribute("data-theme", savedTheme);
    icon.className = savedTheme === "light" ? "fa-regular fa-sun theme-icon" : "fa-regular fa-moon theme-icon";
}

// Função para alternar o tema da página (light/dark) e guardar a informação no localStorage
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById("icon-theme");
    const currentTheme = body.getAttribute("data-theme");

    const newTheme = currentTheme === "light" ? "dark" : "light";
    body.setAttribute("data-theme", newTheme);
    icon.className = newTheme === "light" ? "fa-regular fa-sun theme-icon" : "fa-regular fa-moon theme-icon";

    localStorage.setItem('theme', newTheme);  // Guarda o tema atual no localStorage
}

// Inicializa o tema da página
initializeTheme();