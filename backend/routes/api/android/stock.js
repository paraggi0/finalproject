/**
 * Android Stock Management API
 * PT. Topline Evergreen Manufacturing
 * Stock: WIP Stock, Finish Goods Stock, Stock Summary
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

// ✅ WIP STOCK - View WIP Stock
router.get('/wip', async (req, res) => {
    try {
        const { partnumber, lotnumber, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT 
                partnumber, lotnumber, quantity, 
                operator, pic_qc, pic_group_produksi,
                created_at, updated_at
            FROM wip
        `;
        
        let params = [];
        let whereConditions = [];
        
        if (partnumber) {
            whereConditions.push('partnumber LIKE ?');
            params.push(`%${partnumber}%`);
        }
        
        if (lotnumber) {
            whereConditions.push('lotnumber LIKE ?');
            params.push(`%${lotnumber}%`);
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        query += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
        
        const [wipStock] = await execute(query, params);
        
        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM wip';
        if (whereConditions.length > 0) {
            countQuery += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        const [countResult] = await execute(countQuery, params);
        const total = countResult[0].total;
        
        res.json({
            success: true,
            data: wipStock,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                has_more: (parseInt(offset) + parseInt(limit)) < total
            },
            message: 'Stock WIP berhasil diambil'
        });
        
    } catch (error) {
        console.error('WIP Stock Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil stock WIP',
            error: error.message
        });
    }
});

// ✅ FINISH GOODS STOCK - View Finish Goods Stock
router.get('/finish-goods', async (req, res) => {
    try {
        const { partnumber, lotnumber, status, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT 
                part_number, lot_number, quantity, location,
                status, created_at
            FROM finished_goods
        `;
        
        let params = [];
        let whereConditions = [];
        
        if (partnumber) {
            whereConditions.push('part_number LIKE ?');
            params.push(`%${partnumber}%`);
        }
        
        if (lotnumber) {
            whereConditions.push('lot_number LIKE ?');
            params.push(`%${lotnumber}%`);
        }
        
        if (status) {
            whereConditions.push('status = ?');
            params.push(status);
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        query += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
        
        const [finishGoodsStock] = await execute(query, params);
        
        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM finished_goods';
        if (whereConditions.length > 0) {
            countQuery += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        const [countResult] = await execute(countQuery, params);
        const total = countResult[0].total;
        
        // Get summary statistics
        const [summary] = await execute(`
            SELECT 
                COUNT(*) as total_records,
                SUM(quantity) as total_quantity,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_records,
                SUM(CASE WHEN status = 'approved' THEN quantity ELSE 0 END) as approved_quantity
            FROM finished_goods
        `);
        
        res.json({
            success: true,
            data: finishGoodsStock,
            summary: summary[0],
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                has_more: (parseInt(offset) + parseInt(limit)) < total
            },
            message: 'Stock Finish Goods berhasil diambil'
        });
        
    } catch (error) {
        console.error('Finish Goods Stock Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil stock Finish Goods',
            error: error.message
        });
    }
});

// ✅ STOCK SUMMARY - Summary of all stocks
router.get('/summary', async (req, res) => {
    try {
        // WIP Summary
        const [wipSummary] = await execute(`
            SELECT 
                COUNT(*) as total_wip_lots,
                SUM(quantity) as total_wip_quantity,
                COUNT(DISTINCT partnumber) as unique_partnumbers_wip
            FROM wip
        `);
        
        // Finish Goods Summary (menggunakan struktur tabel yang benar)
        const [fgSummary] = await execute(`
            SELECT 
                COUNT(*) as total_fg_lots,
                SUM(quantity) as total_fg_quantity,
                COUNT(DISTINCT part_number) as unique_partnumbers_fg,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_lots,
                SUM(CASE WHEN status = 'approved' THEN quantity ELSE 0 END) as approved_quantity
            FROM finished_goods
        `);
        
        // Recent Activities
        const [recentWip] = await execute(`
            SELECT partnumber, lotnumber, quantity, created_at
            FROM wip 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        
        const [recentFg] = await execute(`
            SELECT part_number, lot_number, quantity, status, created_at
            FROM finished_goods 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        
        // Production Summary (dari outputmc)
        const [productionSummary] = await execute(`
            SELECT 
                COUNT(*) as total_production_records,
                SUM(quantity) as total_produced,
                SUM(quantity_ng) as total_ng,
                COUNT(DISTINCT machine) as active_machines
            FROM outputmc 
            WHERE DATE(created_at) = CURDATE()
        `);
        
        res.json({
            success: true,
            data: {
                wip_summary: wipSummary[0],
                finish_goods_summary: fgSummary[0],
                production_today: productionSummary[0],
                recent_activities: {
                    recent_wip: recentWip,
                    recent_finish_goods: recentFg
                },
                last_updated: new Date().toISOString()
            },
            message: 'Stock summary berhasil diambil'
        });
        
    } catch (error) {
        console.error('Stock Summary Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil stock summary',
            error: error.message
        });
    }
});

module.exports = router;
