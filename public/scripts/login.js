document.addEventListener("DOMContentLoaded", function () {
    const passwordInput = document.getElementById('password');
    const togglePasswordIcon = document.getElementById('toggleIcon');
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
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');

        // Toggle the icon class
        togglePasswordIcon.classList.toggle('fa-eye', !isPassword);
        togglePasswordIcon.classList.toggle('fa-eye-slash', isPassword);
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
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
});



router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Get user from DB
  const user = await db.query('SELECT * FROM headadmin WHERE email = $1', [email]);

  if (user.rows.length === 0) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Compare entered password with stored hash
  const isMatch = await bcrypt.compare(password, user.rows[0].password);

  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  res.json({ message: 'Login successful' });
});
