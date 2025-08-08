/**
 * User Management Routes - Web and Android Users
 * PT. Topline Evergreen Manufacturing
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { execute } = require('../config/databaseAdapter');

// =============================================================================
// WEB USER MANAGEMENT
// =============================================================================

// GET all web users
router.get('/web', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20,
            role,
            department,
            is_active = true
        } = req.query;
        
        let whereConditions = [];
        let queryParams = [];
        
        if (role) {
            whereConditions.push('role = ?');
            queryParams.push(role);
        }
        
        if (department) {
            whereConditions.push('department = ?');
            queryParams.push(department);
        }
        
        if (is_active !== undefined) {
            whereConditions.push('is_active = ?');
            queryParams.push(is_active === 'true');
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        const offset = (page - 1) * limit;
        
        const [users] = await execute(`
            SELECT 
                id, username, email, role, department, full_name, phone,
                is_active, last_login, login_attempts, created_at, updated_at
            FROM userweb 
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, parseInt(limit), parseInt(offset)]);
        
        const [countResult] = await execute(`
            SELECT COUNT(*) as total FROM userweb ${whereClause}
        `, queryParams);
        
        const totalRecords = countResult[0].total;
        const totalPages = Math.ceil(totalRecords / limit);
        
        res.json({
            success: true,
            data: {
                users: users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_records: totalRecords,
                    total_pages: totalPages,
                    has_next: page < totalPages,
                    has_prev: page > 1
                }
            }
        });
        
    } catch (error) {
        console.error('Get web users error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST create new web user
router.post('/web', async (req, res) => {
    try {
        const {
            username,
            password,
            email,
            role,
            department,
            full_name,
            phone,
            created_by
        } = req.body;
        
        if (!username || !password || !email || !role || !department) {
            return res.status(400).json({
                success: false,
                message: 'Username, password, email, role, and department are required'
            });
        }
        
        // Check if username or email already exists
        const [existing] = await execute(`
            SELECT id FROM userweb WHERE username = ? OR email = ?
        `, [username, email]);
        
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Username or email already exists'
            });
        }
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const [result] = await execute(`
            INSERT INTO userweb (
                username, password, email, role, department, 
                full_name, phone, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [username, hashedPassword, email, role, department, full_name, phone, created_by]);
        
        res.status(201).json({
            success: true,
            message: 'Web user created successfully',
            data: {
                id: result.insertId,
                username: username,
                email: email,
                role: role,
                department: department
            }
        });
        
    } catch (error) {
        console.error('Create web user error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// PUT update web user
router.put('/web/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            email,
            role,
            department,
            full_name,
            phone,
            is_active
        } = req.body;
        
        const [user] = await execute('SELECT id FROM userweb WHERE id = ?', [id]);
        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const updateFields = [];
        const updateValues = [];
        
        if (email !== undefined) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        if (role !== undefined) {
            updateFields.push('role = ?');
            updateValues.push(role);
        }
        if (department !== undefined) {
            updateFields.push('department = ?');
            updateValues.push(department);
        }
        if (full_name !== undefined) {
            updateFields.push('full_name = ?');
            updateValues.push(full_name);
        }
        if (phone !== undefined) {
            updateFields.push('phone = ?');
            updateValues.push(phone);
        }
        if (is_active !== undefined) {
            updateFields.push('is_active = ?');
            updateValues.push(is_active);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }
        
        updateValues.push(id);
        
        await execute(`
            UPDATE userweb 
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `, updateValues);
        
        res.json({
            success: true,
            message: 'Web user updated successfully'
        });
        
    } catch (error) {
        console.error('Update web user error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =============================================================================
// ANDROID USER MANAGEMENT
// =============================================================================

// GET all android users
router.get('/android', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20,
            role,
            department,
            is_active = true
        } = req.query;
        
        let whereConditions = [];
        let queryParams = [];
        
        if (role) {
            whereConditions.push('role = ?');
            queryParams.push(role);
        }
        
        if (department) {
            whereConditions.push('department = ?');
            queryParams.push(department);
        }
        
        if (is_active !== undefined) {
            whereConditions.push('is_active = ?');
            queryParams.push(is_active === 'true');
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        const offset = (page - 1) * limit;
        
        const [users] = await execute(`
            SELECT 
                id, username, role, department, full_name, employee_id,
                shift, is_active, last_login, device_id, app_version, created_at, updated_at
            FROM userandroid 
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, parseInt(limit), parseInt(offset)]);
        
        const [countResult] = await execute(`
            SELECT COUNT(*) as total FROM userandroid ${whereClause}
        `, queryParams);
        
        const totalRecords = countResult[0].total;
        const totalPages = Math.ceil(totalRecords / limit);
        
        res.json({
            success: true,
            data: {
                users: users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_records: totalRecords,
                    total_pages: totalPages,
                    has_next: page < totalPages,
                    has_prev: page > 1
                }
            }
        });
        
    } catch (error) {
        console.error('Get android users error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST create new android user
router.post('/android', async (req, res) => {
    try {
        const {
            username,
            password,
            role,
            department,
            full_name,
            employee_id,
            shift,
            created_by
        } = req.body;
        
        if (!username || !password || !role || !department) {
            return res.status(400).json({
                success: false,
                message: 'Username, password, role, and department are required'
            });
        }
        
        // Check if username already exists
        const [existing] = await execute(`
            SELECT id FROM userandroid WHERE username = ?
        `, [username]);
        
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const [result] = await execute(`
            INSERT INTO userandroid (
                username, password, role, department, 
                full_name, employee_id, shift, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [username, hashedPassword, role, department, full_name, employee_id, shift, created_by]);
        
        res.status(201).json({
            success: true,
            message: 'Android user created successfully',
            data: {
                id: result.insertId,
                username: username,
                role: role,
                department: department,
                employee_id: employee_id
            }
        });
        
    } catch (error) {
        console.error('Create android user error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// PUT update android user
router.put('/android/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            role,
            department,
            full_name,
            employee_id,
            shift,
            is_active
        } = req.body;
        
        const [user] = await execute('SELECT id FROM userandroid WHERE id = ?', [id]);
        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const updateFields = [];
        const updateValues = [];
        
        if (role !== undefined) {
            updateFields.push('role = ?');
            updateValues.push(role);
        }
        if (department !== undefined) {
            updateFields.push('department = ?');
            updateValues.push(department);
        }
        if (full_name !== undefined) {
            updateFields.push('full_name = ?');
            updateValues.push(full_name);
        }
        if (employee_id !== undefined) {
            updateFields.push('employee_id = ?');
            updateValues.push(employee_id);
        }
        if (shift !== undefined) {
            updateFields.push('shift = ?');
            updateValues.push(shift);
        }
        if (is_active !== undefined) {
            updateFields.push('is_active = ?');
            updateValues.push(is_active);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }
        
        updateValues.push(id);
        
        await execute(`
            UPDATE userandroid 
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `, updateValues);
        
        res.json({
            success: true,
            message: 'Android user updated successfully'
        });
        
    } catch (error) {
        console.error('Update android user error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =============================================================================
// USER AUTHENTICATION
// =============================================================================

// POST web user login
router.post('/web/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }
        
        const [users] = await execute(`
            SELECT id, username, password, email, role, department, full_name, 
                   is_active, login_attempts, locked_until
            FROM userweb 
            WHERE username = ? OR email = ?
        `, [username, username]);
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        const user = users[0];
        
        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is disabled'
            });
        }
        
        if (user.locked_until && new Date() < new Date(user.locked_until)) {
            return res.status(401).json({
                success: false,
                message: 'Account is temporarily locked'
            });
        }
        
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            // Increment login attempts
            await execute(`
                UPDATE userweb 
                SET login_attempts = login_attempts + 1,
                    locked_until = CASE 
                        WHEN login_attempts >= 4 THEN DATE_ADD(NOW(), INTERVAL 30 MINUTE)
                        ELSE NULL 
                    END
                WHERE id = ?
            `, [user.id]);
            
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Successful login - reset attempts and update last login
        await execute(`
            UPDATE userweb 
            SET login_attempts = 0, locked_until = NULL, last_login = NOW()
            WHERE id = ?
        `, [user.id]);
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                department: user.department,
                full_name: user.full_name
            }
        });
        
    } catch (error) {
        console.error('Web login error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST android user login
router.post('/android/login', async (req, res) => {
    try {
        const { username, password, device_id, app_version } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }
        
        const [users] = await execute(`
            SELECT id, username, password, role, department, full_name, 
                   employee_id, shift, is_active
            FROM userandroid 
            WHERE username = ?
        `, [username]);
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        const user = users[0];
        
        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is disabled'
            });
        }
        
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Update last login and device info
        await execute(`
            UPDATE userandroid 
            SET last_login = NOW(), device_id = ?, app_version = ?
            WHERE id = ?
        `, [device_id, app_version, user.id]);
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                id: user.id,
                username: user.username,
                role: user.role,
                department: user.department,
                full_name: user.full_name,
                employee_id: user.employee_id,
                shift: user.shift
            }
        });
        
    } catch (error) {
        console.error('Android login error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
