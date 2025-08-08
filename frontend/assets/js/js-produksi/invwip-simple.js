// Inventory WIP Simple JavaScript - PT. Topline Evergreen Manufacturing
// Simple WIP inventory management without delete functionality

let wipData = [];
let filteredData = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inventory WIP page loaded');
    loadInitialData();
    // Auto refresh setiap 30 detik untuk live data
    setInterval(loadWipData, 30000);
});

// Load initial data
async function loadInitialData() {
    try {
        await loadWipData();
    } catch (error) {
        console.error('Error loading initial data:', error);
        if (typeof showMessage === 'function') {
            showMessage('Error loading data. Please refresh the page.', 'error');
        }
    }
}

// Load WIP inventory data from backend
async function loadWipData() {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`http://localhost:3001/api/website/wip-inventory?_t=${timestamp}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        const result = await response.json();
        
        if (result.success) {
            wipData = result.data;
            filteredData = [...wipData];
            loadTableData();
            console.log('✅ Fresh WIP inventory data loaded from database:', wipData);
            updateStatusIndicator('connected');
        } else {
            console.error('Failed to load WIP data:', result.message);
            if (typeof showMessage === 'function') {
                showMessage('Failed to load WIP data: ' + result.message, 'error');
            }
            updateStatusIndicator('error');
        }
    } catch (error) {
        console.error('Error loading WIP data:', error);
        updateStatusIndicator('error');
        console.error('Failed to load WIP data from all endpoints:', error);
        wipData = [];
        renderTable();
    }
}

// Load table data
function loadTableData() {
    const tableBody = document.getElementById('wipTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    // Add "Add New" row at the top
    const addRow = document.createElement('tr');
    addRow.id = 'addRow';
    addRow.className = 'add-row';
    addRow.innerHTML = `
        <td><input type="text" id="newItemCode" placeholder="Item Code" class="table-input"></td>
        <td><input type="text" id="newDescription" placeholder="Description" class="table-input"></td>
        <td><input type="number" id="newQuantity" placeholder="Quantity" class="table-input" min="0"></td>
        <td>
            <select id="newUnit" class="table-input">
                <option value="">Unit</option>
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="ton">ton</option>
                <option value="box">box</option>
            </select>
        </td>
        <td><input type="text" id="newLocation" placeholder="Location" class="table-input"></td>
        <td><span class="timestamp">Now</span></td>
        <td>
            <button onclick="saveNewWip()" class="btn-save">Save</button>
            <button onclick="clearNewRow()" class="btn-cancel">Clear</button>
        </td>
    `;
    tableBody.appendChild(addRow);

    // Add existing data rows (NO DELETE BUTTON as per requirement)
    filteredData.forEach((wip, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${wip.item_code}</strong></td>
            <td>${wip.description}</td>
            <td class="text-center">${wip.quantity}</td>
            <td class="text-center">${wip.unit}</td>
            <td>${wip.location}</td>
            <td class="text-small">${formatTimestamp(wip.last_update)}</td>
            <td>
                <button onclick="editWip(${wip.id})" class="btn-edit">Edit</button>
                <span class="btn-disabled">View Only</span>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Save new WIP record
async function saveNewWip() {
    const itemCode = document.getElementById('newItemCode').value.trim();
    const description = document.getElementById('newDescription').value.trim();
    const quantity = document.getElementById('newQuantity').value;
    const unit = document.getElementById('newUnit').value;
    const location = document.getElementById('newLocation').value.trim();

    if (!itemCode || !description || !quantity || !unit || !location) {
        if (typeof showMessage === 'function') {
            showMessage('Please fill all required fields', 'warning');
        } else {
            alert('Please fill all required fields');
        }
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/api/website/wip-inventory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                item_code: itemCode,
                description: description,
                quantity: parseInt(quantity),
                unit: unit,
                location: location
            })
        });

        const result = await response.json();
        if (result.success) {
            if (typeof showMessage === 'function') {
                showMessage('WIP record added successfully!', 'success');
            }
            clearNewRow();
            loadWipData();
        } else {
            if (typeof showMessage === 'function') {
                showMessage('Failed to add WIP record: ' + result.message, 'error');
            } else {
                alert('Failed to add WIP record: ' + result.message);
            }
        }
    } catch (error) {
        console.error('Error saving WIP record:', error);
        if (typeof showMessage === 'function') {
            showMessage('Error saving WIP record. Please try again.', 'error');
        } else {
            alert('Error saving WIP record. Please try again.');
        }
    }
}

// Edit WIP record
function editWip(id) {
    if (typeof showMessage === 'function') {
        showMessage('Edit functionality available - implementation pending', 'info');
    } else {
        alert('Edit functionality available - implementation pending');
    }
}

// Clear new row inputs
function clearNewRow() {
    document.getElementById('newItemCode').value = '';
    document.getElementById('newDescription').value = '';
    document.getElementById('newQuantity').value = '';
    document.getElementById('newUnit').value = '';
    document.getElementById('newLocation').value = '';
}

// Search functionality
function searchData() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        filteredData = [...wipData];
    } else {
        filteredData = wipData.filter(wip => 
            wip.item_code.toLowerCase().includes(searchTerm) ||
            wip.description.toLowerCase().includes(searchTerm) ||
            wip.location.toLowerCase().includes(searchTerm)
        );
    }
    
    loadTableData();
}

// Export CSV functionality
function exportCSV() {
    try {
        if (!filteredData || filteredData.length === 0) {
            if (typeof showMessage === 'function') {
                showMessage('No data available to export', 'warning');
            } else {
                alert('No data available to export');
            }
            return;
        }

        const headers = ['Item Code', 'Description', 'Quantity', 'Unit', 'Location', 'Last Update'];
        
        // Create CSV content with BOM for Excel compatibility
        let csvContent = '\uFEFF' + headers.join(',') + '\r\n';
        
        filteredData.forEach(wip => {
            const row = [
                `"${wip.item_code || ''}"`,
                `"${wip.description || ''}"`,
                `"${wip.quantity || 0}"`,
                `"${wip.unit || ''}"`,
                `"${wip.location || ''}"`,
                `"${formatTimestamp(wip.last_update)}"`
            ];
            csvContent += row.join(',') + '\r\n';
        });

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `wip_inventory_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        if (typeof showMessage === 'function') {
            showMessage('CSV exported successfully!', 'success');
        }
    } catch (error) {
        console.error('Export CSV error:', error);
        if (typeof showMessage === 'function') {
            showMessage('Error exporting CSV: ' + error.message, 'error');
        } else {
            alert('Error exporting CSV: ' + error.message);
        }
    }
}

// Format timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID');
}

// Update status indicator
function updateStatusIndicator(status) {
    const statusDot = document.querySelector('.status-dot');
    if (statusDot) {
        statusDot.className = 'status-dot';
        switch(status) {
            case 'connected':
                statusDot.style.backgroundColor = '#10b981';
                break;
            case 'offline':
                statusDot.style.backgroundColor = '#f59e0b';
                break;
            case 'error':
                statusDot.style.backgroundColor = '#ef4444';
                break;
            default:
                statusDot.style.backgroundColor = '#6b7280';
        }
    }
}

// Add new WIP record
function addNew() {
    document.getElementById('newItemCode').focus();
}
