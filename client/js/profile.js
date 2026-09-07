function loadProfile() {
    if (window.currentUser) {
        const nameInput = document.getElementById('name');
        if (nameInput) {
            nameInput.value = window.currentUser.name;
        }
    }
}

window.addEventListener('auth-ready', loadProfile);
if (window.currentUser) loadProfile();

window.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const msgEl = document.getElementById('profile-msg');
            try {
                await window.api.updateProfile({ name });
                msgEl.innerText = 'Profile updated';
                msgEl.style.color = 'green';
            } catch (err) {
                msgEl.innerText = err.message;
                msgEl.style.color = 'red';
            }
        });
    }

    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const msgEl = document.getElementById('password-msg');
            try {
                await window.api.changePassword(currentPassword, newPassword);
                msgEl.innerText = 'Password changed successfully';
                msgEl.style.color = 'green';
                passwordForm.reset();
            } catch (err) {
                msgEl.innerText = err.message;
                msgEl.style.color = 'red';
            }
        });
    }
});
