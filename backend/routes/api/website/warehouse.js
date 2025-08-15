/**
 * Website Warehouse API
 * PT. Topline Evergreen Manufacturing
 * Complete Warehouse CRUD Operations
 */

const express = require('express');
const router = express.Router();
const { execute } = require('../../../config/databaseAdapter');

// API Key validation middleware
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== 'website-admin-2025') {
        return res.status(401).json({
            success: false,
            message: 'API key tidak valid atau tidak ada'
        });
    }
    next();
};

// Apply API key validation to all routes
router.use(validateApiKey);

// ============================================================================
// WAREHOUSE DASHBOARD
// ============================================================================

router.get('/dashboard', async (req, res) => {
    try {
        // WIP Stock Summary
        const [wipSummary] = await execute(`
            SELECT 
                COUNT(*) as total_wip_lots,
                SUM(quantity) as total_wip_quantity,
                COUNT(DISTINCT partnumber) as unique_wip_parts
            FROM wip
        `);
        
        // Finish Goods Summary
        const [fgSummary] = await execute(`
            SELECT 
                COUNT(*) as total_fg_lots,
                SUM(quantity) as total_fg_quantity,
                COUNT(DISTINCT part_number) as unique_fg_parts,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_lots
            FROM finished_goods
        `);
        
        // Delivery Orders Summary
        const [doSummary] = await execute(`
            SELECT 
                COUNT(*) as total_orders,
                COUNT(CASE WHEN order_status = 'pending' THEN 1 END) as pending_orders,
                COUNT(CASE WHEN order_status = 'shipped' THEN 1 END) as shipped_orders,
                SUM(CASE WHEN total_value IS NOT NULL THEN total_value ELSE 0 END) as total_value
            FROM delivery_orders
        `);
        
        // Returns Summary
        const [returnsSummary] = await execute(`
            SELECT 
                COUNT(*) as total_returns,
                COUNT(CASE WHEN return_status = 'under_inspection' THEN 1 END) as under_inspection,
                COUNT(CASE WHEN return_status = 'approved' THEN 1 END) as approved_returns,
                SUM(CASE WHEN financial_impact IS NOT NULL THEN financial_impact ELSE 0 END) as total_impact
            FROM warehouse_returns
        `);
        
        res.json({
            success: true,
            data: {
                wip_summary: wipSummary[0] || {},
                finish_goods_summary: fgSummary[0] || {},
                delivery_orders_summary: doSummary[0] || {},
                returns_summary: returnsSummary[0] || {},
                last_updated: new Date().toISOString()
            },
            message: 'Warehouse dashboard data berhasil diambil'
        });
        
    } catch (error) {
        console.error('Warehouse Dashboard Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data warehouse dashboard',
            error: error.message
        });
    }
});

// ============================================================================
// FINISHED GOODS INVENTORY CRUD
// ============================================================================

// Get all finished goods
router.get('/finished-goods', async (req, res) => {
    try {
        const [results] = await execute(`
            SELECT * FROM finished_goods 
            ORDER BY created_at DESC
        `);
        
        res.json({
            success: true,
            data: results,
            message: 'Finished goods data berhasil diambil'
        });
    } catch (error) {
        console.error('Finished Goods Get Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data finished goods',
            error: error.message
        });
    }
});

