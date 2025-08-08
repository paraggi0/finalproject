/**
 * NG QC JavaScript
 * PT. Topline Evergreen Manufacturing
 * Non-Good Quality Control Management
 */

let ngqcData = [];
let currentFilter = 'all';

/**
 * Initialize NG QC page
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('NG QC page loaded');
    initializeNGQC();
    loadNGQCData();
    setupEventListeners();
});

/**
 * Initialize NG QC components
 */
function initializeNGQC() {
    updateStatistics();
    console.log('NG QC initialized successfully');
}

/**
 * Load NG QC data
 */
async function loadNGQCData() {
    try {
        showLoading();
        
        // Simulate API call - replace with actual endpoint
        const response = await fetch('/api/qc/ng-qc');
        if (response.ok) {
            ngqcData = await response.json();
        } else {
            throw new Error('Failed to load NG QC data');
        }
        
    } catch (error) {
        console.error('Error loading NG QC data:', error);
        // Load dummy data for demo
        loadDummyNGQCData();
    } finally {
        hideLoading();
        renderNGQCTable();
        updateStatistics();
    }
}

/**
 * Load dummy NG QC data for demonstration
 */
function loadDummyNGQCData() {
    ngqcData = [
        {
            id: 'NG001',
            ngId: 'NG-001',
            productCode: 'PROD-001',
            batchNumber: 'BATCH-001',
            defectType: 'Surface defect',
            qtyNG: 15,
            detectionPoint: 'Final inspection',
            dateDetected: '2025-02-01',
            inspector: 'Grace Lee',
            status: 'Rework'
        },
        {
            id: 'NG002',
            ngId: 'NG-002',
            productCode: 'PROD-002',
            batchNumber: 'BATCH-002',
            defectType: 'Dimension out of spec',
            qtyNG: 8,
            detectionPoint: 'In-process QC',
            dateDetected: '2025-02-01',
            inspector: 'Henry Kim',
            status: 'Scrap'
        },
        {
            id: 'NG003',
            ngId: 'NG-003',
            productCode: 'PROD-003',
            batchNumber: 'BATCH-003',
            defectType: 'Material contamination',
            qtyNG: 25,
            detectionPoint: 'Incoming inspection',
            dateDetected: '2025-02-01',
            inspector: 'Ivy Chen',
            status: 'Pending'
        }
    ];
}

/**
 * Render NG QC table
 */
function renderNGQCTable() {
    const tableBody = document.getElementById('ngqcTableBody');
    if (!tableBody) return;

    const filteredData = filterNGQCData();
    
    tableBody.innerHTML = filteredData.map(item => `
        <tr>
            <td>${item.ngId}</td>
            <td>${item.productCode}</td>
            <td>${item.batchNumber}</td>
            <td>${item.defectType}</td>
            <td>${item.qtyNG.toLocaleString()}</td>
            <td>${item.detectionPoint}</td>
            <td>${formatDate(item.dateDetected)}</td>
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
 * Filter NG QC data based on current filter
 */
function filterNGQCData() {
    if (currentFilter === 'all') {
        return ngqcData;
    }
    return ngqcData.filter(item => item.status.toLowerCase() === currentFilter);
}

/**
 * Update statistics
 */
function updateStatistics() {
    const totalNG = ngqcData.reduce((sum, item) => sum + item.qtyNG, 0);
    const totalRework = ngqcData.filter(item => item.status === 'Rework').reduce((sum, item) => sum + item.qtyNG, 0);
    const totalScrap = ngqcData.filter(item => item.status === 'Scrap').reduce((sum, item) => sum + item.qtyNG, 0);
    const totalPending = ngqcData.filter(item => item.status === 'Pending').reduce((sum, item) => sum + item.qtyNG, 0);

    updateStatElement('totalNG', totalNG);
    updateStatElement('totalRework', totalRework);
    updateStatElement('totalScrap', totalScrap);
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
            renderNGQCTable();
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
    console.log('Loading NG QC data...');
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    console.log('NG QC data loaded');
}

/**
 * Export to CSV
 */
function exportCSV() {
    console.log('Exporting NG QC data to CSV...');
    // Implement CSV export
}

/**
 * Refresh data
 */
function refreshData() {
    loadNGQCData();
}

/**
 * View item details
 */
function viewDetails(itemId) {
    const item = ngqcData.find(i => i.id === itemId);
    if (item) {
        console.log('Viewing details for:', item);
        // Implement details view
    }
}

/**
 * Edit item
 */
function editItem(itemId) {
    const item = ngqcData.find(i => i.id === itemId);
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
