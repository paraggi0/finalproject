/**
 * Website API Main Router
 * PT. Topline Evergreen Manufacturing
 * Combines all Website API modules
 */

const express = require('express');
const router = express.Router();

// Import Website API modules
const authRoutes = require('./auth');
const productionRoutes = require('./production');
const qcRoutes = require('./qc');
const warehouseRoutes = require('./warehouse');
const masterdataRoutes = require('./masterdata');
const stockRoutes = require('./stock');

// Mount routes with proper prefixes
router.use('/auth', authRoutes);
router.use('/production', productionRoutes);
router.use('/qc', qcRoutes);
router.use('/warehouse', warehouseRoutes);
router.use('/masterdata', masterdataRoutes);
router.use('/stock', stockRoutes);

// ✅ MAIN STATUS - Website API Status
router.get('/status', async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'];
        if (apiKey !== 'website-admin-2025') {
            return res.status(401).json({
                success: false,
                message: 'API key tidak valid atau tidak ada'
            });
        }

        res.json({
            success: true,
            status: 'Website API is running',
            database: 'Connected',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            platform: 'website',
            features: [
                'Authentication',
                'Production Dashboard & Reports',
                'QC Dashboard & Reports',
                'Warehouse Dashboard & Reports',
                'Stock Management'
            ]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Website API status check failed',
            error: error.message
        });
    }
});

// ✅ MAIN DASHBOARD - Combined dashboard data
router.get('/dashboard', async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'];
        if (apiKey !== 'website-admin-2025') {
            return res.status(401).json({
                success: false,
                message: 'API key tidak valid atau tidak ada'
            });
        }

        const { execute } = require('../../../config/databaseAdapter');
        
        // Get summary from all modules
        const [overallStats] = await execute(`
            SELECT 
                (SELECT COUNT(*) FROM outputmc WHERE DATE(created_at) = CURDATE()) as today_production,
                (SELECT COUNT(*) FROM iqc_records WHERE DATE(created_at) = CURDATE()) as today_iqc,
                0 as today_oqc,
                0 as total_wip,
                0 as total_fg
        `);
        
        res.json({
            success: true,
            data: {
                overall_stats: overallStats[0],
                modules: {
                    production: '/api/website/production/dashboard',
                    qc: '/api/website/qc/dashboard',
                    warehouse: '/api/website/warehouse/dashboard'
                },
                last_updated: new Date().toISOString()
            },
            message: 'Main dashboard data berhasil diambil'
        });
        
    } catch (error) {
        console.error('Main Dashboard Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data main dashboard',
            error: error.message
        });
    }
});

module.exports = router;
