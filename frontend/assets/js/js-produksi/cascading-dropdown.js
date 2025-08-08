// Universal Cascading Dropdown Utility - PT. Topline Evergreen Manufacturing
// Enhanced dropdown system with dynamic data loading and caching

class CascadingDropdown {
    constructor(config) {
        this.config = {
            baseUrl: 'http://localhost:3001/api/website',
            cacheDuration: 30000, // 30 seconds cache
            ...config
        };
        this.cache = new Map();
        this.loadingStates = new Set();
        this.dropdownChain = [];
    }

    /**
     * Initialize cascading dropdown system
     * @param {Array} chain - Array of dropdown configurations
     */
    async initializeChain(chain) {
        this.dropdownChain = chain;
        
        // Setup event listeners for each dropdown
        chain.forEach((dropdown, index) => {
            const element = document.getElementById(dropdown.id);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.handleDropdownChange(e, index);
                });
            }
        });

        // Load initial data for first dropdown
        if (chain.length > 0) {
            await this.loadDropdownData(0);
        }
    }

    /**
     * Handle dropdown change event
     * @param {Event} event - Change event
     * @param {number} index - Index in dropdown chain
     */
    async handleDropdownChange(event, index) {
        const selectedValue = event.target.value;
        
        // Clear and disable downstream dropdowns
        this.clearDownstreamDropdowns(index + 1);
        
        // Load data for next dropdown if value is selected
        if (selectedValue && index + 1 < this.dropdownChain.length) {
            await this.loadDropdownData(index + 1, selectedValue);
        }

        // Trigger callback if defined
        const dropdown = this.dropdownChain[index];
        if (dropdown.onChange) {
            dropdown.onChange(selectedValue, this.getSelectedValues());
        }
    }

    /**
     * Load data for specific dropdown
     * @param {number} index - Dropdown index
     * @param {string} parentValue - Parent dropdown value
     */
    async loadDropdownData(index, parentValue = null) {
        const dropdown = this.dropdownChain[index];
        const element = document.getElementById(dropdown.id);
        
        if (!element) return;

        // Show loading state
        this.setLoadingState(dropdown.id, true);
        
        try {
            let url = `${this.config.baseUrl}/${dropdown.endpoint}`;
            if (parentValue && dropdown.parentParam) {
                url += `?${dropdown.parentParam}=${encodeURIComponent(parentValue)}`;
            }

            // Check cache first
            const cacheKey = `${dropdown.id}_${parentValue || 'initial'}`;
            const cachedData = this.getFromCache(cacheKey);
            
            let data;
            if (cachedData) {
                data = cachedData;
            } else {
                const response = await fetch(url, {
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const result = await response.json();
                data = result.success ? result.data : [];
                
                // Cache the data
                this.setCache(cacheKey, data);
            }

            // Populate dropdown
            this.populateDropdown(element, data, dropdown);
            
        } catch (error) {
            console.error(`Error loading ${dropdown.label}:`, error);
            this.showError(element, `Failed to load ${dropdown.label}`);
        } finally {
            this.setLoadingState(dropdown.id, false);
        }
    }

    /**
     * Populate dropdown with data
     * @param {HTMLElement} element - Dropdown element
     * @param {Array} data - Data array
     * @param {Object} dropdown - Dropdown configuration
     */
    populateDropdown(element, data, dropdown) {
        // Clear existing options except placeholder
        element.innerHTML = `<option value="">${dropdown.placeholder || `Select ${dropdown.label}`}</option>`;
        
        // Add data options
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[dropdown.valueField] || item.value || item.id;
            option.textContent = item[dropdown.textField] || item.text || item.name || item[dropdown.valueField];
            
            // Add data attributes if specified
            if (dropdown.dataAttributes) {
                dropdown.dataAttributes.forEach(attr => {
                    if (item[attr]) {
                        option.setAttribute(`data-${attr}`, item[attr]);
                    }
                });
            }
            
            element.appendChild(option);
        });

        // Enable dropdown
        element.disabled = false;
    }

    /**
     * Clear downstream dropdowns
     * @param {number} fromIndex - Starting index to clear
     */
    clearDownstreamDropdowns(fromIndex) {
        for (let i = fromIndex; i < this.dropdownChain.length; i++) {
            const dropdown = this.dropdownChain[i];
            const element = document.getElementById(dropdown.id);
            
            if (element) {
                element.innerHTML = `<option value="">${dropdown.placeholder || `Select ${dropdown.label}`}</option>`;
                element.disabled = true;
            }
        }
    }

    /**
     * Get all selected values
     * @returns {Object} Selected values object
     */
    getSelectedValues() {
        const values = {};
        this.dropdownChain.forEach(dropdown => {
            const element = document.getElementById(dropdown.id);
            if (element) {
                values[dropdown.id] = element.value;
                
                // Include data attributes
                const selectedOption = element.options[element.selectedIndex];
                if (selectedOption && dropdown.dataAttributes) {
                    dropdown.dataAttributes.forEach(attr => {
                        const dataValue = selectedOption.getAttribute(`data-${attr}`);
                        if (dataValue) {
                            values[`${dropdown.id}_${attr}`] = dataValue;
                        }
                    });
                }
            }
        });
        return values;
    }

    /**
     * Set loading state for dropdown
     * @param {string} dropdownId - Dropdown ID
     * @param {boolean} isLoading - Loading state
     */
    setLoadingState(dropdownId, isLoading) {
        const element = document.getElementById(dropdownId);
        if (!element) return;

        if (isLoading) {
            element.disabled = true;
            element.innerHTML = '<option value="">Loading...</option>';
            this.loadingStates.add(dropdownId);
        } else {
            this.loadingStates.delete(dropdownId);
        }
    }

    /**
     * Show error state for dropdown
     * @param {HTMLElement} element - Dropdown element
     * @param {string} message - Error message
     */
    showError(element, message) {
        element.innerHTML = `<option value="">Error: ${message}</option>`;
        element.disabled = true;
    }

    /**
     * Cache management
     */
    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp < this.config.cacheDuration)) {
            return cached.data;
        }
        return null;
    }

    clearCache() {
        this.cache.clear();
    }

    /**
     * Reset all dropdowns to initial state
     */
    reset() {
        this.clearDownstreamDropdowns(1);
        const firstDropdown = document.getElementById(this.dropdownChain[0].id);
        if (firstDropdown) {
            firstDropdown.selectedIndex = 0;
        }
    }

    /**
     * Set values programmatically
     * @param {Object} values - Values to set
     */
    async setValues(values) {
        for (let i = 0; i < this.dropdownChain.length; i++) {
            const dropdown = this.dropdownChain[i];
            const value = values[dropdown.id];
            
            if (value) {
                const element = document.getElementById(dropdown.id);
                if (element) {
                    element.value = value;
                    
                    // Trigger change event to load next dropdown
                    if (i + 1 < this.dropdownChain.length) {
                        await this.loadDropdownData(i + 1, value);
                    }
                }
            }
        }
    }
}

