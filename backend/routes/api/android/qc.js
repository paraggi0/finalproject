/**
 * Android Quality Control API
 * PT. Topline Evergreen Manufacturing
 * QC: Incoming QC, NG QC, Outgoing QC, Return QC
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

// ✅ INCOMING QC - Input Incoming Quality Control
router.post('/incoming', async (req, res) => {
    try {
        const {
            partnumber,
            lotnumber,
            quantity,
            supplier,
            inspector,
            inspection_result,
            notes
        } = req.body;
        
        // Validasi field required
        if (!partnumber || !lotnumber || !quantity || !inspector || !inspection_result) {
            return res.status(400).json({
                success: false,
                message: 'Field partnumber, lotnumber, quantity, inspector, dan inspection_result harus diisi',
                required: ['partnumber', 'lotnumber', 'quantity', 'inspector', 'inspection_result']
            });
        }
        
        // Validasi inspection_result
        const validResults = ['pass', 'fail', 'conditional'];
        if (!validResults.includes(inspection_result.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Inspection result tidak valid',
                valid_results: validResults
            });
        }
        
        // Insert ke tabel iqc_records (mapping dari incoming_qc)
        const [result] = await execute(`
            INSERT INTO iqc_records (
                partnumber, lotnumber, quantity, supplier,
                inspector, inspection_result, notes, inspection_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `, [partnumber, lotnumber, parseInt(quantity), supplier, inspector, inspection_result.toLowerCase(), notes]);
        
        res.status(201).json({
            success: true,
            message: 'Incoming QC berhasil dicatat',
            data: {
                id: result.insertId,
                partnumber,
                lotnumber,
                quantity: parseInt(quantity),
                supplier,
                inspector,
                inspection_result: inspection_result.toLowerCase(),
                notes,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Incoming QC Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mencatat Incoming QC',
            error: error.message
        });
    }
});

// ✅ NG QC - Input NG (Not Good) Quality Control
router.post('/ng', async (req, res) => {
    try {
        const {
            partnumber,
            lotnumber,
            quantity_ng,
            defect_type,
            defect_description,
            inspector,
            action_taken,
            notes
        } = req.body;
        
        // Validasi field required
        if (!partnumber || !lotnumber || !quantity_ng || !defect_type || !inspector) {
            return res.status(400).json({
                success: false,
                message: 'Field partnumber, lotnumber, quantity_ng, defect_type, dan inspector harus diisi',
                required: ['partnumber', 'lotnumber', 'quantity_ng', 'defect_type', 'inspector']
            });
        }
        
        // Validasi quantity
        if (isNaN(quantity_ng) || quantity_ng <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity NG harus berupa angka positif'
            });
        }
        
        // Insert ke tabel ng_qc_records (mapping dari ng_qc)
        const [result] = await execute(`
            INSERT INTO ng_qc_records (
                partnumber, lotnumber, quantity_ng, defect_type,
                defect_description, inspector, action_taken, notes, record_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [partnumber, lotnumber, parseInt(quantity_ng), defect_type, defect_description, inspector, action_taken, notes]);
        
        res.status(201).json({
            success: true,
            message: 'NG QC berhasil dicatat',
            data: {
                id: result.insertId,
                partnumber,
                lotnumber,
                quantity_ng: parseInt(quantity_ng),
                defect_type,
                defect_description,
                inspector,
                action_taken,
                notes,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('NG QC Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mencatat NG QC',
            error: error.message
        });
    }
});

// ✅ OUTGOING QC - Input Outgoing Quality Control
router.post('/outgoing', async (req, res) => {
    try {
        const {
            partnumber,
            lotnumber,
            quantity_total,
            quantity_ok,
            quantity_ng,
            inspector,
            inspection_result,
            notes
        } = req.body;
        
        // Validasi field required
        if (!partnumber || !lotnumber || !quantity_total || !inspector || !inspection_result) {
            return res.status(400).json({
                success: false,
                message: 'Field partnumber, lotnumber, quantity_total, inspector, dan inspection_result harus diisi',
                required: ['partnumber', 'lotnumber', 'quantity_total', 'inspector', 'inspection_result']
            });
        }
        
        // Validasi quantity
        const qtyTotal = parseInt(quantity_total);
        const qtyOk = parseInt(quantity_ok) || 0;
        const qtyNg = parseInt(quantity_ng) || 0;
        
        if (qtyTotal <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity total harus berupa angka positif'
            });
        }
        
        // Validasi inspection_result
        const validResults = ['pass', 'fail', 'conditional'];
        if (!validResults.includes(inspection_result.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Inspection result tidak valid',
                valid_results: validResults
            });
        }
        
        // Insert ke tabel oqc_records (mapping dari outgoing_qc)
        const [result] = await execute(`
            INSERT INTO oqc_records (
                partnumber, lotnumber, quantity_total, quantity_ok, quantity_ng,
                inspector, inspection_result, notes, inspection_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [partnumber, lotnumber, qtyTotal, qtyOk, qtyNg, inspector, inspection_result.toLowerCase(), notes]);
        
        // Jika ada quantity OK, tambahkan ke finished_goods
        if (qtyOk > 0) {
            await execute(`
                INSERT INTO finished_goods (
                    part_number, lot_number, quantity, location, 
                    status
                ) VALUES (?, ?, ?, 'outgoing_qc', 'approved')
            `, [partnumber, lotnumber, qtyOk]);
        }
        
        // Jika ada quantity NG, tambahkan ke ng_qc_records untuk diproses
        if (qtyNg > 0) {
            await execute(`
                INSERT INTO ng_qc_records (
                    partnumber, lotnumber, quantity_ng, defect_type,
                    defect_description, inspector, record_date
                ) VALUES (?, ?, ?, 'outgoing_defect', 'Defect found during outgoing QC', ?, NOW())
            `, [partnumber, lotnumber, qtyNg, inspector]);
        }
        
        res.status(201).json({
            success: true,
            message: 'Outgoing QC berhasil dicatat',
            data: {
                id: result.insertId,
                partnumber,
                lotnumber,
                quantity_total: qtyTotal,
                quantity_ok: qtyOk,
                quantity_ng: qtyNg,
                inspector,
                inspection_result: inspection_result.toLowerCase(),
                notes,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Outgoing QC Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mencatat Outgoing QC',
            error: error.message
        });
    }
});

// ✅ RETURN QC - Input Return Quality Control
router.post('/return', async (req, res) => {
    try {
        const {
            partnumber,
            lotnumber,
            quantity_return,
            return_reason,
            return_from,
            inspector,
            action_plan,
            notes
        } = req.body;
        
        // Validasi field required
        if (!partnumber || !lotnumber || !quantity_return || !return_reason || !inspector) {
            return res.status(400).json({
                success: false,
                message: 'Field partnumber, lotnumber, quantity_return, return_reason, dan inspector harus diisi',
                required: ['partnumber', 'lotnumber', 'quantity_return', 'return_reason', 'inspector']
            });
        }
        
        // Validasi quantity
        if (isNaN(quantity_return) || quantity_return <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity return harus berupa angka positif'
            });
        }
        
        // Insert ke tabel rqc_records (mapping dari return_qc)
        const [result] = await execute(`
            INSERT INTO rqc_records (
                partnumber, lotnumber, quantity_return, return_reason,
                return_from, inspector, action_plan, notes, return_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [partnumber, lotnumber, parseInt(quantity_return), return_reason, return_from, inspector, action_plan, notes]);
        
        res.status(201).json({
            success: true,
            message: 'Return QC berhasil dicatat',
            data: {
                id: result.insertId,
                partnumber,
                lotnumber,
                quantity_return: parseInt(quantity_return),
                return_reason,
                return_from,
                inspector,
                action_plan,
                notes,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Return QC Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mencatat Return QC',
            error: error.message
        });
    }
});

module.exports = router;
