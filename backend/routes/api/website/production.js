/**
 * Website Production API - Enhanced CRUD Operations
 * PT. Topline Evergreen Manufacturing
 * Web Production: Dashboard, Reports, Management, Machine Output, WIP, Machine Status
 */

const express = require('express');
const router = express.Router();
const { execute } = require('../../../config/databaseAdapter');

// API Key Validation Middleware
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== 'website-admin-2025') {
        return res.status(401).json({
            success: false,
            message: 'API key tidak valid'
        });
    }
    next();
};

// Apply API key validation to all routes
router.use(validateApiKey);

// ================================================================
// PRODUCTION DASHBOARD ENDPOINTS
// ================================================================

// ✅ PRODUCTION DASHBOARD - Data for production dashboard
router.get('/dashboard', async (req, res) => {
    try {
        // Today's production summary
        const [todayProduction] = await execute(`
            SELECT 
                COUNT(*) as total_records,
                SUM(quantity) as total_produced,
                SUM(quantity_ng) as total_ng,
                COUNT(DISTINCT machine) as active_machines,
                COUNT(DISTINCT operator) as active_operators
            FROM outputmc 
            WHERE DATE(created_at) = CURDATE()
        `);
        
        // Machine status summary
        const [machineStatus] = await execute(`
            SELECT 
                current_status as status,
                COUNT(*) as count,
                GROUP_CONCAT(DISTINCT machine_name) as machines
            FROM machine_status 
            WHERE DATE(last_updated) = CURDATE()
            GROUP BY current_status
        `);
        
        // Recent activities
        const [recentOutput] = await execute(`
            SELECT 
                machine, operator, partnumber, quantity, 
                quantity_ng, created_at
            FROM outputmc 
            ORDER BY created_at DESC 
            LIMIT 10
        `);
        
        // WIP status
        const [wipStatus] = await execute(`
            SELECT 
                COUNT(*) as total_lots,
                SUM(quantity) as total_quantity,
                COUNT(DISTINCT partnumber) as unique_parts
            FROM wip
        `);
        
        res.json({
            success: true,
            data: {
                today_production: todayProduction[0],
                machine_status: machineStatus,
                recent_output: recentOutput,
                wip_status: wipStatus[0],
                last_updated: new Date().toISOString()
            },
            message: 'Dashboard data berhasil diambil'
        });
        
    } catch (error) {
        console.error('Production Dashboard Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data dashboard produksi',
            error: error.message
        });
    }
});

// ================================================================
// MACHINE OUTPUT CRUD ENDPOINTS
// ================================================================

// GET - List all machine output records
router.get('/machine-output', async (req, res) => {
    try {
        const { machine, operator, partnumber, start_date, end_date, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT id, machine, operator, partnumber, customer, quantity, 
                   quantity_ng, shift, datetime_start, datetime_end, created_at, updated_at
            FROM outputmc
        `;
        
        let countQuery = `SELECT COUNT(*) as total FROM outputmc`;
        let params = [];
        let whereConditions = [];
        
        if (machine) {
            whereConditions.push('machine LIKE ?');
            params.push(`%${machine}%`);
        }
        
        if (operator) {
            whereConditions.push('operator LIKE ?');
            params.push(`%${operator}%`);
        }
        
        if (partnumber) {
            whereConditions.push('partnumber LIKE ?');
            params.push(`%${partnumber}%`);
        }
        
        if (start_date) {
            whereConditions.push('DATE(created_at) >= ?');
            params.push(start_date);
        }
        
        if (end_date) {
            whereConditions.push('DATE(created_at) <= ?');
            params.push(end_date);
        }
        
        if (whereConditions.length > 0) {
            const whereClause = ' WHERE ' + whereConditions.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }
        
        query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        
        const [records] = await execute(query, params);
        const [countResult] = await execute(countQuery, params);
        const total = countResult[0].total;
        
        res.json({
            success: true,
            data: records,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total,
                pages: Math.ceil(total / limit)
            },
            message: 'Data machine output berhasil diambil'
        });
        
    } catch (error) {
        console.error('Machine Output Get Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data machine output',
            error: error.message
        });
    }
});

// GET - Get specific machine output record
router.get('/machine-output/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [records] = await execute(`
            SELECT * FROM outputmc WHERE id = ?
        `, [id]);
        
        if (records.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data machine output tidak ditemukan'
            });
        }
        
        res.json({
            success: true,
            data: records[0],
            message: 'Data machine output berhasil diambil'
        });
        
    } catch (error) {
        console.error('Machine Output Get By ID Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data machine output',
            error: error.message
        });
    }
});

// POST - Create new machine output record
router.post('/machine-output', async (req, res) => {
    try {
        const { machine, operator, partnumber, customer, quantity, quantity_ng, shift, datetime_start, datetime_end } = req.body;
        
        // Validation
        if (!machine || !operator || !partnumber || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Data machine, operator, part number, dan quantity wajib diisi'
            });
        }
        
        const [result] = await execute(`
            INSERT INTO outputmc (machine, operator, partnumber, customer, quantity, quantity_ng, shift, datetime_start, datetime_end)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [machine, operator, partnumber, customer || '', quantity, quantity_ng || 0, shift || '', datetime_start, datetime_end]);
        
        res.status(201).json({
            success: true,
            data: { id: result.insertId },
            message: 'Data machine output berhasil ditambahkan'
        });
        
    } catch (error) {
        console.error('Machine Output Create Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan data machine output',
            error: error.message
        });
    }
});

