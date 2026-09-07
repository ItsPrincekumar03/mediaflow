document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const msgEl = document.getElementById('reset-msg');
    
    if (!token) {
        msgEl.innerText = 'No reset token provided. Invalid link.';
        msgEl.style.color = 'red';
        return;
    }
    
    const form = document.getElementById('reset-password-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('password').value;
            
            try {
                const res = await window.api.resetPassword(token, newPassword);
                msgEl.innerText = res.message + '. Redirecting to login...';
                msgEl.style.color = 'green';
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            } catch (err) {
                msgEl.innerText = err.message || 'An error occurred';
                msgEl.style.color = 'red';
            }
        });
    }
});
