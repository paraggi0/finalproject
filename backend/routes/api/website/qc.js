/**
 * Website Quality Control API - Enhanced CRUD Operations
 * PT. Topline Evergreen Manufacturing
 * Web QC: Dashboard, Reports, IQC, OQC, RQC, NG Management
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
// QC DASHBOARD ENDPOINTS
// ================================================================

// ✅ QC DASHBOARD - Data for QC dashboard
router.get('/dashboard', async (req, res) => {
    try {
        // Today's QC summary
        const [todayQC] = await execute(`
            SELECT 
                'incoming' as qc_type,
                COUNT(*) as total_inspections,
                SUM(quantity) as total_quantity,
                COUNT(CASE WHEN status = 'pass' THEN 1 END) as passed,
                COUNT(CASE WHEN status = 'fail' THEN 1 END) as failed
            FROM iqc_records 
            WHERE DATE(created_at) = CURDATE()
        `);
        
        // NG summary - from production data
        const [ngSummary] = await execute(`
            SELECT 
                'production_ng' as defect_type,
                COUNT(*) as count,
                SUM(quantity_ng) as total_ng_quantity
            FROM outputmc 
            WHERE DATE(created_at) = CURDATE() AND quantity_ng > 0
        `);
        
        // Recent QC activities
        const [recentQC] = await execute(`
            SELECT 
                'incoming' as type, part_number as partnumber, lot_number as lotnumber, 
                quantity, status as inspection_result, inspector, created_at as activity_date
            FROM iqc_records 
            WHERE DATE(created_at) = CURDATE()
            ORDER BY activity_date DESC
            LIMIT 10
        `);
        
        res.json({
            success: true,
            data: {
                today_qc_summary: todayQC,
                ng_summary: ngSummary,
                recent_activities: recentQC,
                last_updated: new Date().toISOString()
            },
            message: 'QC Dashboard data berhasil diambil'
        });
        
    } catch (error) {
        console.error('QC Dashboard Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data QC dashboard',
            error: error.message
        });
    }
});

// ================================================================
// IQC (INCOMING QUALITY CONTROL) CRUD ENDPOINTS
// ================================================================

// GET - List all IQC records
router.get('/iqc', async (req, res) => {
    try {
        const { part_number, lot_number, inspector, status, start_date, end_date, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT id, part_number, lot_number, quantity, supplier, inspector, 
                   status, inspection_date, notes, created_at, updated_at
            FROM iqc_records
        `;
        
        let countQuery = `SELECT COUNT(*) as total FROM iqc_records`;
        let params = [];
        let whereConditions = [];
        
        if (part_number) {
            whereConditions.push('part_number LIKE ?');
            params.push(`%${part_number}%`);
        }
        
        if (lot_number) {
            whereConditions.push('lot_number LIKE ?');
            params.push(`%${lot_number}%`);
        }
        
        if (inspector) {
            whereConditions.push('inspector LIKE ?');
            params.push(`%${inspector}%`);
        }
        
        if (status) {
            whereConditions.push('status = ?');
            params.push(status);
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
            message: 'Data IQC berhasil diambil'
        });
        
    } catch (error) {
        console.error('IQC Get Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data IQC',
            error: error.message
        });
    }
});

// GET - Get specific IQC record
router.get('/iqc/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [records] = await execute(`
            SELECT * FROM iqc_records WHERE id = ?
        `, [id]);
        
        if (records.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data IQC tidak ditemukan'
            });
        }
        
        res.json({
            success: true,
            data: records[0],
            message: 'Data IQC berhasil diambil'
        });
        
    } catch (error) {
        console.error('IQC Get By ID Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data IQC',
            error: error.message
        });
    }
});

// POST - Create new IQC record
router.post('/iqc', async (req, res) => {
    try {
        const { part_number, lot_number, quantity, supplier, inspector, status, inspection_date, notes } = req.body;
        
        // Validation
        if (!part_number || !lot_number || !quantity || !inspector || !status) {
            return res.status(400).json({
                success: false,
                message: 'Part number, lot number, quantity, inspector, dan status wajib diisi'
            });
        }
        
        const [result] = await execute(`
            INSERT INTO iqc_records (part_number, lot_number, quantity, supplier, inspector, status, inspection_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [part_number, lot_number, quantity, supplier || '', inspector, status, inspection_date || null, notes || '']);
        
        res.status(201).json({
            success: true,
            data: { id: result.insertId },
            message: 'Data IQC berhasil ditambahkan'
        });
        
    } catch (error) {
        console.error('IQC Create Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan data IQC',
            error: error.message
        });
    }
});

// PUT - Update IQC record
router.put('/iqc/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { part_number, lot_number, quantity, supplier, inspector, status, inspection_date, notes } = req.body;
        
        // Check if record exists
        const [existing] = await execute('SELECT id FROM iqc_records WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data IQC tidak ditemukan'
            });
        }
        
        await execute(`
            UPDATE iqc_records 
            SET part_number = ?, lot_number = ?, quantity = ?, supplier = ?, 
                inspector = ?, status = ?, inspection_date = ?, notes = ?
            WHERE id = ?
        `, [part_number, lot_number, quantity, supplier || '', inspector, status, inspection_date || null, notes || '', id]);
        
        res.json({
            success: true,
            message: 'Data IQC berhasil diupdate'
        });
        
    } catch (error) {
        console.error('IQC Update Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate data IQC',
            error: error.message
        });
    }
});

// DELETE - Delete IQC record
router.delete('/iqc/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if record exists
        const [existing] = await execute('SELECT id FROM iqc_records WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data IQC tidak ditemukan'
            });
        }
        
        await execute('DELETE FROM iqc_records WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Data IQC berhasil dihapus'
        });
        
    } catch (error) {
        console.error('IQC Delete Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus data IQC',
            error: error.message
        });
    }
});

// ================================================================
// OQC (OUTGOING QUALITY CONTROL) CRUD ENDPOINTS
// ================================================================

// GET - List all OQC records
router.get('/oqc', async (req, res) => {
    try {
        const { part_number, lot_number, inspector, status, start_date, end_date, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT id, part_number, lot_number, quantity, customer, inspector, 
                   status, inspection_date, packaging_status, notes, created_at, updated_at
            FROM oqc_records
        `;
        
        let countQuery = `SELECT COUNT(*) as total FROM oqc_records`;
        let params = [];
        let whereConditions = [];
        
        if (part_number) {
            whereConditions.push('part_number LIKE ?');
            params.push(`%${part_number}%`);
        }
        
        if (lot_number) {
            whereConditions.push('lot_number LIKE ?');
            params.push(`%${lot_number}%`);
        }
        
        if (inspector) {
            whereConditions.push('inspector LIKE ?');
            params.push(`%${inspector}%`);
        }
        
        if (status) {
            whereConditions.push('status = ?');
            params.push(status);
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
            message: 'Data OQC berhasil diambil'
        });
        
    } catch (error) {
        console.error('OQC Get Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data OQC',
            error: error.message
        });
    }
});

// POST - Create new OQC record
router.post('/oqc', async (req, res) => {
    try {
        const { part_number, lot_number, quantity, customer, inspector, status, inspection_date, packaging_status, notes } = req.body;
        
        // Validation
        if (!part_number || !lot_number || !quantity || !inspector || !status) {
            return res.status(400).json({
                success: false,
                message: 'Part number, lot number, quantity, inspector, dan status wajib diisi'
            });
        }
        
        const [result] = await execute(`
            INSERT INTO oqc_records (part_number, lot_number, quantity, customer, inspector, status, inspection_date, packaging_status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [part_number, lot_number, quantity, customer || '', inspector, status, inspection_date || null, packaging_status || '', notes || '']);
        
        res.status(201).json({
            success: true,
            data: { id: result.insertId },
            message: 'Data OQC berhasil ditambahkan'
        });
        
    } catch (error) {
        console.error('OQC Create Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan data OQC',
            error: error.message
        });
    }
});

// PUT - Update OQC record
router.put('/oqc/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { part_number, lot_number, quantity, customer, inspector, status, inspection_date, packaging_status, notes } = req.body;
        
        // Check if record exists
        const [existing] = await execute('SELECT id FROM oqc_records WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data OQC tidak ditemukan'
            });
        }
        
        await execute(`
            UPDATE oqc_records 
            SET part_number = ?, lot_number = ?, quantity = ?, customer = ?, 
                inspector = ?, status = ?, inspection_date = ?, packaging_status = ?, notes = ?
            WHERE id = ?
        `, [part_number, lot_number, quantity, customer || '', inspector, status, inspection_date || null, packaging_status || '', notes || '', id]);
        
        res.json({
            success: true,
            message: 'Data OQC berhasil diupdate'
        });
        
    } catch (error) {
        console.error('OQC Update Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate data OQC',
            error: error.message
        });
    }
});

// DELETE - Delete OQC record
router.delete('/oqc/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if record exists
        const [existing] = await execute('SELECT id FROM oqc_records WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data OQC tidak ditemukan'
            });
        }
        
        await execute('DELETE FROM oqc_records WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Data OQC berhasil dihapus'
        });
        
    } catch (error) {
        console.error('OQC Delete Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus data OQC',
            error: error.message
        });
    }
});

// ================================================================
// RQC (REWORK QUALITY CONTROL) CRUD ENDPOINTS  
// ================================================================

// GET - List all RQC records
router.get('/rqc', async (req, res) => {
    try {
        const { part_number, lot_number, rework_type, status, start_date, end_date, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT id, part_number, lot_number, original_quantity, rework_quantity, 
                   rework_type, status, inspector, rework_date, completion_date, notes, created_at, updated_at
            FROM rqc_records
        `;
        
        let countQuery = `SELECT COUNT(*) as total FROM rqc_records`;
        let params = [];
        let whereConditions = [];
        
        if (part_number) {
            whereConditions.push('part_number LIKE ?');
            params.push(`%${part_number}%`);
        }
        
        if (lot_number) {
            whereConditions.push('lot_number LIKE ?');
            params.push(`%${lot_number}%`);
        }
        
        if (rework_type) {
            whereConditions.push('rework_type = ?');
            params.push(rework_type);
        }
        
        if (status) {
            whereConditions.push('status = ?');
            params.push(status);
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
            message: 'Data RQC berhasil diambil'
        });
        
    } catch (error) {
        console.error('RQC Get Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data RQC',
            error: error.message
        });
    }
});

// POST - Create new RQC record
router.post('/rqc', async (req, res) => {
    try {
        const { part_number, lot_number, original_quantity, rework_quantity, rework_type, status, inspector, rework_date, completion_date, notes } = req.body;
        
        // Validation
        if (!part_number || !lot_number || !original_quantity || !rework_type || !status) {
            return res.status(400).json({
                success: false,
                message: 'Part number, lot number, original quantity, rework type, dan status wajib diisi'
            });
        }
        
        const [result] = await execute(`
            INSERT INTO rqc_records (part_number, lot_number, original_quantity, rework_quantity, rework_type, status, inspector, rework_date, completion_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [part_number, lot_number, original_quantity, rework_quantity || 0, rework_type, status, inspector || '', rework_date || null, completion_date || null, notes || '']);
        
        res.status(201).json({
            success: true,
            data: { id: result.insertId },
            message: 'Data RQC berhasil ditambahkan'
        });
        
    } catch (error) {
        console.error('RQC Create Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan data RQC',
            error: error.message
        });
    }
});

// PUT - Update RQC record
router.put('/rqc/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { part_number, lot_number, original_quantity, rework_quantity, rework_type, status, inspector, rework_date, completion_date, notes } = req.body;
        
        // Check if record exists
        const [existing] = await execute('SELECT id FROM rqc_records WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data RQC tidak ditemukan'
            });
        }
        
        await execute(`
            UPDATE rqc_records 
            SET part_number = ?, lot_number = ?, original_quantity = ?, rework_quantity = ?, 
                rework_type = ?, status = ?, inspector = ?, rework_date = ?, completion_date = ?, notes = ?
            WHERE id = ?
        `, [part_number, lot_number, original_quantity, rework_quantity || 0, rework_type, status, inspector || '', rework_date || null, completion_date || null, notes || '', id]);
        
        res.json({
            success: true,
            message: 'Data RQC berhasil diupdate'
        });
        
    } catch (error) {
        console.error('RQC Update Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate data RQC',
            error: error.message
        });
    }
});

// DELETE - Delete RQC record
router.delete('/rqc/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if record exists
        const [existing] = await execute('SELECT id FROM rqc_records WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data RQC tidak ditemukan'
            });
        }
        
        await execute('DELETE FROM rqc_records WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Data RQC berhasil dihapus'
        });
        
    } catch (error) {
        console.error('RQC Delete Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus data RQC',
            error: error.message
        });
    }
});

// ================================================================
// NG (NOT GOOD) MANAGEMENT CRUD ENDPOINTS
// ================================================================

// GET - List all NG records
router.get('/ng', async (req, res) => {
    try {
        const { part_number, defect_type, disposition, start_date, end_date, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT id, part_number, lot_number, quantity_ng, defect_type, defect_description, 
                   disposition, inspector, detection_date, notes, created_at, updated_at
            FROM ng_records
        `;
        
        let countQuery = `SELECT COUNT(*) as total FROM ng_records`;
        let params = [];
        let whereConditions = [];
        
        if (part_number) {
            whereConditions.push('part_number LIKE ?');
            params.push(`%${part_number}%`);
        }
        
        if (defect_type) {
            whereConditions.push('defect_type = ?');
            params.push(defect_type);
        }
        
        if (disposition) {
            whereConditions.push('disposition = ?');
            params.push(disposition);
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
            message: 'Data NG berhasil diambil'
        });
        
    } catch (error) {
        console.error('NG Get Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data NG',
            error: error.message
        });
    }
});

// POST - Create new NG record
router.post('/ng', async (req, res) => {
    try {
        const { part_number, lot_number, quantity_ng, defect_type, defect_description, disposition, inspector, detection_date, notes } = req.body;
        
        // Validation
        if (!part_number || !quantity_ng || !defect_type || !disposition) {
            return res.status(400).json({
                success: false,
                message: 'Part number, quantity NG, defect type, dan disposition wajib diisi'
            });
        }
        
        const [result] = await execute(`
            INSERT INTO ng_records (part_number, lot_number, quantity_ng, defect_type, defect_description, disposition, inspector, detection_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [part_number, lot_number || '', quantity_ng, defect_type, defect_description || '', disposition, inspector || '', detection_date || null, notes || '']);
        
        res.status(201).json({
            success: true,
            data: { id: result.insertId },
            message: 'Data NG berhasil ditambahkan'
        });
        
    } catch (error) {
        console.error('NG Create Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan data NG',
            error: error.message
        });
    }
});

// PUT - Update NG record
router.put('/ng/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { part_number, lot_number, quantity_ng, defect_type, defect_description, disposition, inspector, detection_date, notes } = req.body;
        
        // Check if record exists
        const [existing] = await execute('SELECT id FROM ng_records WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data NG tidak ditemukan'
            });
        }
        
        await execute(`
            UPDATE ng_records 
            SET part_number = ?, lot_number = ?, quantity_ng = ?, defect_type = ?, 
                defect_description = ?, disposition = ?, inspector = ?, detection_date = ?, notes = ?
            WHERE id = ?
        `, [part_number, lot_number || '', quantity_ng, defect_type, defect_description || '', disposition, inspector || '', detection_date || null, notes || '', id]);
        
        res.json({
            success: true,
            message: 'Data NG berhasil diupdate'
        });
        
    } catch (error) {
        console.error('NG Update Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate data NG',
            error: error.message
        });
    }
});

// DELETE - Delete NG record
router.delete('/ng/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if record exists
        const [existing] = await execute('SELECT id FROM ng_records WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data NG tidak ditemukan'
            });
        }
        
        await execute('DELETE FROM ng_records WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Data NG berhasil dihapus'
        });
        
    } catch (error) {
        console.error('NG Delete Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus data NG',
            error: error.message
        });
    }
});

// ================================================================
// QC REPORTS ENDPOINTS
// ================================================================

// ✅ QC REPORTS - QC reports
router.get('/reports', async (req, res) => {
    try {
        const { start_date, end_date, qc_type, inspector } = req.query;
        
        let reports = [];
        
        // Incoming QC Reports
        if (!qc_type || qc_type === 'incoming') {
            let iqcQuery = `
                SELECT 
                    'incoming' as qc_type, part_number as partnumber, lot_number as lotnumber, quantity,
                    supplier, inspector, status as inspection_result, notes, created_at as inspection_date
                FROM iqc_records
            `;
            
            let iqcParams = [];
            let iqcConditions = [];
            
            if (start_date) {
                iqcConditions.push('DATE(created_at) >= ?');
                iqcParams.push(start_date);
            }
            
            if (end_date) {
                iqcConditions.push('DATE(created_at) <= ?');
                iqcParams.push(end_date);
            }
            
            if (inspector) {
                iqcConditions.push('inspector = ?');
                iqcParams.push(inspector);
            }
            
            if (iqcConditions.length > 0) {
                iqcQuery += ' WHERE ' + iqcConditions.join(' AND ');
            }
            
            iqcQuery += ' ORDER BY created_at DESC';
            
            const [iqcReports] = await execute(iqcQuery, iqcParams);
            reports = reports.concat(iqcReports);
        }
        
        // Outgoing QC Reports
        if (!qc_type || qc_type === 'outgoing') {
            let oqcQuery = `
                SELECT 
                    'outgoing' as qc_type, part_number as partnumber, lot_number as lotnumber, quantity,
                    customer as supplier, inspector, status as inspection_result, notes, created_at as inspection_date
                FROM oqc_records
            `;
            
            let oqcParams = [];
            let oqcConditions = [];
            
            if (start_date) {
                oqcConditions.push('DATE(created_at) >= ?');
                oqcParams.push(start_date);
            }
            
            if (end_date) {
                oqcConditions.push('DATE(created_at) <= ?');
                oqcParams.push(end_date);
            }
            
            if (inspector) {
                oqcConditions.push('inspector = ?');
                oqcParams.push(inspector);
            }
            
            if (oqcConditions.length > 0) {
                oqcQuery += ' WHERE ' + oqcConditions.join(' AND ');
            }
            
            oqcQuery += ' ORDER BY created_at DESC';
            
            const [oqcReports] = await execute(oqcQuery, oqcParams);
            reports = reports.concat(oqcReports);
        }
        
        // Sort all reports by date
        reports.sort((a, b) => new Date(b.inspection_date) - new Date(a.inspection_date));
        
        res.json({
            success: true,
            data: reports,
            filters: { start_date, end_date, qc_type, inspector },
            message: 'QC Reports berhasil diambil'
        });
        
    } catch (error) {
        console.error('QC Reports Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil QC reports',
            error: error.message
        });
    }
});

module.exports = router;
