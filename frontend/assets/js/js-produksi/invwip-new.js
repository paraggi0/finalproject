// Inventory WIP JavaScript - PT. Topline Evergreen Manufacturing
// Real-time data fetching from database - No caching
let wipData = [];
let filteredData = [];
let editingRow = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inventory WIP page loaded');
    loadInitialData();
});

// Load initial data including customers, WIP data, and output totals
async function loadInitialData() {
    try {
        // Load customers for dropdown
        await loadCustomers();
        // Load WIP data
        await loadWipData();
    } catch (error) {
        console.error('Error loading initial data:', error);
        showMessage('Error loading data. Please refresh the page.', 'error');
    }
}

// Load customers from BOM - Always fresh from database
async function loadCustomers() {
    try {
        // Add cache-busting parameter to ensure fresh data
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
        } else {
            console.error('Failed to load customers:', result.message);
        }
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

// Load descriptions by customer - Always fresh from database
async function loadDescriptions(customer) {
    try {
        // Always fetch fresh data from database, no caching
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
        // Always fetch fresh data from database, no caching
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

// Load WIP data from backend - Always fresh from database
async function loadWipData() {
    try {
        // Add cache-busting parameter to ensure fresh data
        const timestamp = new Date().getTime();
        const response = await fetch(`http://localhost:3001/api/website/wip?_t=${timestamp}`, {
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
            await loadTableData();
            console.log('✅ Fresh WIP data loaded from database:', wipData);
        } else {
            console.error('Failed to load WIP data:', result.message);
            showMessage('Failed to load WIP data: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error loading WIP data:', error);
        showMessage('Error loading WIP data. Please check connection.', 'error');
    }
}

async function loadTableData() {
    const tableBody = document.getElementById('wipTableBody');
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
        <td><input type="text" id="newLotnumber" placeholder="Lot Number" class="table-input"></td>
        <td><input type="number" id="newQuantity" placeholder="Quantity" class="table-input"></td>
        <td><input type="text" id="newOperator" placeholder="Operator" class="table-input"></td>
        <td><input type="text" id="newPicQc" placeholder="PIC QC" class="table-input"></td>
        <td><input type="text" id="newPicProduksi" placeholder="PIC Produksi" class="table-input"></td>
        <td>
            <button onclick="saveNewItem()" class="btn-save">Save</button>
            <button onclick="clearNewRow()" class="btn-cancel">Clear</button>
        </td>
    `;
    tableBody.appendChild(addRow);

    // Add existing data rows
    filteredData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.customer || ''}</td>
            <td>${item.partnumber}</td>
            <td>${item.model}</td>
            <td>${item.description || ''}</td>
            <td>${item.lotnumber || ''}</td>
            <td class="quantity-cell" data-id="${item.id}" data-original="${item.quantity}">
                <span class="quantity-display">${item.quantity}</span>
                <input type="number" class="quantity-input" value="${item.quantity}" style="display: none;">
            </td>
            <td>${item.operator || ''}</td>
            <td>${item.pic_qc || ''}</td>
            <td>${item.pic_group_produksi || ''}</td>
            <td>
                <button onclick="toggleEdit(${item.id})" class="btn-edit" id="editBtn${item.id}">Edit</button>
                <button onclick="deleteItem(${item.id})" class="btn-delete">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add click listeners for quantity cells
    document.querySelectorAll('.quantity-cell').forEach(cell => {
        cell.addEventListener('click', function() {
            if (editingRow !== this.dataset.id) {
                startEdit(this.dataset.id);
            }
        });
    });
}

// Create customer dropdown with fresh data
async function createCustomerDropdown(id, selectedValue = '') {
    // Always fetch fresh customers from database
    await loadCustomers();
    
    let options = '<option value="">Select Customer</option>';
    if (window.customersData && window.customersData.length > 0) {
        window.customersData.forEach(customer => {
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
        partnumberInput.value = '';
        modelInput.value = '';
        partnumberInput.readOnly = true;
        modelInput.readOnly = true;
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
            // Auto-fill with first matching part (or let user select if multiple)
            const part = parts[0];
            partnumberInput.value = part.partnumber;
            modelInput.value = part.model;
        }
    } else {
        partnumberInput.value = '';
        modelInput.value = '';
    }
}

function startEdit(id) {
    // Cancel any existing edit
    if (editingRow) {
        cancelEdit(editingRow);
    }

    editingRow = id;
    const cell = document.querySelector(`[data-id="${id}"]`);
    const display = cell.querySelector('.quantity-display');
    const input = cell.querySelector('.quantity-input');
    const editBtn = document.getElementById(`editBtn${id}`);

    display.style.display = 'none';
    input.style.display = 'inline';
    input.focus();
    input.select();
    editBtn.textContent = 'Save';
    editBtn.onclick = () => saveEdit(id);

    // Add cancel on Escape key
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cancelEdit(id);
        } else if (e.key === 'Enter') {
            saveEdit(id);
        }
    });
}

function cancelEdit(id) {
    const cell = document.querySelector(`[data-id="${id}"]`);
    const display = cell.querySelector('.quantity-display');
    const input = cell.querySelector('.quantity-input');
    const editBtn = document.getElementById(`editBtn${id}`);
    const originalValue = cell.dataset.original;

    input.value = originalValue;
    display.style.display = 'inline';
    input.style.display = 'none';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => toggleEdit(id);
    editingRow = null;
}

async function saveEdit(id) {
    const cell = document.querySelector(`[data-id="${id}"]`);
    const display = cell.querySelector('.quantity-display');
    const input = cell.querySelector('.quantity-input');
    const editBtn = document.getElementById(`editBtn${id}`);
    const newQuantity = parseInt(input.value);

    if (!newQuantity || newQuantity < 0) {
        showMessage('Please enter a valid quantity', 'error');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3001/api/website/wip/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity: newQuantity })
        });

        const result = await response.json();

        if (result.success) {
            display.textContent = newQuantity;
            cell.dataset.original = newQuantity;
            display.style.display = 'inline';
            input.style.display = 'none';
            editBtn.textContent = 'Edit';
            editBtn.onclick = () => toggleEdit(id);
            editingRow = null;
            
            // Update local data
            const item = wipData.find(w => w.id == id);
            if (item) item.quantity = newQuantity;
            
            showMessage('Quantity updated successfully!', 'success');
        } else {
            showMessage('Failed to update quantity: ' + result.message, 'error');
            cancelEdit(id);
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        showMessage('Error updating quantity. Please try again.', 'error');
        cancelEdit(id);
    }
}

function toggleEdit(id) {
    if (editingRow === id) {
        cancelEdit(id);
    } else {
        startEdit(id);
    }
}

async function saveNewItem() {
    const customer = document.getElementById('newCustomer').value.trim();
    const partnumber = document.getElementById('newPartnumber').value.trim();
    const model = document.getElementById('newModel').value.trim();
    const description = document.getElementById('newDescription').value.trim();
    const lotnumber = document.getElementById('newLotnumber').value.trim();
    const quantity = parseInt(document.getElementById('newQuantity').value);
    const operator = document.getElementById('newOperator').value.trim();
    const pic_qc = document.getElementById('newPicQc').value.trim();
    const pic_group_produksi = document.getElementById('newPicProduksi').value.trim();

    if (!customer || !partnumber || !model || !quantity) {
        showMessage('Customer, Part Number, Model, and Quantity are required', 'error');
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/api/website/wip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customer,
                partnumber,
                model,
                description,
                lotnumber,
                quantity,
                operator,
                pic_qc,
                pic_group_produksi
            })
        });

        const result = await response.json();

        if (result.success) {
            showMessage('WIP item added successfully!', 'success');
            clearNewRow();
            loadWipData(); // Reload data from server
        } else {
            showMessage('Failed to add WIP item: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error adding WIP item:', error);
        showMessage('Error adding WIP item. Please try again.', 'error');
    }
}

function clearNewRow() {
    document.getElementById('newCustomer').value = '';
    document.getElementById('newPartnumber').value = '';
    document.getElementById('newModel').value = '';
    document.getElementById('newDescription').innerHTML = '<option value="">Select Description</option>';
    document.getElementById('newDescription').disabled = true;
    document.getElementById('newLotnumber').value = '';
    document.getElementById('newQuantity').value = '';
    document.getElementById('newOperator').value = '';
    document.getElementById('newPicQc').value = '';
    document.getElementById('newPicProduksi').value = '';
}

async function deleteItem(id) {
    const item = wipData.find(w => w.id == id);
    if (!confirm(`Delete WIP item ${item.partnumber}?`)) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3001/api/website/wip/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showMessage('WIP item deleted successfully!', 'success');
            loadWipData(); // Reload data from server
        } else {
            showMessage('Failed to delete WIP item: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting WIP item:', error);
        showMessage('Error deleting WIP item. Please try again.', 'error');
    }
}

function searchData() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();

    filteredData = wipData.filter(item => 
        (item.customer && item.customer.toLowerCase().includes(searchTerm)) ||
        item.partnumber.toLowerCase().includes(searchTerm) ||
        item.model.toLowerCase().includes(searchTerm) ||
        (item.description && item.description.toLowerCase().includes(searchTerm)) ||
        (item.lotnumber && item.lotnumber.toLowerCase().includes(searchTerm)) ||
        (item.operator && item.operator.toLowerCase().includes(searchTerm))
    );

    loadTableData();
}

function addNew() {
    // Focus on first input in add row
    document.getElementById('newCustomer').focus();
}

function exportCSV() {
    const headers = ['Customer', 'Part Number', 'Model', 'Description', 'Lot Number', 'Quantity', 'Operator', 'PIC QC', 'PIC Produksi'];
    const csvContent = [
        headers.join(','),
        ...filteredData.map(item => [
            item.customer || '',
            item.partnumber,
            item.model,
            item.description || '',
            item.lotnumber || '',
            item.quantity,
            item.operator || '',
            item.pic_qc || '',
            item.pic_group_produksi || ''
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_wip_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function showMessage(message, type) {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}
