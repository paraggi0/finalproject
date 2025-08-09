const express = require('express');
const router = express.Router();
const { execute } = require('../config/databaseAdapter');

/**
 * QC Routes for Quality Control Module
 * Handles IQC, OQC, RQC, and NG QC operations
 */

// Middleware untuk validasi web user
const webAuth = async (req, res, next) => {
    try {
        // Untuk development, skip authentication
        // Dalam production, implementasikan JWT validation
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized access'
        });
    }
};

// Generate unique ID
function generateId(prefix = 'QC') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// =============================================================================
// IQC (Incoming Quality Control) Routes
// =============================================================================

// GET all IQC records
router.get('/iqc', webAuth, async (req, res) => {
    try {
        const { search, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT 
                id, timestamp, supplier, material_code, material_name, 
                batch_number, quantity, inspector, status, remarks
            FROM iqc_records
        `;
        
        const params = [];
        
        if (search) {
            query += ` WHERE (material_name LIKE ? OR supplier LIKE ? OR batch_number LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        query += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));
        
        const [results] = await execute(query, params);
        
        res.json({
            success: true,
            data: results,
            total: results.length,
            message: 'IQC records retrieved successfully'
        });
        
    } catch (error) {
        console.error('Error fetching IQC records:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch IQC records',
            error: error.message
        });
    }
});

// POST new IQC record
router.post('/iqc', webAuth, async (req, res) => {
    try {
        const { supplier, material_code, material_name, batch_number, quantity, inspector, status, remarks } = req.body;
        
        if (!supplier || !material_code || !material_name || !batch_number || !quantity || !inspector) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const id = generateId('IQC');
        const timestamp = new Date().toISOString();
        
        const query = `
            INSERT INTO iqc_records 
            (id, timestamp, supplier, material_code, material_name, batch_number, quantity, inspector, status, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await execute(query, [id, timestamp, supplier, material_code, material_name, batch_number, quantity, inspector, status || 'PENDING', remarks || '']);
        
        res.status(201).json({
            success: true,
            data: { id, timestamp, supplier, material_code, material_name, batch_number, quantity, inspector, status: status || 'PENDING', remarks: remarks || '' },
            message: 'IQC record created successfully'
        });
        
    } catch (error) {
        console.error('Error creating IQC record:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create IQC record',
            error: error.message
        });
    }
});

// =============================================================================
// OQC (Outgoing Quality Control) Routes
// =============================================================================

// GET all OQC records
router.get('/oqc', webAuth, async (req, res) => {
    try {
        const { search, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT 
                id, timestamp, customer, partnumber, model, description, 
                batch_number, quantity, inspector, status, remarks
            FROM oqc_records
        `;
        
        const params = [];
        
        if (search) {
            query += ` WHERE (description LIKE ? OR customer LIKE ? OR partnumber LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        query += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));
        
        const [results] = await execute(query, params);
        
        res.json({
            success: true,
            data: results,
            total: results.length,
            message: 'OQC records retrieved successfully'
        });
        
    } catch (error) {
        console.error('Error fetching OQC records:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch OQC records',
            error: error.message
        });
    }
});

// POST new OQC record
router.post('/oqc', webAuth, async (req, res) => {
    try {
        const { customer, partnumber, model, description, batch_number, quantity, inspector, status, remarks } = req.body;
        
        if (!customer || !partnumber || !description || !batch_number || !quantity || !inspector) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const id = generateId('OQC');
        const timestamp = new Date().toISOString();
        
        const query = `
            INSERT INTO oqc_records 
            (id, timestamp, customer, partnumber, model, description, batch_number, quantity, inspector, status, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await execute(query, [id, timestamp, customer, partnumber, model || '', description, batch_number, quantity, inspector, status || 'PENDING', remarks || '']);
        
        res.status(201).json({
            success: true,
            data: { id, timestamp, customer, partnumber, model: model || '', description, batch_number, quantity, inspector, status: status || 'PENDING', remarks: remarks || '' },
            message: 'OQC record created successfully'
        });
        
    } catch (error) {
        console.error('Error creating OQC record:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create OQC record',
            error: error.message
        });
    }
});

// =============================================================================
// RQC (Received Quality Control) Routes
// =============================================================================

// GET all RQC records
router.get('/rqc', webAuth, async (req, res) => {
    try {
        const { search, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT 
                id, timestamp, supplier, material_code, material_name, 
                po_number, quantity_received, quantity_accepted, inspector, status, remarks
            FROM rqc_records
        `;
        
        const params = [];
        
        if (search) {
            query += ` WHERE (material_name LIKE ? OR supplier LIKE ? OR po_number LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        query += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));
        
        const [results] = await execute(query, params);
        
        res.json({
            success: true,
            data: results,
            total: results.length,
            message: 'RQC records retrieved successfully'
        });
        
    } catch (error) {
        console.error('Error fetching RQC records:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch RQC records',
            error: error.message
        });
    }
});

