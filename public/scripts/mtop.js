document.addEventListener('DOMContentLoaded', function () {
    // Fetch and display MTOP records
    fetch('https://www.ecentersanluis.com/getMtopRecords') // Replace with your actual MTOP endpoint
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('mtop-table-body');
            data.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${record.id}</td>
                    <td>${record.applicationtype}</td>
                    <td>${record.fullname}</td>
                    <td>
                        <i class="fas fa-folder-open text-blue-600 cursor-pointer view-mtop-icon" 
                           data-id="${record.id}" 
                           data-name="${record.fullname}" 
                           data-type="${record.applicationtype}" 
                           data-address="${record.operatoraddress}" 
                           data-status="${record.status}">
                        </i>
                    </td>
                    <td class="text-center">${record.status}</td>
                `;
                tableBody.appendChild(row);
            });

            // Add event listener for document icon click
            document.querySelectorAll('.view-mtop-icon').forEach(icon => {
                icon.addEventListener('click', function () {
                    const modal = document.getElementById('mtopModal');
                    document.getElementById('modal-mtop-id').textContent = this.dataset.id;
                    document.getElementById('modal-mtop-name').textContent = this.dataset.name;
                    document.getElementById('modal-mtop-type').textContent = this.dataset.type;
                    document.getElementById('modal-mtop-address').textContent = this.dataset.address;
                    document.getElementById('modal-mtop-status').textContent = this.dataset.status;
                    modal.classList.remove('hidden'); // Show modal
                });
            });
        })
        .catch(error => console.error('Error fetching MTOP records:', error));

    // Close modal logic
    document.querySelector('.close-modal').addEventListener('click', function () {
        document.getElementById('mtopModal').classList.add('hidden');
    });

    // Close modal when clicking outside content
    window.addEventListener('click', function (event) {
        const modal = document.getElementById('mtopModal');
        if (event.target === modal) {
            modal.classList.add('hidden');
        }
    });
});
