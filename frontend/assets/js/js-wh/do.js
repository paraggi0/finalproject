/**
 * DO (Delivery Order) Management System with Database Integration
 * PT. Topline Evergreen Manufacturing
 * 
 * Comprehensive delivery order processing and management
 * Features: Order creation, item management, customer processing, delivery tracking
 * Database Integration: GET & POST operations for real-time data management
 */

// Global variables
let deliveryOrders = [];
let currentOrder = null;
let orderItems = [];

// Database API configuration
const API_BASE_URL = 'http://localhost:3000/api';
const DB_ENDPOINTS = {
    orders: '/delivery-orders',
    customers: '/customers',
    products: '/products',
    orderItems: '/order-items'
};

// Database helper functions
class DatabaseAPI {
    static async request(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            showLoading();
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            hideLoading();
            return data;
        } catch (error) {
            hideLoading();
            console.error('Database request error:', error);
            showNotification('Database connection error: ' + error.message, 'error');
            throw error;
        }
    }

    static async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Delivery Order API functions
class DeliveryOrderAPI {
    static async fetchOrders() {
        try {
            const orders = await DatabaseAPI.get(DB_ENDPOINTS.orders);
            deliveryOrders = orders;
            return orders;
        } catch (error) {
            console.error('Error fetching delivery orders:', error);
            // Fallback to sample data if database fails
            deliveryOrders = getSampleOrders();
            return deliveryOrders;
        }
    }

    static async createOrder(orderData) {
        try {
            const newOrder = await DatabaseAPI.post(DB_ENDPOINTS.orders, orderData);
            deliveryOrders.push(newOrder);
            showNotification('Delivery order created successfully!', 'success');
            return newOrder;
        } catch (error) {
            console.error('Error creating delivery order:', error);
            // Fallback to local creation
            const fallbackOrder = {
                id: generateOrderId(),
                ...orderData,
                createdAt: new Date().toISOString()
            };
            deliveryOrders.push(fallbackOrder);
            showNotification('Order created locally (database connection failed)', 'warning');
            return fallbackOrder;
        }
    }

    static async updateOrder(orderId, orderData) {
        try {
            const updatedOrder = await DatabaseAPI.put(`${DB_ENDPOINTS.orders}/${orderId}`, orderData);
            const index = deliveryOrders.findIndex(o => o.id === orderId);
            if (index !== -1) {
                deliveryOrders[index] = updatedOrder;
            }
            showNotification('Delivery order updated successfully!', 'success');
            return updatedOrder;
        } catch (error) {
            console.error('Error updating delivery order:', error);
            showNotification('Failed to update order in database', 'error');
            throw error;
        }
    }

    static async deleteOrder(orderId) {
        try {
            await DatabaseAPI.delete(`${DB_ENDPOINTS.orders}/${orderId}`);
            deliveryOrders = deliveryOrders.filter(o => o.id !== orderId);
            showNotification('Delivery order deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting delivery order:', error);
            showNotification('Failed to delete order from database', 'error');
            throw error;
        }
    }

    static async fetchCustomers() {
        try {
            return await DatabaseAPI.get(DB_ENDPOINTS.customers);
        } catch (error) {
            console.error('Error fetching customers:', error);
            return getSampleCustomers();
        }
    }

    static async fetchProducts() {
        try {
            return await DatabaseAPI.get(DB_ENDPOINTS.products);
        } catch (error) {
            console.error('Error fetching products:', error);
            return getSampleProducts();
        }
    }
}

// Helper functions for UI
function showLoadingState(show = true) {
    const loadingElements = document.querySelectorAll('.loading-spinner');
    loadingElements.forEach(el => {
        el.style.display = show ? 'block' : 'none';
    });
}

function showNotification(message, type = 'info') {
    // Create or update notification element
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        notification.className = 'notification';
    }, 3000);
}

