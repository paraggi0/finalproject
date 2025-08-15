// Global variables
let currentUser = null;
let productionData = [];
let filteredData = [];

// API Configuration
const API_BASE_URL = 'http://localhost:3001/api/v1';
const USE_DEMO_DATA = false; // Set to false when backend is ready

// Navigation function
function goHome() {
    // Clear user session data if needed
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    
    // Redirect to home page
    window.location.href = '../../index.html';
}

// Check backend status
async function checkBackendStatus() {
    try {
        const response = await fetch(`${API_BASE_URL.replace('/v1', '')}/health`);
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Backend is online:', result.message);
            return true;
        }
    } catch (error) {
        console.log('❌ Backend is offline:', error.message);
    }
    return false;
}

// Show connection status in UI
function updateConnectionStatus(isConnected) {
    const indicator = document.querySelector('.live-indicator');
    if (indicator) {
        if (isConnected) {
            indicator.innerHTML = '<span class="pulse" style="background: #10b981;"></span> Connected to API';
            indicator.style.color = '#10b981';
        } else {
            indicator.innerHTML = '<span class="pulse" style="background: #f59e0b;"></span> Using demo data (API offline)';
            indicator.style.color = '#f59e0b';
        }
    }
}

// Demo data for production dashboard
const demoProductionData = [
    // Output MC data
    {
        id: 'OM001',
        type: 'output_mc',
        partNumber: 'TLE-2024-001',
        model: 'Evergreen Pro',
        machine: 'MC-001',
        quantity: 150,
        qualityGrade: 'A',
        operator: 'John Doe',
        completionTime: '2024-01-20 14:30',
        status: 'completed'
    },
    {
        id: 'OM002',
        type: 'output_mc',
        partNumber: 'TLE-2024-002',
        model: 'Eco Series',
        machine: 'MC-002',
        quantity: 200,
        qualityGrade: 'A+',
        operator: 'Jane Smith',
        completionTime: '2024-01-20 15:45',
        status: 'completed'
    },
    {
        id: 'OM003',
        type: 'output_mc',
        partNumber: 'TLE-2024-009',
        model: 'Standard Plus',
        machine: 'MC-003',
        quantity: 180,
        qualityGrade: 'A',
        operator: 'Mike Johnson',
        completionTime: '2024-01-20 16:15',
        status: 'in-process'
    },
    // WIP Second Process data
    {
        id: 'WS001',
        type: 'wip_second',
        woNumber: 'WO-2024-0150',
        partNumber: 'TLE-2024-003',
        processType: 'Assembly',
        fromStation: 'MC-001',
        currentQty: 100,
        progress: '75%',
        estimatedCompletion: '2024-01-20 18:00',
        status: 'in-process'
    },
    {
        id: 'WS002',
        type: 'wip_second',
        woNumber: 'WO-2024-0151',
        partNumber: 'TLE-2024-004',
        processType: 'Finishing',
        fromStation: 'MC-003',
        currentQty: 75,
        progress: '45%',
        estimatedCompletion: '2024-01-20 19:30',
        status: 'in-process'
    },
    {
        id: 'WS003',
        type: 'wip_second',
        woNumber: 'WO-2024-0152',
        partNumber: 'TLE-2024-010',
        processType: 'Quality Check',
        fromStation: 'MC-002',
        currentQty: 125,
        progress: '90%',
        estimatedCompletion: '2024-01-20 17:45',
        status: 'pending'
    },
    // WIP Stock data
    {
        id: 'WK001',
        type: 'wip_stock',
        stockId: 'STK-001',
        partNumber: 'TLE-2024-005',
        model: 'Topline Classic',
        location: 'WH-A01',
        availableQty: 500,
        reservedQty: 150,
        lastUpdated: '2024-01-20 16:00',
        stockStatus: 'available'
    },
    {
        id: 'WK002',
        type: 'wip_stock',
        stockId: 'STK-002',
        partNumber: 'TLE-2024-006',
        model: 'Pro Max',
        location: 'WH-B02',
        availableQty: 300,
        reservedQty: 100,
        lastUpdated: '2024-01-20 16:15',
        stockStatus: 'low-stock'
    },
    {
        id: 'WK003',
        type: 'wip_stock',
        stockId: 'STK-003',
        partNumber: 'TLE-2024-011',
        model: 'Elite Series',
        location: 'WH-C03',
        availableQty: 750,
        reservedQty: 200,
        lastUpdated: '2024-01-20 16:30',
        stockStatus: 'available'
    },
    // To QC data
    {
        id: 'QC001',
        type: 'to_qc',
        qcBatchId: 'QC-B001',
        partNumber: 'TLE-2024-007',
        model: 'Elite Series',
        quantitySent: 50,
        fromProcess: 'Final Assembly',
        qcPriority: 'High',
        transferTime: '2024-01-20 17:00',
        qcStatus: 'pending'
    },
    {
        id: 'QC002',
        type: 'to_qc',
        qcBatchId: 'QC-B002',
        partNumber: 'TLE-2024-008',
        model: 'Standard Plus',
        quantitySent: 25,
        fromProcess: 'Quality Check',
        qcPriority: 'Medium',
        transferTime: '2024-01-20 17:30',
        qcStatus: 'in-review'
    },
    {
        id: 'QC003',
        type: 'to_qc',
        qcBatchId: 'QC-B003',
        partNumber: 'TLE-2024-012',
        model: 'Compact Series',
        quantitySent: 75,
        fromProcess: 'Secondary Process',
        qcPriority: 'Low',
        transferTime: '2024-01-20 17:45',
        qcStatus: 'pending'
    }
];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadProductionData();
    updateStatistics();
    populateAllTables();
    setInterval(refreshData, 30000); // Refresh every 30 seconds
});

