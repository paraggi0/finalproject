/**
 * CRUD Utility Library for PT. Topline Evergreen Manufacturing
 * Provides standardized CRUD operations for all modules
 */

class CRUDManager {
    constructor(apiBaseUrl = 'http://localhost:3001/api/website', apiKey = 'website-admin-2025') {
        this.apiBaseUrl = apiBaseUrl;
        this.apiKey = apiKey;
        this.defaultHeaders = {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Generic API request method
     */
    async apiRequest(endpoint, method = 'GET', data = null) {
        const config = {
            method,
            headers: this.defaultHeaders
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, config);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }
            
            return result;
        } catch (error) {
            console.error(`API Error (${method} ${endpoint}):`, error);
            throw error;
        }
    }

    /**
     * READ - Get all items with pagination
     */
    async getAll(module, options = {}) {
        const { page = 1, limit = 20, search = '', filters = {} } = options;
        let queryParams = new URLSearchParams({
            page,
            limit,
            ...(search && { search }),
            ...filters
        });

        return await this.apiRequest(`/${module}?${queryParams}`);
    }

    /**
     * READ - Get single item by ID
     */
    async getById(module, id) {
        return await this.apiRequest(`/${module}/${id}`);
    }

    /**
     * CREATE - Add new item
     */
    async create(module, data) {
        return await this.apiRequest(`/${module}`, 'POST', data);
    }

    /**
     * UPDATE - Update existing item
     */
    async update(module, id, data) {
        return await this.apiRequest(`/${module}/${id}`, 'PUT', data);
    }

    /**
     * DELETE - Remove item
     */
    async delete(module, id) {
        return await this.apiRequest(`/${module}/${id}`, 'DELETE');
    }

    /**
     * Get dashboard summary data
     */
    async getDashboard(module) {
        return await this.apiRequest(`/${module}/dashboard`);
    }
}

/**
 * UI Helper Class for CRUD Operations
 */
class CRUDUIHelper {
    constructor(crudManager) {
        this.crud = crudManager;
        this.currentModule = '';
        this.currentData = [];
        this.currentPage = 1;
        this.totalPages = 1;
    }

    /**
     * Initialize CRUD UI for a module
     */
    init(module, containerId, options = {}) {
        this.currentModule = module;
        this.container = document.getElementById(containerId);
        this.options = {
            showCreate: true,
            showEdit: true,
            showDelete: true,
            showSearch: true,
            showPagination: true,
            ...options
        };

        this.createCRUDInterface();
        this.loadData();
    }

