/**
 * Android Inventory Management API
 * PT. Topline Evergreen Manufacturing
 * GET and POST Operations for Inventory
 */

const express = require('express');
const router = express.Router();
const { execute } = require('../../../config/databaseAdapter');

// Android Authentication middleware
const authenticateAndroid = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== 'android-topline-2025') {
        return res.status(401).json({
            success: false,
            message: 'API key tidak valid atau tidak ada'
        });
    }
    next();
};

// Apply middleware to all routes
router.use(authenticateAndroid);

// ========================================
// INVENTORY TRANSACTIONS (POST Operations)
// ========================================

// POST - Record WIP Movement/Transfer
router.post('/wip-movement', async (req, res) => {
    try {
        const { 
            partnumber, 
            lotnumber, 
            quantity, 
            movement_type, // 'IN', 'OUT', 'TRANSFER'
            from_location, 
            to_location,
            operator,
            remarks 
        } = req.body;
        
        // Validate required fields
        if (!partnumber || !lotnumber || !quantity || !movement_type || !operator) {
            return res.status(400).json({
                success: false,
                message: 'Partnumber, lotnumber, quantity, movement_type, dan operator harus diisi'
            });
        }
        
        // Check if partnumber exists in BOM
        const [bomCheck] = await execute(`
            SELECT id FROM billofmaterial WHERE partnumber = ?
        `, [partnumber]);
        
        if (bomCheck.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Part number tidak ditemukan dalam BOM'
            });
        }
        
        // Create transaction record
        const [result] = await execute(`
            INSERT INTO inventory_transactions (
                partnumber, lotnumber, quantity, movement_type,
                from_location, to_location, operator, remarks,
                transaction_date, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [partnumber, lotnumber, quantity, movement_type, from_location, to_location, operator, remarks]);
        
        // Update WIP stock based on movement type
        if (movement_type === 'IN') {
            // Check if WIP already exists for this part/lot
            const [existingWip] = await execute(`
                SELECT id, quantity FROM wip WHERE partnumber = ? AND lotnumber = ?
            `, [partnumber, lotnumber]);
            
            if (existingWip.length > 0) {
                // Update existing WIP
                await execute(`
                    UPDATE wip 
                    SET quantity = quantity + ?, updated_at = NOW(), operator = ?
                    WHERE id = ?
                `, [quantity, operator, existingWip[0].id]);
            } else {
                // Create new WIP entry
                await execute(`
                    INSERT INTO wip (partnumber, lotnumber, quantity, operator, created_at, updated_at)
                    VALUES (?, ?, ?, ?, NOW(), NOW())
                `, [partnumber, lotnumber, quantity, operator]);
            }
        } else if (movement_type === 'OUT') {
            // Reduce WIP quantity
            const [wipCheck] = await execute(`
                SELECT id, quantity FROM wip WHERE partnumber = ? AND lotnumber = ?
            `, [partnumber, lotnumber]);
            
            if (wipCheck.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'WIP stock tidak ditemukan untuk part/lot ini'
                });
            }
            
            if (wipCheck[0].quantity < quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantity tidak mencukupi dalam WIP stock'
                });
            }
            
            const newQuantity = wipCheck[0].quantity - quantity;
            if (newQuantity === 0) {
                // Delete WIP entry if quantity becomes 0
                await execute(`DELETE FROM wip WHERE id = ?`, [wipCheck[0].id]);
            } else {
                // Update WIP quantity
                await execute(`
                    UPDATE wip 
                    SET quantity = ?, updated_at = NOW(), operator = ?
                    WHERE id = ?
                `, [newQuantity, operator, wipCheck[0].id]);
            }
        }
        
        res.status(201).json({
            success: true,
            data: {
                transaction_id: result.insertId,
                partnumber,
                lotnumber,
                quantity,
                movement_type,
                operator,
                transaction_date: new Date().toISOString()
            },
            message: 'WIP movement berhasil dicatat'
        });
        
    } catch (error) {
        console.error('WIP Movement Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mencatat WIP movement',
            error: error.message
        });
    }
});

// POST - Add Finished Goods from Production
router.post('/finished-goods-input', async (req, res) => {
    try {
        const { 
            partnumber, 
            quantity, 
            batch_number,
            production_date,
            operator,
            qc_status, // 'PASSED', 'PENDING', 'FAILED'
            remarks 
        } = req.body;
        
        // Validate required fields
        if (!partnumber || !quantity || !operator || !qc_status) {
            return res.status(400).json({
                success: false,
                message: 'Partnumber, quantity, operator, dan qc_status harus diisi'
            });
        }
        
        // Check if partnumber exists in BOM
        const [bomCheck] = await execute(`
            SELECT id FROM billofmaterial WHERE partnumber = ?
        `, [partnumber]);
        
        if (bomCheck.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Part number tidak ditemukan dalam BOM'
            });
        }
        
        // Only add to finished goods if QC status is PASSED
        if (qc_status === 'PASSED') {
            // Check if finished goods entry exists
            const [existingFg] = await execute(`
                SELECT id, quantity FROM finished_goods WHERE partnumber = ? AND batch_number = ?
            `, [partnumber, batch_number || 'DEFAULT']);
            
            if (existingFg.length > 0) {
                // Update existing finished goods
                await execute(`
                    UPDATE finished_goods 
                    SET quantity = quantity + ?, updated_at = NOW()
                    WHERE id = ?
                `, [quantity, existingFg[0].id]);
            } else {
                // Create new finished goods entry
                await execute(`
                    INSERT INTO finished_goods (
                        partnumber, quantity, batch_number, location, 
                        production_date, operator, qc_status, remarks,
                        created_at, updated_at
                    )
                    VALUES (?, ?, ?, 'WAREHOUSE', ?, ?, ?, ?, NOW(), NOW())
                `, [partnumber, quantity, batch_number || 'DEFAULT', production_date || new Date(), operator, qc_status, remarks]);
            }
        }
        
        // Record the production completion
        const [result] = await execute(`
            INSERT INTO production_completions (
                partnumber, quantity, batch_number, production_date,
                operator, qc_status, remarks, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `, [partnumber, quantity, batch_number, production_date || new Date(), operator, qc_status, remarks]);
        
        res.status(201).json({
            success: true,
            data: {
                completion_id: result.insertId,
                partnumber,
                quantity,
                batch_number,
                qc_status,
                operator,
                added_to_finished_goods: qc_status === 'PASSED'
            },
            message: 'Finished goods input berhasil dicatat'
        });
        
    } catch (error) {
        console.error('Finished Goods Input Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mencatat finished goods input',
            error: error.message
        });
    }
});

// POST - Record Stock Adjustment
router.post('/stock-adjustment', async (req, res) => {
    try {
        const { 
            stock_type, // 'WIP', 'FINISHED_GOODS'
            partnumber, 
            lotnumber, // for WIP
            batch_number, // for FG
            adjustment_type, // 'INCREASE', 'DECREASE', 'SET'
            quantity,
            reason,
            operator,
            remarks 
        } = req.body;
        
        // Validate required fields
        if (!stock_type || !partnumber || !adjustment_type || !quantity || !reason || !operator) {
            return res.status(400).json({
                success: false,
                message: 'Stock_type, partnumber, adjustment_type, quantity, reason, dan operator harus diisi'
            });
        }
        
        let adjustmentResult = null;
        
        if (stock_type === 'WIP') {
            if (!lotnumber) {
                return res.status(400).json({
                    success: false,
                    message: 'Lotnumber harus diisi untuk WIP adjustment'
                });
            }
            
            const [wipCheck] = await execute(`
                SELECT id, quantity FROM wip WHERE partnumber = ? AND lotnumber = ?
            `, [partnumber, lotnumber]);
            
            if (adjustment_type === 'INCREASE') {
                if (wipCheck.length > 0) {
                    await execute(`
                        UPDATE wip SET quantity = quantity + ?, updated_at = NOW()
                        WHERE id = ?
                    `, [quantity, wipCheck[0].id]);
                } else {
                    await execute(`
                        INSERT INTO wip (partnumber, lotnumber, quantity, operator, created_at, updated_at)
                        VALUES (?, ?, ?, ?, NOW(), NOW())
                    `, [partnumber, lotnumber, quantity, operator]);
                }
                adjustmentResult = `WIP increased by ${quantity}`;
            } else if (adjustment_type === 'DECREASE') {
                if (wipCheck.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'WIP stock tidak ditemukan'
                    });
                }
                
                const newQuantity = Math.max(0, wipCheck[0].quantity - quantity);
                if (newQuantity === 0) {
                    await execute(`DELETE FROM wip WHERE id = ?`, [wipCheck[0].id]);
                    adjustmentResult = 'WIP stock deleted (quantity became 0)';
                } else {
                    await execute(`
                        UPDATE wip SET quantity = ?, updated_at = NOW()
                        WHERE id = ?
                    `, [newQuantity, wipCheck[0].id]);
                    adjustmentResult = `WIP decreased by ${quantity}`;
                }
            } else if (adjustment_type === 'SET') {
                if (wipCheck.length > 0) {
                    if (quantity === 0) {
                        await execute(`DELETE FROM wip WHERE id = ?`, [wipCheck[0].id]);
                        adjustmentResult = 'WIP stock deleted';
                    } else {
                        await execute(`
                            UPDATE wip SET quantity = ?, updated_at = NOW()
                            WHERE id = ?
                        `, [quantity, wipCheck[0].id]);
                        adjustmentResult = `WIP quantity set to ${quantity}`;
                    }
                } else {
                    if (quantity > 0) {
                        await execute(`
                            INSERT INTO wip (partnumber, lotnumber, quantity, operator, created_at, updated_at)
                            VALUES (?, ?, ?, ?, NOW(), NOW())
                        `, [partnumber, lotnumber, quantity, operator]);
                        adjustmentResult = `New WIP created with quantity ${quantity}`;
                    }
                }
            }
        } else if (stock_type === 'FINISHED_GOODS') {
            const batchRef = batch_number || 'DEFAULT';
            
            const [fgCheck] = await execute(`
                SELECT id, quantity FROM finished_goods WHERE partnumber = ? AND batch_number = ?
            `, [partnumber, batchRef]);
            
            if (adjustment_type === 'INCREASE') {
                if (fgCheck.length > 0) {
                    await execute(`
                        UPDATE finished_goods SET quantity = quantity + ?, updated_at = NOW()
                        WHERE id = ?
                    `, [quantity, fgCheck[0].id]);
                } else {
                    await execute(`
                        INSERT INTO finished_goods (
                            partnumber, quantity, batch_number, location, 
                            operator, created_at, updated_at
                        )
                        VALUES (?, ?, ?, 'WAREHOUSE', ?, NOW(), NOW())
                    `, [partnumber, quantity, batchRef, operator]);
                }
                adjustmentResult = `Finished goods increased by ${quantity}`;
            } else if (adjustment_type === 'DECREASE') {
                if (fgCheck.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Finished goods stock tidak ditemukan'
                    });
                }
                
                const newQuantity = Math.max(0, fgCheck[0].quantity - quantity);
                if (newQuantity === 0) {
                    await execute(`DELETE FROM finished_goods WHERE id = ?`, [fgCheck[0].id]);
                    adjustmentResult = 'Finished goods deleted (quantity became 0)';
                } else {
                    await execute(`
                        UPDATE finished_goods SET quantity = ?, updated_at = NOW()
                        WHERE id = ?
                    `, [newQuantity, fgCheck[0].id]);
                    adjustmentResult = `Finished goods decreased by ${quantity}`;
                }
            } else if (adjustment_type === 'SET') {
                if (fgCheck.length > 0) {
                    if (quantity === 0) {
                        await execute(`DELETE FROM finished_goods WHERE id = ?`, [fgCheck[0].id]);
                        adjustmentResult = 'Finished goods deleted';
                    } else {
                        await execute(`
                            UPDATE finished_goods SET quantity = ?, updated_at = NOW()
                            WHERE id = ?
                        `, [quantity, fgCheck[0].id]);
                        adjustmentResult = `Finished goods quantity set to ${quantity}`;
                    }
                } else {
                    if (quantity > 0) {
                        await execute(`
                            INSERT INTO finished_goods (
                                partnumber, quantity, batch_number, location,
                                operator, created_at, updated_at
                            )
                            VALUES (?, ?, ?, 'WAREHOUSE', ?, NOW(), NOW())
                        `, [partnumber, quantity, batchRef, operator]);
                        adjustmentResult = `New finished goods created with quantity ${quantity}`;
                    }
                }
            }
        }
        
        // Record the adjustment
        const [result] = await execute(`
            INSERT INTO stock_adjustments (
                stock_type, partnumber, lotnumber, batch_number,
                adjustment_type, quantity, reason, operator, remarks,
                adjustment_date, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [stock_type, partnumber, lotnumber, batch_number, adjustment_type, quantity, reason, operator, remarks]);
        
        res.status(201).json({
            success: true,
            data: {
                adjustment_id: result.insertId,
                stock_type,
                partnumber,
                adjustment_type,
                quantity,
                reason,
                operator,
                result: adjustmentResult
            },
            message: 'Stock adjustment berhasil dicatat'
        });
        
    } catch (error) {
        console.error('Stock Adjustment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mencatat stock adjustment',
            error: error.message
        });
    }
});

