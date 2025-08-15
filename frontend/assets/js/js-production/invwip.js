/**
 * WIP Inventory CRUD Management
 * PT. Topline Evergreen Manufacturing
 */

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('WIP Inventory CRUD Management loaded');
    initializeWIPCRUD();
});

/**
 * Initialize WIP CRUD Interface
 */
function initializeWIPCRUD() {
    // Initialize CRUD UI for WIP Stock module
    crudUI.init('stock/wip', 'wipCrudContainer', {
        showCreate: true,
        showEdit: true,
        showDelete: true,
        showSearch: true,
        showPagination: true
    });

    // Override default form fields for WIP
    crudUI.getDefaultFields = function() {
        return {
            partnumber: '',
            lotnumber: '', 
            quantity: 0,
            operator: '',
            pic_qc: '',
            pic_group_produksi: '',
            remarks: ''
        };
    };

    // Override form field creation for specific WIP fields
    crudUI.createFormField = function(fieldName, fieldType, value) {
        switch (fieldName) {
            case 'partnumber':
                return `
                    <input type="text" id="${fieldName}" name="${fieldName}" value="${value}" 
                           class="form-control" placeholder="e.g., PN001" required>
                    <small class="form-text text-muted">Part number sesuai BOM</small>
                `;
            
            case 'lotnumber':
                return `
                    <input type="text" id="${fieldName}" name="${fieldName}" value="${value}" 
                           class="form-control" placeholder="e.g., LOT001" required>
                    <small class="form-text text-muted">Nomor lot untuk tracking</small>
                `;
                
            case 'quantity':
                return `
                    <input type="number" id="${fieldName}" name="${fieldName}" value="${value}" 
                           class="form-control" min="1" step="1" required>
                    <small class="form-text text-muted">Jumlah unit dalam lot</small>
                `;
                
            case 'operator':
                return `
                    <select id="${fieldName}" name="${fieldName}" class="form-control" required>
                        <option value="">Pilih Operator</option>
                        <option value="operator1" ${value === 'operator1' ? 'selected' : ''}>Operator 1</option>
                        <option value="operator2" ${value === 'operator2' ? 'selected' : ''}>Operator 2</option>
                        <option value="operator3" ${value === 'operator3' ? 'selected' : ''}>Operator 3</option>
                        <option value="supervisor" ${value === 'supervisor' ? 'selected' : ''}>Supervisor</option>
                    </select>
                `;
                
            case 'pic_qc':
                return `
                    <select id="${fieldName}" name="${fieldName}" class="form-control">
                        <option value="">Pilih PIC QC</option>
                        <option value="qc_staff1" ${value === 'qc_staff1' ? 'selected' : ''}>QC Staff 1</option>
                        <option value="qc_staff2" ${value === 'qc_staff2' ? 'selected' : ''}>QC Staff 2</option>
                        <option value="qc_supervisor" ${value === 'qc_supervisor' ? 'selected' : ''}>QC Supervisor</option>
                    </select>
                `;
                
            case 'pic_group_produksi':
                return `
                    <select id="${fieldName}" name="${fieldName}" class="form-control">
                        <option value="">Pilih PIC Group Produksi</option>
                        <option value="prod_leader1" ${value === 'prod_leader1' ? 'selected' : ''}>Production Leader 1</option>
                        <option value="prod_leader2" ${value === 'prod_leader2' ? 'selected' : ''}>Production Leader 2</option>
                        <option value="prod_supervisor" ${value === 'prod_supervisor' ? 'selected' : ''}>Production Supervisor</option>
                    </select>
                `;
                
            case 'remarks':
                return `
                    <textarea id="${fieldName}" name="${fieldName}" class="form-control" rows="3" 
                              placeholder="Catatan tambahan...">${value}</textarea>
                `;
                
            default:
                return `<input type="${fieldType}" id="${fieldName}" name="${fieldName}" value="${value}" class="form-control">`;
        }
    };

    // Override table headers for better display
    crudUI.formatHeader = function(header) {
        const headerMap = {
            'partnumber': 'Part Number',
            'lotnumber': 'Lot Number',
            'quantity': 'Qty',
            'operator': 'Operator',
            'pic_qc': 'PIC QC',
            'pic_group_produksi': 'PIC Produksi',
            'remarks': 'Remarks',
            'customer': 'Customer',
            'model': 'Model',
            'description': 'Description',
            'created_at': 'Created',
            'updated_at': 'Updated'
        };
        return headerMap[header] || header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Override cell value formatting for better display
    crudUI.formatCellValue = function(value) {
        if (value === null || value === undefined || value === '') return '-';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'number') return value.toLocaleString();
        if (typeof value === 'string') {
            // Format dates
            if (value.includes('T') && value.includes('Z') && value.length > 15) {
                return new Date(value).toLocaleDateString('id-ID') + ' ' + 
                       new Date(value).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            }
            // Truncate long text
            if (value.length > 50) {
                return value.substring(0, 47) + '...';
            }
        }
        return value;
    };

    // Custom validation
    crudUI.validateForm = function(formData) {
        const errors = [];
        
        if (!formData.partnumber || formData.partnumber.trim() === '') {
            errors.push('Part Number is required');
        }
        
        if (!formData.lotnumber || formData.lotnumber.trim() === '') {
            errors.push('Lot Number is required');
        }
        
        if (!formData.quantity || parseInt(formData.quantity) <= 0) {
            errors.push('Quantity must be greater than 0');
        }
        
        if (!formData.operator || formData.operator.trim() === '') {
            errors.push('Operator is required');
        }
        
        return errors;
    };

    // Override form submission to include validation
    const originalHandleSubmit = crudUI.handleSubmit;
    crudUI.handleSubmit = async function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Validate form
        const errors = this.validateForm(data);
        if (errors.length > 0) {
            this.showError('Validation errors: ' + errors.join(', '));
            return;
        }
        
        // Call original submit handler
        return originalHandleSubmit.call(this, e);
    };
}

