/**
 * Mobile API Routes - Sesuai Database Aktual
 * PT. Topline Evergreen Manufacturing - Mobile Android App
 * Focus: POST, GET, UPDATE operations only (no DELETE)
 */

const express = require('express');
const router = express.Router();
const { execute } = require('../config/databaseAdapter');
const wipInventoryService = require('../services/wipInventoryService');

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

// Apply mobile auth to all routes
router.use(mobileAuth);

// =============================================================================
// MOBILE DASHBOARD API
// =============================================================================

/**
 * GET /api/mobile/dashboard
 * Mobile Dashboard Data - sesuai struktur database aktual
 */
router.get('/dashboard', async (req, res) => {
    try {
        // Get summary statistics
        const [bomStats] = await pool.execute('SELECT COUNT(*) as total_bom FROM billofmaterial');
        const [wipStats] = await pool.execute('SELECT COUNT(*) as total_wip, SUM(quantity) as total_wip_qty FROM wip');
        const [fgStats] = await pool.execute('SELECT COUNT(*) as total_fg, SUM(quantity) as total_fg_qty FROM fg');
        const [outputStats] = await pool.execute(`
            SELECT 
                COUNT(*) as total_output,
                SUM(quantity) as total_good_qty,
                SUM(quantity_ng) as total_ng_qty
            FROM outputmc 
            WHERE DATE(timestamp) = DATE('now')
        `);

        res.json({
            success: true,
            data: {
                bom: {
                    total_parts: bomStats[0].total_bom || 0
                },
                wip: {
                    total_records: wipStats[0].total_wip || 0,
                    total_quantity: wipStats[0].total_wip_qty || 0
                },
                fg: {
                    total_records: fgStats[0].total_fg || 0,
                    total_quantity: fgStats[0].total_fg_qty || 0
                },
                today_output: {
                    total_records: outputStats[0].total_output || 0,
                    good_quantity: outputStats[0].total_good_qty || 0,
                    ng_quantity: outputStats[0].total_ng_qty || 0
                },
                last_updated: new Date().toISOString()
            },
            message: 'Mobile dashboard data retrieved successfully'
        });
        
    } catch (error) {
        console.error('Mobile dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
});

// =============================================================================
// BILL OF MATERIAL API (GET only for mobile)
// =============================================================================

/**
 * GET /api/mobile/bom
 * Get BOM list for mobile view
 */
router.get('/bom', async (req, res) => {
    try {
        const { customer, limit = 20 } = req.query;
        
        let query = 'SELECT partnumber, customer, model, description FROM billofmaterial';
        let params = [];
        
        if (customer) {
            query += ' WHERE customer LIKE ?';
            params.push(`%${customer}%`);
        }
        
        const safeLimit = parseInt(limit) || 20;
        query += ` ORDER BY partnumber LIMIT ${safeLimit}`;
        
        const [rows] = await pool.execute(query, params);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length,
            message: 'BOM data retrieved successfully'
        });
        
    } catch (error) {
        console.error('Mobile BOM error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch BOM data',
            error: error.message
        });
    }
});

// =============================================================================
// OUTPUT MC API (POST, GET, UPDATE for mobile)
// =============================================================================

/**
 * GET /api/mobile/outputmc
 * Get recent output records for mobile
 */
