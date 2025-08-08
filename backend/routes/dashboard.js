/**
 * Dashboard Routes - Dashboard Management untuk semua departement
 * PT. Topline Evergreen Manufacturing
 */

const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboardService');
const inventoryService = require('../services/inventoryService');

// Authentication middleware
const auth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKeys = ['production-api-2025', 'mobile-android-2025', 'website-admin-2025'];
    
    if (!apiKey || !validApiKeys.includes(apiKey)) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Valid API key required'
        });
    }
    next();
};

router.use(auth);

// =============================================================================
// INDEX PAGE DASHBOARD - Menampilkan semua data overview
// =============================================================================

/**
 * GET /api/dashboard/index
 * Dashboard untuk halaman index - menampilkan semua overview data
 */
router.get('/index', async (req, res) => {
    try {
        const dashboardData = await inventoryService.getDashboardData();
        
        res.json({
            success: true,
            data: dashboardData.data,
            last_updated: dashboardData.last_updated,
            message: 'Index dashboard data retrieved successfully'
        });
    } catch (error) {
        console.error('Index Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch index dashboard data',
            error: error.message
        });
    }
});

// =============================================================================
// DEPARTMENT SPECIFIC DASHBOARDS
// =============================================================================

/**
 * GET /api/dashboard/production
 * Dashboard untuk departement produksi
 */
router.get('/production', async (req, res) => {
    try {
        const productionData = await dashboardService.getProductionDashboard();
        
        res.json({
            success: true,
            data: productionData.data,
            summary: productionData.summary,
            message: 'Production dashboard data retrieved successfully'
        });
    } catch (error) {
        console.error('Production Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch production dashboard data',
            error: error.message
        });
    }
});

/**
 * GET /api/dashboard/warehouse
 * Dashboard untuk departement warehouse
 */
router.get('/warehouse', async (req, res) => {
    try {
        const warehouseData = await dashboardService.getWarehouseDashboard();
        
        res.json({
            success: true,
            data: warehouseData.data,
            message: 'Warehouse dashboard data retrieved successfully'
        });
    } catch (error) {
        console.error('Warehouse Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch warehouse dashboard data',
            error: error.message
        });
    }
});

/**
 * GET /api/dashboard/quality
 * Dashboard untuk departement quality control
 */
router.get('/quality', async (req, res) => {
    try {
        const qualityData = await dashboardService.getQualityDashboard();
        
        res.json({
            success: true,
            data: qualityData.data,
            summary: qualityData.summary,
            message: 'Quality dashboard data retrieved successfully'
        });
    } catch (error) {
        console.error('Quality Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quality dashboard data',
            error: error.message
        });
    }
});

/**
 * GET /api/dashboard/planning
 * Dashboard untuk departement planning
 */
router.get('/planning', async (req, res) => {
    try {
        const planningData = await dashboardService.getPlanningDashboard();
        
        res.json({
            success: true,
            data: planningData.data,
            summary: planningData.summary,
            message: 'Planning dashboard data retrieved successfully'
        });
    } catch (error) {
        console.error('Planning Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch planning dashboard data',
            error: error.message
        });
    }
});

/**
 * GET /api/dashboard/management
 * Dashboard untuk management - overview semua departement
 */
router.get('/management', async (req, res) => {
    try {
        const managementData = await dashboardService.getManagementDashboard();
        
        res.json({
            success: true,
            data: managementData.data,
            summary: managementData.summary,
            last_updated: managementData.last_updated,
            message: 'Management dashboard data retrieved successfully'
        });
    } catch (error) {
        console.error('Management Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch management dashboard data',
            error: error.message
        });
    }
});

// =============================================================================
// REAL-TIME STOCK DATA
// =============================================================================

/**
 * GET /api/dashboard/stock/wip
 * Real-time WIP Stock data
 */
router.get('/stock/wip', async (req, res) => {
    try {
        const wipData = await inventoryService.getWIPStock();
        
        res.json({
            success: true,
            data: wipData.data,
            summary: wipData.summary,
            message: 'WIP stock data retrieved successfully'
        });
    } catch (error) {
        console.error('WIP Stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch WIP stock data',
            error: error.message
        });
    }
});

/**
 * GET /api/dashboard/stock/fg
 * Real-time Finished Goods Stock data
 */