/**
 * Custom functions for WIP management
 */

// Generate automatic lot number
function generateLotNumber() {
    const today = new Date();
    const year = today.getFullYear().toString().substr(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const time = today.getHours().toString().padStart(2, '0') + 
                 today.getMinutes().toString().padStart(2, '0');
    
    return `LOT${year}${month}${day}${time}`;
}

// Add auto-generation button for lot number
function enhanceFormWithAutoGeneration() {
    // Wait for form to be created, then enhance it
    setTimeout(() => {
        const lotNumberField = document.getElementById('lotnumber');
        if (lotNumberField && !document.getElementById('btnAutoLot')) {
            const autoButton = document.createElement('button');
            autoButton.type = 'button';
            autoButton.id = 'btnAutoLot';
            autoButton.className = 'btn btn-sm btn-outline-secondary';
            autoButton.innerHTML = 'Auto Generate';
            autoButton.style.marginLeft = '10px';
            autoButton.onclick = function() {
                lotNumberField.value = generateLotNumber();
            };
            
            lotNumberField.parentNode.appendChild(autoButton);
        }
    }, 100);
}

// Override show create modal to add enhancements
const originalShowCreateModal = crudUI.showCreateModal;
crudUI.showCreateModal = function() {
    originalShowCreateModal.call(this);
    enhanceFormWithAutoGeneration();
};

// Add custom styles for WIP specific elements
function addCustomStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .form-text {
            font-size: 0.875em;
            color: #6c757d;
            margin-top: 0.25rem;
        }
    `;
    document.head.appendChild(style);
}

// Initialize custom styles when page loads
document.addEventListener('DOMContentLoaded', addCustomStyles);

// Export functions for global access
window.initializeWIPCRUD = initializeWIPCRUD;
window.generateLotNumber = generateLotNumber;

// Load WIP inventory data from backend - Always fresh from database
async function loadWipInventoryData() {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`http://localhost:3001/api/website/wipinventory?_t=${timestamp}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        const result = await response.json();
        
        if (result.success) {
            wipInventoryData = result.data;
            filteredData = [...wipInventoryData];
            loadTableData();
            console.log('✅ Fresh WIP inventory data loaded from database:', wipInventoryData);
            updateStatusIndicator('connected');
        } else {
            console.error('Failed to load WIP inventory data:', result.message);
            showMessage('Failed to load WIP inventory data: ' + result.message, 'error');
            updateStatusIndicator('error');
        }
    } catch (error) {
        console.error('Error loading WIP inventory data:', error);
        showMessage('Error loading WIP inventory data. Please check connection.', 'error');
        updateStatusIndicator('disconnected');
    }
}