// ========================================
// INVENTORY VIEWING (GET Operations)
// ========================================

// GET - Current WIP Stock Levels
router.get('/wip-levels', async (req, res) => {
    try {
        const { partnumber, operator, limit = 50, offset = 0 } = req.query;
        
        let whereConditions = [];
        let params = [];
        
        if (partnumber) {
            whereConditions.push('w.partnumber LIKE ?');
            params.push(`%${partnumber}%`);
        }
        
        if (operator) {
            whereConditions.push('w.operator LIKE ?');
            params.push(`%${operator}%`);
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        const [wipLevels] = await execute(`
            SELECT 
                w.partnumber,
                w.lotnumber,
                w.quantity,
                w.operator,
                w.updated_at,
                b.customer,
                b.model,
                b.description
            FROM wip w
            LEFT JOIN billofmaterial b ON w.partnumber = b.partnumber
            ${whereClause}
            ORDER BY w.updated_at DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), parseInt(offset)]);
        
        // Get summary statistics
        const [summary] = await execute(`
            SELECT 
                COUNT(*) as total_lots,
                SUM(quantity) as total_quantity,
                COUNT(DISTINCT partnumber) as unique_parts,
                AVG(quantity) as avg_quantity_per_lot
            FROM wip
            ${whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''}
        `, whereConditions.length > 0 ? params.slice(0, -2) : []);
        
        res.json({
            success: true,
            data: {
                wip_levels: wipLevels,
                summary: summary[0],
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    returned_count: wipLevels.length
                }
            },
            message: 'WIP levels berhasil diambil'
        });
        
    } catch (error) {
        console.error('Get WIP Levels Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil WIP levels',
            error: error.message
        });
    }
});

// GET - Finished Goods Stock Levels
router.get('/finished-goods-levels', async (req, res) => {
    try {
        const { partnumber, customer, limit = 50, offset = 0 } = req.query;
        
        let whereConditions = [];
        let params = [];
        
        if (partnumber) {
            whereConditions.push('fg.partnumber LIKE ?');
            params.push(`%${partnumber}%`);
        }
        
        if (customer) {
            whereConditions.push('b.customer LIKE ?');
            params.push(`%${customer}%`);
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        const [fgLevels] = await execute(`
            SELECT 
                fg.partnumber,
                fg.quantity,
                fg.batch_number,
                fg.location,
                fg.updated_at,
                b.customer,
                b.model,
                b.description
            FROM finished_goods fg
            LEFT JOIN billofmaterial b ON fg.partnumber = b.partnumber
            ${whereClause}
            ORDER BY fg.updated_at DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), parseInt(offset)]);
        
        // Get summary statistics
        const [summary] = await execute(`
            SELECT 
                COUNT(*) as total_items,
                SUM(quantity) as total_quantity,
                COUNT(DISTINCT partnumber) as unique_parts,
                AVG(quantity) as avg_quantity_per_item
            FROM finished_goods fg
            LEFT JOIN billofmaterial b ON fg.partnumber = b.partnumber
            ${whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''}
        `, whereConditions.length > 0 ? params.slice(0, -2) : []);
        
        res.json({
            success: true,
            data: {
                finished_goods_levels: fgLevels,
                summary: summary[0],
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    returned_count: fgLevels.length
                }
            },
            message: 'Finished goods levels berhasil diambil'
        });
        
    } catch (error) {
        console.error('Get Finished Goods Levels Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil finished goods levels',
            error: error.message
        });
    }
});

