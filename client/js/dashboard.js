function loadDashboard() {
    if (window.currentUser) {
        const usernameEl = document.getElementById('username');
        if (usernameEl) {
            usernameEl.innerText = window.currentUser.name;
        }
    }
}

window.addEventListener('auth-ready', loadDashboard);
// Just in case it fired before this script executed
if (window.currentUser) loadDashboard();