// PUT - Update machine output record
router.put('/machine-output/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { machine, operator, partnumber, customer, quantity, quantity_ng, shift, datetime_start, datetime_end } = req.body;
        
        // Check if record exists
        const [existing] = await execute('SELECT id FROM outputmc WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data machine output tidak ditemukan'
            });
        }
        
        await execute(`
            UPDATE outputmc 
            SET machine = ?, operator = ?, partnumber = ?, customer = ?, quantity = ?, 
                quantity_ng = ?, shift = ?, datetime_start = ?, datetime_end = ?
            WHERE id = ?
        `, [machine, operator, partnumber, customer || '', quantity, quantity_ng || 0, shift || '', datetime_start, datetime_end, id]);
        
        res.json({
            success: true,
            message: 'Data machine output berhasil diupdate'
        });
        
    } catch (error) {
        console.error('Machine Output Update Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate data machine output',
            error: error.message
        });
    }
});

// DELETE - Delete machine output record
router.delete('/machine-output/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if record exists
        const [existing] = await execute('SELECT id FROM outputmc WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data machine output tidak ditemukan'
            });
        }
        
        await execute('DELETE FROM outputmc WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Data machine output berhasil dihapus'
        });
        
    } catch (error) {
        console.error('Machine Output Delete Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus data machine output',
            error: error.message
        });
    }
});

// ================================================================
// WIP INVENTORY CRUD ENDPOINTS
// ================================================================