// Create finished goods
router.post('/finished-goods', async (req, res) => {
    try {
        const data = req.body;
        
        const query = `
            INSERT INTO finished_goods (
                fg_number, part_number, part_name, lot_number, batch_number,
                quantity, unit_of_measure, quality_status, location, shelf_life,
                expiry_date, supplier_name, supplier_code, manufacturing_date,
                packaging_type, storage_conditions, value_per_unit, total_value,
                currency, inspection_status, inspector_name, inspection_date,
                customer_allocation, special_instructions, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        
        const values = [
            data.fg_number, data.part_number, data.part_name, data.lot_number,
            data.batch_number, data.quantity, data.unit_of_measure, data.quality_status,
            data.location, data.shelf_life, data.expiry_date, data.supplier_name,
            data.supplier_code, data.manufacturing_date, data.packaging_type,
            data.storage_conditions, data.value_per_unit, data.total_value,
            data.currency, data.inspection_status, data.inspector_name,
            data.inspection_date, data.customer_allocation, data.special_instructions
        ];
        
        const [result] = await execute(query, values);
        
        res.json({
            success: true,
            data: { id: result.insertId, ...data },
            message: 'Finished goods berhasil ditambahkan'
        });
    } catch (error) {
        console.error('Finished Goods Create Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan finished goods',
            error: error.message
        });
    }
});

// Update finished goods
router.put('/finished-goods/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        const query = `
            UPDATE finished_goods SET
                fg_number = ?, part_number = ?, part_name = ?, lot_number = ?,
                batch_number = ?, quantity = ?, unit_of_measure = ?, quality_status = ?,
                location = ?, shelf_life = ?, expiry_date = ?, supplier_name = ?,
                supplier_code = ?, manufacturing_date = ?, packaging_type = ?,
                storage_conditions = ?, value_per_unit = ?, total_value = ?,
                currency = ?, inspection_status = ?, inspector_name = ?,
                inspection_date = ?, customer_allocation = ?, special_instructions = ?
            WHERE id = ?
        `;
        
        const values = [
            data.fg_number, data.part_number, data.part_name, data.lot_number,
            data.batch_number, data.quantity, data.unit_of_measure, data.quality_status,
            data.location, data.shelf_life, data.expiry_date, data.supplier_name,
            data.supplier_code, data.manufacturing_date, data.packaging_type,
            data.storage_conditions, data.value_per_unit, data.total_value,
            data.currency, data.inspection_status, data.inspector_name,
            data.inspection_date, data.customer_allocation, data.special_instructions,
            id
        ];
        
        await execute(query, values);
        
        res.json({
            success: true,
            data: { id, ...data },
            message: 'Finished goods berhasil diupdate'
        });
    } catch (error) {
        console.error('Finished Goods Update Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate finished goods',
            error: error.message
        });
    }
});

// Delete finished goods
router.delete('/finished-goods/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await execute('DELETE FROM finished_goods WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Finished goods berhasil dihapus'
        });
    } catch (error) {
        console.error('Finished Goods Delete Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus finished goods',
            error: error.message
        });
    }
});

// ============================================================================
// DELIVERY CONTROL CRUD
// ============================================================================

// Get all delivery control records
router.get('/delivery-control', async (req, res) => {
    try {
        const [results] = await execute(`
            SELECT * FROM delivery_control 
            ORDER BY created_at DESC
        `);
        
        res.json({
            success: true,
            data: results,
            message: 'Delivery control data berhasil diambil'
        });
    } catch (error) {
        console.error('Delivery Control Get Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data delivery control',
            error: error.message
        });
    }
});

// Create delivery control
router.post('/delivery-control', async (req, res) => {
    try {
        const data = req.body;
        
        const query = `
            INSERT INTO delivery_control (
                do_number, customer_name, customer_code, delivery_date,
                requested_delivery_time, priority_level, delivery_status,
                driver_name, driver_id, driver_phone, vehicle_type, vehicle_number,
                delivery_address, delivery_zone, contact_person, contact_phone,
                contact_email, product_items, total_quantity, total_weight,
                total_volume, estimated_distance, estimated_duration,
                special_instructions, loading_dock, dispatch_time,
                estimated_arrival, actual_departure, actual_arrival,
                delivery_notes, proof_of_delivery, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        
        const values = [
            data.do_number, data.customer_name, data.customer_code, data.delivery_date,
            data.requested_delivery_time, data.priority_level, data.delivery_status,
            data.driver_name, data.driver_id, data.driver_phone, data.vehicle_type,
            data.vehicle_number, data.delivery_address, data.delivery_zone,
            data.contact_person, data.contact_phone, data.contact_email,
            data.product_items, data.total_quantity, data.total_weight,
            data.total_volume, data.estimated_distance, data.estimated_duration,
            data.special_instructions, data.loading_dock, data.dispatch_time,
            data.estimated_arrival, data.actual_departure, data.actual_arrival,
            data.delivery_notes, data.proof_of_delivery
        ];
        
        const [result] = await execute(query, values);
        
        res.json({
            success: true,
            data: { id: result.insertId, ...data },
            message: 'Delivery control berhasil ditambahkan'
        });
    } catch (error) {
        console.error('Delivery Control Create Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan delivery control',
            error: error.message
        });
    }
});

