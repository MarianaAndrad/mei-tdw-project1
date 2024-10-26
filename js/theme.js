// Event listener to toggle theme on icon click
document.getElementById('icon-theme').addEventListener('click', toggleTheme);

// Initialize the theme based on saved data or default to light mode
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';  // Retrieve saved theme, default to 'light' if not set
    const body = document.body;
    const icon = document.getElementById("icon-theme");

    // Set the body's theme and icon appearance based on the saved theme
    body.setAttribute("data-theme", savedTheme);
    icon.className = savedTheme === "light" ? "fa-regular fa-sun theme-icon" : "fa-regular fa-moon theme-icon";
}

// Toggle between light and dark themes and save preference to localStorage
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById("icon-theme");
    const currentTheme = body.getAttribute("data-theme");

    const newTheme = currentTheme === "light" ? "dark" : "light";
    body.setAttribute("data-theme", newTheme);

    icon.className = newTheme === "light" ? "fa-regular fa-sun theme-icon" : "fa-regular fa-moon theme-icon";

    localStorage.setItem('theme', newTheme);
}

// Initialize theme on page load
initializeTheme();
