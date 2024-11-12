const passwordInput = document.getElementById('passwordInput');
const togglePasswordIcon = document.getElementById('togglePasswordIcon');
const loadingOverlay = document.getElementById('loadingOverlay');
const alertContainer = document.getElementById('alert-container');

if (passwordInput && togglePasswordIcon) {
    passwordInput.addEventListener('input', () => {
        if (passwordInput.value) {
            togglePasswordIcon.classList.remove('hidden');
        } else {
            togglePasswordIcon.classList.add('hidden');
        }
    });

    togglePasswordIcon.addEventListener('click', togglePassword);
}

function togglePassword() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    // Toggle the icon
    togglePasswordIcon.innerHTML = type === 'password' ? '<i class="fa fa-eye"></i>' : '<i class="fa fa-eye-slash"></i>';
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const email = event.target.email.value;
        const password = event.target.password.value;

        // Clear any previous error messages
        if (alertContainer) alertContainer.innerHTML = '';
        if (loadingOverlay) loadingOverlay.style.display = 'none';

        try {
            // Show loading overlay only after form submission
            if (loadingOverlay) loadingOverlay.style.display = 'flex';

            // Send login request to the server
            const response = await fetch('/login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.status === 401) {
                // Show error message if login is incorrect
                if (alertContainer) alertContainer.innerHTML = `<div style="color: red; text-align: center;">${result.error}</div>`;
                if (loadingOverlay) loadingOverlay.style.display = 'none';
            } else if (response.ok) {
                // If login is successful, redirect
                window.location.href = '/Dashboard.html';
            } else {
                if (loadingOverlay) loadingOverlay.style.display = 'none';
            }
        } catch (error) {
            console.error("Login error:", error);
            if (alertContainer) alertContainer.innerHTML = `<div style="color: red; text-align: center;">An error occurred. Please try again later.</div>`;
            if (loadingOverlay) loadingOverlay.style.display = 'none';
        }
    });
}
