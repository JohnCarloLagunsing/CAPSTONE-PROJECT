function calculateChange() {
    const total = 170; // The fixed amount for the fee
    const amount = document.getElementById('amount').value;
    const change = amount - total;

    document.getElementById('change').value = `₱${change.toFixed(2)}`;
}

function checkInputs() {
    const id = document.getElementById('id').value.trim();
    const name = document.getElementById('name').value.trim();
    const address = document.getElementById('address').value.trim();
    const dateIssued = document.getElementById('date-issued').value.trim();
    const expirationDate = document.getElementById('expiration-date').value.trim();
    const fee = document.getElementById('fee').value.trim();
    const amount = document.getElementById('amount').value.trim();

    const payButton = document.getElementById('pay-button');

    if (id && name && address && dateIssued && expirationDate && fee && amount) {
        payButton.disabled = false;
    } else {
        payButton.disabled = true;
    }
}

document.querySelectorAll('.details-container input').forEach(input => {
    input.addEventListener('input', checkInputs);
});

document.getElementById('pay-button').addEventListener('click', calculateChange);

function calculateChange() {
    // Get the values from the input fields
    const totalAmount = parseFloat(document.getElementById('total').value.replace('₱', ''));
    const amountPaid = parseFloat(document.getElementById('amount').value);

    // Check if the amount paid is a valid number
    if (isNaN(amountPaid) || amountPaid < totalAmount) {
        alert('Please enter a valid amount greater than or equal to the total amount.');
        return;
    }

    // Calculate the change
    const change = amountPaid - totalAmount;

    // Display the change in the 'change' input field
    document.getElementById('change').value = '₱' + change.toFixed(2);
}


document.addEventListener('DOMContentLoaded', function() {
    // Calculate total when the page loads
    calculateTotal();

    // Recalculate total whenever any input field is changed
    const feeInputs = document.querySelectorAll('.info-container input[type="text"]');
    feeInputs.forEach(input => {
        input.addEventListener('input', calculateTotal);
    });

    // Calculate change when the "PAY" button is clicked
    document.getElementById('pay-button').addEventListener('click', calculateChange);
});

function calculateTotal() {
    let total = 0;

    // Get the values of all fee input fields, excluding the MO_ID field
    const feeInputs = document.querySelectorAll('.info-container input[type="text"]:not(#id)');

    feeInputs.forEach(input => {
        let value = parseFloat(input.value.replace('₱', ''));
        if (!isNaN(value)) {
            total += value;
        }
    });

    // Update the total field
    document.getElementById('total').value = '₱' + total.toFixed(2);
}

function calculateChange() {
    // Get the values from the input fields
    const totalAmount = parseFloat(document.getElementById('total').value.replace('₱', ''));
    const amountPaid = parseFloat(document.getElementById('amount').value);

    // Check if the amount paid is a valid number
    if (isNaN(amountPaid) || amountPaid < totalAmount) {
        alert('Please enter a valid amount greater than or equal to the total amount.');
        return;
    }

    // Calculate the change
    const change = amountPaid - totalAmount;

    // Display the change in the 'change' input field
    document.getElementById('change').value = '₱' + change.toFixed(2);
}


// Store the original total for one unit when the page loads
let originalTotal = parseFloat(document.getElementById('total').value.replace('₱', '').replace(',', ''));

document.getElementById('units').addEventListener('input', function() {
    let units = parseInt(this.value);
    let newTotal = originalTotal * units;
    document.getElementById('total').value = '₱' + newTotal.toFixed(2);
});


document.getElementById('logoutButton').addEventListener('click', function(event) {
    event.preventDefault();

    // Create a modal container
    const modalOverlay = document.createElement('div');
    modalOverlay.className = "fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50";
    modalOverlay.id = "logoutModal";

    // Modal content
    modalOverlay.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 class="text-xl font-semibold mb-4">Are you sure you want to log out?</h3>
            <div class="flex justify-end space-x-4">
                <button id="cancelLogout" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                <button id="confirmLogout" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Logout</button>
            </div>
        </div>
    `;

    // Append modal to the body
    document.body.appendChild(modalOverlay);

    // Add event listener for cancel button
    document.getElementById('cancelLogout').addEventListener('click', function() {
        modalOverlay.remove(); // Remove modal from DOM on cancel
    });

    // Add event listener for confirm logout button
    document.getElementById('confirmLogout').addEventListener('click', function() {
        window.location.href = 'login.html'; // Redirect to login.html on confirm
    });
});