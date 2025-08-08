/**
 * Export Routes - Handle CSV Export untuk Website Admin
 * PT. Topline Evergreen Manufacturing
 */

const express = require('express');
const router = express.Router();
const exportService = require('../services/exportService');

// Admin Authentication middleware
const adminAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKeys = ['website-admin-2025', 'admin-topline-2025'];
    
    if (!apiKey || !validApiKeys.includes(apiKey)) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Valid admin API key required'
        });
    }
    next();
};

router.use(adminAuth);

// =============================================================================
// EXPORT LIST
// =============================================================================

/**
 * GET /api/export/types
 * Get available export types
 */
router.get('/types', async (req, res) => {
    try {
        const result = exportService.getAvailableExports();
        res.json(result);
    } catch (error) {
        console.error('Export Types error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get export types',
            error: error.message
        });
    }
});

// =============================================================================
// CSV EXPORTS
// =============================================================================

/**
 * GET /api/export/csv/bom
 * Export Bill of Material to CSV
 */
router.get('/csv/bom', async (req, res) => {
    try {
        const result = await exportService.exportBOM();
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.csv);
    } catch (error) {
        console.error('BOM Export error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export BOM',
            error: error.message
        });
    }
});

/**
 * GET /api/export/csv/production
 * Export Production Output to CSV
 */
router.get('/csv/production', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const result = await exportService.exportProductionOutput(start_date, end_date);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.csv);
    } catch (error) {
        console.error('Production Export error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export production data',
            error: error.message
        });
    }
});

/**
 * GET /api/export/csv/wip
 * Export WIP Stock to CSV
 */
router.get('/csv/wip', async (req, res) => {
    try {
        const result = await exportService.exportWIPStock();
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.csv);
    } catch (error) {
        console.error('WIP Export error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export WIP stock',
            error: error.message
        });
    }
});

/**
 * GET /api/export/csv/fg
 * Export Finished Goods Stock to CSV
 */
router.get('/csv/fg', async (req, res) => {
    try {
        const result = await exportService.exportFGStock();
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.csv);
    } catch (error) {
        console.error('FG Export error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export FG stock',
            error: error.message
        });
    }
});

/**
 * GET /api/export/csv/material
 * Export Material Stock to CSV
 */
router.get('/csv/material', async (req, res) => {
    try {
        const result = await exportService.exportMaterialStock();
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.csv);
    } catch (error) {
        console.error('Material Export error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export material stock',
            error: error.message
        });
    }
});

/**
 * GET /api/export/csv/component
 * Export Component Stock to CSV
 */
router.get('/csv/component', async (req, res) => {
    try {
        const result = await exportService.exportComponentStock();
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.csv);
    } catch (error) {
        console.error('Component Export error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export component stock',
            error: error.message
        });
    }
});

/**
 * GET /api/export/csv/schedule
 * Export Schedule Delivery to CSV
 */
router.get('/csv/schedule', async (req, res) => {
    try {
        const result = await exportService.exportScheduleDelivery();
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.csv);
    } catch (error) {
        console.error('Schedule Export error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export schedule delivery',
            error: error.message
        });
    }
});

/**
 * GET /api/export/csv/machine
 * Export Machine Status to CSV
 */
router.get('/csv/machine', async (req, res) => {
    try {
        const result = await exportService.exportMachineStatus();
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.csv);
    } catch (error) {
        console.error('Machine Export error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export machine status',
            error: error.message
        });
    }
});

// =============================================================================
// EXPORT INFO (without downloading)
// =============================================================================

/**
 * GET /api/export/info/bom
 * Get BOM export info (record count, etc.)
 */
router.get('/info/bom', async (req, res) => {
    try {
        const result = await exportService.exportBOM();
        
        res.json({
            success: true,
            filename: result.filename,
            record_count: result.record_count,
            file_size_estimate: `${Math.ceil(result.csv.length / 1024)} KB`,
            message: 'BOM export info retrieved successfully'
        });
    } catch (error) {
        console.error('BOM Export Info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get BOM export info',
            error: error.message
        });
    }
});

/**
 * GET /api/export/info/production
 * Get Production export info
 */
router.get('/info/production', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const result = await exportService.exportProductionOutput(start_date, end_date);
        
        res.json({
            success: true,
            filename: result.filename,
            record_count: result.record_count,
            file_size_estimate: `${Math.ceil(result.csv.length / 1024)} KB`,
            date_range: {
                start_date: start_date || 'All',
                end_date: end_date || 'All'
            },
            message: 'Production export info retrieved successfully'
        });
    } catch (error) {
        console.error('Production Export Info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get production export info',
            error: error.message
        });
    }
});

/**
 * GET /api/export/info/wip
 * Get WIP Stock export info
 */
router.get('/info/wip', async (req, res) => {
    try {
        const result = await exportService.exportWIPStock();
        
        res.json({
            success: true,
            filename: result.filename,
            record_count: result.record_count,
            file_size_estimate: `${Math.ceil(result.csv.length / 1024)} KB`,
            message: 'WIP export info retrieved successfully'
        });
    } catch (error) {
        console.error('WIP Export Info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get WIP export info',
            error: error.message
        });
    }
});

/**
 * GET /api/export/info/fg
 * Get FG Stock export info
 */
router.get('/info/fg', async (req, res) => {
    try {
        const result = await exportService.exportFGStock();
        
        res.json({
            success: true,
            filename: result.filename,
            record_count: result.record_count,
            file_size_estimate: `${Math.ceil(result.csv.length / 1024)} KB`,
            message: 'FG export info retrieved successfully'
        });
    } catch (error) {
        console.error('FG Export Info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get FG export info',
            error: error.message
        });
    }
});

// =============================================================================
// CUSTOM EXPORT
// =============================================================================

/**
 * POST /api/export/csv/custom
 * Export custom query results to CSV
 */
router.post('/csv/custom', async (req, res) => {
    try {
        const { query, filename = 'Custom_Export' } = req.body;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'SQL query is required'
            });
        }

        // Basic security check - only allow SELECT statements
        const trimmedQuery = query.trim().toLowerCase();
        if (!trimmedQuery.startsWith('select')) {
            return res.status(400).json({
                success: false,
                message: 'Only SELECT queries are allowed'
            });
        }

        const result = await exportService.exportCustomQuery(query, filename);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.csv);
    } catch (error) {
        console.error('Custom Export error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export custom query',
            error: error.message
        });
    }
});

module.exports = router;