router.get('/stock/fg', async (req, res) => {
    try {
        const fgData = await inventoryService.getFGStock();
        
        res.json({
            success: true,
            data: fgData.data,
            summary: fgData.summary,
            message: 'FG stock data retrieved successfully'
        });
    } catch (error) {
        console.error('FG Stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch FG stock data',
            error: error.message
        });
    }
});

/**
 * GET /api/dashboard/stock/material
 * Real-time Material & Component Stock data
 */
router.get('/stock/material', async (req, res) => {
    try {
        const materialData = await inventoryService.getMaterialComponentStock();
        
        res.json({
            success: true,
            data: materialData.data,
            summary: materialData.summary,
            message: 'Material & component stock data retrieved successfully'
        });
    } catch (error) {
        console.error('Material Stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch material stock data',
            error: error.message
        });
    }
});

/**
 * GET /api/dashboard/machine/status
 * Real-time Machine Status
 */
router.get('/machine/status', async (req, res) => {
    try {
        const machineData = await inventoryService.getMachineStatus();
        
        res.json({
            success: true,
            data: machineData.data,
            summary: machineData.summary,
            message: 'Machine status data retrieved successfully'
        });
    } catch (error) {
        console.error('Machine Status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch machine status data',
            error: error.message
        });
    }
});

/**
 * GET /api/dashboard/schedule/delivery
 * Schedule delivery untuk material & component
 */
router.get('/schedule/delivery', async (req, res) => {
    try {
        const scheduleData = await inventoryService.getScheduleDelivery();
        
        res.json({
            success: true,
            data: scheduleData.data,
            summary: scheduleData.summary,
            message: 'Schedule delivery data retrieved successfully'
        });
    } catch (error) {
        console.error('Schedule Delivery error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch schedule delivery data',
            error: error.message
        });
    }
});

// =============================================================================
// DROPDOWN DATA untuk FRONTEND
// =============================================================================

/**
 * GET /api/dashboard/dropdown/customers
 * Get unique customers untuk dropdown
 */
router.get('/dropdown/customers', async (req, res) => {
    try {
        const [customers] = await pool.execute(`
            SELECT DISTINCT customer 
            FROM billofmaterial 
            WHERE customer IS NOT NULL AND customer != ''
            ORDER BY customer
        `);
        
        res.json({
            success: true,
            data: customers.map(c => c.customer),
            message: 'Customer list retrieved successfully'
        });
    } catch (error) {
        console.error('Customer dropdown error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customer list',
            error: error.message
        });
    }
});

/**
 * GET /api/dashboard/dropdown/partnumbers/:customer
 * Get partnumbers by customer untuk dropdown bertingkat
 */
router.get('/dropdown/partnumbers/:customer', async (req, res) => {
    try {
        const { customer } = req.params;
        
        const [partnumbers] = await pool.execute(`
            SELECT partnumber, model, description 
            FROM billofmaterial 
            WHERE customer = ?
            ORDER BY partnumber
        `, [customer]);
        
        res.json({
            success: true,
            data: partnumbers,
            message: 'Part numbers retrieved successfully'
        });
    } catch (error) {
        console.error('Part number dropdown error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch part numbers',
            error: error.message
        });
    }
});

/**
 * GET /api/dashboard/dropdown/machines
 * Get active machines untuk dropdown
 */
router.get('/dropdown/machines', async (req, res) => {
    try {
        const [machines] = await pool.execute(`
            SELECT DISTINCT machine_id, machine_name, department 
            FROM machine_status 
            WHERE machine_id IS NOT NULL
            ORDER BY department, machine_id
        `);
        
        res.json({
            success: true,
            data: machines,
            message: 'Machine list retrieved successfully'
        });
    } catch (error) {
        console.error('Machine dropdown error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch machine list',
            error: error.message
        });
    }
});

/**
 * GET /api/dashboard/dropdown/operators
 * Get active operators untuk dropdown
 */
router.get('/dropdown/operators', async (req, res) => {
    try {
        const [operators] = await pool.execute(`
            SELECT DISTINCT operator 
            FROM outputmc 
            WHERE operator IS NOT NULL AND operator != ''
            ORDER BY operator
        `);
        
        res.json({
            success: true,
            data: operators.map(o => o.operator),
            message: 'Operator list retrieved successfully'
        });
    } catch (error) {
        console.error('Operator dropdown error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch operator list',
            error: error.message
        });
    }
});

module.exports = router;
