/**
 * Website Production API
 * PT. Topline Evergreen Manufacturing
 * Web Production: Dashboard, Reports, Management
 */

const express = require('express');
const router = express.Router();
const { execute } = require('../../../config/databaseAdapter');

// ✅ PRODUCTION DASHBOARD - Data for production dashboard
router.get('/dashboard', async (req, res) => {
    try {
        // Today's production summary
        const [todayProduction] = await execute(`
            SELECT 
                COUNT(*) as total_records,
                SUM(quantity) as total_produced,
                SUM(quantity_ng) as total_ng,
                COUNT(DISTINCT machine) as active_machines,
                COUNT(DISTINCT operator) as active_operators
            FROM outputmc 
            WHERE DATE(created_at) = CURDATE()
        `);
        
        // Machine status summary
        const [machineStatus] = await execute(`
            SELECT 
                current_status as status,
                COUNT(*) as count,
                GROUP_CONCAT(DISTINCT machine_name) as machines
            FROM machine_status 
            WHERE DATE(last_updated) = CURDATE()
            GROUP BY current_status
        `);
        
        // Recent activities
        const [recentOutput] = await execute(`
            SELECT 
                machine, operator, partnumber, quantity, 
                quantity_ng, created_at
            FROM outputmc 
            ORDER BY created_at DESC 
            LIMIT 10
        `);
        
        // WIP status
        const [wipStatus] = await execute(`
            SELECT 
                COUNT(*) as total_lots,
                SUM(quantity) as total_quantity,
                COUNT(DISTINCT partnumber) as unique_parts
            FROM wip
        `);
        
        res.json({
            success: true,
            data: {
                today_production: todayProduction[0],
                machine_status: machineStatus,
                recent_output: recentOutput,
                wip_status: wipStatus[0],
                last_updated: new Date().toISOString()
            },
            message: 'Dashboard data berhasil diambil'
        });
        
    } catch (error) {
        console.error('Production Dashboard Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data dashboard produksi',
            error: error.message
        });
    }
});

// ✅ PRODUCTION REPORTS - Production reports
router.get('/reports', async (req, res) => {
    try {
        const { start_date, end_date, machine, operator } = req.query;
        
        let query = `
            SELECT 
                machine, operator, partnumber, customer,
                quantity, quantity_ng, created_at
            FROM outputmc
        `;
        
        let params = [];
        let whereConditions = [];
        
        if (start_date) {
            whereConditions.push('DATE(created_at) >= ?');
            params.push(start_date);
        }
        
        if (end_date) {
            whereConditions.push('DATE(created_at) <= ?');
            params.push(end_date);
        }
        
        if (machine) {
            whereConditions.push('machine = ?');
            params.push(machine);
        }
        
        if (operator) {
            whereConditions.push('operator = ?');
            params.push(operator);
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        query += ' ORDER BY created_at DESC';
        
        const [reports] = await execute(query, params);
        
        res.json({
            success: true,
            data: reports,
            filters: { start_date, end_date, machine, operator },
            message: 'Report produksi berhasil diambil'
        });
        
    } catch (error) {
        console.error('Production Reports Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil report produksi',
            error: error.message
        });
    }
});

module.exports = router;
