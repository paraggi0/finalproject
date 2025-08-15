// Machine Output JavaScript - PT. Topline Evergreen Manufacturing
// Real-time data fetching from database with cascading dropdown - No caching
let outputData = [];
let filteredData = [];
let editingRow = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Machine Output page loaded');
    loadInitialData();
});

// Load initial data
async function loadInitialData() {
    try {
        await loadOutputData();
    } catch (error) {
        console.error('Error loading initial data:', error);
        showMessage('Error loading data. Please refresh the page.', 'error');
    }
}

// Load customers from BOM - Always fresh from database
async function loadCustomers() {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`http://localhost:3001/api/website/bom/customers?_t=${timestamp}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        const result = await response.json();
        
        if (result.success) {
            window.customersData = result.data;
            console.log('✅ Fresh customers loaded from database:', window.customersData);
            return result.data;
        } else {
            console.error('Failed to load customers:', result.message);
            return [];
        }
    } catch (error) {
        console.error('Error loading customers:', error);
        return [];
    }
}

// Load descriptions by customer - Always fresh from database
async function loadDescriptions(customer) {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`http://localhost:3001/api/website/bom/descriptions/${encodeURIComponent(customer)}?_t=${timestamp}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        const result = await response.json();
        
        if (result.success) {
            console.log(`✅ Fresh descriptions loaded for ${customer}:`, result.data);
            return result.data;
        } else {
            console.error('Failed to load descriptions:', result.message);
            return [];
        }
    } catch (error) {
        console.error('Error loading descriptions:', error);
        return [];
    }
}

// Load parts by customer and description - Always fresh from database
async function loadParts(customer, description) {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`http://localhost:3001/api/website/bom/parts/${encodeURIComponent(customer)}/${encodeURIComponent(description)}?_t=${timestamp}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        const result = await response.json();
        
        if (result.success) {
            console.log(`✅ Fresh parts loaded for ${customer} - ${description}:`, result.data);
            return result.data;
        } else {
            console.error('Failed to load parts:', result.message);
            return [];
        }
    } catch (error) {
        console.error('Error loading parts:', error);
        return [];
    }
}

// Load output data from backend - Always fresh from database
async function loadOutputData() {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`http://localhost:3001/api/website/outputmc?_t=${timestamp}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        const result = await response.json();
        
        if (result.success) {
            outputData = result.data;
            filteredData = [...outputData];
            await loadTableData();
            console.log('✅ Fresh output data loaded from database:', outputData);
        } else {
            console.error('Failed to load output data:', result.message);
            showMessage('Failed to load output data: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error loading output data:', error);
        showMessage('Error loading output data. Please check connection.', 'error');
    }
}

// Create customer dropdown with fresh data
async function createCustomerDropdown(id, selectedValue = '') {
    const customers = await loadCustomers();
    
    let options = '<option value="">Select Customer</option>';
    if (customers && customers.length > 0) {
        customers.forEach(customer => {
            const selected = customer === selectedValue ? 'selected' : '';
            options += `<option value="${customer}" ${selected}>${customer}</option>`;
        });
    }
    
    return `<select id="${id}" class="table-input" onchange="onCustomerChange('${id}')">${options}</select>`;
}

// Create description dropdown
function createDescriptionDropdown(id, descriptions = [], selectedValue = '') {
    let options = '<option value="">Select Description</option>';
    descriptions.forEach(desc => {
        const selected = desc === selectedValue ? 'selected' : '';
        options += `<option value="${desc}" ${selected}>${desc}</option>`;
    });
    
    return `<select id="${id}" class="table-input" onchange="onDescriptionChange('${id}')" disabled>${options}</select>`;
}

