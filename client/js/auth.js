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
            window.dispatchEvent(new Event('auth-ready'));
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

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('error-msg');
            
            try {
                errorMsg.style.color = 'green';
                errorMsg.innerText = 'Registering...';
                
                await window.api.register(name, email, password);
                
                errorMsg.style.color = 'green';
                errorMsg.innerText = 'Registration successful. Redirecting to login...';
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            } catch (err) {
                errorMsg.style.color = 'red';
                errorMsg.innerText = err.message || 'Registration failed';
            }
        });
    }
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                await window.api.login(email, password);
                window.location.href = '/dashboard.html';
            } catch (err) {
                document.getElementById('error-msg').innerText = err.message;
            }
        });
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
