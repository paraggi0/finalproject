/**
 * Android API Main Router
 * PT. Topline Evergreen Manufacturing
 * Combines all Android API modules
 */

const express = require('express');
const router = express.Router();

// Import Android API modules
const authRoutes = require('./auth');
const productionRoutes = require('./production');
const qcRoutes = require('./qc');
const stockRoutes = require('./stock');
const inventoryRoutes = require('./inventory');
const warehouseRoutes = require('./warehouse');

// Mount routes with proper prefixes
router.use('/auth', authRoutes);
router.use('/production', productionRoutes);
router.use('/qc', qcRoutes);
router.use('/stock', stockRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/warehouse', warehouseRoutes);

// ✅ MAIN STATUS - Android API Status
router.get('/status', async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'];
        if (apiKey !== 'android-topline-2025') {
            return res.status(401).json({
                success: false,
                message: 'API key tidak valid atau tidak ada'
            });
        }

        res.json({
            success: true,
            status: 'Android API is running',
            database: 'Connected',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            platform: 'android',
            features: [
                'Authentication',
                'Production Input (MC Output, MC Status, Transfer QC, WIP Second)',
                'Production Management (Machine Status, Output Recording, Batch Control)',
                'QC Input (Incoming, NG, Outgoing, Return)',
                'QC Management (IQC, OQC, Quality Issues)',
                'Stock Viewing (WIP, Finish Goods)',
                'Inventory Management (Stock Movements, Adjustments)',
                'Warehouse Management (Delivery Challans, Delivery Orders)'
            ]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Android API status check failed',
            error: error.message
        });
    }
});

// ✅ TABLES INFO - Database tables information
router.get('/tables-info', async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'];
        if (apiKey !== 'android-topline-2025') {
            return res.status(401).json({
                success: false,
                message: 'API key tidak valid atau tidak ada'
            });
        }

        res.json({
            success: true,
            data: {
                tables_used: {
                    authentication: ['userandroid'],
                    production: ['outputmc', 'machine_status', 'transferqc', 'wip_second_process'],
                    qc: ['iqc_records', 'ng_qc_records', 'oqc_records', 'rqc_records'],
                    stock: ['wip', 'finished_goods'],
                    master_data: ['billofmaterial']
                },
                total_tables: 12,
                description: 'Database tables used by Android API'
            },
            message: 'Table information retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get table information',
            error: error.message
        });
    }
});

// Handle direct login route (for backward compatibility)
router.post('/login', (req, res, next) => {
    // Forward to auth/login
    req.url = '/login';
    authRoutes(req, res, next);
});

module.exports = router;