router.get('/outputmc', async (req, res) => {
    try {
        const { partnumber, machine, operator, limit = 20, offset = 0 } = req.query;
        
        let query = `
            SELECT o.id, o.created_at as timestamp, o.customer, o.partnumber, o.model, 
                   o.description, o.quantity, o.quantity_ng, o.machine, o.operator
            FROM outputmc o
        `;
        
        let params = [];
        let whereConditions = [];
        
        if (partnumber) {
            whereConditions.push('o.partnumber LIKE ?');
            params.push(`%${partnumber}%`);
        }
        
        if (machine) {
            whereConditions.push('o.machine LIKE ?');
            params.push(`%${machine}%`);
        }
        
        if (operator) {
            whereConditions.push('o.operator LIKE ?');
            params.push(`%${operator}%`);
        } else {
            // Default to today's records
            whereConditions.push("DATE(o.created_at) = DATE('now')");
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        const safeLimit = parseInt(limit) || 20;
        const safeOffset = parseInt(offset) || 0;
        query += ` ORDER BY o.created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        const [rows] = await pool.execute(query, params);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            },
            message: 'Output records retrieved successfully'
        });
        
    } catch (error) {
        console.error('Mobile get outputmc error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch output records',
            error: error.message
        });
    }
});

/**
 * POST /api/mobile/outputmc
 * Create new machine output from mobile (PRIMARY FUNCTION)
 */
router.post('/outputmc', async (req, res) => {
    try {
        const { 
            customer,
            partnumber, 
            model, 
            description,
            quantity,
            quantity_ng = 0,
            machine,
            operator,
            lotnumber, // Add lotnumber for WIP tracking
            shift = '1' // Add shift info
        } = req.body;
        
        // Validate required fields
        if (!partnumber || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                required: ['partnumber', 'quantity'],
                received: req.body
            });
        }
        
        // Validate quantity is positive number
        if (isNaN(quantity) || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a positive number'
            });
        }
        
        // Insert machine output
        const result = await pool.execute(`
            INSERT INTO outputmc (customer, partnumber, model, description, quantity, quantity_ng, machine, operator, lotnumber, shift) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            customer || null, 
            partnumber, 
            model || null, 
            description || null,
            parseInt(quantity), 
            parseInt(quantity_ng) || 0,
            machine || null, 
            operator || null,
            lotnumber || `LOT-${Date.now()}`, // Auto-generate lot number if not provided
            shift
        ]);

        // 🔄 OTOMATIS TAMBAH KE WIP INVENTORY
        try {
            const wipResult = await wipInventoryService.addToWIPFromOutput({
                customer,
                partnumber,
                model,
                description,
                quantity: parseInt(quantity),
                machine,
                operator,
                lotnumber: lotnumber || `LOT-${Date.now()}`,
                shift
            });
            
            console.log('✅ WIP Inventory updated:', wipResult.data);
        } catch (wipError) {
            console.error('⚠️ WIP Inventory update failed:', wipError.message);
            // Don't fail the entire request if WIP update fails
        }
        
        res.status(201).json({
            success: true,
            message: 'Production output recorded and WIP inventory updated successfully',
            data: {
                id: result.insertId || 'Generated',
                customer,
                partnumber,
                model,
                description,
                quantity: parseInt(quantity),
                quantity_ng: parseInt(quantity_ng) || 0,
                machine,
                operator,
                lotnumber: lotnumber || `LOT-${Date.now()}`,
                shift,
                timestamp: new Date().toISOString(),
                wip_updated: true
            }
        });
        
    } catch (error) {
        console.error('Mobile create outputmc error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record production output',
            error: error.message
        });
    }
});

/**
 * PUT /api/mobile/outputmc/:id
 * Update existing output record from mobile
 */
router.put('/outputmc/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            quantity,
            quantity_ng,
            machine,
            operator
        } = req.body;
        
        // Check if record exists
        const [existing] = await pool.execute('SELECT id FROM outputmc WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Output record not found'
            });
        }
        
        // Build dynamic update query
        let updateFields = [];
        let params = [];
        
        if (quantity !== undefined) {
            if (isNaN(quantity) || quantity < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantity must be a positive number'
                });
            }
            updateFields.push('quantity = ?');
            params.push(parseInt(quantity));
        }
        
        if (quantity_ng !== undefined) {
            updateFields.push('quantity_ng = ?');
            params.push(parseInt(quantity_ng) || 0);
        }
        
        if (machine !== undefined) {
            updateFields.push('machine = ?');
            params.push(machine);
        }
        
        if (operator !== undefined) {
            updateFields.push('operator = ?');
            params.push(operator);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }
        
        params.push(id);
        const updateQuery = `UPDATE outputmc SET ${updateFields.join(', ')} WHERE id = ?`;
        await pool.execute(updateQuery, params);
        
        // Get updated record
        const [updated] = await pool.execute(`
            SELECT id, timestamp, customer, partnumber, model, description,
                   quantity, quantity_ng, machine, operator
            FROM outputmc WHERE id = ?
        `, [id]);
        
        res.json({
            success: true,
            message: 'Output record updated successfully',
            data: updated[0]
        });
        
    } catch (error) {
        console.error('Mobile update outputmc error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update output record',
            error: error.message
        });
    }
});