function initializeDashboard() {
    // Load user info from localStorage
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.name || 'Production Staff';
        document.getElementById('userRole').textContent = currentUser.role || 'Production Department';
        document.getElementById('userInitial').textContent = (currentUser.name || 'P').charAt(0).toUpperCase();
    }

    // Set current time
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
}

async function loadProductionData() {
    // Check backend status first
    const backendOnline = await checkBackendStatus();
    updateConnectionStatus(backendOnline);
    
    if (USE_DEMO_DATA || !backendOnline) {
        // Use existing demo data
        productionData = [...demoProductionData];
        filteredData = [...productionData];
        console.log('📊 Using demo data (backend not connected)');
        return;
    }

    try {
        console.log('🔄 Loading data from API...');
        const response = await fetch(`${API_BASE_URL}/production`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
            productionData = result.data;
            console.log('✅ Data loaded from API:', productionData.length, 'records');
        } else {
            throw new Error('API returned error status');
        }
        
    } catch (error) {
        console.warn('⚠️ Failed to load from API, using demo data:', error.message);
        productionData = [...demoProductionData];
        updateConnectionStatus(false);
    }
    
    filteredData = [...productionData];
}

function updateStatistics() {
    const outputMC = productionData.filter(item => item.type === 'output_mc');
    const wipSecond = productionData.filter(item => item.type === 'wip_second');
    const wipStock = productionData.filter(item => item.type === 'wip_stock');
    const toQC = productionData.filter(item => item.type === 'to_qc');

    document.getElementById('outputMCCount').textContent = outputMC.length;
    document.getElementById('wipSecondCount').textContent = wipSecond.length;
    document.getElementById('wipStockCount').textContent = wipStock.length;
    document.getElementById('toQCCount').textContent = toQC.length;

    // Simulate growth percentages with random values
    document.getElementById('outputMCChange').innerHTML = '<span>↗</span> +12% from yesterday';
    document.getElementById('wipSecondChange').innerHTML = '<span>↗</span> +8% from yesterday';
    document.getElementById('wipStockChange').innerHTML = '<span>↗</span> +5% from yesterday';
    document.getElementById('toQCChange').innerHTML = '<span>↗</span> +15% from yesterday';
}

function populateAllTables() {
    populateOutputMCTable();
    populateWIPSecondTable();
    populateWIPStockTable();
    populateToQCTable();
}

