/**
 * Website Warehouse API
 * PT. Topline Evergreen Manufacturing
 * Web Warehouse: Stock management, Reports
 */

const express = require('express');
const router = express.Router();
const { execute } = require('../../../config/databaseAdapter');

// ✅ WAREHOUSE DASHBOARD - Data for warehouse dashboard
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
        
        // Recent stock movements
        const [recentWip] = await execute(`
            SELECT 
                'wip' as stock_type, partnumber as part_number, 
                lotnumber as lot_number, quantity, operator as moved_by, 
                created_at as movement_date
            FROM wip 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        
        const [recentFg] = await execute(`
            SELECT 
                'finished_goods' as stock_type, part_number, 
                lot_number, quantity, 'system' as moved_by, 
                created_at as movement_date
            FROM finished_goods 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        
        const recentMovements = [...recentWip, ...recentFg]
            .sort((a, b) => new Date(b.movement_date) - new Date(a.movement_date))
            .slice(0, 10);
        
        res.json({
            success: true,
            data: {
                wip_summary: wipSummary[0],
                finish_goods_summary: fgSummary[0],
                recent_movements: recentMovements,
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

// ✅ STOCK REPORTS - Stock reports
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
                    status as pic_qc, '' as pic_group_produksi, 
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
