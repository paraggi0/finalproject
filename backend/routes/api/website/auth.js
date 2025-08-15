/**
 * Website Authentication API
 * PT. Topline Evergreen Manufacturing
 * Web Auth: Login, Session management
 */

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { execute } = require('../../../config/databaseAdapter');

// ✅ WEB LOGIN - Website Authentication
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username dan password harus diisi'
            });
        }
        
        // Check user in database
        const [users] = await execute(`
            SELECT id, username, password, role, last_login 
            FROM userandroid 
            WHERE username = ?
        `, [username]);
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }
        
        const user = users[0];
        
        // Verify password with bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }
        
        // Generate web session token
        const sessionToken = `web-session-${user.id}-${Date.now()}`;
        
        // Update last_login
        await execute('UPDATE userandroid SET last_login = NOW() WHERE id = ?', [user.id]);
        
        res.json({
            success: true,
            message: 'Login berhasil',
            data: {
                user_id: user.id,
                username: user.username,
                role: user.role,
                session_token: sessionToken,
                login_time: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Web Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal melakukan login',
            error: error.message
        });
    }
});

// ✅ LOGOUT - Website Logout
router.post('/logout', async (req, res) => {
    try {
        // For web, we just return success (session handling on frontend)
        res.json({
            success: true,
            message: 'Logout berhasil'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal logout',
            error: error.message
        });
    }
});

module.exports = router;