// Individual search functions for each section
function searchOutputMC() {
    const searchTerm = document.getElementById('searchOutputMC').value.toLowerCase();
    const outputMCData = productionData.filter(item => {
        if (item.type !== 'output_mc') return false;
        
        return !searchTerm || 
            item.partNumber?.toLowerCase().includes(searchTerm) ||
            item.model?.toLowerCase().includes(searchTerm) ||
            item.machine?.toLowerCase().includes(searchTerm) ||
            item.operator?.toLowerCase().includes(searchTerm) ||
            item.qualityGrade?.toLowerCase().includes(searchTerm) ||
            item.status?.toLowerCase().includes(searchTerm);
    });
    
    populateOutputMCTableWithData(outputMCData);
}

function searchWIPSecond() {
    const searchTerm = document.getElementById('searchWIPSecond').value.toLowerCase();
    const wipSecondData = productionData.filter(item => {
        if (item.type !== 'wip_second') return false;
        
        return !searchTerm || 
            item.woNumber?.toLowerCase().includes(searchTerm) ||
            item.partNumber?.toLowerCase().includes(searchTerm) ||
            item.processType?.toLowerCase().includes(searchTerm) ||
            item.fromStation?.toLowerCase().includes(searchTerm) ||
            item.status?.toLowerCase().includes(searchTerm);
    });
    
    populateWIPSecondTableWithData(wipSecondData);
}

function searchWIPStock() {
    const searchTerm = document.getElementById('searchWIPStock').value.toLowerCase();
    const wipStockData = productionData.filter(item => {
        if (item.type !== 'wip_stock') return false;
        
        return !searchTerm || 
            item.stockId?.toLowerCase().includes(searchTerm) ||
            item.partNumber?.toLowerCase().includes(searchTerm) ||
            item.model?.toLowerCase().includes(searchTerm) ||
            item.location?.toLowerCase().includes(searchTerm) ||
            item.stockStatus?.toLowerCase().includes(searchTerm);
    });
    
    populateWIPStockTableWithData(wipStockData);
}

function searchToQC() {
    const searchTerm = document.getElementById('searchToQC').value.toLowerCase();
    const toQCData = productionData.filter(item => {
        if (item.type !== 'to_qc') return false;
        
        return !searchTerm || 
            item.qcBatchId?.toLowerCase().includes(searchTerm) ||
            item.partNumber?.toLowerCase().includes(searchTerm) ||
            item.model?.toLowerCase().includes(searchTerm) ||
            item.fromProcess?.toLowerCase().includes(searchTerm) ||
            item.qcPriority?.toLowerCase().includes(searchTerm) ||
            item.qcStatus?.toLowerCase().includes(searchTerm);
    });
    
    populateToQCTableWithData(toQCData);
}

function populateOutputMCTable() {
    const outputMCData = filteredData.filter(item => item.type === 'output_mc');
    populateOutputMCTableWithData(outputMCData);
}

function populateOutputMCTableWithData(data) {
    const tableBody = document.getElementById('outputMCTableBody');
    
    tableBody.innerHTML = '';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'clickable-row';
        row.setAttribute('data-id', item.id);
        row.innerHTML = `
            <td><strong>${item.partNumber}</strong></td>
            <td>${item.model}</td>
            <td>${item.machine}</td>
            <td>${item.quantity}</td>
            <td><span class="badge grade-${item.qualityGrade.toLowerCase().replace('+', 'plus')}">${item.qualityGrade}</span></td>
            <td>${item.operator}</td>
            <td>${item.completionTime}</td>
            <td><span class="badge status-${item.status}">${item.status.replace('-', ' ')}</span></td>
            <td>
                <button class="btn-action edit" onclick="editItem('${item.id}')">✏️</button>
            </td>
        `;
        
        // Add click event listener for viewing details
        row.addEventListener('click', function(e) {
            // Don't trigger if clicking on edit button
            if (!e.target.closest('.btn-action')) {
                viewDetails(item.id);
            }
        });
        
        tableBody.appendChild(row);
    });
}

function populateWIPSecondTable() {
    const wipSecondData = filteredData.filter(item => item.type === 'wip_second');
    populateWIPSecondTableWithData(wipSecondData);
}

