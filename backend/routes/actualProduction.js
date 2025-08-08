/**
 * Production Routes for PT. Topline Evergreen Manufacturing
 * Routes sesuai dengan struktur database yang sebenarnya
 */

const express = require('express');
const router = express.Router();
const { execute } = require('../config/databaseAdapter');

// Authentication middleware
const auth = (req, res, next) => {
    // Simple authentication for demo
    const apiKey = req.headers['x-api-key'];
    if (apiKey === 'production-api-2025' || apiKey === 'mobile-android-2025') {
        next();
    } else {
        res.status(401).json({
            success: false,
            message: 'Unauthorized access'
        });
    }
};

router.use(auth);

// =============================================================================
// BILL OF MATERIAL ROUTES
// =============================================================================

/**
 * GET /api/production/bom
 * Get all Bill of Materials
 */
router.get('/bom', async (req, res) => {
    try {
        const { limit = 50, offset = 0, customer } = req.query;
        
        let query = 'SELECT * FROM bill_of_material';
        let params = [];
        
        if (customer) {
            query += ' WHERE customer LIKE ?';
            params.push(`%${customer}%`);
        }
        
        const safeLimit = parseInt(limit) || 50;
        const safeOffset = parseInt(offset) || 0;
        query += ` ORDER BY partnumber LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        const [rows] = await pool.execute(query, params);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length,
            pagination: { limit: safeLimit, offset: safeOffset }
        });
    } catch (error) {
        console.error('BOM get error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch BOM data',
            error: error.message
        });
    }
});

/**
 * POST /api/production/bom
 * Create new Bill of Material
 */
router.post('/bom', async (req, res) => {
    try {
        const { partnumber, customer, model, description } = req.body;
        
        if (!partnumber || !customer) {
            return res.status(400).json({
                success: false,
                message: 'partnumber and customer are required'
            });
        }
        
        const [result] = await pool.execute(
            'INSERT INTO billofmaterial (partnumber, customer, model, description) VALUES (?, ?, ?, ?)',
            [partnumber, customer, model || null, description || null]
        );
        
        res.status(201).json({
            success: true,
            message: 'BOM created successfully',
            data: { partnumber, customer, model, description }
        });
    } catch (error) {
        console.error('BOM create error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create BOM',
            error: error.message
        });
    }
});

// =============================================================================
// WIP (WORK IN PROCESS) ROUTES
// =============================================================================

/**
 * GET /api/production/wip
 * Get WIP records
 */
router.get('/wip', async (req, res) => {
    try {
        const { limit = 50, offset = 0, partnumber, lotnumber } = req.query;
        
        let query = `
            SELECT w.*, b.customer, b.model, b.description
            FROM wip w 
            JOIN billofmaterial b ON w.partnumber = b.partnumber
        `;
        let params = [];
        let whereConditions = [];
        
        if (partnumber) {
            whereConditions.push('w.partnumber LIKE ?');
            params.push(`%${partnumber}%`);
        }
        
        if (lotnumber) {
            whereConditions.push('w.lotnumber LIKE ?');
            params.push(`%${lotnumber}%`);
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        const safeLimit = parseInt(limit) || 50;
        const safeOffset = parseInt(offset) || 0;
        query += ` ORDER BY w.timestamp DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        const [rows] = await pool.execute(query, params);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length,
            pagination: { limit: safeLimit, offset: safeOffset }
        });
    } catch (error) {
        console.error('WIP get error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch WIP data',
            error: error.message
        });
    }
});

/**
 * POST /api/production/wip
 * Create new WIP record
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
        
        const [result] = await pool.execute(
            `INSERT INTO wip (partnumber, lotnumber, quantity, operator, pic_qc, pic_group_produksi) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [partnumber, lotnumber, parseInt(quantity), operator || null, pic_qc || null, pic_group_produksi || null]
        );
        
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
        console.error('WIP create error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create WIP record',
            error: error.message
        });
    }
});

// =============================================================================
// FINISHED GOODS ROUTES
// =============================================================================

/**
 * GET /api/production/fg
 * Get Finished Goods records
 */
