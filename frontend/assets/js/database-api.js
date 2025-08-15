/**
 * Database API Module for Frontend
 * PT. Topline Evergreen Manufacturing
 * Connects to Google Cloud SQL Database
 */

class DatabaseAPI {
    constructor() {
        // ⚡ STATIC IP CONFIGURATION untuk Local Network Testing
        this.staticIpUrl = 'http://192.168.1.184:3001/api';
        this.fallbackUrl = 'http://192.168.1.184:3001/api'; 
        this.localhostUrl = 'http://localhost:3001/api';
        
        this.baseUrl = this.getBaseUrl();
        this.isConnected = false;
        this.connectionStatus = 'disconnected';
    }

    /**
     * Get optimal base URL dengan auto-detection dan fallback
     */
    getBaseUrl() {
        // Prioritas: Static IP > Fallback IP > Localhost
        if (window.location.hostname === '192.168.1.184') {
            console.log('🌐 Using Static IP configuration');
            return this.staticIpUrl;
        } else if (window.location.hostname === '192.168.1.184') {
            console.log('🌐 Using Static IP configuration (fallback)');
            return this.fallbackUrl;
        } else {
            console.log('🏠 Using localhost configuration');
            return this.localhostUrl;
        }
    }

    /**
     * Test connection dengan multiple URLs
     */
    async testConnectionWithFallback() {
        const urls = [this.staticIpUrl, this.fallbackUrl, this.localhostUrl];
        
        for (const url of urls) {
            try {
                console.log(`🔄 Testing connection to: ${url}`);
                const response = await fetch(`${url}/health`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 5000
                });

                if (response.ok) {
                    const result = await response.json();
                    this.baseUrl = url;
                    this.isConnected = true;
                    this.connectionStatus = 'connected';
                    console.log(`✅ Connected successfully to: ${url}`);
                    return { success: true, data: result, url: url };
                }
            } catch (error) {
                console.log(`❌ Failed to connect to: ${url} - ${error.message}`);
            }
        }
        