// Handle customer selection change
async function onCustomerChange(selectId) {
    const customerSelect = document.getElementById(selectId);
    const customer = customerSelect.value;
    
    // Get corresponding description and part inputs
    const descriptionId = selectId.replace('Customer', 'Description');
    const partnumberId = selectId.replace('Customer', 'Partnumber');
    const modelId = selectId.replace('Customer', 'Model');
    
    const descriptionSelect = document.getElementById(descriptionId);
    const partnumberInput = document.getElementById(partnumberId);
    const modelInput = document.getElementById(modelId);
    
    if (customer) {
        // Load descriptions for selected customer
        const descriptions = await loadDescriptions(customer);
        
        // Update description dropdown
        let options = '<option value="">Select Description</option>';
        descriptions.forEach(desc => {
            options += `<option value="${desc}">${desc}</option>`;
        });
        descriptionSelect.innerHTML = options;
        descriptionSelect.disabled = false;
    } else {
        // Reset dependent fields
        descriptionSelect.innerHTML = '<option value="">Select Description</option>';
        descriptionSelect.disabled = true;
        if (partnumberInput) partnumberInput.value = '';
        if (modelInput) modelInput.value = '';
    }
}

// Handle description selection change
async function onDescriptionChange(selectId) {
    const descriptionSelect = document.getElementById(selectId);
    const description = descriptionSelect.value;
    
    // Get corresponding customer, part, and model inputs
    const customerId = selectId.replace('Description', 'Customer');
    const partnumberId = selectId.replace('Description', 'Partnumber');
    const modelId = selectId.replace('Description', 'Model');
    
    const customerSelect = document.getElementById(customerId);
    const partnumberInput = document.getElementById(partnumberId);
    const modelInput = document.getElementById(modelId);
    
    const customer = customerSelect.value;
    
    if (customer && description) {
        // Load parts for selected customer and description
        const parts = await loadParts(customer, description);
        
        if (parts.length > 0) {
            // Auto-fill with first matching part
            const part = parts[0];
            if (partnumberInput) partnumberInput.value = part.partnumber;
            if (modelInput) modelInput.value = part.model;
        }
    } else {
        if (partnumberInput) partnumberInput.value = '';
        if (modelInput) modelInput.value = '';
    }
}

async function loadTableData() {
    const tableBody = document.getElementById('outputTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    // Add "Add New" row at the top
    const addRow = document.createElement('tr');
    addRow.id = 'addRow';
    addRow.className = 'add-row';
    
    // Get fresh customer dropdown
    const customerDropdown = await createCustomerDropdown('newCustomer');
    
    addRow.innerHTML = `
        <td>${customerDropdown}</td>
        <td><input type="text" id="newPartnumber" placeholder="Part Number" class="table-input" readonly></td>
        <td><input type="text" id="newModel" placeholder="Model" class="table-input" readonly></td>
        <td>${createDescriptionDropdown('newDescription')}</td>
        <td><input type="number" id="newQuantity" placeholder="Quantity" class="table-input" min="1"></td>
        <td><input type="number" id="newQuantityNg" placeholder="NG Qty" class="table-input" min="0" value="0"></td>
        <td><input type="text" id="newMachine" placeholder="Machine ID" class="table-input"></td>
        <td><input type="text" id="newOperator" placeholder="Operator" class="table-input"></td>
        <td>
            <button onclick="saveNewOutput()" class="btn-save">Save</button>
            <button onclick="clearNewRow()" class="btn-cancel">Clear</button>
        </td>
    `;
    tableBody.appendChild(addRow);

    // Add existing data rows
    filteredData.forEach((output, index) => {
        const row = document.createElement('tr');
        const ngRate = output.quantity > 0 ? ((output.quantity_ng / output.quantity) * 100).toFixed(1) : 0;
        const ngClass = ngRate > 5 ? 'high-ng' : ngRate > 2 ? 'medium-ng' : 'low-ng';
        
        row.innerHTML = `
            <td>${output.customer || ''}</td>
            <td><strong>${output.partnumber}</strong></td>
            <td>${output.model}</td>
            <td class="text-small">${output.description || ''}</td>
            <td class="text-center"><strong>${output.quantity}</strong></td>
            <td class="text-center"><span class="ng-badge ${ngClass}">${output.quantity_ng || 0} (${ngRate}%)</span></td>
            <td class="text-center">${output.machine || '-'}</td>
            <td>${output.operator || '-'}</td>
            <td>
                <button onclick="editOutput(${output.id})" class="btn-edit">Edit</button>
                <button onclick="deleteOutput(${output.id})" class="btn-delete">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function saveNewOutput() {
    const customer = document.getElementById('newCustomer').value.trim();
    const partnumber = document.getElementById('newPartnumber').value.trim();
    const model = document.getElementById('newModel').value.trim();
    const description = document.getElementById('newDescription').value.trim();
    const quantity = parseInt(document.getElementById('newQuantity').value);
    const quantity_ng = parseInt(document.getElementById('newQuantityNg').value) || 0;
    const machine = document.getElementById('newMachine').value.trim();
    const operator = document.getElementById('newOperator').value.trim();

    if (!customer || !partnumber || !model || !quantity) {
        showMessage('Customer, Part Number, Model, and Quantity are required', 'error');
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/api/website/outputmc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customer,
                partnumber,
                model,
                description,
                quantity,
                quantity_ng,
                machine,
                operator
            })
        });

        const result = await response.json();

        if (result.success) {
            showMessage('Output record added successfully!', 'success');
            clearNewRow();
            loadOutputData(); // Reload data from server
        } else {
            showMessage('Failed to add output: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error adding output:', error);
        showMessage('Error adding output. Please try again.', 'error');
    }
}

function clearNewRow() {
    document.getElementById('newCustomer').value = '';
    document.getElementById('newPartnumber').value = '';
    document.getElementById('newModel').value = '';
    document.getElementById('newDescription').innerHTML = '<option value="">Select Description</option>';
    document.getElementById('newDescription').disabled = true;
    document.getElementById('newQuantity').value = '';
    document.getElementById('newQuantityNg').value = '0';
    document.getElementById('newMachine').value = '';
    document.getElementById('newOperator').value = '';
}

async function editOutput(id) {
    // Implementation for editing output
    const output = outputData.find(o => o.id === id);
    if (!output) return;

    const newQuantity = prompt(`Update quantity for ${output.partnumber}:`, output.quantity);
    if (newQuantity && !isNaN(newQuantity) && newQuantity !== output.quantity.toString()) {
        try {
            const response = await fetch(`http://localhost:3001/api/website/outputmc/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity: parseInt(newQuantity) })
            });

            const result = await response.json();
            if (result.success) {
                showMessage('Output updated successfully!', 'success');
                loadOutputData();
            } else {
                showMessage('Failed to update output: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error updating output:', error);
            showMessage('Error updating output. Please try again.', 'error');
        }
    }
}