router.get('/fg', async (req, res) => {
    try {
        const { limit = 50, offset = 0, partnumber, lotnumber } = req.query;
        
        let query = `
            SELECT f.*, b.customer, b.model, b.description
            FROM fg f 
            JOIN billofmaterial b ON f.partnumber = b.partnumber
        `;
        let params = [];
        let whereConditions = [];
        
        if (partnumber) {
            whereConditions.push('f.partnumber LIKE ?');
            params.push(`%${partnumber}%`);
        }
        
        if (lotnumber) {
            whereConditions.push('f.lotnumber LIKE ?');
            params.push(`%${lotnumber}%`);
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        const safeLimit = parseInt(limit) || 50;
        const safeOffset = parseInt(offset) || 0;
        query += ` ORDER BY f.timestamp DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        const [rows] = await pool.execute(query, params);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length,
            pagination: { limit: safeLimit, offset: safeOffset }
        });
    } catch (error) {
        console.error('FG get error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch FG data',
            error: error.message
        });
    }
});

/**
 * POST /api/production/fg
 * Create new Finished Goods record
 */
router.post('/fg', async (req, res) => {
    try {
        const { 
            partnumber, 
            lotnumber, 
            quantity, 
            operator, 
            pic_qc, 
            pic_group_produksi,
            pic_wh
        } = req.body;
        
        if (!partnumber || !lotnumber || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'partnumber, lotnumber, and quantity are required'
            });
        }
        
        const [result] = await pool.execute(
            `INSERT INTO fg (partnumber, lotnumber, quantity, operator, pic_qc, pic_group_produksi, pic_wh) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [partnumber, lotnumber, parseInt(quantity), operator || null, pic_qc || null, pic_group_produksi || null, pic_wh || null]
        );
        
        res.status(201).json({
            success: true,
            message: 'FG record created successfully',
            data: {
                id: result.insertId,
                partnumber,
                lotnumber,
                quantity: parseInt(quantity),
                operator,
                pic_qc,
                pic_group_produksi,
                pic_wh
            }
        });
    } catch (error) {
        console.error('FG create error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create FG record',
            error: error.message
        });
    }
});

// =============================================================================
// OUTPUT MC (MACHINE OUTPUT) ROUTES
// =============================================================================

/**
 * GET /api/production/outputmc
 * Get machine output records
 */
router.get('/outputmc', async (req, res) => {
    try {
        const { limit = 50, offset = 0, partnumber, machine, operator } = req.query;
        
        let query = `
            SELECT o.*, b.customer AS bom_customer, b.model AS bom_model, b.description AS bom_description
            FROM outputmc o 
            JOIN billofmaterial b ON o.partnumber = b.partnumber
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
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        const safeLimit = parseInt(limit) || 50;
        const safeOffset = parseInt(offset) || 0;
        query += ` ORDER BY o.created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        const [rows] = await pool.execute(query, params);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length,
            pagination: { limit: safeLimit, offset: safeOffset }
        });
    } catch (error) {
        console.error('OutputMC get error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch OutputMC data',
            error: error.message
        });
    }
});

/**
 * POST /api/production/outputmc
 * Create new machine output record
 */
router.post('/outputmc', async (req, res) => {
    try {
        const { 
            customer,
            partnumber, 
            model,
            description,
            quantity, 
            quantity_ng,
            machine,
            operator
        } = req.body;
        
        if (!partnumber || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'partnumber and quantity are required'
            });
        }
        
        const [result] = await pool.execute(
            `INSERT INTO outputmc (customer, partnumber, model, description, quantity, quantity_ng, machine, operator) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                customer || null, 
                partnumber, 
                model || null, 
                description || null,
                parseInt(quantity) || 0, 
                parseInt(quantity_ng) || 0,
                machine || null, 
                operator || null
            ]
        );
        
        res.status(201).json({
            success: true,
            message: 'OutputMC record created successfully',
            data: {
                id: result.insertId,
                customer,
                partnumber,
                model,
                description,
                quantity: parseInt(quantity) || 0,
                quantity_ng: parseInt(quantity_ng) || 0,
                machine,
                operator
            }
        });
    } catch (error) {
        console.error('OutputMC create error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create OutputMC record',
            error: error.message
        });
    }
});

// =============================================================================
// DELIVERY CHECKLIST ROUTES
// =============================================================================

/**
 * GET /api/production/delivery
 * Get delivery checklist records
 */
router.get('/delivery', async (req, res) => {
    try {
        const { limit = 50, offset = 0, partnumber, lotnumber } = req.query;
        
        let query = `
            SELECT d.*, b.customer, b.model, b.description
            FROM delivery_checklist d 
            JOIN bill_of_material b ON d.partnumber = b.partnumber
        `;
        let params = [];
        let whereConditions = [];
        
        if (partnumber) {
            whereConditions.push('d.partnumber LIKE ?');
            params.push(`%${partnumber}%`);
        }
        
        if (lotnumber) {
            whereConditions.push('d.lotnumber LIKE ?');
            params.push(`%${lotnumber}%`);
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        const safeLimit = parseInt(limit) || 50;
        const safeOffset = parseInt(offset) || 0;
        query += ` ORDER BY d.timestamp DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        const [rows] = await pool.execute(query, params);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length,
            pagination: { limit: safeLimit, offset: safeOffset }
        });
    } catch (error) {
        console.error('Delivery get error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch delivery data',
            error: error.message
        });
    }
});

