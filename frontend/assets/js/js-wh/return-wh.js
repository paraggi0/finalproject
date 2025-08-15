// Return WH (Warehouse Returns) Module
// PT. Topline Evergreen Manufacturing

// Global variables
let returnData = [];
let currentEditId = null;

// Sample data for demonstration
const sampleReturnData = [
    {
        id: 'RET001',
        returnNumber: 'RET-2024-001',
        originalDO: 'DO-2024-001',
        customer: 'Customer ABC',
        productCode: 'TLE-2024-001',
        productName: 'Elite Series A1',
        returnReason: 'defective',
        returnDate: '2024-01-15',
        quantity: 2,
        unitValue: 125.50,
        status: 'inspection',
        condition: 'poor',
        complaint: 'Product shows manufacturing defects in surface finishing',
        inspector: 'QC Manager',
        inspectionDate: '2024-01-16',
        inspectionFindings: 'Confirmed surface defects, recommend replacement',
        defectCategory: 'surface',
        resolutionAction: 'replacement',
        refundAmount: 0,
        processedBy: 'Returns Manager',
        resolutionDate: '2024-01-17'
    },
    {
        id: 'RET002',
        returnNumber: 'RET-2024-002',
        originalDO: 'DO-2024-002',
        customer: 'Customer XYZ',
        productCode: 'TLE-2024-002',
        productName: 'Standard Series B2',
        returnReason: 'damaged',
        returnDate: '2024-01-17',
        quantity: 1,
        unitValue: 89.75,
        status: 'approved',
        condition: 'fair',
        complaint: 'Package arrived damaged during shipping',
        inspector: 'Senior Inspector',
        inspectionDate: '2024-01-18',
        inspectionFindings: 'Shipping damage confirmed, item salvageable',
        defectCategory: 'none',
        resolutionAction: 'refund',
        refundAmount: 89.75,
        processedBy: 'Customer Service',
        resolutionDate: '2024-01-19'
    },
    {
        id: 'RET003',
        returnNumber: 'RET-2024-003',
        originalDO: 'DO-2024-003',
        customer: 'Customer DEF',
        productCode: 'TLE-2024-003',
        productName: 'Premium Series C3',
        returnReason: 'wrong-item',
        returnDate: '2024-01-18',
        quantity: 1,
        unitValue: 175.25,
        status: 'restocked',
        condition: 'like-new',
        complaint: 'Wrong item sent, ordered different model',
        inspector: 'Inspector A',
        inspectionDate: '2024-01-19',
        inspectionFindings: 'Item in perfect condition, no defects found',
        defectCategory: 'none',
        resolutionAction: 'restock',
        refundAmount: 0,
        processedBy: 'Warehouse Manager',
        resolutionDate: '2024-01-20'
    }
];