async function deleteOutput(id) {
    const output = outputData.find(o => o.id === id);
    if (!output || !confirm(`Delete output record for ${output.partnumber}?`)) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3001/api/website/outputmc/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            showMessage('Output deleted successfully!', 'success');
            loadOutputData();
        } else {
            showMessage('Failed to delete output: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting output:', error);
        showMessage('Error deleting output. Please try again.', 'error');
    }
}

function searchData() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();

    filteredData = outputData.filter(output => 
        (output.customer && output.customer.toLowerCase().includes(searchTerm)) ||
        output.partnumber.toLowerCase().includes(searchTerm) ||
        output.model.toLowerCase().includes(searchTerm) ||
        (output.description && output.description.toLowerCase().includes(searchTerm)) ||
        (output.machine && output.machine.toLowerCase().includes(searchTerm)) ||
        (output.operator && output.operator.toLowerCase().includes(searchTerm))
    );

    loadTableData();
}

function addNew() {
    document.getElementById('newCustomer').focus();
}

function exportCSV() {
    try {
        if (!filteredData || filteredData.length === 0) {
            showMessage('No data available to export', 'warning');
            return;
        }

        const headers = ['Customer', 'Part Number', 'Model', 'Description', 'Quantity', 'Quantity NG', 'Machine', 'Operator'];
        
        // Create CSV content with BOM for Excel compatibility
        let csvContent = '\uFEFF' + headers.join(',') + '\r\n';
        
        filteredData.forEach(output => {
            const row = [
                `"${output.customer || ''}"`,
                `"${output.partnumber || ''}"`,
                `"${output.model || ''}"`,
                `"${output.description || ''}"`,
                `"${output.quantity || 0}"`,
                `"${output.quantity_ng || 0}"`,
                `"${output.machine || ''}"`,
                `"${output.operator || ''}"`
            ];
            csvContent += row.join(',') + '\r\n';
        });

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `production_output_${new Date().toISOString().slice(0, 10)}.csv`;
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