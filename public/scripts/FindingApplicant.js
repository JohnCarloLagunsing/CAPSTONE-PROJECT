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

// Function to show the receipt notification
function showReceiptNotification() {
    const notification = document.getElementById('receipt-notification');
    const message = document.getElementById('receipt-notification-message');

    // Customize the message
    message.textContent = 'Receipt is available. Click the "Receipt" button to view it.';

    // Show the notification
    notification.classList.remove('hidden');

    // Automatically hide the notification after 5 seconds
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}

// Event listener to close the notification manually
document.getElementById('close-notification').addEventListener('click', () => {
    document.getElementById('receipt-notification').classList.add('hidden');
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
        const response = await fetch(`https://ecentersanluis.com/applicant/getApplicantByNo/${applicantNo}`);

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
        const response = await fetch('https://ecentersanluis.com/payment/submitPayment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentDetails),
        });

        if (response.ok) {
            const data = await response.json();
            showNotification(data.message);
            showReceiptNotification();
        } else {
            const errorData = await response.json();
            showNotification(errorData.message || 'Payment submission failed.', 'error');
        }
    } catch (error) {
        console.error('Error submitting payment:', error);
        showNotification('🚨 An unexpected error occurred. Please try again.', 'error');
    }
}

async function fetchAndDisplayReceipt() {
    const applicantNo = document.getElementById('id').value.trim(); // Fetch Applicant No. from the input field

    // Validate if Applicant No. exists
    if (!applicantNo) {
        showNotification('⚠️ Please provide a valid Applicant No. to generate the receipt.', 'error');
        return;
    }

    try {
        // Fetch receipt details from the backend
        const response = await fetch(`https://ecentersanluis.com/payment/getReceipt/${applicantNo}`);

        if (response.ok) {
            const receiptData = await response.json();
            generateReceipt(receiptData);
        } else {
            const errorData = await response.json();
            showNotification(errorData.message || 'Error fetching receipt details.', 'error');
        }
    } catch (error) {
        console.error('Error fetching receipt details:', error);
        showNotification('🚨 An unexpected error occurred. Please try again.', 'error');
    }
}

// Function to generate and print receipt
function fetchAndDisplayReceipt() {
    const applicantNo = document.getElementById('id').value.trim();
    const operatorName = document.getElementById('name').value.trim();
    const operatorAddress = document.getElementById('address').value.trim();
    const category = document.getElementById('category').value.trim();
    const units = parseInt(document.getElementById('units').value) || 0;
    const total = parseFloat(document.getElementById('total').value.replace('₱', '')) || 0;
    const amountPaid = parseFloat(document.getElementById('amount').value) || 0;
    const changeDue = parseFloat(document.getElementById('change').value.replace('₱', '')) || 0;

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

    const receiptData = {
        applicant_no: applicantNo,
        operator_name: operatorName,
        operator_address: operatorAddress,
        category: category,
        units: units,
        total: total,
        amount_paid: amountPaid,
        change_due: changeDue,
        fees: fees,
    };

    generateReceipt(receiptData);
}

// Function to generate the receipt
function generateReceipt(data) {
    const receiptWindow = window.open('', '_blank', 'width=300,height=500');
    const feesHTML = Object.entries(data.fees)
        .map(([key, value]) => `
            <tr>
                <td>${key.replace(/_/g, ' ').toUpperCase()}:</td>
                <td>₱${value.toFixed(2)}</td>
            </tr>
        `)
        .join('');

    const receiptContent = `
        <html>
        <head>
            <title>Receipt</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    width: 250px;
                }
                .receipt {
                    text-align: center;
                }
                .receipt-header {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .receipt-details {
                    margin-top: 20px;
                    text-align: left;
                }
                .receipt-details table {
                    width: 100%;
                }
                .receipt-details table td {
                    padding: 5px;
                }
                .receipt-footer {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="receipt-header">Payment Receipt</div>
                <div class="receipt-details">
                    <table>
                        <tr>
                            <td>Applicant No:</td>
                            <td>${data.applicant_no}</td>
                        </tr>
                        <tr>
                            <td>Name:</td>
                            <td>${data.operator_name}</td>
                        </tr>
                        <tr>
                            <td>Address:</td>
                            <td>${data.operator_address}</td>
                        </tr>
                        <tr>
                            <td>Category:</td>
                            <td>${data.category}</td>
                        </tr>
                        <tr>
                            <td>Units:</td>
                            <td>${data.units}</td>
                        </tr>
                        <tr>
                            <td>Total Amount:</td>
                            <td>₱${data.total.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Amount Paid:</td>
                            <td>₱${data.amount_paid.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Change Due:</td>
                            <td>₱${data.change_due.toFixed(2)}</td>
                        </tr>
                    </table>
                    <br>
                    <table>
                        ${feesHTML}
                    </table>
                </div>
                <div class="receipt-footer">
                    <p>Thank you for your payment!</p>
                    <p>Powered by Payment System</p>
                </div>
                <button onclick="window.print();">Print Receipt</button>
            </div>
        </body>
        </html>
    `;
    receiptWindow.document.write(receiptContent);
    receiptWindow.document.close();
    receiptWindow.focus();
}

