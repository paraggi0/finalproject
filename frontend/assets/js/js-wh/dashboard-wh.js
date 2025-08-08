/* ================================================
   DASHBOARD WAREHOUSE JAVASCRIPT
   PT. TOPLINE EVERGREEN MANUFACTURING
   ================================================ */

// Global variables
let currentUser = null;
let dashboardData = {};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard Warehouse loaded successfully');
    
    // Check authentication
    checkAuthentication();
    
    // Initialize dashboard
    initializeDashboard();
    
    // Load real-time data
    loadDashboardData();
    
    // Set up real-time updates
    setupRealTimeUpdates();
});

/**
 * Check if user is authenticated and has warehouse permissions
 */
function checkAuthentication() {
    const userData = localStorage.getItem('userData');
    const authToken = localStorage.getItem('authToken');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (!userData || !authToken || isAuthenticated !== 'true') {
        alert('Sesi anda telah berakhir. Silakan login kembali.');
        window.location.href = '../login.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(userData);
        
        // Check if user has warehouse access
        const allowedRoles = ['admin', 'admin-warehouse', 'warehouse'];
        if (!allowedRoles.includes(currentUser.role)) {
            alert('Anda tidak memiliki akses ke modul warehouse.');
            window.location.href = '../login.html';
            return;
        }
        
        console.log('User authenticated:', currentUser.name);
        
        // Update header with user info
        updateUserInfo();
        
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.clear();
        window.location.href = '../login.html';
    }
}

/**
 * Update user information in header
 */
function updateUserInfo() {
    const authSection = document.querySelector('.auth-section');
    if (authSection && currentUser) {
        authSection.innerHTML = `
            <div class="user-info">
                <span class="user-name">👤 ${currentUser.name}</span>
                <span class="user-role">${currentUser.department}</span>
            </div>
            <div class="header-actions">
                <button class="btn-secondary" onclick="openMobileView()">📱 Mobile View</button>
                <button class="btn-logout" onclick="logout()">Logout</button>
            </div>
        `;
    }
}

/**
 * Initialize dashboard components
 */
function initializeDashboard() {
    console.log('Initializing warehouse dashboard...');
    
    // Add click handlers for workflow cards
    setupWorkflowNavigation();
    
    // Initialize mobile integration
    setupMobileIntegration();
    
    // Setup quick actions
    setupQuickActions();
}

/**
 * Setup workflow navigation
 */
function setupWorkflowNavigation() {
    const workflowCards = document.querySelectorAll('.workflow-card');
    
    workflowCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        });
    });
}

/**
 * Navigation functions for workflow modules
 */
function navigateToModule(module) {
    console.log('Navigating to module:', module);
    
    // Store navigation context
    localStorage.setItem('warehouseNavigation', JSON.stringify({
        source: 'dashboard',
        timestamp: new Date().toISOString(),
        user: currentUser.username
    }));
    
    // Navigate to module
    window.location.href = module;
}

/**
 * Open module in current window
 */
function openModule(module) {
    navigateToModule(module);
}

/**
 * Create new delivery checklist
 */
function createNewChecklist() {
    console.log('Creating new delivery checklist...');
    
    // Store action context
    localStorage.setItem('warehouseAction', JSON.stringify({
        action: 'create_checklist',
        timestamp: new Date().toISOString()
    }));
    
    // Navigate to delivery checklist with create mode
    window.location.href = 'dc.html?action=create';
}

/**
 * Create new delivery order
 */
function createNewDO() {
    console.log('Creating new delivery order...');
    
    localStorage.setItem('warehouseAction', JSON.stringify({
        action: 'create_do',
        timestamp: new Date().toISOString()
    }));
    
    window.location.href = 'do.html?action=create';
}

/**
 * View inventory report
 */
function viewInventoryReport() {
    console.log('Opening inventory report...');
    
    localStorage.setItem('warehouseAction', JSON.stringify({
        action: 'view_inventory_report',
        timestamp: new Date().toISOString()
    }));
    
    window.location.href = 'invfg.html?view=report';
}

/**
 * View return history
 */
function viewReturnHistory() {
    console.log('Opening return history...');
    
    localStorage.setItem('warehouseAction', JSON.stringify({
        action: 'view_return_history',
        timestamp: new Date().toISOString()
    }));
    
    window.location.href = 'return-wh.html?view=history';
}

/**
 * View reports by type
 */
function viewReport(type) {
    console.log('Opening report:', type);
    
    const reportUrls = {
        'inventory': 'invfg.html?view=report',
        'delivery': 'dc.html?view=report',
        'do': 'do.html?view=report',
        'return': 'return-wh.html?view=report'
    };
    
    if (reportUrls[type]) {
        localStorage.setItem('warehouseAction', JSON.stringify({
            action: `view_${type}_report`,
            timestamp: new Date().toISOString()
        }));
        
        window.location.href = reportUrls[type];
    }
}

/**
 * Setup mobile integration
 */
function setupMobileIntegration() {
    console.log('Setting up mobile integration...');
    
    // Check if mobile app is available
    checkMobileAppAvailability();
}

/**
 * Check mobile app availability
 */
function checkMobileAppAvailability() {
    // Simulate checking mobile app connection
    setTimeout(() => {
        const mobileStatus = document.querySelector('.mobile-status');
        if (mobileStatus) {
            mobileStatus.innerHTML = `
                <div class="status-indicator status-active">
                    <span class="status-dot"></span>
                    Mobile App Connected
                </div>
            `;
        }
    }, 1000);
}

