/**
 * RQC JavaScript
 * PT. Topline Evergreen Manufacturing
 * Returned Quality Control Management
 */

let rqcData = [];
let currentFilter = 'all';

/**
 * Initialize RQC page
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('RQC page loaded');
    initializeRQC();
    loadRQCData();
    setupEventListeners();
});

/**
 * Initialize RQC components
 */
function initializeRQC() {
    updateStatistics();
    console.log('RQC initialized successfully');
}

/**
 * Load RQC data
 */
async function loadRQCData() {
    try {
        showLoading();
        
        // Simulate API call - replace with actual endpoint
        const response = await fetch('/api/qc/rqc');
        if (response.ok) {
            rqcData = await response.json();
        } else {
            throw new Error('Failed to load RQC data');
        }
        
    } catch (error) {
        console.error('Error loading RQC data:', error);
        // Load dummy data for demo
        loadDummyRQCData();
    } finally {
        hideLoading();
        renderRQCTable();
        updateStatistics();
    }
}

/**
 * Load dummy RQC data for demonstration
 */
function loadDummyRQCData() {
    rqcData = [
        {
            id: 'RQC001',
            returnId: 'RET-001',
            productCode: 'PROD-001',
            customer: 'Customer A',
            returnDate: '2025-01-28',
            reason: 'Surface defect',
            qtyReturned: 10,
            inspector: 'David Wilson',
            rootCause: 'Process temperature too high',
            status: 'Analyzed'
        },
        {
            id: 'RQC002',
            returnId: 'RET-002',
            productCode: 'PROD-002',
            customer: 'Customer B',
            returnDate: '2025-01-29',
            reason: 'Dimension out of spec',
            qtyReturned: 5,
            inspector: 'Emma Davis',
            rootCause: 'Under investigation',
            status: 'Pending'
        },
        {
            id: 'RQC003',
            returnId: 'RET-003',
            productCode: 'PROD-003',
            customer: 'Customer C',
            returnDate: '2025-01-30',
            reason: 'Color variation',
            qtyReturned: 20,
            inspector: 'Frank Miller',
            rootCause: 'Material supplier issue',
            status: 'Corrective Action'
        }
    ];
}

/**
 * Render RQC table
 */
function renderRQCTable() {
    const tableBody = document.getElementById('rqcTableBody');
    if (!tableBody) return;

    const filteredData = filterRQCData();
    
    tableBody.innerHTML = filteredData.map(item => `
        <tr>
            <td>${item.returnId}</td>
            <td>${item.productCode}</td>
            <td>${item.customer}</td>
            <td>${formatDate(item.returnDate)}</td>
            <td>${item.reason}</td>
            <td>${item.qtyReturned.toLocaleString()}</td>
            <td>${item.inspector}</td>
            <td>${item.rootCause}</td>
            <td><span class="status status-${item.status.toLowerCase().replace(' ', '-')}">${item.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewDetails('${item.id}')">View</button>
                <button class="btn btn-sm btn-secondary" onclick="editItem('${item.id}')">Edit</button>
            </td>
        </tr>
    `).join('');
}

/**
 * Filter RQC data based on current filter
 */
function filterRQCData() {
    if (currentFilter === 'all') {
        return rqcData;
    }
    return rqcData.filter(item => item.status.toLowerCase().replace(' ', '-') === currentFilter);
}

/**
 * Update statistics
 */
function updateStatistics() {
    const totalReturned = rqcData.reduce((sum, item) => sum + item.qtyReturned, 0);
    const totalAnalyzed = rqcData.filter(item => item.status === 'Analyzed').length;
    const totalCorrective = rqcData.filter(item => item.status === 'Corrective Action').length;
    const totalPending = rqcData.filter(item => item.status === 'Pending').length;

    updateStatElement('totalReturned', totalReturned);
    updateStatElement('totalAnalyzed', totalAnalyzed);
    updateStatElement('totalCorrective', totalCorrective);
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
            renderRQCTable();
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
    console.log('Loading RQC data...');
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    console.log('RQC data loaded');
}

/**
 * Export to CSV
 */
function exportCSV() {
    console.log('Exporting RQC data to CSV...');
    // Implement CSV export
}

/**
 * Refresh data
 */
function refreshData() {
    loadRQCData();
}

/**
 * View item details
 */
function viewDetails(itemId) {
    const item = rqcData.find(i => i.id === itemId);
    if (item) {
        console.log('Viewing details for:', item);
        // Implement details view
    }
}

/**
 * Edit item
 */
function editItem(itemId) {
    const item = rqcData.find(i => i.id === itemId);
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