    /**
     * Create the main CRUD interface
     */
    createCRUDInterface() {
        this.container.innerHTML = `
            <div class="crud-container">
                <!-- Header with title and actions -->
                <div class="crud-header">
                    <div class="crud-title">
                        <h2>${this.formatModuleName(this.currentModule)} Management</h2>
                    </div>
                    <div class="crud-actions">
                        ${this.options.showCreate ? `
                            <button class="btn btn-primary" id="btnCreate">
                                <i class="icon-plus"></i> Add New
                            </button>
                        ` : ''}
                        <button class="btn btn-secondary" id="btnRefresh">
                            <i class="icon-refresh"></i> Refresh
                        </button>
                        <button class="btn btn-info" id="btnExport">
                            <i class="icon-download"></i> Export
                        </button>
                    </div>
                </div>

                <!-- Search and filters -->
                ${this.options.showSearch ? `
                    <div class="crud-search">
                        <div class="search-box">
                            <input type="text" id="searchInput" placeholder="Search..." class="form-control">
                            <button class="btn btn-outline-primary" id="btnSearch">
                                <i class="icon-search"></i>
                            </button>
                        </div>
                        <div class="filter-box">
                            <select id="filterSelect" class="form-control">
                                <option value="">All Status</option>
                            </select>
                        </div>
                    </div>
                ` : ''}

                <!-- Data table -->
                <div class="crud-table-container">
                    <table class="table table-striped" id="dataTable">
                        <thead id="tableHeader"></thead>
                        <tbody id="tableBody">
                            <tr>
                                <td colspan="100%" class="text-center">
                                    <div class="loading-spinner">Loading...</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                ${this.options.showPagination ? `
                    <div class="crud-pagination">
                        <div class="pagination-info">
                            <span id="paginationInfo">Page 1 of 1</span>
                        </div>
                        <div class="pagination-controls">
                            <button class="btn btn-outline-primary" id="btnPrevPage" disabled>Previous</button>
                            <span id="pageNumbers"></span>
                            <button class="btn btn-outline-primary" id="btnNextPage" disabled>Next</button>
                        </div>
                    </div>
                ` : ''}

                <!-- Create/Edit Modal -->
                <div class="modal" id="crudModal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 id="modalTitle">Add New Item</h3>
                            <button class="btn-close" id="btnCloseModal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="crudForm">
                                <div id="formFields"></div>
                                <div class="form-actions">
                                    <button type="submit" class="btn btn-primary" id="btnSave">Save</button>
                                    <button type="button" class="btn btn-secondary" id="btnCancel">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Create button
        const btnCreate = document.getElementById('btnCreate');
        if (btnCreate) {
            btnCreate.addEventListener('click', () => this.showCreateModal());
        }

        // Refresh button
        document.getElementById('btnRefresh').addEventListener('click', () => this.loadData());

        // Export button
        document.getElementById('btnExport').addEventListener('click', () => this.exportData());

        // Search
        const searchInput = document.getElementById('searchInput');
        const btnSearch = document.getElementById('btnSearch');
        if (searchInput && btnSearch) {
            btnSearch.addEventListener('click', () => this.performSearch());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performSearch();
            });
        }

        // Modal controls
        document.getElementById('btnCloseModal').addEventListener('click', () => this.hideModal());
        document.getElementById('btnCancel').addEventListener('click', () => this.hideModal());
        document.getElementById('crudForm').addEventListener('submit', (e) => this.handleSubmit(e));

        // Pagination
        const btnPrevPage = document.getElementById('btnPrevPage');
        const btnNextPage = document.getElementById('btnNextPage');
        if (btnPrevPage && btnNextPage) {
            btnPrevPage.addEventListener('click', () => this.changePage(this.currentPage - 1));
            btnNextPage.addEventListener('click', () => this.changePage(this.currentPage + 1));
        }
    }

    /**
     * Load data from API
     */
    async loadData(page = 1, search = '') {
        try {
            this.showLoading();
            const result = await this.crud.getAll(this.currentModule, { page, search });
            
            this.currentData = result.data;
            this.currentPage = result.pagination?.page || 1;
            this.totalPages = result.pagination?.total_pages || 1;
            
            this.renderTable();
            this.updatePagination();
            
        } catch (error) {
            this.showError('Failed to load data: ' + error.message);
        }
    }

    /**
     * Render data table
     */
    renderTable() {
        if (!this.currentData || this.currentData.length === 0) {
            document.getElementById('tableBody').innerHTML = `
                <tr><td colspan="100%" class="text-center">No data available</td></tr>
            `;
            return;
        }

        // Get data structure from first item
        const firstItem = Array.isArray(this.currentData) ? this.currentData[0] : 
                         (this.currentData.wip_records || this.currentData.finished_goods || 
                          this.currentData.materials || [])[0];
        
        if (!firstItem) {
            document.getElementById('tableBody').innerHTML = `
                <tr><td colspan="100%" class="text-center">No data available</td></tr>
            `;
            return;
        }

        // Create table header
        const headers = this.getTableHeaders(firstItem);
        document.getElementById('tableHeader').innerHTML = `
            <tr>
                ${headers.map(header => `<th>${this.formatHeader(header)}</th>`).join('')}
                <th>Actions</th>
            </tr>
        `;

        // Create table body
        const dataArray = Array.isArray(this.currentData) ? this.currentData : 
                         (this.currentData.wip_records || this.currentData.finished_goods || 
                          this.currentData.materials || []);

        document.getElementById('tableBody').innerHTML = dataArray.map(item => `
            <tr>
                ${headers.map(header => `<td>${this.formatCellValue(item[header])}</td>`).join('')}
                <td class="actions">
                    ${this.options.showEdit ? `
                        <button class="btn btn-sm btn-outline-primary" onclick="crudUI.showEditModal('${item.id}')">
                            <i class="icon-edit"></i>
                        </button>
                    ` : ''}
                    ${this.options.showDelete ? `
                        <button class="btn btn-sm btn-outline-danger" onclick="crudUI.confirmDelete('${item.id}')">
                            <i class="icon-delete"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }

    /**
     * Get table headers from data structure
     */
    getTableHeaders(item) {
        const excludeFields = ['created_at', 'updated_at', 'created_by', 'updated_by'];
        return Object.keys(item).filter(key => !excludeFields.includes(key));
    }

    /**
     * Format header text
     */
    formatHeader(header) {
        return header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Format cell value for display
     */
    formatCellValue(value) {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
            // Format date
            return new Date(value).toLocaleDateString();
        }
        return value;
    }

    /**
     * Format module name for display
     */
    formatModuleName(module) {
        const moduleNames = {
            'stock/wip': 'WIP Stock',
            'stock/finished-goods': 'Finished Goods',
            'production': 'Production',
            'qc': 'Quality Control',
            'warehouse': 'Warehouse'
        };
        return moduleNames[module] || module.replace(/[/_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Show create modal
     */
    showCreateModal() {
        document.getElementById('modalTitle').textContent = `Add New ${this.formatModuleName(this.currentModule)}`;
        this.createFormFields();
        this.showModal();
    }

    /**
     * Show edit modal
     */
    async showEditModal(id) {
        try {
            const result = await this.crud.getById(this.currentModule, id);
            document.getElementById('modalTitle').textContent = `Edit ${this.formatModuleName(this.currentModule)}`;
            this.createFormFields(result.data);
            this.showModal();
        } catch (error) {
            this.showError('Failed to load item: ' + error.message);
        }
    }

    /**
     * Create form fields dynamically
     */
    createFormFields(data = {}) {
        const formFields = document.getElementById('formFields');
        const excludeFields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by'];
        
        // Get field structure from current data or create default fields
        let fields = {};
        if (this.currentData && this.currentData.length > 0) {
            const firstItem = Array.isArray(this.currentData) ? this.currentData[0] : 
                             (this.currentData.wip_records || this.currentData.finished_goods || 
                              this.currentData.materials || [])[0];
            if (firstItem) {
                Object.keys(firstItem).forEach(key => {
                    if (!excludeFields.includes(key)) {
                        fields[key] = firstItem[key];
                    }
                });
            }
        }

        // Default fields for specific modules
        if (Object.keys(fields).length === 0) {
            fields = this.getDefaultFields();
        }

        formFields.innerHTML = Object.keys(fields).map(fieldName => {
            const fieldType = this.getFieldType(fieldName, fields[fieldName]);
            const fieldValue = data[fieldName] || '';
            
            return `
                <div class="form-group">
                    <label for="${fieldName}">${this.formatHeader(fieldName)}:</label>
                    ${this.createFormField(fieldName, fieldType, fieldValue)}
                </div>
            `;
        }).join('');
    }

    /**
     * Get default fields for module
     */
    getDefaultFields() {
        const moduleFields = {
            'stock/wip': {
                partnumber: '', lotnumber: '', quantity: 0, operator: '', 
                pic_qc: '', pic_group_produksi: '', remarks: ''
            },
            'stock/finished-goods': {
                partnumber: '', quantity: 0, location: '', batch_number: '', remarks: ''
            }
        };
        return moduleFields[this.currentModule] || { name: '', description: '', status: 'active' };
    }

    /**
     * Determine field type
     */
    getFieldType(fieldName, value) {
        if (fieldName.includes('date')) return 'date';
        if (fieldName.includes('email')) return 'email';
        if (fieldName.includes('phone')) return 'tel';
        if (fieldName.includes('quantity') || fieldName.includes('amount')) return 'number';
        if (fieldName.includes('status')) return 'select';
        if (fieldName.includes('notes') || fieldName.includes('remarks') || fieldName.includes('description')) return 'textarea';
        return 'text';
    }

    /**
     * Create form field HTML
     */
    createFormField(fieldName, fieldType, value) {
        switch (fieldType) {
            case 'textarea':
                return `<textarea id="${fieldName}" name="${fieldName}" class="form-control" rows="3">${value}</textarea>`;
            case 'select':
                return `
                    <select id="${fieldName}" name="${fieldName}" class="form-control">
                        <option value="active" ${value === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${value === 'inactive' ? 'selected' : ''}>Inactive</option>
                        <option value="pending" ${value === 'pending' ? 'selected' : ''}>Pending</option>
                    </select>
                `;
            default:
                return `<input type="${fieldType}" id="${fieldName}" name="${fieldName}" value="${value}" class="form-control" required>`;
        }
    }

    /**
     * Handle form submission
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            this.showLoading();
            
            const id = data.id;
            delete data.id;
            
            if (id) {
                await this.crud.update(this.currentModule, id, data);
                this.showSuccess('Item updated successfully');
            } else {
                await this.crud.create(this.currentModule, data);
                this.showSuccess('Item created successfully');
            }
            
            this.hideModal();
            this.loadData(this.currentPage);
            
        } catch (error) {
            this.showError('Failed to save: ' + error.message);
        }
    }

    /**
     * Confirm and delete item
     */
    async confirmDelete(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                await this.crud.delete(this.currentModule, id);
                this.showSuccess('Item deleted successfully');
                this.loadData(this.currentPage);
            } catch (error) {
                this.showError('Failed to delete: ' + error.message);
            }
        }
    }

    /**
     * Export data to CSV
     */
    exportData() {
        if (!this.currentData || this.currentData.length === 0) {
            this.showError('No data to export');
            return;
        }

        const dataArray = Array.isArray(this.currentData) ? this.currentData : 
                         (this.currentData.wip_records || this.currentData.finished_goods || 
                          this.currentData.materials || []);

        if (dataArray.length === 0) {
            this.showError('No data to export');
            return;
        }

        const csv = this.convertToCSV(dataArray);
        this.downloadCSV(csv, `${this.currentModule.replace(/[\/]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    }

    /**
     * Convert data to CSV format
     */
    convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');
        return csvContent;
    }

    /**
     * Download CSV file
     */
    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    /**
     * Perform search
     */
    performSearch() {
        const searchTerm = document.getElementById('searchInput').value;
        this.loadData(1, searchTerm);
    }

    /**
     * Change page
     */
    changePage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.loadData(page);
        }
    }

    /**
     * Update pagination controls
     */
    updatePagination() {
        const paginationInfo = document.getElementById('paginationInfo');
        const btnPrevPage = document.getElementById('btnPrevPage');
        const btnNextPage = document.getElementById('btnNextPage');
        
        if (paginationInfo) {
            paginationInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
        }
        
        if (btnPrevPage) {
            btnPrevPage.disabled = this.currentPage <= 1;
        }
        
        if (btnNextPage) {
            btnNextPage.disabled = this.currentPage >= this.totalPages;
        }
    }

    /**
     * Utility methods
     */
    showModal() {
        document.getElementById('crudModal').style.display = 'flex';
    }

    hideModal() {
        document.getElementById('crudModal').style.display = 'none';
    }

    showLoading() {
        // Implementation depends on your loading indicator
        console.log('Loading...');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Simple notification implementation
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 1000;
            padding: 10px 20px; border-radius: 4px; color: white;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
}

// Global instances
const crudManager = new CRUDManager();
const crudUI = new CRUDUIHelper(crudManager);

// Export for use in other files
window.CRUDManager = CRUDManager;
window.CRUDUIHelper = CRUDUIHelper;
window.crudManager = crudManager;
window.crudUI = crudUI;
