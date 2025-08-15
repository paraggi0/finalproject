// DC (Delivery Control) Module
// PT. Topline Evergreen Manufacturing

// Global variables
let deliveryData = [];
let vehicleData = [];
let routeData = [];
let currentEditId = null;

// Sample data for demonstration
const sampleDeliveryData = [
    {
        id: 'DC001',
        deliveryNumber: 'DEL-2024-001',
        customer: 'Customer ABC',
        address: 'Jl. Industri No. 123, Jakarta',
        vehicleId: 'V-001',
        driverName: 'John Doe',
        status: 'in-transit',
        priority: 'normal',
        scheduledDate: '2024-01-20',
        scheduledTime: '09:00',
        actualDeparture: '09:15',
        estimatedArrival: '11:30',
        totalItems: 5,
        totalWeight: 250.5,
        distance: 25.8,
        route: 'Route A',
        contactNumber: '+62812345678',
        specialInstructions: 'Fragile items - handle with care'
    },
    {
        id: 'DC002',
        deliveryNumber: 'DEL-2024-002',
        customer: 'Customer XYZ',
        address: 'Jl. Perdagangan No. 456, Bekasi',
        vehicleId: 'V-002',
        driverName: 'Jane Smith',
        status: 'scheduled',
        priority: 'urgent',
        scheduledDate: '2024-01-20',
        scheduledTime: '13:00',
        actualDeparture: null,
        estimatedArrival: '15:00',
        totalItems: 3,
        totalWeight: 150.0,
        distance: 18.5,
        route: 'Route B',
        contactNumber: '+62823456789',
        specialInstructions: 'Call before arrival'
    },
    {
        id: 'DC003',
        deliveryNumber: 'DEL-2024-003',
        customer: 'Customer DEF',
        address: 'Jl. Bisnis No. 789, Tangerang',
        vehicleId: 'V-003',
        driverName: 'Mike Johnson',
        status: 'delivered',
        priority: 'normal',
        scheduledDate: '2024-01-19',
        scheduledTime: '14:00',
        actualDeparture: '14:10',
        estimatedArrival: '16:30',
        totalItems: 8,
        totalWeight: 420.3,
        distance: 32.1,
        route: 'Route C',
        contactNumber: '+62834567890',
        specialInstructions: 'Loading dock available'
    }
];

const sampleVehicleData = [
    {
        id: 'V-001',
        plateNumber: 'B 1234 CD',
        type: 'Truck',
        capacity: 5000,
        driver: 'John Doe',
        status: 'active',
        currentLocation: 'In Transit - Jl. Tol Jakarta-Cikampek',
        fuelLevel: 75,
        lastMaintenance: '2024-01-15'
    },
    {
        id: 'V-002',
        plateNumber: 'B 5678 EF',
        type: 'Van',
        capacity: 2000,
        driver: 'Jane Smith',
        status: 'available',
        currentLocation: 'Warehouse',
        fuelLevel: 90,
        lastMaintenance: '2024-01-10'
    },
    {
        id: 'V-003',
        plateNumber: 'B 9012 GH',
        type: 'Truck',
        capacity: 7500,
        driver: 'Mike Johnson',
        status: 'maintenance',
        currentLocation: 'Workshop',
        fuelLevel: 60,
        lastMaintenance: '2024-01-18'
    }
];

