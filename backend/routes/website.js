const express = require('express');
const router = express.Router();
const { execute } = require('../config/databaseAdapter');

/**
 * Website CRUD Routes
 * Full CRUD operations for web interface
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
function generateId(prefix = 'ID') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// =============================================================================
// WIP CRUD
// =============================================================================

// GET all WIP items
router.get('/wip', webAuth, async (req, res) => {
    try {
        const { search, limit = 50, offset = 0 } = req.query;
        
        // Set headers to prevent caching - always get fresh data
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
        let query = `
            SELECT 
                id, timestamp, customer, partnumber, model, description, lotnumber,
                quantity, operator, pic_qc, pic_group_produksi
            FROM wip
        `;
        
        let params = [];
        let whereConditions = [];
        
        if (search) {
            whereConditions.push('(partnumber LIKE ? OR model LIKE ? OR lotnumber LIKE ? OR operator LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        const safeLimit = parseInt(limit) || 50;
        const safeOffset = parseInt(offset) || 0;
        query += ` ORDER BY timestamp DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        const [rows] = await execute(query, params);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length,
            timestamp: new Date().toISOString(),
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
        
    } catch (error) {
        console.error('Get WIP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch WIP data',
            error: error.message
        });
    }
});

// POST new WIP item
router.post('/wip', webAuth, async (req, res) => {
    try {
        const { partnumber, model, description, lotnumber, quantity, operator, pic_qc, pic_group_produksi } = req.body;
        
        if (!partnumber || !model || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Part number, model, and quantity are required'
            });
        }
        
        const [result] = await execute(
            `INSERT INTO wip (partnumber, model, description, lotnumber, quantity, operator, pic_qc, pic_group_produksi) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [partnumber, model, description || '', lotnumber || '', quantity, operator || '', pic_qc || '', pic_group_produksi || '']
        );
        
        res.json({
            success: true,
            message: 'WIP item created successfully',
            data: {
                id: result.insertId,
                partnumber,
                model,
                description,
                lotnumber,
                quantity,
                operator,
                pic_qc,
                pic_group_produksi
            }
        });
        
    } catch (error) {
        console.error('Create WIP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create WIP item',
            error: error.message
        });
    }
});

// PUT update WIP item
router.put('/wip/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        
        if (!quantity) {
            return res.status(400).json({
                success: false,
                message: 'Quantity is required'
            });
        }
        
        const [result] = await execute(
            'UPDATE wip SET quantity = ? WHERE id = ?',
            [quantity, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'WIP item not found'
            });
        }
        
        res.json({
            success: true,
            message: 'WIP item updated successfully'
        });
        
    } catch (error) {
        console.error('Update WIP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update WIP item',
            error: error.message
        });
    }
});

// DELETE WIP item
router.delete('/wip/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await execute(
            'DELETE FROM wip WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'WIP item not found'
            });
        }
        
        res.json({
            success: true,
            message: 'WIP item deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete WIP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete WIP item',
            error: error.message
        });
    }
});

// =============================================================================
// MACHINE OUTPUT CRUD
// =============================================================================

// GET all machine output
router.get('/machine-output', webAuth, async (req, res) => {
    try {
        const { search, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT 
                id, timestamp, customer, partnumber, model, description,
                quantity, quantity_ng, machine, operator
            FROM outputmc
        `;
        
        let params = [];
        let whereConditions = [];
        
        if (search) {
            whereConditions.push('(partnumber LIKE ? OR model LIKE ? OR machine LIKE ? OR operator LIKE ? OR customer LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        const safeLimit = parseInt(limit) || 50;
        const safeOffset = parseInt(offset) || 0;
        query += ` ORDER BY timestamp DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        const [rows] = await execute(query, params);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
        
    } catch (error) {
        console.error('Get machine output error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch machine output data',
            error: error.message
        });
    }
});

// POST new machine output
router.post('/machine-output', webAuth, async (req, res) => {
    try {
        const { customer, partnumber, model, description, quantity, quantity_ng, machine, operator } = req.body;
        
        if (!partnumber || !model || !quantity || !machine) {
            return res.status(400).json({
                success: false,
                message: 'Part number, model, quantity, and machine are required'
            });
        }
        
        const [result] = await execute(
            `INSERT INTO outputmc (customer, partnumber, model, description, quantity, quantity_ng, machine, operator) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [customer || '', partnumber, model, description || '', quantity, quantity_ng || 0, machine, operator || '']
        );
        
        res.json({
            success: true,
            message: 'Machine output created successfully',
            data: {
                id: result.insertId,
                customer,
                partnumber,
                model,
                description,
                quantity,
                quantity_ng,
                machine,
                operator
            }
        });
        
    } catch (error) {
        console.error('Create machine output error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create machine output',
            error: error.message
        });
    }
});

// PUT update machine output
router.put('/machine-output/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, quantity_ng } = req.body;
        
        if (!quantity) {
            return res.status(400).json({
                success: false,
                message: 'Quantity is required'
            });
        }
        
        const [result] = await execute(
            'UPDATE outputmc SET quantity = ?, quantity_ng = ? WHERE id = ?',
            [quantity, quantity_ng || 0, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Machine output not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Machine output updated successfully'
        });
        
    } catch (error) {
        console.error('Update machine output error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update machine output',
            error: error.message
        });
    }
});

// DELETE machine output
router.delete('/machine-output/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await execute(
            'DELETE FROM outputmc WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Machine output not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Machine output deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete machine output error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete machine output',
            error: error.message
        });
    }
});

// =============================================================================
// MACHINES CRUD
// =============================================================================

// GET all machines
router.get('/machines', webAuth, async (req, res) => {
    try {
        const { search, status, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT 
                id, machine_code, machine_name, machine_type, location,
                capacity_per_hour, status, last_maintenance_date, 
                next_maintenance_date, is_active, created_at, updated_at
            FROM machines
        `;
        
        let params = [];
        let whereConditions = [];
        
        if (search) {
            whereConditions.push('(machine_code LIKE ? OR machine_name LIKE ? OR location LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (status) {
            whereConditions.push('status = ?');
            params.push(status);
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        // Use string interpolation for LIMIT/OFFSET
        const safeLimit = parseInt(limit) || 50;
        const safeOffset = parseInt(offset) || 0;
        query += ` ORDER BY machine_code LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        const [rows] = await execute(query, params);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
        
    } catch (error) {
        console.error('Get machines error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch machines',
            error: error.message
        });
    }
});

// GET single machine by ID
router.get('/machines/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await execute(
            'SELECT * FROM machines WHERE id = ?',
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
        
    } catch (error) {
        console.error('Get machine error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch machine',
            error: error.message
        });
    }
});

// POST create new machine
router.post('/machines', webAuth, async (req, res) => {
    try {
        const {
            machine_code,
            machine_name,
            machine_type,
            location,
            capacity_per_hour,
            status = 'inactive',
            last_maintenance_date,
            next_maintenance_date
        } = req.body;
        
        // Validate required fields
        if (!machine_code || !machine_name || !machine_type || !location) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: machine_code, machine_name, machine_type, location'
            });
        }
        
        const machineId = generateId('MC');
        
        const [result] = await execute(`
            INSERT INTO machines (
                id, machine_code, machine_name, machine_type, location,
                capacity_per_hour, status, last_maintenance_date, next_maintenance_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            machineId, machine_code, machine_name, machine_type, location,
            capacity_per_hour || 0, status, last_maintenance_date || null, next_maintenance_date || null
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Machine created successfully',
            data: {
                id: machineId,
                machine_code,
                machine_name,
                machine_type,
                location,
                capacity_per_hour: capacity_per_hour || 0,
                status
            }
        });
        
    } catch (error) {
        console.error('Create machine error:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Machine code already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create machine',
            error: error.message
        });
    }
});

// PUT update machine
router.put('/machines/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            machine_code,
            machine_name,
            machine_type,
            location,
            capacity_per_hour,
            status,
            last_maintenance_date,
            next_maintenance_date
        } = req.body;
        
        // Check if machine exists
        const [existing] = await execute('SELECT id FROM machines WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }
        
        const [result] = await execute(`
            UPDATE machines SET 
                machine_code = ?, machine_name = ?, machine_type = ?, location = ?,
                capacity_per_hour = ?, status = ?, last_maintenance_date = ?, 
                next_maintenance_date = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            machine_code, machine_name, machine_type, location,
            capacity_per_hour, status, last_maintenance_date, next_maintenance_date, id
        ]);
        
        res.json({
            success: true,
            message: 'Machine updated successfully',
            data: { id, ...req.body }
        });
        
    } catch (error) {
        console.error('Update machine error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update machine',
            error: error.message
        });
    }
});

// DELETE machine
router.delete('/machines/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if machine exists
        const [existing] = await execute('SELECT id FROM machines WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }
        
        // Soft delete by setting is_active = false
        await execute(
            'UPDATE machines SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        
        res.json({
            success: true,
            message: 'Machine deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete machine error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete machine',
            error: error.message
        });
    }
});

// =============================================================================
// PRODUCTS CRUD
// =============================================================================

// GET all products
router.get('/products', webAuth, async (req, res) => {
    try {
        const { search, type, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT id, product_code, product_name, product_type, unit_of_measure,
                   standard_cost, description, is_active, created_at, updated_at
            FROM products
        `;
        
        let params = [];
        let whereConditions = [];
        
        if (search) {
            whereConditions.push('(product_code LIKE ? OR product_name LIKE ? OR description LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (type) {
            whereConditions.push('product_type = ?');
            params.push(type);
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        // Use string interpolation for LIMIT/OFFSET
        const safeLimit = parseInt(limit) || 50;
        const safeOffset = parseInt(offset) || 0;
        query += ` ORDER BY product_code LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        const [rows] = await execute(query, params);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
        
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
});

// POST create new product
router.post('/products', webAuth, async (req, res) => {
    try {
        const {
            product_code,
            product_name,
            product_type,
            unit_of_measure,
            standard_cost = 0.00,
            description
        } = req.body;
        
        // Validate required fields
        if (!product_code || !product_name || !product_type || !unit_of_measure) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: product_code, product_name, product_type, unit_of_measure'
            });
        }
        
        const productId = generateId('PROD');
        
        const [result] = await execute(`
            INSERT INTO products (
                id, product_code, product_name, product_type, unit_of_measure,
                standard_cost, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            productId, product_code, product_name, product_type, unit_of_measure,
            standard_cost, description
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: {
                id: productId,
                product_code,
                product_name,
                product_type,
                unit_of_measure,
                standard_cost,
                description
            }
        });
        
    } catch (error) {
        console.error('Create product error:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Product code already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
});

// PUT update product
router.put('/products/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            product_code,
            product_name,
            product_type,
            unit_of_measure,
            standard_cost,
            description
        } = req.body;
        
        // Check if product exists
        const [existing] = await execute('SELECT id FROM products WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        const [result] = await execute(`
            UPDATE products SET 
                product_code = ?, product_name = ?, product_type = ?, unit_of_measure = ?,
                standard_cost = ?, description = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            product_code, product_name, product_type, unit_of_measure,
            standard_cost, description, id
        ]);
        
        res.json({
            success: true,
            message: 'Product updated successfully',
            data: { id, ...req.body }
        });
        
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
});

// DELETE product
router.delete('/products/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if product exists
        const [existing] = await execute('SELECT id FROM products WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Soft delete by setting is_active = false
        await execute(
            'UPDATE products SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
});

// =============================================================================
// OUTPUT MC CRUD
// =============================================================================

// GET all output records
router.get('/output', webAuth, async (req, res) => {
    try {
        const { search, machine, status, date_from, date_to, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT id, part_number, model, machine, quantity, quality_grade,
                   operator, completion_time, status, created_at, updated_at
            FROM output_mc
        `;
        
        let params = [];
        let whereConditions = [];
        
        if (search) {
            whereConditions.push('(part_number LIKE ? OR model LIKE ? OR operator LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (machine) {
            whereConditions.push('machine = ?');
            params.push(machine);
        }
        
        if (status) {
            whereConditions.push('status = ?');
            params.push(status);
        }
        
        if (date_from) {
            whereConditions.push('DATE(completion_time) >= ?');
            params.push(date_from);
        }
        
        if (date_to) {
            whereConditions.push('DATE(completion_time) <= ?');
            params.push(date_to);
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        // Use string interpolation for LIMIT/OFFSET
        const safeLimit = parseInt(limit) || 50;
        const safeOffset = parseInt(offset) || 0;
        query += ` ORDER BY completion_time DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        const [rows] = await execute(query, params);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
        
    } catch (error) {
        console.error('Get output error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch output records',
            error: error.message
        });
    }
});

// POST create new output record
router.post('/output', webAuth, async (req, res) => {
    try {
        const {
            part_number,
            model,
            machine,
            quantity,
            quality_grade = 'A',
            operator,
            completion_time,
            status = 'completed'
        } = req.body;
        
        // Validate required fields
        if (!part_number || !model || !machine || !quantity || !operator) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: part_number, model, machine, quantity, operator'
            });
        }
        
        const outputId = generateId('OUT');
        
        const [result] = await execute(`
            INSERT INTO output_mc (
                id, part_number, model, machine, quantity, quality_grade,
                operator, completion_time, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            outputId, part_number, model, machine, quantity, quality_grade,
            operator, completion_time || new Date(), status
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Output record created successfully',
            data: {
                id: outputId,
                part_number,
                model,
                machine,
                quantity,
                quality_grade,
                operator,
                completion_time: completion_time || new Date(),
                status
            }
        });
        
    } catch (error) {
        console.error('Create output error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create output record',
            error: error.message
        });
    }
});

// PUT update output record
router.put('/output/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            part_number,
            model,
            machine,
            quantity,
            quality_grade,
            operator,
            completion_time,
            status
        } = req.body;
        
        // Check if record exists
        const [existing] = await execute('SELECT id FROM output_mc WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Output record not found'
            });
        }
        
        const [result] = await execute(`
            UPDATE output_mc SET 
                part_number = ?, model = ?, machine = ?, quantity = ?,
                quality_grade = ?, operator = ?, completion_time = ?, status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            part_number, model, machine, quantity, quality_grade,
            operator, completion_time, status, id
        ]);
        
        res.json({
            success: true,
            message: 'Output record updated successfully',
            data: { id, ...req.body }
        });
        
    } catch (error) {
        console.error('Update output error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update output record',
            error: error.message
        });
    }
});

// DELETE output record
router.delete('/output/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if record exists
        const [existing] = await execute('SELECT id FROM output_mc WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Output record not found'
            });
        }
        
        // Hard delete for output records
        await execute('DELETE FROM output_mc WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Output record deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete output error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete output record',
            error: error.message
        });
    }
});

// =============================================================================
// DASHBOARD DATA
// =============================================================================

// GET dashboard statistics
router.get('/dashboard/stats', webAuth, async (req, res) => {
    try {
        // Machine statistics
        const [machineStats] = await execute(`
            SELECT 
                COUNT(*) as total_machines,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_machines,
                SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_machines,
                SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_machines
            FROM machines WHERE is_active = TRUE
        `);
        
        // Production statistics (today)
        const [todayStats] = await execute(`
            SELECT 
                COUNT(*) as total_outputs_today,
                SUM(quantity) as total_production_today,
                COUNT(DISTINCT machine) as active_machines_today
            FROM output_mc 
            WHERE DATE(completion_time) = CURDATE()
        `);
        
        // Production statistics (this week)
        const [weekStats] = await execute(`
            SELECT 
                COUNT(*) as total_outputs_week,
                SUM(quantity) as total_production_week
            FROM output_mc 
            WHERE WEEK(completion_time) = WEEK(CURDATE()) AND YEAR(completion_time) = YEAR(CURDATE())
        `);
        
        // WIP statistics
        const [wipStats] = await execute(`
            SELECT 
                COUNT(*) as total_wip_items,
                SUM(current_qty) as total_wip_quantity,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as active_wip,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_wip
            FROM wip_second_process
        `);
        
        // Quality statistics
        const [qualityStats] = await execute(`
            SELECT 
                COUNT(*) as total_qc_items,
                SUM(quantity_sent) as total_qc_quantity,
                COUNT(CASE WHEN qc_status = 'pending' THEN 1 END) as pending_qc,
                COUNT(CASE WHEN qc_status = 'approved' THEN 1 END) as approved_qc,
                COUNT(CASE WHEN qc_status = 'rejected' THEN 1 END) as rejected_qc
            FROM transaksi_produksi_to_qc
        `);
        
        res.json({
            success: true,
            data: {
                machines: machineStats[0] || {},
                production: {
                    today: todayStats[0] || {},
                    week: weekStats[0] || {}
                },
                wip: wipStats[0] || {},
                quality: qualityStats[0] || {}
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
});

// =============================================================================
// BILL OF MATERIAL (BOM) ENDPOINTS
// =============================================================================

// GET customers from BOM
router.get('/bom/customers', webAuth, async (req, res) => {
    try {
        // Set headers to prevent caching - always get fresh data
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
        const [rows] = await execute(`
            SELECT DISTINCT customer 
            FROM billofmaterial 
            WHERE customer IS NOT NULL AND customer != ''
            ORDER BY customer
        `);
        
        res.json({
            success: true,
            data: rows.map(row => row.customer),
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Get BOM customers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customers',
            error: error.message
        });
    }
});

// GET descriptions by customer from BOM
router.get('/bom/descriptions/:customer', webAuth, async (req, res) => {
    try {
        const { customer } = req.params;
        
        // Set headers to prevent caching - always get fresh data
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
        const [rows] = await execute(`
            SELECT DISTINCT description 
            FROM billofmaterial 
            WHERE customer = ? AND description IS NOT NULL AND description != ''
            ORDER BY description
        `, [customer]);
        
        res.json({
            success: true,
            data: rows.map(row => row.description),
            timestamp: new Date().toISOString(),
            customer: customer
        });
        
    } catch (error) {
        console.error('Get BOM descriptions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch descriptions',
            error: error.message
        });
    }
});

// GET part details by customer and description from BOM
router.get('/bom/parts/:customer/:description', webAuth, async (req, res) => {
    try {
        const { customer, description } = req.params;
        
        // Set headers to prevent caching - always get fresh data
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
        const [rows] = await execute(`
            SELECT partnumber, model, description 
            FROM billofmaterial 
            WHERE customer = ? AND description = ?
            ORDER BY partnumber
        `, [customer, description]);
        
        res.json({
            success: true,
            data: rows,
            timestamp: new Date().toISOString(),
            customer: customer,
            description: description
        });
        
    } catch (error) {
        console.error('Get BOM parts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch part details',
            error: error.message
        });
    }
});

// GET WIP summary with totals from outputmc
router.get('/wip/summary', webAuth, async (req, res) => {
    try {
        // Get total quantities from outputmc grouped by partnumber
        const [outputTotals] = await execute(`
            SELECT 
                customer,
                partnumber, 
                model,
                description,
                SUM(quantity) as total_output,
                SUM(CASE WHEN quantity_ng IS NOT NULL THEN quantity_ng ELSE 0 END) as total_ng
            FROM outputmc 
            GROUP BY customer, partnumber, model, description
            ORDER BY partnumber
        `);
        
        // Get current WIP data
        const [wipData] = await execute(`
            SELECT 
                id,
                customer,
                partnumber, 
                model, 
                description, 
                lotnumber,
                quantity, 
                operator, 
                pic_qc, 
                pic_group_produksi,
                timestamp
            FROM wip 
            ORDER BY timestamp DESC
        `);
        
        res.json({
            success: true,
            data: {
                outputTotals,
                wipData
            }
        });
        
    } catch (error) {
        console.error('Get WIP summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch WIP summary',
            error: error.message
        });
    }
});

// =============================================================================
// MACHINE STATUS ENDPOINTS
// =============================================================================

// GET all machine status
router.get('/machine-status', webAuth, async (req, res) => {
    try {
        const [rows] = await execute(`
            SELECT 
                id, machine_id, status, efficiency, last_update, notes
            FROM machine_status
            ORDER BY machine_id ASC
        `);
        
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
        res.json({
            success: true,
            data: rows
        });
        
    } catch (error) {
        console.error('Get machine status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch machine status',
            error: error.message
        });
    }
});

// POST new machine status
router.post('/machine-status', webAuth, async (req, res) => {
    try {
        const { machine_id, status, target, actual, output_today, operator } = req.body;
        
        if (!machine_id || !status) {
            return res.status(400).json({
                success: false,
                message: 'Machine ID and status are required'
            });
        }
        
        const [result] = await execute(`
            INSERT INTO machine_status (machine_id, status, target, actual, output_today, operator, last_update)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [machine_id, status, target || 0, actual || 0, output_today || 0, operator || null]);
        
        res.json({
            success: true,
            message: 'Machine status added successfully',
            data: { id: result.insertId }
        });
        
    } catch (error) {
        console.error('Create machine status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add machine status',
            error: error.message
        });
    }
});

// PUT update machine status
router.put('/machine-status/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, target, actual, output_today, operator } = req.body;
        
        const [result] = await execute(`
            UPDATE machine_status 
            SET status = COALESCE(?, status),
                target = COALESCE(?, target),
                actual = COALESCE(?, actual),
                output_today = COALESCE(?, output_today),
                operator = COALESCE(?, operator),
                last_update = NOW()
            WHERE id = ?
        `, [status, target, actual, output_today, operator, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Machine status not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Machine status updated successfully'
        });
        
    } catch (error) {
        console.error('Update machine status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update machine status',
            error: error.message
        });
    }
});

// DELETE machine status
router.delete('/machine-status/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await execute('DELETE FROM machine_status WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Machine status not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Machine status deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete machine status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete machine status',
            error: error.message
        });
    }
});

// =============================================================================
// MACHINE OUTPUT CRUD (outputmc)
// =============================================================================

// GET all machine output
router.get('/outputmc', webAuth, async (req, res) => {
    try {
        const query = `
            SELECT 
                id, customer, partnumber, model, description,
                quantity, quantity_ng, machine, operator, timestamp
            FROM outputmc
            ORDER BY timestamp DESC
        `;
        
        const [rows] = await execute(query);
        
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
        
    } catch (error) {
        console.error('Get output mc error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch output mc data',
            error: error.message
        });
    }
});

// POST new machine output
router.post('/outputmc', webAuth, async (req, res) => {
    try {
        const { customer, partnumber, model, description, quantity, quantity_ng, machine, operator } = req.body;
        
        if (!partnumber || !model || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Part number, model, and quantity are required'
            });
        }
        
        const [result] = await execute(
            `INSERT INTO outputmc (customer, partnumber, model, description, quantity, quantity_ng, machine, operator) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [customer || '', partnumber, model, description || '', quantity, quantity_ng || 0, machine || '', operator || '']
        );
        
        res.json({
            success: true,
            message: 'Output MC created successfully',
            data: {
                id: result.insertId,
                customer,
                partnumber,
                model,
                description,
                quantity,
                quantity_ng,
                machine,
                operator
            }
        });
        
    } catch (error) {
        console.error('Create output mc error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create output mc',
            error: error.message
        });
    }
});

// PUT update machine output
router.put('/outputmc/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { customer, partnumber, model, description, quantity, quantity_ng, machine, operator } = req.body;
        
        const [result] = await execute(
            `UPDATE outputmc SET 
                customer = ?, partnumber = ?, model = ?, description = ?,
                quantity = ?, quantity_ng = ?, machine = ?, operator = ?
             WHERE id = ?`,
            [customer || '', partnumber, model, description || '', quantity, quantity_ng || 0, machine || '', operator || '', id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Output MC not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Output MC updated successfully',
            data: { id, customer, partnumber, model, description, quantity, quantity_ng, machine, operator }
        });
        
    } catch (error) {
        console.error('Update output mc error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update output mc',
            error: error.message
        });
    }
});

// DELETE machine output
router.delete('/outputmc/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await execute('DELETE FROM outputmc WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Output MC not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Output MC deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete output mc error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete output mc',
            error: error.message
        });
    }
});

// =============================================================================
// TRANSFER QC CRUD (transferqc)
// =============================================================================

// GET all transfer QC
router.get('/transferqc', webAuth, async (req, res) => {
    try {
        const query = `
            SELECT 
                id, customer, partnumber, model, description,
                quantity, lot_number, operator, status, timestamp
            FROM transferqc
            ORDER BY timestamp DESC
        `;
        
        const [rows] = await execute(query);
        
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
        
    } catch (error) {
        console.error('Get transfer QC error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transfer QC data',
            error: error.message
        });
    }
});

// POST new transfer QC
router.post('/transferqc', webAuth, async (req, res) => {
    try {
        const { customer, partnumber, model, description, quantity, lot_number, operator, status } = req.body;
        
        if (!partnumber || !model || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Part number, model, and quantity are required'
            });
        }
        
        const [result] = await execute(
            `INSERT INTO transferqc (customer, partnumber, model, description, quantity, lot_number, operator, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [customer || '', partnumber, model, description || '', quantity, lot_number || '', operator || '', status || 'pending']
        );
        
        res.json({
            success: true,
            message: 'Transfer QC created successfully',
            data: {
                id: result.insertId,
                customer,
                partnumber,
                model,
                description,
                quantity,
                lot_number,
                operator,
                status
            }
        });
        
    } catch (error) {
        console.error('Create transfer QC error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create transfer QC',
            error: error.message
        });
    }
});

// PUT update transfer QC
router.put('/transferqc/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { customer, partnumber, model, description, quantity, lot_number, operator, status } = req.body;
        
        const [result] = await execute(
            `UPDATE transferqc SET 
                customer = ?, partnumber = ?, model = ?, description = ?,
                quantity = ?, lot_number = ?, operator = ?, status = ?
             WHERE id = ?`,
            [customer || '', partnumber, model, description || '', quantity, lot_number || '', operator || '', status || 'pending', id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Transfer QC not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Transfer QC updated successfully',
            data: { id, customer, partnumber, model, description, quantity, lot_number, operator, status }
        });
        
    } catch (error) {
        console.error('Update transfer QC error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update transfer QC',
            error: error.message
        });
    }
});

// DELETE transfer QC
router.delete('/transferqc/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await execute('DELETE FROM transferqc WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Transfer QC not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Transfer QC deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete transfer QC error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete transfer QC',
            error: error.message
        });
    }
});

// =============================================================================
// WIP SECOND CRUD (wipsecond)
// =============================================================================

// GET all WIP second
router.get('/wipsecond', webAuth, async (req, res) => {
    try {
        const query = `
            SELECT 
                id, customer, partnumber, model, description,
                quantity, location, operator, status, timestamp
            FROM wipsecond
            ORDER BY timestamp DESC
        `;
        
        const [rows] = await execute(query);
        
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
        
    } catch (error) {
        console.error('Get WIP second error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch WIP second data',
            error: error.message
        });
    }
});

// POST new WIP second
router.post('/wipsecond', webAuth, async (req, res) => {
    try {
        const { customer, partnumber, model, description, quantity, location, operator, status } = req.body;
        
        if (!partnumber || !model || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Part number, model, and quantity are required'
            });
        }
        
        const [result] = await execute(
            `INSERT INTO wipsecond (customer, partnumber, model, description, quantity, location, operator, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [customer || '', partnumber, model, description || '', quantity, location || '', operator || '', status || 'pending']
        );
        
        res.json({
            success: true,
            message: 'WIP Second created successfully',
            data: {
                id: result.insertId,
                customer,
                partnumber,
                model,
                description,
                quantity,
                location,
                operator,
                status
            }
        });
        
    } catch (error) {
        console.error('Create WIP second error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create WIP second',
            error: error.message
        });
    }
});

// PUT update WIP second
router.put('/wipsecond/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { customer, partnumber, model, description, quantity, location, operator, status } = req.body;
        
        const [result] = await execute(
            `UPDATE wipsecond SET 
                customer = ?, partnumber = ?, model = ?, description = ?,
                quantity = ?, location = ?, operator = ?, status = ?
             WHERE id = ?`,
            [customer || '', partnumber, model, description || '', quantity, location || '', operator || '', status || 'pending', id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'WIP Second not found'
            });
        }
        
        res.json({
            success: true,
            message: 'WIP Second updated successfully',
            data: { id, customer, partnumber, model, description, quantity, location, operator, status }
        });
        
    } catch (error) {
        console.error('Update WIP second error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update WIP second',
            error: error.message
        });
    }
});

// DELETE WIP second
router.delete('/wipsecond/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await execute('DELETE FROM wipsecond WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'WIP Second not found'
            });
        }
        
        res.json({
            success: true,
            message: 'WIP Second deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete WIP second error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete WIP second',
            error: error.message
        });
    }
});

// =============================================================================
// MASTER CUSTOMER CRUD
// =============================================================================

// GET all master customers
router.get('/master-customer', webAuth, async (req, res) => {
    try {
        const { search, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT 
                id, customer_code, customer_name, alamat, is_active,
                created_at, updated_at
            FROM master_customer
        `;
        
        let params = [];
        let whereConditions = [];
        
        // Add active filter by default
        whereConditions.push('is_active = TRUE');
        
        if (search) {
            whereConditions.push('(customer_code LIKE ? OR customer_name LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        const safeLimit = parseInt(limit) || 50;
        const safeOffset = parseInt(offset) || 0;
        query += ` ORDER BY customer_name LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        const [rows] = await execute(query, params);
        
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
        res.json({
            success: true,
            data: rows,
            count: rows.length,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
        
    } catch (error) {
        console.error('Get master customer error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch master customer data',
            error: error.message
        });
    }
});

// GET single master customer
router.get('/master-customer/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await execute(
            'SELECT * FROM master_customer WHERE id = ? AND is_active = TRUE',
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Master customer not found'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
        
    } catch (error) {
        console.error('Get master customer error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch master customer',
            error: error.message
        });
    }
});

// POST create new master customer
router.post('/master-customer', webAuth, async (req, res) => {
    try {
        const { customer_code, customer_name, alamat } = req.body;
        
        if (!customer_code || !customer_name) {
            return res.status(400).json({
                success: false,
                message: 'Customer code and name are required'
            });
        }
        
        const [result] = await execute(
            `INSERT INTO master_customer (customer_code, customer_name, alamat)
             VALUES (?, ?, ?)`,
            [customer_code, customer_name, alamat || null]
        );
        
        res.status(201).json({
            success: true,
            message: 'Master customer created successfully',
            data: {
                id: result.insertId,
                customer_code,
                customer_name,
                alamat
            }
        });
        
    } catch (error) {
        console.error('Create master customer error:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Customer code already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create master customer',
            error: error.message
        });
    }
});

// PUT update master customer
router.put('/master-customer/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { customer_code, customer_name, alamat } = req.body;
        
        // Check if customer exists
        const [existing] = await execute(
            'SELECT id FROM master_customer WHERE id = ? AND is_active = TRUE',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Master customer not found'
            });
        }
        
        const [result] = await execute(`
            UPDATE master_customer SET 
                customer_code = ?, customer_name = ?, alamat = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [customer_code, customer_name, alamat, id]);
        
        res.json({
            success: true,
            message: 'Master customer updated successfully',
            data: { id, customer_code, customer_name, alamat }
        });
        
    } catch (error) {
        console.error('Update master customer error:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Customer code already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to update master customer',
            error: error.message
        });
    }
});

// DELETE master customer (soft delete)
router.delete('/master-customer/:id', webAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if customer exists
        const [existing] = await execute(
            'SELECT id FROM master_customer WHERE id = ? AND is_active = TRUE',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Master customer not found'
            });
        }
        
        // Soft delete
        await execute(
            'UPDATE master_customer SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        
        res.json({
            success: true,
            message: 'Master customer deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete master customer error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete master customer',
            error: error.message
        });
    }
});

module.exports = router;
