document.getElementById('upload-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const fileInput = document.getElementById('excel-file');
    const file = fileInput.files[0];
    
    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

        // Generate the report with the data, skipping the first row
        generateReport(worksheet.slice(1)); // Start from the second row
    };

    reader.readAsArrayBuffer(file);
});

function generateReport(data) {
    const reportSection = document.getElementById('report-table');
    reportSection.innerHTML = ''; // Clear previous report content

    // Create table element
    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered');
    table.id = 'report';

    // Add table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th class="font-weight-bold">Zone</th>
            <th class="font-weight-bold">Ward</th>
            <th class="font-weight-bold">Vehicle Number</th>
            <th class="font-weight-bold">Route Name</th>
            <th class="font-weight-bold">Total</th>
            <th class="font-weight-bold">Covered</th>
            <th class="font-weight-bold">Not Covered</th>
            <th class="font-weight-bold">Percentage (%)</th>
            <th class="font-weight-bold">Remark</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const zones = new Set();
    const wards = new Set();

    data.forEach(row => {
        if (!Array.isArray(row) || row.length < 8) return; // Skip non-array or invalid rows

        const [zone, ward, vehicleNumber, routeName, total, covered, notCovered, percentage] = row;

        // Default values
        const zoneText = zone || 'N/A';
        const wardText = ward || 'N/A';
        const vehicleNumberText = vehicleNumber || 'N/A';
        const routeNameText = routeName || 'N/A';
        const totalText = total || 'N/A';
        const coveredText = covered || 'N/A';
        const notCoveredText = notCovered || 'N/A';
        const percentageValue = parseFloat(percentage) || 0; // Default to 0 if NaN

        // Add to zone and ward sets for filtering options
        if (zoneText && wardText) {
            zones.add(zoneText);
            wards.add(wardText);
        }

        // Determine the remark based on the percentage
        const remark = getRemark(percentageValue);

        // Append row to the table body
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="font-weight-bold">${zoneText}</td>
            <td class="font-weight-bold">${wardText}</td>
            <td class="font-weight-bold">${vehicleNumberText}</td>
            <td class="font-weight-bold">${routeNameText}</td>
            <td class="font-weight-bold">${totalText}</td>
            <td class="font-weight-bold">${coveredText}</td>
            <td class="font-weight-bold">${notCoveredText}</td>
            <td class="font-weight-bold">${percentageValue ? percentageValue.toFixed(2) : 'N/A'}</td>
            <td class="font-weight-bold ${getRemarkClass(remark)}">${remark}</td>
        `;
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    reportSection.appendChild(table); // Append the table to the report section

    // Populate filtering options
    populateFilterOptions(Array.from(zones), data);

    // Add event listeners for filtering
    document.getElementById('filter-zone').addEventListener('change', filterReport);
    document.getElementById('filter-ward').addEventListener('change', filterReport);
    document.getElementById('filter-remark').addEventListener('change', filterReport);
    document.getElementById('search').addEventListener('input', filterReport);
    
    // Show the export button
    document.getElementById('export-button').style.display = 'block';
    document.getElementById('export-button').addEventListener('click', exportToExcel);
}

function getRemark(percentage) {
    if (percentage < 50) {
        return "Poor";
    } else if (percentage < 80) {
        return "Average";
    } else {
        return "Good";
    }
}

function getRemarkClass(remark) {
    switch (remark) {
        case "Poor": return "text-danger"; // Red color for Poor
        case "Average": return "text-warning"; // Yellow color for Average
        case "Good": return "text-success"; // Green color for Good
        default: return ""; // Default class
    }
}

function populateFilterOptions(zones, data) {
    const zoneSelect = document.getElementById('filter-zone');
    const wardSelect = document.getElementById('filter-ward');

    // Clear existing options
    zoneSelect.innerHTML = '<option value="">Select Zone</option>';
    wardSelect.innerHTML = '<option value="">Select Ward</option>';

    zones.forEach(zone => {
        const option = document.createElement('option');
        option.value = zone;
        option.textContent = zone;
        zoneSelect.appendChild(option);
    });

    // Populate ward options based on zone selection
    zoneSelect.addEventListener('change', () => {
        const selectedZone = zoneSelect.value;

        // Clear previous ward options
        wardSelect.innerHTML = '<option value="">Select Ward</option>';

        // Populate wards corresponding to the selected zone
        const filteredWards = new Set();
        data.forEach(row => {
            if (row[0] === selectedZone && row[1]) {
                filteredWards.add(row[1]); // Add ward if it matches the selected zone
            }
        });

        filteredWards.forEach(ward => {
            const option = document.createElement('option');
            option.value = ward;
            option.textContent = ward;
            wardSelect.appendChild(option);
        });
    });

    // Initialize ward options for the first time
    zoneSelect.dispatchEvent(new Event('change'));
}

function filterReport() {
    const selectedZone = document.getElementById('filter-zone').value;
    const selectedWard = document.getElementById('filter-ward').value;
    const selectedRemark = document.getElementById('filter-remark').value; 
    const searchQuery = document.getElementById('search').value.toLowerCase();

    const rows = document.querySelectorAll('#report tbody tr');
    rows.forEach(row => {
        const zone = row.cells[0].textContent;
        const ward = row.cells[1].textContent;
        const routeName = row.cells[3].textContent.toLowerCase();
        const vehicleNumber = row.cells[2].textContent.toLowerCase();
        const remark = row.cells[8].textContent; 

        const zoneMatch = selectedZone === '' || zone === selectedZone;
        const wardMatch = selectedWard === '' || ward === selectedWard;
        const remarkMatch = selectedRemark === '' || remark === selectedRemark; 
        const searchMatch = routeName.includes(searchQuery) || vehicleNumber.includes(searchQuery);

        row.style.display = zoneMatch && wardMatch && remarkMatch && searchMatch ? '' : 'none';
    });
}

function exportToExcel() {
    const table = document.getElementById('report');
    if (!table) {
        alert('No report to export');
        return;
    }
    const workbook = XLSX.utils.table_to_book(table, { sheet: "Report" });
    XLSX.writeFile(workbook, "coverage_tracking_report.xlsx");
}
