
document.addEventListener('DOMContentLoaded', function() {
    let allData = [];
    fetch('https://1capstone-project-six-psi.vercel.app/getRecords')
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      allData = data; 
      const tableBody = document.getElementById('table-body');
      data.sort((a, b) => {
          const idA = parseInt(a.tfid.split('-')[0]);
          const idB = parseInt(b.tfid.split('-')[0]);
          return idA - idB;
      });

      data.forEach(record => {
          const row = document.createElement('tr');
          row.innerHTML = `
<td>${record.tfid}</td>
<td>${record.applicationtype}</td>
<td>${record.nameapplicant}</td>
<td><i class="fa-regular fa-folder-open custom-icon" data-id="${record.tfid}"></i></td>
<td>
  <select class="status-dropdown" data-id="${record.tfid}" data-status="${record.status}">
<option value="On Process" ${record.status === 'On Process' ? 'selected' : ''}>To be Processed</option>
<option value="Approved" ${record.status === 'Approved' ? 'selected' : ''}>Approved</option>
<option value="Declined" ${record.status === 'Declined' ? 'selected' : ''}>Declined</option>
</select>
</td>`;
          tableBody.appendChild(row);
      });
  

              // Event listener for status change
              document.querySelectorAll('.status-dropdown').forEach(select => {
                  select.addEventListener('change', function() {
                      const selectedStatus = this.value;
                      const tfid = this.getAttribute('data-id');
                      const occuid = this.getAttribute('data-occuid');
      fetch('https://ecentersanluis.com/updateStatus', {
       method: 'POST',
credentials: 'include',
headers: {
  'Content-Type': 'application/json'
},
body: JSON.stringify({ tfid, occuid, status: selectedStatus })  // Ensure occuid is passed
})

                      .then(response => response.json())
                      .then(data => {
                          console.log('Status updated:', data.message);
                      })
                      .catch(error => console.error('Error updating status:', error));
                  });
              });

              // Modal elements
              const modal = document.getElementById("myModal");
              const span = document.getElementsByClassName("close")[0];
              const modalName = document.getElementById("modal-name");
              const modalId = document.getElementById("modal-id");
              const modalType = document.getElementById("modal-type");
              const modalDate = document.getElementById("modal-date");
              const modalRoute = document.getElementById("modal-route");
              const modalBarangay = document.getElementById("modal-baranggay");
              const modalMunicipality = document.getElementById("modal-municipality");
              const modalProvince = document.getElementById("modal-province");
              const modalOccupation = document.getElementById("modal-occupation");
              const modalTypeOwnership = document.getElementById("modal-typeownership");
              const modalOfficialDriver = document.getElementById("modal-officialdriver");
              const modalLicenseNumber = document.getElementById("modal-licensenumber");
              const modalCertfDate = document.getElementById("modal-certfdate");
              const modalSubscribedDate = document.getElementById("modal-subscribed-date");
              const modalCtn = document.getElementById("modal-cmttaxcertno");
              const modalInspectedBy = document.getElementById("modal-inspected");
              const modalunitnames = document.getElementById("unit_name");
              const modalunitmodel = document.getElementById("unit_model");
              const modalmotorno = document.getElementById("motor_no");
              const modalchassisno = document.getElementById("chassis_no");
              const modalplate_no = document.getElementById("plate_no");
              const modalSignature = document.getElementById("modal-signature");

              // Function to format date or return 'N/A' if invalid
              const formatDate = (dateString) => {
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

              const formatSubscribedDate = (day, month, year) => {
                  if (day && month && year) {
                      const date = new Date(`${year}-${month}-${day}`);
                      return date.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                      });
                  }
                  return 'N/A';
              };

              // When the folder icon is clicked, show the modal with the corresponding data
              document.querySelectorAll('.custom-icon').forEach(icon => {
                  icon.addEventListener('click', function() {
                      const id = this.getAttribute('data-id');
                      const record = data.find(record => record.tfid === id);
                      if (record) {
                          modalName.textContent = record.nameapplicant;
                          modalId.textContent = record.tfid;
                          modalType.textContent = record.applicationtype;
                          modalRoute.textContent = record.route;
                          modalBarangay.textContent = record.barangay;
                          modalMunicipality.textContent = record.municipality;
                          modalProvince.textContent = record.province;
                          modalOccupation.textContent = record.occupation;
                          modalTypeOwnership.textContent = record.typeownership;
                          document.getElementById("modal-numunits").textContent = record.numunits;
                          modalOfficialDriver.textContent = record.officialdriver;
                          modalLicenseNumber.textContent = record.licensenumber;
                          modalCertfDate.textContent = formatDate(record.certificationdate);
                          modalDate.textContent = formatDate(record.applicationdate);
                          modalCtn.textContent = record.communitytaxcertno;
                          modalInspectedBy.textContent = record.inspectedby;
                          modalunitnames.textContent = record.unit_names;
                          modalunitmodel.textContent = record.unit_models;
                          modalmotorno.textContent = record.motor_numbers;
                          modalchassisno.textContent = record.chassis_numbers;
                          modalplate_no.textContent = record.plate_numbers;
                          modalSubscribedDate.textContent = formatSubscribedDate(record.subscribedday, record.subscribedmonth, record.subscribedyear);
                          
                          if (record.signatureapplicant) {
                              modalSignature.src = `data:image/png;base64,${record.signatureapplicant}`;
                              modalSignature.style.display = 'block';
                          } else {
                              modalSignature.style.display = 'none';
                          }
                          
                          modal.style.display = "block";
                      }
                  });
              });

              // Close the modal when the 'x' is clicked
              span.onclick = function() {
                  modal.style.display = "none";
              }

              // Close the modal when clicking outside the modal content
              window.onclick = function(event) {
                  if (event.target == modal) {
                      modal.style.display = "none";
                  }
              };
          })
          .catch(error => {
              const tableBody = document.getElementById('table-body');
              tableBody.innerHTML = '<tr><td colspan="5">Error fetching data</td></tr>';
          });
    });

    document.getElementById('filter-dropdown').addEventListener('change', function () {
      const selectedValue = this.value;
      const table = document.getElementById('applicants-table');
      const occustatusContainer = document.getElementById('occustatus-container');
      const filterTypeDropdown = document.getElementById('filter-type-dropdown');
  
      if (selectedValue === "Occupational Applicants") {
          // Hide main table and dropdown
          table.style.display = 'none';
          filterTypeDropdown.style.display = 'none';
  
          // Fetch and display Occupational Applicants
          fetch('http://capstone-project-six-psi.vercel.app/getOccupationalApplicants')
              .then((response) => response.json())
              .then((data) => {
                  displayOccupationalApplicants(data);
              })
              .catch((error) => console.error('Error fetching occupational applicants:', error));
  
          occustatusContainer.style.display = 'block'; // Show occupational applicants table
      } else if (selectedValue === "Motor Operator Applicants") {
          // Hide main table and dropdown
          table.style.display = 'none';
          filterTypeDropdown.style.display = 'none';
  
          // Fetch and display Motor Operator Applicants
          fetch('https://ecentersanluis.com/getMotorOperatorApplicants')
              .then((response) => response.json())
              .then((data) => {
                  displayMotorOperatorApplicants(data);
              })
              .catch((error) => console.error('Error fetching motor operator applicants:', error));
  
          occustatusContainer.style.display = 'block'; // Show motor operator applicants table
      } else if (selectedValue === "Tricycle Franchise Applicants") {
          // Show main table and dropdown
          table.style.display = 'table';
          filterTypeDropdown.style.display = 'block';
          occustatusContainer.style.display = 'none'; // Hide occupational/motor operator table
      } else {
          // Show main table and hide dropdown
          table.style.display = 'table';
          filterTypeDropdown.style.display = 'none';
          occustatusContainer.style.display = 'none'; // Hide occupational/motor operator table
      }
  });
  

  document.getElementById('filter-type-dropdown').addEventListener('change', function() {
      const selectedType = this.value.toLowerCase();
      const rows = document.querySelectorAll('#table-body tr');

      rows.forEach(row => {
          const applicationType = row.cells[1].textContent.toLowerCase();
          if (selectedType === "all" || applicationType === selectedType) {
              row.style.display = "";
          } else {
              row.style.display = "none";
          }
      });
  });

  // Print button functionality
  document.getElementById('printBtn').addEventListener('click', function() {
      // Get the modal content
      var modalContent = document.querySelector('.modal-body').innerHTML;

      // Copy modal content to print area
      var printArea = document.getElementById('printArea');
      printArea.innerHTML = modalContent;

      // Trigger the print dialog for the print area
      window.print();
  });