/**
 * Open mobile view
 */
function openMobileView() {
    console.log('Opening mobile view...');
    
    // Open mobile app in new window/tab
    const mobileWindow = window.open('./../../mobile-wh.html', 'MobileWH', 'width=400,height=700,resizable=yes,scrollbars=yes');
    
    if (mobileWindow) {
        // Pass user data to mobile window
        mobileWindow.addEventListener('load', function() {
            if (currentUser) {
                mobileWindow.localStorage.setItem('userData', JSON.stringify(currentUser));
            }
        });
    } else {
        // Fallback: open in same window
        window.location.href = './../../mobile-wh.html';
    }
}

/**
 * Close mobile view
 */
function closeMobileView() {
    const mobileOverlay = document.querySelector('.mobile-overlay');
    if (mobileOverlay) {
        mobileOverlay.remove();
    }
}

/**
 * Handle mobile actions
 */
function mobileAction(action) {
    console.log('Mobile action:', action);
    
    const actions = {
        'scan_qr': 'QR Code scanner opened',
        'quick_update': 'Quick update mode activated',
        'inventory_check': 'Inventory check started',
        'delivery_status': 'Delivery status checked'
    };
    
    alert(`📱 ${actions[action] || 'Action performed'}`);
    closeMobileView();
}

/**
 * Download APK
 */
function downloadAPK() {
    console.log('Downloading APK...');
    alert('📱 APK download akan dimulai...\n\nNote: Ini adalah simulasi. APK belum tersedia.');
}

/**
 * Setup quick actions
 */
function setupQuickActions() {
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    navigateToModule('invfg.html');
                    break;
                case '2':
                    e.preventDefault();
                    navigateToModule('dc.html');
                    break;
                case '3':
                    e.preventDefault();
                    navigateToModule('do.html');
                    break;
                case '4':
                    e.preventDefault();
                    navigateToModule('return-wh.html');
                    break;
                case 'm':
                    e.preventDefault();
                    openMobileView();
                    break;
            }
        }
    });
}

/**
 * Load dashboard data
 */
async function loadDashboardData() {
    try {
        console.log('Loading dashboard data...');
        
        // Simulate API call to get dashboard statistics
        const data = await fetchDashboardStats();
        
        // Update dashboard with real data
        updateDashboardStats(data);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

/**
 * Fetch dashboard statistics
 */
async function fetchDashboardStats() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data
    return {
        totalItems: 156,
        pendingDeliveries: 23,
        returnsProcessing: 8,
        criticalStock: 2,
        todayUpdates: 34,
        activeUsers: 12
    };
}

/**
 * Update dashboard statistics
 */
function updateDashboardStats(data) {
    // Update stats in the dashboard
    const statElements = {
        totalItems: document.querySelector('[data-stat="total-items"]'),
        pendingDeliveries: document.querySelector('[data-stat="pending-deliveries"]'),
        returnsProcessing: document.querySelector('[data-stat="returns-processing"]'),
        criticalStock: document.querySelector('[data-stat="critical-stock"]')
    };
    
    // Update each stat if element exists
    Object.keys(statElements).forEach(key => {
        const element = statElements[key];
        if (element && data[key] !== undefined) {
            element.textContent = data[key];
        }
    });
    
    console.log('Dashboard stats updated');
}

/**
 * Setup real-time updates
 */
function setupRealTimeUpdates() {
    // Simulate real-time data updates every 30 seconds
    setInterval(() => {
        loadDashboardData();
    }, 30000);
    
    // Update real-time indicator
    const indicator = document.querySelector('.realtime-indicator');
    if (indicator) {
        indicator.style.display = 'flex';
    }
}

/**
 * Logout function
 */
function logout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        // Clear authentication data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('warehouseNavigation');
        localStorage.removeItem('warehouseAction');
        
        // Redirect to login
        window.location.href = '../login.html';
    }
}

/**
 * Emergency functions
 */
function handleEmergency() {
    alert('🚨 Mode darurat diaktifkan!\nMenghubungi supervisor...');
}

function quickHelp() {
    const helpContent = `
📋 BANTUAN CEPAT - WAREHOUSE DASHBOARD

🔤 Keyboard Shortcuts:
• Ctrl+1 = Inventory FG
• Ctrl+2 = Delivery Checklist  
• Ctrl+3 = Delivery Order
• Ctrl+4 = Return WH
• Ctrl+M = Mobile View

📱 Mobile Integration:
• Scan QR codes untuk update cepat
• Real-time sync dengan sistem utama
• Offline mode untuk area terbatas

🆘 Bantuan:
• Hubungi IT Support: ext.101
• Emergency: ext.911
    `;
    
    alert(helpContent);
}

// Make functions globally available
window.navigateToModule = navigateToModule;
window.openModule = openModule;
window.viewReport = viewReport;
window.createNewChecklist = createNewChecklist;
window.createNewDO = createNewDO;
window.viewInventoryReport = viewInventoryReport;
window.viewReturnHistory = viewReturnHistory;
window.openMobileView = openMobileView;
window.closeMobileView = closeMobileView;
window.mobileAction = mobileAction;
window.downloadAPK = downloadAPK;
window.logout = logout;
window.handleEmergency = handleEmergency;
window.quickHelp = quickHelp;

console.log('Dashboard Warehouse JavaScript initialized successfully');
