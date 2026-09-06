document.addEventListener('DOMContentLoaded', async () => {
    const protectedPages = ['/dashboard.html', '/profile.html'];
    const authPages = ['/login.html', '/register.html'];
    
    const currentPath = window.location.pathname;

    try {
        const session = await window.api.getSession();
        
        if (session.data.authenticated) {
            window.currentUser = session.data.user;
            if (authPages.includes(currentPath) || currentPath === '/' || currentPath === '/index.html') {
                window.location.href = '/dashboard.html';
            }
            setupLogout();
        } else {
            if (protectedPages.includes(currentPath)) {
                window.location.href = '/login.html';
            }
        }
    } catch (e) {
        if (protectedPages.includes(currentPath)) {
            window.location.href = '/login.html';
        }
    }
});

function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await window.api.logout();
            window.location.href = '/login.html';
        });
    }
}
