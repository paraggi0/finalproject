/**
 * Website Stock Management API
 * PT. Topline Evergreen Manufacturing
 * CRUD Operations for Stock/Inventory
 */

const express = require('express');
const router = express.Router();
const { execute } = require('../../../config/databaseAdapter');

// Website Authentication middleware
const authenticateWebsite = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== 'website-admin-2025') {
        return res.status(401).json({
            success: false,
            message: 'API key tidak valid atau tidak ada'
        });
    }
    next();
};

// Apply middleware to all routes
router.use(authenticateWebsite);

// ========================================
// WIP STOCK CRUD
// ========================================

// GET - List all WIP stock with pagination and filters
router.get('/wip', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            partnumber, 
            lotnumber,
            operator,
            search 
        } = req.query;
        
        const offset = (page - 1) * limit;
        
        let whereConditions = [];
        let params = [];
        
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
        
        if (search) {
            whereConditions.push('(partnumber LIKE ? OR lotnumber LIKE ? OR operator LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        // Get total count
        const [countResult] = await execute(`
            SELECT COUNT(*) as total FROM wip ${whereClause}
        `, params);
        
        // Get paginated data with BOM details
        const [wipData] = await execute(`
            SELECT w.*, b.customer, b.model, b.description
            FROM wip w
            LEFT JOIN billofmaterial b ON w.partnumber = b.partnumber
            ${whereClause}
            ORDER BY w.updated_at DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), parseInt(offset)]);
        
        res.json({
            success: true,
            data: {
                wip_records: wipData,
                pagination: {
                    total: countResult[0].total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_pages: Math.ceil(countResult[0].total / limit)
                }
            },
            message: 'WIP stock data berhasil diambil'
        });
        
    } catch (error) {
        console.error('Get WIP Stock Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data WIP stock',
            error: error.message
        });
    }
});

// GET - Single WIP by ID
router.get('/wip/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [wipData] = await execute(`
            SELECT w.*, b.customer, b.model, b.description
            FROM wip w
            LEFT JOIN billofmaterial b ON w.partnumber = b.partnumber
            WHERE w.id = ?
        `, [id]);
        
        if (wipData.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'WIP stock tidak ditemukan'
            });
        }
        
        res.json({
            success: true,
            data: wipData[0],
            message: 'WIP stock data berhasil diambil'
        });
        
    } catch (error) {
        console.error('Get Single WIP Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data WIP stock',
            error: error.message
        });
    }
});

// POST - Create new WIP stock entry
router.post('/wip', async (req, res) => {
    try {
        const { 
            partnumber, 
            lotnumber, 
            quantity, 
            operator, 
            pic_qc, 
            pic_group_produksi,
            remarks 
        } = req.body;
        
        // Validate required fields
        if (!partnumber || !lotnumber || !quantity || !operator) {
            return res.status(400).json({
                success: false,
                message: 'Partnumber, lotnumber, quantity, dan operator harus diisi'
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
        
        // Insert new WIP entry
        const [result] = await execute(`
            INSERT INTO wip (
                partnumber, lotnumber, quantity, operator, 
                pic_qc, pic_group_produksi, remarks, 
                created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [partnumber, lotnumber, quantity, operator, pic_qc, pic_group_produksi, remarks]);
        
        // Get created data with BOM details
        const [createdData] = await execute(`
            SELECT w.*, b.customer, b.model, b.description
            FROM wip w
            LEFT JOIN billofmaterial b ON w.partnumber = b.partnumber
            WHERE w.id = ?
        `, [result.insertId]);
        
        res.status(201).json({
            success: true,
            data: createdData[0],
            message: 'WIP stock berhasil ditambahkan'
        });
        
    } catch (error) {
        console.error('Create WIP Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan WIP stock',
            error: error.message
        });
    }
});

// PUT - Update WIP stock
router.put('/wip/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            partnumber, 
            lotnumber, 
            quantity, 
            operator, 
            pic_qc, 
            pic_group_produksi,
            remarks 
        } = req.body;
        
        // Check if WIP exists
        const [existing] = await execute(`
            SELECT id FROM wip WHERE id = ?
        `, [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'WIP stock tidak ditemukan'
            });
        }
        
        // Build update query
        const updateFields = [];
        const updateParams = [];
        
        if (partnumber) {
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
            
            updateFields.push('partnumber = ?');
            updateParams.push(partnumber);
        }
        if (lotnumber) {
            updateFields.push('lotnumber = ?');
            updateParams.push(lotnumber);
        }
        if (quantity) {
            updateFields.push('quantity = ?');
            updateParams.push(quantity);
        }
        if (operator) {
            updateFields.push('operator = ?');
            updateParams.push(operator);
        }
        if (pic_qc !== undefined) {
            updateFields.push('pic_qc = ?');
            updateParams.push(pic_qc);
        }
        if (pic_group_produksi !== undefined) {
            updateFields.push('pic_group_produksi = ?');
            updateParams.push(pic_group_produksi);
        }
        if (remarks !== undefined) {
            updateFields.push('remarks = ?');
            updateParams.push(remarks);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Tidak ada data yang diupdate'
            });
        }
        
        updateFields.push('updated_at = NOW()');
        updateParams.push(id);
        
        await execute(`
            UPDATE wip 
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `, updateParams);
        
        // Get updated data
        const [updatedData] = await execute(`
            SELECT w.*, b.customer, b.model, b.description
            FROM wip w
            LEFT JOIN billofmaterial b ON w.partnumber = b.partnumber
            WHERE w.id = ?
        `, [id]);
        
        res.json({
            success: true,
            data: updatedData[0],
            message: 'WIP stock berhasil diupdate'
        });
        
    } catch (error) {
        console.error('Update WIP Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate WIP stock',
            error: error.message
        });
    }
});

