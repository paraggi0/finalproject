const express = require('express');
const router = express.Router();
const { execute } = require('../config/databaseAdapter');

/**
 * Warehouse Routes for Warehouse Management Module
 * Handles Finished Goods, Delivery Orders, Document Control, and Returns
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
function generateId(prefix = 'WH') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// =============================================================================
// Finished Goods Routes (/fg)
// =============================================================================

// GET all Finished Goods
router.get('/fg', webAuth, async (req, res) => {
    try {
        const { search, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT 
                id, timestamp, customer, partnumber, model, description, 
                quantity, location, batch_number, production_date, expiry_date, status
            FROM finished_goods
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
            message: 'Finished goods retrieved successfully'
        });
        
    } catch (error) {
        console.error('Error fetching finished goods:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch finished goods',
            error: error.message
        });
    }
});

// POST new Finished Good
router.post('/fg', webAuth, async (req, res) => {
    try {
        const { customer, partnumber, model, description, quantity, location, batch_number, production_date, expiry_date, status } = req.body;
        
        if (!customer || !partnumber || !description || !quantity || !location) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const id = generateId('FG');
        const timestamp = new Date().toISOString();
        
        const query = `
            INSERT INTO finished_goods 
            (id, timestamp, customer, partnumber, model, description, quantity, location, batch_number, production_date, expiry_date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await execute(query, [id, timestamp, customer, partnumber, model || '', description, quantity, location, batch_number || '', production_date || null, expiry_date || null, status || 'AVAILABLE']);
        
        res.status(201).json({
            success: true,
            data: { id, timestamp, customer, partnumber, model: model || '', description, quantity, location, batch_number: batch_number || '', production_date: production_date || null, expiry_date: expiry_date || null, status: status || 'AVAILABLE' },
            message: 'Finished good created successfully'
        });
        
    } catch (error) {
        console.error('Error creating finished good:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create finished good',
            error: error.message
        });
    }
});

// =============================================================================
// Delivery Orders Routes (/do)
// =============================================================================

// GET all Delivery Orders
router.get('/do', webAuth, async (req, res) => {
    try {
        const { search, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT 
                id, timestamp, do_number, customer, delivery_date, 
                total_items, total_quantity, status, driver, vehicle, remarks
            FROM delivery_orders
        `;
        
        const params = [];
        
        if (search) {
            query += ` WHERE (do_number LIKE ? OR customer LIKE ? OR driver LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        query += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));
        
        const [results] = await execute(query, params);
        
        res.json({
            success: true,
            data: results,
            total: results.length,
            message: 'Delivery orders retrieved successfully'
        });
        
    } catch (error) {
        console.error('Error fetching delivery orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch delivery orders',
            error: error.message
        });
    }
});

// POST new Delivery Order
router.post('/do', webAuth, async (req, res) => {
    try {
        const { do_number, customer, delivery_date, total_items, total_quantity, status, driver, vehicle, remarks } = req.body;
        
        if (!do_number || !customer || !delivery_date || !total_items || !total_quantity) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const id = generateId('DO');
        const timestamp = new Date().toISOString();
        
        const query = `
            INSERT INTO delivery_orders 
            (id, timestamp, do_number, customer, delivery_date, total_items, total_quantity, status, driver, vehicle, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await execute(query, [id, timestamp, do_number, customer, delivery_date, total_items, total_quantity, status || 'PENDING', driver || '', vehicle || '', remarks || '']);
        
        res.status(201).json({
            success: true,
            data: { id, timestamp, do_number, customer, delivery_date, total_items, total_quantity, status: status || 'PENDING', driver: driver || '', vehicle: vehicle || '', remarks: remarks || '' },
            message: 'Delivery order created successfully'
        });
        
    } catch (error) {
        console.error('Error creating delivery order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create delivery order',
            error: error.message
        });
    }
});

// =============================================================================
// Document Control Routes (/dc)
// =============================================================================

// GET all Document Control records
router.get('/dc', webAuth, async (req, res) => {
    try {
        const { search, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT 
                id, timestamp, document_type, document_number, document_title, 
                version, status, created_by, approved_by, effective_date, remarks
            FROM document_control
        `;
        
        const params = [];
        
        if (search) {
            query += ` WHERE (document_title LIKE ? OR document_number LIKE ? OR document_type LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        query += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));
        
        const [results] = await execute(query, params);
        
        res.json({
            success: true,
            data: results,
            total: results.length,
            message: 'Document control records retrieved successfully'
        });
        
    } catch (error) {
        console.error('Error fetching document control records:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch document control records',
            error: error.message
        });
    }
});

// POST new Document Control record
router.post('/dc', webAuth, async (req, res) => {
    try {
        const { document_type, document_number, document_title, version, status, created_by, approved_by, effective_date, remarks } = req.body;
        
        if (!document_type || !document_number || !document_title || !version || !created_by) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const id = generateId('DC');
        const timestamp = new Date().toISOString();
        
        const query = `
            INSERT INTO document_control 
            (id, timestamp, document_type, document_number, document_title, version, status, created_by, approved_by, effective_date, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await execute(query, [id, timestamp, document_type, document_number, document_title, version, status || 'DRAFT', created_by, approved_by || '', effective_date || null, remarks || '']);
        
        res.status(201).json({
            success: true,
            data: { id, timestamp, document_type, document_number, document_title, version, status: status || 'DRAFT', created_by, approved_by: approved_by || '', effective_date: effective_date || null, remarks: remarks || '' },
            message: 'Document control record created successfully'
        });
        
    } catch (error) {
        console.error('Error creating document control record:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create document control record',
            error: error.message
        });
    }
});

// =============================================================================
// Returns Routes (/return)
// =============================================================================

// GET all Return records
router.get('/return', webAuth, async (req, res) => {
    try {
        const { search, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT 
                id, timestamp, return_number, customer, product_code, product_name, 
                quantity, return_reason, return_date, status, inspector, remarks
            FROM returns
        `;
        
        const params = [];
        
        if (search) {
            query += ` WHERE (product_name LIKE ? OR customer LIKE ? OR return_number LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        query += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));
        
        const [results] = await execute(query, params);
        
        res.json({
            success: true,
            data: results,
            total: results.length,
            message: 'Return records retrieved successfully'
        });
        
    } catch (error) {
        console.error('Error fetching return records:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch return records',
            error: error.message
        });
    }
});

// POST new Return record
router.post('/return', webAuth, async (req, res) => {
    try {
        const { return_number, customer, product_code, product_name, quantity, return_reason, return_date, status, inspector, remarks } = req.body;
        
        if (!return_number || !customer || !product_code || !product_name || !quantity || !return_reason) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const id = generateId('RET');
        const timestamp = new Date().toISOString();
        
        const query = `
            INSERT INTO returns 
            (id, timestamp, return_number, customer, product_code, product_name, quantity, return_reason, return_date, status, inspector, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await execute(query, [id, timestamp, return_number, customer, product_code, product_name, quantity, return_reason, return_date || timestamp, status || 'PENDING', inspector || '', remarks || '']);
        
        res.status(201).json({
            success: true,
            data: { id, timestamp, return_number, customer, product_code, product_name, quantity, return_reason, return_date: return_date || timestamp, status: status || 'PENDING', inspector: inspector || '', remarks: remarks || '' },
            message: 'Return record created successfully'
        });
        
    } catch (error) {
        console.error('Error creating return record:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create return record',
            error: error.message
        });
    }
});

module.exports = router;
