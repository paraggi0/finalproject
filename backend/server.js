const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initializeDatabase } = require('./config/databaseAdapter');

// Import organized API routes only

/**
 * PT. Topline Evergreen Manufacturing Production System
 * Backend API Server
 */

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        status: 'error'
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use(limiter);

// CORS configuration for frontend integration
app.use(cors({
    origin: [
        'http://localhost:8080',      // Frontend server
        'http://127.0.0.1:8080',     // Alternative localhost
        'http://localhost:3000',      // Development frontend
        'http://127.0.0.1:3000',     // Alternative dev frontend
        'http://192.168.1.184:3000', // Static IP frontend
        'http://192.168.1.184:8080', // Static IP alternative
        'http://192.168.1.59:3000',  // DHCP IP frontend (fallback)
        'http://192.168.1.59:8080',  // DHCP IP alternative (fallback)
        process.env.CORS_ORIGIN || '*'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'X-Requested-With'],
    credentials: true
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for frontend
app.use(express.static(path.join(__dirname, '../frontend'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
    }
}));

// API routes - ORGANIZED STRUCTURE ONLY
// ========================================

// ANDROID API - Complete mobile functionality
const androidApiRoutes = require('./routes/api/android');
app.use('/api/android', androidApiRoutes);

// WEBSITE API - Complete dashboard & admin functionality  
const websiteApiRoutes = require('./routes/api/website');
app.use('/api/website', websiteApiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'PT. Topline Evergreen Manufacturing API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Database connection test endpoint
app.get('/api/db-test', async (req, res) => {
    try {
        const { execute } = require('./config/databaseAdapter');
        const [result] = await execute('SELECT 1 as test');
        const isConnected = result && result.length > 0;
        res.json({
            status: isConnected ? 'success' : 'error',
            message: isConnected ? 'Database connection successful' : 'Database connection failed',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Database test failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to PT. Topline Evergreen Manufacturing Production API',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: {
            health: '/api/health',
            database_test: '/api/db-test',
            production: '/api/v1/production',
            statistics: '/api/v1/stats'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Check if response was already sent
    if (res.headersSent) {
        return next(err);
    }
    
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Start server
async function startServer() {
    try {
        // Test database connection
        console.log('🔄 Testing database connection...');
        const dbPool = await initializeDatabase();
        
        if (!dbPool) {
            console.error('❌ Failed to connect to database. Please check your database configuration.');
            process.exit(1);
        }

        console.log('✅ Database connection successful!');

        // Start server
        app.listen(PORT, '0.0.0.0', () => {
            console.log('🚀 Server started successfully!');
            console.log(`📡 Server running on: http://localhost:${PORT}`);
            console.log(`🌐 Network access: http://192.168.1.184:${PORT} (Public Static IP)`);
            console.log(`📱 Android access: http://192.168.1.184:${PORT} (Direct IP)`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📊 API Version: ${process.env.API_VERSION || 'v1'}`);
            console.log('');
            console.log('📋 Available endpoints:');
            console.log(`   Health Check: http://192.168.1.184:${PORT}/api/health`);
            console.log(`   Database Test: http://192.168.1.184:${PORT}/api/db-test`);
            console.log(`   Android API: http://192.168.1.184:${PORT}/api/android`);
            console.log(`   Website API: http://192.168.1.184:${PORT}/api/website`);
            console.log('');
            console.log('✅ PT. Topline Evergreen Manufacturing API ready for Android & Website!');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Initialize server
startServer();