// =============================================================================
// WIP API (POST, GET, UPDATE for mobile)
// =============================================================================

/**
 * POST /api/mobile/wip
 * Create new WIP record from mobile
 */
router.post('/wip', async (req, res) => {
    try {
        const { 
            partnumber, 
            lotnumber, 
            quantity, 
            operator, 
            pic_qc, 
            pic_group_produksi 
        } = req.body;
        
        if (!partnumber || !lotnumber || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'partnumber, lotnumber, and quantity are required'
            });
        }
        
        const [result] = await pool.execute(`
            INSERT INTO wip (partnumber, lotnumber, quantity, operator, pic_qc, pic_group_produksi) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [partnumber, lotnumber, parseInt(quantity), operator || null, pic_qc || null, pic_group_produksi || null]);
        
        res.status(201).json({
            success: true,
            message: 'WIP record created successfully',
            data: {
                id: result.insertId,
                partnumber,
                lotnumber,
                quantity: parseInt(quantity),
                operator,
                pic_qc,
                pic_group_produksi
            }
        });
        
    } catch (error) {
        console.error('Mobile create WIP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create WIP record',
            error: error.message
        });
    }
});

/**
 * GET /api/mobile/wip
 * Get WIP records for mobile
 */
router.get('/wip', async (req, res) => {
    try {
        const { partnumber, lotnumber, limit = 20, offset = 0 } = req.query;
        
        let query = `
            SELECT id, created_at as timestamp, partnumber, lotnumber, quantity, 
                   operator, pic_qc, pic_production as pic_group_produksi
            FROM wip
        `;
        
        let params = [];
        let whereConditions = [];
        
        if (partnumber) {
            whereConditions.push('partnumber LIKE ?');
            params.push(`%${partnumber}%`);
        }
        
        if (lotnumber) {
            whereConditions.push('lotnumber LIKE ?');
            params.push(`%${lotnumber}%`);
        } else {
            // Default to today's records
            whereConditions.push("DATE(created_at) = DATE('now')");
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        const safeLimit = parseInt(limit) || 20;
        const safeOffset = parseInt(offset) || 0;
        query += ` ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        const [rows] = await pool.execute(query, params);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            },
            message: 'WIP records retrieved successfully'
        });
        
    } catch (error) {
        console.error('Mobile get WIP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch WIP records',
            error: error.message
        });
    }
});

// =============================================================================
// TRANSFER QC (WIP INVENTORY MANAGEMENT)
// =============================================================================

/**
 * POST /api/mobile/transfer-qc
 * Transfer WIP to QC (Mengurangi WIP inventory)
 */
router.post('/transfer-qc', async (req, res) => {
    try {
        const {
            partnumber,
            lotnumber,
            quantity_transfer,
            pic_qc,
            pic_production,
            notes
        } = req.body;

        // Validate required fields
        if (!partnumber || !lotnumber || !quantity_transfer) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                required: ['partnumber', 'lotnumber', 'quantity_transfer'],
                received: req.body
            });
        }

        // Validate quantity is positive number
        if (isNaN(quantity_transfer) || quantity_transfer <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Transfer quantity must be a positive number'
            });
        }

        // 🔄 KURANGI WIP INVENTORY DAN TRANSFER KE QC
        const transferResult = await wipInventoryService.reduceWIPForTransfer({
            partnumber,
            lotnumber,
            quantity_transfer: parseInt(quantity_transfer),
            pic_qc,
            pic_production,
            notes
        });

        res.status(201).json({
            success: true,
            message: 'WIP transferred to QC successfully',
            data: {
                partnumber,
                lotnumber,
                quantity_transferred: parseInt(quantity_transfer),
                pic_qc,
                pic_production,
                notes,
                timestamp: new Date().toISOString(),
                wip_result: transferResult.data
            }
        });

    } catch (error) {
        console.error('Mobile transfer QC error:', error);
        res.status(500).json({
            success: false,
            message: error.message.includes('WIP tidak ditemukan') ? 
                     'WIP not found for the specified partnumber and lotnumber' :
                     error.message.includes('Quantity WIP tidak cukup') ?
                     'Insufficient WIP quantity for transfer' :
                     'Failed to transfer WIP to QC',
            error: error.message
        });
    }
});

