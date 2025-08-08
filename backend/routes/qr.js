/**
 * QR Code Routes - Handle QR Code Operations for Mobile Android
 * PT. Topline Evergreen Manufacturing
 */

const express = require('express');
const router = express.Router();
const qrCodeService = require('../services/qrCodeService');
const { execute } = require('../config/databaseAdapter');

// Mobile Authentication middleware
const mobileAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKeys = ['mobile-android-2025', 'topline-mobile-key'];
    
    if (!apiKey || !validApiKeys.includes(apiKey)) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Valid API key required for mobile access'
        });
    }
    next();
};

router.use(mobileAuth);

// =============================================================================
// QR CODE GENERATION
// =============================================================================

/**
 * POST /api/qr/generate
 * Generate QR Code data untuk part number dengan lot number
 */
router.post('/generate', async (req, res) => {
    try {
        const { partnumber, customer, lotnumber, type = 'PRODUCTION' } = req.body;
        
        if (!partnumber || !customer || !lotnumber) {
            return res.status(400).json({
                success: false,
                message: 'partnumber, customer, dan lotnumber are required'
            });
        }

        // Validate partnumber exists
        const [bomCheck] = await pool.execute(
            'SELECT * FROM billofmaterial WHERE partnumber = ? AND customer = ?',
            [partnumber, customer]
        );

        if (bomCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Part number tidak terdaftar dalam BOM'
            });
        }

        const qrResult = qrCodeService.generateQRData(partnumber, customer, lotnumber, type);
        
        res.json({
            success: true,
            data: qrResult.qr_data,
            qr_string: qrResult.qr_string,
            message: 'QR Code generated successfully'
        });
    } catch (error) {
        console.error('QR Generate error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate QR code',
            error: error.message
        });
    }
});

// =============================================================================
// QR CODE SCANNING & VALIDATION
// =============================================================================

/**
 * POST /api/qr/validate
 * Validate QR Code data
 */
router.post('/validate', async (req, res) => {
    try {
        const { qr_string } = req.body;
        
        if (!qr_string) {
            return res.status(400).json({
                success: false,
                message: 'qr_string is required'
            });
        }

        const parseResult = qrCodeService.parseQRData(qr_string);
        
        if (!parseResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid QR code format',
                error: parseResult.error
            });
        }

        // Additional validation - check if partnumber still exists in BOM
        const { partnumber, customer } = parseResult.data;
        const [bomCheck] = await pool.execute(
            'SELECT * FROM billofmaterial WHERE partnumber = ? AND customer = ?',
            [partnumber, customer]
        );

        if (bomCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Part number tidak lagi terdaftar dalam BOM'
            });
        }

        res.json({
            success: true,
            data: parseResult.data,
            bom_data: bomCheck[0],
            message: 'QR Code valid'
        });
    } catch (error) {
        console.error('QR Validate error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate QR code',
            error: error.message
        });
    }
});

// =============================================================================
// STOCK REGISTRATION via QR SCAN
// =============================================================================

/**
 * POST /api/qr/register-stock
 * Register stock menggunakan QR Code scan
 */
router.post('/register-stock', async (req, res) => {
    try {
        const { qr_string, quantity, location, operator, stock_type = 'WIP' } = req.body;
        
        if (!qr_string || !quantity || !operator) {
            return res.status(400).json({
                success: false,
                message: 'qr_string, quantity, dan operator are required'
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be greater than 0'
            });
        }

        const result = await qrCodeService.registerStockByQR(
            qr_string, 
            parseInt(quantity), 
            location || 'WAREHOUSE', 
            operator, 
            stock_type
        );
        
        res.status(201).json(result);
    } catch (error) {
        console.error('QR Stock Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register stock via QR',
            error: error.message
        });
    }
});

// =============================================================================
// PRODUCTION INPUT via QR SCAN
// =============================================================================

/**
 * POST /api/qr/input-production
 * Input production output menggunakan QR Code scan
 */