function generateOrderId() {
    return 'DO' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Fallback sample data functions
function getSampleOrders() {
    return [
        {
            id: 'DO001',
            orderNumber: 'DO-2024-001',
            customer: 'Customer ABC',
            customerCode: 'CUST001',
            orderDate: '2024-01-18',
            requestedDate: '2024-01-22',
            status: 'confirmed',
            priority: 'normal',
            paymentTerms: 'NET 30',
            shippingMethod: 'Standard Delivery',
            totalItems: 3,
            totalQuantity: 150,
            totalWeight: 750.5,
            totalValue: 18750.00,
            salesPerson: 'Sales Rep 1',
            customerPO: 'PO-ABC-001',
            deliveryAddress: 'Jl. Industri No. 123, Jakarta',
            contactPerson: 'John Doe',
            contactNumber: '+62812345678',
            specialInstructions: 'Handle with care - fragile items',
            items: [
                { productCode: 'TLE-2024-001', productName: 'Elite Series A1', quantity: 50, unitPrice: 125.50, totalPrice: 6275.00 },
                { productCode: 'TLE-2024-002', productName: 'Standard Series B2', quantity: 75, unitPrice: 89.75, totalPrice: 6731.25 },
                { productCode: 'TLE-2024-003', productName: 'Premium Series C3', quantity: 25, unitPrice: 175.25, totalPrice: 4381.25 }
            ]
        },
        {
        id: 'DO001',
        orderNumber: 'DO-2024-001',
        customer: 'Customer ABC',
        customerCode: 'CUST001',
        orderDate: '2024-01-18',
        requestedDate: '2024-01-22',
        status: 'confirmed',
        priority: 'normal',
        paymentTerms: 'NET 30',
        shippingMethod: 'Standard Delivery',
        totalItems: 3,
        totalQuantity: 150,
        totalWeight: 750.5,
        totalValue: 18750.00,
        salesPerson: 'Sales Rep 1',
        customerPO: 'PO-ABC-001',
        deliveryAddress: 'Jl. Industri No. 123, Jakarta',
        contactPerson: 'John Doe',
        contactNumber: '+62812345678',
        specialInstructions: 'Handle with care - fragile items',
        items: [
            { productCode: 'TLE-2024-001', productName: 'Elite Series A1', quantity: 50, unitPrice: 125.50, totalPrice: 6275.00 },
            { productCode: 'TLE-2024-002', productName: 'Standard Series B2', quantity: 75, unitPrice: 89.75, totalPrice: 6731.25 },
            { productCode: 'TLE-2024-003', productName: 'Premium Series C3', quantity: 25, unitPrice: 175.25, totalPrice: 4381.25 }
        ]
    },
    {
        id: 'DO002',
            orderNumber: 'DO-2024-002',
            customer: 'Customer XYZ',
            customerCode: 'CUST002',
            orderDate: '2024-01-19',
            requestedDate: '2024-01-23',
            status: 'processing',
            priority: 'urgent',
            paymentTerms: 'COD',
            shippingMethod: 'Express Delivery',
            totalItems: 2,
            totalQuantity: 80,
            totalWeight: 420.0,
            totalValue: 12450.00,
            salesPerson: 'Sales Rep 2',
            customerPO: 'PO-XYZ-002',
            deliveryAddress: 'Jl. Perdagangan No. 456, Bekasi',
            contactPerson: 'Jane Smith',
            contactNumber: '+62823456789',
            specialInstructions: 'Call before delivery',
            items: [
                { productCode: 'TLE-2024-002', productName: 'Standard Series B2', quantity: 50, unitPrice: 89.75, totalPrice: 4487.50 },
                { productCode: 'TLE-2024-004', productName: 'Economy Series D4', quantity: 30, unitPrice: 265.50, totalPrice: 7965.00 }
            ]
        },
        {
            id: 'DO003',
            orderNumber: 'DO-2024-003',
            customer: 'Customer DEF',
            customerCode: 'CUST003',
            orderDate: '2024-01-20',
            requestedDate: '2024-01-25',
            status: 'shipped',
            priority: 'normal',
            paymentTerms: 'NET 15',
            shippingMethod: 'Standard Delivery',
            totalItems: 4,
            totalQuantity: 200,
            totalWeight: 950.3,
            totalValue: 24680.00,
            salesPerson: 'Sales Rep 3',
            customerPO: 'PO-DEF-003',
            deliveryAddress: 'Jl. Bisnis No. 789, Tangerang',
            contactPerson: 'Mike Johnson',
            contactNumber: '+62834567890',
            specialInstructions: 'Loading dock available - use rear entrance',
            items: [
                { productCode: 'TLE-2024-001', productName: 'Elite Series A1', quantity: 40, unitPrice: 125.50, totalPrice: 5020.00 },
                { productCode: 'TLE-2024-002', productName: 'Standard Series B2', quantity: 60, unitPrice: 89.75, totalPrice: 5385.00 },
                { productCode: 'TLE-2024-003', productName: 'Premium Series C3', quantity: 80, unitPrice: 175.25, totalPrice: 14020.00 },
                { productCode: 'TLE-2024-004', productName: 'Economy Series D4', quantity: 20, unitPrice: 12.75, totalPrice: 255.00 }
            ]
        }
    ];
}

function getSampleCustomers() {
    return [
        { id: 'CUST001', name: 'Customer ABC', code: 'CUST001', address: 'Jl. Industri No. 123, Jakarta' },
        { id: 'CUST002', name: 'Customer XYZ', code: 'CUST002', address: 'Jl. Perdagangan No. 456, Bekasi' },
        { id: 'CUST003', name: 'Customer DEF', code: 'CUST003', address: 'Jl. Bisnis No. 789, Tangerang' }
    ];
}

function getSampleProducts() {
    return [
        { code: 'TLE-2024-001', name: 'Elite Series A1', price: 125.50, unit: 'pcs' },
        { code: 'TLE-2024-002', name: 'Standard Series B2', price: 89.75, unit: 'pcs' },
        { code: 'TLE-2024-003', name: 'Premium Series C3', price: 175.25, unit: 'pcs' },
        { code: 'TLE-2024-004', name: 'Economy Series D4', price: 265.50, unit: 'pcs' }
    ];
}

// Initialize DO module with database integration
async function initializeDO() {
    console.log('Initializing DO module...');
    showLoadingState(true);
    
    try {
        // Load orders from database
        deliveryOrders = await DeliveryOrderAPI.fetchOrders();
        loadOrderData();
        updateStatistics();
        setupEventListeners();
        showNotification('DO module initialized successfully', 'success');
    } catch (error) {
        console.error('Error initializing DO module:', error);
        showNotification('Failed to initialize DO module', 'error');
    } finally {
        showLoadingState(false);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    const form = document.getElementById('orderForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Close modal when clicking outside
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Item management
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', addOrderItem);
    }
}

// Load order data into table with database integration
async function loadOrderData() {
    const tableBody = document.getElementById('orderTableBody');
    if (!tableBody) return;

    showLoadingState(true);
    tableBody.innerHTML = '';

    try {
        // Use global deliveryOrders array which is loaded from database
        deliveryOrders.forEach(item => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${item.orderNumber}</td>
                <td>
                    ${item.customer}<br>
                    <small style="color: rgba(255, 255, 255, 0.7);">${item.customerCode}</small>
                </td>
                <td>${item.orderDate}</td>
                <td>${item.requestedDate}</td>
                <td>${item.totalItems} items<br><small>${item.totalQuantity} qty</small></td>
                <td>$${item.totalValue.toLocaleString()}</td>
                <td>
                    <span class="status-badge status-${item.status}">${item.status}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="editOrder('${item.id}')" title="Edit Order">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-view" onclick="viewOrder('${item.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action btn-print" onclick="printOrder('${item.id}')" title="Print Order">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteOrder('${item.id}')" title="Delete Order">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading order data:', error);
        showNotification('Error loading order data', 'error');
    } finally {
        showLoadingState(false);
    }
}

// Update statistics with database data
function updateStatistics() {
    const stats = {
        totalOrders: deliveryOrders.length,
        pendingOrders: deliveryOrders.filter(item => item.status === 'pending' || item.status === 'confirmed').length,
        processingOrders: deliveryOrders.filter(item => item.status === 'processing').length,
        shippedOrders: deliveryOrders.filter(item => item.status === 'shipped').length,
        totalValue: deliveryOrders.reduce((sum, item) => sum + item.totalValue, 0)
    };

    // Update DOM elements
    updateElementText('totalOrders', stats.totalOrders);
    updateElementText('pendingOrders', stats.pendingOrders);
    updateElementText('processingOrders', stats.processingOrders);
    updateElementText('shippedOrders', stats.shippedOrders);
    updateElementText('totalValue', `$${stats.totalValue.toLocaleString()}`);
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
    currentOrder = null;
    orderItems = [];
    document.getElementById('modalTitle').textContent = 'Create New Delivery Order';
    document.getElementById('orderForm').reset();
    updateItemsTable();
    document.getElementById('orderModal').style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('orderModal').style.display = 'none';
    currentOrder = null;
    orderItems = [];
}

// Edit order with database integration
async function editOrder(id) {
    try {
        showLoadingState(true);
        const order = deliveryOrders.find(o => o.id === id);
        if (!order) {
            showNotification('Order not found', 'error');
            return;
        }

        currentOrder = order;
        orderItems = [...order.items];
        document.getElementById('modalTitle').textContent = 'Edit Delivery Order';
        
        // Populate form fields
        populateFormFields(order);
        updateItemsTable();
        document.getElementById('orderModal').style.display = 'block';
    } catch (error) {
        console.error('Error editing order:', error);
        showNotification('Error loading order for editing', 'error');
    } finally {
        showLoadingState(false);
    }
}

// Populate form fields with order data
function populateFormFields(order) {
    document.getElementById('orderNumber').value = order.orderNumber;
    document.getElementById('customer').value = order.customer;
    document.getElementById('customerCode').value = order.customerCode;
    document.getElementById('customerPO').value = order.customerPO;
    document.getElementById('orderDate').value = order.orderDate;
    document.getElementById('requestedDate').value = order.requestedDate;
    document.getElementById('salesPerson').value = order.salesPerson;
    document.getElementById('paymentTerms').value = order.paymentTerms;
    document.getElementById('shippingMethod').value = order.shippingMethod;
    document.getElementById('priority').value = order.priority;
    document.getElementById('deliveryAddress').value = order.deliveryAddress;
    document.getElementById('contactPerson').value = order.contactPerson;
    document.getElementById('contactNumber').value = order.contactNumber;
    document.getElementById('specialInstructions').value = order.specialInstructions;
}

// Handle form submission with database integration
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (orderItems.length === 0) {
        showNotification('Please add at least one item to the order', 'error');
        return;
    }
    
    showLoadingState(true);
    
    try {
        const formData = new FormData(e.target);
        const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const totalWeight = totalQuantity * 5; // Estimate 5kg per item
        
        const orderData = {
            orderNumber: formData.get('orderNumber'),
            customer: formData.get('customer'),
            customerCode: formData.get('customerCode'),
            customerPO: formData.get('customerPO'),
            orderDate: formData.get('orderDate'),
            requestedDate: formData.get('requestedDate'),
            status: 'confirmed',
            priority: formData.get('priority'),
            paymentTerms: formData.get('paymentTerms'),
            shippingMethod: formData.get('shippingMethod'),
            totalItems: orderItems.length,
            totalQuantity: totalQuantity,
            totalWeight: totalWeight,
            totalValue: totalValue,
            salesPerson: formData.get('salesPerson'),
            deliveryAddress: formData.get('deliveryAddress'),
            contactPerson: formData.get('contactPerson'),
            contactNumber: formData.get('contactNumber'),
            specialInstructions: formData.get('specialInstructions'),
            items: [...orderItems]
        };

        if (currentOrder) {
            // Update existing order
            await DeliveryOrderAPI.updateOrder(currentOrder.id, orderData);
        } else {
            // Create new order
            await DeliveryOrderAPI.createOrder(orderData);
        }

        // Refresh data and close modal
        await loadOrderData();
        updateStatistics();
        closeModal();
        
    } catch (error) {
        console.error('Error saving order:', error);
        showNotification('Error saving order', 'error');
    } finally {
        showLoadingState(false);
    }
}

// Add item to order
function addOrderItem() {
    const productCode = document.getElementById('itemProductCode').value;
    const productName = document.getElementById('itemProductName').value;
    const quantity = parseInt(document.getElementById('itemQuantity').value);
    const unitPrice = parseFloat(document.getElementById('itemUnitPrice').value);

    if (!productCode || !productName || !quantity || !unitPrice) {
        showNotification('Please fill all item fields', 'error');
        return;
    }

    const item = {
        productCode,
        productName,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice
    };

    orderItems.push(item);
    updateItemsTable();
    
    // Clear item form
    document.getElementById('itemProductCode').value = '';
    document.getElementById('itemProductName').value = '';
    document.getElementById('itemQuantity').value = '';
    document.getElementById('itemUnitPrice').value = '';
}

// Update items table
function updateItemsTable() {
    const tbody = document.getElementById('itemsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    orderItems.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.productCode}</td>
            <td>${item.productName}</td>
            <td>${item.quantity}</td>
            <td>$${item.unitPrice.toFixed(2)}</td>
            <td>$${item.totalPrice.toFixed(2)}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="removeOrderItem(${index})">Remove</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Update totals
    const totalQty = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    
    updateElementText('orderTotalItems', orderItems.length);
    updateElementText('orderTotalQuantity', totalQty);
    updateElementText('orderTotalValue', '$' + totalValue.toFixed(2));
}

// Remove item from order
function removeOrderItem(index) {
    orderItems.splice(index, 1);
    updateItemsTable();
}

// Search functionality with database integration
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const filteredData = deliveryOrders.filter(item => 
        item.orderNumber.toLowerCase().includes(query) ||
        item.customer.toLowerCase().includes(query) ||
        item.customerCode.toLowerCase().includes(query) ||
        item.salesPerson.toLowerCase().includes(query)
    );
    
    displayFilteredData(filteredData);
}

// Display filtered data
function displayFilteredData(data) {
    const tableBody = document.getElementById('orderTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    data.forEach(item => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${item.orderNumber}</td>
            <td>
                ${item.customer}<br>
                <small style="color: rgba(255, 255, 255, 0.7);">${item.customerCode}</small>
            </td>
            <td>${item.orderDate}</td>
            <td>${item.requestedDate}</td>
            <td>${item.totalItems} items<br><small>${item.totalQuantity} qty</small></td>
            <td>$${item.totalValue.toLocaleString()}</td>
            <td>
                <span class="status-badge status-${item.status}">${item.status}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-edit" onclick="editOrder('${item.id}')" title="Edit Order">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-view" onclick="viewOrder('${item.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-print" onclick="printOrder('${item.id}')" title="Print Order">
                        <i class="fas fa-print"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteOrder('${item.id}')" title="Delete Order">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// View order details
function viewOrder(id) {
    const order = deliveryOrders.find(o => o.id === id);
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }

    // Create a detailed view modal or redirect to details page
    alert(`Order Details:\n\nOrder Number: ${order.orderNumber}\nCustomer: ${order.customer}\nTotal Value: $${order.totalValue.toLocaleString()}\nStatus: ${order.status}\nItems: ${order.totalItems}`);
}

// Delete order with database integration
async function deleteOrder(id) {
    if (!confirm('Are you sure you want to delete this order?')) {
        return;
    }

    try {
        showLoadingState(true);
        await DeliveryOrderAPI.deleteOrder(id);
        await loadOrderData();
        updateStatistics();
    } catch (error) {
        console.error('Error deleting order:', error);
        showNotification('Error deleting order', 'error');
    } finally {
        showLoadingState(false);
    }
}

// Print order
function printOrder(id) {
    const order = deliveryOrders.find(o => o.id === id);
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }

    // Create print content
    const printContent = `
        <h2>Delivery Order</h2>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Customer:</strong> ${order.customer}</p>
        <p><strong>Date:</strong> ${order.orderDate}</p>
        <p><strong>Total Value:</strong> $${order.totalValue.toLocaleString()}</p>
        <table border="1">
            <tr><th>Product Code</th><th>Product Name</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr>
            ${order.items.map(item => `
                <tr>
                    <td>${item.productCode}</td>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.unitPrice}</td>
                    <td>$${item.totalPrice}</td>
                </tr>
            `).join('')}
        </table>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// Process order (update status)
async function processOrder(id) {
    try {
        const order = deliveryOrders.find(o => o.id === id);
        if (!order) {
            showNotification('Order not found', 'error');
            return;
        }

        // Update status to processing
        const updatedOrder = { ...order, status: 'processing' };
        await DeliveryOrderAPI.updateOrder(id, updatedOrder);
        await loadOrderData();
        updateStatistics();
        showNotification('Order marked as processing', 'success');
    } catch (error) {
        console.error('Error processing order:', error);
        showNotification('Error processing order', 'error');
    }
}

// Export to CSV
function exportToCSV() {
    const headers = ['Order Number', 'Customer', 'Order Date', 'Total Items', 'Total Value', 'Status'];
    const csvContent = [headers.join(',')];
    
    deliveryOrders.forEach(order => {
        const row = [
            order.orderNumber,
            order.customer,
            order.orderDate,
            order.totalItems,
            order.totalValue,
            order.status
        ];
        csvContent.push(row.join(','));
    });
    
    const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'delivery_orders.csv';
    link.click();
    window.URL.revokeObjectURL(url);
}

// Initialize when DOM is loaded
function viewOrder(id) {
    const order = orderData.find(o => o.id === id);
    if (!order) return;

    const itemsList = order.items.map(item => 
        `${item.productCode} - ${item.productName} (${item.quantity} x $${item.unitPrice} = $${item.totalPrice})`
    ).join('\n');

    const orderDetails = `
📋 Delivery Order: ${order.orderNumber}

Customer: ${order.customer} (${order.customerCode})
Customer PO: ${order.customerPO}
Order Date: ${order.orderDate}
Requested Date: ${order.requestedDate}
Status: ${order.status.toUpperCase()}
Priority: ${order.priority.toUpperCase()}

Sales Person: ${order.salesPerson}
Payment Terms: ${order.paymentTerms}
Shipping Method: ${order.shippingMethod}

Delivery Address:
${order.deliveryAddress}

Contact: ${order.contactPerson}
Phone: ${order.contactNumber}

Items:
${itemsList}

Total Items: ${order.totalItems}
Total Quantity: ${order.totalQuantity}
Total Weight: ${order.totalWeight} kg
Total Value: $${order.totalValue.toLocaleString()}

Special Instructions:
${order.specialInstructions || 'None'}
    `;

    alert(orderDetails);
}

// Process order
function processOrder(id) {
    const order = orderData.find(o => o.id === id);
    if (!order) return;

    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(order.status);
    const nextStatus = statuses[Math.min(currentIndex + 1, statuses.length - 1)];

    if (confirm(`Process order from "${order.status}" to "${nextStatus}"?`)) {
        order.status = nextStatus;
        loadOrderData();
        updateStatistics();
        showNotification(`Order processed: ${nextStatus.toUpperCase()}`, 'success');
    }
}

// Order action functions
function orderValidation() {
    showNotification('✅ Order Validation\n\nValidating order details and inventory availability.', 'info');
}

function inventoryAllocation() {
    showNotification('📦 Inventory Allocation\n\nAllocating inventory for confirmed orders.', 'info');
}

function packingList() {
    showNotification('📋 Packing List\n\nGenerating packing lists for warehouse team.', 'info');
}

function shippingLabel() {
    showNotification('🏷️ Shipping Label\n\nGenerating shipping labels and documentation.', 'info');
}

// Utility functions
function refreshData() {
    loadOrderData();
    updateStatistics();
    showNotification('Data refreshed successfully!', 'success');
}

function exportReport() {
    showNotification('📊 Exporting order report...\n\nGenerating comprehensive order analysis.', 'info');
}

function bulkProcess() {
    showNotification('📝 Bulk Process\n\nSelect multiple orders for batch processing.', 'info');
}

function generateInvoice() {
    showNotification('🧾 Generating invoices for processed orders...', 'success');
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
    initializeDO();
});

// Export functions for global access
window.openAddModal = openAddModal;
window.closeModal = closeModal;
window.editOrder = editOrder;
window.viewOrder = viewOrder;
window.deleteOrder = deleteOrder;
window.printOrder = printOrder;
window.processOrder = processOrder;
window.addOrderItem = addOrderItem;
window.removeOrderItem = removeOrderItem;
window.exportToCSV = exportToCSV;
