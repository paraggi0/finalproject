const express = require('express');
const router = express.Router();
const { execute } = require('../../../config/databaseAdapter');

// ========================================
// ANDROID WAREHOUSE API ENDPOINTS
// Warehouse Management for Mobile App
// ========================================

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

// GET - List Delivery Challans (DC)
router.get('/delivery-challans', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, customer } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = '';
        let queryParams = [];
        
        if (status || customer) {
            const conditions = [];
            if (status) {
                conditions.push('dc.status = ?');
                queryParams.push(status);
            }
            if (customer) {
                conditions.push('dc.customer = ?');
                queryParams.push(customer);
            }
            whereClause = 'WHERE ' + conditions.join(' AND ');
        }
        
        // Get delivery challans with pagination
        const [dcItems] = await execute(`
            SELECT 
                dc.id,
                dc.dc_number,
                dc.customer,
                dc.total_quantity,
                dc.total_cartons,
                dc.status,
                dc.prepared_by,
                dc.created_date,
                dc.scheduled_date,
                COUNT(*) OVER() as total_count
            FROM delivery_challans dc
            ${whereClause}
            ORDER BY dc.created_date DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, parseInt(limit), offset]);
        
        const totalCount = dcItems.length > 0 ? dcItems[0].total_count : 0;
        const totalPages = Math.ceil(totalCount / limit);
        
        res.json({
            success: true,
            data: dcItems.map(item => ({
                id: item.id,
                dc_number: item.dc_number,
                customer: item.customer,
                total_quantity: item.total_quantity,
                total_cartons: item.total_cartons,
                status: item.status,
                prepared_by: item.prepared_by,
                created_date: item.created_date,
                scheduled_date: item.scheduled_date
            })),
            pagination: {
                current_page: parseInt(page),
                total_pages: totalPages,
                total_records: totalCount,
                records_per_page: parseInt(limit)
            },
            message: 'Delivery challans berhasil diambil'
        });
        
    } catch (error) {
        console.error('Delivery Challans Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data delivery challans',
            error: error.message
        });
    }
});

// POST - Create Delivery Challan
router.post('/delivery-challan', async (req, res) => {
    try {
        const {
            customer,
            delivery_items, // Array of items
            prepared_by,
            scheduled_date,
            destination_address,
            transport_mode,
            remarks
        } = req.body;
        
        // Validate required fields
        if (!customer || !delivery_items || !Array.isArray(delivery_items) || delivery_items.length === 0 || !prepared_by) {
            return res.status(400).json({
                success: false,
                message: 'Customer, delivery_items (array), dan prepared_by harus diisi'
            });
        }
        
        // Generate DC number
        const dcNumber = `DC${Date.now()}`;
        
        // Calculate totals
        let totalQuantity = 0;
        let totalCartons = 0;
        
        delivery_items.forEach(item => {
            totalQuantity += parseInt(item.quantity) || 0;
            totalCartons += parseInt(item.cartons) || 0;
        });
        
        // Insert delivery challan header
        const [dcResult] = await execute(`
            INSERT INTO delivery_challans (
                dc_number, customer, total_quantity, total_cartons,
                status, prepared_by, created_date, scheduled_date,
                destination_address, transport_mode, remarks
            )
            VALUES (?, ?, ?, ?, 'PENDING', ?, NOW(), ?, ?, ?, ?)
        `, [dcNumber, customer, totalQuantity, totalCartons, prepared_by, scheduled_date, destination_address, transport_mode, remarks]);
        
        const dcId = dcResult.insertId;
        
        // Insert delivery challan items
        for (const item of delivery_items) {
            if (!item.partnumber || !item.quantity) {
                continue; // Skip invalid items
            }
            
            await execute(`
                INSERT INTO delivery_challan_items (
                    dc_id, partnumber, description, quantity, cartons,
                    lot_number, remarks
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [dcId, item.partnumber, item.description, item.quantity, item.cartons, item.lot_number, item.remarks]);
        }
        
        res.status(201).json({
            success: true,
            data: {
                dc_id: dcId,
                dc_number: dcNumber,
                customer,
                total_quantity: totalQuantity,
                total_cartons: totalCartons,
                prepared_by,
                status: 'PENDING',
                items_count: delivery_items.length,
                created_date: new Date().toISOString()
            },
            message: 'Delivery challan berhasil dibuat'
        });
        
    } catch (error) {
        console.error('Create Delivery Challan Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat delivery challan',
            error: error.message
        });
    }
});

