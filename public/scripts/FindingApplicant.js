// Utility function to show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageSpan = document.getElementById('notification-message');

    // Set the notification style based on type
    notification.className = `fixed top-4 right-4 bg-${type === 'success' ? 'green' : 'red'}-500 text-white py-3 px-6 rounded-lg shadow-lg z-50 transition duration-300 ease-in-out`;
    messageSpan.textContent = message;

    // Show the notification
    notification.classList.remove('hidden');

    // Automatically hide the notification after 5 seconds
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}

// Event listener to close the notification manually
document.getElementById('close-notification').addEventListener('click', () => {
    document.getElementById('notification').classList.add('hidden');
});

// Function to calculate the total based on units
function calculateTotal() {
    const baseTotal = 581.00; // Base total value
    const unitsInput = document.getElementById('units');
    const totalInput = document.getElementById('total');
    const changeInput = document.getElementById('change');
    const amountInput = document.getElementById('amount');
    
    const units = parseInt(unitsInput.value) || 1; // Default to 1 if invalid
    const totalValue = (baseTotal * units).toFixed(2); // Multiply base total by units
    totalInput.value = `₱${totalValue}`; // Update total field
    
    // Clear amount and change fields if units are changed
    amountInput.value = '';
    changeInput.value = '₱0.00';
}

// Function to calculate the change based on the entered amount
function calculateChange() {
    const totalInput = document.getElementById('total');
    const amountInput = document.getElementById('amount');
    const changeInput = document.getElementById('change');
    
    const totalValue = parseFloat(totalInput.value.replace('₱', '')) || 0;
    const enteredAmount = parseFloat(amountInput.value) || 0;

    if (enteredAmount >= totalValue) {
        const changeValue = (enteredAmount - totalValue).toFixed(2);
        changeInput.value = `₱${changeValue}`;
    } else {
        changeInput.value = '₱0.00'; // Reset change if amount is less than total
    }
}

// Fetch applicant details
async function fetchApplicantDetails() {
    const applicantNo = document.getElementById('search-id').value.trim(); // Get the Applicant No.

    // Validate input
    if (!applicantNo) {
        showNotification('⚠️ Please enter a valid Applicant No. to search.', 'error');
        return;
    }

    try {
        // Fetch data from the backend
        const response = await fetch(`http://localhost:8000/applicant/getApplicantByNo/${applicantNo}`);

        if (response.ok) {
            const data = await response.json(); // Parse the JSON response

            // Populate the input fields with the data
            document.getElementById('id').value = data.applicant_no || '';
            document.getElementById('name').value = data.operator_name || '';
            document.getElementById('address').value = data.operator_address || '';

            showNotification('✅ Applicant found! Details loaded successfully.');
        } else {
            const errorData = await response.json();
            showNotification(errorData.message || 'Unable to find the applicant. Please try again.', 'error');

            // Clear fields if no data found
            document.getElementById('id').value = '';
            document.getElementById('name').value = '';
            document.getElementById('address').value = '';
        }
    } catch (error) {
        console.error('Error fetching applicant details:', error);
        showNotification('🚨 An unexpected error occurred while retrieving applicant details. Please try again later.', 'error');
    }
}

// Attach event listeners
document.getElementById('searchButton').addEventListener('click', fetchApplicantDetails);
document.getElementById('units').addEventListener('input', calculateTotal);
document.getElementById('amount').addEventListener('input', calculateChange);

// Sidebar toggle logic
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
});