// DELETE - Delete WIP stock
router.delete('/wip/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if WIP exists
        const [existing] = await execute(`
            SELECT * FROM wip WHERE id = ?
        `, [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'WIP stock tidak ditemukan'
            });
        }
        
        // Delete WIP
        await execute(`
            DELETE FROM wip WHERE id = ?
        `, [id]);
        
        res.json({
            success: true,
            data: existing[0],
            message: 'WIP stock berhasil dihapus'
        });
        
    } catch (error) {
        console.error('Delete WIP Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus WIP stock',
            error: error.message
        });
    }
});

// ========================================
// FINISHED GOODS STOCK CRUD
// ========================================

// GET - List all finished goods
router.get('/finished-goods', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            partnumber, 
            customer,
            search 
        } = req.query;
        
        const offset = (page - 1) * limit;
        
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
        
        if (search) {
            whereConditions.push('(fg.partnumber LIKE ? OR b.customer LIKE ? OR b.description LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        // Get total count
        const [countResult] = await execute(`
            SELECT COUNT(*) as total 
            FROM finished_goods fg
            LEFT JOIN billofmaterial b ON fg.partnumber = b.partnumber
            ${whereClause}
        `, params);
        
        // Get paginated data
        const [fgData] = await execute(`
            SELECT fg.*, b.customer, b.model, b.description
            FROM finished_goods fg
            LEFT JOIN billofmaterial b ON fg.partnumber = b.partnumber
            ${whereClause}
            ORDER BY fg.updated_at DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), parseInt(offset)]);
        
        res.json({
            success: true,
            data: {
                finished_goods: fgData,
                pagination: {
                    total: countResult[0].total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_pages: Math.ceil(countResult[0].total / limit)
                }
            },
            message: 'Finished goods data berhasil diambil'
        });
        
    } catch (error) {
        console.error('Get Finished Goods Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data finished goods',
            error: error.message
        });
    }
});

// POST - Add finished goods stock
router.post('/finished-goods', async (req, res) => {
    try {
        const { 
            partnumber, 
            quantity, 
            location, 
            batch_number,
            remarks 
        } = req.body;
        
        // Validate required fields
        if (!partnumber || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Partnumber dan quantity harus diisi'
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
        
        // Insert new finished goods
        const [result] = await execute(`
            INSERT INTO finished_goods (
                partnumber, quantity, location, batch_number, remarks,
                created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `, [partnumber, quantity, location, batch_number, remarks]);
        
        // Get created data with BOM details
        const [createdData] = await execute(`
            SELECT fg.*, b.customer, b.model, b.description
            FROM finished_goods fg
            LEFT JOIN billofmaterial b ON fg.partnumber = b.partnumber
            WHERE fg.id = ?
        `, [result.insertId]);
        
        res.status(201).json({
            success: true,
            data: createdData[0],
            message: 'Finished goods berhasil ditambahkan'
        });
        
    } catch (error) {
        console.error('Create Finished Goods Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan finished goods',
            error: error.message
        });
    }
});

// ========================================
// STOCK SUMMARY & REPORTS
// ========================================

// GET - Stock summary dashboard
router.get('/summary', async (req, res) => {
    try {
        // Get WIP summary
        const [wipSummary] = await execute(`
            SELECT 
                COUNT(*) as total_lots,
                SUM(quantity) as total_quantity,
                COUNT(DISTINCT partnumber) as unique_parts
            FROM wip
        `);
        
        // Get Finished Goods summary
        const [fgSummary] = await execute(`
            SELECT 
                COUNT(*) as total_items,
                SUM(quantity) as total_quantity,
                COUNT(DISTINCT part_number) as unique_parts
            FROM finished_goods
        `);
        
        // Get low stock alerts (assuming minimum stock level of 50)
        const [lowStock] = await execute(`
            SELECT fg.part_number, fg.quantity, b.customer, b.description
            FROM finished_goods fg
            LEFT JOIN billofmaterial b ON fg.part_number = b.partnumber
            WHERE fg.quantity < 50
            ORDER BY fg.quantity ASC
            LIMIT 10
        `);
        
        // Get recent activities
        const [recentWip] = await execute(`
            SELECT 'WIP' as type, partnumber, quantity, operator as actor, updated_at
            FROM wip
            ORDER BY updated_at DESC
            LIMIT 5
        `);
        
        const [recentFg] = await execute(`
            SELECT 'FG' as type, part_number as partnumber, quantity, 'System' as actor, created_at as updated_at
            FROM finished_goods
            ORDER BY created_at DESC
            LIMIT 5
        `);
        
        const recentActivities = [...recentWip, ...recentFg]
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 10);
        
        res.json({
            success: true,
            data: {
                wip_summary: wipSummary[0],
                finished_goods_summary: fgSummary[0],
                low_stock_alerts: lowStock,
                recent_activities: recentActivities,
                last_updated: new Date().toISOString()
            },
            message: 'Stock summary berhasil diambil'
        });
        
    } catch (error) {
        console.error('Get Stock Summary Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil stock summary',
            error: error.message
        });
    }
});

module.exports = router;