// POST new RQC record
router.post('/rqc', webAuth, async (req, res) => {
    try {
        const { supplier, material_code, material_name, po_number, quantity_received, quantity_accepted, inspector, status, remarks } = req.body;
        
        if (!supplier || !material_code || !material_name || !po_number || !quantity_received || !inspector) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const id = generateId('RQC');
        const timestamp = new Date().toISOString();
        
        const query = `
            INSERT INTO rqc_records 
            (id, timestamp, supplier, material_code, material_name, po_number, quantity_received, quantity_accepted, inspector, status, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await execute(query, [id, timestamp, supplier, material_code, material_name, po_number, quantity_received, quantity_accepted || quantity_received, inspector, status || 'PENDING', remarks || '']);
        
        res.status(201).json({
            success: true,
            data: { id, timestamp, supplier, material_code, material_name, po_number, quantity_received, quantity_accepted: quantity_accepted || quantity_received, inspector, status: status || 'PENDING', remarks: remarks || '' },
            message: 'RQC record created successfully'
        });
        
    } catch (error) {
        console.error('Error creating RQC record:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create RQC record',
            error: error.message
        });
    }
});

// =============================================================================
// NG QC (Non-Good Quality Control) Routes
// =============================================================================

// GET all NG QC records
router.get('/ng-qc', webAuth, async (req, res) => {
    try {
        const { search, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT 
                id, timestamp, source_type, source_id, defect_type, 
                quantity_ng, inspector, action_taken, status, remarks
            FROM ng_qc_records
        `;
        
        const params = [];
        
        if (search) {
            query += ` WHERE (defect_type LIKE ? OR source_id LIKE ? OR action_taken LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        query += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));
        
        const [results] = await execute(query, params);
        
        res.json({
            success: true,
            data: results,
            total: results.length,
            message: 'NG QC records retrieved successfully'
        });
        
    } catch (error) {
        console.error('Error fetching NG QC records:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch NG QC records',
            error: error.message
        });
    }
});

// GET /ngqc alias for ng-qc (untuk compatibility)
router.get('/ngqc', webAuth, (req, res) => {
    req.url = '/ng-qc';
    router.handle(req, res);
});

// POST new NG QC record
router.post('/ng-qc', webAuth, async (req, res) => {
    try {
        const { source_type, source_id, defect_type, quantity_ng, inspector, action_taken, status, remarks } = req.body;
        
        if (!source_type || !source_id || !defect_type || !quantity_ng || !inspector) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const id = generateId('NGQC');
        const timestamp = new Date().toISOString();
        
        const query = `
            INSERT INTO ng_qc_records 
            (id, timestamp, source_type, source_id, defect_type, quantity_ng, inspector, action_taken, status, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await execute(query, [id, timestamp, source_type, source_id, defect_type, quantity_ng, inspector, action_taken || '', status || 'PENDING', remarks || '']);
        
        res.status(201).json({
            success: true,
            data: { id, timestamp, source_type, source_id, defect_type, quantity_ng, inspector, action_taken: action_taken || '', status: status || 'PENDING', remarks: remarks || '' },
            message: 'NG QC record created successfully'
        });
        
    } catch (error) {
        console.error('Error creating NG QC record:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create NG QC record',
            error: error.message
        });
    }
});

module.exports = router;
