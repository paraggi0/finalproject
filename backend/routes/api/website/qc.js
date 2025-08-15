/**
 * Website Quality Control API
 * PT. Topline Evergreen Manufacturing
 * Web QC: Dashboard, Reports, Management
 */

const express = require('express');
const router = express.Router();
const { execute } = require('../../../config/databaseAdapter');

// ✅ QC DASHBOARD - Data for QC dashboard
router.get('/dashboard', async (req, res) => {
    try {
        // Today's QC summary
        const [todayQC] = await execute(`
            SELECT 
                'incoming' as qc_type,
                COUNT(*) as total_inspections,
                SUM(quantity) as total_quantity,
                COUNT(CASE WHEN status = 'pass' THEN 1 END) as passed,
                COUNT(CASE WHEN status = 'fail' THEN 1 END) as failed
            FROM iqc_records 
            WHERE DATE(created_at) = CURDATE()
        `);
        
        // NG summary - simplified version
        const [ngSummary] = await execute(`
            SELECT 
                'unknown' as defect_type,
                0 as count,
                0 as total_ng_quantity
            WHERE 1=0
        `);
        
        // Recent QC activities
        const [recentQC] = await execute(`
            SELECT 
                'incoming' as type, part_number as partnumber, lot_number as lotnumber, 
                quantity, status as inspection_result, inspector, created_at as activity_date
            FROM iqc_records 
            WHERE DATE(created_at) = CURDATE()
            
            ORDER BY activity_date DESC
            LIMIT 10
        `);
        
        res.json({
            success: true,
            data: {
                today_qc_summary: todayQC,
                ng_summary: ngSummary,
                recent_activities: recentQC,
                last_updated: new Date().toISOString()
            },
            message: 'QC Dashboard data berhasil diambil'
        });
        
    } catch (error) {
        console.error('QC Dashboard Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data QC dashboard',
            error: error.message
        });
    }
});

// ✅ QC REPORTS - QC reports
router.get('/reports', async (req, res) => {
    try {
        const { start_date, end_date, qc_type, inspector } = req.query;
        
        let reports = [];
        
        // Incoming QC Reports
        if (!qc_type || qc_type === 'incoming') {
            let iqcQuery = `
                SELECT 
                    'incoming' as qc_type, part_number as partnumber, lot_number as lotnumber, quantity,
                    '' as supplier, inspector, status as inspection_result, '' as notes, created_at as inspection_date
                FROM iqc_records
            `;
            
            let iqcParams = [];
            let iqcConditions = [];
            
            if (start_date) {
                iqcConditions.push('DATE(created_at) >= ?');
                iqcParams.push(start_date);
            }
            
            if (end_date) {
                iqcConditions.push('DATE(created_at) <= ?');
                iqcParams.push(end_date);
            }
            
            if (inspector) {
                iqcConditions.push('inspector = ?');
                iqcParams.push(inspector);
            }
            
            if (iqcConditions.length > 0) {
                iqcQuery += ' WHERE ' + iqcConditions.join(' AND ');
            }
            
            iqcQuery += ' ORDER BY created_at DESC';
            
            const [iqcReports] = await execute(iqcQuery, iqcParams);
            reports = reports.concat(iqcReports);
        }
        
        // Sort all reports by date
        reports.sort((a, b) => new Date(b.inspection_date) - new Date(a.inspection_date));
        
        res.json({
            success: true,
            data: reports,
            filters: { start_date, end_date, qc_type, inspector },
            message: 'QC Reports berhasil diambil'
        });
        
    } catch (error) {
        console.error('QC Reports Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil QC reports',
            error: error.message
        });
    }
});

module.exports = router;
