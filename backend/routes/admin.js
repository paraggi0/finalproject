/**
 * Admin CRUD Routes - Full CRUD operations untuk website admin
 * PT. Topline Evergreen Manufacturing
 */

const express = require('express');
const router = express.Router();
const crudService = require('../services/crudService');
const { execute } = require('../config/databaseAdapter');

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
// BILL OF MATERIAL CRUD OPERATIONS
// =============================================================================

/**
 * PUT /api/admin/bom/:partnumber/:customer
 * Update BOM data
 */
router.put('/bom/:partnumber/:customer', async (req, res) => {
    try {
        const { partnumber, customer } = req.params;
        const { model, description } = req.body;
        
        const result = await crudService.updateBOM(partnumber, customer, {
            model,
            description
        });
        
        res.json(result);
    } catch (error) {
        console.error('BOM Update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update BOM',
            error: error.message
        });
    }
});

/**
 * DELETE /api/admin/bom/:partnumber/:customer
 * Delete BOM data
 */
router.delete('/bom/:partnumber/:customer', async (req, res) => {
    try {
        const { partnumber, customer } = req.params;
        
        const result = await crudService.deleteBOM(partnumber, customer);
        
        res.json(result);
    } catch (error) {
        console.error('BOM Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete BOM',
            error: error.message
        });
    }
});

/**
 * POST /api/admin/bom
 * Create new BOM
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
        
        const result = await crudService.createBOM({
            partnumber,
            customer,
            model,
            description
        });
        
        res.status(201).json(result);
    } catch (error) {
        console.error('BOM Create error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create BOM',
            error: error.message
        });
    }
});

// =============================================================================
// OUTPUT MC CRUD OPERATIONS
// =============================================================================

/**
 * PUT /api/admin/outputmc/:id
 * Update output MC data
 */
router.put('/outputmc/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, quantity_ng, machine, operator, shift } = req.body;
        
        const result = await crudService.updateOutputMC(id, {
            quantity,
            quantity_ng,
            machine,
            operator,
            shift
        });
        
        res.json(result);
    } catch (error) {
        console.error('Output MC Update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update output record',
            error: error.message
        });
    }
});

/**
 * DELETE /api/admin/outputmc/:id
 * Delete output MC data
 */
router.delete('/outputmc/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await crudService.deleteOutputMC(id);
        
        res.json(result);
    } catch (error) {
        console.error('Output MC Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete output record',
            error: error.message
        });
    }
});

// =============================================================================
// SCHEDULE CRUD OPERATIONS
// =============================================================================

/**
 * POST /api/admin/schedule
 * Create new schedule
 */
router.post('/schedule', async (req, res) => {
    try {
        const scheduleData = req.body;
        
        if (!scheduleData.partnumber || !scheduleData.delivery_date) {
            return res.status(400).json({
                success: false,
                message: 'partnumber and delivery_date are required'
            });
        }
        
        const result = await crudService.createSchedule(scheduleData);
        
        res.status(201).json(result);
    } catch (error) {
        console.error('Schedule Create error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create schedule',
            error: error.message
        });
    }
});

/**
 * PUT /api/admin/schedule/:id
 * Update schedule
 */
router.put('/schedule/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const result = await crudService.updateSchedule(id, updateData);
        
        res.json(result);
    } catch (error) {
        console.error('Schedule Update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update schedule',
            error: error.message
        });
    }
});

/**
 * DELETE /api/admin/schedule/:id
 * Delete schedule
 */
router.delete('/schedule/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await crudService.deleteSchedule(id);
        
        res.json(result);
    } catch (error) {
        console.error('Schedule Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete schedule',
            error: error.message
        });
    }
});

// =============================================================================
// MACHINE STATUS CRUD OPERATIONS
// =============================================================================

/**
 * POST /api/admin/machine
 * Create new machine
 */
router.post('/machine', async (req, res) => {
    try {
        const machineData = req.body;
        
        if (!machineData.machine_id || !machineData.machine_name || !machineData.department) {
            return res.status(400).json({
                success: false,
                message: 'machine_id, machine_name, and department are required'
            });
        }
        
        const result = await crudService.createMachine(machineData);
        
        res.status(201).json(result);
    } catch (error) {
        console.error('Machine Create error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create machine',
            error: error.message
        });
    }
});

/**
 * PUT /api/admin/machine/:machineId
 * Update machine status
 */
router.put('/machine/:machineId', async (req, res) => {
    try {
        const { machineId } = req.params;
        const updateData = req.body;
        
        const result = await crudService.updateMachineStatus(machineId, updateData);
        
        res.json(result);
    } catch (error) {
        console.error('Machine Update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update machine',
            error: error.message
        });
    }
});

// =============================================================================
// MATERIAL & COMPONENT CRUD OPERATIONS
// =============================================================================

/**
 * PUT /api/admin/material/:id
 * Update material data
 */
router.put('/material/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const result = await crudService.updateMaterial(id, updateData);
        
        res.json(result);
    } catch (error) {
        console.error('Material Update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update material',
            error: error.message
        });
    }
});

/**
 * PUT /api/admin/component/:id
 * Update component data
 */
router.put('/component/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const result = await crudService.updateComponent(id, updateData);
        
        res.json(result);
    } catch (error) {
        console.error('Component Update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update component',
            error: error.message
        });
    }
});