// Update delivery control
router.put('/delivery-control/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        const query = `
            UPDATE delivery_control SET
                do_number = ?, customer_name = ?, customer_code = ?, delivery_date = ?,
                requested_delivery_time = ?, priority_level = ?, delivery_status = ?,
                driver_name = ?, driver_id = ?, driver_phone = ?, vehicle_type = ?,
                vehicle_number = ?, delivery_address = ?, delivery_zone = ?,
                contact_person = ?, contact_phone = ?, contact_email = ?,
                product_items = ?, total_quantity = ?, total_weight = ?,
                total_volume = ?, estimated_distance = ?, estimated_duration = ?,
                special_instructions = ?, loading_dock = ?, dispatch_time = ?,
                estimated_arrival = ?, actual_departure = ?, actual_arrival = ?,
                delivery_notes = ?, proof_of_delivery = ?
            WHERE id = ?
        `;
        
        const values = [
            data.do_number, data.customer_name, data.customer_code, data.delivery_date,
            data.requested_delivery_time, data.priority_level, data.delivery_status,
            data.driver_name, data.driver_id, data.driver_phone, data.vehicle_type,
            data.vehicle_number, data.delivery_address, data.delivery_zone,
            data.contact_person, data.contact_phone, data.contact_email,
            data.product_items, data.total_quantity, data.total_weight,
            data.total_volume, data.estimated_distance, data.estimated_duration,
            data.special_instructions, data.loading_dock, data.dispatch_time,
            data.estimated_arrival, data.actual_departure, data.actual_arrival,
            data.delivery_notes, data.proof_of_delivery, id
        ];
        
        await execute(query, values);
        
        res.json({
            success: true,
            data: { id, ...data },
            message: 'Delivery control berhasil diupdate'
        });
    } catch (error) {
        console.error('Delivery Control Update Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate delivery control',
            error: error.message
        });
    }
});

// Delete delivery control
router.delete('/delivery-control/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await execute('DELETE FROM delivery_control WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Delivery control berhasil dihapus'
        });
    } catch (error) {
        console.error('Delivery Control Delete Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus delivery control',
            error: error.message
        });
    }
});

// ============================================================================
// DELIVERY ORDERS CRUD
// ============================================================================

// Get all delivery orders
router.get('/delivery-orders', async (req, res) => {
    try {
        const [results] = await execute(`
            SELECT * FROM delivery_orders 
            ORDER BY created_date DESC
        `);
        
        res.json({
            success: true,
            data: results,
            message: 'Delivery orders data berhasil diambil'
        });
    } catch (error) {
        console.error('Delivery Orders Get Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data delivery orders',
            error: error.message
        });
    }
});

// Create delivery order
router.post('/delivery-orders', async (req, res) => {
    try {
        const data = req.body;
        
        const query = `
            INSERT INTO delivery_orders (
                do_number, order_date, customer_name, customer_code, customer_po,
                requested_delivery_date, delivery_address, contact_person,
                contact_phone, contact_email, sales_person, payment_terms,
                shipping_method, priority_level, order_status, product_items,
                total_items, total_quantity, unit_price, total_value, currency,
                tax_amount, discount_amount, special_instructions, delivery_notes,
                warehouse_location, picking_location, estimated_weight,
                estimated_volume, created_date, updated_date, approved_by,
                approval_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            data.do_number, data.order_date, data.customer_name, data.customer_code,
            data.customer_po, data.requested_delivery_date, data.delivery_address,
            data.contact_person, data.contact_phone, data.contact_email,
            data.sales_person, data.payment_terms, data.shipping_method,
            data.priority_level, data.order_status, data.product_items,
            data.total_items, data.total_quantity, data.unit_price, data.total_value,
            data.currency, data.tax_amount, data.discount_amount,
            data.special_instructions, data.delivery_notes, data.warehouse_location,
            data.picking_location, data.estimated_weight, data.estimated_volume,
            data.created_date, data.updated_date, data.approved_by, data.approval_date
        ];
        
        const [result] = await execute(query, values);
        
        res.json({
            success: true,
            data: { id: result.insertId, ...data },
            message: 'Delivery order berhasil ditambahkan'
        });
    } catch (error) {
        console.error('Delivery Orders Create Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan delivery order',
            error: error.message
        });
    }
});