// GET - List all WIP inventory records
router.get('/wip-inventory', async (req, res) => {
    try {
        const { partnumber, lotnumber, operator, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT id, partnumber, lotnumber, quantity, operator, pic_qc, 
                   pic_group_produksi, created_at, updated_at
            FROM wip
        `;
        
        let countQuery = `SELECT COUNT(*) as total FROM wip`;
        let params = [];
        let whereConditions = [];
        
        if (partnumber) {
            whereConditions.push('partnumber LIKE ?');
            params.push(`%${partnumber}%`);
        }
        
        if (lotnumber) {
            whereConditions.push('lotnumber LIKE ?');
            params.push(`%${lotnumber}%`);
        }
        
        if (operator) {
            whereConditions.push('operator LIKE ?');
            params.push(`%${operator}%`);
        }
        
        if (whereConditions.length > 0) {
            const whereClause = ' WHERE ' + whereConditions.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }
        
        query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        
        const [records] = await execute(query, params);
        const [countResult] = await execute(countQuery, params);
        const total = countResult[0].total;
        
        res.json({
            success: true,
            data: records,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total,
                pages: Math.ceil(total / limit)
            },
            message: 'Data WIP inventory berhasil diambil'
        });
        
    } catch (error) {
        console.error('WIP Inventory Get Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data WIP inventory',
            error: error.message
        });
    }
});

// GET - Get specific WIP inventory record
router.get('/wip-inventory/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [records] = await execute(`
            SELECT * FROM wip WHERE id = ?
        `, [id]);
        
        if (records.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data WIP inventory tidak ditemukan'
            });
        }
        
        res.json({
            success: true,
            data: records[0],
            message: 'Data WIP inventory berhasil diambil'
        });
        
    } catch (error) {
        console.error('WIP Inventory Get By ID Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data WIP inventory',
            error: error.message
        });
    }
});

// POST - Create new WIP inventory record
router.post('/wip-inventory', async (req, res) => {
    try {
        const { partnumber, lotnumber, quantity, operator, pic_qc, pic_group_produksi } = req.body;
        
        // Validation
        if (!partnumber || !lotnumber || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Part number, lot number, dan quantity wajib diisi'
            });
        }
        
        const [result] = await execute(`
            INSERT INTO wip (partnumber, lotnumber, quantity, operator, pic_qc, pic_group_produksi)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [partnumber, lotnumber, quantity, operator || '', pic_qc || '', pic_group_produksi || '']);
        
        res.status(201).json({
            success: true,
            data: { id: result.insertId },
            message: 'Data WIP inventory berhasil ditambahkan'
        });
        
    } catch (error) {
        console.error('WIP Inventory Create Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan data WIP inventory',
            error: error.message
        });
    }
});

// PUT - Update WIP inventory record
router.put('/wip-inventory/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { partnumber, lotnumber, quantity, operator, pic_qc, pic_group_produksi } = req.body;
        
        // Check if record exists
        const [existing] = await execute('SELECT id FROM wip WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data WIP inventory tidak ditemukan'
            });
        }
        
        await execute(`
            UPDATE wip 
            SET partnumber = ?, lotnumber = ?, quantity = ?, operator = ?, pic_qc = ?, pic_group_produksi = ?
            WHERE id = ?
        `, [partnumber, lotnumber, quantity, operator || '', pic_qc || '', pic_group_produksi || '', id]);
        
        res.json({
            success: true,
            message: 'Data WIP inventory berhasil diupdate'
        });
        
    } catch (error) {
        console.error('WIP Inventory Update Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate data WIP inventory',
            error: error.message
        });
    }
});

// DELETE - Delete WIP inventory record
router.delete('/wip-inventory/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if record exists
        const [existing] = await execute('SELECT id FROM wip WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data WIP inventory tidak ditemukan'
            });
        }
        
        await execute('DELETE FROM wip WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Data WIP inventory berhasil dihapus'
        });
        
    } catch (error) {
        console.error('WIP Inventory Delete Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus data WIP inventory',
            error: error.message
        });
    }
});

// ================================================================
// MACHINE STATUS CRUD ENDPOINTS
// ================================================================