// =============================================================================
// DASHBOARD & STATISTICS
// =============================================================================

/**
 * GET /api/production/dashboard
 * Get production dashboard statistics
 */
router.get('/dashboard', async (req, res) => {
    try {
        // Get counts from all major tables
        const [bomCount] = await pool.execute('SELECT COUNT(*) as count FROM billofmaterial');
        const [wipCount] = await pool.execute('SELECT COUNT(*) as count FROM wip');
        const [fgCount] = await pool.execute('SELECT COUNT(*) as count FROM fg');
        const [outputCount] = await pool.execute('SELECT COUNT(*) as count FROM outputmc');
        const [deliveryCount] = await pool.execute('SELECT COUNT(*) as count FROM deliverychecklist');
        
        // Get today's production
        const [todayOutput] = await pool.execute(
            "SELECT COUNT(*) as count, SUM(quantity) as total_qty FROM outputmc WHERE DATE(created_at) = DATE('now')"
        );
        
        // Get top customers
        const [topCustomers] = await pool.execute(`
            SELECT customer, COUNT(*) as part_count 
            FROM billofmaterial 
            GROUP BY customer 
            ORDER BY part_count DESC 
            LIMIT 5
        `);
        
        res.json({
            success: true,
            data: {
                summary: {
                    total_bom: bomCount[0].count,
                    total_wip: wipCount[0].count,
                    total_fg: fgCount[0].count,
                    total_output: outputCount[0].count,
                    total_delivery: deliveryCount[0].count
                },
                today_production: {
                    orders: todayOutput[0].count,
                    quantity: todayOutput[0].total_qty || 0
                },
                top_customers: topCustomers,
                last_updated: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
});

// =============================================================================
// MACHINE STATUS ROUTES
// =============================================================================

/**
 * GET /api/production/machine-status
 * Get machine status records
 */
router.get('/machine-status', async (req, res) => {
    try {
        const { limit = 50, offset = 0, machine, status } = req.query;
        
        let query = `
            SELECT id, created_at as timestamp, machine_name as machine, 
                   current_status as status, current_operator as operator, 
                   location as notes
            FROM machine_status
        `;
        
        let params = [];
        let whereConditions = [];
        
        if (machine) {
            whereConditions.push('machine LIKE ?');
            params.push(`%${machine}%`);
        }
        
        if (status) {
            whereConditions.push('status = ?');
            params.push(status);
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        const safeLimit = parseInt(limit) || 50;
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
            message: 'Machine status records retrieved successfully'
        });
        
    } catch (error) {
        console.error('Get machine status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch machine status records',
            error: error.message
        });
    }
});

/**
 * POST /api/production/machine-status
 * Create new machine status record
 */
router.post('/machine-status', async (req, res) => {
    try {
        const { machine, status, operator, notes } = req.body;
        
        if (!machine || !status) {
            return res.status(400).json({
                success: false,
                message: 'Machine and status are required'
            });
        }
        
        const result = await pool.execute(`
            INSERT INTO machine_status (machine_name, current_status, current_operator, location) 
            VALUES (?, ?, ?, ?)
        `, [machine, status, operator || null, notes || null]);
        
        res.status(201).json({
            success: true,
            message: 'Machine status recorded successfully',
            data: {
                id: result.insertId || 'Generated',
                machine,
                status,
                operator,
                notes,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Create machine status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record machine status',
            error: error.message
        });
    }
});

module.exports = router;
