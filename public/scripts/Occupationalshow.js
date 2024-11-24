document.getElementById('filter-dropdown').addEventListener('change', function() {
    const selectedValue = this.value;
    const table = document.getElementById('applicants-table');
    const occustatusTable = document.getElementById('occustatus-table');
    const filterTypeDropdown = document.getElementById('filter-type-dropdown');

    if (selectedValue === "Occupational Applicants") {
        // Fetch occupational applicants data
        fetch('http://127.0.0.1:8000/getOccupationalApplicants')
            .then(response => response.json())
            .then(data => {
                displayOccupationalApplicants(data);
                attachOccuPermitModalListeners();  // Call function to display data
            })
            .catch(error => console.error('Error fetching occupational applicants:', error));
        
        table.style.display = 'none'; // Hide main table
        document.getElementById('occustatus-container').style.display = 'block'; // Show occupational applicants table
        filterTypeDropdown.style.display = 'none'; // Hide filter for occupational applicants
    } else if (selectedValue === "Tricycle Franchise Applicants") {
        table.style.display = 'table'; // Show main table
        document.getElementById('occustatus-container').style.display = 'none'; // Hide occupational applicants table
        filterTypeDropdown.style.display = 'block'; // Show filter dropdown
    }
});

// Function to display Occupational Applicants
// Function to display Occupational Applicants
function displayOccupationalApplicants(data) {
    const occustatusTableBody = document.getElementById('occustatus-body');
    occustatusTableBody.innerHTML = '';  // Clear existing data

    data.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.occuid}</td>
            <td>${record.fullname}</td>
            <td><i class="fa-regular fa-folder-open custom-icon-occPermit" data-occuid="${record.occuid}"></i></td>
            <td>
                <select class="status-dropdown" data-occuid="${record.occuid}">
                    <option value="On Process" ${record.status === 'On Process' ? 'selected' : ''}>On Process</option>
                    <option value="Approved" ${record.status === 'Approved' ? 'selected' : ''}>Approved</option>
                    <option value="Declined" ${record.status === 'Declined' ? 'selected' : ''}>Declined</option>
                </select>
            </td>`;

        occustatusTableBody.appendChild(row);
    });

    // Reattach event listener to the newly created select elements for status change
    document.querySelectorAll('.status-dropdown').forEach(select => {
        select.addEventListener('change', function() {
            const selectedStatus = this.value;
            const occuid = this.getAttribute('data-occuid');

            // Call the backend to update status
            fetch('https://ecentersanluis.com/updateStatus', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ occuid, status: selectedStatus })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Status updated:', data.message);
            })
            .catch(error => console.error('Error updating status:', error));
        });
    });
}

    // Reattach event listener to icons
    attachOccuPermitModalListeners();


// Function to handle opening of OccuPermit modal
function attachOccuPermitModalListeners() {
    document.querySelectorAll('.custom-icon-occPermit').forEach(icon => {
        icon.addEventListener('click', function() {
            const occuid = this.getAttribute('data-occuid');  // Fetch occuid
            
            // Fetch the documents for the specific OccuPermit
            fetch(`https://ecentersanluis.com/getOccuPermitDocuments/${occuid}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data && data.length > 0) {
                    const documentData = data[0];


                    console.log('Fetched COE:', documentData.COE); 
                    document.getElementById('occPermit-doc-occuid').textContent = documentData.Occuid;
                    document.getElementById('occPermit-doc-firstname').textContent = documentData.Firstname;
                    document.getElementById('occPermit-doc-middlename').textContent = documentData.Middlename;
                    document.getElementById('occPermit-doc-lastname').textContent = documentData.Lastname;
                    document.getElementById('occPermit-doc-suffix').textContent = documentData.Suffix || 'N/A';
                    document.getElementById('occPermit-doc-name').textContent = `${documentData.Firstname} ${documentData.Middlename.charAt(0)}. ${documentData.Lastname}`;
                    document.getElementById('occPermit-doc-address').textContent= documentData.Address;
                    document.getElementById('occPermit-doc-age').textContent = documentData.Age;
                    document.getElementById('occPermit-doc-placeofbirth').textContent = documentData.PlaceofBirth;
                    document.getElementById('occPermit-doc-contactno').textContent = documentData.ContactNo;
                    document.getElementById('occPermit-doc-email').textContent = documentData.Email;
                    document.getElementById('occPermit-doc-gender').textContent = documentData.Gender;
                    document.getElementById('occPermit-doc-cstatus').textContent = documentData.CivilStatus;
                    document.getElementById('occPermit-doc-compname').textContent = documentData.CompanyName;
                    document.getElementById('occPermit-doc-jobpos').textContent = documentData.JobPosition;
                    document.getElementById('occPermit-doc-combid').textContent = documentData.combinedId;
                    document.getElementById('occPermit-doc-ctcnumber').textContent = documentData.CTCNumber;
                   


                    // Function to format the CTC Date Issued to "Month Day, Year" format
