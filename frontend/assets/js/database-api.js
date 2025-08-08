/**
 * Database API Module for Frontend
 * PT. Topline Evergreen Manufacturing
 * Connects to Google Cloud SQL Database
 */

class DatabaseAPI {
    constructor() {
        this.baseUrl = 'http://localhost:3001/api'; // Backend API endpoint
        this.isConnected = false;
        this.connectionStatus = 'disconnected';
    }

    /**
     * Test database connection
     */
    async testConnection() {
        try {
            const response = await fetch(`${this.baseUrl}/test`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                this.isConnected = true;
                this.connectionStatus = 'connected';
                console.log('✅ Database connection successful:', result);
                return { success: true, data: result };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            this.isConnected = false;
            this.connectionStatus = 'error';
            console.error('❌ Database connection failed:', error);
            return { success: false, error: error.message };
        }
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
}

// Create global instance
window.dbAPI = new DatabaseAPI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseAPI;
}