// Function to fetch and display past 5 receipts
async function fetchAndDisplayPastReceipts() {
    try {
        // Fetch the last 5 receipts from the backend
        const response = await fetch('https://ecentersanluis.com/payment/getPastReceipts');

        if (response.ok) {
            const receipts = await response.json();
            displayReceipts(receipts); // Pass receipts data to display function
        } else {
            const errorData = await response.json();
            showNotification(errorData.message || 'Error fetching past receipts.', 'error');
        }
    } catch (error) {
        console.error('Error fetching past receipts:', error);
        showNotification('🚨 An unexpected error occurred. Please try again.', 'error');
    }
}

// Function to fetch and display past 5 receipts
function displayReceipts(receipts) {
    // Ensure receipts are not empty
    if (!receipts || receipts.length === 0) {
        showNotification('No past receipts available.', 'error');
        return;
    }

    // Create a modal for displaying the receipts
    const modalContent = `
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg shadow-lg w-[90%] h-[80%] overflow-y-scroll">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-bold">Past 5 Receipts</h2>
                    <button id="closeModal" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Close</button>
                </div>
                <div class="grid grid-cols-4 gap-4">
                    ${receipts
                        .map(
                            (receipt, index) => `
                        <div class="border border-gray-300 rounded-lg p-4 shadow-md">
                            <p><strong>Applicant No:</strong> ${receipt.applicant_no}</p>
                            <p><strong>Name:</strong> ${receipt.operator_name}</p>
                            <p><strong>Address:</strong> ${receipt.operator_address}</p>
                            <p><strong>Category:</strong> ${receipt.category}</p>
                            <p><strong>Units:</strong> ${receipt.units}</p>
                            <p><strong>Total:</strong> <input type="number" id="total-${index}" class="editable w-full border rounded px-2 py-1" value="${parseFloat(receipt.total).toFixed(2)}" /></p>
                            <p><strong>Amount Paid:</strong> <input type="number" id="amountPaid-${index}" class="editable w-full border rounded px-2 py-1" value="${parseFloat(receipt.amount_paid).toFixed(2)}" /></p>
                            <p><strong>Change Due:</strong> <input type="number" id="changeDue-${index}" class="editable w-full border rounded px-2 py-1" value="${parseFloat(receipt.change_due).toFixed(2)}" readonly /></p>
                        </div>
                    `
                        )
                        .join('')}
                </div>
            </div>
        </div>
    `;

    // Append the modal to the body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalContent;
    document.body.appendChild(modalContainer);

    // Add event listener for dynamically updating "Change Due" on input change
    receipts.forEach((receipt, index) => {
        document.getElementById(`amountPaid-${index}`).addEventListener('input', function () {
            const total = parseFloat(document.getElementById(`total-${index}`).value) || 0;
            const amountPaid = parseFloat(this.value) || 0;
            const changeDue = Math.max(amountPaid - total, 0); // Ensure no negative values
            document.getElementById(`changeDue-${index}`).value = changeDue.toFixed(2);
        });
    });

    // Add event listener to close the modal
    document.getElementById('closeModal').addEventListener('click', () => {
        modalContainer.remove();
    });
}
// Attach the fetchAndDisplayPastReceipts function to the "View Receipt" button
document.getElementById('viewReceiptButton').addEventListener('click', fetchAndDisplayPastReceipts);


// Attach event listeners
document.getElementById('searchButton').addEventListener('click', fetchApplicantDetails);
document.querySelectorAll('.fee-input').forEach((input) => input.addEventListener('input', calculateDynamicTotal));
document.getElementById('units').addEventListener('input', calculateDynamicTotal);
document.getElementById('amount').addEventListener('input', calculateChange);
document.getElementById('pay-button').addEventListener('click', submitPayment);
document.getElementById('receiptButton').addEventListener('click', fetchAndDisplayReceipt);

// Sidebar toggle logic
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
});


document.getElementById('logoutButton').addEventListener('click', function(event) {
    event.preventDefault();

    const modalOverlay = document.createElement('div');
    modalOverlay.className = "fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50";
    modalOverlay.id = "logoutModal";

    modalOverlay.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 class="text-xl font-semibold mb-4">Are you sure you want to log out?</h3>
            <div class="flex justify-end space-x-4">
                <button id="cancelLogout" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                <button id="confirmLogout" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Logout</button>
            </div>
        </div>
    `;

    document.body.appendChild(modalOverlay);

    document.getElementById('cancelLogout').addEventListener('click', function() {
        modalOverlay.remove();
    });

    document.getElementById('confirmLogout').addEventListener('click', function() {
        window.location.href = 'applicant.html';
    });
});