// =============================================================================
// INVENTORY STOCK CONTROL - SPECIAL FOR ADMIN
// =============================================================================

/**
 * PUT /api/admin/inventory/wip/:id
 * Update WIP stock quantity (Admin only)
 */
router.put('/inventory/wip/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, reason } = req.body;
        
        if (quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'quantity is required'
            });
        }
        
        // Log inventory adjustment
        const [wipData] = await pool.execute('SELECT * FROM wip WHERE id = ?', [id]);
        if (wipData.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'WIP record not found'
            });
        }
        
        const oldQuantity = wipData[0].quantity;
        
        // Update WIP quantity
        const [result] = await pool.execute(
            'UPDATE wip SET quantity = ?, updated_at = datetime(\'now\') WHERE id = ?',
            [quantity, id]
        );
        
        // Log the adjustment
        await pool.execute(`
            INSERT INTO inventory_adjustments (
                stock_type, record_id, partnumber, customer, lotnumber,
                old_quantity, new_quantity, adjustment_reason, operator, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `, [
            'WIP', id, wipData[0].partnumber, wipData[0].customer, wipData[0].lotnumber,
            oldQuantity, quantity, reason || 'Admin adjustment', 'ADMIN'
        ]);
        
        res.json({
            success: true,
            message: 'WIP stock updated successfully',
            data: {
                id,
                old_quantity: oldQuantity,
                new_quantity: quantity,
                adjustment: quantity - oldQuantity
            }
        });
    } catch (error) {
        console.error('WIP Stock Update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update WIP stock',
            error: error.message
        });
    }
});

/**
 * PUT /api/admin/inventory/fg/:id
 * Update FG stock quantity (Admin only)
 */
router.put('/inventory/fg/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, reason } = req.body;
        
        if (quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'quantity is required'
            });
        }
        
        // Similar implementation as WIP
        const [fgData] = await pool.execute('SELECT * FROM fg WHERE id = ?', [id]);
        if (fgData.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'FG record not found'
            });
        }
        
        const oldQuantity = fgData[0].quantity;
        
        const [result] = await pool.execute(
            'UPDATE fg SET quantity = ?, updated_at = datetime(\'now\') WHERE id = ?',
            [quantity, id]
        );
        
        await pool.execute(`
            INSERT INTO inventory_adjustments (
                stock_type, record_id, partnumber, customer, lotnumber,
                old_quantity, new_quantity, adjustment_reason, operator, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `, [
            'FG', id, fgData[0].partnumber, fgData[0].customer, fgData[0].lotnumber,
            oldQuantity, quantity, reason || 'Admin adjustment', 'ADMIN'
        ]);
        
        res.json({
            success: true,
            message: 'FG stock updated successfully',
            data: {
                id,
                old_quantity: oldQuantity,
                new_quantity: quantity,
                adjustment: quantity - oldQuantity
            }
        });
    } catch (error) {
        console.error('FG Stock Update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update FG stock',
            error: error.message
        });
    }
});

// =============================================================================
// BULK OPERATIONS
// =============================================================================

/**
 * POST /api/admin/bulk/delete
 * Bulk delete operations
 */
router.post('/bulk/delete', async (req, res) => {
    try {
        const { table_name, ids } = req.body;
        
        if (!table_name || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'table_name and ids array are required'
            });
        }
        
        const result = await crudService.bulkDelete(table_name, ids);
        
        res.json(result);
    } catch (error) {
        console.error('Bulk Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to bulk delete',
            error: error.message
        });
    }
});

/**
 * POST /api/admin/bulk/update
 * Bulk update operations
 */
router.post('/bulk/update', async (req, res) => {
    try {
        const { table_name, updates } = req.body;
        
        if (!table_name || !Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'table_name and updates array are required'
            });
        }
        
        const result = await crudService.bulkUpdate(table_name, updates);
        
        res.json(result);
    } catch (error) {
        console.error('Bulk Update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to bulk update',
            error: error.message
        });
    }
});

// =============================================================================
// VALIDATION ENDPOINTS
// =============================================================================

/**
 * GET /api/admin/validate/partnumber/:partnumber/:customer
 * Validate part number exists in BOM
 */
router.get('/validate/partnumber/:partnumber/:customer', async (req, res) => {
    try {
        const { partnumber, customer } = req.params;
        
        const result = await crudService.validatePartNumber(partnumber, customer);
        
        res.json({
            success: true,
            exists: result.exists,
            data: result.data,
            message: result.exists ? 'Part number valid' : 'Part number not found'
        });
    } catch (error) {
        console.error('Part Number Validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate part number',
            error: error.message
        });
    }
});

/**
 * GET /api/admin/validate/machine/:machineId
 * Validate machine exists
 */
router.get('/validate/machine/:machineId', async (req, res) => {
    try {
        const { machineId } = req.params;
        
        const result = await crudService.validateMachine(machineId);
        
        res.json({
            success: true,
            exists: result.exists,
            data: result.data,
            message: result.exists ? 'Machine valid' : 'Machine not found'
        });
    } catch (error) {
        console.error('Machine Validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate machine',
            error: error.message
        });
    }
});

module.exports = router;