// GET - List all machine status records
router.get('/machine-status', async (req, res) => {
    try {
        const { machine_name, current_status, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT id, machine_name, current_status, last_updated, operator_in_charge, 
                   maintenance_notes, created_at, updated_at
            FROM machine_status
        `;
        
        let countQuery = `SELECT COUNT(*) as total FROM machine_status`;
        let params = [];
        let whereConditions = [];
        
        if (machine_name) {
            whereConditions.push('machine_name LIKE ?');
            params.push(`%${machine_name}%`);
        }
        
        if (current_status) {
            whereConditions.push('current_status = ?');
            params.push(current_status);
        }
        
        if (whereConditions.length > 0) {
            const whereClause = ' WHERE ' + whereConditions.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }
        
        query += ` ORDER BY last_updated DESC LIMIT ${limit} OFFSET ${offset}`;
        
        const [records] = await execute(query, params);
        const [countResult] = await execute(countQuery, params);
        const total = countResult[0].total;
        
        res.json({
            success: true,
            data: records,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total,
                pages: Math.ceil(total / limit)
            },
            message: 'Data machine status berhasil diambil'
        });
        
    } catch (error) {
        console.error('Machine Status Get Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data machine status',
            error: error.message
        });
    }
});

// GET - Get specific machine status record
router.get('/machine-status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [records] = await execute(`
            SELECT * FROM machine_status WHERE id = ?
        `, [id]);
        
        if (records.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data machine status tidak ditemukan'
            });
        }
        
        res.json({
            success: true,
            data: records[0],
            message: 'Data machine status berhasil diambil'
        });
        
    } catch (error) {
        console.error('Machine Status Get By ID Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data machine status',
            error: error.message
        });
    }
});

// POST - Create new machine status record
router.post('/machine-status', async (req, res) => {
    try {
        const { machine_name, current_status, operator_in_charge, maintenance_notes } = req.body;
        
        // Validation
        if (!machine_name || !current_status) {
            return res.status(400).json({
                success: false,
                message: 'Machine name dan current status wajib diisi'
            });
        }
        
        const [result] = await execute(`
            INSERT INTO machine_status (machine_name, current_status, last_updated, operator_in_charge, maintenance_notes)
            VALUES (?, ?, NOW(), ?, ?)
        `, [machine_name, current_status, operator_in_charge || '', maintenance_notes || '']);
        
        res.status(201).json({
            success: true,
            data: { id: result.insertId },
            message: 'Data machine status berhasil ditambahkan'
        });
        
    } catch (error) {
        console.error('Machine Status Create Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan data machine status',
            error: error.message
        });
    }
});

// PUT - Update machine status record
router.put('/machine-status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { machine_name, current_status, operator_in_charge, maintenance_notes } = req.body;
        
        // Check if record exists
        const [existing] = await execute('SELECT id FROM machine_status WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data machine status tidak ditemukan'
            });
        }
        
        await execute(`
            UPDATE machine_status 
            SET machine_name = ?, current_status = ?, last_updated = NOW(), 
                operator_in_charge = ?, maintenance_notes = ?
            WHERE id = ?
        `, [machine_name, current_status, operator_in_charge || '', maintenance_notes || '', id]);
        
        res.json({
            success: true,
            message: 'Data machine status berhasil diupdate'
        });
        
    } catch (error) {
        console.error('Machine Status Update Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate data machine status',
            error: error.message
        });
    }
});

// DELETE - Delete machine status record
router.delete('/machine-status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if record exists
        const [existing] = await execute('SELECT id FROM machine_status WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data machine status tidak ditemukan'
            });
        }
        
        await execute('DELETE FROM machine_status WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Data machine status berhasil dihapus'
        });
        
    } catch (error) {
        console.error('Machine Status Delete Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus data machine status',
            error: error.message
        });
    }
});

// ================================================================
// PRODUCTION REPORTS ENDPOINTS
// ================================================================

// ✅ PRODUCTION REPORTS - Production reports
router.get('/reports', async (req, res) => {
    try {
        const { start_date, end_date, machine, operator } = req.query;
        
        let query = `
            SELECT 
                machine, operator, partnumber, customer,
                quantity, quantity_ng, created_at
            FROM outputmc
        `;
        
        let params = [];
        let whereConditions = [];
        
        if (start_date) {
            whereConditions.push('DATE(created_at) >= ?');
            params.push(start_date);
        }
        
        if (end_date) {
            whereConditions.push('DATE(created_at) <= ?');
            params.push(end_date);
        }
        
        if (machine) {
            whereConditions.push('machine = ?');
            params.push(machine);
        }
        
        if (operator) {
            whereConditions.push('operator = ?');
            params.push(operator);
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        query += ' ORDER BY created_at DESC';
        
        const [reports] = await execute(query, params);
        
        res.json({
            success: true,
            data: reports,
            filters: { start_date, end_date, machine, operator },
            message: 'Report produksi berhasil diambil'
        });
        
    } catch (error) {
        console.error('Production Reports Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil report produksi',
            error: error.message
        });
    }
});

module.exports = router;