function populateWIPSecondTableWithData(data) {
    const tableBody = document.getElementById('wipSecondTableBody');
    
    tableBody.innerHTML = '';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'clickable-row';
        row.setAttribute('data-id', item.id);
        row.innerHTML = `
            <td><strong>${item.woNumber}</strong></td>
            <td>${item.partNumber}</td>
            <td>${item.processType}</td>
            <td>${item.fromStation}</td>
            <td>${item.currentQty}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${item.progress}"></div>
                    <span class="progress-text">${item.progress}</span>
                </div>
            </td>
            <td>${item.estimatedCompletion}</td>
            <td><span class="badge status-${item.status}">${item.status.replace('-', ' ')}</span></td>
            <td>
                <button class="btn-action edit" onclick="editItem('${item.id}')">✏️</button>
            </td>
        `;
        
        // Add click event listener for viewing details
        row.addEventListener('click', function(e) {
            // Don't trigger if clicking on edit button
            if (!e.target.closest('.btn-action')) {
                viewDetails(item.id);
            }
        });
        
        tableBody.appendChild(row);
    });
}

function populateWIPStockTable() {
    const wipStockData = filteredData.filter(item => item.type === 'wip_stock');
    populateWIPStockTableWithData(wipStockData);
}

function populateWIPStockTableWithData(data) {
    const tableBody = document.getElementById('wipStockTableBody');
    
    tableBody.innerHTML = '';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'clickable-row';
        row.setAttribute('data-id', item.id);
        row.innerHTML = `
            <td><strong>${item.stockId}</strong></td>
            <td>${item.partNumber}</td>
            <td>${item.model}</td>
            <td>${item.location}</td>
            <td>${item.availableQty}</td>
            <td>${item.reservedQty}</td>
            <td>${item.lastUpdated}</td>
            <td><span class="badge status-${item.stockStatus}">${item.stockStatus.replace('-', ' ')}</span></td>
            <td>
                <button class="btn-action edit" onclick="editItem('${item.id}')">✏️</button>
            </td>
        `;
        
        // Add click event listener for viewing details
        row.addEventListener('click', function(e) {
            // Don't trigger if clicking on edit button
            if (!e.target.closest('.btn-action')) {
                viewDetails(item.id);
            }
        });
        
        tableBody.appendChild(row);
    });
}

function populateToQCTable() {
    const toQCData = filteredData.filter(item => item.type === 'to_qc');
    populateToQCTableWithData(toQCData);
}

function populateToQCTableWithData(data) {
    const tableBody = document.getElementById('toQCTableBody');
    
    tableBody.innerHTML = '';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'clickable-row';
        row.setAttribute('data-id', item.id);
        row.innerHTML = `
            <td><strong>${item.qcBatchId}</strong></td>
            <td>${item.partNumber}</td>
            <td>${item.model}</td>
            <td>${item.quantitySent}</td>
            <td>${item.fromProcess}</td>
            <td><span class="badge priority-${item.qcPriority.toLowerCase()}">${item.qcPriority}</span></td>
            <td>${item.transferTime}</td>
            <td><span class="badge status-${item.qcStatus}">${item.qcStatus.replace('-', ' ')}</span></td>
            <td>
                <button class="btn-action edit" onclick="editItem('${item.id}')">✏️</button>
            </td>
        `;
        
        // Add click event listener for viewing details
        row.addEventListener('click', function(e) {
            // Don't trigger if clicking on edit button
            if (!e.target.closest('.btn-action')) {
                viewDetails(item.id);
            }
        });
        
        tableBody.appendChild(row);
    });
}

function searchTransactions() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const stationFilter = document.getElementById('stationFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    filteredData = productionData.filter(item => {
        const matchesSearch = !searchTerm || 
            item.partNumber?.toLowerCase().includes(searchTerm) ||
            item.model?.toLowerCase().includes(searchTerm) ||
            item.woNumber?.toLowerCase().includes(searchTerm) ||
            item.stockId?.toLowerCase().includes(searchTerm) ||
            item.qcBatchId?.toLowerCase().includes(searchTerm);

        const matchesStation = !stationFilter || 
            (stationFilter === 'output-mc' && item.type === 'output_mc') ||
            (stationFilter === 'wip-second' && item.type === 'wip_second') ||
            (stationFilter === 'wip-stock' && item.type === 'wip_stock') ||
            (stationFilter === 'to-qc' && item.type === 'to_qc');

        const matchesStatus = !statusFilter || 
            item.status === statusFilter ||
            item.qcStatus === statusFilter ||
            item.stockStatus === statusFilter;

        return matchesSearch && matchesStation && matchesStatus;
    });

    populateAllTables();
}

