
let showingOccuPermit = true;



function toggleTable() {
    const toggleButton = document.getElementById('toggleButton');
    if (showingOccuPermit) {
        displayInspectionsApplicants();
        toggleButton.innerText = "Show the Applicants for Occupational Permit";
    } else {
        displayOccuPermitApplicants();
        toggleButton.innerText = "Show the Applicants for the Inspections";
    }
    showingOccuPermit = !showingOccuPermit;
}

async function displayOccuPermitApplicants() {
    const occuPermitApplicants = await fetchData(`https://capstone-project-six-psi.vercel.app/data/occupermit-applicants`);
    const applicantTable = document.getElementById('applicantTable');
    applicantTable.innerHTML = ''; 

    const table = createTable(['Occuid', 'Name'], occuPermitApplicants, 'Occuid', 'applicant_name');
    applicantTable.appendChild(table);
}

async function displayInspectionsApplicants() {
    const inspectionsApplicants = await fetchData(`https://capstone-project-six-psi.vercel.app/data/inspections-applicants`);
    const applicantTable = document.getElementById('applicantTable');
    applicantTable.innerHTML = ''; 

    const table = createTable(['MTOP ID', 'Name'], inspectionsApplicants, 'mtop_id', 'applicant_name');
    applicantTable.appendChild(table);
}

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error fetching data from ${url}`);
        const data = await response.json();
        return Array.isArray(data) ? data : data.data;
    } catch (error) {
        console.error("Fetch error:", error.message);
        return null;
    }
}

// Utility function to create a table with headers and data rows
function createTable(headers, data, idField, nameField) {
    const tableContainer = document.createElement('div');
    tableContainer.classList.add('table-container');

    const table = document.createElement('table');
    table.classList.add('applicant-table', 'min-w-full', 'border-collapse', 'rounded-lg', 'shadow-lg', 'overflow-hidden');

    // Create header row
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.innerText = header;
        th.classList.add('py-3', 'px-5', 'font-semibold', 'bg-blue-700', 'text-white', 'border-b', 'border-gray-200', 'text-center');
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create data rows
    if (Array.isArray(data) && data.length > 0) {
        data.forEach(applicant => {
            const row = document.createElement('tr');
            row.classList.add('bg-white', 'hover:bg-blue-100', 'border-b', 'border-gray-200');

            const idCell = document.createElement('td');
            idCell.innerText = applicant[idField];
            idCell.classList.add('py-3', 'px-5', 'text-center'); // Center-align for ID
            row.appendChild(idCell);

            const nameCell = document.createElement('td');
            nameCell.innerText = applicant[nameField];
            nameCell.classList.add('py-3', 'px-5', 'text-center'); // Center-align for Name
            row.appendChild(nameCell);

            table.appendChild(row);
        });
    } else {
        // Display message if data is empty or incorrectly formatted
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = headers.length;
        cell.innerText = 'No applicants found or data format is incorrect.';
        cell.classList.add('py-3', 'px-5', 'text-center');
        row.appendChild(cell);
        table.appendChild(row);
    }

    tableContainer.appendChild(table);
    return tableContainer;
}


// Initial load of occupational permit applicants
displayOccuPermitApplicants();
