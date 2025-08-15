// DC (Delivery Control) CRUD Management
// This module handles CRUD operations for delivery control and logistics management

class DeliveryControlCRUD {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3001/api/website';
        this.apiKey = 'website-admin-2025';
        this.currentData = [];
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupCRUD());
        } else {
            this.setupCRUD();
        }
    }

    setupCRUD() {
        // Initialize CRUD manager
        this.crudManager = new CRUDManager({
            apiBaseUrl: `${this.apiBaseUrl}/warehouse`,
            apiKey: this.apiKey,
            entityName: 'Delivery Order',
            entityNamePlural: 'Delivery Orders',
            containerId: 'crudContainer'
        });

        // Configure form fields
        this.crudManager.setFormFields([
            {
                name: 'do_number',
                label: '🚚 DO Number',
                type: 'text',
                required: true,
                placeholder: 'e.g., DO-2025-001',
                validation: {
                    pattern: /^DO-\d{4}-\d{3}$/,
                    message: 'DO Number format: DO-YYYY-XXX (e.g., DO-2025-001)'
                }
            },
            {
                name: 'customer_name',
                label: '🏢 Customer Name',
                type: 'text',
                required: true,
                placeholder: 'e.g., ABC Manufacturing'
            },
            {
                name: 'customer_code',
                label: '🔢 Customer Code',
                type: 'text',
                required: true,
                placeholder: 'e.g., CUST-001',
                validation: {
                    pattern: /^CUST-\d{3}$/,
                    message: 'Customer code format: CUST-XXX (e.g., CUST-001)'
                }
            },
            {
                name: 'delivery_date',
                label: '📅 Delivery Date',
                type: 'date',
                required: true
            },
            {
                name: 'requested_delivery_time',
                label: '⏰ Requested Time',
                type: 'time',
                placeholder: '09:00'
            },
            {
                name: 'priority_level',
                label: '🚨 Priority Level',
                type: 'select',
                required: true,
                options: [
                    { value: 'urgent', label: '🚨 Urgent' },
                    { value: 'high', label: '⚠️ High' },
                    { value: 'normal', label: '📋 Normal' },
                    { value: 'low', label: '⬇️ Low' }
                ],
                default: 'normal'
            },
            {
                name: 'delivery_status',
                label: '📊 Delivery Status',
                type: 'select',
                required: true,
                options: [
                    { value: 'pending', label: '⏳ Pending' },
                    { value: 'processing', label: '⚙️ Processing' },
                    { value: 'picked', label: '📦 Picked' },
                    { value: 'loaded', label: '🚛 Loaded' },
                    { value: 'in_transit', label: '🚚 In Transit' },
                    { value: 'delivered', label: '✅ Delivered' },
                    { value: 'failed', label: '❌ Failed' },
                    { value: 'cancelled', label: '🚫 Cancelled' }
                ],
                default: 'pending'
            },
            {
                name: 'driver_name',
                label: '👤 Driver Name',
                type: 'text',
                required: true,
                placeholder: 'e.g., John Driver'
            },
            {
                name: 'driver_id',
                label: '🆔 Driver ID',
                type: 'text',
                required: true,
                placeholder: 'e.g., DRV-001',
                validation: {
                    pattern: /^DRV-\d{3}$/,
                    message: 'Driver ID format: DRV-XXX (e.g., DRV-001)'
                }
            },
            {
                name: 'driver_phone',
                label: '📱 Driver Phone',
                type: 'tel',
                placeholder: '+62 812 3456 7890'
            },
            {
                name: 'vehicle_type',
                label: '🚛 Vehicle Type',
                type: 'select',
                required: true,
                options: [
                    { value: 'truck_small', label: '🚐 Small Truck (1-3 tons)' },
                    { value: 'truck_medium', label: '🚚 Medium Truck (3-8 tons)' },
                    { value: 'truck_large', label: '🚛 Large Truck (8+ tons)' },
                    { value: 'van', label: '🚐 Van' },
                    { value: 'container', label: '📦 Container Truck' }
                ]
            },
            {
                name: 'vehicle_number',
                label: '🚗 Vehicle Number',
                type: 'text',
                required: true,
                placeholder: 'e.g., B1234XYZ'
            },
            {
                name: 'delivery_address',
                label: '📍 Delivery Address',
                type: 'textarea',
                required: true,
                placeholder: 'Complete delivery address including postal code...'
            },
            {
                name: 'delivery_zone',
                label: '🗺️ Delivery Zone',
                type: 'select',
                required: true,
                options: [
                    { value: 'zone_north', label: '🧭 Zone North' },
                    { value: 'zone_south', label: '🧭 Zone South' },
                    { value: 'zone_east', label: '🧭 Zone East' },
                    { value: 'zone_west', label: '🧭 Zone West' },
                    { value: 'zone_central', label: '🧭 Zone Central' },
                    { value: 'zone_suburban', label: '🧭 Zone Suburban' }
                ]
            },
            {
                name: 'contact_person',
                label: '👤 Contact Person',
                type: 'text',
                required: true,
                placeholder: 'Customer contact person name'
            },
            {
                name: 'contact_phone',
                label: '📞 Contact Phone',
                type: 'tel',
                required: true,
                placeholder: '+62 812 3456 7890'
            },
            {
                name: 'contact_email',
                label: '📧 Contact Email',
                type: 'email',
                placeholder: 'customer@example.com'
            },
            {
                name: 'product_items',
                label: '📦 Product Items',
                type: 'textarea',
                required: true,
                placeholder: 'List of products to be delivered (item codes, quantities, descriptions)...'
            },
            {
                name: 'total_quantity',
                label: '📊 Total Quantity',
                type: 'number',
                required: true,
                placeholder: '100',
                min: 1
            },
            {
                name: 'total_weight',
                label: '⚖️ Total Weight (kg)',
                type: 'number',
                required: true,
                placeholder: '500',
                step: 0.1,
                min: 0
            },
            {
                name: 'total_volume',
                label: '📏 Total Volume (m³)',
                type: 'number',
                placeholder: '2.5',
                step: 0.01,
                min: 0
            },
            {
                name: 'estimated_distance',
                label: '🛣️ Estimated Distance (km)',
                type: 'number',
                placeholder: '25',
                min: 0
            },
            {
                name: 'estimated_duration',
                label: '⏱️ Estimated Duration',
                type: 'text',
                placeholder: 'e.g., 2 hours 30 minutes'
            },
            {
                name: 'special_instructions',
                label: '📝 Special Instructions',
                type: 'textarea',
                placeholder: 'Any special delivery instructions, handling requirements...'
            },
            {
                name: 'loading_dock',
                label: '🏭 Loading Dock',
                type: 'select',
                options: [
                    { value: 'dock_a', label: 'Dock A - Main Loading' },
                    { value: 'dock_b', label: 'Dock B - Heavy Items' },
                    { value: 'dock_c', label: 'Dock C - Express' },
                    { value: 'dock_d', label: 'Dock D - Special Handling' }
                ]
            },
            {
                name: 'dispatch_time',
                label: '🚀 Dispatch Time',
                type: 'datetime-local'
            },
            {
                name: 'estimated_arrival',
                label: '📅 Estimated Arrival',
                type: 'datetime-local'
            },
            {
                name: 'actual_departure',
                label: '🏁 Actual Departure',
                type: 'datetime-local'
            },
            {
                name: 'actual_arrival',
                label: '🎯 Actual Arrival',
                type: 'datetime-local'
            },
            {
                name: 'delivery_notes',
                label: '📋 Delivery Notes',
                type: 'textarea',
                placeholder: 'Notes about the delivery process, customer feedback...'
            },
            {
                name: 'proof_of_delivery',
                label: '📸 Proof of Delivery',
                type: 'text',
                placeholder: 'Upload receipt, signature, or photo confirmation'
            }
        ]);

        // Configure table columns
        this.crudManager.setTableColumns([
            { 
                key: 'do_number', 
                label: 'DO Number',
                render: (value, row) => `<span class="font-mono font-bold">${value || 'N/A'}</span>`
            },
            { 
                key: 'customer_name', 
                label: 'Customer',
                render: (value, row) => `<div class="font-medium">${value || 'N/A'}</div>`
            },
            { 
                key: 'delivery_date', 
                label: 'Delivery Date',
                render: (value, row) => value ? new Date(value).toLocaleDateString() : 'N/A'
            },
            { 
                key: 'priority_level', 
                label: 'Priority',
                render: (value, row) => {
                    const priorityMap = {
                        'urgent': '<span class="priority-badge priority-urgent">🚨 URGENT</span>',
                        'high': '<span class="priority-badge priority-high">⚠️ HIGH</span>',
                        'normal': '<span class="priority-badge priority-normal">📋 NORMAL</span>',
                        'low': '<span class="priority-badge priority-low">⬇️ LOW</span>'
                    };
                    return priorityMap[value] || '<span class="priority-badge">❓ Unknown</span>';
                }
            },
            { 
                key: 'delivery_status', 
                label: 'Status',
                render: (value, row) => {
                    const statusMap = {
                        'pending': '<span class="status-badge status-pending">⏳ Pending</span>',
                        'processing': '<span class="status-badge status-warning">⚙️ Processing</span>',
                        'picked': '<span class="status-badge status-info">📦 Picked</span>',
                        'loaded': '<span class="status-badge status-info">🚛 Loaded</span>',
                        'in_transit': '<span class="status-badge status-active">🚚 In Transit</span>',
                        'delivered': '<span class="status-badge status-approved">✅ Delivered</span>',
                        'failed': '<span class="status-badge status-rejected">❌ Failed</span>',
                        'cancelled': '<span class="status-badge status-cancelled">🚫 Cancelled</span>'
                    };
                    return statusMap[value] || '<span class="status-badge">❓ Unknown</span>';
                }
            },
            { 
                key: 'driver_name', 
                label: 'Driver',
                render: (value, row) => `<div class="driver-tag">👤 ${value || 'N/A'}</div>`
            },
            { 
                key: 'vehicle_number', 
                label: 'Vehicle',
                render: (value, row) => `<span class="vehicle-tag">🚛 ${value || 'N/A'}</span>`
            },
            { 
                key: 'delivery_zone', 
                label: 'Zone',
                render: (value, row) => {
                    const zoneMap = {
                        'zone_north': '🧭 North',
                        'zone_south': '🧭 South',
                        'zone_east': '🧭 East',
                        'zone_west': '🧭 West',
                        'zone_central': '🧭 Central',
                        'zone_suburban': '🧭 Suburban'
                    };
                    return `<span class="zone-tag">${zoneMap[value] || '🧭 Unknown'}</span>`;
                }
            },
            { 
                key: 'total_weight', 
                label: 'Weight',
                render: (value, row) => `<span class="weight-tag">⚖️ ${parseFloat(value || 0).toFixed(1)} kg</span>`
            }
        ]);

        // Add custom form validation
        this.crudManager.addFormValidation((formData) => {
            const errors = [];

            // Validate delivery date (cannot be in the past)
            if (formData.delivery_date) {
                const deliveryDate = new Date(formData.delivery_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (deliveryDate < today) {
                    errors.push('Delivery date cannot be in the past');
                }
            }

            // Validate weight vs vehicle capacity
            if (formData.total_weight && formData.vehicle_type) {
                const weight = parseFloat(formData.total_weight);
                const vehicleCapacity = {
                    'truck_small': 3000,
                    'truck_medium': 8000,
                    'truck_large': 20000,
                    'van': 1000,
                    'container': 30000
                };
                
                const maxCapacity = vehicleCapacity[formData.vehicle_type];
                if (weight > maxCapacity) {
                    errors.push(`Total weight (${weight}kg) exceeds vehicle capacity (${maxCapacity}kg)`);
                }
            }

            // Validate phone number format
            if (formData.contact_phone && !/^\+62\s?\d{3}\s?\d{4}\s?\d{4}$/.test(formData.contact_phone)) {
                errors.push('Contact phone format should be: +62 XXX XXXX XXXX');
            }

            // Validate delivery time logic
            if (formData.actual_departure && formData.actual_arrival) {
                const departure = new Date(formData.actual_departure);
                const arrival = new Date(formData.actual_arrival);
                if (arrival <= departure) {
                    errors.push('Actual arrival time must be after departure time');
                }
            }

            return errors;
        });

        // Add custom data preprocessing before create/update
        this.crudManager.addDataPreprocessor((data, action) => {
            // Auto-generate DO number if not provided
            if (!data.do_number && action === 'create') {
                const year = new Date().getFullYear();
                const randomNum = Math.floor(Math.random() * 999) + 1;
                data.do_number = `DO-${year}-${randomNum.toString().padStart(3, '0')}`;
            }

            // Auto-generate customer code if not provided
            if (!data.customer_code && action === 'create') {
                const randomNum = Math.floor(Math.random() * 999) + 1;
                data.customer_code = `CUST-${randomNum.toString().padStart(3, '0')}`;
            }

            // Set delivery date to tomorrow if not provided
            if (!data.delivery_date && action === 'create') {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                data.delivery_date = tomorrow.toISOString().split('T')[0];
            }

            // Calculate estimated arrival based on dispatch time and duration
            if (data.dispatch_time && data.estimated_duration && !data.estimated_arrival) {
                const dispatch = new Date(data.dispatch_time);
                const durationHours = parseFloat(data.estimated_duration.split(' ')[0]) || 2;
                const arrival = new Date(dispatch.getTime() + (durationHours * 60 * 60 * 1000));
                data.estimated_arrival = arrival.toISOString().slice(0, 16);
            }

            // Set status progression based on current status
            if (action === 'update' && data.delivery_status) {
                const now = new Date().toISOString().slice(0, 16);
                
                if (data.delivery_status === 'in_transit' && !data.actual_departure) {
                    data.actual_departure = now;
                }
                
                if (data.delivery_status === 'delivered' && !data.actual_arrival) {
                    data.actual_arrival = now;
                }
            }

            return data;
        });

        // Add custom search functionality
        this.crudManager.addCustomSearch((data, searchTerm) => {
            const term = searchTerm.toLowerCase();
            return data.filter(item => 
                (item.do_number && item.do_number.toLowerCase().includes(term)) ||
                (item.customer_name && item.customer_name.toLowerCase().includes(term)) ||
                (item.driver_name && item.driver_name.toLowerCase().includes(term)) ||
                (item.vehicle_number && item.vehicle_number.toLowerCase().includes(term)) ||
                (item.delivery_zone && item.delivery_zone.toLowerCase().includes(term)) ||
                (item.delivery_status && item.delivery_status.toLowerCase().includes(term))
            );
        });

        // Initialize the CRUD interface
        this.crudManager.render();

        // Set up additional event listeners
        this.setupAdditionalFeatures();
    }

    setupAdditionalFeatures() {
        // Add delivery performance metrics
        this.crudManager.addDataPostProcessor((data) => {
            return data.map(item => {
                // Calculate delivery performance
                if (item.estimated_arrival && item.actual_arrival) {
                    const estimated = new Date(item.estimated_arrival);
                    const actual = new Date(item.actual_arrival);
                    const diffMinutes = (actual - estimated) / (1000 * 60);
                    
                    if (diffMinutes <= 0) {
                        item._performanceStatus = 'early';
                    } else if (diffMinutes <= 30) {
                        item._performanceStatus = 'on_time';
                    } else {
                        item._performanceStatus = 'late';
                    }
                }

                // Calculate distance-based efficiency
                if (item.estimated_distance && item.total_weight) {
                    const efficiency = (parseFloat(item.total_weight) / parseFloat(item.estimated_distance)).toFixed(2);
                    item._efficiency = efficiency + ' kg/km';
                }

                // Set urgency indicator
                if (item.priority_level === 'urgent' || item.delivery_status === 'failed') {
                    item._urgency = 'high';
                } else if (item.priority_level === 'high' || item.delivery_status === 'in_transit') {
                    item._urgency = 'medium';
                } else {
                    item._urgency = 'low';
                }

                return item;
            });
        });

        // Add export functionality with custom formatting
        this.crudManager.addExportFormatter((data) => {
            return data.map(item => ({
                'DO Number': item.do_number,
                'Customer': item.customer_name,
                'Customer Code': item.customer_code,
                'Delivery Date': item.delivery_date,
                'Delivery Time': item.requested_delivery_time,
                'Priority': item.priority_level,
                'Status': item.delivery_status,
                'Driver': item.driver_name,
                'Driver ID': item.driver_id,
                'Driver Phone': item.driver_phone,
                'Vehicle Type': item.vehicle_type,
                'Vehicle Number': item.vehicle_number,
                'Delivery Address': item.delivery_address,
                'Delivery Zone': item.delivery_zone,
                'Contact Person': item.contact_person,
                'Contact Phone': item.contact_phone,
                'Contact Email': item.contact_email,
                'Product Items': item.product_items,
                'Total Quantity': item.total_quantity,
                'Total Weight': item.total_weight + ' kg',
                'Total Volume': item.total_volume + ' m³',
                'Distance': item.estimated_distance + ' km',
                'Duration': item.estimated_duration,
                'Loading Dock': item.loading_dock,
                'Dispatch Time': item.dispatch_time,
                'Estimated Arrival': item.estimated_arrival,
                'Actual Departure': item.actual_departure,
                'Actual Arrival': item.actual_arrival,
                'Performance': item._performanceStatus,
                'Efficiency': item._efficiency,
                'Special Instructions': item.special_instructions,
                'Delivery Notes': item.delivery_notes,
                'Proof of Delivery': item.proof_of_delivery
            }));
        });

        console.log('✅ Delivery Control CRUD system initialized successfully');
    }
}

// Initialize the Delivery Control CRUD system
let deliveryControlCRUD;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        deliveryControlCRUD = new DeliveryControlCRUD();
    });
} else {
    deliveryControlCRUD = new DeliveryControlCRUD();
}

// Export for global access
window.deliveryControlCRUD = deliveryControlCRUD;