function refreshData() {
    loadProductionData();
    updateStatistics();
    populateAllTables();
    console.log('Production data refreshed at:', new Date().toLocaleTimeString());
}

function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Update any time displays if needed
}

// Navigation functions to workflow pages
function addOutputMC() {
    // Navigate to Machine Status page for adding new machine output
    window.location.href = './mcstatus.html';
}

function addWIPSecond() {
    // Navigate to WIP Second Process page
    window.location.href = './wipsecond.html';
}

function addWIPStock() {
    // Navigate to WIP Stock page for inventory management
    window.location.href = './invwip.html';
}

function addToQC() {
    // Navigate to QC Transfer page
    window.location.href = './tfqc.html';
}

function viewDetails(id) {
    const item = productionData.find(item => item.id === id);
    if (item) {
        let detailHTML = '';
        
        // Create detailed modal content based on item type
        switch(item.type) {
            case 'output_mc':
                detailHTML = `
                    <div class="detail-modal">
                        <div class="detail-header">
                            <h3>📋 Output MC Details</h3>
                            <span class="detail-id">ID: ${item.id}</span>
                        </div>
                        <div class="detail-content">
                            <div class="detail-section">
                                <h4>🔧 Production Information</h4>
                                <p><strong>Part Number:</strong> ${item.partNumber}</p>
                                <p><strong>Model:</strong> ${item.model}</p>
                                <p><strong>Machine:</strong> ${item.machine}</p>
                                <p><strong>Quantity:</strong> ${item.quantity} units</p>
                                <p><strong>Quality Grade:</strong> <span class="badge grade-${item.qualityGrade.toLowerCase().replace('+', 'plus')}">${item.qualityGrade}</span></p>
                            </div>
                            <div class="detail-section">
                                <h4>👨‍🔧 Operator & Timeline</h4>
                                <p><strong>Operator:</strong> ${item.operator}</p>
                                <p><strong>Completion Time:</strong> ${item.completionTime}</p>
                                <p><strong>Status:</strong> <span class="badge status-${item.status}">${item.status.replace('-', ' ')}</span></p>
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            case 'wip_second':
                detailHTML = `
                    <div class="detail-modal">
                        <div class="detail-header">
                            <h3>🔄 WIP Second Process Details</h3>
                            <span class="detail-id">ID: ${item.id}</span>
                        </div>
                        <div class="detail-content">
                            <div class="detail-section">
                                <h4>📋 Work Order Information</h4>
                                <p><strong>WO Number:</strong> ${item.woNumber}</p>
                                <p><strong>Part Number:</strong> ${item.partNumber}</p>
                                <p><strong>Process Type:</strong> ${item.processType}</p>
                                <p><strong>From Station:</strong> ${item.fromStation}</p>
                                <p><strong>Current Quantity:</strong> ${item.currentQty} units</p>
                            </div>
                            <div class="detail-section">
                                <h4>⏱️ Progress & Timeline</h4>
                                <p><strong>Progress:</strong> ${item.progress}</p>
                                <p><strong>Estimated Completion:</strong> ${item.estimatedCompletion}</p>
                                <p><strong>Status:</strong> <span class="badge status-${item.status}">${item.status.replace('-', ' ')}</span></p>
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            case 'wip_stock':
                detailHTML = `
                    <div class="detail-modal">
                        <div class="detail-header">
                            <h3>📦 WIP Stock Details</h3>
                            <span class="detail-id">ID: ${item.id}</span>
                        </div>
                        <div class="detail-content">
                            <div class="detail-section">
                                <h4>📋 Stock Information</h4>
                                <p><strong>Stock ID:</strong> ${item.stockId}</p>
                                <p><strong>Part Number:</strong> ${item.partNumber}</p>
                                <p><strong>Model:</strong> ${item.model}</p>
                                <p><strong>Location:</strong> ${item.location}</p>
                            </div>
                            <div class="detail-section">
                                <h4>📊 Quantity & Status</h4>
                                <p><strong>Available Quantity:</strong> ${item.availableQty} units</p>
                                <p><strong>Reserved Quantity:</strong> ${item.reservedQty} units</p>
                                <p><strong>Last Updated:</strong> ${item.lastUpdated}</p>
                                <p><strong>Stock Status:</strong> <span class="badge status-${item.stockStatus}">${item.stockStatus.replace('-', ' ')}</span></p>
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            case 'to_qc':
                detailHTML = `
                    <div class="detail-modal">
                        <div class="detail-header">
                            <h3>✅ Quality Control Transfer Details</h3>
                            <span class="detail-id">ID: ${item.id}</span>
                        </div>
                        <div class="detail-content">
                            <div class="detail-section">
                                <h4>📋 QC Transfer Information</h4>
                                <p><strong>QC Batch ID:</strong> ${item.qcBatchId}</p>
                                <p><strong>Part Number:</strong> ${item.partNumber}</p>
                                <p><strong>Model:</strong> ${item.model}</p>
                                <p><strong>Quantity Sent:</strong> ${item.quantitySent} units</p>
                                <p><strong>From Process:</strong> ${item.fromProcess}</p>
                            </div>
                            <div class="detail-section">
                                <h4>⚡ Priority & Status</h4>
                                <p><strong>QC Priority:</strong> <span class="badge priority-${item.qcPriority.toLowerCase()}">${item.qcPriority}</span></p>
                                <p><strong>Transfer Time:</strong> ${item.transferTime}</p>
                                <p><strong>QC Status:</strong> <span class="badge status-${item.qcStatus}">${item.qcStatus.replace('-', ' ')}</span></p>
                            </div>
                        </div>
                    </div>
                `;
                break;
        }
        
        // Create and show modal
        showDetailModal(detailHTML);
    }
}

function showDetailModal(content) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <button class="modal-close" onclick="closeDetailModal()">✕</button>
            </div>
            ${content}
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeDetailModal()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalOverlay);
    
    // Add click outside to close
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeDetailModal();
        }
    });
}

function closeDetailModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function editItem(id) {
    const item = productionData.find(item => item.id === id);
    if (item) {
        let identifier = item.partNumber || item.woNumber || item.stockId || item.qcBatchId;
        alert(`Editing: ${identifier}\nThis would open an edit form in production version.`);
    }
}

function exportProductionReport() {
    // Create CSV content
    const headers = ['Type', 'ID', 'Part Number', 'Model', 'Quantity/Status', 'Last Updated'];
    const csvContent = [
        headers.join(','),
        ...filteredData.map(item => [
            item.type,
            item.partNumber || item.woNumber || item.stockId || item.qcBatchId,
            item.partNumber || '-',
            item.model || '-',
            item.quantity || item.currentQty || item.availableQty || item.quantitySent || '-',
            item.completionTime || item.estimatedCompletion || item.lastUpdated || item.transferTime || '-'
        ].join(','))
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `production_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    alert('Production report exported successfully!');
}

function toggleUserMenu() {
    // User menu toggle functionality
    if (confirm('User menu options:\n- Profile Settings\n- Change Password\n- Logout\n\nWould you like to logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = '../login.html';
    }
}

// Event listeners for real-time updates
document.getElementById('searchInput').addEventListener('input', function() {
    if (this.value.length >= 3 || this.value.length === 0) {
        searchTransactions();
    }
});

document.getElementById('stationFilter').addEventListener('change', searchTransactions);
document.getElementById('statusFilter').addEventListener('change', searchTransactions);

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
    if (e.key === 'F5') {
        e.preventDefault();
        refreshData();
    }
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportProductionReport();
    }
});

