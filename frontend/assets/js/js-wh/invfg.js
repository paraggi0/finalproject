// INVFG (Inventory Finished Goods) Module
// PT. Topline Evergreen Manufacturing

// Global variables
let inventoryData = [];
let currentEditId = null;

// Sample data for demonstration
const sampleInventoryData = [
    {
        id: 'INV001',
        productCode: 'TLE-2024-001',
        productName: 'Elite Series A1',
        currentStock: 250,
        minStock: 100,
        maxStock: 500,
        location: 'Zone A-01',
        unitPrice: 125.50,
        unitMeasure: 'pcs',
        batchNumber: 'BATCH2024001',
        expiryDate: '2024-12-31',
        supplier: 'Production Line 1',
        status: 'optimal',
        lastUpdate: '2024-01-15',
        category: 'Elite Series'
    },
    {
        id: 'INV002',
        productCode: 'TLE-2024-002',
        productName: 'Standard Series B2',
        currentStock: 45,
        minStock: 50,
        maxStock: 300,
        location: 'Zone B-02',
        unitPrice: 89.75,
        unitMeasure: 'pcs',
        batchNumber: 'BATCH2024002',
        expiryDate: '2024-11-30',
        supplier: 'Production Line 2',
        status: 'low',
        lastUpdate: '2024-01-16',
        category: 'Standard Series'
    },
    {
        id: 'INV003',
        productCode: 'TLE-2024-003',
        productName: 'Premium Series C3',
        currentStock: 180,
        minStock: 75,
        maxStock: 400,
        location: 'Zone A-03',
        unitPrice: 175.25,
        unitMeasure: 'pcs',
        batchNumber: 'BATCH2024003',
        expiryDate: '2025-01-31',
        supplier: 'Production Line 3',
        status: 'optimal',
        lastUpdate: '2024-01-17',
        category: 'Premium Series'
    },
    {
        id: 'INV004',
        productCode: 'TLE-2024-004',
        productName: 'Economy Series D4',
        currentStock: 0,
        minStock: 25,
        maxStock: 200,
        location: 'Zone C-01',
        unitPrice: 45.00,
        unitMeasure: 'pcs',
        batchNumber: 'BATCH2024004',
        expiryDate: '2024-10-31',
        supplier: 'Production Line 4',
        status: 'out-of-stock',
        lastUpdate: '2024-01-18',
        category: 'Economy Series'
    }
];

