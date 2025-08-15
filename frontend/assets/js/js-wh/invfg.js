// Finished Goods Inventory CRUD Management
// This module handles CRUD operations for finished goods inventory management

class FinishedGoodsCRUD {
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
            apiBaseUrl: `${this.apiBaseUrl}/stock`,
            apiKey: this.apiKey,
            entityName: 'Finished Goods',
            entityNamePlural: 'Finished Goods',
            containerId: 'crudContainer'
        });

        // Configure form fields
        this.crudManager.setFormFields([
            {
                name: 'product_code',
                label: '📦 Product Code',
                type: 'text',
                required: true,
                placeholder: 'e.g., FG-TLE-2024-001',
                validation: {
                    pattern: /^FG-[A-Z0-9-]+$/,
                    message: 'Product code must start with FG- followed by alphanumeric characters and dashes'
                }
            },
            {
                name: 'product_name',
                label: '📋 Product Name',
                type: 'text',
                required: true,
                placeholder: 'e.g., Elite Series A1 Finished Product'
            },
            {
                name: 'category',
                label: '🏷️ Product Category',
                type: 'select',
                required: true,
                options: [
                    { value: 'elite_series', label: 'Elite Series' },
                    { value: 'standard_series', label: 'Standard Series' },
                    { value: 'premium_series', label: 'Premium Series' },
                    { value: 'economy_series', label: 'Economy Series' },
                    { value: 'custom_series', label: 'Custom Series' }
                ]
            },
            {
                name: 'current_stock',
                label: '📊 Current Stock',
                type: 'number',
                required: true,
                placeholder: '100',
                min: 0
            },
            {
                name: 'unit_of_measure',
                label: '📏 Unit of Measure',
                type: 'select',
                required: true,
                options: [
                    { value: 'pcs', label: 'Pieces' },
                    { value: 'box', label: 'Box' },
                    { value: 'carton', label: 'Carton' },
                    { value: 'pallet', label: 'Pallet' },
                    { value: 'kg', label: 'Kilogram' },
                    { value: 'meter', label: 'Meter' }
                ]
            },
            {
                name: 'min_stock_level',
                label: '📉 Minimum Stock Level',
                type: 'number',
                required: true,
                placeholder: '50',
                min: 0
            },
            {
                name: 'max_stock_level',
                label: '📈 Maximum Stock Level',
                type: 'number',
                required: true,
                placeholder: '500',
                min: 0
            },
            {
                name: 'warehouse_location',
                label: '📍 Warehouse Location',
                type: 'select',
                required: true,
                options: [
                    { value: 'Zone A', label: 'Zone A - Main Storage' },
                    { value: 'Zone B', label: 'Zone B - High Value' },
                    { value: 'Zone C', label: 'Zone C - Bulk Items' },
                    { value: 'Zone D', label: 'Zone D - Dispatch' },
                    { value: 'Zone E', label: 'Zone E - Cold Storage' }
                ]
            },
            {
                name: 'bin_location',
                label: '🎯 Bin Location',
                type: 'text',
                placeholder: 'e.g., A-01-03-05',
                validation: {
                    pattern: /^[A-Z]-\d{2}-\d{2}-\d{2}$/,
                    message: 'Bin location format: Zone-Row-Rack-Shelf (e.g., A-01-03-05)'
                }
            },
            {
                name: 'unit_price',
                label: '💰 Unit Price (USD)',
                type: 'number',
                required: true,
                placeholder: '125.00',
                step: 0.01,
                min: 0
            },
            {
                name: 'batch_number',
                label: '🔢 Batch Number',
                type: 'text',
                placeholder: 'e.g., BATCH-FG-2024-001'
            },
            {
                name: 'manufacturing_date',
                label: '🏭 Manufacturing Date',
                type: 'date'
            },
            {
                name: 'expiry_date',
                label: '📅 Expiry Date',
                type: 'date'
            },
            {
                name: 'shelf_life_days',
                label: '⏰ Shelf Life (Days)',
                type: 'number',
                placeholder: '365',
                min: 1
            },
            {
                name: 'storage_temperature',
                label: '🌡️ Storage Temperature',
                type: 'select',
                options: [
                    { value: 'ambient', label: 'Ambient (20-25°C)' },
                    { value: 'cool', label: 'Cool (15-20°C)' },
                    { value: 'cold', label: 'Cold (2-8°C)' },
                    { value: 'frozen', label: 'Frozen (-18°C)' },
                    { value: 'controlled', label: 'Temperature Controlled' }
                ]
            },
            {
                name: 'quality_status',
                label: '✅ Quality Status',
                type: 'select',
                required: true,
                options: [
                    { value: 'approved', label: 'Approved' },
                    { value: 'pending_qc', label: 'Pending QC' },
                    { value: 'quarantine', label: 'Quarantine' },
                    { value: 'rejected', label: 'Rejected' }
                ],
                default: 'approved'
            },
            {
                name: 'last_count_date',
                label: '🔍 Last Count Date',
                type: 'date'
            },
            {
                name: 'description',
                label: '📝 Product Description',
                type: 'textarea',
                placeholder: 'Product description, specifications, and notes...'
            }
        ]);

        // Configure table columns
        this.crudManager.setTableColumns([
            { 
                key: 'product_code', 
                label: 'Product Code',
                render: (value, row) => `<span class="font-mono text-sm">${value || 'N/A'}</span>`
            },
            { 
                key: 'product_name', 
                label: 'Product Name',
                render: (value, row) => `<div class="font-medium">${value || 'N/A'}</div>`
            },
            { 
                key: 'category', 
                label: 'Category',
                render: (value, row) => {
                    const categoryMap = {
                        'elite_series': '🏆 Elite',
                        'standard_series': '📋 Standard',
                        'premium_series': '💎 Premium',
                        'economy_series': '💰 Economy',
                        'custom_series': '🎨 Custom'
                    };
                    return categoryMap[value] || '❓ Unknown';
                }
            },
            { 
                key: 'current_stock', 
                label: 'Current Stock',
                render: (value, row) => {
                    const stock = parseInt(value) || 0;
                    const minStock = parseInt(row.min_stock_level) || 0;
                    let className = 'stock-badge ';
                    
                    if (stock <= minStock * 0.5) {
                        className += 'stock-critical';
                    } else if (stock <= minStock) {
                        className += 'stock-low';
                    } else {
                        className += 'stock-optimal';
                    }
                    
                    return `<span class="${className}">${stock} ${row.unit_of_measure || 'pcs'}</span>`;
                }
            },
            { 
                key: 'warehouse_location', 
                label: 'Location',
                render: (value, row) => `<span class="location-tag">📍 ${value || 'N/A'}</span>`
            },
            { 
                key: 'unit_price', 
                label: 'Unit Price',
                render: (value, row) => `<span class="price-tag">$${parseFloat(value || 0).toFixed(2)}</span>`
            },
            { 
                key: 'quality_status', 
                label: 'Quality Status',
                render: (value, row) => {
                    const statusMap = {
                        'approved': '<span class="status-badge status-approved">✅ Approved</span>',
                        'pending_qc': '<span class="status-badge status-pending">⏳ Pending QC</span>',
                        'quarantine': '<span class="status-badge status-warning">⚠️ Quarantine</span>',
                        'rejected': '<span class="status-badge status-rejected">❌ Rejected</span>'
                    };
                    return statusMap[value] || '<span class="status-badge">❓ Unknown</span>';
                }
            },
            { 
                key: 'total_value', 
                label: 'Total Value',
                render: (value, row) => {
                    const total = (parseFloat(row.current_stock) || 0) * (parseFloat(row.unit_price) || 0);
                    return `<span class="value-tag">$${total.toFixed(2)}</span>`;
                }
            }
        ]);

        // Add custom form validation
        this.crudManager.addFormValidation((formData) => {
            const errors = [];

            // Validate stock levels
            if (parseInt(formData.min_stock_level) >= parseInt(formData.max_stock_level)) {
                errors.push('Maximum stock level must be greater than minimum stock level');
            }

            // Validate current stock
            if (parseInt(formData.current_stock) > parseInt(formData.max_stock_level)) {
                errors.push('Current stock cannot exceed maximum stock level');
            }

            // Validate dates
            if (formData.manufacturing_date && formData.expiry_date) {
                const mfgDate = new Date(formData.manufacturing_date);
                const expDate = new Date(formData.expiry_date);
                if (expDate <= mfgDate) {
                    errors.push('Expiry date must be after manufacturing date');
                }
            }

            // Validate batch number format if provided
            if (formData.batch_number && !/^BATCH-FG-\d{4}-\d{3}$/.test(formData.batch_number)) {
                errors.push('Batch number format should be: BATCH-FG-YYYY-XXX (e.g., BATCH-FG-2024-001)');
            }

            return errors;
        });

        // Add custom data preprocessing before create/update
        this.crudManager.addDataPreprocessor((data, action) => {
            // Auto-generate batch number if not provided
            if (!data.batch_number && action === 'create') {
                const year = new Date().getFullYear();
                const randomNum = Math.floor(Math.random() * 999) + 1;
                data.batch_number = `BATCH-FG-${year}-${randomNum.toString().padStart(3, '0')}`;
            }

            // Auto-generate product code if not provided
            if (!data.product_code && action === 'create') {
                const year = new Date().getFullYear();
                const randomNum = Math.floor(Math.random() * 9999) + 1;
                data.product_code = `FG-TLE-${year}-${randomNum.toString().padStart(4, '0')}`;
            }

            // Set manufacturing date to today if not provided
            if (!data.manufacturing_date && action === 'create') {
                data.manufacturing_date = new Date().toISOString().split('T')[0];
            }

            // Calculate expiry date based on shelf life
            if (data.shelf_life_days && data.manufacturing_date && !data.expiry_date) {
                const mfgDate = new Date(data.manufacturing_date);
                const expiryDate = new Date(mfgDate.getTime() + (parseInt(data.shelf_life_days) * 24 * 60 * 60 * 1000));
                data.expiry_date = expiryDate.toISOString().split('T')[0];
            }

            return data;
        });

        // Add custom search functionality
        this.crudManager.addCustomSearch((data, searchTerm) => {
            const term = searchTerm.toLowerCase();
            return data.filter(item => 
                (item.product_code && item.product_code.toLowerCase().includes(term)) ||
                (item.product_name && item.product_name.toLowerCase().includes(term)) ||
                (item.batch_number && item.batch_number.toLowerCase().includes(term)) ||
                (item.warehouse_location && item.warehouse_location.toLowerCase().includes(term)) ||
                (item.category && item.category.toLowerCase().includes(term))
            );
        });

        // Initialize the CRUD interface
        this.crudManager.render();

        // Set up additional event listeners
        this.setupAdditionalFeatures();
    }

    setupAdditionalFeatures() {
        // Add stock level indicators and warnings
        this.crudManager.addDataPostProcessor((data) => {
            return data.map(item => {
                const currentStock = parseInt(item.current_stock) || 0;
                const minStock = parseInt(item.min_stock_level) || 0;
                
                // Add stock status
                if (currentStock <= minStock * 0.5) {
                    item._stockStatus = 'critical';
                } else if (currentStock <= minStock) {
                    item._stockStatus = 'low';
                } else {
                    item._stockStatus = 'optimal';
                }

                // Calculate total value
                item.total_value = (currentStock * (parseFloat(item.unit_price) || 0)).toFixed(2);

                return item;
            });
        });

        // Add export functionality with custom formatting
        this.crudManager.addExportFormatter((data) => {
            return data.map(item => ({
                'Product Code': item.product_code,
                'Product Name': item.product_name,
                'Category': item.category,
                'Current Stock': `${item.current_stock} ${item.unit_of_measure}`,
                'Min Stock': item.min_stock_level,
                'Max Stock': item.max_stock_level,
                'Location': item.warehouse_location,
                'Bin Location': item.bin_location,
                'Unit Price': `$${item.unit_price}`,
                'Total Value': `$${item.total_value}`,
                'Batch Number': item.batch_number,
                'Quality Status': item.quality_status,
                'Manufacturing Date': item.manufacturing_date,
                'Expiry Date': item.expiry_date,
                'Storage Temperature': item.storage_temperature,
                'Last Count Date': item.last_count_date,
                'Description': item.description
            }));
        });

        console.log('✅ Finished Goods CRUD system initialized successfully');
    }
}

// Initialize the Finished Goods CRUD system
let finishedGoodsCRUD;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        finishedGoodsCRUD = new FinishedGoodsCRUD();
    });
} else {
    finishedGoodsCRUD = new FinishedGoodsCRUD();
}

// Export for global access
window.finishedGoodsCRUD = finishedGoodsCRUD;
