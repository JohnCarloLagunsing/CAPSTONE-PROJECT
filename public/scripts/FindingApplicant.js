async function fetchApplicantDetails() {
    const applicantNo = document.getElementById('search-id').value.trim(); // Get the Applicant No.

    // Validate input
    if (!applicantNo) {
        alert('Please enter an Applicant No.');
        return;
    }

    try {
        // Fetch data from the database through the backend
        const response = await fetch(`http://localhost:8000/applicant/getApplicantByNo/${applicantNo}`);


        if (response.ok) {
            const data = await response.json(); // Parse the JSON response

            // Populate the input fields with the data
            document.getElementById('id').value = data.applicant_no || '';
            document.getElementById('name').value = data.operator_name || '';
            document.getElementById('address').value = data.operator_address || '';
        } else {
            const errorData = await response.json();
            alert(errorData.message || 'Error retrieving applicant details.');

            // Clear fields if no data found
            document.getElementById('id').value = '';
            document.getElementById('name').value = '';
            document.getElementById('address').value = '';
        }
    } catch (error) {
        console.error('Error fetching applicant details:', error);
        alert('An error occurred while fetching applicant details. Please try again.');
    }
}

// Attach the function to the Search button
document.getElementById('searchButton').addEventListener('click', fetchApplicantDetails);

