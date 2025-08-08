const express = require('express');
const router = express.Router();
const { execute } = require('../config/databaseAdapter');

// =============================================================================
// MATERIAL STOCK API
// =============================================================================

// GET all materials with stock
router.get('/materials', async (req, res) => {
    try {
        const { search, category, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT 
                mm.id,
                mm.material_code,
                mm.material_name,
                mm.specification,
                mm.unit,
                mm.category,
                mm.supplier,
                mm.minimum_stock,
                mm.maximum_stock,
                mm.unit_price,
                ms.current_stock,
                ms.reserved_stock,
                ms.available_stock,
                ms.location,
                ms.last_transaction_date,
                mm.created_at,
                mm.updated_at
            FROM master_material mm
            LEFT JOIN material_stock ms ON mm.id = ms.material_id
            WHERE mm.is_active = TRUE AND (ms.is_active = TRUE OR ms.is_active IS NULL)
        `;
        
        let params = [];
        
        if (search) {
            query += ' AND (mm.material_code LIKE ? OR mm.material_name LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }
        
        if (category) {
            query += ' AND mm.category = ?';
            params.push(category);
        }
        
        const safeLimit = parseInt(limit) || 50;
        const safeOffset = parseInt(offset) || 0;
        query += ` ORDER BY mm.material_code LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        const [rows] = await execute(query, params);
        
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Access-Control-Allow-Origin': '*'
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
        console.error('Get materials error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch materials data',
            error: error.message
        });
    }
});

// GET single material with stock
router.get('/materials/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await execute(`
            SELECT 
                mm.*,
                ms.current_stock,
                ms.reserved_stock,
                ms.available_stock,
                ms.location,
                ms.last_transaction_date
            FROM master_material mm
            LEFT JOIN material_stock ms ON mm.id = ms.material_id
            WHERE mm.id = ? AND mm.is_active = TRUE
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Material not found'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
        
    } catch (error) {
        console.error('Get material error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch material',
            error: error.message
        });
    }
});

// =============================================================================
// COMPONENT STOCK API
// =============================================================================

// GET all components with stock
router.get('/components', async (req, res) => {
    try {
        const { search, category, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT 
                mc.id,
                mc.component_code,
                mc.component_name,
                mc.specification,
                mc.unit,
                mc.category,
                mc.supplier,
                mc.minimum_stock,
                mc.maximum_stock,
                mc.unit_price,
                mc.lead_time_days,
                cs.current_stock,
                cs.reserved_stock,
                cs.available_stock,
                cs.location,
                cs.last_transaction_date,
                mc.created_at,
                mc.updated_at
            FROM master_component mc
            LEFT JOIN component_stock cs ON mc.id = cs.component_id
            WHERE mc.is_active = TRUE AND (cs.is_active = TRUE OR cs.is_active IS NULL)
        `;
        
        let params = [];
        
        if (search) {
            query += ' AND (mc.component_code LIKE ? OR mc.component_name LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }
        
        if (category) {
            query += ' AND mc.category = ?';
            params.push(category);
        }
        
        const safeLimit = parseInt(limit) || 50;
        const safeOffset = parseInt(offset) || 0;
        query += ` ORDER BY mc.component_code LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        const [rows] = await execute(query, params);
        
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Access-Control-Allow-Origin': '*'
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
        console.error('Get components error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch components data',
            error: error.message
        });
    }
});

// GET single component with stock
router.get('/components/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await execute(`
            SELECT 
                mc.*,
                cs.current_stock,
                cs.reserved_stock,
                cs.available_stock,
                cs.location,
                cs.last_transaction_date
            FROM master_component mc
            LEFT JOIN component_stock cs ON mc.id = cs.component_id
            WHERE mc.id = ? AND mc.is_active = TRUE
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Component not found'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
        
    } catch (error) {
        console.error('Get component error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch component',
            error: error.message
        });
    }
});

// =============================================================================
// STOCK SUMMARY API
// =============================================================================