// Simulate real-time updates
setInterval(function() {
    // Randomly update some statistics to simulate real-time data
    const outputMCCount = document.getElementById('outputMCCount');
    const wipSecondCount = document.getElementById('wipSecondCount');
    const wipStockCount = document.getElementById('wipStockCount');
    const toQCCount = document.getElementById('toQCCount');
    
    // Simulate small changes in data
    if (Math.random() > 0.95) {
        let currentValue = parseInt(outputMCCount.textContent);
        outputMCCount.textContent = Math.max(0, currentValue + Math.floor(Math.random() * 3) - 1);
    }
    
    if (Math.random() > 0.95) {
        let currentValue = parseInt(wipSecondCount.textContent);
        wipSecondCount.textContent = Math.max(0, currentValue + Math.floor(Math.random() * 3) - 1);
    }
}, 5000); // Update every 5 seconds

// Animation for live indicator
const pulseElements = document.querySelectorAll('.pulse');
pulseElements.forEach(pulse => {
    setInterval(() => {
        pulse.style.opacity = pulse.style.opacity === '0.3' ? '1' : '0.3';
    }, 1500);
});

// Add event listeners for individual section search inputs
document.addEventListener('DOMContentLoaded', function() {
    // Output MC search
    const outputMCSearch = document.getElementById('searchOutputMC');
    if (outputMCSearch) {
        outputMCSearch.addEventListener('input', function() {
            searchOutputMC();
        });
    }

    // WIP Second search
    const wipSecondSearch = document.getElementById('searchWIPSecond');
    if (wipSecondSearch) {
        wipSecondSearch.addEventListener('input', function() {
            searchWIPSecond();
        });
    }

    // WIP Stock search
    const wipStockSearch = document.getElementById('searchWIPStock');
    if (wipStockSearch) {
        wipStockSearch.addEventListener('input', function() {
            searchWIPStock();
        });
    }

    // To QC search
    const toQCSearch = document.getElementById('searchToQC');
    if (toQCSearch) {
        toQCSearch.addEventListener('input', function() {
            searchToQC();
        });
    }
});