// Update delivery order
router.put('/delivery-orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        const query = `
            UPDATE delivery_orders SET
                do_number = ?, order_date = ?, customer_name = ?, customer_code = ?,
                customer_po = ?, requested_delivery_date = ?, delivery_address = ?,
                contact_person = ?, contact_phone = ?, contact_email = ?,
                sales_person = ?, payment_terms = ?, shipping_method = ?,
                priority_level = ?, order_status = ?, product_items = ?,
                total_items = ?, total_quantity = ?, unit_price = ?, total_value = ?,
                currency = ?, tax_amount = ?, discount_amount = ?,
                special_instructions = ?, delivery_notes = ?, warehouse_location = ?,
                picking_location = ?, estimated_weight = ?, estimated_volume = ?,
                updated_date = ?, approved_by = ?, approval_date = ?
            WHERE id = ?
        `;
        
        const values = [
            data.do_number, data.order_date, data.customer_name, data.customer_code,
            data.customer_po, data.requested_delivery_date, data.delivery_address,
            data.contact_person, data.contact_phone, data.contact_email,
            data.sales_person, data.payment_terms, data.shipping_method,
            data.priority_level, data.order_status, data.product_items,
            data.total_items, data.total_quantity, data.unit_price, data.total_value,
            data.currency, data.tax_amount, data.discount_amount,
            data.special_instructions, data.delivery_notes, data.warehouse_location,
            data.picking_location, data.estimated_weight, data.estimated_volume,
            data.updated_date, data.approved_by, data.approval_date, id
        ];
        
        await execute(query, values);
        
        res.json({
            success: true,
            data: { id, ...data },
            message: 'Delivery order berhasil diupdate'
        });
    } catch (error) {
        console.error('Delivery Orders Update Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate delivery order',
            error: error.message
        });
    }
});

// Delete delivery order
router.delete('/delivery-orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await execute('DELETE FROM delivery_orders WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Delivery order berhasil dihapus'
        });
    } catch (error) {
        console.error('Delivery Orders Delete Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus delivery order',
            error: error.message
        });
    }
});

// ============================================================================
// WAREHOUSE RETURNS CRUD
// ============================================================================

// Get all warehouse returns
router.get('/warehouse-returns', async (req, res) => {
    try {
        const [results] = await execute(`
            SELECT * FROM warehouse_returns 
            ORDER BY return_date DESC
        `);
        
        res.json({
            success: true,
            data: results,
            message: 'Warehouse returns data berhasil diambil'
        });
    } catch (error) {
        console.error('Warehouse Returns Get Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data warehouse returns',
            error: error.message
        });
    }
});

// Create warehouse return
router.post('/warehouse-returns', async (req, res) => {
    try {
        const data = req.body;
        
        const query = `
            INSERT INTO warehouse_returns (
                return_number, return_date, return_type, customer_supplier_name,
                customer_supplier_code, original_reference, product_code,
                product_name, batch_lot_number, return_quantity, unit_of_measure,
                return_reason, return_condition, return_status, priority_level,
                return_description, inspector_name, inspection_date,
                inspection_notes, disposition_action, financial_impact,
                currency, replacement_required, replacement_order,
                root_cause_analysis, corrective_action, storage_location,
                processing_deadline, customer_notification, additional_notes,
                created_by, approved_by, approval_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            data.return_number, data.return_date, data.return_type,
            data.customer_supplier_name, data.customer_supplier_code,
            data.original_reference, data.product_code, data.product_name,
            data.batch_lot_number, data.return_quantity, data.unit_of_measure,
            data.return_reason, data.return_condition, data.return_status,
            data.priority_level, data.return_description, data.inspector_name,
            data.inspection_date, data.inspection_notes, data.disposition_action,
            data.financial_impact, data.currency, data.replacement_required,
            data.replacement_order, data.root_cause_analysis, data.corrective_action,
            data.storage_location, data.processing_deadline, data.customer_notification,
            data.additional_notes, data.created_by, data.approved_by, data.approval_date
        ];
        
        const [result] = await execute(query, values);
        
        res.json({
            success: true,
            data: { id: result.insertId, ...data },
            message: 'Warehouse return berhasil ditambahkan'
        });
    } catch (error) {
        console.error('Warehouse Returns Create Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan warehouse return',
            error: error.message
        });
    }
});

