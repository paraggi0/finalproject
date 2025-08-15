// IQC (Incoming Quality Control) CRUD Management
// This module handles CRUD operations for incoming quality control inspections

class IQCCrud {
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
            apiBaseUrl: `${this.apiBaseUrl}/qc`,
            apiKey: this.apiKey,
            entityName: 'IQC Record',
            entityNamePlural: 'IQC Records',
            containerId: 'crudContainer'
        });

        // Configure form fields
        this.crudManager.setFormFields([
            {
                name: 'item_code',
                label: '📦 Item Code',
                type: 'text',
                required: true,
                placeholder: 'e.g., RM-STEEL-001',
                validation: {
                    pattern: /^[A-Z]{2}-[A-Z0-9-]+$/,
                    message: 'Item code format: TYPE-DESCRIPTION (e.g., RM-STEEL-001)'
                }
            },
            {
                name: 'item_description',
                label: '📋 Item Description',
                type: 'text',
                required: true,
                placeholder: 'e.g., High-grade steel sheet 2mm thickness'
            },
            {
                name: 'supplier_name',
                label: '🏢 Supplier Name',
                type: 'text',
                required: true,
                placeholder: 'e.g., ABC Steel Industries'
            },
            {
                name: 'supplier_code',
                label: '🔢 Supplier Code',
                type: 'text',
                required: true,
                placeholder: 'e.g., SUP-001',
                validation: {
                    pattern: /^SUP-\d{3}$/,
                    message: 'Supplier code format: SUP-XXX (e.g., SUP-001)'
                }
            },
            {
                name: 'batch_number',
                label: '🏷️ Batch Number',
                type: 'text',
                required: true,
                placeholder: 'e.g., BATCH-RM-2024-001'
            },
            {
                name: 'lot_number',
                label: '📊 Lot Number',
                type: 'text',
                placeholder: 'e.g., LOT-2024-001'
            },
            {
                name: 'qty_received',
                label: '📦 Quantity Received',
                type: 'number',
                required: true,
                placeholder: '100',
                min: 0,
                step: 0.001
            },
            {
                name: 'unit_of_measure',
                label: '📏 Unit of Measure',
                type: 'select',
                required: true,
                options: [
                    { value: 'kg', label: 'Kilogram' },
                    { value: 'pcs', label: 'Pieces' },
                    { value: 'meter', label: 'Meter' },
                    { value: 'liter', label: 'Liter' },
                    { value: 'box', label: 'Box' },
                    { value: 'roll', label: 'Roll' },
                    { value: 'sheet', label: 'Sheet' }
                ]
            },
            {
                name: 'inspection_date',
                label: '📅 Inspection Date',
                type: 'date',
                required: true
            },
            {
                name: 'received_date',
                label: '📥 Received Date',
                type: 'date',
                required: true
            },
            {
                name: 'inspector_name',
                label: '👤 Inspector Name',
                type: 'text',
                required: true,
                placeholder: 'e.g., John Doe'
            },
            {
                name: 'inspector_id',
                label: '🆔 Inspector ID',
                type: 'text',
                required: true,
                placeholder: 'e.g., EMP-QC-001',
                validation: {
                    pattern: /^EMP-QC-\d{3}$/,
                    message: 'Inspector ID format: EMP-QC-XXX (e.g., EMP-QC-001)'
                }
            },
            {
                name: 'inspection_status',
                label: '✅ Inspection Status',
                type: 'select',
                required: true,
                options: [
                    { value: 'pending', label: '⏳ Pending Inspection' },
                    { value: 'in_progress', label: '🔍 In Progress' },
                    { value: 'passed', label: '✅ Passed' },
                    { value: 'failed', label: '❌ Failed' },
                    { value: 'conditional_accept', label: '⚠️ Conditional Accept' },
                    { value: 'quarantine', label: '🔒 Quarantine' }
                ],
                default: 'pending'
            },
            {
                name: 'conformance_status',
                label: '📊 Conformance Status',
                type: 'select',
                required: true,
                options: [
                    { value: 'conforming', label: '✅ Conforming' },
                    { value: 'non_conforming', label: '❌ Non-Conforming' },
                    { value: 'minor_defects', label: '⚠️ Minor Defects' },
                    { value: 'major_defects', label: '🚫 Major Defects' }
                ],
                default: 'conforming'
            },
            {
                name: 'quality_grade',
                label: '🏆 Quality Grade',
                type: 'select',
                options: [
                    { value: 'A', label: 'Grade A - Excellent' },
                    { value: 'B', label: 'Grade B - Good' },
                    { value: 'C', label: 'Grade C - Acceptable' },
                    { value: 'D', label: 'Grade D - Poor' },
                    { value: 'F', label: 'Grade F - Failed' }
                ]
            },
            {
                name: 'defect_type',
                label: '⚠️ Defect Type',
                type: 'select',
                options: [
                    { value: 'none', label: 'No Defects' },
                    { value: 'dimensional', label: 'Dimensional' },
                    { value: 'surface', label: 'Surface Defects' },
                    { value: 'material', label: 'Material Defects' },
                    { value: 'functional', label: 'Functional Issues' },
                    { value: 'packaging', label: 'Packaging Issues' },
                    { value: 'documentation', label: 'Documentation Issues' }
                ]
            },
            {
                name: 'sampling_size',
                label: '🔬 Sampling Size',
                type: 'number',
                placeholder: '10',
                min: 1
            },
            {
                name: 'defect_count',
                label: '📊 Defect Count',
                type: 'number',
                placeholder: '0',
                min: 0,
                default: 0
            },
            {
                name: 'acceptance_criteria',
                label: '✅ Acceptance Criteria',
                type: 'textarea',
                placeholder: 'Define the acceptance criteria for this inspection...'
            },
            {
                name: 'inspection_notes',
                label: '📝 Inspection Notes',
                type: 'textarea',
                placeholder: 'Detailed inspection notes, observations, and remarks...'
            },
            {
                name: 'corrective_action',
                label: '🔧 Corrective Action',
                type: 'textarea',
                placeholder: 'Required corrective actions if any defects are found...'
            },
            {
                name: 'disposition',
                label: '🎯 Disposition',
                type: 'select',
                options: [
                    { value: 'accept', label: '✅ Accept' },
                    { value: 'reject', label: '❌ Reject' },
                    { value: 'rework', label: '🔧 Rework' },
                    { value: 'use_as_is', label: '⚠️ Use As-Is' },
                    { value: 'return_supplier', label: '📤 Return to Supplier' },
                    { value: 'scrap', label: '🗑️ Scrap' }
                ]
            },
            {
                name: 'certificate_number',
                label: '📜 Certificate Number',
                type: 'text',
                placeholder: 'e.g., CERT-IQC-2024-001'
            },
            {
                name: 'next_inspection_date',
                label: '📅 Next Inspection Date',
                type: 'date'
            }
        ]);

        // Configure table columns
        this.crudManager.setTableColumns([
            { 
                key: 'item_code', 
                label: 'Item Code',
                render: (value, row) => `<span class="font-mono text-sm">${value || 'N/A'}</span>`
            },
            { 
                key: 'item_description', 
                label: 'Description',
                render: (value, row) => `<div class="max-w-xs truncate" title="${value || 'N/A'}">${value || 'N/A'}</div>`
            },
            { 
                key: 'supplier_name', 
                label: 'Supplier',
                render: (value, row) => `<div class="font-medium">${value || 'N/A'}</div>`
            },
            { 
                key: 'batch_number', 
                label: 'Batch Number',
                render: (value, row) => `<span class="batch-tag">${value || 'N/A'}</span>`
            },
            { 
                key: 'qty_received', 
                label: 'Qty Received',
                render: (value, row) => `<span class="qty-tag">${value || 0} ${row.unit_of_measure || 'pcs'}</span>`
            },
            { 
                key: 'inspection_date', 
                label: 'Inspection Date',
                render: (value, row) => value ? new Date(value).toLocaleDateString() : 'N/A'
            },
            { 
                key: 'inspector_name', 
                label: 'Inspector',
                render: (value, row) => `<div class="inspector-tag">👤 ${value || 'N/A'}</div>`
            },
            { 
                key: 'inspection_status', 
                label: 'Status',
                render: (value, row) => {
                    const statusMap = {
                        'pending': '<span class="status-badge status-pending">⏳ Pending</span>',
                        'in_progress': '<span class="status-badge status-warning">🔍 In Progress</span>',
                        'passed': '<span class="status-badge status-approved">✅ Passed</span>',
                        'failed': '<span class="status-badge status-rejected">❌ Failed</span>',
                        'conditional_accept': '<span class="status-badge status-warning">⚠️ Conditional</span>',
                        'quarantine': '<span class="status-badge status-critical">🔒 Quarantine</span>'
                    };
                    return statusMap[value] || '<span class="status-badge">❓ Unknown</span>';
                }
            },
            { 
                key: 'conformance_status', 
                label: 'Conformance',
                render: (value, row) => {
                    const conformanceMap = {
                        'conforming': '<span class="conformance-badge conformance-pass">✅ Conforming</span>',
                        'non_conforming': '<span class="conformance-badge conformance-fail">❌ Non-Conforming</span>',
                        'minor_defects': '<span class="conformance-badge conformance-minor">⚠️ Minor Defects</span>',
                        'major_defects': '<span class="conformance-badge conformance-major">🚫 Major Defects</span>'
                    };
                    return conformanceMap[value] || '<span class="conformance-badge">❓ Unknown</span>';
                }
            }
        ]);

        // Add custom form validation
        this.crudManager.addFormValidation((formData) => {
            const errors = [];

            // Validate dates
            if (formData.inspection_date && formData.received_date) {
                const inspectionDate = new Date(formData.inspection_date);
                const receivedDate = new Date(formData.received_date);
                if (inspectionDate < receivedDate) {
                    errors.push('Inspection date cannot be before received date');
                }
            }

            // Validate sampling size vs defect count
            if (formData.sampling_size && formData.defect_count) {
                const samplingSize = parseInt(formData.sampling_size);
                const defectCount = parseInt(formData.defect_count);
                if (defectCount > samplingSize) {
                    errors.push('Defect count cannot exceed sampling size');
                }
            }

            // Validate status consistency
            if (formData.inspection_status === 'passed' && formData.conformance_status === 'non_conforming') {
                errors.push('Passed inspection cannot have non-conforming status');
            }

            if (formData.inspection_status === 'failed' && formData.conformance_status === 'conforming') {
                errors.push('Failed inspection cannot have conforming status');
            }

            return errors;
        });

        // Add custom data preprocessing before create/update
        this.crudManager.addDataPreprocessor((data, action) => {
            // Auto-generate batch number if not provided
            if (!data.batch_number && action === 'create') {
                const year = new Date().getFullYear();
                const randomNum = Math.floor(Math.random() * 999) + 1;
                data.batch_number = `BATCH-RM-${year}-${randomNum.toString().padStart(3, '0')}`;
            }

            // Auto-generate lot number if not provided
            if (!data.lot_number && action === 'create') {
                const year = new Date().getFullYear();
                const randomNum = Math.floor(Math.random() * 999) + 1;
                data.lot_number = `LOT-${year}-${randomNum.toString().padStart(3, '0')}`;
            }

            // Set inspection date to today if not provided
            if (!data.inspection_date && action === 'create') {
                data.inspection_date = new Date().toISOString().split('T')[0];
            }

            // Auto-generate certificate number for passed inspections
            if (data.inspection_status === 'passed' && !data.certificate_number) {
                const year = new Date().getFullYear();
                const randomNum = Math.floor(Math.random() * 9999) + 1;
                data.certificate_number = `CERT-IQC-${year}-${randomNum.toString().padStart(4, '0')}`;
            }

            // Set conformance status based on defects
            if (data.defect_count && !data.conformance_status) {
                const defectCount = parseInt(data.defect_count);
                if (defectCount === 0) {
                    data.conformance_status = 'conforming';
                } else if (defectCount <= 2) {
                    data.conformance_status = 'minor_defects';
                } else {
                    data.conformance_status = 'major_defects';
                }
            }

            return data;
        });

        // Add custom search functionality
        this.crudManager.addCustomSearch((data, searchTerm) => {
            const term = searchTerm.toLowerCase();
            return data.filter(item => 
                (item.item_code && item.item_code.toLowerCase().includes(term)) ||
                (item.item_description && item.item_description.toLowerCase().includes(term)) ||
                (item.supplier_name && item.supplier_name.toLowerCase().includes(term)) ||
                (item.batch_number && item.batch_number.toLowerCase().includes(term)) ||
                (item.inspector_name && item.inspector_name.toLowerCase().includes(term)) ||
                (item.inspection_status && item.inspection_status.toLowerCase().includes(term))
            );
        });

        // Initialize the CRUD interface
        this.crudManager.render();

        // Set up additional event listeners
        this.setupAdditionalFeatures();
    }

    setupAdditionalFeatures() {
        // Add status-based data processing
        this.crudManager.addDataPostProcessor((data) => {
            return data.map(item => {
                // Calculate quality score
                const defectCount = parseInt(item.defect_count) || 0;
                const samplingSize = parseInt(item.sampling_size) || 1;
                const qualityScore = ((samplingSize - defectCount) / samplingSize * 100).toFixed(1);
                item._qualityScore = qualityScore;

                // Set priority based on status
                if (item.inspection_status === 'failed' || item.conformance_status === 'non_conforming') {
                    item._priority = 'high';
                } else if (item.inspection_status === 'pending' || item.inspection_status === 'in_progress') {
                    item._priority = 'medium';
                } else {
                    item._priority = 'low';
                }

                return item;
            });
        });

        // Add export functionality with custom formatting
        this.crudManager.addExportFormatter((data) => {
            return data.map(item => ({
                'Item Code': item.item_code,
                'Description': item.item_description,
                'Supplier': item.supplier_name,
                'Supplier Code': item.supplier_code,
                'Batch Number': item.batch_number,
                'Lot Number': item.lot_number,
                'Qty Received': `${item.qty_received} ${item.unit_of_measure}`,
                'Inspection Date': item.inspection_date,
                'Received Date': item.received_date,
                'Inspector': item.inspector_name,
                'Inspector ID': item.inspector_id,
                'Inspection Status': item.inspection_status,
                'Conformance Status': item.conformance_status,
                'Quality Grade': item.quality_grade,
                'Defect Type': item.defect_type,
                'Sampling Size': item.sampling_size,
                'Defect Count': item.defect_count,
                'Quality Score': item._qualityScore + '%',
                'Disposition': item.disposition,
                'Certificate Number': item.certificate_number,
                'Acceptance Criteria': item.acceptance_criteria,
                'Inspection Notes': item.inspection_notes,
                'Corrective Action': item.corrective_action,
                'Next Inspection Date': item.next_inspection_date
            }));
        });

        console.log('✅ IQC CRUD system initialized successfully');
    }
}

// Initialize the IQC CRUD system
let iqcCrud;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        iqcCrud = new IQCCrud();
    });
} else {
    iqcCrud = new IQCCrud();
}

// Export for global access
window.iqcCrud = iqcCrud;