/**
 * GET /api/mobile/wip-summary
 * Get WIP inventory summary
 */
router.get('/wip-summary', async (req, res) => {
    try {
        const { partnumber } = req.query;
        
        const summary = await wipInventoryService.getWIPSummary(partnumber);
        
        res.json({
            success: true,
            data: summary.data,
            message: 'WIP summary retrieved successfully'
        });

    } catch (error) {
        console.error('Mobile WIP summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get WIP summary',
            error: error.message
        });
    }
});

/**
 * GET /api/mobile/wip-transactions
 * Get WIP transaction history
 */
router.get('/wip-transactions', async (req, res) => {
    try {
        const { partnumber, limit = 20 } = req.query;
        
        const history = await wipInventoryService.getWIPTransactionHistory(
            partnumber, 
            parseInt(limit)
        );
        
        res.json({
            success: true,
            data: history.data,
            message: 'WIP transaction history retrieved successfully'
        });

    } catch (error) {
        console.error('Mobile WIP transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get WIP transaction history',
            error: error.message
        });
    }
});

// =============================================================================
// UTILITY ENDPOINTS
// =============================================================================

/**
 * GET /api/mobile/status
 * Mobile API status check
 */
router.get('/status', async (req, res) => {
    try {
        // Quick database connectivity test
        const [result] = await pool.execute('SELECT 1 as test');
        
        res.json({
            success: true,
            status: 'Mobile API is running',
            database: 'Connected',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            platform: 'android'
        });
        
    } catch (error) {
        console.error('Mobile status error:', error);
        res.status(500).json({
            success: false,
            message: 'Mobile API error',
            error: error.message
        });
    }
});

module.exports = router;

// =============================================================================
// MOBILE DASHBOARD API
// =============================================================================

/**
 * GET /api/mobile/dashboard
 * Mobile Dashboard Data - simplified for mobile view
 */
