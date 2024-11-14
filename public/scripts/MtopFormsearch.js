// Sidebar toggle for mobile
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
});

// Function to search for applicant and autofill form with renewal check
function searchApplicant() {
    const applicantNo = document.getElementById('searchApplicant').value;

    if (!applicantNo) {
        alert("Please enter an applicant number to search.");
        return;
    }

    fetch(`http://localhost:8000/searchApplicant/${applicantNo}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => { throw new Error(errorData.message); });
            }
            return response.json();
        })
        .then(data => {
            // Autofill the form with applicant data
            document.getElementById('applicationType').value = 'Renewal'; // Set application type to Renewal
            document.getElementById('applicantNo').value = data.applicant_no;
            document.getElementById('operatorName').value = data.operator_name;
            document.getElementById('operatorAddress').value = data.operator_address;
            document.getElementById('vehicleNameMake').value = data.vehicle_name_make;
            document.getElementById('engineNumber').value = data.engine_number;
            document.getElementById('chassisNo').value = data.chassis_no;
            document.getElementById('plateStickerNo').value = data.plate_sticker_no;
            document.getElementById('driverName').value = data.driver_name;
            document.getElementById('driverAddress').value = data.driver_address;
            document.getElementById('licenseNo').value = data.license_no;
            document.getElementById('applicationDate').value = data.application_date;
        })
        .catch(error => {
            console.error("Error searching for applicant:", error);
            alert(error.message); // Display error if renewal not allowed
        });
}

// Function to display success message
function showSuccessMessage() {
    const successMessage = document.getElementById("successMessage");
    successMessage.classList.remove("opacity-0", "pointer-events-none");
    successMessage.classList.add("opacity-100");

    // Hide message after 3 seconds
    setTimeout(() => {
        successMessage.classList.add("opacity-0");
        successMessage.classList.remove("opacity-100");
    }, 3000);
}

// Form submission handling with success message
document.querySelector("form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission
    const formData = new FormData(event.target);
    fetch("http://localhost:8000/submitMtopForm", {
        method: "POST",
        body: new URLSearchParams(formData),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => { throw new Error(errorData.message); });
        }
        return response.json();
    })
    .then(data => {
        console.log("Response from server:", data);
        event.target.reset(); // Clear the form after successful submission
        showSuccessMessage(); // Show success message
    })
    .catch(error => {
        console.error("Error submitting form:", error);
        alert(error.message); // Display error message
    });
});

// Function to clear form inputs
function clearForm() {
    const form = document.querySelector("form");
    form.reset();
}

// Logout Confirmation Modal Logic
const logoutButton = document.getElementById('logoutButton');
const logoutModal = document.getElementById('logoutModal');
const cancelLogout = document.getElementById('cancelLogout');
const confirmLogout = document.getElementById('confirmLogout');

logoutButton.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent direct logout
    logoutModal.classList.remove('hidden'); // Show modal
});

cancelLogout.addEventListener('click', () => {
    logoutModal.classList.add('hidden'); // Hide modal
});

confirmLogout.addEventListener('click', () => {
    window.location.href = 'login.html'; // Redirect to login.html on confirm
});