// GET - Recent Inventory Transactions
router.get('/recent-transactions', async (req, res) => {
    try {
        const { limit = 20, operator, partnumber } = req.query;
        
        let whereConditions = [];
        let params = [];
        
        if (operator) {
            whereConditions.push('operator LIKE ?');
            params.push(`%${operator}%`);
        }
        
        if (partnumber) {
            whereConditions.push('partnumber LIKE ?');
            params.push(`%${partnumber}%`);
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        const [transactions] = await execute(`
            SELECT 
                id,
                partnumber,
                lotnumber,
                quantity,
                movement_type,
                from_location,
                to_location,
                operator,
                remarks,
                transaction_date,
                created_at
            FROM inventory_transactions
            ${whereClause}
            ORDER BY transaction_date DESC
            LIMIT ?
        `, [...params, parseInt(limit)]);
        
        res.json({
            success: true,
            data: {
                recent_transactions: transactions,
                total_returned: transactions.length
            },
            message: 'Recent transactions berhasil diambil'
        });
        
    } catch (error) {
        console.error('Get Recent Transactions Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil recent transactions',
            error: error.message
        });
    }
});

// GET - Stock Movement History for specific part
router.get('/movement-history/:partnumber', async (req, res) => {
    try {
        const { partnumber } = req.params;
        const { limit = 30, offset = 0 } = req.query;
        
        const [movements] = await execute(`
            SELECT 
                id,
                lotnumber,
                quantity,
                movement_type,
                from_location,
                to_location,
                operator,
                remarks,
                transaction_date
            FROM inventory_transactions
            WHERE partnumber = ?
            ORDER BY transaction_date DESC
            LIMIT ? OFFSET ?
        `, [partnumber, parseInt(limit), parseInt(offset)]);
        
        // Get part details
        const [partDetails] = await execute(`
            SELECT customer, model, description
            FROM billofmaterial
            WHERE partnumber = ?
        `, [partnumber]);
        
        res.json({
            success: true,
            data: {
                partnumber,
                part_details: partDetails[0] || null,
                movement_history: movements,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    returned_count: movements.length
                }
            },
            message: 'Movement history berhasil diambil'
        });
        
    } catch (error) {
        console.error('Get Movement History Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil movement history',
            error: error.message
        });
    }
});

module.exports = router;