router.get('/dashboard', async (req, res) => {
    try {
        // Get summary statistics for mobile dashboard
        const [machineStats] = await pool.execute(`
            SELECT 
                COUNT(*) as total_machines,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_machines,
                SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_machines,
                SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_machines
            FROM machines WHERE is_active = TRUE
        `);
        
        const [outputStats] = await pool.execute(`
            SELECT 
                COUNT(*) as total_outputs,
                SUM(quantity) as total_production,
                AVG(quantity) as avg_production,
                COUNT(DISTINCT machine) as active_machines_today
            FROM output_mc 
            WHERE DATE(completion_time) = CURDATE()
        `);
        
        const [wipStats] = await pool.execute(`
            SELECT 
                COUNT(*) as total_wip,
                SUM(current_qty) as total_wip_quantity,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as active_wip
            FROM wip_second_process
        `);

        res.json({
            success: true,
            data: {
                machines: machineStats[0] || { 
                    total_machines: 0, 
                    active_machines: 0, 
                    maintenance_machines: 0, 
                    inactive_machines: 0 
                },
                production: outputStats[0] || { 
                    total_outputs: 0, 
                    total_production: 0, 
                    avg_production: 0,
                    active_machines_today: 0
                },
                wip: wipStats[0] || { 
                    total_wip: 0, 
                    total_wip_quantity: 0,
                    active_wip: 0
                },
                last_updated: new Date().toISOString()
            },
            message: 'Mobile dashboard data retrieved successfully'
        });
        
    } catch (error) {
        console.error('Mobile dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
});

// =============================================================================
// MACHINES API (GET only for mobile)
// =============================================================================

/**
 * GET /api/mobile/machines
 * Get machines list for mobile view (simplified)
 */
router.get('/machines', async (req, res) => {
    try {
        const { status, limit = 20 } = req.query;
        
        let query = `
            SELECT 
                m.id,
                m.machine_code,
                m.machine_name,
                m.machine_type,
                m.status,
                m.capacity_per_hour,
                m.location
            FROM machines m
            WHERE m.is_active = TRUE
        `;
        
        let params = [];
        
        if (status) {
            query += ' AND m.status = ?';
            params.push(status);
        }
        
        // Use string interpolation for LIMIT as some MySQL versions don't support parameter binding for LIMIT
        const safeLimit = parseInt(limit) || 20;
        query += ` ORDER BY m.machine_code LIMIT ${safeLimit}`;
        
        const [machines] = await pool.execute(query, params);
        
        // Format for mobile consumption
        const formattedMachines = machines.map(machine => ({
            id: machine.id,
            code: machine.machine_code,
            name: machine.machine_name || machine.machine_code,
            type: machine.machine_type || 'Unknown',
            status: machine.status || 'inactive',
            location: machine.location || 'Unknown',
            capacity: machine.capacity_per_hour || 0,
            statusColor: getStatusColor(machine.status)
        }));
        
        res.json({
            success: true,
            data: formattedMachines,
            count: formattedMachines.length,
            message: 'Machines data retrieved successfully'
        });
        
    } catch (error) {
        console.error('Mobile machines error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch machines data',
            error: error.message
        });
    }
});

// Helper function for status colors
function getStatusColor(status) {
    switch (status) {
        case 'active': return '#4CAF50';
        case 'maintenance': return '#FF9800';
        case 'inactive': return '#F44336';
        default: return '#9E9E9E';
    }
}

// =============================================================================
// OUTPUT PRODUCTION API (POST, GET, UPDATE for mobile)
// =============================================================================

/**
 * GET /api/mobile/output
 * Get recent output records for mobile
 */
router.get('/output', async (req, res) => {
    try {
        const { machine, operator, date, limit = 20, offset = 0 } = req.query;
        
        let query = `
            SELECT 
                id, part_number, model, machine, quantity, quality_grade,
                operator, completion_time, status, created_at
            FROM output_mc
        `;
        
        let params = [];
        let whereConditions = [];
        
        if (machine) {
            whereConditions.push('machine = ?');
            params.push(machine);
        }
        
        if (operator) {
            whereConditions.push('operator = ?');
            params.push(operator);
        }
        
        if (date) {
            whereConditions.push('DATE(completion_time) = ?');
            params.push(date);
        } else {
            // Default to today's records
            whereConditions.push('DATE(completion_time) = CURDATE()');
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        // Use string interpolation for LIMIT/OFFSET as some MySQL versions don't support parameter binding
        const safeLimit = parseInt(limit) || 20;
        const safeOffset = parseInt(offset) || 0;
        query += ` ORDER BY completion_time DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        const [rows] = await pool.execute(query, params);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            },
            message: 'Output records retrieved successfully'
        });
        
    } catch (error) {
        console.error('Mobile get output error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch output records',
            error: error.message
        });
    }
});

/**
 * POST /api/mobile/output
 * Create new machine output from mobile (PRIMARY FUNCTION)
 */
router.post('/output', async (req, res) => {
    try {
        const { 
            machine_code, 
            part_number, 
            model, 
            quantity, 
            quality_grade = 'A',
            operator,
            notes,
            shift = 'shift_1'
        } = req.body;
        
        // Validate required fields
        if (!machine_code || !part_number || !model || !quantity || !operator) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                required: ['machine_code', 'part_number', 'model', 'quantity', 'operator'],
                received: req.body
            });
        }
        
        // Validate quantity is positive number
        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a positive number'
            });
        }
        
        // Generate output ID
        const outputId = generateId('OUT');
        
        // Insert machine output
        const [result] = await pool.execute(`
            INSERT INTO output_mc (
                id, part_number, model, machine, quantity, quality_grade, 
                operator, completion_time, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'completed')
        `, [outputId, part_number, model, machine_code, parseInt(quantity), quality_grade, operator]);
        
        res.status(201).json({
            success: true,
            message: 'Production output recorded successfully',
            data: {
                id: outputId,
                machine_code,
                part_number,
                model,
                quantity: parseInt(quantity),
                quality_grade,
                operator,
                completion_time: new Date().toISOString(),
                status: 'completed',
                shift,
                notes: notes || null
            }
        });
        
    } catch (error) {
        console.error('Mobile create output error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record production output',
            error: error.message
        });
    }
});

/**
 * GET /api/mobile/output/:id
 * Get specific output record by ID
 */
router.get('/output/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await pool.execute(`
            SELECT 
                id, part_number, model, machine, quantity, quality_grade,
                operator, completion_time, status, created_at, updated_at
            FROM output_mc 
            WHERE id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Output record not found'
            });
        }
        
        res.json({
            success: true,
            data: rows[0],
            message: 'Output record retrieved successfully'
        });
        
    } catch (error) {
        console.error('Mobile get single output error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch output record',
            error: error.message
        });
    }
});