function loadTableData() {
    const tableBody = document.getElementById('wipInventoryTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    // Add "Add New" row at the top
    const addRow = document.createElement('tr');
    addRow.id = 'addRow';
    addRow.className = 'add-row';
    addRow.innerHTML = `
        <td><input type="text" id="newPartNumber" placeholder="Part Number" class="table-input"></td>
        <td><input type="text" id="newModel" placeholder="Model" class="table-input"></td>
        <td><input type="text" id="newLocation" placeholder="Location" class="table-input"></td>
        <td><input type="number" id="newQuantityIn" placeholder="Qty In" class="table-input" min="0"></td>
        <td><input type="number" id="newQuantityOut" placeholder="Qty Out" class="table-input" min="0"></td>
        <td><span id="newBalance" class="balance-display">0</span></td>
        <td><input type="text" id="newOperator" placeholder="Operator" class="table-input"></td>
        <td><input type="text" id="newRemarks" placeholder="Remarks" class="table-input"></td>
        <td>
            <button onclick="saveNewWipInventory()" class="btn-save">Save</button>
            <button onclick="clearNewRow()" class="btn-cancel">Clear</button>
        </td>
    `;
    tableBody.appendChild(addRow);

    // Add event listeners for balance calculation
    document.getElementById('newQuantityIn').addEventListener('input', calculateNewBalance);
    document.getElementById('newQuantityOut').addEventListener('input', calculateNewBalance);

    // Add existing data rows
    filteredData.forEach((item, index) => {
        const row = document.createElement('tr');
        const balance = (item.quantity_in || 0) - (item.quantity_out || 0);
        const balanceClass = getBalanceClass(balance);
        
        row.innerHTML = `
            <td><strong>${item.part_number}</strong></td>
            <td>${item.model}</td>
            <td>${item.location}</td>
            <td class="text-center">${item.quantity_in || 0}</td>
            <td class="text-center">${item.quantity_out || 0}</td>
            <td class="text-center"><span class="balance-badge ${balanceClass}">${balance}</span></td>
            <td>${item.operator || '-'}</td>
            <td class="text-small">${item.remarks || '-'}</td>
            <td>
                <button onclick="editWipInventory(${item.id})" class="btn-edit">Edit</button>
                <button onclick="deleteWipInventory(${item.id})" class="btn-delete">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function getBalanceClass(balance) {
    if (balance > 100) return 'high-stock';
    if (balance > 0) return 'normal-stock';
    if (balance === 0) return 'zero-stock';
    return 'negative-stock';
}

function calculateNewBalance() {
    const quantityIn = parseFloat(document.getElementById('newQuantityIn').value) || 0;
    const quantityOut = parseFloat(document.getElementById('newQuantityOut').value) || 0;
    const balance = quantityIn - quantityOut;
    
    document.getElementById('newBalance').textContent = balance;
    document.getElementById('newBalance').className = `balance-display ${getBalanceClass(balance)}`;
}

async function saveNewWipInventory() {
    const part_number = document.getElementById('newPartNumber').value.trim();
    const model = document.getElementById('newModel').value.trim();
    const location = document.getElementById('newLocation').value.trim();
    const quantity_in = parseFloat(document.getElementById('newQuantityIn').value) || 0;
    const quantity_out = parseFloat(document.getElementById('newQuantityOut').value) || 0;
    const operator = document.getElementById('newOperator').value.trim();
    const remarks = document.getElementById('newRemarks').value.trim();

    if (!part_number || !model || !location) {
        showMessage('Part Number, Model, and Location are required', 'error');
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/api/website/wipinventory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                part_number,
                model,
                location,
                quantity_in,
                quantity_out,
                operator,
                remarks
            })
        });

        const result = await response.json();

        if (result.success) {
            showMessage('WIP inventory record added successfully!', 'success');
            clearNewRow();
            loadWipInventoryData(); // Reload data from server
        } else {
            showMessage('Failed to add WIP inventory: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error adding WIP inventory:', error);
        showMessage('Error adding WIP inventory. Please try again.', 'error');
    }
}

function clearNewRow() {
    document.getElementById('newPartNumber').value = '';
    document.getElementById('newModel').value = '';
    document.getElementById('newLocation').value = '';
    document.getElementById('newQuantityIn').value = '';
    document.getElementById('newQuantityOut').value = '';
    document.getElementById('newOperator').value = '';
    document.getElementById('newRemarks').value = '';
    document.getElementById('newBalance').textContent = '0';
    document.getElementById('newBalance').className = 'balance-display zero-stock';
}

async function editWipInventory(id) {
    // Implementation for editing WIP inventory
    const item = wipInventoryData.find(w => w.id === id);
    if (!item) return;

    const newQuantityIn = prompt(`Update quantity in for ${item.part_number}:`, item.quantity_in || 0);
    if (newQuantityIn !== null && !isNaN(newQuantityIn)) {
        try {
            const response = await fetch(`http://localhost:3001/api/website/wipinventory/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity_in: parseFloat(newQuantityIn) })
            });

            const result = await response.json();
            if (result.success) {
                showMessage('WIP inventory updated successfully!', 'success');
                loadWipInventoryData();
            } else {
                showMessage('Failed to update WIP inventory: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error updating WIP inventory:', error);
            showMessage('Error updating WIP inventory. Please try again.', 'error');
        }
    }
}