// Initialize DC module
function initializeDC() {
    console.log('Initializing DC module...');
    deliveryData = [...sampleDeliveryData];
    vehicleData = [...sampleVehicleData];
    loadDeliveryData();
    updateStatistics();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    const form = document.getElementById('deliveryForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Close modal when clicking outside
    const modal = document.getElementById('deliveryModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

// Load delivery data into table
function loadDeliveryData() {
    const tableBody = document.getElementById('deliveryTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    deliveryData.forEach(item => {
        const row = document.createElement('tr');
        const vehicle = vehicleData.find(v => v.id === item.vehicleId);
        
        row.innerHTML = `
            <td>${item.deliveryNumber}</td>
            <td>
                ${item.customer}<br>
                <small style="color: rgba(255, 255, 255, 0.7);">${item.address}</small>
            </td>
            <td>
                ${vehicle ? vehicle.plateNumber : 'N/A'}<br>
                <small style="color: rgba(255, 255, 255, 0.7);">${item.driverName}</small>
            </td>
            <td>${item.route}</td>
            <td>${item.scheduledDate}<br><small>${item.scheduledTime}</small></td>
            <td>${item.totalItems} items<br><small>${item.totalWeight} kg</small></td>
            <td><span class="delivery-status status-${item.status}">${item.status.replace('-', ' ').toUpperCase()}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="editItem('${item.id}')">Edit</button>
                    <button class="btn btn-info btn-sm" onclick="trackDelivery('${item.id}')">Track</button>
                    <button class="btn btn-success btn-sm" onclick="updateStatus('${item.id}')">Update</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update statistics
function updateStatistics() {
    const stats = {
        totalDeliveries: deliveryData.length,
        inTransit: deliveryData.filter(item => item.status === 'in-transit').length,
        scheduled: deliveryData.filter(item => item.status === 'scheduled').length,
        delivered: deliveryData.filter(item => item.status === 'delivered').length,
        activeVehicles: vehicleData.filter(v => v.status === 'active').length
    };

    // Update DOM elements
    updateElementText('totalDeliveries', stats.totalDeliveries);
    updateElementText('inTransitDeliveries', stats.inTransit);
    updateElementText('scheduledDeliveries', stats.scheduled);
    updateElementText('activeVehicles', stats.activeVehicles);
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
    document.getElementById('modalTitle').textContent = 'Schedule New Delivery';
    document.getElementById('deliveryForm').reset();
    populateVehicleOptions();
    document.getElementById('deliveryModal').style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('deliveryModal').style.display = 'none';
    currentEditId = null;
}

// Populate vehicle options in select
function populateVehicleOptions() {
    const vehicleSelect = document.getElementById('vehicleId');
    if (!vehicleSelect) return;

    vehicleSelect.innerHTML = '<option value="">Select Vehicle</option>';
    vehicleData.filter(v => v.status === 'available' || v.status === 'active').forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle.id;
        option.textContent = `${vehicle.plateNumber} - ${vehicle.type} (${vehicle.driver})`;
        vehicleSelect.appendChild(option);
    });
}

// Edit item
function editItem(id) {
    const item = deliveryData.find(i => i.id === id);
    if (!item) return;

    currentEditId = id;
    document.getElementById('modalTitle').textContent = 'Edit Delivery';
    
    // Populate form fields
    document.getElementById('deliveryNumber').value = item.deliveryNumber;
    document.getElementById('customer').value = item.customer;
    document.getElementById('address').value = item.address;
    document.getElementById('contactNumber').value = item.contactNumber;
    document.getElementById('scheduledDate').value = item.scheduledDate;
    document.getElementById('scheduledTime').value = item.scheduledTime;
    document.getElementById('totalItems').value = item.totalItems;
    document.getElementById('totalWeight').value = item.totalWeight;
    document.getElementById('route').value = item.route;
    document.getElementById('priority').value = item.priority;
    document.getElementById('specialInstructions').value = item.specialInstructions;
    
    populateVehicleOptions();
    document.getElementById('vehicleId').value = item.vehicleId;
    document.getElementById('deliveryModal').style.display = 'block';
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const itemData = {
        id: currentEditId || 'DC' + String(Date.now()).slice(-6),
        deliveryNumber: formData.get('deliveryNumber'),
        customer: formData.get('customer'),
        address: formData.get('address'),
        contactNumber: formData.get('contactNumber'),
        vehicleId: formData.get('vehicleId'),
        driverName: getDriverName(formData.get('vehicleId')),
        scheduledDate: formData.get('scheduledDate'),
        scheduledTime: formData.get('scheduledTime'),
        totalItems: parseInt(formData.get('totalItems')),
        totalWeight: parseFloat(formData.get('totalWeight')),
        route: formData.get('route'),
        priority: formData.get('priority'),
        specialInstructions: formData.get('specialInstructions'),
        status: currentEditId ? deliveryData.find(d => d.id === currentEditId).status : 'scheduled',
        actualDeparture: null,
        estimatedArrival: null,
        distance: calculateDistance()
    };

    if (currentEditId) {
        // Update existing item
        const index = deliveryData.findIndex(item => item.id === currentEditId);
        deliveryData[index] = itemData;
    } else {
        // Add new item
        deliveryData.push(itemData);
    }

    loadDeliveryData();
    updateStatistics();
    closeModal();
    
    showNotification(currentEditId ? 'Delivery updated successfully!' : 'Delivery scheduled successfully!', 'success');
}

// Get driver name from vehicle ID
function getDriverName(vehicleId) {
    const vehicle = vehicleData.find(v => v.id === vehicleId);
    return vehicle ? vehicle.driver : '';
}

// Calculate estimated distance (mock function)
function calculateDistance() {
    return Math.floor(Math.random() * 50) + 10; // Random distance between 10-60 km
}

// Search functionality
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const filteredData = deliveryData.filter(item => 
        item.deliveryNumber.toLowerCase().includes(query) ||
        item.customer.toLowerCase().includes(query) ||
        item.driverName.toLowerCase().includes(query) ||
        item.route.toLowerCase().includes(query)
    );
    
    // Update table with filtered data
    const tableBody = document.getElementById('deliveryTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    filteredData.forEach(item => {
        const row = document.createElement('tr');
        const vehicle = vehicleData.find(v => v.id === item.vehicleId);
        
        row.innerHTML = `
            <td>${item.deliveryNumber}</td>
            <td>
                ${item.customer}<br>
                <small style="color: rgba(255, 255, 255, 0.7);">${item.address}</small>
            </td>
            <td>
                ${vehicle ? vehicle.plateNumber : 'N/A'}<br>
                <small style="color: rgba(255, 255, 255, 0.7);">${item.driverName}</small>
            </td>
            <td>${item.route}</td>
            <td>${item.scheduledDate}<br><small>${item.scheduledTime}</small></td>
            <td>${item.totalItems} items<br><small>${item.totalWeight} kg</small></td>
            <td><span class="delivery-status status-${item.status}">${item.status.replace('-', ' ').toUpperCase()}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="editItem('${item.id}')">Edit</button>
                    <button class="btn btn-info btn-sm" onclick="trackDelivery('${item.id}')">Track</button>
                    <button class="btn btn-success btn-sm" onclick="updateStatus('${item.id}')">Update</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Track delivery
function trackDelivery(id) {
    const item = deliveryData.find(i => i.id === id);
    if (!item) return;

    const vehicle = vehicleData.find(v => v.id === item.vehicleId);
    const trackingInfo = `
🚚 Delivery Tracking: ${item.deliveryNumber}

Customer: ${item.customer}
Address: ${item.address}
Vehicle: ${vehicle ? vehicle.plateNumber : 'N/A'}
Driver: ${item.driverName}
Route: ${item.route}
Status: ${item.status.toUpperCase()}

Scheduled: ${item.scheduledDate} at ${item.scheduledTime}
${item.actualDeparture ? `Departed: ${item.actualDeparture}` : ''}
${item.estimatedArrival ? `ETA: ${item.estimatedArrival}` : ''}

Contact: ${item.contactNumber}
${item.specialInstructions ? `Instructions: ${item.specialInstructions}` : ''}
    `;

    alert(trackingInfo);
}

// Update delivery status
function updateStatus(id) {
    const item = deliveryData.find(i => i.id === id);
    if (!item) return;

    const statuses = ['scheduled', 'departed', 'in-transit', 'delivered', 'delayed'];
    const currentIndex = statuses.indexOf(item.status);
    const nextStatus = statuses[Math.min(currentIndex + 1, statuses.length - 1)];

    if (confirm(`Update status from "${item.status}" to "${nextStatus}"?`)) {
        item.status = nextStatus;
        
        // Update timestamps based on status
        if (nextStatus === 'departed') {
            item.actualDeparture = new Date().toLocaleTimeString();
        } else if (nextStatus === 'in-transit') {
            const eta = new Date();
            eta.setHours(eta.getHours() + 2);
            item.estimatedArrival = eta.toLocaleTimeString();
        }

        loadDeliveryData();
        updateStatistics();
        showNotification(`Status updated to: ${nextStatus.toUpperCase()}`, 'success');
    }
}

// Delivery action functions
function routeOptimization() {
    showNotification('🗺️ Route Optimization\n\nAnalyzing traffic patterns and optimizing delivery routes for efficiency.', 'info');
}

function vehicleTracking() {
    const trackingData = vehicleData.map(vehicle => 
        `${vehicle.plateNumber}: ${vehicle.currentLocation} (${vehicle.status})`
    ).join('\n');
    
    alert(`🚚 Vehicle Tracking\n\n${trackingData}`);
}

function driverNotification() {
    showNotification('📱 Driver Notification\n\nSending notifications to drivers about schedule updates and route changes.', 'info');
}

function proofOfDelivery() {
    showNotification('📋 Proof of Delivery\n\nManaging delivery confirmations and customer signatures.', 'info');
}

// Utility functions
function refreshData() {
    loadDeliveryData();
    updateStatistics();
    showNotification('Data refreshed successfully!', 'success');
}

function exportReport() {
    showNotification('📊 Exporting delivery report...\n\nGenerating comprehensive delivery analysis.', 'info');
}

function bulkUpdate() {
    showNotification('📝 Bulk Update\n\nSelect multiple deliveries for batch operations.', 'info');
}

function generateManifest() {
    showNotification('📋 Generating delivery manifest for selected routes...', 'success');
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
    initializeDC();
});

// Export functions for global access
window.openAddModal = openAddModal;
window.closeModal = closeModal;
window.editItem = editItem;
window.trackDelivery = trackDelivery;
window.updateStatus = updateStatus;
window.routeOptimization = routeOptimization;
window.vehicleTracking = vehicleTracking;
window.driverNotification = driverNotification;
window.proofOfDelivery = proofOfDelivery;
window.refreshData = refreshData;
window.exportReport = exportReport;
window.bulkUpdate = bulkUpdate;
window.generateManifest = generateManifest;