// Initialize Return WH module
function initializeReturnWH() {
    console.log('Initializing Return WH module...');
    returnData = [...sampleReturnData];
    loadReturnData();
    updateStatistics();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    const form = document.getElementById('returnForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Close modal when clicking outside
    const modal = document.getElementById('returnModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

// Load return data into table
function loadReturnData() {
    const tableBody = document.getElementById('returnTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    returnData.forEach(item => {
        const row = document.createElement('tr');
        const totalValue = (item.quantity * item.unitValue).toFixed(2);
        
        row.innerHTML = `
            <td>${item.returnNumber}</td>
            <td>${item.customer}</td>
            <td>${item.productName}<br><small>${item.productCode}</small></td>
            <td><span class="reason-${item.returnReason}">${item.returnReason.replace('-', ' ').toUpperCase()}</span></td>
            <td>${item.returnDate}</td>
            <td>${item.quantity} pcs</td>
            <td>$${totalValue}</td>
            <td><span class="return-status status-${item.status}">${item.status.replace('-', ' ').toUpperCase()}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="editItem('${item.id}')">Edit</button>
                    <button class="btn btn-warning btn-sm" onclick="inspectReturn('${item.id}')">Inspect</button>
                    <button class="btn btn-success btn-sm" onclick="processReturn('${item.id}')">Process</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update statistics
function updateStatistics() {
    const stats = {
        total: returnData.length,
        inspection: returnData.filter(item => item.status === 'inspection' || item.status === 'received').length,
        approved: returnData.filter(item => item.status === 'approved' || item.status === 'restocked').length,
        totalValue: returnData.reduce((sum, item) => sum + (item.quantity * item.unitValue), 0)
    };

    // Update DOM elements
    updateElementText('totalReturns', stats.total);
    updateElementText('underInspection', stats.inspection);
    updateElementText('approvedReturns', stats.approved);
    updateElementText('returnValue', '$' + stats.totalValue.toLocaleString());
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
    document.getElementById('modalTitle').textContent = 'Process Return';
    document.getElementById('returnForm').reset();
    document.getElementById('returnModal').style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('returnModal').style.display = 'none';
    currentEditId = null;
}

// Edit item
function editItem(id) {
    const item = returnData.find(i => i.id === id);
    if (!item) return;

    currentEditId = id;
    document.getElementById('modalTitle').textContent = 'Edit Return';
    
    // Populate form fields
    document.getElementById('returnNumber').value = item.returnNumber;
    document.getElementById('originalDO').value = item.originalDO;
    document.getElementById('customer').value = item.customer;
    document.getElementById('returnDate').value = item.returnDate;
    document.getElementById('productCode').value = item.productCode;
    document.getElementById('productName').value = item.productName;
    document.getElementById('quantity').value = item.quantity;
    document.getElementById('unitValue').value = item.unitValue;
    document.getElementById('returnReason').value = item.returnReason;
    document.getElementById('condition').value = item.condition;
    document.getElementById('complaint').value = item.complaint;
    document.getElementById('inspector').value = item.inspector;
    document.getElementById('inspectionDate').value = item.inspectionDate;
    document.getElementById('inspectionFindings').value = item.inspectionFindings;
    document.getElementById('defectCategory').value = item.defectCategory;
    document.getElementById('inspectionStatus').value = item.status;
    document.getElementById('resolutionAction').value = item.resolutionAction;
    document.getElementById('refundAmount').value = item.refundAmount;
    document.getElementById('resolutionNotes').value = item.resolutionNotes || '';
    document.getElementById('processedBy').value = item.processedBy;
    document.getElementById('resolutionDate').value = item.resolutionDate;
    
    document.getElementById('returnModal').style.display = 'block';
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const itemData = {
        id: currentEditId || 'RET' + String(Date.now()).slice(-6),
        returnNumber: formData.get('returnNumber'),
        originalDO: formData.get('originalDO'),
        customer: formData.get('customer'),
        returnDate: formData.get('returnDate'),
        productCode: formData.get('productCode'),
        productName: formData.get('productName'),
        quantity: parseInt(formData.get('quantity')),
        unitValue: parseFloat(formData.get('unitValue')),
        returnReason: formData.get('returnReason'),
        condition: formData.get('condition'),
        complaint: formData.get('complaint'),
        inspector: formData.get('inspector'),
        inspectionDate: formData.get('inspectionDate'),
        inspectionFindings: formData.get('inspectionFindings'),
        defectCategory: formData.get('defectCategory'),
        status: formData.get('inspectionStatus'),
        resolutionAction: formData.get('resolutionAction'),
        refundAmount: parseFloat(formData.get('refundAmount')) || 0,
        resolutionNotes: formData.get('resolutionNotes'),
        processedBy: formData.get('processedBy'),
        resolutionDate: formData.get('resolutionDate')
    };

    if (currentEditId) {
        // Update existing item
        const index = returnData.findIndex(item => item.id === currentEditId);
        returnData[index] = itemData;
    } else {
        // Add new item
        returnData.push(itemData);
    }

    loadReturnData();
    updateStatistics();
    closeModal();
    
    showNotification(currentEditId ? 'Return updated successfully!' : 'Return processed successfully!', 'success');
}

// Search functionality
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const filteredData = returnData.filter(item => 
        item.returnNumber.toLowerCase().includes(query) ||
        item.customer.toLowerCase().includes(query) ||
        item.productName.toLowerCase().includes(query) ||
        item.productCode.toLowerCase().includes(query)
    );
    
    // Update table with filtered data
    const tableBody = document.getElementById('returnTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    filteredData.forEach(item => {
        const row = document.createElement('tr');
        const totalValue = (item.quantity * item.unitValue).toFixed(2);
        
        row.innerHTML = `
            <td>${item.returnNumber}</td>
            <td>${item.customer}</td>
            <td>${item.productName}<br><small>${item.productCode}</small></td>
            <td><span class="reason-${item.returnReason}">${item.returnReason.replace('-', ' ').toUpperCase()}</span></td>
            <td>${item.returnDate}</td>
            <td>${item.quantity} pcs</td>
            <td>$${totalValue}</td>
            <td><span class="return-status status-${item.status}">${item.status.replace('-', ' ').toUpperCase()}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="editItem('${item.id}')">Edit</button>
                    <button class="btn btn-warning btn-sm" onclick="inspectReturn('${item.id}')">Inspect</button>
                    <button class="btn btn-success btn-sm" onclick="processReturn('${item.id}')">Process</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Inspect return
function inspectReturn(id) {
    const item = returnData.find(i => i.id === id);
    if (!item) return;

    const inspectionDetails = `
🔍 Return Inspection: ${item.returnNumber}

Product: ${item.productName} (${item.productCode})
Customer: ${item.customer}
Return Reason: ${item.returnReason.toUpperCase()}
Condition on Receipt: ${item.condition.toUpperCase()}

Customer Complaint:
${item.complaint}

${item.inspectionFindings ? `Inspection Findings:\n${item.inspectionFindings}` : 'Inspection pending...'}

${item.defectCategory ? `Defect Category: ${item.defectCategory.toUpperCase()}` : ''}

Starting detailed quality inspection process...
    `;

    alert(inspectionDetails);
    
    // Update status to inspection if not already
    if (item.status === 'received') {
        item.status = 'inspection';
        loadReturnData();
        updateStatistics();
    }
}

// Process return
function processReturn(id) {
    const item = returnData.find(i => i.id === id);
    if (!item) return;

    const actions = ['approved', 'rejected', 'restocked', 'refunded'];
    const currentIndex = actions.findIndex(action => action === item.status);
    const nextAction = actions[Math.min(currentIndex + 1, actions.length - 1)];
    
    if (confirm(`Process return with action: ${nextAction.toUpperCase()}?`)) {
        item.status = nextAction;
        
        // Set resolution details based on action
        switch (nextAction) {
            case 'approved':
                item.resolutionAction = 'restock';
                break;
            case 'rejected':
                item.resolutionAction = 'disposal';
                break;
            case 'restocked':
                item.resolutionAction = 'restock';
                break;
            case 'refunded':
                item.resolutionAction = 'refund';
                item.refundAmount = item.quantity * item.unitValue;
                break;
        }
        
        item.resolutionDate = new Date().toISOString().split('T')[0];
        item.processedBy = 'Returns Manager';
        
        loadReturnData();
        updateStatistics();
        showNotification(`✅ Return processed successfully!\nAction: ${nextAction.toUpperCase()}\nCustomer will be notified.`, 'success');
    }
}

// Return action functions
function returnInspection() {
    showNotification('🔍 Return Inspection\n\nDetailed quality inspection workflow for returned products.', 'info');
}

function returnAuthorization() {
    showNotification('✅ Return Authorization\n\nRMA (Return Merchandise Authorization) approval process.', 'info');
}

function refundProcessing() {
    const pendingRefunds = returnData.filter(item => item.resolutionAction === 'refund' && item.status === 'approved');
    const totalRefunds = pendingRefunds.reduce((sum, item) => sum + (item.refundAmount || 0), 0);
    
    showNotification(`💰 Refund Processing\n\nFound ${pendingRefunds.length} pending refunds\nTotal amount: $${totalRefunds.toFixed(2)}\n\nProcessing customer refunds and credit adjustments...`, 'info');
}

function disposalManagement() {
    const disposalItems = returnData.filter(item => item.resolutionAction === 'disposal' || item.status === 'rejected');
    
    showNotification(`🗑️ Disposal Management\n\nFound ${disposalItems.length} items for disposal\n\nManaging disposal of rejected returns and damaged goods.`, 'info');
}

// Utility functions
function refreshData() {
    loadReturnData();
    updateStatistics();
    showNotification('Data refreshed successfully!', 'success');
}

function bulkInspection() {
    const inspectionItems = returnData.filter(item => item.status === 'received' || item.status === 'inspection');
    showNotification(`🔍 Bulk Inspection\n\nFound ${inspectionItems.length} returns for inspection.\n\nSelect multiple returns for batch inspection processing.`, 'info');
}

function restockApproved() {
    const approvedReturns = returnData.filter(item => item.status === 'approved');
    if (approvedReturns.length > 0) {
        const totalItems = approvedReturns.reduce((sum, item) => sum + item.quantity, 0);
        showNotification(`📦 Restock Approved Returns\n\nFound ${approvedReturns.length} approved returns (${totalItems} items) ready for restocking.\n\nProcessing restock to inventory...`, 'success');
        
        // Update status to restocked
        approvedReturns.forEach(item => {
            item.status = 'restocked';
            item.resolutionDate = new Date().toISOString().split('T')[0];
        });
        
        loadReturnData();
        updateStatistics();
    } else {
        showNotification('No approved returns found for restocking.', 'warning');
    }
}

function bulkAction() {
    showNotification('📝 Bulk Actions\n\nPerform batch operations on selected returns:\n- Bulk approval\n- Batch refund processing\n- Mass status updates', 'info');
}

function exportReport() {
    const totalValue = returnData.reduce((sum, item) => sum + (item.quantity * item.unitValue), 0);
    const reasonBreakdown = {
        defective: returnData.filter(item => item.returnReason === 'defective').length,
        damaged: returnData.filter(item => item.returnReason === 'damaged').length,
        'wrong-item': returnData.filter(item => item.returnReason === 'wrong-item').length,
        'customer-change': returnData.filter(item => item.returnReason === 'customer-change').length
    };
    
    showNotification(`📊 Exporting Return Report...\n\nTotal Returns: ${returnData.length}\nTotal Value: $${totalValue.toLocaleString()}\n\nReason Breakdown:\n- Defective: ${reasonBreakdown.defective}\n- Damaged: ${reasonBreakdown.damaged}\n- Wrong Item: ${reasonBreakdown['wrong-item']}\n- Customer Change: ${reasonBreakdown['customer-change']}\n\nIncluding return analysis, reasons, and financial impact.`, 'info');
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.whiteSpace = 'pre-line'; // Allow line breaks
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 400px;
        word-wrap: break-word;
        white-space: pre-line;
        animation: slideIn 0.3s ease;
        font-size: 0.9rem;
        line-height: 1.4;
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

    // Remove notification after 5 seconds for longer messages
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 5000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeReturnWH();
});

// Export functions for global access
window.openAddModal = openAddModal;
window.closeModal = closeModal;
window.editItem = editItem;
window.inspectReturn = inspectReturn;
window.processReturn = processReturn;
window.returnInspection = returnInspection;
window.returnAuthorization = returnAuthorization;
window.refundProcessing = refundProcessing;
window.disposalManagement = disposalManagement;
window.refreshData = refreshData;
window.bulkInspection = bulkInspection;
window.restockApproved = restockApproved;
window.bulkAction = bulkAction;
window.exportReport = exportReport;
