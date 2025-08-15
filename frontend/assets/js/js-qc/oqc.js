/**
 * OQC JavaScript
 * PT. Topline Evergreen Manufacturing
 * Outgoing Quality Control Management
 */

let oqcData = [];
let currentFilter = 'all';

/**
 * Initialize OQC page
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('OQC page loaded');
    initializeOQC();
    loadOQCData();
    setupEventListeners();
});

/**
 * Initialize OQC components
 */
function initializeOQC() {
    updateStatistics();
    console.log('OQC initialized successfully');
}

/**
 * Load OQC data
 */
async function loadOQCData() {
    try {
        showLoading();
        
        // Simulate API call - replace with actual endpoint
        const response = await fetch('/api/qc/oqc');
        if (response.ok) {
            oqcData = await response.json();
        } else {
            throw new Error('Failed to load OQC data');
        }
        
    } catch (error) {
        console.error('Error loading OQC data:', error);
        // Load dummy data for demo
        loadDummyOQCData();
    } finally {
        hideLoading();
        renderOQCTable();
        updateStatistics();
    }
}

/**
 * Load dummy OQC data for demonstration
 */
function loadDummyOQCData() {
    oqcData = [
        {
            id: 'OQC001',
            productCode: 'PROD-001',
            productName: 'Steel Bracket Type A',
            batchNumber: 'BATCH-001',
            qtyProduced: 1000,
            qtyInspected: 100,
            inspectionDate: '2025-02-01',
            inspector: 'Alice Johnson',
            status: 'Passed'
        },
        {
            id: 'OQC002',
            productCode: 'PROD-002',
            productName: 'Aluminum Housing',
            batchNumber: 'BATCH-002',
            qtyProduced: 500,
            qtyInspected: 50,
            inspectionDate: '2025-02-01',
            inspector: 'Bob Smith',
            status: 'Pending'
        },
        {
            id: 'OQC003',
            productCode: 'PROD-003',
            productName: 'Plastic Cover',
            batchNumber: 'BATCH-003',
            qtyProduced: 800,
            qtyInspected: 80,
            inspectionDate: '2025-02-01',
            inspector: 'Carol Brown',
            status: 'Passed'
        }
    ];
}

/**
 * Render OQC table
 */
function renderOQCTable() {
    const tableBody = document.getElementById('oqcTableBody');
    if (!tableBody) return;

    const filteredData = filterOQCData();
    
    tableBody.innerHTML = filteredData.map(item => `
        <tr>
            <td>${item.productCode}</td>
            <td>${item.productName}</td>
            <td>${item.batchNumber}</td>
            <td>${item.qtyProduced.toLocaleString()}</td>
            <td>${item.qtyInspected.toLocaleString()}</td>
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
 * Filter OQC data based on current filter
 */
function filterOQCData() {
    if (currentFilter === 'all') {
        return oqcData;
    }
    return oqcData.filter(item => item.status.toLowerCase() === currentFilter);
}

/**
 * Update statistics
 */
function updateStatistics() {
    const totalProduced = oqcData.reduce((sum, item) => sum + item.qtyProduced, 0);
    const totalPassed = oqcData.filter(item => item.status === 'Passed').length;
    const totalRejected = oqcData.filter(item => item.status === 'Rejected').length;
    const totalShipped = oqcData.filter(item => item.status === 'Passed').reduce((sum, item) => sum + item.qtyProduced, 0);

    updateStatElement('totalProduced', totalProduced);
    updateStatElement('totalPassed', totalPassed);
    updateStatElement('totalRejected', totalRejected);
    updateStatElement('totalShipped', totalShipped);
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
            renderOQCTable();
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
    console.log('Loading OQC data...');
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    console.log('OQC data loaded');
}

/**
 * Export to CSV
 */
function exportCSV() {
    console.log('Exporting OQC data to CSV...');
    // Implement CSV export
}

/**
 * Refresh data
 */
function refreshData() {
    loadOQCData();
}

/**
 * View item details
 */
function viewDetails(itemId) {
    const item = oqcData.find(i => i.id === itemId);
    if (item) {
        console.log('Viewing details for:', item);
        // Implement details view
    }
}

/**
 * Edit item
 */
function editItem(itemId) {
    const item = oqcData.find(i => i.id === itemId);
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
