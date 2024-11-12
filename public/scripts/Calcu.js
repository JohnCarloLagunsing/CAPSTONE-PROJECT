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
    event.preventDefault(); // Prevent the default link behavior
    var confirmation = confirm("Are you sure you want to log out?");
    if (confirmation) {
        window.location.href = 'login.html'; // Redirect to the login page
    }
});
