/**
 * Index Dashboard JavaScript
 * PT. Topline Evergreen Manufacturing
 * Real-time Manufacturing Dashboard - Backend Connected
 */

// Global variables
let dashboardData = {
    wip: [],
    finishedGood: [],
    materials: [],
    machines: []
};

let refreshInterval;
let isOnline = true;

/**
 * Initialize Dashboard
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Index Dashboard loaded - Backend Connected');
    initializeDashboard();
    startRealTimeUpdates();
    setupEventListeners();
});

/**
 * Initialize dashboard components
 */
function initializeDashboard() {
    loadAllData();
    updateConnectionStatus();
    console.log('Dashboard initialized successfully');
}

/**
 * Load all dashboard data
 */
async function loadAllData() {
    try {
        console.log('Loading dashboard data...');
        
        // Load data in parallel
        await Promise.all([
            loadWipData(),
            loadFinishedGoodData(),
            loadMaterialData(),
            loadMachineData()
        ]);
        
        console.log('All data loaded successfully');
        updateLastRefreshTime();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showErrorMessage('Failed to load dashboard data');
    }
}

/**
 * Load WIP data from backend
 */
async function loadWipData() {
    try {
        // Connect to backend API with proper headers
        const response = await fetch('http://localhost:3001/api/website/stock/wip', {
            headers: {
                'x-api-key': 'website-admin-2025',
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const wipResponse = await response.json();
            dashboardData.wip = wipResponse.data?.wip_records || wipResponse.data || [];
        } else {
            console.error('WIP API response not ok:', response.status);
            dashboardData.wip = [];
        }
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        dashboardData.wip = [];
    }
    renderWipTable();
}

/**
 * Load Finished Good data from backend
 */
async function loadFinishedGoodData() {
    try {
        const response = await fetch('http://localhost:3001/api/website/stock/finished-goods', {
            headers: {
                'x-api-key': 'website-admin-2025',
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const fgResponse = await response.json();
            dashboardData.finishedGood = fgResponse.data?.finished_goods || fgResponse.data || [];
        } else {
            console.error('Finished goods API response not ok:', response.status);
            dashboardData.finishedGood = [];
        }
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        dashboardData.finishedGood = [];
    }
    renderFinishedGoodTable();
}

/**
 * Load Material data from backend
 */
async function loadMaterialData() {
    try {
        // Since there's no specific materials endpoint, let's use production endpoint or create sample data
        const response = await fetch('http://localhost:3001/api/website/production/dashboard', {
            headers: {
                'x-api-key': 'website-admin-2025',
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const prodResponse = await response.json();
            // Extract materials data or use empty array
            dashboardData.materials = prodResponse.data?.materials || [];
        } else {
            console.error('Materials API response not ok:', response.status);
            dashboardData.materials = [];
        }
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        dashboardData.materials = [];
    }
    renderMaterialTable();
}

/**
 * Load Machine Status data from backend
 */
async function loadMachineData() {
    try {
        const response = await fetch('http://localhost:3001/api/website/production/dashboard', {
            headers: {
                'x-api-key': 'website-admin-2025',
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const prodResponse = await response.json();
            // Extract machines data or use empty array
            dashboardData.machines = prodResponse.data?.machines || [];
        } else {
            console.error('Machine data API response not ok:', response.status);
            dashboardData.machines = [];
        }
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        dashboardData.machines = [];
    }
    renderMachineTable();
}

/**
 * Render WIP table
 */
function renderWipTable() {
    const tableBody = document.getElementById('wipTableBody');
    if (!tableBody) return;

    if (dashboardData.wip.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No WIP data available</td></tr>';
        return;
    }

    tableBody.innerHTML = dashboardData.wip.map(item => `
        <tr>
            <td><strong>${item.itemCode || item.productCode || 'N/A'}</strong></td>
            <td>${item.description || item.productName || 'N/A'}</td>
            <td><strong>${(item.qty || item.quantity || 0).toLocaleString()}</strong></td>
            <td>${item.unit || 'PCS'}</td>
            <td>${item.location || item.workCenter || 'N/A'}</td>
            <td>${formatDateTime(item.lastUpdate || item.createdAt || new Date())}</td>
            <td><span class="status-badge status-normal">${item.status || 'Active'}</span></td>
        </tr>
    `).join('');
}

/**
 * Render Finished Good table
 */
function renderFinishedGoodTable() {
    const tableBody = document.getElementById('fgTableBody');
    if (!tableBody) return;

    if (dashboardData.finishedGood.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No Finished Good data available</td></tr>';
        return;
    }

    tableBody.innerHTML = dashboardData.finishedGood.map(item => `
        <tr>
            <td><strong>${item.productCode || item.itemCode || 'N/A'}</strong></td>
            <td>${item.description || item.productName || 'N/A'}</td>
            <td><strong>${(item.currentStock || item.qty || 0).toLocaleString()}</strong></td>
            <td>${(item.minimumStock || 0).toLocaleString()}</td>
            <td>${formatDate(item.deliverySchedule || item.dueDate || new Date())}</td>
            <td>${getStockAlert(item.currentStock || 0, item.minimumStock || 0, item.status)}</td>
            <td>${formatDateTime(item.lastUpdate || item.createdAt || new Date())}</td>
        </tr>
    `).join('');
}

/**
 * Render Material table
 */
function renderMaterialTable() {
    const tableBody = document.getElementById('materialTableBody');
    if (!tableBody) return;

    if (dashboardData.materials.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No Material data available</td></tr>';
        return;
    }

    tableBody.innerHTML = dashboardData.materials.map(item => `
        <tr>
            <td><strong>${item.materialCode || item.itemCode || 'N/A'}</strong></td>
            <td>${item.description || item.materialName || 'N/A'}</td>
            <td><strong>${(item.qty || item.currentStock || 0).toLocaleString()}</strong></td>
            <td>${item.unit || 'PCS'}</td>
            <td>${item.location || item.warehouse || 'N/A'}</td>
            <td>${getStockAlert(item.qty || 0, item.minimumStock || 0, item.status)}</td>
            <td>${item.supplier || 'N/A'}</td>
            <td>${formatDateTime(item.lastUpdate || item.createdAt || new Date())}</td>
        </tr>
    `).join('');
}

/**
 * Render Machine table
 */
function renderMachineTable() {
    const tableBody = document.getElementById('machineTableBody');
    if (!tableBody) return;

    if (dashboardData.machines.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No Machine data available</td></tr>';
        return;
    }

    tableBody.innerHTML = dashboardData.machines.map(item => `
        <tr>
            <td><strong>${item.machineId || item.machineCode || 'N/A'}</strong></td>
            <td>${item.name || item.machineName || 'N/A'}</td>
            <td><span class="status-badge ${getMachineStatusClass(item.status)}">${item.status || 'Unknown'}</span></td>
            <td><strong>${(item.efficiency || 0).toFixed(1)}%</strong></td>
            <td>${formatDate(item.lastMaintenance || item.lastMaintenanceDate)}</td>
            <td>${formatDate(item.nextMaintenance || item.nextMaintenanceDate)}</td>
            <td>${item.operator || item.operatorName || 'N/A'}</td>
            <td>${item.currentJob || item.currentOrder || 'Idle'}</td>
        </tr>
    `).join('');
}

/**
 * Start real-time updates
 */
function startRealTimeUpdates() {
    // Clear existing interval
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    // Update every 30 seconds
    refreshInterval = setInterval(() => {
        if (isOnline) {
            loadAllData();
        }
    }, 30000);
    
    console.log('Real-time updates started (30s interval)');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Manual refresh button
    const refreshBtn = document.getElementById('refreshButton');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            console.log('Manual refresh triggered');
            loadAllData();
        });
    }

    // Export buttons
    setupExportButtons();
    
    // Connection status monitoring
    window.addEventListener('online', () => {
        isOnline = true;
        updateConnectionStatus();
        loadAllData();
    });
    
    window.addEventListener('offline', () => {
        isOnline = false;
        updateConnectionStatus();
    });
}

/**
 * Setup export functionality
 */
function setupExportButtons() {
    const exportButtons = {
        'exportWipBtn': () => exportToCSV(dashboardData.wip, 'WIP_Inventory'),
        'exportFgBtn': () => exportToCSV(dashboardData.finishedGood, 'Finished_Goods'),
        'exportMaterialBtn': () => exportToCSV(dashboardData.materials, 'Materials'),
        'exportMachineBtn': () => exportToCSV(dashboardData.machines, 'Machine_Status')
    };

    Object.entries(exportButtons).forEach(([buttonId, handler]) => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', handler);
        }
    });
}

/**
 * Update connection status indicator
 */
function updateConnectionStatus() {
    const statusIndicator = document.querySelector('.connection-status');
    if (statusIndicator) {
        statusIndicator.className = `connection-status ${isOnline ? 'online' : 'offline'}`;
        statusIndicator.textContent = isOnline ? 'Online' : 'Offline';
    }
}

/**
 * Update last refresh time
 */
function updateLastRefreshTime() {
    const timeElement = document.getElementById('lastRefreshTime');
    if (timeElement) {
        timeElement.textContent = new Date().toLocaleString();
    }
}

/**
 * Utility function to format date/time
 */
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString();
    } catch (error) {
        return 'Invalid Date';
    }
}

/**
 * Utility function to format date only
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString();
    } catch (error) {
        return 'Invalid Date';
    }
}

/**
 * Get stock alert status
 */
function getStockAlert(current, minimum, status) {
    if (status === 'Out of Stock' || current === 0) {
        return '<span class="status-badge status-critical">Out of Stock</span>';
    }
    if (current <= minimum) {
        return '<span class="status-badge status-warning">Low Stock</span>';
    }
    return '<span class="status-badge status-normal">Available</span>';
}

/**
 * Get machine status CSS class
 */
function getMachineStatusClass(status) {
    switch (status?.toLowerCase()) {
        case 'running':
            return 'status-normal';
        case 'maintenance':
        case 'down':
            return 'status-critical';
        case 'idle':
        case 'setup':
            return 'status-warning';
        default:
            return 'status-warning';
    }
}

/**
 * Export data to CSV
 */
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        alert('No data available to export');
        return;
    }

    // Create CSV content
    const headers = Object.keys(data[0]);
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += headers.join(',') + '\n';
    
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        });
        csvContent += values.join(',') + '\n';
    });
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    console.log(`Exported ${filename} to CSV`);
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    console.error(message);
    // You can implement a toast or notification system here
}

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});

// Export main functions for global access
window.loadAllData = loadAllData;
