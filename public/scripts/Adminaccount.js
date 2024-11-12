 // JavaScript functions remain unchanged
 let activeAccounts = [];
 let archivedAccounts = [];
 let archivedVisible = false;
 let archivedInspectorsVisible = false;

 document.getElementById('logoutButton').addEventListener('click', function(event) {
     event.preventDefault();
     var confirmation = confirm("Are you sure you want to log out?");
     if (confirmation) {
         window.location.href = 'HeadAdmin.html';
     }
 });

 function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("-translate-x-full");
}


 function filterByInspector() {
     const addAccountButton = document.getElementById('addAccountButton');
     const viewArchivedButton = document.getElementById('viewArchivedButton');
     const toggleArchivedInspectorButton = document.getElementById('toggleArchivedInspectorButton');
     const changePasswordButton = document.getElementById('changePasswordButton');
     const filterInspectorButton = document.getElementById('filterInspectorButton');
     const backToAdminListButton = document.getElementById('backToAdminListButton');
     const addInspectorButton = document.getElementById('addInspectorButton');
     const changePasswordInspectorButton = document.getElementById('changePasswordInspectorButton');
     const tableTitle = document.getElementById('tableTitle');
     const archivedTable = document.getElementById('archivedSection');

     // Hide Admin-specific buttons
     addAccountButton.style.display = 'none';
     viewArchivedButton.style.display = 'none';
     changePasswordButton.style.display = 'none';
     filterInspectorButton.style.display = 'none';
     archivedTable.style.display = 'none';

     // Show Inspector-specific buttons
     backToAdminListButton.style.display = 'inline-block';
     addInspectorButton.style.display = 'inline-block';
     changePasswordInspectorButton.style.display = 'inline-block';
     toggleArchivedInspectorButton.style.display = 'inline-block';

     // Update title for the Inspector view
     tableTitle.textContent = 'Inspector List';

     // Adjust table headers
     const tableHeader = document.getElementById('staffTable').querySelector('thead tr');
     tableHeader.innerHTML = `
         <th>Full Name</th>
         <th>Archive</th>
     `;

     // Fetch and display inspectors
     fetchInspectors();
 }

 function showAdminStaffList() {
     const addAccountButton = document.getElementById('addAccountButton');
     const viewArchivedButton = document.getElementById('viewArchivedButton');
     const toggleArchivedInspectorButton = document.getElementById('toggleArchivedInspectorButton');
     const changePasswordButton = document.getElementById('changePasswordButton');
     const filterInspectorButton = document.getElementById('filterInspectorButton');
     const backToAdminListButton = document.getElementById('backToAdminListButton');
     const addInspectorButton = document.getElementById('addInspectorButton');
     const changePasswordInspectorButton = document.getElementById('changePasswordInspectorButton');
     const tableTitle = document.getElementById('tableTitle');
     const archivedInspectorSection = document.getElementById('archivedInspectorSection');

     // Show Admin-specific buttons
     addAccountButton.style.display = 'inline-block';
     viewArchivedButton.style.display = 'inline-block';
     changePasswordButton.style.display = 'inline-block';
     filterInspectorButton.style.display = 'inline-block';

     // Hide Inspector-specific buttons
     backToAdminListButton.style.display = 'none';
     addInspectorButton.style.display = 'none';
     changePasswordInspectorButton.style.display = 'none';
     toggleArchivedInspectorButton.style.display = 'none';
     archivedInspectorSection.style.display = 'none';

     // Update title for the Admin Staff view
     tableTitle.textContent = 'Admin Staff List';

     // Adjust table headers
     const tableHeader = document.getElementById('staffTable').querySelector('thead tr');
     tableHeader.innerHTML = `
         <th>Full Name</th>
         <th>Role</th>
         <th>Archive</th>
     `;

     // Fetch and display admin staff list
     fetchStaffNames();
 }

 function fetchInspectors() {
     fetch('/inspectors')
         .then(response => response.json())
         .then(data => renderInspectorTable(data))
         .catch(error => console.error('Error fetching inspectors:', error));
 }

 function renderInspectorTable(inspectors) {
     const inspectorTable = document.getElementById('staffNames');
     inspectorTable.innerHTML = ''; // Clear current table data

     inspectors.forEach(inspector => {
         const row = document.createElement('tr');

         const nameCell = document.createElement('td');
         nameCell.textContent = inspector.name;
         row.appendChild(nameCell);

         const archiveCell = document.createElement('td');
         const archiveButton = document.createElement('button');
         archiveButton.classList.add('archive-button');
         archiveButton.innerHTML = '<span class="material-icons">delete</span>';
         archiveButton.onclick = () => archiveInspector(inspector.name); // Archive function
         archiveCell.appendChild(archiveButton);

         row.appendChild(archiveCell);
         inspectorTable.appendChild(row);
     });
 }

 async function archiveInspector(inspectorName) {
     try {
         const response = await fetch('/archive-inspector', {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
             },
             body: JSON.stringify({ fullname: inspectorName }),
         });

         if (response.ok) {
             fetchInspectors(); // Refresh inspector list
             fetchArchivedInspectors(); // Refresh archived inspector list
         } else {
             console.error('Failed to archive inspector');
         }
     } catch (err) {
         console.error('Error archiving inspector:', err);
     }
 }

 // Toggle archived inspectors section visibility
 function toggleArchivedInspectorSection() {
     const archivedInspectorSection = document.getElementById('archivedInspectorSection');
     archivedInspectorsVisible = !archivedInspectorsVisible;
     archivedInspectorSection.style.display = archivedInspectorsVisible ? 'block' : 'none';

     const toggleButton = document.getElementById('toggleArchivedInspectorButton');
     toggleButton.textContent = archivedInspectorsVisible ? 'Hide Archived Inspector Accounts' : 'View Archived Inspector Accounts';

     if (archivedInspectorsVisible) {
         fetchArchivedInspectors(); // Refresh archived inspector list
     }
 }

 // Fetch and render archived inspectors
 async function fetchArchivedInspectors() {
     try {
         const response = await fetch('/archived-inspectors');
         const data = await response.json();

         if (response.ok) {
             renderArchivedInspectorTable(data);
         } else {
             console.error('Error fetching archived inspectors:', data.error);
         }
     } catch (error) {
         console.error('Error fetching archived inspectors:', error);
     }
 }

 function renderArchivedInspectorTable(archivedInspectors) {
     const archivedTable = document.getElementById('archivedInspectorNames');
     archivedTable.innerHTML = ''; // Clear existing rows

     archivedInspectors.forEach(inspector => {
         const row = document.createElement('tr');

         const nameCell = document.createElement('td');
         nameCell.textContent = inspector.name;
         row.appendChild(nameCell);

         const actionCell = document.createElement('td');
         const unarchiveButton = document.createElement('button');
         unarchiveButton.classList.add('unarchive-button');
         unarchiveButton.innerHTML = '<span class="material-icons">restore</span>';
         unarchiveButton.onclick = () => unarchiveInspector(inspector.name); // Corrected for unarchive function
         actionCell.appendChild(unarchiveButton);

         row.appendChild(actionCell);
         archivedTable.appendChild(row);
     });
 }

 // Unarchive an inspector
 async function unarchiveInspector(inspectorName) {
     try {
         const response = await fetch('/unarchive-inspector', {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
             },
             body: JSON.stringify({ fullname: inspectorName }),
         });

         if (response.ok) {
             fetchInspectors(); // Refresh inspector list
             fetchArchivedInspectors(); // Refresh archived inspector list
         } else {
             console.error('Failed to unarchive inspector');
         }
     } catch (err) {
         console.error('Error unarchiving inspector:', err);
     }
 }

 async function fetchStaffNames() {
     try {
         const activeResponse = await fetch('/admin-staff');
         const activeData = await activeResponse.json();
         activeAccounts = activeData;

         renderTables();
     } catch (err) {
         console.error('Error fetching staff names:', err);
     }
 }

 // Toggle the visibility of archived accounts
 function toggleArchivedAccounts() {
     archivedVisible = !archivedVisible;
     const archivedSection = document.getElementById('archivedSection');
     const viewArchivedButton = document.getElementById('viewArchivedButton');

     if (archivedVisible) {
         // Show archived accounts and change button text
         archivedSection.style.display = 'block';
         viewArchivedButton.textContent = 'Hide Archived Accounts';

         // Fetch archived accounts and display them
         fetchArchivedAccounts();
     } else {
         // Hide archived accounts and reset button text
         archivedSection.style.display = 'none';
         viewArchivedButton.textContent = 'View Archived Accounts';
     }
 }

 // Fetch archived accounts from the server and render them in the table
 async function fetchArchivedAccounts() {
     try {
         const response = await fetch('/archived-staff');
         const data = await response.json();

         if (response.ok) {
             renderArchivedAccounts(data);
         } else {
             console.error('Error fetching archived accounts:', data.error);
         }
     } catch (error) {
         console.error('Error fetching archived accounts:', error);
     }
 }

 // Render archived accounts in the archived table
 function renderArchivedAccounts(archivedAccounts) {
     const archivedNamesTable = document.getElementById('archivedNames');
     archivedNamesTable.innerHTML = ''; // Clear existing rows

     archivedAccounts.forEach(staff => {
         const row = document.createElement('tr');

         // Full Name cell
         const nameCell = document.createElement('td');
         nameCell.textContent = staff.fullname;
         row.appendChild(nameCell);

         // Role cell
         const roleCell = document.createElement('td');
         roleCell.textContent = staff.Role;
         row.appendChild(roleCell);

         // Unarchive action cell with a button
         const actionCell = document.createElement('td');
         const unarchiveButton = document.createElement('button');
         unarchiveButton.classList.add('unarchive-button');
         unarchiveButton.innerHTML = '<span class="material-icons">restore</span>';
         unarchiveButton.onclick = () => unarchiveAccount(staff.fullname); // Call unarchive function with fullname
         actionCell.appendChild(unarchiveButton);
         row.appendChild(actionCell);

         archivedNamesTable.appendChild(row);
     });
 }

 // Function to unarchive an account
 async function unarchiveAccount(accountName) {
     try {
         // Send request to unarchive account by full name
         const response = await fetch('/unarchive-account', {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
             },
             body: JSON.stringify({ fullname: accountName }),
         });

         if (response.ok) {
             console.log('Account unarchived successfully');
             fetchArchivedAccounts(); // Refresh the archived staff list to reflect changes
             fetchStaffNames(); // Also refresh the active staff list
         } else {
             console.error('Failed to unarchive account');
         }
     } catch (err) {
         console.error('Error unarchiving account:', err);
     }
 }

 // Function to archive an account
 async function archiveAccount(accountName) {
     try {
         // Send request to archive account by full name
         const response = await fetch('/archive-account', {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
             },
             body: JSON.stringify({ fullname: accountName }),
         });

         if (response.ok) {
             console.log('Account archived successfully');
             fetchStaffNames(); // Refresh the active staff list to reflect changes
         } else {
             console.error('Failed to archive account');
         }
     } catch (err) {
         console.error('Error archiving account:', err);
     }
 }

 function renderTables() {
     const staffNamesTable = document.getElementById('staffNames');
     staffNamesTable.innerHTML = ''; // Clear table
     activeAccounts.forEach(staff => {
         const row = document.createElement('tr');
         const nameCell = document.createElement('td');
         nameCell.textContent = staff.fullname;
         row.appendChild(nameCell);

         const roleCell = document.createElement('td');
         roleCell.textContent = staff.Role;
         row.appendChild(roleCell);

         const actionCell = document.createElement('td');
         const archiveButton = document.createElement('button');
         archiveButton.classList.add('archive-button');
         archiveButton.innerHTML = '<span class="material-icons">delete</span>';
         archiveButton.onclick = () => archiveAccount(staff.fullname);
         actionCell.appendChild(archiveButton);
         row.appendChild(actionCell);

         staffNamesTable.appendChild(row);
     });
 }

 window.onload = fetchStaffNames;