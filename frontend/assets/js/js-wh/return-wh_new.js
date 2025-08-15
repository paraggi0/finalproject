// Return WH (Warehouse Returns) CRUD Management
// This module handles CRUD operations for warehouse returns management

class WarehouseReturnsCRUD {
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
            entityName: 'Warehouse Return',
            entityNamePlural: 'Warehouse Returns',
            containerId: 'crudContainer'
        });

        // Configure form fields
        this.crudManager.setFormFields([
            {
                name: 'return_number',
                label: '↩️ Return Number',
                type: 'text',
                required: true,
                placeholder: 'e.g., RET-2025-001',
                validation: {
                    pattern: /^RET-\d{4}-\d{3}$/,
                    message: 'Return Number format: RET-YYYY-XXX (e.g., RET-2025-001)'
                }
            },
            {
                name: 'return_date',
                label: '📅 Return Date',
                type: 'date',
                required: true
            },
            {
                name: 'return_type',
                label: '🔄 Return Type',
                type: 'select',
                required: true,
                options: [
                    { value: 'customer_return', label: '👤 Customer Return' },
                    { value: 'supplier_return', label: '🏭 Supplier Return' },
                    { value: 'internal_return', label: '🔄 Internal Return' },
                    { value: 'damaged_goods', label: '💥 Damaged Goods' },
                    { value: 'defective_items', label: '⚠️ Defective Items' },
                    { value: 'overstock_return', label: '📦 Overstock Return' },
                    { value: 'expired_products', label: '⏰ Expired Products' }
                ]
            },
            {
                name: 'customer_supplier_name',
                label: '🏢 Customer/Supplier Name',
                type: 'text',
                required: true,
                placeholder: 'e.g., ABC Manufacturing or XYZ Supplier'
            },
            {
                name: 'customer_supplier_code',
                label: '🔢 Customer/Supplier Code',
                type: 'text',
                required: true,
                placeholder: 'e.g., CUST-001 or SUPP-001',
                validation: {
                    pattern: /^(CUST|SUPP)-\d{3}$/,
                    message: 'Code format: CUST-XXX or SUPP-XXX'
                }
            },
            {
                name: 'original_reference',
                label: '📄 Original Reference',
                type: 'text',
                placeholder: 'Original DO/PO Number'
            },
            {
                name: 'product_code',
                label: '📦 Product Code',
                type: 'text',
                required: true,
                placeholder: 'e.g., PROD-001'
            },
            {
                name: 'product_name',
                label: '📦 Product Name',
                type: 'text',
                required: true,
                placeholder: 'Product name or description'
            },
            {
                name: 'batch_lot_number',
                label: '🏷️ Batch/Lot Number',
                type: 'text',
                placeholder: 'Batch or lot number for traceability'
            },
            {
                name: 'return_quantity',
                label: '📊 Return Quantity',
                type: 'number',
                required: true,
                min: 1,
                placeholder: 'Quantity being returned'
            },
            {
                name: 'unit_of_measure',
                label: '📏 Unit of Measure',
                type: 'select',
                required: true,
                options: [
                    { value: 'pcs', label: 'Pieces (pcs)' },
                    { value: 'kg', label: 'Kilograms (kg)' },
                    { value: 'liter', label: 'Liters (L)' },
                    { value: 'meter', label: 'Meters (m)' },
                    { value: 'box', label: 'Boxes' },
                    { value: 'carton', label: 'Cartons' },
                    { value: 'pallet', label: 'Pallets' }
                ]
            },
            {
                name: 'return_reason',
                label: '❓ Return Reason',
                type: 'select',
                required: true,
                options: [
                    { value: 'damaged_in_transit', label: '🚛 Damaged in Transit' },
                    { value: 'manufacturing_defect', label: '⚙️ Manufacturing Defect' },
                    { value: 'wrong_item_delivered', label: '❌ Wrong Item Delivered' },
                    { value: 'quality_issue', label: '🔍 Quality Issue' },
                    { value: 'customer_change_mind', label: '🤔 Customer Changed Mind' },
                    { value: 'overstock', label: '📦 Overstock' },
                    { value: 'expired_product', label: '⏰ Expired Product' },
                    { value: 'specification_mismatch', label: '📋 Specification Mismatch' },
                    { value: 'packaging_issue', label: '📦 Packaging Issue' },
                    { value: 'other', label: '❓ Other' }
                ]
            },
            {
                name: 'return_condition',
                label: '🔍 Return Condition',
                type: 'select',
                required: true,
                options: [
                    { value: 'new_unopened', label: '🆕 New/Unopened' },
                    { value: 'like_new', label: '✨ Like New' },
                    { value: 'good_condition', label: '👍 Good Condition' },
                    { value: 'fair_condition', label: '⚖️ Fair Condition' },
                    { value: 'poor_condition', label: '👎 Poor Condition' },
                    { value: 'damaged', label: '💥 Damaged' },
                    { value: 'defective', label: '⚠️ Defective' },
                    { value: 'unusable', label: '❌ Unusable' }
                ]
            },
            {
                name: 'return_status',
                label: '📊 Return Status',
                type: 'select',
                required: true,
                options: [
                    { value: 'received', label: '📥 Received' },
                    { value: 'under_inspection', label: '🔍 Under Inspection' },
                    { value: 'approved', label: '✅ Approved' },
                    { value: 'rejected', label: '❌ Rejected' },
                    { value: 'restocked', label: '📦 Restocked' },
                    { value: 'disposed', label: '🗑️ Disposed' },
                    { value: 'returned_to_supplier', label: '↩️ Returned to Supplier' },
                    { value: 'pending_repair', label: '🔧 Pending Repair' },
                    { value: 'repaired', label: '✅ Repaired' }
                ],
                default: 'received'
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
                name: 'return_description',
                label: '📝 Return Description',
                type: 'textarea',
                required: true,
                placeholder: 'Detailed description of the return reason and condition...'
            },
            {
                name: 'inspector_name',
                label: '👨‍🔬 Inspector Name',
                type: 'select',
                options: [
                    { value: 'qc_inspector_1', label: '👨‍🔬 QC Inspector 1' },
                    { value: 'qc_inspector_2', label: '👩‍🔬 QC Inspector 2' },
                    { value: 'warehouse_manager', label: '👨‍💼 Warehouse Manager' },
                    { value: 'quality_manager', label: '👩‍💼 Quality Manager' },
                    { value: 'senior_inspector', label: '👨‍🔬 Senior Inspector' }
                ]
            },
            {
                name: 'inspection_date',
                label: '🔍 Inspection Date',
                type: 'datetime-local'
            },
            {
                name: 'inspection_notes',
                label: '📋 Inspection Notes',
                type: 'textarea',
                placeholder: 'Detailed inspection findings and recommendations...'
            },
            {
                name: 'disposition_action',
                label: '🎯 Disposition Action',
                type: 'select',
                options: [
                    { value: 'restock_as_new', label: '📦 Restock as New' },
                    { value: 'restock_as_used', label: '📦 Restock as Used' },
                    { value: 'restock_discounted', label: '💰 Restock with Discount' },
                    { value: 'repair_and_restock', label: '🔧 Repair and Restock' },
                    { value: 'return_to_supplier', label: '↩️ Return to Supplier' },
                    { value: 'dispose_recycle', label: '♻️ Dispose/Recycle' },
                    { value: 'dispose_waste', label: '🗑️ Dispose as Waste' },
                    { value: 'donate_charity', label: '❤️ Donate to Charity' },
                    { value: 'sell_secondary', label: '💸 Sell in Secondary Market' }
                ]
            },
            {
                name: 'financial_impact',
                label: '💰 Financial Impact',
                type: 'number',
                step: 0.01,
                min: 0,
                placeholder: 'Cost impact of the return'
            },
            {
                name: 'currency',
                label: '💱 Currency',
                type: 'select',
                options: [
                    { value: 'IDR', label: '🇮🇩 Indonesian Rupiah (IDR)' },
                    { value: 'USD', label: '🇺🇸 US Dollar (USD)' },
                    { value: 'EUR', label: '🇪🇺 Euro (EUR)' },
                    { value: 'SGD', label: '🇸🇬 Singapore Dollar (SGD)' }
                ],
                default: 'IDR'
            },
            {
                name: 'replacement_required',
                label: '🔄 Replacement Required',
                type: 'select',
                options: [
                    { value: 'yes', label: '✅ Yes' },
                    { value: 'no', label: '❌ No' },
                    { value: 'pending', label: '⏳ Pending Decision' }
                ],
                default: 'pending'
            },
            {
                name: 'replacement_order',
                label: '📄 Replacement Order',
                type: 'text',
                placeholder: 'Replacement order number if applicable'
            },
            {
                name: 'root_cause_analysis',
                label: '🔍 Root Cause Analysis',
                type: 'textarea',
                placeholder: 'Analysis of root cause to prevent future occurrences...'
            },
            {
                name: 'corrective_action',
                label: '🔧 Corrective Action',
                type: 'textarea',
                placeholder: 'Actions taken to address the root cause...'
            },
            {
                name: 'storage_location',
                label: '🏭 Storage Location',
                type: 'select',
                options: [
                    { value: 'return_area', label: '↩️ Return Processing Area' },
                    { value: 'quarantine', label: '🚫 Quarantine Zone' },
                    { value: 'inspection_bay', label: '🔍 Inspection Bay' },
                    { value: 'repair_shop', label: '🔧 Repair Shop' },
                    { value: 'disposal_area', label: '🗑️ Disposal Area' },
                    { value: 'restock_pending', label: '📦 Restock Pending' }
                ]
            },
            {
                name: 'processing_deadline',
                label: '⏰ Processing Deadline',
                type: 'datetime-local'
            },
            {
                name: 'customer_notification',
                label: '📢 Customer Notification',
                type: 'select',
                options: [
                    { value: 'pending', label: '⏳ Pending' },
                    { value: 'notified', label: '✅ Notified' },
                    { value: 'acknowledged', label: '👍 Acknowledged' },
                    { value: 'not_required', label: '❌ Not Required' }
                ],
                default: 'pending'
            },
            {
                name: 'additional_notes',
                label: '📝 Additional Notes',
                type: 'textarea',
                placeholder: 'Any additional notes, special handling instructions, or comments...'
            },
            {
                name: 'created_by',
                label: '👤 Created By',
                type: 'text',
                placeholder: 'Name of person who created this return record'
            },
            {
                name: 'approved_by',
                label: '✅ Approved By',
                type: 'text',
                placeholder: 'Name of person who approved the return processing'
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
                key: 'return_number', 
                label: 'Return Number',
                render: (value, row) => `<span class="font-mono font-bold">${value || 'N/A'}</span>`
            },
            { 
                key: 'customer_supplier_name', 
                label: 'Customer/Supplier',
                render: (value, row) => `<div class="font-medium">${value || 'N/A'}</div>`
            },
            { 
                key: 'product_name', 
                label: 'Product',
                render: (value, row) => `<div class="product-info">${value || 'N/A'}<br><small class="product-code">${row.product_code || ''}</small></div>`
            },
            { 
                key: 'return_date', 
                label: 'Return Date',
                render: (value, row) => value ? new Date(value).toLocaleDateString() : 'N/A'
            },
            { 
                key: 'return_type', 
                label: 'Type',
                render: (value, row) => {
                    const typeMap = {
                        'customer_return': '<span class="type-badge type-customer">👤 Customer</span>',
                        'supplier_return': '<span class="type-badge type-supplier">🏭 Supplier</span>',
                        'internal_return': '<span class="type-badge type-internal">🔄 Internal</span>',
                        'damaged_goods': '<span class="type-badge type-damaged">💥 Damaged</span>',
                        'defective_items': '<span class="type-badge type-defective">⚠️ Defective</span>',
                        'overstock_return': '<span class="type-badge type-overstock">📦 Overstock</span>',
                        'expired_products': '<span class="type-badge type-expired">⏰ Expired</span>'
                    };
                    return typeMap[value] || '<span class="type-badge">❓ Unknown</span>';
                }
            },
            { 
                key: 'return_reason', 
                label: 'Reason',
                render: (value, row) => {
                    const reasonMap = {
                        'damaged_in_transit': '🚛 Transit Damage',
                        'manufacturing_defect': '⚙️ Defect',
                        'wrong_item_delivered': '❌ Wrong Item',
                        'quality_issue': '🔍 Quality',
                        'customer_change_mind': '🤔 Changed Mind',
                        'overstock': '📦 Overstock',
                        'expired_product': '⏰ Expired',
                        'specification_mismatch': '📋 Spec Mismatch',
                        'packaging_issue': '📦 Packaging',
                        'other': '❓ Other'
                    };
                    return `<span class="reason-tag">${reasonMap[value] || value || 'N/A'}</span>`;
                }
            },
            { 
                key: 'return_status', 
                label: 'Status',
                render: (value, row) => {
                    const statusMap = {
                        'received': '<span class="status-badge status-pending">📥 Received</span>',
                        'under_inspection': '<span class="status-badge status-warning">🔍 Inspecting</span>',
                        'approved': '<span class="status-badge status-approved">✅ Approved</span>',
                        'rejected': '<span class="status-badge status-rejected">❌ Rejected</span>',
                        'restocked': '<span class="status-badge status-approved">📦 Restocked</span>',
                        'disposed': '<span class="status-badge status-cancelled">🗑️ Disposed</span>',
                        'returned_to_supplier': '<span class="status-badge status-info">↩️ To Supplier</span>',
                        'pending_repair': '<span class="status-badge status-warning">🔧 Repair</span>',
                        'repaired': '<span class="status-badge status-approved">✅ Repaired</span>'
                    };
                    return statusMap[value] || '<span class="status-badge">❓ Unknown</span>';
                }
            },
            { 
                key: 'return_quantity', 
                label: 'Quantity',
                render: (value, row) => {
                    const unit = row.unit_of_measure || 'pcs';
                    return `<span class="quantity-tag">📊 ${value || 0} ${unit}</span>`;
                }
            },
            { 
                key: 'return_condition', 
                label: 'Condition',
                render: (value, row) => {
                    const conditionMap = {
                        'new_unopened': '<span class="condition-badge condition-new">🆕 New</span>',
                        'like_new': '<span class="condition-badge condition-good">✨ Like New</span>',
                        'good_condition': '<span class="condition-badge condition-good">👍 Good</span>',
                        'fair_condition': '<span class="condition-badge condition-fair">⚖️ Fair</span>',
                        'poor_condition': '<span class="condition-badge condition-poor">👎 Poor</span>',
                        'damaged': '<span class="condition-badge condition-damaged">💥 Damaged</span>',
                        'defective': '<span class="condition-badge condition-defective">⚠️ Defective</span>',
                        'unusable': '<span class="condition-badge condition-unusable">❌ Unusable</span>'
                    };
                    return conditionMap[value] || '<span class="condition-badge">❓ Unknown</span>';
                }
            },
            { 
                key: 'financial_impact', 
                label: 'Impact',
                render: (value, row) => {
                    if (!value || value === 0) return '<span class="impact-tag">💰 No Impact</span>';
                    const currency = row.currency || 'IDR';
                    const amount = parseFloat(value);
                    return `<span class="impact-tag negative">💸 ${currency} ${amount.toLocaleString()}</span>`;
                }
            }
        ]);

        // Add custom form validation
        this.crudManager.addFormValidation((formData) => {
            const errors = [];

            // Validate return date
            if (formData.return_date) {
                const returnDate = new Date(formData.return_date);
                const today = new Date();
                if (returnDate > today) {
                    errors.push('Return date cannot be in the future');
                }
            }

            // Validate inspection date
            if (formData.inspection_date && formData.return_date) {
                const inspectionDate = new Date(formData.inspection_date);
                const returnDate = new Date(formData.return_date);
                if (inspectionDate < returnDate) {
                    errors.push('Inspection date cannot be before return date');
                }
            }

            // Validate processing deadline
            if (formData.processing_deadline) {
                const deadline = new Date(formData.processing_deadline);
                const now = new Date();
                if (deadline < now) {
                    errors.push('Processing deadline cannot be in the past');
                }
            }

            // Validate quantity
            if (formData.return_quantity && parseInt(formData.return_quantity) <= 0) {
                errors.push('Return quantity must be greater than 0');
            }

            // Validate financial impact
            if (formData.financial_impact && parseFloat(formData.financial_impact) < 0) {
                errors.push('Financial impact cannot be negative');
            }

            return errors;
        });

        // Add custom data preprocessing before create/update
        this.crudManager.addDataPreprocessor((data, action) => {
            // Auto-generate return number if not provided
            if (!data.return_number && action === 'create') {
                const year = new Date().getFullYear();
                const randomNum = Math.floor(Math.random() * 999) + 1;
                data.return_number = `RET-${year}-${randomNum.toString().padStart(3, '0')}`;
            }

            // Set return date to today if not provided
            if (!data.return_date && action === 'create') {
                data.return_date = new Date().toISOString().split('T')[0];
            }

            // Set default currency if not provided
            if (!data.currency) {
                data.currency = 'IDR';
            }

            // Set default processing deadline (7 days from return date)
            if (!data.processing_deadline && data.return_date) {
                const returnDate = new Date(data.return_date);
                returnDate.setDate(returnDate.getDate() + 7);
                data.processing_deadline = returnDate.toISOString().slice(0, 16);
            }

            // Set inspection date when status is changed to under_inspection
            if (data.return_status === 'under_inspection' && !data.inspection_date) {
                data.inspection_date = new Date().toISOString().slice(0, 16);
            }

            // Set approval date when status is changed to approved
            if (data.return_status === 'approved' && !data.approval_date) {
                data.approval_date = new Date().toISOString().slice(0, 16);
            }

            return data;
        });

        // Add custom search functionality
        this.crudManager.addCustomSearch((data, searchTerm) => {
            const term = searchTerm.toLowerCase();
            return data.filter(item => 
                (item.return_number && item.return_number.toLowerCase().includes(term)) ||
                (item.customer_supplier_name && item.customer_supplier_name.toLowerCase().includes(term)) ||
                (item.product_name && item.product_name.toLowerCase().includes(term)) ||
                (item.product_code && item.product_code.toLowerCase().includes(term)) ||
                (item.return_reason && item.return_reason.toLowerCase().includes(term)) ||
                (item.return_status && item.return_status.toLowerCase().includes(term)) ||
                (item.inspector_name && item.inspector_name.toLowerCase().includes(term))
            );
        });

        // Initialize the CRUD interface
        this.crudManager.render();

        // Set up additional event listeners
        this.setupAdditionalFeatures();
    }

    setupAdditionalFeatures() {
        // Add return analytics and metrics
        this.crudManager.addDataPostProcessor((data) => {
            return data.map(item => {
                // Calculate return age
                if (item.return_date) {
                    const returnDate = new Date(item.return_date);
                    const now = new Date();
                    const ageInDays = Math.floor((now - returnDate) / (1000 * 60 * 60 * 24));
                    item._returnAge = ageInDays + ' days';
                }

                // Calculate processing time remaining
                if (item.processing_deadline) {
                    const deadline = new Date(item.processing_deadline);
                    const now = new Date();
                    const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
                    
                    if (daysUntilDeadline < 0) {
                        item._deadlineStatus = 'overdue';
                    } else if (daysUntilDeadline <= 1) {
                        item._deadlineStatus = 'urgent';
                    } else if (daysUntilDeadline <= 3) {
                        item._deadlineStatus = 'soon';
                    } else {
                        item._deadlineStatus = 'normal';
                    }
                    
                    item._daysUntilDeadline = daysUntilDeadline;
                }

                // Set return complexity based on various factors
                let complexityScore = 0;
                
                if (item.return_type === 'defective_items' || item.return_type === 'damaged_goods') {
                    complexityScore += 2;
                }
                
                if (item.financial_impact && parseFloat(item.financial_impact) > 1000) {
                    complexityScore += 2;
                }
                
                if (item.replacement_required === 'yes') {
                    complexityScore += 1;
                }
                
                if (item.root_cause_analysis && item.root_cause_analysis.length > 100) {
                    complexityScore += 1;
                }
                
                if (complexityScore >= 4) {
                    item._complexity = 'high';
                } else if (complexityScore >= 2) {
                    item._complexity = 'medium';
                } else {
                    item._complexity = 'low';
                }

                return item;
            });
        });

        // Add export functionality with custom formatting
        this.crudManager.addExportFormatter((data) => {
            return data.map(item => ({
                'Return Number': item.return_number,
                'Return Date': item.return_date,
                'Return Type': item.return_type,
                'Customer/Supplier': item.customer_supplier_name,
                'Customer/Supplier Code': item.customer_supplier_code,
                'Original Reference': item.original_reference,
                'Product Code': item.product_code,
                'Product Name': item.product_name,
                'Batch/Lot Number': item.batch_lot_number,
                'Return Quantity': item.return_quantity,
                'Unit of Measure': item.unit_of_measure,
                'Return Reason': item.return_reason,
                'Return Condition': item.return_condition,
                'Return Status': item.return_status,
                'Priority Level': item.priority_level,
                'Return Description': item.return_description,
                'Inspector': item.inspector_name,
                'Inspection Date': item.inspection_date,
                'Inspection Notes': item.inspection_notes,
                'Disposition Action': item.disposition_action,
                'Financial Impact': item.financial_impact,
                'Currency': item.currency,
                'Replacement Required': item.replacement_required,
                'Replacement Order': item.replacement_order,
                'Root Cause Analysis': item.root_cause_analysis,
                'Corrective Action': item.corrective_action,
                'Storage Location': item.storage_location,
                'Processing Deadline': item.processing_deadline,
                'Customer Notification': item.customer_notification,
                'Return Age': item._returnAge,
                'Days Until Deadline': item._daysUntilDeadline,
                'Deadline Status': item._deadlineStatus,
                'Complexity': item._complexity,
                'Additional Notes': item.additional_notes,
                'Created By': item.created_by,
                'Approved By': item.approved_by,
                'Approval Date': item.approval_date
            }));
        });

        console.log('✅ Warehouse Returns CRUD system initialized successfully');
    }
}

// Initialize the Warehouse Returns CRUD system
let warehouseReturnsCRUD;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        warehouseReturnsCRUD = new WarehouseReturnsCRUD();
    });
} else {
    warehouseReturnsCRUD = new WarehouseReturnsCRUD();
}

// Export for global access
window.warehouseReturnsCRUD = warehouseReturnsCRUD;