async function deleteWipInventory(id) {
    const item = wipInventoryData.find(w => w.id === id);
    if (!item || !confirm(`Delete WIP inventory record for ${item.part_number}?`)) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3001/api/website/wipinventory/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            showMessage('WIP inventory deleted successfully!', 'success');
            loadWipInventoryData();
        } else {
            showMessage('Failed to delete WIP inventory: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting WIP inventory:', error);
        showMessage('Error deleting WIP inventory. Please try again.', 'error');
    }
}

function searchData() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();

    filteredData = wipInventoryData.filter(item => 
        item.part_number.toLowerCase().includes(searchTerm) ||
        item.model.toLowerCase().includes(searchTerm) ||
        item.location.toLowerCase().includes(searchTerm) ||
        (item.operator && item.operator.toLowerCase().includes(searchTerm)) ||
        (item.remarks && item.remarks.toLowerCase().includes(searchTerm))
    );

    loadTableData();
}

function addNew() {
    document.getElementById('newPartNumber').focus();
}

function exportCSV() {
    try {
        if (!filteredData || filteredData.length === 0) {
            showMessage('No data available to export', 'warning');
            return;
        }

        const headers = ['Part Number', 'Model', 'Location', 'Quantity In', 'Quantity Out', 'Balance', 'Operator', 'Remarks', 'Last Update'];
        
        // Create CSV content with BOM for Excel compatibility
        let csvContent = '\uFEFF' + headers.join(',') + '\r\n';
        
        filteredData.forEach(item => {
            const balance = (item.quantity_in || 0) - (item.quantity_out || 0);
            const row = [
                `"${item.part_number || ''}"`,
                `"${item.model || ''}"`,
                `"${item.location || ''}"`,
                `"${item.quantity_in || 0}"`,
                `"${item.quantity_out || 0}"`,
                `"${balance}"`,
                `"${item.operator || ''}"`,
                `"${item.remarks || ''}"`,
                `"${formatTimestamp(item.last_update)}"`
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
        
        showMessage('CSV exported successfully!', 'success');
    } catch (error) {
        console.error('Export CSV error:', error);
        showMessage('Error exporting CSV: ' + error.message, 'error');
    }
}

function formatTimestamp(timestamp) {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID');
}

function updateStatusIndicator(status) {
    const statusDot = document.querySelector('.status-dot');
    if (statusDot) {
        statusDot.className = 'status-dot';
        switch(status) {
            case 'connected':
                statusDot.style.backgroundColor = '#10b981';
                break;
            case 'disconnected':
                statusDot.style.backgroundColor = '#f59e0b';
                break;
            case 'error':
                statusDot.style.backgroundColor = '#ef4444';
                break;
        }
    }
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    let backgroundColor;
    let textColor = 'white';
    
    switch(type) {
        case 'success':
            backgroundColor = '#10b981';
            break;
        case 'error':
            backgroundColor = '#ef4444';
            break;
        case 'warning':
            backgroundColor = '#f59e0b';
            textColor = '#000';
            break;
        default:
            backgroundColor = '#3b82f6';
    }
    
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${backgroundColor};
        color: ${textColor};
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        font-weight: 500;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}
