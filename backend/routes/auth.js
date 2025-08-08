const express = require('express');
const bcrypt = require('bcrypt');
const { execute } = require('../config/databaseAdapter');

const router = express.Router();

/**
 * POST /auth/login/web
 * Authenticate user for website (only 3 users allowed)
 */
router.post('/login/web', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username dan password harus diisi'
            });
        }

        // Query user from database - ONLY WEB USERS
        const query = `
            SELECT 
                id,
                username,
                email,
                password_hash,
                full_name,
                department,
                role,
                is_active
            FROM users 
            WHERE username = ? AND is_active = 1 AND id LIKE 'WEB%'
        `;

        const [rows] = await pool.execute(query, [username.toLowerCase()]);

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Username tidak ditemukan atau bukan user website'
            });
        }

        const user = rows[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Password salah'
            });
        }

        // Update last login
        await pool.execute(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        // Return success with user data (exclude password_hash)
        const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            department: user.department,
            role: user.role,
            loginTime: new Date().toISOString(),
            platform: 'web'
        };

        res.json({
            success: true,
            user: userData,
            message: 'Login website berhasil'
        });

    } catch (error) {
        console.error('Web login error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan sistem'
        });
    }
});

/**
 * POST /auth/login/mobile
 * Authenticate user for mobile Android (shift-based users)
 */
router.post('/login/mobile', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username dan password harus diisi'
            });
        }

        // Query user from database - ONLY MOBILE USERS
        const query = `
            SELECT 
                id,
                username,
                email,
                password_hash,
                full_name,
                department,
                role,
                is_active
            FROM users 
            WHERE username = ? AND is_active = 1 AND id LIKE 'MOB%'
        `;

        const [rows] = await pool.execute(query, [username.toLowerCase()]);

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Username tidak ditemukan atau bukan user mobile'
            });
        }

        const user = rows[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Password salah'
            });
        }

        // Update last login
        await pool.execute(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        // Return success with user data (exclude password_hash)
        const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            department: user.department,
            role: user.role,
            loginTime: new Date().toISOString(),
            platform: 'mobile'
        };

        res.json({
            success: true,
            user: userData,
            message: 'Login mobile berhasil'
        });

    } catch (error) {
        console.error('Mobile login error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan sistem'
        });
    }
});

/**
 * GET /auth/users/web
 * Get list of web users only
 */
router.get('/users/web', async (req, res) => {
    try {
        const query = `
            SELECT 
                id,
                username,
                email,
                full_name,
                department,
                role,
                is_active,
                last_login,
                created_at
            FROM users 
            WHERE is_active = 1 AND id LIKE 'WEB%'
            ORDER BY department, full_name
        `;

        const [rows] = await pool.execute(query);

        res.json({
            success: true,
            users: rows,
            count: rows.length,
            platform: 'web'
        });

    } catch (error) {
        console.error('Get web users error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan sistem'
        });
    }
});

/**
 * GET /auth/users/mobile
 * Get list of mobile users only
 */
router.get('/users/mobile', async (req, res) => {
    try {
        const query = `
            SELECT 
                id,
                username,
                email,
                full_name,
                department,
                role,
                is_active,
                last_login,
                created_at
            FROM users 
            WHERE is_active = 1 AND id LIKE 'MOB%'
            ORDER BY department, username
        `;

        const [rows] = await pool.execute(query);

        res.json({
            success: true,
            users: rows,
            count: rows.length,
            platform: 'mobile'
        });

    } catch (error) {
        console.error('Get mobile users error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan sistem'
        });
    }
});

/**
 * GET /auth/users/all
 * Get all users with platform info
 */
router.get('/users/all', async (req, res) => {
    try {
        const query = `
            SELECT 
                id,
                username,
                email,
                full_name,
                department,
                role,
                is_active,
                last_login,
                created_at,
                CASE 
                    WHEN id LIKE 'WEB%' THEN 'web'
                    WHEN id LIKE 'MOB%' THEN 'mobile'
                    ELSE 'unknown'
                END as platform
            FROM users 
            WHERE is_active = 1
            ORDER BY platform, department, username
        `;

        const [rows] = await pool.execute(query);

        res.json({
            success: true,
            users: rows,
            count: rows.length
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan sistem'
        });
    }
});

module.exports = router;