router.post('/input-production', async (req, res) => {
    try {
        const { 
            qr_string, 
            quantity, 
            quantity_ng = 0, 
            machine, 
            operator, 
            shift = '1' 
        } = req.body;
        
        if (!qr_string || !quantity || !machine || !operator) {
            return res.status(400).json({
                success: false,
                message: 'qr_string, quantity, machine, dan operator are required'
            });
        }

        if (quantity < 0 || quantity_ng < 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity and quantity_ng must be non-negative'
            });
        }

        const result = await qrCodeService.inputProductionByQR(
            qr_string, 
            parseInt(quantity), 
            parseInt(quantity_ng), 
            machine, 
            operator, 
            shift
        );
        
        res.status(201).json(result);
    } catch (error) {
        console.error('QR Production Input error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to input production via QR',
            error: error.message
        });
    }
});

// =============================================================================
// QR CODE HISTORY & TRACKING
// =============================================================================

/**
 * GET /api/qr/history/:lotnumber
 * Get QR Code transaction history by lot number
 */
router.get('/history/:lotnumber', async (req, res) => {
    try {
        const { lotnumber } = req.params;
        
        if (!lotnumber) {
            return res.status(400).json({
                success: false,
                message: 'Lot number is required'
            });
        }

        const historyResult = await qrCodeService.getQRHistory(lotnumber);
        
        res.json({
            success: true,
            data: historyResult.data,
            summary: historyResult.summary,
            message: 'QR history retrieved successfully'
        });
    } catch (error) {
        console.error('QR History error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch QR history',
            error: error.message
        });
    }
});

/**
 * GET /api/qr/transactions
 * Get recent QR transactions untuk monitoring
 */
router.get('/transactions', async (req, res) => {
    try {
        const { limit = 50, offset = 0, transaction_type, operator } = req.query;
        
        let query = `
            SELECT 
                transaction_type,
                stock_type,
                partnumber,
                customer,
                lotnumber,
                quantity,
                quantity_ng,
                location,
                machine,
                operator,
                created_at
            FROM stock_transactions
        `;
        
        let params = [];
        let whereConditions = [];
        
        if (transaction_type) {
            whereConditions.push('transaction_type = ?');
            params.push(transaction_type);
        }
        
        if (operator) {
            whereConditions.push('operator = ?');
            params.push(operator);
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        const safeLimit = parseInt(limit) || 50;
        const safeOffset = parseInt(offset) || 0;
        query += ` ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        const [transactions] = await pool.execute(query, params);
        
        res.json({
            success: true,
            data: transactions,
            count: transactions.length,
            pagination: { limit: safeLimit, offset: safeOffset },
            message: 'QR transactions retrieved successfully'
        });
    } catch (error) {
        console.error('QR Transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch QR transactions',
            error: error.message
        });
    }
});

// =============================================================================
// BULK QR OPERATIONS
// =============================================================================

/**
 * POST /api/qr/bulk-generate
 * Generate multiple QR codes untuk batch production
 */
router.post('/bulk-generate', async (req, res) => {
    try {
        const { partnumber, customer, lot_prefix, quantity, type = 'PRODUCTION' } = req.body;
        
        if (!partnumber || !customer || !lot_prefix || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'partnumber, customer, lot_prefix, dan quantity are required'
            });
        }

        // Validate partnumber exists
        const [bomCheck] = await pool.execute(
            'SELECT * FROM billofmaterial WHERE partnumber = ? AND customer = ?',
            [partnumber, customer]
        );

        if (bomCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Part number tidak terdaftar dalam BOM'
            });
        }

        const qrCodes = [];
        const batchDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        
        for (let i = 1; i <= parseInt(quantity); i++) {
            const lotnumber = `${lot_prefix}_${batchDate}_${i.toString().padStart(3, '0')}`;
            const qrResult = qrCodeService.generateQRData(partnumber, customer, lotnumber, type);
            qrCodes.push({
                lot_number: lotnumber,
                qr_data: qrResult.qr_data,
                qr_string: qrResult.qr_string
            });
        }
        
        res.json({
            success: true,
            data: qrCodes,
            summary: {
                total_generated: qrCodes.length,
                partnumber,
                customer,
                batch_date: batchDate
            },
            message: `${qrCodes.length} QR codes generated successfully`
        });
    } catch (error) {
        console.error('Bulk QR Generate error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate bulk QR codes',
            error: error.message
        });
    }
});

module.exports = router;