// Machine Configuration (13 Units) - synced with OutputMC
const MACHINES_CONFIG = [
    { id: 'MC-001', name: 'Injection Molding 1', type: 'Injection', capacity: 120 },
    { id: 'MC-002', name: 'Injection Molding 2', type: 'Injection', capacity: 120 },
    { id: 'MC-003', name: 'Injection Molding 3', type: 'Injection', capacity: 100 },
    { id: 'MC-004', name: 'Blow Molding 1', type: 'Blow', capacity: 80 },
    { id: 'MC-005', name: 'Blow Molding 2', type: 'Blow', capacity: 80 },
    { id: 'MC-006', name: 'Extrusion 1', type: 'Extrusion', capacity: 150 },
    { id: 'MC-007', name: 'Extrusion 2', type: 'Extrusion', capacity: 150 },
    { id: 'MC-008', name: 'Assembly Line 1', type: 'Assembly', capacity: 200 },
    { id: 'MC-009', name: 'Assembly Line 2', type: 'Assembly', capacity: 200 },
    { id: 'MC-010', name: 'Quality Check 1', type: 'QC', capacity: 300 },
    { id: 'MC-011', name: 'Quality Check 2', type: 'QC', capacity: 300 },
    { id: 'MC-012', name: 'Packaging 1', type: 'Packaging', capacity: 250 },
    { id: 'MC-013', name: 'Packaging 2', type: 'Packaging', capacity: 250 }
];

// Production Types
const PRODUCTION_TYPES = [
    'Automotive Parts', 'Electronic Housing', 'Medical Devices', 
    'Consumer Products', 'Industrial Components', 'Trial Product A', 
    'Trial Product B', 'Regular Production'
];

// Operators
const OPERATORS = [
    'Budi Santoso', 'Siti Rahayu', 'Ahmad Wijaya', 'Dewi Sartika',
    'Rudi Hermawan', 'Nina Kurnia', 'Eko Prasetyo', 'Lina Marlina',
    'Joko Susilo', 'Maya Sari', 'Dedi Kurniawan', 'Rina Wati'
];

// Machine Status Data
let machineStatusData = [];

// Initialize machine status when page loads
function initializeMachineStatus() {
    generateMachineStatusData();
    renderMachineStatus();
    
    // Auto refresh every 30 seconds
    setInterval(() => {
        generateMachineStatusData();
        renderMachineStatus();
    }, 30000);
}

// Generate mock machine status data
function generateMachineStatusData() {
    machineStatusData = MACHINES_CONFIG.map(config => {
        const status = getRandomMachineStatus();
        const productionType = getRandomProductionType();
        const outputPerHour = calculateMachineOutput(config.capacity, status);
        
        return {
            ...config,
            status: status,
            productionType: productionType,
            isTrialProduct: productionType.includes('Trial'),
            outputPerHour: outputPerHour,
            targetPerHour: config.capacity,
            operator: getRandomOperator(),
            lastUpdate: new Date()
        };
    });
}