// Predefined configurations for common dropdown chains
const DropdownConfigurations = {
    // Customer → Description → Parts chain
    customerDescriptionParts: [
        {
            id: 'customer',
            label: 'Customer',
            placeholder: 'Select Customer',
            endpoint: 'customers',
            valueField: 'customer',
            textField: 'customer'
        },
        {
            id: 'description',
            label: 'Description',
            placeholder: 'Select Description',
            endpoint: 'descriptions',
            parentParam: 'customer',
            valueField: 'description',
            textField: 'description'
        },
        {
            id: 'partnumber',
            label: 'Part Number',
            placeholder: 'Select Part Number',
            endpoint: 'parts',
            parentParam: 'description',
            valueField: 'partnumber',
            textField: 'partnumber',
            dataAttributes: ['model', 'category']
        }
    ],

    // Machine → Process → Operator chain
    machineProcessOperator: [
        {
            id: 'machine',
            label: 'Machine',
            placeholder: 'Select Machine',
            endpoint: 'machines',
            valueField: 'machine_id',
            textField: 'machine_name'
        },
        {
            id: 'process',
            label: 'Process',
            placeholder: 'Select Process',
            endpoint: 'processes',
            parentParam: 'machine',
            valueField: 'process_id',
            textField: 'process_name'
        },
        {
            id: 'operator',
            label: 'Operator',
            placeholder: 'Select Operator',
            endpoint: 'operators',
            parentParam: 'machine',
            valueField: 'operator_id',
            textField: 'operator_name'
        }
    ]
};

// Export to global scope
window.CascadingDropdown = CascadingDropdown;
window.DropdownConfigurations = DropdownConfigurations;
