/**
 * Android Authentication API
 * PT. Topline Evergreen Manufacturing
 * Auth: Login, User management
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { execute } = require('../../../config/databaseAdapter');

// Helper function to determine department from role and username
function getDepartmentFromRole(role, username = '') {
    if (role === 'admin') return 'ADMIN';
    
    // Derive department from username - exact mapping
    if (username === 'qc01' || username === 'qc_inspector01') return 'QC';
    if (username === 'wh01' || username === 'wh_operator01') return 'WAREHOUSE';
    if (username === 'production01' || username === 'operator01' || username === 'operator02') return 'PRODUCTION';
    
    // Default to PRODUCTION
    return 'PRODUCTION';
}

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

// ✅ LOGIN - Android App Authentication
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username dan password harus diisi'
            });
        }
        
        // Cek user di tabel userandroid
        const [users] = await execute(`
            SELECT id, username, password, role, last_login, created_at
            FROM userandroid 
            WHERE username = ?
        `, [username]);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Username tidak ditemukan'
            });
        }

        const user = users[0];

        // Verify password using bcrypt
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Password salah'
            });
        }
        
        // Generate simple token for Android session
        const token = `android-token-${user.id}-${Date.now()}`;
        
        // Update last_login
        await execute('UPDATE userandroid SET last_login = NOW() WHERE id = ?', [user.id]);
        
        res.json({
            success: true,
            message: 'Login berhasil',
            data: {
                user_id: user.id,
                username: user.username,
                full_name: user.username, // Gunakan username sebagai display name
                department: getDepartmentFromRole(user.role, user.username), // Derive department dari role
                role: user.role,
                token: token,
                login_time: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal melakukan login',
            error: error.message
        });
    }
});

// ✅ STATUS - Auth Status Check
router.get('/status', async (req, res) => {
    try {
        // Count active users untuk status check
        const [userCount] = await execute(`
            SELECT COUNT(*) as total_users,
                   COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as users_with_login
            FROM userandroid
        `);
        
        res.json({
            success: true,
            status: 'Android Authentication is running',
            database: 'Connected',
            user_stats: userCount[0],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Authentication status check failed',
            error: error.message
        });
    }
});

// ✅ GET USER INFO - Get user information by username
router.get('/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        const [users] = await execute(`
            SELECT id, username, role, last_login, created_at
            FROM userandroid 
            WHERE username = ?
        `, [username]);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        const user = users[0];
        
        res.json({
            success: true,
            message: 'User information retrieved successfully',
            data: {
                user_id: user.id,
                username: user.username,
                full_name: user.username, // Gunakan username sebagai display name
                department: getDepartmentFromRole(user.role, user.username), // Derive department dari role
                role: user.role,
                last_login: user.last_login,
                created_at: user.created_at
            }
        });
        
    } catch (error) {
        console.error('Get User Info Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil informasi user',
            error: error.message
        });
    }
});

// ✅ LIST USERS - Get all users (untuk admin)
router.get('/users', async (req, res) => {
    try {
        // Get all users - show clean data without passwords
        const [users] = await execute(`
            SELECT id, username, role, last_login, created_at
            FROM userandroid 
            ORDER BY id DESC
        `);
        
        res.json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users: users,
                total_count: users.length
            }
        });
        
    } catch (error) {
        console.error('List Users Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil daftar users',
            error: error.message
        });
    }
});

// ✅ UPDATE PASSWORD - Change user password
router.post('/change-password', async (req, res) => {
    try {
        const { username, old_password, new_password } = req.body;
        
        if (!username || !old_password || !new_password) {
            return res.status(400).json({
                success: false,
                message: 'Username, password lama, dan password baru harus diisi'
            });
        }
        
        if (new_password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password baru harus minimal 6 karakter'
            });
        }
        
        // Get user data
        const [users] = await execute(`
            SELECT id, password FROM userandroid 
            WHERE username = ?
        `, [username]);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        const user = users[0];
        
        // Verify old password using bcrypt
        const isValidOldPassword = await bcrypt.compare(old_password, user.password);
        
        if (!isValidOldPassword) {
            return res.status(401).json({
                success: false,
                message: 'Password lama salah'
            });
        }
        
        // Hash new password
        const hashedNewPassword = await bcrypt.hash(new_password, 10);
        
        // Update password
        await execute(`
            UPDATE userandroid 
            SET password = ? 
            WHERE id = ?
        `, [hashedNewPassword, user.id]);
        
        res.json({
            success: true,
            message: 'Password berhasil diubah'
        });
        
    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengubah password',
            error: error.message
        });
    }
});

module.exports = router;