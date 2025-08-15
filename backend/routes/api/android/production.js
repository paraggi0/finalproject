/**
 * Android Production API
 * PT. Topline Evergreen Manufacturing
 * Production: MC Output, MC Status, Transfer QC, WIP Second
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

// ✅ CUSTOMERS DROPDOWN - untuk form production
router.get('/dropdown/customers', async (req, res) => {
    try {
        const [customers] = await execute(`
            SELECT DISTINCT customer 
            FROM billofmaterial 
            WHERE customer IS NOT NULL AND customer != '' 
            ORDER BY customer
        `);
        
        res.json({
            success: true,
            data: {
                customers: customers.map(c => ({ 
                    value: c.customer, 
                    label: c.customer 
                })),
                total_customers: customers.length
            },
            message: 'Data customer berhasil diambil'
        });
        
    } catch (error) {
        console.error('Customers Dropdown Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data customer',
            error: error.message
        });
    }
});

// ✅ BOM DROPDOWN - untuk form production (Enhanced version)
router.get('/bom-dropdown', async (req, res) => {
    try {
        // Ambil data customer unik
        const [customers] = await execute(`
            SELECT DISTINCT customer 
            FROM billofmaterial 
            WHERE customer IS NOT NULL AND customer != '' 
            ORDER BY customer
        `);
        
        // Ambil semua data BOM dengan struktur lengkap
        const [bomData] = await execute(`
            SELECT 
                id, customer, partnumber, model, description, timestamp 
            FROM billofmaterial 
            ORDER BY customer, partnumber
        `);
        
        // Group data by customer untuk cascading dropdown
        const groupedByCustomer = {};
        bomData.forEach(item => {
            if (!groupedByCustomer[item.customer]) {
                groupedByCustomer[item.customer] = [];
            }
            groupedByCustomer[item.customer].push({
                id: item.id,
                partnumber: item.partnumber,
                model: item.model,
                description: item.description,
                timestamp: item.timestamp
            });
        });
        
        res.json({
            success: true,
            data: {
                customers: customers.map(c => c.customer),
                bom_data: bomData,
                grouped_by_customer: groupedByCustomer,
                total_customers: customers.length,
                total_bom_records: bomData.length
            },
            message: 'BOM dropdown data berhasil diambil'
        });
        
    } catch (error) {
        console.error('BOM Dropdown Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data BOM',
            error: error.message
        });
    }
});

// ✅ GET BOM BY CUSTOMER - untuk cascading dropdown level 2
router.get('/bom-by-customer/:customer', async (req, res) => {
    try {
        const { customer } = req.params;
        
        if (!customer) {
            return res.status(400).json({
                success: false,
                message: 'Parameter customer harus diisi'
            });
        }
        
        // Ambil data BOM berdasarkan customer
        const [bomByCustomer] = await execute(`
            SELECT 
                id, partnumber, model, description, timestamp 
            FROM billofmaterial 
            WHERE customer = ? 
            ORDER BY partnumber
        `, [customer]);
        
        // Ambil partnumber unik untuk customer ini
        const [partNumbers] = await execute(`
            SELECT DISTINCT partnumber 
            FROM billofmaterial 
            WHERE customer = ? AND partnumber IS NOT NULL AND partnumber != ''
            ORDER BY partnumber
        `, [customer]);
        
        res.json({
            success: true,
            data: {
                customer: customer,
                partnumbers: partNumbers.map(p => p.partnumber),
                bom_details: bomByCustomer,
                total_records: bomByCustomer.length
            },
            message: `BOM data untuk customer ${customer} berhasil diambil`
        });
        
    } catch (error) {
        console.error('BOM by Customer Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data BOM berdasarkan customer',
            error: error.message
        });
    }
});

// ✅ GET BOM DETAILS - untuk dropdown level 3 (customer + partnumber)
router.get('/bom-details/:customer/:partnumber', async (req, res) => {
    try {
        const { customer, partnumber } = req.params;
        
        if (!customer || !partnumber) {
            return res.status(400).json({
                success: false,
                message: 'Parameter customer dan partnumber harus diisi'
            });
        }
        
        // Ambil detail BOM berdasarkan customer dan partnumber
        const [bomDetails] = await execute(`
            SELECT 
                id, customer, partnumber, model, description, timestamp 
            FROM billofmaterial 
            WHERE customer = ? AND partnumber = ?
            ORDER BY model
        `, [customer, partnumber]);
        
        if (bomDetails.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data BOM tidak ditemukan untuk customer dan partnumber yang dipilih'
            });
        }
        
        res.json({
            success: true,
            data: {
                customer: customer,
                partnumber: partnumber,
                details: bomDetails,
                total_variants: bomDetails.length
            },
            message: `Detail BOM untuk ${customer} - ${partnumber} berhasil diambil`
        });
        
    } catch (error) {
        console.error('BOM Details Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail BOM',
            error: error.message
        });
    }
});

// ✅ SEARCH BOM - untuk pencarian BOM dengan keyword
router.get('/bom-search', async (req, res) => {
    try {
        const { keyword, customer, limit = 50 } = req.query;
        
        if (!keyword || keyword.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Keyword pencarian minimal 2 karakter'
            });
        }
        
        let query = `
            SELECT 
                id, customer, partnumber, model, description, timestamp 
            FROM billofmaterial 
            WHERE (
                partnumber LIKE ? OR 
                description LIKE ? OR 
                model LIKE ?
            )
        `;
        
        let params = [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`];
        
        // Filter by customer jika ada
        if (customer && customer !== '') {
            query += ` AND customer = ?`;
            params.push(customer);
        }
        
        query += ` ORDER BY customer, partnumber LIMIT ?`;
        params.push(parseInt(limit));
        
        const [searchResults] = await execute(query, params);
        
        res.json({
            success: true,
            data: {
                keyword: keyword,
                customer_filter: customer || 'all',
                results: searchResults,
                total_found: searchResults.length,
                limited_to: parseInt(limit)
            },
            message: `Pencarian BOM dengan keyword "${keyword}" berhasil`
        });
        
    } catch (error) {
        console.error('BOM Search Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal melakukan pencarian BOM',
            error: error.message
        });
    }
});

// ✅ BOM STATISTICS - untuk informasi statistik BOM
router.get('/bom-stats', async (req, res) => {
    try {
        // Total customers
        const [totalCustomers] = await execute(`
            SELECT COUNT(DISTINCT customer) as total_customers 
            FROM billofmaterial 
            WHERE customer IS NOT NULL AND customer != ''
        `);
        
        // Total partnumbers
        const [totalPartnumbers] = await execute(`
            SELECT COUNT(DISTINCT partnumber) as total_partnumbers 
            FROM billofmaterial 
            WHERE partnumber IS NOT NULL AND partnumber != ''
        `);
        
        // Total BOM records
        const [totalBom] = await execute(`
            SELECT COUNT(*) as total_bom 
            FROM billofmaterial
        `);
        
        // Customer dengan BOM terbanyak
        const [topCustomers] = await execute(`
            SELECT 
                customer, 
                COUNT(*) as bom_count 
            FROM billofmaterial 
            WHERE customer IS NOT NULL AND customer != ''
            GROUP BY customer 
            ORDER BY bom_count DESC 
            LIMIT 5
        `);
        
        // Partnumber terbanyak
        const [topPartnumbers] = await execute(`
            SELECT 
                partnumber, 
                COUNT(*) as variant_count 
            FROM billofmaterial 
            WHERE partnumber IS NOT NULL AND partnumber != ''
            GROUP BY partnumber 
            ORDER BY variant_count DESC 
            LIMIT 5
        `);
        
        res.json({
            success: true,
            data: {
                summary: {
                    total_customers: totalCustomers[0].total_customers,
                    total_partnumbers: totalPartnumbers[0].total_partnumbers,
                    total_bom_records: totalBom[0].total_bom
                },
                top_customers: topCustomers,
                top_partnumbers: topPartnumbers,
                generated_at: new Date().toISOString()
            },
            message: 'Statistik BOM berhasil diambil'
        });
        
    } catch (error) {
        console.error('BOM Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil statistik BOM',
            error: error.message
        });
    }
});

// ✅ MC OUTPUT - Input Output Mesin
router.post('/mcoutput', async (req, res) => {
    try {
        const {
            machine,
            customer,
            partnumber,
            model,
            description,
            quantity_ok,
            quantity_ng = 0,
            operator
        } = req.body;
        
        // Validasi field required
        if (!machine || !partnumber || !quantity_ok || !operator) {
            return res.status(400).json({
                success: false,
                message: 'Field machine, partnumber, quantity_ok, dan operator harus diisi',
                required: ['machine', 'partnumber', 'quantity_ok', 'operator']
            });
        }
        
        // Validasi quantity
        if (isNaN(quantity_ok) || quantity_ok <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity OK harus berupa angka positif'
            });
        }
        
        // Insert ke tabel outputmc (sesuai struktur tabel yang ada)
        const [result] = await execute(`
            INSERT INTO outputmc (
                customer, partnumber, model, description, 
                quantity, quantity_ng, machine, operator
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            customer, partnumber, model, description,
            parseInt(quantity_ok), parseInt(quantity_ng) || 0,
            machine, operator
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Output mesin berhasil dicatat',
            data: {
                id: result.insertId,
                machine,
                customer,
                partnumber,
                model,
                description,
                quantity_ok: parseInt(quantity_ok),
                quantity_ng: parseInt(quantity_ng) || 0,
                operator,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('MC Output Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mencatat output mesin',
            error: error.message
        });
    }
});

// ✅ MC STATUS - Input Status Mesin
router.post('/mcstatus', async (req, res) => {
    try {
        const {
            machine_name,
            status,
            operator,
            shift = '1',
            notes
        } = req.body;
        
        // Validasi field required
        if (!machine_name || !status || !operator) {
            return res.status(400).json({
                success: false,
                message: 'Field machine_name, status, dan operator harus diisi',
                required: ['machine_name', 'status', 'operator']
            });
        }
        
        // Validasi status
        const validStatus = ['running', 'maintenance', 'breakdown', 'setup', 'idle'];
        if (!validStatus.includes(status.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Status tidak valid',
                valid_status: validStatus
            });
        }
        
        // Insert ke tabel machine_status (mapping dari mcstatus)
        const [result] = await execute(`
            INSERT INTO machine_status (
                machine_name, status, operator, shift, notes, timestamp
            ) VALUES (?, ?, ?, ?, ?, NOW())
        `, [machine_name, status.toLowerCase(), operator, shift, notes]);
        
        res.status(201).json({
            success: true,
            message: 'Status mesin berhasil dicatat',
            data: {
                id: result.insertId,
                machine_name,
                status: status.toLowerCase(),
                operator,
                shift,
                notes,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('MC Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mencatat status mesin',
            error: error.message
        });
    }
});

// ✅ TRANSFER QC - Transfer ke Quality Control
router.post('/transfer-qc', async (req, res) => {
    try {
        const {
            partnumber,
            lotnumber,
            quantity,
            from_process,
            to_process = 'QC',
            operator,
            notes
        } = req.body;
        
        // Validasi field required
        if (!partnumber || !lotnumber || !quantity || !from_process || !operator) {
            return res.status(400).json({
                success: false,
                message: 'Field partnumber, lotnumber, quantity, from_process, dan operator harus diisi',
                required: ['partnumber', 'lotnumber', 'quantity', 'from_process', 'operator']
            });
        }
        
        // Validasi quantity
        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity harus berupa angka positif'
            });
        }
        
        // Insert ke tabel transferqc (mapping dari transfer_qc)
        const [result] = await execute(`
            INSERT INTO transferqc (
                partnumber, lotnumber, quantity, from_process, 
                to_process, operator, notes, transfer_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `, [partnumber, lotnumber, parseInt(quantity), from_process, to_process, operator, notes]);
        
        res.status(201).json({
            success: true,
            message: 'Transfer ke QC berhasil dicatat',
            data: {
                id: result.insertId,
                partnumber,
                lotnumber,
                quantity: parseInt(quantity),
                from_process,
                to_process,
                operator,
                notes,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Transfer QC Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mencatat transfer QC',
            error: error.message
        });
    }
});

// ✅ WIP SECOND - WIP Second Process
router.post('/wip-second', async (req, res) => {
    try {
        const {
            partnumber,
            lotnumber,
            quantity_input,
            quantity_output,
            process_type,
            operator,
            notes
        } = req.body;
        
        // Validasi field required
        if (!partnumber || !lotnumber || !quantity_input || !process_type || !operator) {
            return res.status(400).json({
                success: false,
                message: 'Field partnumber, lotnumber, quantity_input, process_type, dan operator harus diisi',
                required: ['partnumber', 'lotnumber', 'quantity_input', 'process_type', 'operator']
            });
        }
        
        // Validasi quantity
        if (isNaN(quantity_input) || quantity_input <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity input harus berupa angka positif'
            });
        }
        
        // Insert ke tabel wip_second_process
        const [result] = await execute(`
            INSERT INTO wip_second_process (
                partnumber, lotnumber, quantity_input, quantity_output,
                process_type, operator, notes, process_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            partnumber, lotnumber, parseInt(quantity_input), 
            parseInt(quantity_output) || parseInt(quantity_input),
            process_type, operator, notes
        ]);
        
        res.status(201).json({
            success: true,
            message: 'WIP Second Process berhasil dicatat',
            data: {
                id: result.insertId,
                partnumber,
                lotnumber,
                quantity_input: parseInt(quantity_input),
                quantity_output: parseInt(quantity_output) || parseInt(quantity_input),
                process_type,
                operator,
                notes,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('WIP Second Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mencatat WIP Second Process',
            error: error.message
        });
    }
});

// ========================================
// NEW POST ENDPOINTS FOR ANDROID PRODUCTION
// ========================================

// POST - Record Machine Status
router.post('/machine-status', async (req, res) => {
    try {
        const { 
            machine_name, 
            status, // 'RUNNING', 'STOPPED', 'MAINTENANCE', 'BREAKDOWN'
            operator,
            shift,
            remarks,
            temperature,
            pressure,
            rpm
        } = req.body;
        
        // Validate required fields
        if (!machine_name || !status || !operator) {
            return res.status(400).json({
                success: false,
                message: 'Machine_name, status, dan operator harus diisi'
            });
        }
        
        // Insert machine status record
        const [result] = await execute(`
            INSERT INTO machine_status (
                machine_name, status, operator, shift, remarks,
                temperature, pressure, rpm, timestamp, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [machine_name, status, operator, shift, remarks, temperature, pressure, rpm]);
        
        res.status(201).json({
            success: true,
            data: {
                id: result.insertId,
                machine_name,
                status,
                operator,
                shift,
                timestamp: new Date().toISOString()
            },
            message: 'Machine status berhasil dicatat'
        });
        
    } catch (error) {
        console.error('Machine Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mencatat machine status',
            error: error.message
        });
    }
});

// POST - Record Production Output
router.post('/production-output', async (req, res) => {
    try {
        const { 
            bom_id,
            machine_name,
            quantity_produced,
            quantity_good,
            quantity_ng,
            operator,
            shift,
            start_time,
            end_time,
            remarks
        } = req.body;
        
        // Validate required fields
        if (!bom_id || !machine_name || !quantity_produced || !operator) {
            return res.status(400).json({
                success: false,
                message: 'BOM_id, machine_name, quantity_produced, dan operator harus diisi'
            });
        }
        
        // Check if BOM exists
        const [bomCheck] = await execute(`
            SELECT partnumber, customer FROM billofmaterial WHERE id = ?
        `, [bom_id]);
        
        if (bomCheck.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'BOM tidak ditemukan'
            });
        }
        
        // Calculate good and NG if not provided
        const finalQuantityGood = quantity_good !== undefined ? quantity_good : quantity_produced;
        const finalQuantityNG = quantity_ng !== undefined ? quantity_ng : 0;
        
        // Insert production output record
        const [result] = await execute(`
            INSERT INTO production_outputs (
                bom_id, partnumber, machine_name, quantity_produced,
                quantity_good, quantity_ng, operator, shift,
                start_time, end_time, remarks, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            bom_id, bomCheck[0].partnumber, machine_name, quantity_produced,
            finalQuantityGood, finalQuantityNG, operator, shift,
            start_time, end_time, remarks
        ]);
        
        res.status(201).json({
            success: true,
            data: {
                output_id: result.insertId,
                bom_id,
                partnumber: bomCheck[0].partnumber,
                customer: bomCheck[0].customer,
                machine_name,
                quantity_produced,
                quantity_good: finalQuantityGood,
                quantity_ng: finalQuantityNG,
                operator,
                shift,
                efficiency: ((finalQuantityGood / quantity_produced) * 100).toFixed(2) + '%'
            },
            message: 'Production output berhasil dicatat'
        });
        
    } catch (error) {
        console.error('Production Output Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mencatat production output',
            error: error.message
        });
    }
});

// POST - Start Production Batch
router.post('/start-batch', async (req, res) => {
    try {
        const { 
            bom_id,
            batch_number,
            planned_quantity,
            machine_name,
            operator,
            shift,
            target_completion,
            remarks
        } = req.body;
        
        // Validate required fields
        if (!bom_id || !batch_number || !planned_quantity || !machine_name || !operator) {
            return res.status(400).json({
                success: false,
                message: 'BOM_id, batch_number, planned_quantity, machine_name, dan operator harus diisi'
            });
        }
        
        // Check if batch number already exists
        const [existingBatch] = await execute(`
            SELECT id FROM production_batches WHERE batch_number = ?
        `, [batch_number]);
        
        if (existingBatch.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Batch number sudah ada'
            });
        }
        
        // Get BOM details
        const [bomDetails] = await execute(`
            SELECT partnumber, customer, model, description FROM billofmaterial WHERE id = ?
        `, [bom_id]);
        
        if (bomDetails.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'BOM tidak ditemukan'
            });
        }
        
        // Insert production batch
        const [result] = await execute(`
            INSERT INTO production_batches (
                bom_id, partnumber, batch_number, planned_quantity,
                machine_name, operator, shift, status, start_time,
                target_completion, remarks, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'STARTED', NOW(), ?, ?, NOW())
        `, [
            bom_id, bomDetails[0].partnumber, batch_number, planned_quantity,
            machine_name, operator, shift, target_completion, remarks
        ]);
        
        res.status(201).json({
            success: true,
            data: {
                batch_id: result.insertId,
                bom_id,
                partnumber: bomDetails[0].partnumber,
                customer: bomDetails[0].customer,
                batch_number,
                planned_quantity,
                machine_name,
                operator,
                shift,
                status: 'STARTED',
                start_time: new Date().toISOString()
            },
            message: 'Production batch berhasil dimulai'
        });
        
    } catch (error) {
        console.error('Start Batch Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memulai production batch',
            error: error.message
        });
    }
});

module.exports = router;
