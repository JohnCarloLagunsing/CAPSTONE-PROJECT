// Utility function to show notifications
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageSpan = document.getElementById('notification-message');

    // Set notification style based on type
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

// Function to calculate total dynamically based on units and specific fees
function calculateDynamicTotal() {
    const fees = {
        filling_fee: parseFloat(document.getElementById('filling-fee').value) || 0,
        business_permit_fee: parseFloat(document.getElementById('business-permit-fee').value) || 0,
        mtop_fee: parseFloat(document.getElementById('mtop-fee').value) || 0,
        pol_med_mayor_fee: parseFloat(document.getElementById('pol-med-mayor-fee').value) || 0,
        plate_number_fee: parseFloat(document.getElementById('plate-number-fee').value) || 0,
        inspection_fee: parseFloat(document.getElementById('inspection-fee').value) || 0,
        id_card_fee: parseFloat(document.getElementById('id-card-fee').value) || 0,
        sec_fee: parseFloat(document.getElementById('sec-fee').value) || 0,
        dst_fee: parseFloat(document.getElementById('dst-fee').value) || 0,
        supervision_fee: parseFloat(document.getElementById('supervision-fee').value) || 0,
        penalty_fee: parseFloat(document.getElementById('penalty-fee').value) || 0,
    };

    const units = parseInt(document.getElementById('units').value) || 1;

    // Calculate total based on specific fees multiplied by units
    const total =
        units *
            (fees.business_permit_fee +
                fees.mtop_fee +
                fees.plate_number_fee +
                fees.inspection_fee +
                fees.supervision_fee) +
        (fees.filling_fee +
            fees.pol_med_mayor_fee +
            fees.id_card_fee +
            fees.sec_fee +
            fees.dst_fee +
            fees.penalty_fee);

    document.getElementById('total').value = `₱${total.toFixed(2)}`;
}

// Function to calculate the change based on the entered amount
function calculateChange() {
    const totalValue = parseFloat(document.getElementById('total').value.replace('₱', '')) || 0;
    const enteredAmount = parseFloat(document.getElementById('amount').value) || 0;

    const changeValue = enteredAmount - totalValue;
    document.getElementById('change').value = `₱${Math.max(changeValue, 0).toFixed(2)}`;
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

// Submit payment details to the backend
async function submitPayment() {
    // Helper function to safely get the value of an element by ID
    const getValueById = (id) => {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`Element with ID '${id}' not found.`);
            return null;
        }
        return element.value.trim();
    };

    const applicant_no = getValueById('id');
    const operator_name = getValueById('name');
    const operator_address = getValueById('address');
    const category = getValueById('category');
    const total = parseFloat(getValueById('total').replace('₱', '')) || 0;
    const units = parseInt(getValueById('units')) || 1;
    const amount_paid = parseFloat(getValueById('amount')) || 0;
    const change_due = parseFloat(getValueById('change').replace('₱', '')) || 0;

    // Collect all fees
    const fees = {
        filling_fee: parseFloat(getValueById('filling-fee')) || 0,
        business_permit_fee: parseFloat(getValueById('business-permit-fee')) || 0,
        mtop_fee: parseFloat(getValueById('mtop-fee')) || 0,
        pol_med_mayor_fee: parseFloat(getValueById('pol-med-mayor-fee')) || 0,
        plate_number_fee: parseFloat(getValueById('plate-number-fee')) || 0,
        inspection_fee: parseFloat(getValueById('inspection-fee')) || 0,
        id_card_fee: parseFloat(getValueById('id-card-fee')) || 0,
        sec_fee: parseFloat(getValueById('sec-fee')) || 0,
        dst_fee: parseFloat(getValueById('dst-fee')) || 0,
        supervision_fee: parseFloat(getValueById('supervision-fee')) || 0,
        penalty_fee: parseFloat(getValueById('penalty-fee')) || 0,
    };

    // Check for missing required fields
    if (!applicant_no || !operator_name || !operator_address || amount_paid < total) {
        showNotification('⚠️ Ensure all required fields are filled and payment is sufficient.', 'error');
        return;
    }

    const paymentDetails = {
        applicant_no,
        operator_name,
        operator_address,
        category,
        units,
        total,
        fees,
        amount_paid,
        change_due,
    };

    try {
        const response = await fetch('http://localhost:8000/payment/submitPayment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentDetails),
        });

        if (response.ok) {
            const data = await response.json();
            showNotification(data.message);
        } else {
            const errorData = await response.json();
            showNotification(errorData.message || 'Payment submission failed.', 'error');
        }
    } catch (error) {
        console.error('Error submitting payment:', error);
        showNotification('🚨 An unexpected error occurred. Please try again.', 'error');
    }
}

// Attach event listeners
document.getElementById('searchButton').addEventListener('click', fetchApplicantDetails);
document.querySelectorAll('.fee-input').forEach((input) => input.addEventListener('input', calculateDynamicTotal));
document.getElementById('units').addEventListener('input', calculateDynamicTotal);
document.getElementById('amount').addEventListener('input', calculateChange);
document.getElementById('pay-button').addEventListener('click', submitPayment);

// Sidebar toggle logic
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
});