// GET materials stock summary
router.get('/materials-summary', async (req, res) => {
    try {
        const [summary] = await execute(`
            SELECT 
                COUNT(mm.id) as total_materials,
                SUM(CASE WHEN ms.current_stock > 0 THEN 1 ELSE 0 END) as materials_in_stock,
                SUM(CASE WHEN ms.current_stock <= mm.minimum_stock THEN 1 ELSE 0 END) as low_stock_materials,
                SUM(ms.current_stock) as total_stock_value,
                AVG(ms.current_stock) as average_stock
            FROM master_material mm
            LEFT JOIN material_stock ms ON mm.id = ms.material_id
            WHERE mm.is_active = TRUE
        `);
        
        res.json({
            success: true,
            data: {
                ...summary[0],
                last_update: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Get materials summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch materials summary',
            error: error.message
        });
    }
});

// GET components stock summary
router.get('/components-summary', async (req, res) => {
    try {
        const [summary] = await execute(`
            SELECT 
                COUNT(mc.id) as total_components,
                SUM(CASE WHEN cs.current_stock > 0 THEN 1 ELSE 0 END) as components_in_stock,
                SUM(CASE WHEN cs.current_stock <= mc.minimum_stock THEN 1 ELSE 0 END) as low_stock_components,
                SUM(cs.current_stock) as total_stock_value,
                AVG(cs.current_stock) as average_stock
            FROM master_component mc
            LEFT JOIN component_stock cs ON mc.id = cs.component_id
            WHERE mc.is_active = TRUE
        `);
        
        res.json({
            success: true,
            data: {
                ...summary[0],
                last_update: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Get components summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch components summary',
            error: error.message
        });
    }
});

// GET low stock alerts
router.get('/low-stock-alerts', async (req, res) => {
    try {
        // Materials with low stock
        const [lowMaterials] = await execute(`
            SELECT 
                'material' as type,
                mm.material_code as code,
                mm.material_name as name,
                ms.current_stock,
                mm.minimum_stock,
                ms.location
            FROM master_material mm
            JOIN material_stock ms ON mm.id = ms.material_id
            WHERE mm.is_active = TRUE 
            AND ms.current_stock <= mm.minimum_stock
            AND mm.minimum_stock > 0
        `);
        
        // Components with low stock
        const [lowComponents] = await execute(`
            SELECT 
                'component' as type,
                mc.component_code as code,
                mc.component_name as name,
                cs.current_stock,
                mc.minimum_stock,
                cs.location
            FROM master_component mc
            JOIN component_stock cs ON mc.id = cs.component_id
            WHERE mc.is_active = TRUE 
            AND cs.current_stock <= mc.minimum_stock
            AND mc.minimum_stock > 0
        `);
        
        const alerts = [...lowMaterials, ...lowComponents];
        
        res.json({
            success: true,
            data: alerts,
            count: alerts.length,
            last_update: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Get low stock alerts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch low stock alerts',
            error: error.message
        });
    }
});

// =============================================================================
// WIP (WORK IN PROCESS) INVENTORY MANAGEMENT
// =============================================================================

// GET all WIP records with filtering and pagination
router.get('/wip', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            partnumber,
            customer,
            location,
            status,
            qc_status
        } = req.query;
        
        let whereConditions = [];
        let queryParams = [];
        
        if (partnumber) {
            whereConditions.push('partnumber LIKE ?');
            queryParams.push(`%${partnumber}%`);
        }
        
        if (customer) {
            whereConditions.push('customer LIKE ?');
            queryParams.push(`%${customer}%`);
        }
        
        if (location) {
            whereConditions.push('location = ?');
            queryParams.push(location);
        }
        
        if (status) {
            whereConditions.push('status = ?');
            queryParams.push(status);
        }
        
        if (qc_status) {
            whereConditions.push('qc_status = ?');
            queryParams.push(qc_status);
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        const offset = (page - 1) * limit;
        
        const [wipData] = await execute(`
            SELECT *
            FROM wip 
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, parseInt(limit), parseInt(offset)]);
        
        const [countResult] = await execute(`
            SELECT COUNT(*) as total 
            FROM wip 
            ${whereClause}
        `, queryParams);
        
        const totalRecords = countResult[0].total;
        const totalPages = Math.ceil(totalRecords / limit);
        
        res.json({
            success: true,
            data: {
                wip: wipData,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_records: totalRecords,
                    total_pages: totalPages,
                    has_next: page < totalPages,
                    has_prev: page > 1
                }
            }
        });
        
    } catch (error) {
        console.error('Get WIP error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET WIP stock summary by location
router.get('/wip-summary', async (req, res) => {
    try {
        const [summary] = await execute(`
            SELECT 
                location,
                COUNT(*) as total_lots,
                SUM(quantity) as total_quantity,
                COUNT(CASE WHEN status = 'IN_PROCESS' THEN 1 END) as in_process_lots,
                COUNT(CASE WHEN status = 'READY_TO_TRANSFER' THEN 1 END) as ready_lots,
                COUNT(CASE WHEN qc_status = 'PENDING' THEN 1 END) as qc_pending_lots,
                COUNT(CASE WHEN qc_status = 'PASS' THEN 1 END) as qc_pass_lots
            FROM wip 
            WHERE quantity > 0
            GROUP BY location
            ORDER BY location
        `);
        
        const [totalSummary] = await execute(`
            SELECT 
                COUNT(*) as total_lots,
                SUM(quantity) as total_quantity,
                COUNT(DISTINCT partnumber) as unique_parts,
                COUNT(DISTINCT customer) as unique_customers
            FROM wip 
            WHERE quantity > 0
        `);
        
        res.json({
            success: true,
            data: {
                by_location: summary,
                total_summary: totalSummary[0]
            }
        });
        
    } catch (error) {
        console.error('Get WIP summary error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =============================================================================
// FG (FINISHED GOODS) INVENTORY MANAGEMENT
// =============================================================================

// GET all FG records with filtering and pagination
router.get('/fg', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            partnumber,
            customer,
            location,
            shipping_status,
            qc_status
        } = req.query;
        
        let whereConditions = [];
        let queryParams = [];
        
        if (partnumber) {
            whereConditions.push('partnumber LIKE ?');
            queryParams.push(`%${partnumber}%`);
        }
        
        if (customer) {
            whereConditions.push('customer LIKE ?');
            queryParams.push(`%${customer}%`);
        }
        
        if (location) {
            whereConditions.push('location = ?');
            queryParams.push(location);
        }
        
        if (shipping_status) {
            whereConditions.push('shipping_status = ?');
            queryParams.push(shipping_status);
        }
        
        if (qc_status) {
            whereConditions.push('qc_status = ?');
            queryParams.push(qc_status);
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        const offset = (page - 1) * limit;
        
        const [fgData] = await execute(`
            SELECT *
            FROM fg 
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, parseInt(limit), parseInt(offset)]);
        
        const [countResult] = await execute(`
            SELECT COUNT(*) as total 
            FROM fg 
            ${whereClause}
        `, queryParams);
        
        const totalRecords = countResult[0].total;
        const totalPages = Math.ceil(totalRecords / limit);
        
        res.json({
            success: true,
            data: {
                fg: fgData,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_records: totalRecords,
                    total_pages: totalPages,
                    has_next: page < totalPages,
                    has_prev: page > 1
                }
            }
        });
        
    } catch (error) {
        console.error('Get FG error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET FG stock summary by location
router.get('/fg-summary', async (req, res) => {
    try {
        const [summary] = await execute(`
            SELECT 
                location,
                storage_area,
                COUNT(*) as total_lots,
                SUM(quantity) as total_quantity,
                COUNT(CASE WHEN shipping_status = 'AVAILABLE' THEN 1 END) as available_lots,
                COUNT(CASE WHEN shipping_status = 'RESERVED' THEN 1 END) as reserved_lots,
                COUNT(CASE WHEN shipping_status = 'SHIPPED' THEN 1 END) as shipped_lots,
                SUM(CASE WHEN shipping_status = 'AVAILABLE' THEN quantity ELSE 0 END) as available_quantity
            FROM fg 
            WHERE quantity > 0
            GROUP BY location, storage_area
            ORDER BY location, storage_area
        `);
        
        const [totalSummary] = await execute(`
            SELECT 
                COUNT(*) as total_lots,
                SUM(quantity) as total_quantity,
                COUNT(DISTINCT partnumber) as unique_parts,
                COUNT(DISTINCT customer) as unique_customers,
                SUM(CASE WHEN shipping_status = 'AVAILABLE' THEN quantity ELSE 0 END) as available_quantity,
                SUM(CASE WHEN shipping_status = 'RESERVED' THEN quantity ELSE 0 END) as reserved_quantity
            FROM fg 
            WHERE quantity > 0
        `);
        
        res.json({
            success: true,
            data: {
                by_location: summary,
                total_summary: totalSummary[0]
            }
        });
        
    } catch (error) {
        console.error('Get FG summary error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =============================================================================
// STOCK TRANSACTIONS HISTORY
// =============================================================================

// GET recent stock transactions (30 days)
router.get('/transactions/recent', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 50,
            stock_type,
            transaction_type,
            partnumber,
            customer
        } = req.query;
        
        let whereConditions = ['transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)'];
        let queryParams = [];
        
        if (stock_type) {
            whereConditions.push('stock_type = ?');
            queryParams.push(stock_type);
        }
        
        if (transaction_type) {
            whereConditions.push('transaction_type = ?');
            queryParams.push(transaction_type);
        }
        
        if (partnumber) {
            whereConditions.push('partnumber LIKE ?');
            queryParams.push(`%${partnumber}%`);
        }
        
        if (customer) {
            whereConditions.push('customer LIKE ?');
            queryParams.push(`%${customer}%`);
        }
        
        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
        const offset = (page - 1) * limit;
        
        const [transactions] = await execute(`
            SELECT *
            FROM stock_transactions 
            ${whereClause}
            ORDER BY transaction_date DESC, transaction_time DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, parseInt(limit), parseInt(offset)]);
        
        const [countResult] = await execute(`
            SELECT COUNT(*) as total 
            FROM stock_transactions 
            ${whereClause}
        `, queryParams);
        
        const totalRecords = countResult[0].total;
        const totalPages = Math.ceil(totalRecords / limit);
        
        res.json({
            success: true,
            data: {
                transactions: transactions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_records: totalRecords,
                    total_pages: totalPages,
                    has_next: page < totalPages,
                    has_prev: page > 1
                }
            }
        });
        
    } catch (error) {
        console.error('Get recent transactions error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