        this.isConnected = false;
        this.connectionStatus = 'error';
        console.error('❌ All connection attempts failed');
        return { success: false, error: 'No available server connection' };
    }

    /**
     * Test database connection (legacy method - maintained for compatibility)
     */
    async testConnection() {
        return await this.testConnectionWithFallback();
    }

    /**
     * Get all products
     */
    async getProducts() {
        try {
            const response = await fetch(`${this.baseUrl}/products`);
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching products:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get all machines
     */
    async getMachines() {
        try {
            const response = await fetch(`${this.baseUrl}/machines`);
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching machines:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get all operators
     */
    async getOperators() {
        try {
            const response = await fetch(`${this.baseUrl}/operators`);
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching operators:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get machine outputs (MC Status data)
     */
    async getMachineOutputs() {
        try {
            const response = await fetch(`${this.baseUrl}/machine-outputs`);
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching machine outputs:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create new machine output record
     */
    async createMachineOutput(outputData) {
        try {
            const response = await fetch(`${this.baseUrl}/machine-outputs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(outputData)
            });
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error creating machine output:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get WIP inventory
     */
    async getWipInventory() {
        try {
            const response = await fetch(`${this.baseUrl}/wip-inventory`);
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching WIP inventory:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create WIP inventory record
     */
    async createWipInventory(wipData) {
        try {
            const response = await fetch(`${this.baseUrl}/wip-inventory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(wipData)
            });
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error creating WIP inventory:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get WIP second process
     */
    async getWipSecondProcess() {
        try {
            const response = await fetch(`${this.baseUrl}/wip-second-process`);
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching WIP second process:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create WIP second process record
     */
    async createWipSecondProcess(processData) {
        try {
            const response = await fetch(`${this.baseUrl}/wip-second-process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(processData)
            });
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error creating WIP second process:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get QC transfers
     */
    async getQcTransfers() {
        try {
            const response = await fetch(`${this.baseUrl}/qc-transfers`);
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching QC transfers:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create QC transfer record
     */
    async createQcTransfer(qcData) {
        try {
            const response = await fetch(`${this.baseUrl}/qc-transfers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(qcData)
            });
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error creating QC transfer:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get production summary for dashboard
     */
    async getProductionSummary() {
        try {
            const response = await fetch(`${this.baseUrl}/production-summary`);
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching production summary:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get system alerts
     */
    async getSystemAlerts() {
        try {
            const response = await fetch(`${this.baseUrl}/alerts`);
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching system alerts:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Fallback to localStorage if API is not available
     */
    async fallbackToLocalStorage(key, defaultData = []) {
        console.warn(`🔄 Using localStorage fallback for ${key}`);
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultData;
    }

    /**
     * Universal data fetcher with localStorage fallback
     */
    async getData(endpoint, localStorageKey, defaultData = []) {
        if (this.isConnected) {
            const result = await this[`get${endpoint}`]();
            if (result.success) {
                return result.data;
            }
        }
        
        // Fallback to localStorage
        return await this.fallbackToLocalStorage(localStorageKey, defaultData);
    }

    // ========================================
    // NEW WEBSITE API INTEGRATION
    // ========================================

    /**
     * Get BOM data from website API
     */
    async getBOMFromWebsiteAPI(page = 1, limit = 50) {
        try {
            const response = await fetch(`${this.baseUrl}/website/masterdata/bom?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'website-admin-2025'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    data: data.data.bom_records,
                    pagination: data.data.pagination,
                    message: data.message
                };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ BOM API Error:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Get Users from website API
     */
    async getUsersFromWebsiteAPI(page = 1, limit = 50) {
        try {
            const response = await fetch(`${this.baseUrl}/website/masterdata/users?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'website-admin-2025'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    data: data.data.users,
                    pagination: data.data.pagination,
                    message: data.message
                };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Users API Error:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Get Stock Dashboard from website API
     */
    async getStockDashboard() {
        try {
            const response = await fetch(`${this.baseUrl}/website/stock/summary`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'website-admin-2025'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    data: data.data,
                    message: data.message
                };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Stock Dashboard API Error:', error);
            return {
                success: false,
                error: error.message,
                data: {}
            };
        }
    }

    /**
     * Get WIP Inventory from website API
     */
    async getWIPInventory(page = 1, limit = 50) {
        try {
            const response = await fetch(`${this.baseUrl}/website/stock/wip?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'website-admin-2025'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    data: data.data.wip_records,
                    pagination: data.data.pagination,
                    message: data.message
                };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ WIP Inventory API Error:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Get Finished Goods from website API
     */
    async getFinishedGoods(page = 1, limit = 50) {
        try {
            const response = await fetch(`${this.baseUrl}/website/stock/finished-goods?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'website-admin-2025'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    data: data.data.finished_goods,
                    pagination: data.data.pagination,
                    message: data.message
                };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Finished Goods API Error:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Create new BOM entry
     */
    async createBOM(bomData) {
        try {
            const response = await fetch(`${this.baseUrl}/website/masterdata/bom`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'website-admin-2025'
                },
                body: JSON.stringify(bomData)
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    data: data.data,
                    message: data.message
                };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Create BOM API Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update BOM entry
     */
    async updateBOM(bomId, bomData) {
        try {
            const response = await fetch(`${this.baseUrl}/website/masterdata/bom/${bomId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'website-admin-2025'
                },
                body: JSON.stringify(bomData)
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    data: data.data,
                    message: data.message
                };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Update BOM API Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete BOM entry
     */
    async deleteBOM(bomId) {
        try {
            const response = await fetch(`${this.baseUrl}/website/masterdata/bom/${bomId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'website-admin-2025'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    message: data.message
                };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Delete BOM API Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Create global instance
window.dbAPI = new DatabaseAPI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseAPI;
}