// Helper functions for machine status
function getRandomMachineStatus() {
    const statuses = ['running', 'maintenance', 'stopped'];
    const weights = [0.75, 0.15, 0.1]; // 75% running, 15% maintenance, 10% stopped
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < statuses.length; i++) {
        cumulative += weights[i];
        if (random < cumulative) {
            return statuses[i];
        }
    }
    return 'running';
}

function getRandomProductionType() {
    return PRODUCTION_TYPES[Math.floor(Math.random() * PRODUCTION_TYPES.length)];
}

function getRandomOperator() {
    return OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
}

function calculateMachineOutput(capacity, status) {
    if (status === 'stopped') return 0;
    if (status === 'maintenance') return 0;
    
    // Running machines have 70-95% of capacity
    const efficiency = 0.7 + (Math.random() * 0.25);
    return Math.round(capacity * efficiency);
}

// Render machine status table
function renderMachineStatus() {
    const tableBody = document.getElementById('machineTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    machineStatusData.forEach(machine => {
        const row = createMachineTableRow(machine);
        tableBody.appendChild(row);
    });
}

// Create table row for machine
function createMachineTableRow(machine) {
    const row = document.createElement('tr');
    row.onclick = () => openOutputMC(machine.id);
    
    const statusClass = machine.isTrialProduct ? 'trial' : 
                       machine.status === 'running' ? 'running' : 
                       machine.status === 'maintenance' ? 'maintenance' : 'stopped';
    
    const statusText = machine.isTrialProduct ? 'TRIAL' : 
                      machine.status === 'running' ? 'REGULAR' : 
                      machine.status === 'maintenance' ? 'MAINTENANCE' : 'STOPPED';
    
    row.innerHTML = `
        <td><span class="machine-id">${machine.id}</span></td>
        <td>${machine.productionType}</td>
        <td><span class="machine-output">${machine.outputPerHour}/${machine.targetPerHour} pcs/h</span></td>
        <td>${machine.operator}</td>
        <td><span class="status-badge-table ${statusClass}">${statusText}</span></td>
    `;
    
    return row;
}

// Open MC Status page
function openOutputMC(machineId = null) {
    // Navigate to MC Status page
    if (machineId) {
        // Open with specific machine highlighted
        window.location.href = `../produksi/mcstatus.html?machine=${machineId}`;
    } else {
        // Open general MC Status page
        window.location.href = '../produksi/mcstatus.html';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: 'bold',
        zIndex: '9999',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Additional navigation functions for section headers
function viewAllOutputMC() {
    window.location.href = './mcstatus.html';
}

function viewAllWIPSecond() {
    window.location.href = './wipsecond.html';
}

function viewAllWIPStock() {
    window.location.href = './invwip.html';
}

function viewAllToQC() {
    window.location.href = './tfqc.html';
}

// Function to navigate to specific workflow section
function navigateToWorkflow(workflowType, searchTerm = '') {
    let targetUrl = '';
    let searchParam = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
    
    switch(workflowType) {
        case 'machine-output':
            targetUrl = './mcoutput.html' + searchParam;
            break;
        case 'wip-second':
            targetUrl = './wipsecond.html' + searchParam;
            break;
        case 'wip-stock':
            targetUrl = './invwip.html' + searchParam;
            break;
        case 'qc-transfer':
            targetUrl = './tfqc.html' + searchParam;
            break;
        default:
            console.warn('Unknown workflow type:', workflowType);
            return;
    }
    
    window.location.href = targetUrl;
}

// Enhanced search function that can also navigate to specific pages
function searchAndNavigate(sectionType) {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    
    if (searchTerm) {
        // If there's a search term, navigate to the appropriate page with search
        navigateToWorkflow(sectionType, searchTerm);
    } else {
        // If no search term, just navigate to the page
        navigateToWorkflow(sectionType);
    }
}

// Initialize machine status on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize existing functions first
    initializeMachineStatus();
});
