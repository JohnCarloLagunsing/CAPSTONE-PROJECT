// Sidebar toggle for mobile
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
});

// Utility function to display styled messages
function showMessage(type, text) {
    const messageBox = document.createElement('div');
    messageBox.className = `fixed top-5 right-5 px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    messageBox.innerText = text;

    document.body.appendChild(messageBox);

    setTimeout(() => {
        messageBox.remove();
    }, 3000);
}

// Function to search for an applicant and autofill the form
function searchApplicant() {
    const applicantNo = document.getElementById('searchApplicant').value;

    if (!applicantNo) {
        showMessage('error', 'Please enter an applicant number to search.');
        return;
    }

    fetch(`https://lcapstone-project-six-psi.vercel.app/searchApplicant/${applicantNo}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => { throw new Error(errorData.message); });
            }
            return response.json();
        })
        .then(data => {
            // Autofill the form with applicant data
            document.getElementById('applicationType').value = 'Renewal';
            document.getElementById('applicantNo').value = data.data.applicant_no;
            document.getElementById('operatorName').value = data.data.operator_name;
            document.getElementById('operatorAddress').value = data.data.operator_address;
            document.getElementById('vehicleNameMake').value = data.data.vehicle_name_make;
            document.getElementById('engineNumber').value = data.data.engine_number;
            document.getElementById('chassisNo').value = data.data.chassis_no;
            document.getElementById('plateStickerNo').value = data.data.plate_sticker_no;
            document.getElementById('driverName').value = data.data.driver_name;
            document.getElementById('driverAddress').value = data.data.driver_address;
            document.getElementById('licenseNo').value = data.data.license_no;
            document.getElementById('applicationDate').value = data.data.application_date;

            showMessage('success', 'Applicant data retrieved successfully.');
        })
        .catch(error => {
            console.error('Error searching for applicant:', error);
            showMessage('error', error.message);
        });
}

// Form submission handling
document.querySelector("form").addEventListener("submit", function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    fetch("https://capstone-project-six-psi.vercel.app/submitMtopForm", {
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
        event.target.reset();
        showMessage('success', 'Submission Successful!');
    })
    .catch(error => {
        console.error('Error submitting form:', error);
        showMessage('error', error.message);
    });
});

// Function to clear form inputs
function clearForm() {
    document.querySelector("form").reset();
    showMessage('success', 'Form cleared successfully!');
}

// Logout confirmation modal logic
const logoutButton = document.getElementById('logoutButton');
const logoutModal = document.getElementById('logoutModal');
const cancelLogout = document.getElementById('cancelLogout');
const confirmLogout = document.getElementById('confirmLogout');

logoutButton.addEventListener('click', (event) => {
    event.preventDefault();
    logoutModal.classList.remove('hidden');
});

cancelLogout.addEventListener('click', () => {
    logoutModal.classList.add('hidden');
});

confirmLogout.addEventListener('click', () => {
    window.location.href = 'login.html';
});
