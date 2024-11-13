function showAlert(message, isSuccess) {
  const alertBox = document.getElementById('successAlert');
  const alertMessage = document.getElementById('alertMessage');
  const alertIcon = document.getElementById('alertIcon');

  alertMessage.textContent = message;
  alertBox.classList.remove('hidden'); // Show alert box

  // Set the alert color and icon based on success or error
  if (isSuccess) {
    alertBox.classList.add('bg-green-500');
    alertBox.classList.remove('bg-red-500');
    alertIcon.innerHTML = '<i class="fas fa-check-circle"></i>'; // Success icon
  } else {
    alertBox.classList.add('bg-red-500');
    alertBox.classList.remove('bg-green-500');
    alertIcon.innerHTML = '<i class="fas fa-times-circle"></i>'; // Error icon
  }

  // Hide the alert after 3 seconds
  setTimeout(() => {
    alertBox.classList.add('hidden');
  }, 3000);
}

function submitForm(event) {
  event.preventDefault(); // Prevent default form submission
  const formData = new FormData(event.target);

  fetch('http://localhost:8000/signup_process', { // Replace with your Node.js endpoint
    method: 'POST',
    body: new URLSearchParams(formData).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(json => { throw new Error(json.message) });
    }
    return response.json();
  })
  .then(data => {
    console.log('Success:', data);
    showAlert(data.message, true); // Show success alert

    // Clear the form after 2 seconds
    setTimeout(() => {
      document.getElementById('signupForm').reset();
    }, 2000);
  })
  .catch(error => {
    console.error('Error:', error);
    showAlert('Signup failed: ' + error.message, false); // Show error alert
  });
}

// Password visibility toggle
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');

passwordInput.addEventListener('input', function () {
  togglePassword.style.display = this.value.length > 0 ? 'block' : 'none';
});

togglePassword.addEventListener('click', function () {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
  this.classList.toggle('fa-eye-slash'); // Toggle the eye / eye-slash icon
});
