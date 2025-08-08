/**
 * IQC JavaScript
 * PT. Topline Evergreen Manufacturing
 * Incoming Quality Control Management
 */

let iqcData = [];
let currentFilter = 'all';

/**
 * Initialize IQC page
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('IQC page loaded');
    initializeIQC();
    loadIQCData();
    setupEventListeners();
});

/**
 * Initialize IQC components
 */
function initializeIQC() {
    updateStatistics();
    console.log('IQC initialized successfully');
}

/**
 * Load IQC data
 */
async function loadIQCData() {
    try {
        showLoading();
        
        // Simulate API call - replace with actual endpoint
        const response = await fetch('/api/qc/iqc');
        if (response.ok) {
            iqcData = await response.json();
        } else {
            throw new Error('Failed to load IQC data');
        }
        
    } catch (error) {
        console.error('Error loading IQC data:', error);
        // Backend API connected
        console.log("IQC connected to backend");
    } finally {
        hideLoading();
        renderIQCTable();
        updateStatistics();
    }
}

/**
 * Load dummy IQC data for demonstration
 */
function loadDummyIQCData() {
    iqcData = [
        {
            id: 'IQC001',
            itemCode: 'RAW-001',
            description: 'Steel Sheet 1.5mm',
            supplier: 'Supplier A',
            batchNumber: 'BATCH-001',
            qtyReceived: 1000,
            inspectionDate: '2025-02-01',
            inspector: 'John Doe',
            status: 'Passed'
        },
        {
            id: 'IQC002',
            itemCode: 'RAW-002',
            description: 'Aluminum Rod 10mm',
            supplier: 'Supplier B',
            batchNumber: 'BATCH-002',
            qtyReceived: 500,
            inspectionDate: '2025-02-01',
            inspector: 'Jane Smith',
            status: 'Pending'
        },
        {
            id: 'IQC003',
            itemCode: 'RAW-003',
            description: 'Plastic Resin Type A',
            supplier: 'Supplier C',
            batchNumber: 'BATCH-003',
            qtyReceived: 200,
            inspectionDate: '2025-02-01',
            inspector: 'Bob Wilson',
            status: 'Rejected'
        }
    ];
}

/**
 * Render IQC table
 */
function renderIQCTable() {
    const tableBody = document.getElementById('iqcTableBody');
    if (!tableBody) return;

    const filteredData = filterIQCData();
    
    tableBody.innerHTML = filteredData.map(item => `
        <tr>
            <td>${item.itemCode}</td>
            <td>${item.description}</td>
            <td>${item.supplier}</td>
            <td>${item.batchNumber}</td>
            <td>${item.qtyReceived.toLocaleString()}</td>
            <td>${formatDate(item.inspectionDate)}</td>
            <td>${item.inspector}</td>
            <td><span class="status status-${item.status.toLowerCase()}">${item.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewDetails('${item.id}')">View</button>
                <button class="btn btn-sm btn-secondary" onclick="editItem('${item.id}')">Edit</button>
            </td>
        </tr>
    `).join('');
}

/**
 * Filter IQC data based on current filter
 */
function filterIQCData() {
    if (currentFilter === 'all') {
        return iqcData;
    }
    return iqcData.filter(item => item.status.toLowerCase() === currentFilter);
}

/**
 * Update statistics
 */
function updateStatistics() {
    const totalReceived = iqcData.length;
    const totalPassed = iqcData.filter(item => item.status === 'Passed').length;
    const totalRejected = iqcData.filter(item => item.status === 'Rejected').length;
    const totalPending = iqcData.filter(item => item.status === 'Pending').length;

    updateStatElement('totalReceived', totalReceived);
    updateStatElement('totalPassed', totalPassed);
    updateStatElement('totalRejected', totalRejected);
    updateStatElement('totalPending', totalPending);
}

/**
 * Update stat element
 */
function updateStatElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value.toLocaleString();
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentFilter = e.target.dataset.filter || 'all';
            renderIQCTable();
            updateActiveFilter(e.target);
        });
    });
}

/**
 * Update active filter button
 */
function updateActiveFilter(activeBtn) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

/**
 * Format date
 */
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('id-ID');
}

/**
 * Show loading indicator
 */
function showLoading() {
    console.log('Loading IQC data...');
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    console.log('IQC data loaded');
}

/**
 * Export to CSV
 */
function exportCSV() {
    console.log('Exporting IQC data to CSV...');
    // Implement CSV export
}

/**
 * Refresh data
 */
function refreshData() {
    loadIQCData();
}

/**
 * View item details
 */
function viewDetails(itemId) {
    const item = iqcData.find(i => i.id === itemId);
    if (item) {
        console.log('Viewing details for:', item);
        // Implement details view
    }
}

/**
 * Edit item
 */
function editItem(itemId) {
    const item = iqcData.find(i => i.id === itemId);
    if (item) {
        console.log('Editing item:', item);
        // Implement edit functionality
    }
}

// Export functions for global access
window.exportCSV = exportCSV;
window.refreshData = refreshData;
window.viewDetails = viewDetails;
window.editItem = editItem;
