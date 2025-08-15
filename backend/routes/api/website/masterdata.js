/**
 * Website Master Data API
 * PT. Topline Evergreen Manufacturing
 * CRUD Operations for Master Data
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
// BILL OF MATERIAL (BOM) CRUD
// ========================================

// GET - List all BOM with pagination and filters
router.get('/bom', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            customer, 
            partnumber, 
            model,
            search 
        } = req.query;
        
        const offset = (page - 1) * limit;
        
        let whereConditions = [];
        let params = [];
        
        if (customer) {
            whereConditions.push('customer LIKE ?');
            params.push(`%${customer}%`);
        }
        
        if (partnumber) {
            whereConditions.push('partnumber LIKE ?');
            params.push(`%${partnumber}%`);
        }
        
        if (model) {
            whereConditions.push('model LIKE ?');
            params.push(`%${model}%`);
        }
        
        if (search) {
            whereConditions.push('(customer LIKE ? OR partnumber LIKE ? OR model LIKE ? OR description LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        // Get total count
        const [countResult] = await execute(`
            SELECT COUNT(*) as total FROM billofmaterial ${whereClause}
        `, params);
        
        // Get paginated data
        const [bomData] = await execute(`
            SELECT * FROM billofmaterial 
            ${whereClause}
            ORDER BY timestamp DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), parseInt(offset)]);
        
        res.json({
            success: true,
            data: {
                bom_records: bomData,
                pagination: {
                    total: countResult[0].total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_pages: Math.ceil(countResult[0].total / limit)
                }
            },
            message: 'BOM data berhasil diambil'
        });
        
    } catch (error) {
        console.error('Get BOM Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data BOM',
            error: error.message
        });
    }
});

// GET - Single BOM by ID
router.get('/bom/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [bomData] = await execute(`
            SELECT * FROM billofmaterial WHERE id = ?
        `, [id]);
        
        if (bomData.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'BOM tidak ditemukan'
            });
        }
        
        res.json({
            success: true,
            data: bomData[0],
            message: 'BOM data berhasil diambil'
        });
        
    } catch (error) {
        console.error('Get Single BOM Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data BOM',
            error: error.message
        });
    }
});

// POST - Create new BOM
router.post('/bom', async (req, res) => {
    try {
        const { customer, partnumber, model, description } = req.body;
        
        // Validate required fields
        if (!customer || !partnumber || !model || !description) {
            return res.status(400).json({
                success: false,
                message: 'Customer, partnumber, model, dan description harus diisi'
            });
        }
        
        // Check if partnumber already exists
        const [existing] = await execute(`
            SELECT id FROM billofmaterial WHERE partnumber = ?
        `, [partnumber]);
        
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Part number sudah ada dalam database'
            });
        }
        
        // Insert new BOM
        const [result] = await execute(`
            INSERT INTO billofmaterial (customer, partnumber, model, description, timestamp)
            VALUES (?, ?, ?, ?, NOW())
        `, [customer, partnumber, model, description]);
        
        res.status(201).json({
            success: true,
            data: {
                id: result.insertId,
                customer,
                partnumber,
                model,
                description
            },
            message: 'BOM berhasil ditambahkan'
        });
        
    } catch (error) {
        console.error('Create BOM Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan BOM',
            error: error.message
        });
    }
});

// PUT - Update existing BOM
router.put('/bom/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { customer, partnumber, model, description } = req.body;
        
        // Check if BOM exists
        const [existing] = await execute(`
            SELECT id FROM billofmaterial WHERE id = ?
        `, [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'BOM tidak ditemukan'
            });
        }
        
        // Check if new partnumber conflicts with other records
        if (partnumber) {
            const [conflict] = await execute(`
                SELECT id FROM billofmaterial WHERE partnumber = ? AND id != ?
            `, [partnumber, id]);
            
            if (conflict.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Part number sudah digunakan oleh BOM lain'
                });
            }
        }
        
        // Update BOM
        const updateFields = [];
        const updateParams = [];
        
        if (customer) {
            updateFields.push('customer = ?');
            updateParams.push(customer);
        }
        if (partnumber) {
            updateFields.push('partnumber = ?');
            updateParams.push(partnumber);
        }
        if (model) {
            updateFields.push('model = ?');
            updateParams.push(model);
        }
        if (description) {
            updateFields.push('description = ?');
            updateParams.push(description);
        }
        
        updateFields.push('timestamp = NOW()');
        updateParams.push(id);
        
        await execute(`
            UPDATE billofmaterial 
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `, updateParams);
        
        // Get updated data
        const [updatedData] = await execute(`
            SELECT * FROM billofmaterial WHERE id = ?
        `, [id]);
        
        res.json({
            success: true,
            data: updatedData[0],
            message: 'BOM berhasil diupdate'
        });
        
    } catch (error) {
        console.error('Update BOM Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate BOM',
            error: error.message
        });
    }
});

// DELETE - Delete BOM
router.delete('/bom/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if BOM exists
        const [existing] = await execute(`
            SELECT * FROM billofmaterial WHERE id = ?
        `, [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'BOM tidak ditemukan'
            });
        }
        
        // Check if BOM is used in production
        const [usageCheck] = await execute(`
            SELECT COUNT(*) as count FROM outputmc WHERE bom_id = ?
        `, [id]);
        
        if (usageCheck[0].count > 0) {
            return res.status(409).json({
                success: false,
                message: 'BOM tidak dapat dihapus karena sudah digunakan dalam produksi'
            });
        }
        
        // Delete BOM
        await execute(`
            DELETE FROM billofmaterial WHERE id = ?
        `, [id]);
        
        res.json({
            success: true,
            data: existing[0],
            message: 'BOM berhasil dihapus'
        });
        
    } catch (error) {
        console.error('Delete BOM Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus BOM',
            error: error.message
        });
    }
});

// ========================================
// USER MANAGEMENT CRUD
// ========================================

// GET - List all users
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, role, search } = req.query;
        const offset = (page - 1) * limit;
        
        let whereConditions = [];
        let params = [];
        
        if (role) {
            whereConditions.push('role = ?');
            params.push(role);
        }
        
        if (search) {
            whereConditions.push('(username LIKE ? OR full_name LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        // Get total count
        const [countResult] = await execute(`
            SELECT COUNT(*) as total FROM userandroid ${whereClause}
        `, params);
        
        // Get paginated data (excluding password)
        const [userData] = await execute(`
            SELECT id, username, full_name, role, department, last_login, created_at 
            FROM userandroid 
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), parseInt(offset)]);
        
        res.json({
            success: true,
            data: {
                users: userData,
                pagination: {
                    total: countResult[0].total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_pages: Math.ceil(countResult[0].total / limit)
                }
            },
            message: 'User data berhasil diambil'
        });
        
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data user',
            error: error.message
        });
    }
});

// POST - Create new user
router.post('/users', async (req, res) => {
    try {
        const { username, password, full_name, role, department } = req.body;
        
        // Validate required fields
        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Username, password, dan role harus diisi'
            });
        }
        
        // Check if username already exists
        const [existing] = await execute(`
            SELECT id FROM userandroid WHERE username = ?
        `, [username]);
        
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Username sudah ada'
            });
        }
        
        // Hash password (in production, use bcrypt)
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert new user
        const [result] = await execute(`
            INSERT INTO userandroid (username, password, full_name, role, department, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        `, [username, hashedPassword, full_name || username, role, department || 'GENERAL']);
        
        res.status(201).json({
            success: true,
            data: {
                id: result.insertId,
                username,
                full_name: full_name || username,
                role,
                department: department || 'GENERAL'
            },
            message: 'User berhasil ditambahkan'
        });
        
    } catch (error) {
        console.error('Create User Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan user',
            error: error.message
        });
    }
});

// PUT - Update user
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, full_name, role, department } = req.body;
        
        // Check if user exists
        const [existing] = await execute(`
            SELECT id FROM userandroid WHERE id = ?
        `, [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }
        
        // Check username conflict
        if (username) {
            const [conflict] = await execute(`
                SELECT id FROM userandroid WHERE username = ? AND id != ?
            `, [username, id]);
            
            if (conflict.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Username sudah digunakan'
                });
            }
        }
        
        // Build update query
        const updateFields = [];
        const updateParams = [];
        
        if (username) {
            updateFields.push('username = ?');
            updateParams.push(username);
        }
        if (password) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push('password = ?');
            updateParams.push(hashedPassword);
        }
        if (full_name) {
            updateFields.push('full_name = ?');
            updateParams.push(full_name);
        }
        if (role) {
            updateFields.push('role = ?');
            updateParams.push(role);
        }
        if (department) {
            updateFields.push('department = ?');
            updateParams.push(department);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Tidak ada data yang diupdate'
            });
        }
        
        updateParams.push(id);
        
        await execute(`
            UPDATE userandroid 
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `, updateParams);
        
        // Get updated data
        const [updatedData] = await execute(`
            SELECT id, username, full_name, role, department, last_login, created_at 
            FROM userandroid WHERE id = ?
        `, [id]);
        
        res.json({
            success: true,
            data: updatedData[0],
            message: 'User berhasil diupdate'
        });
        
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate user',
            error: error.message
        });
    }
});

// DELETE - Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if user exists
        const [existing] = await execute(`
            SELECT * FROM userandroid WHERE id = ?
        `, [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }
        
        // Prevent deletion of admin user
        if (existing[0].role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'User admin tidak dapat dihapus'
            });
        }
        
        // Delete user
        await execute(`
            DELETE FROM userandroid WHERE id = ?
        `, [id]);
        
        res.json({
            success: true,
            data: {
                id: existing[0].id,
                username: existing[0].username,
                role: existing[0].role
            },
            message: 'User berhasil dihapus'
        });
        
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus user',
            error: error.message
        });
    }
});

module.exports = router;