// Initialize INVFG module
function initializeINVFG() {
    console.log('Initializing INVFG module...');
    inventoryData = [...sampleInventoryData];
    loadInventoryData();
    updateStatistics();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    const form = document.getElementById('inventoryForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Close modal when clicking outside
    const modal = document.getElementById('inventoryModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

// Load inventory data into table
function loadInventoryData() {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    inventoryData.forEach(item => {
        const row = document.createElement('tr');
        const totalValue = (item.currentStock * item.unitPrice).toFixed(2);
        
        row.innerHTML = `
            <td>${item.productCode}</td>
            <td>
                ${item.productName}<br>
                <small style="color: rgba(255, 255, 255, 0.7);">${item.category}</small>
            </td>
            <td>
                <span class="stock-level ${getStatusClass(item.status)}">${item.currentStock}</span>
                <div style="font-size: 0.8rem; color: rgba(255, 255, 255, 0.7);">
                    Min: ${item.minStock} | Max: ${item.maxStock}
                </div>
            </td>
            <td>${item.location}</td>
            <td>$${item.unitPrice.toFixed(2)}</td>
            <td>$${totalValue}</td>
            <td>${item.batchNumber}</td>
            <td><span class="inventory-status status-${item.status}">${item.status.replace('-', ' ').toUpperCase()}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="editItem('${item.id}')">Edit</button>
                    <button class="btn btn-warning btn-sm" onclick="adjustStock('${item.id}')">Adjust</button>
                    <button class="btn btn-info btn-sm" onclick="viewDetails('${item.id}')">Details</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Get status class for stock levels
function getStatusClass(status) {
    switch (status) {
        case 'optimal': return 'status-optimal';
        case 'low': return 'status-low';
        case 'out-of-stock': return 'status-out';
        case 'overstock': return 'status-over';
        default: return 'status-optimal';
    }
}

// Update statistics
function updateStatistics() {
    const stats = {
        totalItems: inventoryData.length,
        totalValue: inventoryData.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0),
        lowStock: inventoryData.filter(item => item.status === 'low' || item.status === 'out-of-stock').length,
        optimalStock: inventoryData.filter(item => item.status === 'optimal').length
    };

    // Update DOM elements
    updateElementText('totalItems', stats.totalItems.toLocaleString());
    updateElementText('totalValue', '$' + stats.totalValue.toLocaleString());
    updateElementText('lowStockItems', stats.lowStock);
    updateElementText('optimalStockItems', stats.optimalStock);
}

// Helper function to update element text
function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

// Open add modal
function openAddModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Add New Inventory Item';
    document.getElementById('inventoryForm').reset();
    document.getElementById('inventoryModal').style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('inventoryModal').style.display = 'none';
    currentEditId = null;
}

// Edit item
function editItem(id) {
    const item = inventoryData.find(i => i.id === id);
    if (!item) return;

    currentEditId = id;
    document.getElementById('modalTitle').textContent = 'Edit Inventory Item';
    
    // Populate form fields
    document.getElementById('productCode').value = item.productCode;
    document.getElementById('productName').value = item.productName;
    document.getElementById('currentStock').value = item.currentStock;
    document.getElementById('minStock').value = item.minStock;
    document.getElementById('maxStock').value = item.maxStock;
    document.getElementById('location').value = item.location;
    document.getElementById('unitPrice').value = item.unitPrice;
    document.getElementById('unitMeasure').value = item.unitMeasure;
    document.getElementById('batchNumber').value = item.batchNumber;
    document.getElementById('expiryDate').value = item.expiryDate;
    document.getElementById('supplier').value = item.supplier;
    document.getElementById('category').value = item.category;
    
    document.getElementById('inventoryModal').style.display = 'block';
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const itemData = {
        id: currentEditId || 'INV' + String(Date.now()).slice(-6),
        productCode: formData.get('productCode'),
        productName: formData.get('productName'),
        currentStock: parseInt(formData.get('currentStock')),
        minStock: parseInt(formData.get('minStock')),
        maxStock: parseInt(formData.get('maxStock')),
        location: formData.get('location'),
        unitPrice: parseFloat(formData.get('unitPrice')),
        unitMeasure: formData.get('unitMeasure'),
        batchNumber: formData.get('batchNumber'),
        expiryDate: formData.get('expiryDate'),
        supplier: formData.get('supplier'),
        category: formData.get('category'),
        lastUpdate: new Date().toISOString().split('T')[0],
        status: calculateStatus(parseInt(formData.get('currentStock')), parseInt(formData.get('minStock')), parseInt(formData.get('maxStock')))
    };

    if (currentEditId) {
        // Update existing item
        const index = inventoryData.findIndex(item => item.id === currentEditId);
        inventoryData[index] = itemData;
    } else {
        // Add new item
        inventoryData.push(itemData);
    }

    loadInventoryData();
    updateStatistics();
    closeModal();
    
    showNotification(currentEditId ? 'Item updated successfully!' : 'Item added successfully!', 'success');
}

// Calculate status based on stock levels
function calculateStatus(current, min, max) {
    if (current === 0) return 'out-of-stock';
    if (current <= min) return 'low';
    if (current >= max) return 'overstock';
    return 'optimal';
}

// Search functionality
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const filteredData = inventoryData.filter(item => 
        item.productCode.toLowerCase().includes(query) ||
        item.productName.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
    
    // Update table with filtered data
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    filteredData.forEach(item => {
        const row = document.createElement('tr');
        const totalValue = (item.currentStock * item.unitPrice).toFixed(2);
        
        row.innerHTML = `
            <td>${item.productCode}</td>
            <td>
                ${item.productName}<br>
                <small style="color: rgba(255, 255, 255, 0.7);">${item.category}</small>
            </td>
            <td>
                <span class="stock-level ${getStatusClass(item.status)}">${item.currentStock}</span>
                <div style="font-size: 0.8rem; color: rgba(255, 255, 255, 0.7);">
                    Min: ${item.minStock} | Max: ${item.maxStock}
                </div>
            </td>
            <td>${item.location}</td>
            <td>$${item.unitPrice.toFixed(2)}</td>
            <td>$${totalValue}</td>
            <td>${item.batchNumber}</td>
            <td><span class="inventory-status status-${item.status}">${item.status.replace('-', ' ').toUpperCase()}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="editItem('${item.id}')">Edit</button>
                    <button class="btn btn-warning btn-sm" onclick="adjustStock('${item.id}')">Adjust</button>
                    <button class="btn btn-info btn-sm" onclick="viewDetails('${item.id}')">Details</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Adjust stock
function adjustStock(id) {
    const item = inventoryData.find(i => i.id === id);
    if (!item) return;

    const adjustment = prompt(`Current stock: ${item.currentStock}\nEnter adjustment (+/- amount):`);
    if (adjustment === null) return;

    const adjustmentValue = parseInt(adjustment);
    if (isNaN(adjustmentValue)) {
        showNotification('Invalid adjustment value', 'error');
        return;
    }

    item.currentStock = Math.max(0, item.currentStock + adjustmentValue);
    item.status = calculateStatus(item.currentStock, item.minStock, item.maxStock);
    item.lastUpdate = new Date().toISOString().split('T')[0];

    loadInventoryData();
    updateStatistics();
    showNotification(`Stock adjusted by ${adjustmentValue}`, 'success');
}

// View item details
function viewDetails(id) {
    const item = inventoryData.find(i => i.id === id);
    if (!item) return;

    const totalValue = (item.currentStock * item.unitPrice).toFixed(2);
    const details = `
Product Code: ${item.productCode}
Product Name: ${item.productName}
Category: ${item.category}
Current Stock: ${item.currentStock} ${item.unitMeasure}
Stock Range: ${item.minStock} - ${item.maxStock}
Location: ${item.location}
Unit Price: $${item.unitPrice}
Total Value: $${totalValue}
Batch Number: ${item.batchNumber}
Expiry Date: ${item.expiryDate}
Supplier: ${item.supplier}
Status: ${item.status.toUpperCase()}
Last Update: ${item.lastUpdate}
    `;

    alert(details);
}

// Warehouse action functions
function stockReceiving() {
    showNotification('🚚 Stock Receiving\n\nProcessing incoming goods and updating inventory levels.', 'info');
}

function stockIssue() {
    showNotification('📤 Stock Issue\n\nProcessing outbound goods and reducing inventory levels.', 'info');
}

function stockTransfer() {
    showNotification('🔄 Stock Transfer\n\nTransferring stock between warehouse locations.', 'info');
}

function cycleCounting() {
    showNotification('📊 Cycle Counting\n\nInitiating physical inventory count for accuracy verification.', 'info');
}

// Utility functions
function refreshData() {
    loadInventoryData();
    updateStatistics();
    showNotification('Data refreshed successfully!', 'success');
}

function exportReport() {
    showNotification('📊 Exporting inventory report...\n\nGenerating comprehensive inventory analysis.', 'info');
}

function generateBarcode(id) {
    const item = inventoryData.find(i => i.id === id);
    if (!item) return;
    
    showNotification(`📊 Generating barcode for ${item.productCode}`, 'success');
}

function bulkUpdate() {
    showNotification('📝 Bulk Update\n\nSelect multiple items for batch operations.', 'info');
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 300px;
        word-wrap: break-word;
        animation: slideIn 0.3s ease;
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeINVFG();
});

// Export functions for global access
window.openAddModal = openAddModal;
window.closeModal = closeModal;
window.editItem = editItem;
window.adjustStock = adjustStock;
window.viewDetails = viewDetails;
window.stockReceiving = stockReceiving;
window.stockIssue = stockIssue;
window.stockTransfer = stockTransfer;
window.cycleCounting = cycleCounting;
window.refreshData = refreshData;
window.exportReport = exportReport;
window.generateBarcode = generateBarcode;
window.bulkUpdate = bulkUpdate;