/**
 * PUT /api/mobile/output/:id
 * Update existing output record from mobile
 */
router.put('/output/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            quantity,
            quality_grade,
            operator,
            status,
            notes
        } = req.body;
        
        // Check if record exists
        const [existing] = await pool.execute('SELECT id, operator FROM output_mc WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Output record not found'
            });
        }
        
        // Build dynamic update query
        let updateFields = [];
        let params = [];
        
        if (quantity !== undefined) {
            if (isNaN(quantity) || quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantity must be a positive number'
                });
            }
            updateFields.push('quantity = ?');
            params.push(parseInt(quantity));
        }
        
        if (quality_grade) {
            updateFields.push('quality_grade = ?');
            params.push(quality_grade);
        }
        
        if (operator) {
            updateFields.push('operator = ?');
            params.push(operator);
        }
        
        if (status) {
            updateFields.push('status = ?');
            params.push(status);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }
        
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);
        
        const updateQuery = `UPDATE output_mc SET ${updateFields.join(', ')} WHERE id = ?`;
        await pool.execute(updateQuery, params);
        
        // Get updated record
        const [updated] = await pool.execute(`
            SELECT id, part_number, model, machine, quantity, quality_grade,
                   operator, completion_time, status, updated_at
            FROM output_mc WHERE id = ?
        `, [id]);
        
        res.json({
            success: true,
            message: 'Output record updated successfully',
            data: updated[0]
        });
        
    } catch (error) {
        console.error('Mobile update output error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update output record',
            error: error.message
        });
    }
});

// =============================================================================
// UTILITY ENDPOINTS
// =============================================================================

/**
 * GET /api/mobile/sync
 * Data synchronization endpoint for mobile app
 */
router.get('/sync', async (req, res) => {
    try {
        const { last_sync } = req.query;
        
        let baseQuery = '';
        let params = [];
        
        if (last_sync) {
            baseQuery = ' AND updated_at > ?';
            params = [last_sync];
        }
        
        // Get updated machines
        const [machines] = await pool.execute(`
            SELECT machine_code, machine_name, status, capacity_per_hour, location
            FROM machines 
            WHERE is_active = TRUE ${baseQuery}
            ORDER BY machine_code
        `, params);
        
        // Get recent outputs (last 24 hours)
        const outputParams = last_sync ? [last_sync] : [];
        const outputQuery = last_sync ? 
            'SELECT id, machine, part_number, model, quantity, operator, completion_time, status FROM output_mc WHERE completion_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR) AND updated_at > ? ORDER BY completion_time DESC' :
            'SELECT id, machine, part_number, model, quantity, operator, completion_time, status FROM output_mc WHERE completion_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR) ORDER BY completion_time DESC';
        
        const [outputs] = await pool.execute(outputQuery, outputParams);
        
        res.json({
            success: true,
            data: {
                machines,
                outputs,
                sync_timestamp: new Date().toISOString()
            },
            message: 'Sync data retrieved successfully'
        });
        
    } catch (error) {
        console.error('Mobile sync error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync data',
            error: error.message
        });
    }
});

/**
 * GET /api/mobile/status
 * Mobile API status check
 */
router.get('/status', async (req, res) => {
    try {
        // Quick database connectivity test
        const [result] = await pool.execute('SELECT 1 as test');
        
        res.json({
            success: true,
            status: 'Mobile API is running',
            database: 'Connected',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            platform: 'android'
        });
        
    } catch (error) {
        console.error('Mobile status error:', error);
        res.status(500).json({
            success: false,
            message: 'Mobile API error',
            error: error.message
        });
    }
});

module.exports = router;