// GET - List Delivery Orders (DO)
router.get('/delivery-orders', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, customer } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = '';
        let queryParams = [];
        
        if (status || customer) {
            const conditions = [];
            if (status) {
                conditions.push('do.status = ?');
                queryParams.push(status);
            }
            if (customer) {
                conditions.push('do.customer = ?');
                queryParams.push(customer);
            }
            whereClause = 'WHERE ' + conditions.join(' AND ');
        }
        
        // Get delivery orders with pagination
        const [doItems] = await execute(`
            SELECT 
                do.id,
                do.do_number,
                do.dc_number,
                do.customer,
                do.total_quantity,
                do.vehicle_number,
                do.driver_name,
                do.status,
                do.delivered_by,
                do.delivery_date,
                do.created_date,
                COUNT(*) OVER() as total_count
            FROM delivery_orders do
            ${whereClause}
            ORDER BY do.created_date DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, parseInt(limit), offset]);
        
        const totalCount = doItems.length > 0 ? doItems[0].total_count : 0;
        const totalPages = Math.ceil(totalCount / limit);
        
        res.json({
            success: true,
            data: doItems.map(item => ({
                id: item.id,
                do_number: item.do_number,
                dc_number: item.dc_number,
                customer: item.customer,
                total_quantity: item.total_quantity,
                vehicle_number: item.vehicle_number,
                driver_name: item.driver_name,
                status: item.status,
                delivered_by: item.delivered_by,
                delivery_date: item.delivery_date,
                created_date: item.created_date
            })),
            pagination: {
                current_page: parseInt(page),
                total_pages: totalPages,
                total_records: totalCount,
                records_per_page: parseInt(limit)
            },
            message: 'Delivery orders berhasil diambil'
        });
        
    } catch (error) {
        console.error('Delivery Orders Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data delivery orders',
            error: error.message
        });
    }
});

// POST - Create Delivery Order from DC
router.post('/delivery-order', async (req, res) => {
    try {
        const {
            dc_id,
            vehicle_number,
            driver_name,
            driver_phone,
            delivered_by,
            delivery_instructions,
            remarks
        } = req.body;
        
        // Validate required fields
        if (!dc_id || !vehicle_number || !driver_name || !delivered_by) {
            return res.status(400).json({
                success: false,
                message: 'DC_id, vehicle_number, driver_name, dan delivered_by harus diisi'
            });
        }
        
        // Check if DC exists and is ready for delivery
        const [dcCheck] = await execute(`
            SELECT dc_number, customer, total_quantity, status FROM delivery_challans WHERE id = ?
        `, [dc_id]);
        
        if (dcCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Delivery challan tidak ditemukan'
            });
        }
        
        if (dcCheck[0].status !== 'READY') {
            return res.status(400).json({
                success: false,
                message: 'Delivery challan belum ready untuk delivery'
            });
        }
        
        // Generate DO number
        const doNumber = `DO${Date.now()}`;
        
        // Insert delivery order
        const [doResult] = await execute(`
            INSERT INTO delivery_orders (
                do_number, dc_id, dc_number, customer, total_quantity,
                vehicle_number, driver_name, driver_phone, delivered_by,
                status, delivery_instructions, remarks, created_date
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'IN_TRANSIT', ?, ?, NOW())
        `, [
            doNumber, dc_id, dcCheck[0].dc_number, dcCheck[0].customer, dcCheck[0].total_quantity,
            vehicle_number, driver_name, driver_phone, delivered_by,
            delivery_instructions, remarks
        ]);
        
        // Update DC status to DISPATCHED
        await execute(`
            UPDATE delivery_challans SET status = 'DISPATCHED' WHERE id = ?
        `, [dc_id]);
        
        res.status(201).json({
            success: true,
            data: {
                do_id: doResult.insertId,
                do_number: doNumber,
                dc_number: dcCheck[0].dc_number,
                customer: dcCheck[0].customer,
                total_quantity: dcCheck[0].total_quantity,
                vehicle_number,
                driver_name,
                delivered_by,
                status: 'IN_TRANSIT',
                created_date: new Date().toISOString()
            },
            message: 'Delivery order berhasil dibuat'
        });
        
    } catch (error) {
        console.error('Create Delivery Order Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat delivery order',
            error: error.message
        });
    }
});

// POST - Update Delivery Status
router.post('/update-delivery-status', async (req, res) => {
    try {
        const {
            do_id,
            status, // 'IN_TRANSIT', 'DELIVERED', 'RETURNED', 'CANCELLED'
            delivery_confirmation,
            received_by,
            received_date,
            delivery_notes,
            proof_of_delivery // Base64 image or file reference
        } = req.body;
        
        // Validate required fields
        if (!do_id || !status) {
            return res.status(400).json({
                success: false,
                message: 'DO_id dan status harus diisi'
            });
        }
        
        // Validate status
        const validStatuses = ['IN_TRANSIT', 'DELIVERED', 'RETURNED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status tidak valid',
                valid_statuses: validStatuses
            });
        }
        
        // Check if DO exists
        const [doCheck] = await execute(`
            SELECT id, do_number, status as current_status FROM delivery_orders WHERE id = ?
        `, [do_id]);
        
        if (doCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Delivery order tidak ditemukan'
            });
        }
        
        // Update delivery order status
        await execute(`
            UPDATE delivery_orders 
            SET status = ?, received_by = ?, received_date = ?, 
                delivery_notes = ?, proof_of_delivery = ?, last_updated = NOW()
            WHERE id = ?
        `, [status, received_by, received_date, delivery_notes, proof_of_delivery, do_id]);
        
        // Insert delivery tracking log
        await execute(`
            INSERT INTO delivery_tracking (
                do_id, status, notes, updated_by, timestamp
            )
            VALUES (?, ?, ?, ?, NOW())
        `, [do_id, status, delivery_notes, received_by || 'system']);
        
        res.status(200).json({
            success: true,
            data: {
                do_id,
                do_number: doCheck[0].do_number,
                previous_status: doCheck[0].current_status,
                new_status: status,
                received_by,
                received_date,
                updated_at: new Date().toISOString()
            },
            message: 'Delivery status berhasil diupdate'
        });
        
    } catch (error) {
        console.error('Update Delivery Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate delivery status',
            error: error.message
        });
    }
});

// GET - Warehouse Inventory Summary
router.get('/inventory-summary', async (req, res) => {
    try {
        const { location, part_type } = req.query;
        
        let whereClause = '';
        let queryParams = [];
        
        if (location || part_type) {
            const conditions = [];
            if (location) {
                conditions.push('location = ?');
                queryParams.push(location);
            }
            if (part_type) {
                conditions.push('part_type = ?');
                queryParams.push(part_type);
            }
            whereClause = 'WHERE ' + conditions.join(' AND ');
        }
        
        // Get inventory summary by location
        const [inventorySummary] = await execute(`
            SELECT 
                location,
                part_type,
                COUNT(DISTINCT part_number) as unique_parts,
                SUM(quantity) as total_quantity,
                COUNT(*) as total_lots
            FROM (
                SELECT part_number, lot_number, quantity, 'WIP' as location, 'wip' as part_type
                FROM wip_inventory 
                UNION ALL
                SELECT part_number, lot_number, quantity, location, 'finished_goods' as part_type
                FROM finished_goods
            ) combined_inventory
            ${whereClause}
            GROUP BY location, part_type
            ORDER BY location, part_type
        `, queryParams);
        
        // Get low stock alerts (assuming we have minimum stock levels)
        const [lowStockItems] = await execute(`
            SELECT 
                part_number,
                SUM(quantity) as current_stock,
                'Low Stock Alert' as alert_type
            FROM finished_goods 
            GROUP BY part_number
            HAVING current_stock < 100
            ORDER BY current_stock ASC
            LIMIT 10
        `);
        
        res.json({
            success: true,
            data: {
                inventory_summary: inventorySummary,
                low_stock_alerts: lowStockItems,
                summary_date: new Date().toISOString()
            },
            message: 'Warehouse inventory summary berhasil diambil'
        });
        
    } catch (error) {
        console.error('Inventory Summary Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil inventory summary',
            error: error.message
        });
    }
});

module.exports = router;