const formatCTCDate = (dateString) => {
    if (dateString) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else {
            return 'N/A';
        }
    } else {
        return 'N/A';
    }
};

// When displaying the document details, call this function for the CTC Date Issued
                    document.getElementById('occPermit-doc-ctcdti').textContent = formatCTCDate(documentData.CTCDateIssued);
                    document.getElementById('occPermit-doc-placeissued').textContent = documentData.CTCPlaceIssued;
                    document.getElementById('occPermit-doc-dob').textContent = formatCTCDate(documentData.DateofBirth);
                   

                  
                    if (documentData.COE) {
                            const coeImage = `data:image/png;base64,${documentData.COE}`;
                            document.getElementById('occPermit-doc-coe').src = coeImage;
                        } else {
                            document.getElementById('occPermit-doc-coe').src = ''; // Clear if no image
                        }


                    if (documentData.HealthCard && documentData.HealthCard.trim() !== "") {
                        const healthCardImage = `data:image/png;base64,${documentData.HealthCard}`;
                        document.getElementById('healthcard-label').style.display = 'block'; // Show label
                        document.getElementById('occPermit-healthcard').src = healthCardImage;
                        document.getElementById('occPermit-healthcard').style.display = 'block'; // Show image
                    } else {
                        document.getElementById('healthcard-label').style.display = 'none'; // Hide label
                        document.getElementById('occPermit-healthcard').style.display = 'none'; // Hide image
                    }

                    if (documentData.BirthCertificate && documentData.BirthCertificate.trim() !== "") {
                        const BirthCertificateImage = `data:image/png;base64,${documentData.BirthCertificate}`;
                        document.getElementById('BirthCertificate-label').style.display = 'block'; // Show label
                        document.getElementById('occPermit-BirthCertificate').src = BirthCertificateImage;
                        document.getElementById('occPermit-BirthCertificate').style.display = 'block'; // Show image
                    } else {
                        document.getElementById('BirthCertificate-label').style.display = 'none'; // Hide label
                        document.getElementById('occPermit-BirthCertificate').style.display = 'none'; // Hide image
                    }


                    if (documentData.OfficialReceipt) {
                            const OfficialReceiptImage = `data:image/png;base64,${documentData.OfficialReceipt}`;
                            document.getElementById('occPermit-OfficialReceipt').src = OfficialReceiptImage;
                        } else {
                            document.getElementById('occPermit-OfficialReceipt').src = ''; // Clear if no image
                        }

/* <p><strong>Official Receipt:</strong></p>
        <img id="occPermit-OfficialReceipt" src="" alt="Official Reciept" style="max-width: 20%; height: auto;">*/


                    // Show the document modal
                   
                                        
                                        // Show the document modal
                                        const documentModal = document.getElementById('occPermitModal');
                                        documentModal.style.display = 'block';
                                    }
                                })
                                .catch(error => {
                                    console.error('Error fetching OccuPermit documents:', error);
                                });
                        });
                    });
                }

// Call this function after the table is populated
attachOccuPermitModalListeners();



          
            document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");  // Check if the JS is running

    // Icon click listener for displaying OccuPermit documents
   
    // Close modal on clicking the close button
    const closeDocumentModal = document.getElementsByClassName("close-occPermit-modal")[0];
    closeDocumentModal.onclick = function() {
        document.getElementById("occPermitModal").style.display = "none";
    };

    // Close modal if clicked outside of the modal content
    window.onclick = function(event) {
        const documentModal = document.getElementById("occPermitModal");
        if (event.target == documentModal) {
            documentModal.style.display = "none";
        }
    };
});

document.querySelectorAll('.print-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Determine the corresponding modal content based on the button clicked
        const modalContent = this.closest('.modal-content') ? this.closest('.modal-content').querySelector('.modal-body').innerHTML : '';
        
        // Copy modal content to print area
        var printArea = document.getElementById('printArea');
        printArea.innerHTML = modalContent;

        // Trigger the print dialog
        window.print();
    });
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
        window.location.href = 'applicant.html'; // Redirect to login.html on confirm
    });
});