// Update warehouse return
router.put('/warehouse-returns/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        const query = `
            UPDATE warehouse_returns SET
                return_number = ?, return_date = ?, return_type = ?,
                customer_supplier_name = ?, customer_supplier_code = ?,
                original_reference = ?, product_code = ?, product_name = ?,
                batch_lot_number = ?, return_quantity = ?, unit_of_measure = ?,
                return_reason = ?, return_condition = ?, return_status = ?,
                priority_level = ?, return_description = ?, inspector_name = ?,
                inspection_date = ?, inspection_notes = ?, disposition_action = ?,
                financial_impact = ?, currency = ?, replacement_required = ?,
                replacement_order = ?, root_cause_analysis = ?, corrective_action = ?,
                storage_location = ?, processing_deadline = ?, customer_notification = ?,
                additional_notes = ?, approved_by = ?, approval_date = ?
            WHERE id = ?
        `;
        
        const values = [
            data.return_number, data.return_date, data.return_type,
            data.customer_supplier_name, data.customer_supplier_code,
            data.original_reference, data.product_code, data.product_name,
            data.batch_lot_number, data.return_quantity, data.unit_of_measure,
            data.return_reason, data.return_condition, data.return_status,
            data.priority_level, data.return_description, data.inspector_name,
            data.inspection_date, data.inspection_notes, data.disposition_action,
            data.financial_impact, data.currency, data.replacement_required,
            data.replacement_order, data.root_cause_analysis, data.corrective_action,
            data.storage_location, data.processing_deadline, data.customer_notification,
            data.additional_notes, data.approved_by, data.approval_date, id
        ];
        
        await execute(query, values);
        
        res.json({
            success: true,
            data: { id, ...data },
            message: 'Warehouse return berhasil diupdate'
        });
    } catch (error) {
        console.error('Warehouse Returns Update Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate warehouse return',
            error: error.message
        });
    }
});

// Delete warehouse return
router.delete('/warehouse-returns/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await execute('DELETE FROM warehouse_returns WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Warehouse return berhasil dihapus'
        });
    } catch (error) {
        console.error('Warehouse Returns Delete Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus warehouse return',
            error: error.message
        });
    }
});

// ============================================================================
// STOCK REPORTS (Legacy)
// ============================================================================

router.get('/stock-reports', async (req, res) => {
    try {
        const { stock_type, partnumber, start_date, end_date } = req.query;
        
        let reports = [];
        
        // WIP Stock Reports
        if (!stock_type || stock_type === 'wip') {
            let wipQuery = `
                SELECT 
                    'wip' as stock_type, partnumber as part_number, 
                    lotnumber as lot_number, quantity, operator, 
                    pic_qc, pic_group_produksi, created_at, updated_at
                FROM wip
            `;
            
            let wipParams = [];
            let wipConditions = [];
            
            if (partnumber) {
                wipConditions.push('partnumber LIKE ?');
                wipParams.push(`%${partnumber}%`);
            }
            
            if (start_date) {
                wipConditions.push('DATE(created_at) >= ?');
                wipParams.push(start_date);
            }
            
            if (end_date) {
                wipConditions.push('DATE(created_at) <= ?');
                wipParams.push(end_date);
            }
            
            if (wipConditions.length > 0) {
                wipQuery += ' WHERE ' + wipConditions.join(' AND ');
            }
            
            wipQuery += ' ORDER BY created_at DESC';
            
            const [wipReports] = await execute(wipQuery, wipParams);
            reports = reports.concat(wipReports);
        }
        
        // Finish Goods Stock Reports
        if (!stock_type || stock_type === 'finished_goods') {
            let fgQuery = `
                SELECT 
                    'finished_goods' as stock_type, part_number, 
                    lot_number, quantity, location as operator, 
                    quality_status as pic_qc, '' as pic_group_produksi, 
                    created_at, created_at as updated_at
                FROM finished_goods
            `;
            
            let fgParams = [];
            let fgConditions = [];
            
            if (partnumber) {
                fgConditions.push('part_number LIKE ?');
                fgParams.push(`%${partnumber}%`);
            }
            
            if (start_date) {
                fgConditions.push('DATE(created_at) >= ?');
                fgParams.push(start_date);
            }
            
            if (end_date) {
                fgConditions.push('DATE(created_at) <= ?');
                fgParams.push(end_date);
            }
            
            if (fgConditions.length > 0) {
                fgQuery += ' WHERE ' + fgConditions.join(' AND ');
            }
            
            fgQuery += ' ORDER BY created_at DESC';
            
            const [fgReports] = await execute(fgQuery, fgParams);
            reports = reports.concat(fgReports);
        }
        
        // Sort all reports by date
        reports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        res.json({
            success: true,
            data: reports,
            filters: { stock_type, partnumber, start_date, end_date },
            message: 'Stock reports berhasil diambil'
        });
        
    } catch (error) {
        console.error('Stock Reports Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil stock reports',
            error: error.message
        });
    }
});

module.exports = router;
