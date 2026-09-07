const API_BASE = '/api/v1';

async function fetchAPI(endpoint, options = {}) {
    options.credentials = 'include'; // For cookies
    options.headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (options.body && typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || 'Something went wrong');
    }

    return data;
}

window.api = {
    login: (email, password) => fetchAPI('/auth/login', { method: 'POST', body: { email, password } }),
    register: (name, email, password) => fetchAPI('/auth/register', { method: 'POST', body: { name, email, password } }),
    logout: () => fetchAPI('/auth/logout', { method: 'POST' }),
    getSession: () => fetchAPI('/auth/session'),
    getProfile: () => fetchAPI('/users/me'),
    updateProfile: (data) => fetchAPI('/users/me', { method: 'PATCH', body: data }),
    changePassword: (currentPassword, newPassword) => fetchAPI('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }),
    forgotPassword: (email) => fetchAPI('/auth/forgot-password', { method: 'POST', body: { email } }),
    resetPassword: (token, newPassword) => fetchAPI('/auth/reset-password', { method: 'POST', body: { token, newPassword } })
};
