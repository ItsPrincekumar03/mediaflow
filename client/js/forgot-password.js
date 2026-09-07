document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgot-password-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const msgEl = document.getElementById('forgot-msg');
            
            try {
                const res = await window.api.forgotPassword(email);
                msgEl.innerText = res.message;
                msgEl.style.color = 'green';
            } catch (err) {
                msgEl.innerText = err.message || 'An error occurred';
                msgEl.style.color = 'red';
            }
        });
    }
});
