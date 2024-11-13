// Form Submission & Alerts
const loadingOverlay = document.getElementById('loadingOverlay');
document.getElementById("loginForm").addEventListener("submit", async function(event) {
  event.preventDefault();
  const formData = new FormData(this);
  const jsonData = Object.fromEntries(formData.entries());

  try {
    loadingOverlay.style.display = 'flex';
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonData)
    });

    loadingOverlay.style.display = 'none';

    const result = await response.json();

    if (response.ok) {
      // Redirect on success
      window.location.href = result.redirectUrl;
    } else {
      // Check for specific error messages in the response
      if (result.message.includes("Invalid email and password")) {
        showAlert("Incorrect email or password.", "error");
      } else if (result.message.includes("Invalid password")) {
        showAlert("Incorrect password.", "error");
      } else {
        showAlert(result.message, "error"); // General error fallback
      }
    }
  } catch (error) {
    showAlert("An error occurred. Please try again.", "error");
    loadingOverlay.style.display = 'none';
  }
});

// Function to display alert messages
function showAlert(message, type) {
  const alertContainer = document.getElementById("alert-container");
  alertContainer.innerHTML = `<div class="alert ${type}">${message}</div>`;
  setTimeout(() => {
    alertContainer.innerHTML = ""; // Clear the alert after a delay
  }, 3000);
}

// Toggle password visibility
const passwordInput = document.getElementById('password');
const togglePasswordIcon = document.getElementById('toggleIcon');

function togglePassword() {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);

  // Toggle the icon
  togglePasswordIcon.className = type === 'password' ? 'fa fa-eye text-gray-500' : 'fa fa-eye-slash text-gray-500';
}
