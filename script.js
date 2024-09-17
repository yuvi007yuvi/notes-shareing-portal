document.getElementById('file-input').addEventListener('change', handleFile, false);

function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        displayTable(json);
        displayCards(json);
    };
    
    reader.readAsArrayBuffer(file);
}

function displayTable(data) {
    const columns = ['Qrcodeid', 'Scaned by', 'Before Scan', 'After Scan', 'Ward', 'Zone', 'Dhalao Name'];

    // Collect unique values for dropdowns
    const uniqueValues = {};
    columns.forEach(col => {
        uniqueValues[col] = [...new Set(data.map(row => row[col] || ''))].sort();
    });

    let html = '<table class="table table-striped table-bordered"><thead><tr>';
    
    // Add Serial No column header
    html += '<th>Serial No</th>';

    // Create table headers with dropdown filters
    columns.forEach(col => {
        html += `<th><select onchange="filterTable(this)">
                    <option value="">All ${col}</option>`;
        uniqueValues[col].forEach(val => {
            html += `<option value="${val}">${val}</option>`;
        });
        html += `</select>${col}</th>`;
    });
    html += '</tr></thead><tbody id="table-body">';
    
    // Create table rows with serial numbers
    data.forEach((row, index) => {
        html += '<tr>';
        html += `<td>${index + 1}</td>`; // Serial number
        columns.forEach(col => {
            const cellValue = row[col] ? row[col] : 'N/A';
            if (col === 'After Scan' && cellValue === 'NA') {
                html += `<td data-highlight="true">${cellValue}</td>`;
            } else {
                html += `<td>${cellValue}</td>`;
            }
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    
    document.getElementById('results-table').innerHTML = html;
    updateSerialNumbers();
}

function displayCards(data) {
    const totalRecords = data.length;
    const scannedQr = data.filter(row => row['After Scan'] !== 'NA' && row['After Scan'] !== undefined).length;
    const notScannedQr = data.filter(row => row['After Scan'] === 'NA' || row['After Scan'] === undefined).length;

    // Count rows with null or empty values in specific columns
    const nullBeforeScan = data.filter(row => !row['Before Scan'] || row['Before Scan'].trim() === '').length;
    const nullAfterScan = data.filter(row => !row['After Scan'] || row['After Scan'].trim() === '').length;

    const cardsHtml = `
        <div class="row">
            <div class="col-md-6">
                <div class="card total-records">
                    <div class="card-header">Total Records</div>
                    <div class="card-body">
                        <p class="card-text">${totalRecords}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card scanned-qr">
                    <div class="card-header">Total Scanned QR</div>
                    <div class="card-body">
                        <p class="card-text">${scannedQr}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card not-scanned-qr">
                    <div class="card-header">Not Scanned QR</div>
                    <div class="card-body">
                        <p class="card-text">${notScannedQr}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card null-before-scan">
                    <div class="card-header">Null or Empty Before Scan</div>
                    <div class="card-body">
                        <p class="card-text">${nullBeforeScan}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card null-after-scan">
                    <div class="card-header">Null or Empty After Scan</div>
                    <div class="card-body">
                        <p class="card-text">${nullAfterScan}</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('report-cards').innerHTML = cardsHtml;
}

function filterTable(select) {
    const filterValue = select.value;
    const columnIndex = select.parentElement.cellIndex;
    const tableBody = document.getElementById('table-body');
    const rows = tableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const cell = row.cells[columnIndex];
        const text = cell.textContent || cell.innerText;
        if (filterValue === '' || text === filterValue) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    updateSerialNumbers();
}

function updateSerialNumbers() {
    const tableBody = document.getElementById('table-body');
    const rows = tableBody.querySelectorAll('tr');
    let serial = 1;
    
    rows.forEach(row => {
        if (row.style.display !== 'none') {
            row.cells[0].textContent = serial++;
        }
    });
}

function exportToExcel() {
    const wb = XLSX.utils.table_to_book(document.querySelector('table'));
    XLSX.writeFile(wb, 'table.xlsx');
}

function exportToPNG() {
    html2canvas(document.querySelector('#results-table')).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'table.png';
        link.click();
    });
}