// Function to display Occupational Applicants
// Function to display Occupational Applicants
function displayOccupationalApplicants(data) {
const occustatusTableBody = document.getElementById('mtop-status-body');
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





document.getElementById('filter-dropdown').addEventListener('change', function () {
    const selectedValue = this.value;
    const mtopStatusTable = document.getElementById('mtop-status-table');
    const otherTables = document.querySelectorAll('.table-container table:not(#mtop-status-table)');

    if (selectedValue === "Motor Operator Applicants") {
        // Hide other tables
        otherTables.forEach(table => (table.style.display = 'none'));

        // Fetch and display MTOP Status Table
        fetch('https://ecentersanluis.com/getMtopStatus') // Adjust endpoint accordingly
            .then(response => response.json())
            .then(data => {
                const tableBody = document.getElementById('mtop-status-body');
                tableBody.innerHTML = ''; // Clear existing data

                data.forEach(record => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${record.id}</td>
                        <td>${record.application_type}</td>
                        <td>${record.full_name}</td>
                        <td>${record.status}</td>
                    `;
                    tableBody.appendChild(row);
                });

                // Show the table
                mtopStatusTable.style.display = 'table';
            })
            .catch(error => console.error('Error fetching MTOP status data:', error));
    } else {
        // Hide MTOP Status Table
        mtopStatusTable.style.display = 'none';

        // Optionally, show another table based on selection
    }
});


document.querySelectorAll('.custom-icon').forEach(icon => {
    icon.addEventListener('click', function () {
        const id = this.getAttribute('data-id'); // MTOP Application ID

        fetch(`https://ecentersanluis.com/getMtopApplication/${id}`) // Adjust endpoint
            .then(response => response.json())
            .then(data => {
                document.getElementById('mtop-modal-id').textContent = data.id || 'N/A';
                document.getElementById('mtop-modal-application-type').textContent = data.application_type || 'N/A';
                document.getElementById('mtop-modal-applicant-no').textContent = data.applicant_no || 'N/A';
                document.getElementById('mtop-modal-operator-name').textContent = data.operator_name || 'N/A';
                document.getElementById('mtop-modal-operator-address').textContent = data.operator_address || 'N/A';

                const modal = document.getElementById('mtopModal');
                modal.style.display = 'block';
            })
            .catch(error => console.error('Error fetching MTOP application details:', error));
    });
});

function displayMotorOperatorApplicants(data) {
    const occustatusTableBody = document.getElementById('occustatus-body');
    occustatusTableBody.innerHTML = ''; // Clear existing rows

    data.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.id || 'N/A'}</td>
            <td>${record.application_type || 'N/A'}</td>
            <td>${record.full_name || 'N/A'}</td>
            <td>
                <i class="fa-regular fa-folder-open custom-icon" data-id="${record.id}"></i>
            </td>
            <td>${record.status || 'Pending'}</td>
        `;
        tableBody.appendChild(row);
    });
    
}