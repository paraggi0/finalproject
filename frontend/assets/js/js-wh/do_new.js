// DO (Delivery Order) CRUD Management
// This module handles CRUD operations for delivery order management

class DeliveryOrderCRUD {
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
                label: '📋 DO Number',
                type: 'text',
                required: true,
                placeholder: 'e.g., DO-2025-001',
                validation: {
                    pattern: /^DO-\d{4}-\d{3}$/,
                    message: 'DO Number format: DO-YYYY-XXX (e.g., DO-2025-001)'
                }
            },
            {
                name: 'order_date',
                label: '📅 Order Date',
                type: 'date',
                required: true
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
                name: 'customer_po',
                label: '📄 Customer PO',
                type: 'text',
                placeholder: 'Customer Purchase Order Number'
            },
            {
                name: 'requested_delivery_date',
                label: '🚚 Requested Delivery Date',
                type: 'date',
                required: true
            },
            {
                name: 'delivery_address',
                label: '📍 Delivery Address',
                type: 'textarea',
                required: true,
                placeholder: 'Complete delivery address with postal code...'
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
                name: 'sales_person',
                label: '👨‍💼 Sales Person',
                type: 'select',
                required: true,
                options: [
                    { value: 'sales_manager', label: '👨‍💼 Sales Manager' },
                    { value: 'sales_rep_1', label: '👨‍💼 Sales Rep 1' },
                    { value: 'sales_rep_2', label: '👩‍💼 Sales Rep 2' },
                    { value: 'sales_rep_3', label: '👨‍💼 Sales Rep 3' },
                    { value: 'sales_rep_4', label: '👩‍💼 Sales Rep 4' }
                ]
            },
            {
                name: 'payment_terms',
                label: '💳 Payment Terms',
                type: 'select',
                required: true,
                options: [
                    { value: 'net_30', label: '📅 Net 30 Days' },
                    { value: 'net_15', label: '📅 Net 15 Days' },
                    { value: 'net_7', label: '📅 Net 7 Days' },
                    { value: 'cod', label: '💰 Cash on Delivery' },
                    { value: 'advance', label: '⚡ Advance Payment' },
                    { value: 'credit', label: '💳 Credit Terms' }
                ]
            },
            {
                name: 'shipping_method',
                label: '🚛 Shipping Method',
                type: 'select',
                required: true,
                options: [
                    { value: 'standard', label: '🚚 Standard Delivery' },
                    { value: 'express', label: '⚡ Express Delivery' },
                    { value: 'next_day', label: '🚀 Next Day Delivery' },
                    { value: 'same_day', label: '⚡ Same Day Delivery' },
                    { value: 'pickup', label: '🏪 Customer Pickup' }
                ]
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
                name: 'order_status',
                label: '📊 Order Status',
                type: 'select',
                required: true,
                options: [
                    { value: 'draft', label: '📝 Draft' },
                    { value: 'confirmed', label: '✅ Confirmed' },
                    { value: 'processing', label: '⚙️ Processing' },
                    { value: 'picking', label: '📦 Picking' },
                    { value: 'packed', label: '📦 Packed' },
                    { value: 'ready_to_ship', label: '🚚 Ready to Ship' },
                    { value: 'shipped', label: '🚛 Shipped' },
                    { value: 'delivered', label: '✅ Delivered' },
                    { value: 'cancelled', label: '❌ Cancelled' },
                    { value: 'returned', label: '↩️ Returned' }
                ],
                default: 'draft'
            },
            {
                name: 'product_items',
                label: '📦 Product Items',
                type: 'textarea',
                required: true,
                placeholder: 'List products with codes, quantities, and descriptions...\nExample:\nPROD-001: Widget A - Qty: 10 units\nPROD-002: Widget B - Qty: 5 units'
            },
            {
                name: 'total_items',
                label: '📊 Total Items',
                type: 'number',
                required: true,
                min: 1,
                placeholder: 'Total number of different products'
            },
            {
                name: 'total_quantity',
                label: '📊 Total Quantity',
                type: 'number',
                required: true,
                min: 1,
                placeholder: 'Total quantity of all items'
            },
            {
                name: 'unit_price',
                label: '💰 Unit Price',
                type: 'number',
                step: 0.01,
                min: 0,
                placeholder: 'Average unit price'
            },
            {
                name: 'total_value',
                label: '💰 Total Order Value',
                type: 'number',
                required: true,
                step: 0.01,
                min: 0,
                placeholder: 'Total value of the order'
            },
            {
                name: 'currency',
                label: '💱 Currency',
                type: 'select',
                required: true,
                options: [
                    { value: 'IDR', label: '🇮🇩 Indonesian Rupiah (IDR)' },
                    { value: 'USD', label: '🇺🇸 US Dollar (USD)' },
                    { value: 'EUR', label: '🇪🇺 Euro (EUR)' },
                    { value: 'SGD', label: '🇸🇬 Singapore Dollar (SGD)' }
                ],
                default: 'IDR'
            },
            {
                name: 'tax_amount',
                label: '💸 Tax Amount',
                type: 'number',
                step: 0.01,
                min: 0,
                placeholder: 'Tax amount (if applicable)'
            },
            {
                name: 'discount_amount',
                label: '🎯 Discount Amount',
                type: 'number',
                step: 0.01,
                min: 0,
                placeholder: 'Discount amount (if applicable)'
            },
            {
                name: 'special_instructions',
                label: '📝 Special Instructions',
                type: 'textarea',
                placeholder: 'Any special handling, packaging, or delivery instructions...'
            },
            {
                name: 'delivery_notes',
                label: '📋 Delivery Notes',
                type: 'textarea',
                placeholder: 'Additional notes for delivery team...'
            },
            {
                name: 'warehouse_location',
                label: '🏭 Warehouse Location',
                type: 'select',
                options: [
                    { value: 'main_warehouse', label: '🏭 Main Warehouse' },
                    { value: 'warehouse_a', label: '🏭 Warehouse A' },
                    { value: 'warehouse_b', label: '🏭 Warehouse B' },
                    { value: 'warehouse_c', label: '🏭 Warehouse C' },
                    { value: 'external_storage', label: '🏪 External Storage' }
                ]
            },
            {
                name: 'picking_location',
                label: '📦 Picking Location',
                type: 'text',
                placeholder: 'Specific picking location or bay'
            },
            {
                name: 'estimated_weight',
                label: '⚖️ Estimated Weight (kg)',
                type: 'number',
                step: 0.1,
                min: 0,
                placeholder: 'Total estimated weight'
            },
            {
                name: 'estimated_volume',
                label: '📏 Estimated Volume (m³)',
                type: 'number',
                step: 0.01,
                min: 0,
                placeholder: 'Total estimated volume'
            },
            {
                name: 'created_date',
                label: '📅 Created Date',
                type: 'datetime-local'
            },
            {
                name: 'updated_date',
                label: '📅 Updated Date',
                type: 'datetime-local'
            },
            {
                name: 'approved_by',
                label: '✅ Approved By',
                type: 'text',
                placeholder: 'Name of person who approved the order'
            },
            {
                name: 'approval_date',
                label: '✅ Approval Date',
                type: 'datetime-local'
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
                key: 'order_date', 
                label: 'Order Date',
                render: (value, row) => value ? new Date(value).toLocaleDateString() : 'N/A'
            },
            { 
                key: 'requested_delivery_date', 
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
                key: 'order_status', 
                label: 'Status',
                render: (value, row) => {
                    const statusMap = {
                        'draft': '<span class="status-badge status-pending">📝 Draft</span>',
                        'confirmed': '<span class="status-badge status-approved">✅ Confirmed</span>',
                        'processing': '<span class="status-badge status-warning">⚙️ Processing</span>',
                        'picking': '<span class="status-badge status-info">📦 Picking</span>',
                        'packed': '<span class="status-badge status-info">📦 Packed</span>',
                        'ready_to_ship': '<span class="status-badge status-active">🚚 Ready</span>',
                        'shipped': '<span class="status-badge status-active">🚛 Shipped</span>',
                        'delivered': '<span class="status-badge status-approved">✅ Delivered</span>',
                        'cancelled': '<span class="status-badge status-cancelled">❌ Cancelled</span>',
                        'returned': '<span class="status-badge status-rejected">↩️ Returned</span>'
                    };
                    return statusMap[value] || '<span class="status-badge">❓ Unknown</span>';
                }
            },
            { 
                key: 'total_items', 
                label: 'Items',
                render: (value, row) => `<span class="items-tag">📦 ${value || 0} items</span>`
            },
            { 
                key: 'total_quantity', 
                label: 'Quantity',
                render: (value, row) => `<span class="quantity-tag">📊 ${value || 0} units</span>`
            },
            { 
                key: 'total_value', 
                label: 'Value',
                render: (value, row) => {
                    const currency = row.currency || 'IDR';
                    const amount = parseFloat(value || 0);
                    return `<span class="value-tag">💰 ${currency} ${amount.toLocaleString()}</span>`;
                }
            },
            { 
                key: 'sales_person', 
                label: 'Sales',
                render: (value, row) => {
                    const salesMap = {
                        'sales_manager': '👨‍💼 Manager',
                        'sales_rep_1': '👨‍💼 Rep 1',
                        'sales_rep_2': '👩‍💼 Rep 2',
                        'sales_rep_3': '👨‍💼 Rep 3',
                        'sales_rep_4': '👩‍💼 Rep 4'
                    };
                    return `<span class="sales-tag">${salesMap[value] || '👤 ' + (value || 'N/A')}</span>`;
                }
            }
        ]);

        // Add custom form validation
        this.crudManager.addFormValidation((formData) => {
            const errors = [];

            // Validate order date
            if (formData.order_date) {
                const orderDate = new Date(formData.order_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (orderDate > today) {
                    errors.push('Order date cannot be in the future');
                }
            }

            // Validate delivery date
            if (formData.requested_delivery_date && formData.order_date) {
                const deliveryDate = new Date(formData.requested_delivery_date);
                const orderDate = new Date(formData.order_date);
                if (deliveryDate <= orderDate) {
                    errors.push('Delivery date must be after order date');
                }
            }

            // Validate total calculations
            if (formData.total_quantity && formData.total_items) {
                const totalQty = parseInt(formData.total_quantity);
                const totalItems = parseInt(formData.total_items);
                if (totalQty < totalItems) {
                    errors.push('Total quantity cannot be less than total items');
                }
            }

            // Validate total value calculation
            if (formData.total_value && formData.unit_price && formData.total_quantity) {
                const totalValue = parseFloat(formData.total_value);
                const unitPrice = parseFloat(formData.unit_price);
                const totalQuantity = parseInt(formData.total_quantity);
                const calculatedValue = unitPrice * totalQuantity;
                
                if (Math.abs(totalValue - calculatedValue) > 0.01) {
                    // Allow some tolerance for rounding
                    if (Math.abs(totalValue - calculatedValue) > calculatedValue * 0.1) {
                        errors.push('Total value does not match unit price × quantity calculation');
                    }
                }
            }

            // Validate phone number format
            if (formData.contact_phone && !/^\+62\s?\d{3}\s?\d{4}\s?\d{4}$/.test(formData.contact_phone)) {
                errors.push('Contact phone format should be: +62 XXX XXXX XXXX');
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

            // Set order date to today if not provided
            if (!data.order_date && action === 'create') {
                data.order_date = new Date().toISOString().split('T')[0];
            }

            // Set delivery date to tomorrow if not provided
            if (!data.requested_delivery_date && action === 'create') {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                data.requested_delivery_date = tomorrow.toISOString().split('T')[0];
            }

            // Calculate total value if not provided
            if (!data.total_value && data.unit_price && data.total_quantity) {
                data.total_value = parseFloat(data.unit_price) * parseInt(data.total_quantity);
            }

            // Set created/updated timestamps
            const now = new Date().toISOString().slice(0, 16);
            if (action === 'create') {
                data.created_date = now;
            }
            data.updated_date = now;

            // Set default currency if not provided
            if (!data.currency) {
                data.currency = 'IDR';
            }

            return data;
        });

        // Add custom search functionality
        this.crudManager.addCustomSearch((data, searchTerm) => {
            const term = searchTerm.toLowerCase();
            return data.filter(item => 
                (item.do_number && item.do_number.toLowerCase().includes(term)) ||
                (item.customer_name && item.customer_name.toLowerCase().includes(term)) ||
                (item.customer_code && item.customer_code.toLowerCase().includes(term)) ||
                (item.customer_po && item.customer_po.toLowerCase().includes(term)) ||
                (item.order_status && item.order_status.toLowerCase().includes(term)) ||
                (item.sales_person && item.sales_person.toLowerCase().includes(term)) ||
                (item.product_items && item.product_items.toLowerCase().includes(term))
            );
        });

        // Initialize the CRUD interface
        this.crudManager.render();

        // Set up additional event listeners
        this.setupAdditionalFeatures();
    }

    setupAdditionalFeatures() {
        // Add order performance metrics
        this.crudManager.addDataPostProcessor((data) => {
            return data.map(item => {
                // Calculate order age
                if (item.order_date) {
                    const orderDate = new Date(item.order_date);
                    const now = new Date();
                    const ageInDays = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
                    item._orderAge = ageInDays + ' days';
                }

                // Calculate delivery time remaining
                if (item.requested_delivery_date) {
                    const deliveryDate = new Date(item.requested_delivery_date);
                    const now = new Date();
                    const daysUntilDelivery = Math.ceil((deliveryDate - now) / (1000 * 60 * 60 * 24));
                    
                    if (daysUntilDelivery < 0) {
                        item._deliveryStatus = 'overdue';
                    } else if (daysUntilDelivery <= 1) {
                        item._deliveryStatus = 'urgent';
                    } else if (daysUntilDelivery <= 3) {
                        item._deliveryStatus = 'soon';
                    } else {
                        item._deliveryStatus = 'normal';
                    }
                    
                    item._daysUntilDelivery = daysUntilDelivery;
                }

                // Calculate value per item
                if (item.total_value && item.total_items) {
                    const valuePerItem = parseFloat(item.total_value) / parseInt(item.total_items);
                    item._valuePerItem = valuePerItem.toFixed(2);
                }

                // Set order complexity
                if (item.total_items) {
                    const totalItems = parseInt(item.total_items);
                    if (totalItems >= 10) {
                        item._complexity = 'high';
                    } else if (totalItems >= 5) {
                        item._complexity = 'medium';
                    } else {
                        item._complexity = 'low';
                    }
                }

                return item;
            });
        });

        // Add export functionality with custom formatting
        this.crudManager.addExportFormatter((data) => {
            return data.map(item => ({
                'DO Number': item.do_number,
                'Order Date': item.order_date,
                'Customer': item.customer_name,
                'Customer Code': item.customer_code,
                'Customer PO': item.customer_po,
                'Delivery Date': item.requested_delivery_date,
                'Priority': item.priority_level,
                'Status': item.order_status,
                'Sales Person': item.sales_person,
                'Payment Terms': item.payment_terms,
                'Shipping Method': item.shipping_method,
                'Contact Person': item.contact_person,
                'Contact Phone': item.contact_phone,
                'Contact Email': item.contact_email,
                'Delivery Address': item.delivery_address,
                'Product Items': item.product_items,
                'Total Items': item.total_items,
                'Total Quantity': item.total_quantity,
                'Unit Price': item.unit_price,
                'Total Value': item.total_value,
                'Currency': item.currency,
                'Tax Amount': item.tax_amount,
                'Discount Amount': item.discount_amount,
                'Warehouse Location': item.warehouse_location,
                'Picking Location': item.picking_location,
                'Estimated Weight': item.estimated_weight + ' kg',
                'Estimated Volume': item.estimated_volume + ' m³',
                'Order Age': item._orderAge,
                'Days Until Delivery': item._daysUntilDelivery,
                'Value Per Item': item._valuePerItem,
                'Complexity': item._complexity,
                'Special Instructions': item.special_instructions,
                'Delivery Notes': item.delivery_notes,
                'Created Date': item.created_date,
                'Updated Date': item.updated_date,
                'Approved By': item.approved_by,
                'Approval Date': item.approval_date
            }));
        });

        console.log('✅ Delivery Order CRUD system initialized successfully');
    }
}

// Initialize the Delivery Order CRUD system
let deliveryOrderCRUD;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        deliveryOrderCRUD = new DeliveryOrderCRUD();
    });
} else {
    deliveryOrderCRUD = new DeliveryOrderCRUD();
}

// Export for global access
window.deliveryOrderCRUD = deliveryOrderCRUD;
